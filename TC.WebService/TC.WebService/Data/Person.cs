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
    
    public partial class Person
    {
        public int ID { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public int PosID { get; set; }
        public string HomeAddress { get; set; }
        public string WorkAddress { get; set; }
        public Nullable<System.DateTime> DOB { get; set; }
        public string Phone { get; set; }
        public Nullable<System.DateTime> HireDate { get; set; }
        public Nullable<int> ReportTo { get; set; }
        public Nullable<System.DateTime> TerminateDate { get; set; }
        public string ZoneID { get; set; }
        public string AreaID { get; set; }
        public string HouseNo { get; set; }
        public string Street { get; set; }
        public string District { get; set; }
        public string ProvinceID { get; set; }
        public string Email { get; set; }
        public string OnLeave { get; set; }
        public string EmailTo { get; set; }
        public Nullable<int> InputBy { get; set; }
        public Nullable<System.DateTime> InputDate { get; set; }
        public Nullable<int> AmendBy { get; set; }
        public Nullable<System.DateTime> AmendDate { get; set; }
        public Nullable<bool> IsDefaultSA { get; set; }
        public bool IsDSM { get; set; }
    }
}