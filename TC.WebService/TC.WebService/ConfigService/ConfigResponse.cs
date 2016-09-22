using System.Collections.Generic;
using System.Runtime.Serialization;

namespace TradeCensus
{
    [DataContract]
    public class ConfigResponse : Response
    {
        [DataMember]
        public Dictionary<string,string> Items
        {
            get; set;
        }
    }

    [DataContract]
    public class CheckVersionResponse : Response
    {
        [DataMember]
        public int Version { get; set; }

        [DataMember]
        public string Message { get; set; }
    }
}