using System.Collections.Generic;
using System.Runtime.Serialization;

namespace TradeCensus
{
    [DataContract]
    public class LoginResponse : Response
    {
        [DataMember]
        public PersonModel People
        {
            get; set;
        }

        [DataMember(Name = "salesmans")]
        public List<SalesmanModel> Sales { get; set; }
    }
}