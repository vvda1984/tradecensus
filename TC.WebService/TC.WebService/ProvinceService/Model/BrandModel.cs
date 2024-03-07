using System.Runtime.Serialization;

namespace TradeCensus
{
    [DataContract]
    public class BrandModel
    {
        [DataMember(Name = "id")]
        public int Id { get; set; }

        [DataMember(Name = "name")]
        public string Name { get; set; }

        [DataMember(Name = "brandTypeID")]
        public string BrandTypeID { get; set; }

        [DataMember(Name = "companyID")]
        public int CompanyID { get; set; }

        [DataMember(Name = "tracking")]
        public string Tracking { get; set; }

        [DataMember(Name = "brandCode")]
        public string BrandCode { get; set; }
    }
}