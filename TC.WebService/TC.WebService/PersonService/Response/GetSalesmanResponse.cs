using System.Collections.Generic;
using System.Runtime.Serialization;

namespace TradeCensus
{
    [DataContract]
    public class GetSalesmanResponse : Response
    {
        [DataMember(Name = "items")]
        public List<SalesmanModel> Items { get; set; }
    }
}