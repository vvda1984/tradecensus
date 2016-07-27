using System;
using System.Linq;
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
            var user = _entities.PersonRoles.FirstOrDefault(i => string.Compare(i.Username, userName, StringComparison.OrdinalIgnoreCase) == 0);
            if (user == null)
                throw new Exception(string.Format("User {0} doesn't exist", userName));

            if (user.Password != password)
                throw new Exception("Password is incorrect.");

            Person person = _entities.People.FirstOrDefault(i => i.ID == user.PersonID);
            if (person == null)
                throw new Exception(string.Format("User {0} is denied.", userName));

            return new PersonModel
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
            };            
        }
    }
}