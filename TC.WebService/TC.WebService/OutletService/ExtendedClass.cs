using System;
using System.Runtime.Serialization;
using System.Text;
using TradeCensus.Data;

namespace TradeCensus
{
    public class Point
    {
        public double Lat { get; set; }
        public double Lng { get; set; }
    }   

    

    [Serializable]
    public class DownloadOutlet : Outlet
    {
        public long RowNo { get; set; }
        public string PersonFirstName { get; set; }
        public string PersonLastName { get; set; }
        public bool? PersonIsDSM { get; set; }

        [IgnoreDataMember]
        public byte[] ImageData1 { get; set; }
        [IgnoreDataMember]
        public byte[] ImageData2 { get; set; }
        [IgnoreDataMember]
        public byte[] ImageData3 { get; set; }

        public string StringImage1 { get; set; }
        public string StringImage2 { get; set; }
        public string StringImage3 { get; set; }
    }
}