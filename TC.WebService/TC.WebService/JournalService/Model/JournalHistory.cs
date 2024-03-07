using System.Collections.Generic;
using System.Runtime.Serialization;

namespace TradeCensus
{
    [DataContract]
    public class JournalHistory
    {
        [DataMember(Name = "date")]
        public string date { get; set; }

        [DataMember(Name = "journals")]
        public List<JournalModel> Journals { get; set; }
    }
}