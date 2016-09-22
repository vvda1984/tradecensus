using System.Runtime.Serialization;

namespace TradeCensus
{
    [DataContract]
    public class BorderModel 
    {
        [DataMember]
        public string ID { get; set; }

        [DataMember]
        public string Name { get; set; }

        [DataMember]
        public string ParentID { get; set; }

        [DataMember]
        public string GeoData { get; set; }

        [DataMember]
        public int ChildrenCount { get; set; }

        [DataMember]
        public int HasGeoData { get; set; }
    }
}