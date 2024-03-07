using System.Runtime.Serialization;

namespace TradeCensus
{
    [DataContract]
    public class GetOutletImagesResponse : Response
    {
        [DataMember]
        public string Image1 { get; set; }

        [DataMember]
        public string Image2 { get; set; }

        [DataMember]
        public string Image3 { get; set; }

        [DataMember]
        public string Image4 { get; set; }

        [DataMember]
        public string Image5 { get; set; }

        [DataMember]
        public string Image6 { get; set; }
    }
}