using System.Runtime.Serialization;

namespace TradeCensus
{
    [DataContract]
    public class JournalModel
    {
        [DataMember(Name = "id")]
        public int Id { get; set; }

        [DataMember(Name = "personId")]
        public int PersonId { get; set; }

        [DataMember(Name = "journalDate")]
        public string JournalDate { get; set; }

        [DataMember(Name = "startTS")]
        public string StartTS { get; set; }

        [DataMember(Name = "endTS")]
        public string EndTS { get; set; }

        [DataMember(Name = "data")]
        public string Data { get; set; }

        [DataMember(Name = "journalId")]
        public string JournalID { get; set; }
    }
}