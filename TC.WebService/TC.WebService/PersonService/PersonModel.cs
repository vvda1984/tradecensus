using System.Runtime.Serialization;

namespace TradeCensus
{
    [DataContract]
    public class PersonModel
    {
        [DataMember]
        public int ID { get; set; }
        [DataMember]
        public int UserID { get; set; }
        [DataMember]
        public string FirstName { get; set; }
        [DataMember]
        public string LastName { get; set; }
        [DataMember]
        public bool IsTerminate { get; set; }
        [DataMember]
        public bool HasAuditRole { get; set; }
        [DataMember]     
        public int PosID { get; set; }
        [DataMember]
        public string ZoneID { get; set; }
        [DataMember]
        public string AreaID { get; set; }
        [DataMember]
        public string ProvinceID { get; set; }
        [DataMember]
        public string Email { get; set; }
        [DataMember]
        public string EmailTo { get; set; }
        [DataMember]
        public string HouseNo { get; set; }
        [DataMember]
        public string Street { get; set; }
        [DataMember]
        public string District { get; set; }
        [DataMember]
        public string HomeAddress { get; set; }
        [DataMember]
        public string WorkAddress { get; set; }
        [DataMember]
        public string Phone { get; set; }
    }
}