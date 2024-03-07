using System.Runtime.Serialization;

namespace TradeCensus
{
    [DataContract]
    public class GetOutletResponse : Response
    {
        [DataMember]
        public OutletModel Item
        {
            get; set;
        }
    }
}