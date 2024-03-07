using System.Collections.Generic;
using System.Runtime.Serialization;

namespace TradeCensus
{
    [DataContract]
    public class SyncOutletResponse : Response
    {
        [DataMember]
        public List<SyncOutlet> Outlets { get; set; }

    }
}