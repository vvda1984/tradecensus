//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace TradeCensus.Data
{
    using System;
    using System.Collections.Generic;
    
    public partial class OutletImage
    {
        public int ID { get; set; }
        public int OutletID { get; set; }
        public string Image1 { get; set; }
        public string Image2 { get; set; }
        public string Image3 { get; set; }
        public byte[] ImageData1 { get; set; }
        public byte[] ImageData2 { get; set; }
        public byte[] ImageData3 { get; set; }
    
        public virtual Outlet Outlet { get; set; }
    }
}