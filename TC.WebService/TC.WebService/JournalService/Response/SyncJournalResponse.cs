using System.Collections.Generic;
using System.Runtime.Serialization;

namespace TradeCensus
{
    [DataContract]
    public class SyncJournalResponse : Response
    {
        [DataMember(Name = "items")]
        public List<JournalSync> JournalIDs { get; set; }
    }
}