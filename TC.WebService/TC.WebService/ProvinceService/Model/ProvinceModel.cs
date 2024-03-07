using System.Collections.Generic;
using System.Runtime.Serialization;

namespace TradeCensus
{
    [DataContract]
    public class ProvinceModel
    {
        [DataMember(Name = "id")]
        public string Id { get; set; }

        [DataMember(Name = "name")]
        public string Name { get; set; }

        [DataMember(Name = "referenceGeoID")]
        public int ReferenceGeoID { get; set; }

        [DataMember(Name = "parentID")]
        public string ParentID { get; set; }

        [DataMember(Name = "districts")]
        public List<DistrictModel> Districts { get; set; }
    }
}