using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Web;

namespace TradeCensus
{
    [DataContract]
    public class GetBorderArrayResponse : Response
    {
        [DataMember]
        public List<BorderModel> Items { get; set; }
    }

    [DataContract]
    public class GetBorderResponse : Response
    {
        [DataMember]
        public BorderModel Item { get; set; }
    }
}