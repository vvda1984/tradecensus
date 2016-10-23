using System.Collections.Generic;
using System.Runtime.Serialization;
using TradeCensus.Data;

namespace TradeCensus
{
    [DataContract]
    public class OutletResponse : Response
    {
        [DataMember]
        public List<int> IDs
        {
            get; set;
        }
    }

    [DataContract]
    public class GetOutletIDResponse : Response
    {
        [DataMember]
        public List<OutletShort> Outlets
        {
            get; set;
        }
    }

    [DataContract]
    public class GetOutletResponse : Response
    {
        [DataMember]
        public OutletModel Item
        {
            get; set;
        }
    }

    [DataContract]
    public class GetOutletTypeResponse : Response
    {
        [DataMember]
        public List<OutletType> Items { get; set; }
    }

    [DataContract]
    public class GetOutletListResponse : Response
    {
        [DataMember]
        public List<OutletModel> Items { get; set; }
    }

    [DataContract]
    public class DownloadOutletResponse : Response
    {
        [DataMember]
        public byte[] Content { get; set; }
    }

    [DataContract]
    public class SaveOutletResponse : Response
    {
        [DataMember]
        public int ID { get; set; }
        [DataMember]
        public string RowID { get; set; }
    }

    [DataContract]
    public class SaveImageResponse : Response
    {
        [DataMember]
        public string ImageThumb { get; set; }
    }

    [DataContract]
    public class GetImageResponse : Response
    {
        [DataMember]
        public string Image { get; set; }
    }

    [DataContract]
    public class SyncOutletResponse : Response
    {
        [DataMember]
        public List<SyncOutlet> Outlets { get; set; }
       
    }

    [DataContract]
    public class GetOutletImagesResponse : Response
    {
        [DataMember]
        public string Image1 { get; set; }

        [DataMember]
        public string Image2 { get; set; }

        [DataMember]
        public string Image3 { get; set; }
    }
}