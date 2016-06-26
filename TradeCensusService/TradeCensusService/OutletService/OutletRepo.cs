using System.Collections.Generic;
using System.Linq;
using TradeCensus.Shared;

namespace TradeCensus
{
    public class OutletRepo : BaseRepo
    {
        public OutletRepo() : base("Outlet")
        {
        }

        public List<int> GetByProvinceID(string provinceID)
        {
            Log("Get outlet by province id: {0}", provinceID);
            var items = _entities.Outlets.Where(i => i.ProvinceID == provinceID);
            Log("Found {0} outlets of province {1}", items.Count(), provinceID);
            List<int> ids = new List<int>();
            foreach (var i in items) ids.Add(i.ID);
            return ids;
        }

        public Outlet GetByID(string id)
        {
            Log("Get outlet by id: {0}", id);
            var item = _entities.Outlets.FirstOrDefault(i => i.ID.ToString() == id);
            if(item!= null)
                Log("Found outlet {0}", id);
            else
                Log("Found outlet {0} is missing", id);

            return item;
        }

        public List<OutletType> GetAllOutletTypes()
        {
            Log("Get list of OutletTypes");
            return _entities.OutletTypes.ToList();
        }
    }
}