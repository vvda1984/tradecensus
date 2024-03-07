using System.Collections.Generic;
using System.Runtime.Serialization;

namespace TradeCensus
{
    [DataContract]
    public class GetBorderArrayResponse : Response
    {
        [DataMember]
        public List<BorderModel> Items { get; set; }
    }

    [DataContract]
    public class GetBorderResponse : Response
    {
        [DataMember]
        public BorderModel Item { get; set; }
    }

    [DataContract]
    public class GetProvinceDataResponse : Response
    {
        [DataMember]
        public ProvinceModel Item { get; set; }
    }
}