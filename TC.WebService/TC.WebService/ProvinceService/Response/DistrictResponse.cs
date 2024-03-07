using System.Collections.Generic;
using System.Runtime.Serialization;

namespace TradeCensus.Shared
{
    [DataContract]
    public class DistrictResponse : Response
    {
        [DataMember(Name = "items")]
        public List<DistrictModel> Items { get; set; }
    }
}