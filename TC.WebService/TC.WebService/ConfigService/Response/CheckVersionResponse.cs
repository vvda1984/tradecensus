using System.Runtime.Serialization;

namespace TradeCensus
{
    [DataContract]
    public class CheckVersionResponse : Response
    {
        [DataMember]
        public int Version { get; set; }

        [DataMember]
        public string Message { get; set; }
    }
}