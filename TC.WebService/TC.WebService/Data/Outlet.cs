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
    
    public partial class Outlet
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public Outlet()
        {
            this.OutletImages = new HashSet<OutletImage>();
        }
    
        public int ID { get; set; }
        public string AreaID { get; set; }
        public string TerritoryID { get; set; }
        public string OTypeID { get; set; }
        public string Name { get; set; }
        public string AddLine { get; set; }
        public string AddLine2 { get; set; }
        public string District { get; set; }
        public string ProvinceID { get; set; }
        public string Phone { get; set; }
        public int CallRate { get; set; }
        public Nullable<System.DateTime> CreateDate { get; set; }
        public Nullable<System.DateTime> CloseDate { get; set; }
        public byte Tracking { get; set; }
        public string Class { get; set; }
        public string Open1st { get; set; }
        public string Close1st { get; set; }
        public string Open2nd { get; set; }
        public string Close2nd { get; set; }
        public Nullable<byte> SpShift { get; set; }
        public string LastContact { get; set; }
        public Nullable<System.DateTime> LastVisit { get; set; }
        public int PersonID { get; set; }
        public string Note { get; set; }
        public Nullable<double> Longitude { get; set; }
        public Nullable<double> Latitude { get; set; }
        public string OutletEmail { get; set; }
        public Nullable<int> InputBy { get; set; }
        public Nullable<System.DateTime> InputDate { get; set; }
        public Nullable<int> AmendBy { get; set; }
        public Nullable<System.DateTime> AmendDate { get; set; }
        public byte AuditStatus { get; set; }
        public int TotalVolume { get; set; }
        public int VBLVolume { get; set; }
        public int ModifiedStatus { get; set; }
        public string TaxID { get; set; }
        public string DISAlias { get; set; }
        public int DEDISID { get; set; }
        public string LegalName { get; set; }
        public System.Guid PRowID { get; set; }
        public int PModifiedStatus { get; set; }
        public string Ward { get; set; }
    
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<OutletImage> OutletImages { get; set; }
    }
}