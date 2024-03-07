using System.Runtime.Serialization;

namespace TradeCensus
{
    [DataContract]
    public class WardModel
    {
        [DataMember(Name = "id")]
        public string Id { get; set; }

        [DataMember(Name = "name")]
        public string Name { get; set; }

        [DataMember(Name = "parentID")]
        public string ParentID { get; set; }
    }
}