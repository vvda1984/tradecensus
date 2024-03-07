using System.Collections.Generic;
using System.Runtime.Serialization;

namespace TradeCensus
{
    [DataContract]
    public class GetOutletListResponse : Response
    {
        [DataMember]
        public List<OutletModel> Items { get; set; }
    }
}