using System.Runtime.Serialization;

namespace TradeCensus
{
    [DataContract]
    public class SaveOutletResponse : Response
    {
        [DataMember]
        public int ID { get; set; }
        [DataMember]
        public string RowID { get; set; }
    }
}