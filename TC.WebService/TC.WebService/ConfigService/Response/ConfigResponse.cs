using System.Collections.Generic;
using System.Runtime.Serialization;

namespace TradeCensus
{
    [DataContract]
    public class ConfigResponse : Response
    {
        [DataMember]
        public Dictionary<string, string> Items
        {
            get; set;
        }
    }
}