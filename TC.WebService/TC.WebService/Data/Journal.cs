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
    
    public partial class Journal
    {
        public int ID { get; set; }
        public int PersonID { get; set; }
        public System.DateTime JournalDate { get; set; }
        public string Data { get; set; }
        public System.DateTime StartTS { get; set; }
        public System.DateTime EndTS { get; set; }
    }
}