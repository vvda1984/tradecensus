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
    }
}