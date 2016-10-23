using System.Collections.Generic;
using System.Runtime.Serialization;
using TradeCensus.Data;

namespace TradeCensus.Shared
{
    [DataContract]
    public class ProvinceResponse : Response
    {
        [DataMember]
        public List<Province> Items { get; set; }
    }
}