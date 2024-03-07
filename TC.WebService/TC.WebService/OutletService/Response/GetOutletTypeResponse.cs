using System.Collections.Generic;
using System.Runtime.Serialization;
using TradeCensus.Data;

namespace TradeCensus
{
    [DataContract]
    public class GetOutletTypeResponse : Response
    {
        [DataMember]
        public List<OutletType> Items { get; set; }
    }
}