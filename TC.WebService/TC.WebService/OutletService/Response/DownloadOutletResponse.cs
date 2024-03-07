using System.Runtime.Serialization;

namespace TradeCensus
{
    [DataContract]
    public class DownloadOutletResponse : Response
    {
        [DataMember]
        public byte[] Content { get; set; }
    }
}