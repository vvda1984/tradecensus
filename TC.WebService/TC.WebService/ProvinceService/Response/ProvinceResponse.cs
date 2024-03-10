﻿using System.Collections.Generic;
using System.Runtime.Serialization;

namespace TradeCensus.Shared
{
    [DataContract]
    public class ProvinceResponse : Response
    {
        [DataMember]
        public List<ProvinceModel> Items { get; set; }
    }
}