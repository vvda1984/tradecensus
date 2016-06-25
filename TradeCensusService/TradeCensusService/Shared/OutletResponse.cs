using System.Collections.Generic;
using System.Runtime.Serialization;

namespace TradeCensus
{
    [DataContract]
    public class OutletResponse : Response
    {
        [DataMember]
        public List<int> IDs
        {
            get; set;
        }
    }

    [DataContract]
    public class GetOutletResponse : Response
    {
        [DataMember]
        public Outlet Item
        {
            get; set;
        }
    }
}