using System.Runtime.Serialization;

namespace TradeCensus
{
    [DataContract]
    public class OutletModel
    {
        [DataMember]
        public int ID { get; set; }
        [DataMember]
        public string AreaID { get; set; }
        [DataMember]
        public string OTypeID { get; set; }
        [DataMember]
        public string OutletTypeName { get; set; }
        [DataMember]
        public int OutletSource { get; set; } // SR/DIS
        [DataMember]
        public string Name { get; set; }
        [DataMember]
        public string AddLine { get; set; }
        [DataMember]
        public string AddLine2 { get; set; }
        [DataMember]
        public string Ward { get; set; }
        [DataMember]
        public string District { get; set; }
        [DataMember]
        public string ProvinceID { get; set; }
        [DataMember]
        public string ProvinceName { get; set; }
        [DataMember]
        public string FullAddress { get; set; }
        [DataMember]
        public string Phone { get; set; }
        [DataMember]
        public string CloseDate { get; set; }
        [DataMember]
        public bool IsOpened { get; set; }
        [DataMember]
        public byte Tracking { get; set; }
        [DataMember]
        public bool IsTracked { get; set; }
        [DataMember]
        public string LastContact { get; set; }
        [DataMember]
        public string LastVisit { get; set; }
        [DataMember]
        public int PersonID { get; set; }
        [DataMember]
        public string PersonFirstName { get; set; }
        [DataMember]
        public string PersonLastName { get; set; }
        [DataMember]
        public bool PersonIsDSM { get; set; }
        [DataMember]
        public string CreateDate { get; set; }
        [DataMember]
        public string Note { get; set; }
        [DataMember]
        public double Longitude { get; set; }
        [DataMember]
        public double Latitude { get; set; }
        [DataMember]
        public string OutletEmail { get; set; }
        [DataMember]
        public double Distance { get; set; }
        [DataMember]
        public int InputBy { get; set; }
        [DataMember]
        public int AmendBy { get; set; }
        [DataMember]
        public string AmendDate { get; set; }
        [DataMember]
        public int AuditStatus { get; set; }
        [DataMember]
        public string StringImage1 { get; set; }
        [DataMember]
        public string StringImage2 { get; set; }
        [DataMember]
        public string StringImage3 { get; set; }
        [DataMember]
        public string StringImage4 { get; set; }
        [DataMember]
        public string StringImage5 { get; set; }
        [DataMember]
        public string StringImage6 { get; set; }
        [DataMember]
        public int TotalVolume { get; set; }
        [DataMember]
        public int VBLVolume { get; set; }
        [DataMember]
        public string PRowID { get; set; }
        [DataMember]
        public int PAction { get; set; }
        [DataMember]
        public string PNote { get; set; }
        [DataMember]
        public int PStatus { get; set; }
        [DataMember]
        public int AmendByRole { get; set; }
        [DataMember]
        public int InputByRole { get; set; }

        [DataMember]
        public string Class { get; set; }
        [DataMember]
        public int SpShift { get; set; }
        [DataMember]
        public int CallRate { get; set; }
        [DataMember]
        public int IsSent { get; set; }
        [DataMember]
        public string TerritoryID { get; set; }
        [DataMember]
        public string LegalName { get; set; }
        [DataMember]
        public string TaxID { get; set; }

        [DataMember]
        public string Comment { get; set; }
        [DataMember]
        public bool CompressImage { get; set; }
    }

    [DataContract]
    public class SyncOutlet
    {
        [DataMember]
        public int ID { get; set; }
        [DataMember]
        public string RowID { get; set; }
    }

}