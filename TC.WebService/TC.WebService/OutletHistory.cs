//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace TradeCensus
{
    using System;
    using System.Collections.Generic;
    
    public partial class OutletHistory
    {
        public int ID { get; set; }
        public int OutletID { get; set; }
        public int Action { get; set; }
        public string Note { get; set; }
        public int PersonID { get; set; }
        public int InputBy { get; set; }
        public System.DateTime InputDate { get; set; }
    }
}
