using System.Runtime.Serialization;

namespace TradeCensus
{
    [DataContract]
    public class JournalSync
    {
        [DataMember(Name = "journalId")]
        public string JournalID { get; set; }

        [DataMember(Name = "id")]
        public int Id { get; set; }
    }
}