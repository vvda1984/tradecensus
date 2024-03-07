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

        static string SQL_SELECT_LEAD_BRAND { get { return Utils.GetCustomSQL("SQL_SELECT_LEADBRAND", _SQL_SELECT_LEAD_BRAND); } }
        static string SQL_SELECT_BANK { get { return Utils.GetCustomSQL("SQL_SELECT_BANK", _SQL_SELECT_BANK); } }
        static string SQL_SELECT_BANK_CODE { get { return Utils.GetCustomSQL("SQL_SELECT_BANK_CODE", _SQL_SELECT_BANK_CODE); } }

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
    }
}