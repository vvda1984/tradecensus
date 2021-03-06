﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Web;

namespace TradeCensus
{
    [DataContract]
    public class GetSalesmanResponse : Response
    {
        [DataMember(Name = "items")]
        public List<Salesman> Items { get; set; }
    }

    [DataContract]
    public class Salesman
    {
        [DataMember(Name = "personID")]
        public int Id { get; set; }

        [DataMember(Name = "firstName")]
        public string FirstName { get; set; }

        [DataMember(Name = "lastName")]
        public string LastName { get; set; }
    }
}