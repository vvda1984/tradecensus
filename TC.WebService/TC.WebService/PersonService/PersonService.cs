using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using TradeCensus.Data;
using TradeCensus.Shared;

namespace TradeCensus
{
    public class PersonService : TradeCensusServiceBase, IPersonService
    {        
        public PersonService() : base("Person")
        {
        }
    
        private PersonModel GetPerson(string userName, string password)
        {
            Log("Request login: {0}", userName);
            password = HashPassword(password);

            var user = DC.PersonRoles.FirstOrDefault(i => string.Compare(i.Username, userName, StringComparison.OrdinalIgnoreCase) == 0);
            if (user == null)
                throw new Exception(string.Format("User {0} doesn't exist", userName));

            if (user.Password != password)
                throw new Exception("Password is incorrect.");

            Person person = DC.People.FirstOrDefault(i => i.ID == user.PersonID);
            if (person == null)
                throw new Exception(string.Format("User {0} is denied.", userName));

            var res = new PersonModel
            {
                ID = person.ID,
                UserID = user.ID,
                AreaID = person.AreaID,
                District = person.District,
                Email = person.Email,
                EmailTo = person.EmailTo,
                FirstName = person.FirstName,
                HasAuditRole = user.Role % 10 == 1, // == Constants.RoleAudit || user.Role == Constants.RoleAudit1,
                Role = user.Role,
                HomeAddress = person.HomeAddress,
                HouseNo = person.HouseNo,
                IsTerminate = person.TerminateDate != null,
                LastName = person.LastName,
                Phone = person.Phone,
                PosID = person.PosID,
                ProvinceID = person.ProvinceID,
                Street = person.Street,
                WorkAddress = person.WorkAddress,
                ZoneID = person.ZoneID,
                IsDSM = person.IsDSM,
            };

            if (user.Role > 9)
                user.Role = user.Role % 10;
            user.AmendBy = user.ID;
            user.AmendDate = DateTime.Now;
            DC.SaveChanges();

            res.Token = GenerateToken(user);

            return res;      
        }

        private void ChangePassword(string token, int personID, string oldPassword, string newPassword)
        {
            var user = DC.PersonRoles.FirstOrDefault(i => i.PersonID == personID);
            if (user == null)
                throw new Exception(string.Format("User ({0}) was not found!", personID));

            ValidateToken(token, user);

            if (string.IsNullOrEmpty(oldPassword))
                throw new ArgumentNullException("Old password is empty!");

            if (user.Password != HashPassword(oldPassword))
                throw new Exception("Current password was not correct!");

            if (string.IsNullOrEmpty(newPassword))
                throw new ArgumentNullException("New password is empty!");

            user.Password = HashPassword(newPassword);
            DC.SaveChanges();
        }

        private void ResetPassword(string token, int personID, string password)
        {
            var user = DC.PersonRoles.FirstOrDefault(i => i.PersonID == personID);
            if (user == null)
                throw new Exception(string.Format("User ({0}) was not found!", personID));

            ValidateToken(token, user);

            if (string.IsNullOrEmpty(password))
                throw new ArgumentNullException("Password is empty!");

            user.Password = HashPassword(password);
            DC.SaveChanges();
        }

        private string HashPassword(string password)
        {
            // This is used in case client doesn't hash password
            bool hashPassword = false;
            try
            {
                System.Configuration.AppSettingsReader sr = new System.Configuration.AppSettingsReader();
                hashPassword = (bool)sr.GetValue("hashPassword", typeof(bool));
            }
            catch
            {
                hashPassword = false;
            }
            if (hashPassword)
                password = HashUtil.ComputeHash(password);
            return password;
        }

        private string GenerateToken(PersonRole person)
        {
            string text = string.Format("{0}{1}", person.ID, person.AmendDate); // HashUtil.ComputeHash(string.Format("{0}{1}", person.ID, person.AmendDate));
            using (System.IO.MemoryStream mo = new System.IO.MemoryStream())
            {
                using(System.IO.StreamWriter sw = new System.IO.StreamWriter(mo))
                {
                    sw.Write(text);
                    mo.Flush();
                }
                return Convert.ToBase64String(mo.ToArray());
            }
        }

        private void ValidateToken(string token, PersonRole person)
        {
            string generateToken = GenerateToken(person);
            if (token != generateToken)
                throw new Exception("You have not logined in ONLINE mode. Please relogin and try again!");
        }

        private void TrackPing(string pingInfo)
        {
            ConnectionSession connection = Parse(pingInfo); //Newtonsoft.Json.JsonConvert.DeserializeObject<ConnectionSession>(pingInfo);
            if (string.IsNullOrEmpty(connection.Uuid)) return; // should throw exception here...

            var existing = DC.ConnectionSessions.FirstOrDefault(i => i.Uuid == connection.Uuid);
            if (existing != null)
            {
                existing.Token = connection.Token;
                existing.AmendBy = connection.AmendBy;
                existing.AmendDate = DateTime.Now;
            }
            else
            {
                connection.AmendDate = DateTime.Now;
                DC.ConnectionSessions.Add(connection);
            }
            DC.SaveChanges();
        }

