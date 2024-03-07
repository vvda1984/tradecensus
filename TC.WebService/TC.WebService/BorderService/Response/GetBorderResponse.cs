using System.Runtime.Serialization;

namespace TradeCensus
{
    [DataContract]
    public class GetBorderResponse : Response
    {
        [DataMember]
        public BorderModel Item { get; set; }
    }
}