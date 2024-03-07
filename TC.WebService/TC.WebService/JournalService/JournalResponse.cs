using System.Collections.Generic;
using System.Runtime.Serialization;

namespace TradeCensus
{
    [DataContract]
    public class JournalResponse : Response
    {
        [DataMember(Name = "id")]
        public int JournalID { get; set; }
    }

    [DataContract]
    public class GetJournalResponse : Response
    {
        [DataMember(Name = "items")]
        public JournalHistory[] Items { get; set; }
    }

    [DataContract]
    public class SyncJournalResponse : Response
    {
        [DataMember(Name = "items")]
        public List<JournalSync> JournalIDs { get; set; }
    }
}