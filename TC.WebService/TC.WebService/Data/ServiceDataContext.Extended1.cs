using System;
using System.Collections.Generic;
using System.Linq;
using TradeCensus.Shared;

namespace TradeCensus.Data
{
    public sealed partial class ServiceDataContext : IDisposable
    {
        const string _SQL_SELECT_LEAD_BRAND = "SELECT * FROM vwLeadBrand (NOLOCK) ORDER BY NAME";
        const string _SQL_SELECT_BANK = "SELECT * FROM bank (NOLOCK) ORDER BY NAME";
        const string _SQL_SELECT_BANK_CODE = "SELECT * FROM BankCode (NOLOCK) where BankId = @p0 ORDER BY CODE ";
        const string _SQL_SELECT_PRIMARY_SUPPLIER = "SELECT distinct s.ID as SupplierID, s.Name + ' - ' + CONCAT_WS( ', ',s.AddLine, s.AddLine2, s.Ward, s.District, c.Name ) as SupplierName FROM vwPrimarySupplier s WITH (NOLOCK) JOIN Province c WITH (NOLOCK) on c.ID = s.ProvinceID LEFT JOIN Person p WITH (NOLOCK) ON p.ZoneID = s.ZoneID WHERE p.ID is null or p.ID = @p0 order by SupplierName";
        const string _SQL_SELECT_OTHER_SUPPLIER = "SELECT distinct s.ID as SupplierID, s.Name + ' - ' + CONCAT_WS( ', ',s.AddLine, s.AddLine2, s.Ward, s.District, c.Name ) as SupplierName FROM vwOtherSupplier s WITH (NOLOCK) JOIN Province c WITH (NOLOCK) on c.ID = s.ProvinceID LEFT JOIN Person p WITH (NOLOCK) ON p.ZoneID = s.ZoneID WHERE p.ID is null or p.ID = @p0 order by SupplierName";

        static string SQL_SELECT_LEAD_BRAND { get { return Utils.GetCustomSQL("SQL_SELECT_LEADBRAND", _SQL_SELECT_LEAD_BRAND); } }
        static string SQL_SELECT_BANK { get { return Utils.GetCustomSQL("SQL_SELECT_BANK", _SQL_SELECT_BANK); } }
        static string SQL_SELECT_BANK_CODE { get { return Utils.GetCustomSQL("SQL_SELECT_BANK_CODE", _SQL_SELECT_BANK_CODE); } }
        static string SQL_SELECT_PRIMARY_SUPPLIER { get { return Utils.GetCustomSQL("_SQL_SELECT_PRIMARY_SUPPLIER", _SQL_SELECT_PRIMARY_SUPPLIER); } }
        static string SQL_SELECT_OTHER_SUPPLIER { get { return Utils.GetCustomSQL("_SQL_SELECT_OTHER_SUPPLIER", _SQL_SELECT_OTHER_SUPPLIER); } }

        public List<BrandModel> GetLeadBrands()
        {
            return DC.Database.SqlQuery<BrandModel>(SQL_SELECT_LEAD_BRAND).ToList();
        }

        public List<BankModel> GetBanks()
        {
            return DC.Database.SqlQuery<BankModel>(SQL_SELECT_BANK).ToList();
        }

        public List<BankCodeModel> GetBankCodes(int bankID)
        {
            return DC.Database.SqlQuery<BankCodeModel>(SQL_SELECT_BANK_CODE, bankID).ToList();
        }

        public List<SupplierModel> GetPrimarySuppliers(string personID)
        {
            return DC.Database.SqlQuery<SupplierModel>(SQL_SELECT_PRIMARY_SUPPLIER, personID).ToList();
        }

        public List<SupplierModel> GetOtherSuppliers(string personID)
        {
            return DC.Database.SqlQuery<SupplierModel>(SQL_SELECT_OTHER_SUPPLIER, personID).ToList();
        }
    }
}