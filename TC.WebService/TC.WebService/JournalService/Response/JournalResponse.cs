using System.Runtime.Serialization;

namespace TradeCensus
{
    [DataContract]
    public class JournalResponse : Response
    {
        [DataMember(Name = "id")]
        public int JournalID { get; set; }
    }
}