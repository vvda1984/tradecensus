using System.Runtime.Serialization;

namespace TradeCensus
{
    [DataContract]
    public class SyncOutlet
    {
        [DataMember]
        public int ID { get; set; }
        [DataMember]
        public string RowID { get; set; }
    }
}