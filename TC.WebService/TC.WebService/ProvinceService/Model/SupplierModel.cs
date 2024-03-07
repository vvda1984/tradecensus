using System.Runtime.Serialization;

namespace TradeCensus
{
    [DataContract]
    public class SupplierModel
    {
        [DataMember(Name = "supplierID")]
        public int SupplierID { get; set; }

        [DataMember(Name = "supplierName")]
        public string SupplierName { get; set; }

        [DataMember(Name = "primarySupplier")]
        public string PrimarySupplier { get; set; }
    }
}