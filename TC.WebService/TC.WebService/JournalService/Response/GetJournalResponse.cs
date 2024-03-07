using System.Runtime.Serialization;

namespace TradeCensus
{
    [DataContract]
    public class GetJournalResponse : Response
    {
        [DataMember(Name = "items")]
        public JournalHistory[] Items { get; set; }
    }
}