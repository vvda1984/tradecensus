using System.Collections.Generic;
using System.Linq;
using TradeCensus.Shared;

namespace TradeCensus
{
    public class ProvinceRepo : BaseRepo
    {
        public ProvinceRepo() : base("Province")
        {
        }

        public List<Province> GetAll()
        {
            Log("Get list of provinces");
            return _entities.Provinces.ToList();
        }
    }
}