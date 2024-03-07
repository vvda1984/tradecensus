using System.Collections.Generic;
using System.Runtime.Serialization;

namespace TradeCensus
{
    [DataContract]
    public class Response
    {
        [DataMember]
        public int Status { get; set; }

        [DataMember]
        public string ErrorMessage { get; set; }
    }

    [DataContract]
    public class Response<T> : Response where T : class
    {
        [DataMember(Name = "items")]
        public List<T> Items { get; set; } = new List<T>();
    }
}