using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using TradeCensus.Shared;

namespace TradeCensus
{
    public class PersonRepo : BaseRepo
    {        
        public PersonRepo() : base("Person")
        {
        }
    
        public PersonModel Login(string userName, string password)
        {
            Log("Request login: {0}", userName);
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
            {                
                password = HashUtil.ComputeHash(password);
            }

            var user = _entities.PersonRoles.FirstOrDefault(i => string.Compare(i.Username, userName, StringComparison.OrdinalIgnoreCase) == 0);
            if (user == null)
                throw new Exception(string.Format("User {0} doesn't exist", userName));

            if (user.Password != password)
                throw new Exception("Password is incorrect.");

            Person person = _entities.People.FirstOrDefault(i => i.ID == user.PersonID);
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
                HasAuditRole = user.Role == Constants.RoleAudit || user.Role == Constants.RoleAudit1,
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

            if (user.Role == 100 || user.Role == 101)
            {
                user.Role = user.Role - 100;
                _entities.SaveChanges();
            }

            return res;      
        }
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