        private ConnectionSession Parse(string pingInfo)
        {
            ConnectionSession res = new ConnectionSession();
            string[] part = pingInfo.Split(new string[] { "||" }, StringSplitOptions.RemoveEmptyEntries);
            foreach (string p in part)
            {
                string[] entries = p.Split(new string[] { "~" }, StringSplitOptions.RemoveEmptyEntries);
                var name = entries[0].ToLower();
                if (name == "user_id")
                {
                    res.AmendBy = (entries.Length > 1) ? int.Parse(entries[1]) : 0;
                }
                else if (name == "token")
                {
                    res.Token = (entries.Length > 1) ? entries[1] : "";
                }
                else if (name == "app_version")
                {
                    res.AppVersion = (entries.Length > 1) ? entries[1] : "";
                }
                else if (name == "model")
                {
                    res.Model = (entries.Length > 1) ? entries[1] : "";
                }
                else if (name == "platform")
                {
                    res.Platform = (entries.Length > 1) ? entries[1] : "";
                }
                else if (name == "uuid")
                {
                    res.Uuid = (entries.Length > 1) ? entries[1] : "";
                }
                else if (name == "version")
                {
                    res.Version = (entries.Length > 1) ? entries[1] : "";
                }
                else if (name == "manufacturer")
                {
                    res.Manufacturer = (entries.Length > 1) ? entries[1] : "";
                }
            }

            return res;
        }

        #region IPersonService Interfaces

        public LoginResponse Login(string username, string password)
        {
            LoginResponse resp = new LoginResponse();
            try
            {
                resp.People = GetPerson(username, password);
            }
            catch (Exception ex)
            {
                resp.Status = Constants.ErrorCode;
                resp.ErrorMessage = ex.Message;
            }
            return resp;
        }

        public Response ChangePassword(string token, string personid, string oldpassword, string newpassword)
        {
            Response resp = new Response();
            try
            {
                ChangePassword(token, int.Parse(personid), oldpassword, newpassword);
            }
            catch (Exception ex)
            {
                resp.Status = Constants.ErrorCode;
                resp.ErrorMessage = ex.Message;
            }
            return resp;
        }

        public Response ResetPassword(string token, string personid, string password)
        {
            Response resp = new Response();
            try
            {
                ResetPassword(token, int.Parse(personid), password);
            }
            catch (Exception ex)
            {
                resp.Status = Constants.ErrorCode;
                resp.ErrorMessage = ex.Message;
            }
            return resp;
        }

        public Response Ping(string deviceinfo)
        {
            Response res = new Response();
            try
            {
                _logger.Debug(string.Format("Received ping from {0}", deviceinfo));
                if (!string.IsNullOrWhiteSpace(deviceinfo))
                    (new System.Threading.Tasks.Task(() =>
                    {
                        try
                        {
                            TrackPing(deviceinfo);
                        }
                        catch (Exception ex)
                        {
                            _logger.Debug(string.Format("Write ping info error: {0}", ex));
                        }
                    })).Start();
            }
            catch (Exception ex)
            {
                res.ErrorMessage = ex.Message;
                res.Status = Constants.ErrorCode;
            }
            return res;
        }

        public GetSalesmanResponse GetSalesmansOfAuditor(string personid, string password)
        {
            var response = new GetSalesmanResponse() { Items = new System.Collections.Generic.List<Salesman>() };
            int personID = int.Parse(personid);
            ValidatePerson(personID, password, true);
            var personArr = DC.Database.SqlQuery<Person>(@"With cte(EmployeeID) as (
                                                select ID from Person where ReportTo = @p0
                                                UNION ALL 
                                                select ID from Person JOIN cte d ON Person.ReportTo = d.EmployeeID
                                                where Person.TerminateDate is null
                                            )
                                            select * from person join cte on cte.EmployeeID=person.ID
                                            where ltrim(Person.FirstName) not like 'TBA%'", personID).ToArray();
            if (personArr.Length > 0)
                foreach (var person in personArr)
                    response.Items.Add(new Salesman { Id = person.ID, FirstName = person.FirstName, LastName = person.LastName });

            return response;
        }

        #endregion
    }

    public class HashUtil
    {
        public static string ComputeHash(string text)
        {                    
            Random random = new Random();
            int saltSize = random.Next(4, 8);

            byte[] saltBytes = new byte[saltSize];
         
            RNGCryptoServiceProvider rng = new RNGCryptoServiceProvider();         
            rng.GetNonZeroBytes(saltBytes);        
            byte[] plainTextBytes = Encoding.UTF8.GetBytes(text);

            byte[] plainTextWithSaltBytes = new byte[plainTextBytes.Length + saltBytes.Length];
            
            for (int i = 0; i < plainTextBytes.Length; i++)
                plainTextWithSaltBytes[i] = plainTextBytes[i];

            for (int i = 0; i < saltBytes.Length; i++)
                plainTextWithSaltBytes[plainTextBytes.Length + i] = saltBytes[i];

            HashAlgorithm hash = new SHA1Managed();
            
            byte[] hashBytes = hash.ComputeHash(plainTextWithSaltBytes);

            byte[] hashWithSaltBytes = new byte[hashBytes.Length + saltBytes.Length];

            for (int i = 0; i < hashBytes.Length; i++)
                hashWithSaltBytes[i] = hashBytes[i];

            // Append salt bytes to the result.
            for (int i = 0; i < saltBytes.Length; i++)
                hashWithSaltBytes[hashBytes.Length + i] = saltBytes[i];

            return Convert.ToBase64String(hashWithSaltBytes);                        
        }               
    }
}