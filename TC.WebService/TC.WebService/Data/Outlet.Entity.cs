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
        
        public int? LeadBrandID { get; set; }

        public string LeadBrandName { get; set; }

        public string VisitFrequency { get; set; }

        public string PreferredVisitWeek { get; set; }

        public string PreferredVisitDay { get; set; }

        public string LegalInformation { get; set; }

        public string BusinessOwner { get; set; }

        public string PaymentInformation { get; set; }

        public string Beneficiary { get; set; }

        public string CitizenID { get; set; }

        public string CitizenFrontImage { get; set; }

        public string CitizenRearImage { get; set; }

        public string PersonalTaxID { get; set; }

        public int? BankID { get; set; }

        public string BankName { get; set; }

        public int? BankCodeID { get; set; }

        public string BankCode { get; set; }
        public string AccountNumber{ get; set; }

        public string SupplierJson { get; set; }
    }
}