using TradeCensus.Data;

namespace TradeCensus
{
    public class GeoBorderExtend : GeoBorder
    {
        public string Formateddata
        {
            get
            {
                return (new PolylineBorder()).Parse(GeoData);
            }
        }

        public int ChildrenCount { get; set; }
    }
}