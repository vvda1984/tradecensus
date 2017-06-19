
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TradeCensus.Data
{
    public class OutletEntity : Outlet
    {
        public string ProvinceName { get; set; }

        public string PersonFirstName { get; set; }

        public string PersonLastName { get; set; }

        public bool PersonIsDSM { get; set; }

        public string OutletTypeName { get; set; }

        public int AmendByRole { get; set; }

        public int InputByRole { get; set; }

        public bool CompressImage { get; set; }

        public string StringImage1 { get; set; }

        public string StringImage2 { get; set; }

        public string StringImage3 { get; set; }

        public string StringImage4 { get; set; }

        public string StringImage5 { get; set; }

        public string StringImage6 { get; set; }

        public byte[] ImageData1 { get; set; }

        public byte[] ImageData2 { get; set; }

        public byte[] ImageData3 { get; set; }

        public byte[] ImageData4 { get; set; }

        public byte[] ImageData5 { get; set; }

        public byte[] ImageData6 { get; set; }
    }
}