using System;
using System.Collections.Generic;
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
            var person = DC.GetLoginUser(userName, password);
            if (person == null)
                throw new Exception("User/password is incorrect");

            var res = new PersonModel
            {
                ID = person.ID,
                UserID = person.UserID,
                AreaID = person.AreaID,
                District = person.District,
                Email = person.Email,
                EmailTo = person.EmailTo,
                FirstName = person.FirstName,
                HasAuditRole = person.Role % 10 == 1 || person.Role % 10 == 3, // == Constants.RoleAudit || user.Role == Constants.RoleAudit1,
                Role = person.Role,
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
                HireDate = person.HireDate != null ? person.HireDate.Value.ToString("yyyy-MM-DD") : null,
            };

            if (person.Role > 9)
            {
                var newRole = person.Role % 10;
                DC.UpdatePersonRoleValue(person.UserID, newRole, person.ID);
                DC.SaveChanges();
            }

            res.Token = DC.GenerateToken(person.ID);
            return res;      
        }

        private void ChangePassword(string token, int personID, string oldPassword, string newPassword)
        {
            oldPassword = HashPassword(oldPassword);
            newPassword = HashPassword(newPassword);

            DC.ChangePassword(token, personID, oldPassword, newPassword);
            DC.SaveChanges();
        }

        private void ResetPassword(string token, int personID, string password)
        {
            DC.ResetPassword(token, personID, HashPassword(password));
            DC.SaveChanges();
        }

        private string HashPassword(string password)
        {   
            return password;
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
            LoginResponse resp = new LoginResponse { Sales = new List<Salesman>() };
            try
            {
                resp.People = GetPerson(username, password);
                resp.Sales = new List<Salesman>();

                if (resp.People.HasAuditRole)
                    resp.Sales = DC.GetSalesmanList(resp.People.ID);
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
                if (!string.IsNullOrWhiteSpace(deviceinfo))
                {
                    _logger.Debug($"Received ping from {deviceinfo}");
                }
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
            int personID = int.Parse(personid);
            ValidatePerson(personID, password, true);

            var response = new GetSalesmanResponse
            {
                Items = DC.GetSalesmanList(personID)
            };
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

    public class User : Person
    {
        public int UserID { get; set; }
        public int Role { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
    }
}