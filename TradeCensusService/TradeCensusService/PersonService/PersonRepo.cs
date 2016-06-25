using System;
using System.Linq;
using TradeCensus.Shared;

namespace TradeCensus
{
    public class PersonRepo : BaseRepo
    {
        public PersonRepo():base("Person")
        {
        }                

        public PersonModel Get(string id, string password)
        {
            Log("Get person id: {0}", id);
            var item = _entities.People.FirstOrDefault(i=>i.ID.ToString() == id);
            if (item != null)
            {
                if (!string.IsNullOrEmpty(password)&& !password.Equals(item.Password)) // TODO: hash password....
                    throw new Exception(string.Format("Password is incorrect"));

                var ad = _entities.PersonRoles.FirstOrDefault(i => i.PersonID == item.ID);
                PersonModel res = new PersonModel()
                {
                    ID = item.ID,
                    AreaID = item.AreaID,
                    District = item.District,
                    Email = item.Email,
                    EmailTo = item.EmailTo,
                    FirstName = item.FirstName,
                    HasAuditRole = ad == null || ad.IsAudit == 1,
                    HomeAddress = item.HomeAddress,
                    HouseNo = item.HouseNo,
                    IsTerminate = item.TerminateDate != null,
                    LastName = item.LastName,
                    Phone = item.Phone,
                    PosID = item.PosID,
                    ProvinceID = item.ProvinceID,
                    Street = item.Street,
                    WorkAddress = item.WorkAddress,
                    ZoneID = item.ZoneID,
                };
                return res;
            }
            else
                throw new Exception(string.Format("User {0} doesn't exist"));
        }
    }
}