using System.Runtime.Serialization;

namespace TradeCensus
{
    [DataContract]
    public class SaveImageResponse : Response
    {
        [DataMember]
        public string ImageThumb { get; set; }
    }
}