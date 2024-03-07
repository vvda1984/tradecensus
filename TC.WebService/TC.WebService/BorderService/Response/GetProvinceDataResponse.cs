using System.Runtime.Serialization;

namespace TradeCensus
{
    [DataContract]
    public class GetProvinceDataResponse : Response
    {
        [DataMember]
        public ProvinceModel Item { get; set; }
    }
}