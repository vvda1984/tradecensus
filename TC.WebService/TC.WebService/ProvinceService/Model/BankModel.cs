using System.Runtime.Serialization;

namespace TradeCensus
{
    [DataContract]
    public class BankModel
    {
        [DataMember(Name = "id")]
        public int Id { get; set; }

        [DataMember(Name = "code")]
        public string Code { get; set; }

        [DataMember(Name = "name")]
        public string Name { get; set; }
    }
}