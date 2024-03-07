using System.Runtime.Serialization;

namespace TradeCensus
{
    [DataContract]
    public class BankCodeModel
    {
        [DataMember(Name = "id")]
        public int Id { get; set; }

        [DataMember(Name = "code")]
        public string Code { get; set; }

        [DataMember(Name = "bankID")]
        public int BankID { get; set; }
    }
}