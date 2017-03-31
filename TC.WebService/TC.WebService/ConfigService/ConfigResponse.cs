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

    [DataContract]
    public class CheckVersionResponse : Response
    {
        [DataMember]
        public int Version { get; set; }

        [DataMember]
        public string Message { get; set; }
    }

    [DataContract]
    public class DownloadMapIconsResponse : Response
    {
        [DataMember(Name = "version")]
        public int Version { get; set; }

        [DataMember(Name = "salesmanNewOutletMapIcon")]
        public string SalesmanNewOutletMapIcon { get; set; }

        [DataMember(Name = "agencyNewOutletMapIcon")]
        public string AgencyNewOutletMapIcon { get; set; }

        [DataMember(Name = "auditorNewOutletMapIcon")]
        public string AuditorNewOutletMapIcon { get; set; }
    }
}