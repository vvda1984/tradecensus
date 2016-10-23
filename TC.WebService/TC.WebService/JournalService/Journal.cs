using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Web;

namespace TradeCensus
{
    [DataContract]
    public class Journal
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

    [DataContract]
    public class JournalHistory
    {
        [DataMember(Name = "date")]
        public string date { get; set; }

        [DataMember(Name = "journals")]
        public List<Journal> Journals { get; set; }
    }

    [DataContract]
    public class JournalSync
    {
        [DataMember(Name = "journalId")]
        public string JournalID { get; set; }

        [DataMember(Name = "id")]
        public int Id { get; set; }
    }
}