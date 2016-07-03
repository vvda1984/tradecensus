using System.Collections.Generic;
using System.Runtime.Serialization;

namespace TradeCensus
{
    [DataContract]
    public class OutletResponse : Response
    {
        [DataMember]
        public List<int> IDs
        {
            get; set;
        }
    }

    [DataContract]
    public class GetOutletResponse : Response
    {
        [DataMember]
        public OutletModel Item
        {
            get; set;
        }
    }

    [DataContract]
    public class GetOutletTypeResponse : Response
    {
        [DataMember]
        public List<OutletType> Items { get; set; }
    }

    [DataContract]
    public class GetOutletListResponse : Response
    {
        [DataMember]
        public List<OutletModel> Items { get; set; }
    }

    [DataContract]
    public class SaveOutletResponse : Response
    {
        [DataMember]
        public int ID { get; set; }
        [DataMember]
        public string RowID { get; set; }
    }    
}