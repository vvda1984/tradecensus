using System.Collections.Generic;
using System.Runtime.Serialization;

namespace TradeCensus
{
    [DataContract]
    public class GetBorderArrayResponse : Response
    {
        [DataMember]
        public List<BorderModel> Items { get; set; }
    }
}