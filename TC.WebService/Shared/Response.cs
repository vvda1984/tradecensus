using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Web;

namespace TradeCensus
{
    [DataContract]
    public class Response
    {
        [DataMember]
        public int Status { get; set; }

        [DataMember]
        public string ErrorMessage { get;set; }
    }
}