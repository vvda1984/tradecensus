using System.Runtime.Serialization;

namespace TradeCensus
{
    [DataContract]
    public class GetImageResponse : Response
    {
        [DataMember]
        public string Image { get; set; }
    }
}