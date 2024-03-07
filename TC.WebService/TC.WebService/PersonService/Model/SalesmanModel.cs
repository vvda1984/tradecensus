using System.Runtime.Serialization;

namespace TradeCensus
{
    [DataContract]
    public class SalesmanModel
    {
        [DataMember(Name = "personID")]
        public int Id { get; set; }

        [DataMember(Name = "firstName")]
        public string FirstName { get; set; }

        [DataMember(Name = "lastName")]
        public string LastName { get; set; }
    }
}