using System.Collections.Generic;
using System.Runtime.Serialization;
using TradeCensus.Data;

namespace TradeCensus.Shared
{
    [DataContract]
    public class ProvinceResponse : Response
    {
        [DataMember]
        public List<ProvinceModel> Items { get; set; }
    }

    [DataContract]
    public class GetDistrictsResponse : Response
    {
        [DataMember(Name = "items")]
        public List<DistrictModel> Items { get; set; }
    }
}