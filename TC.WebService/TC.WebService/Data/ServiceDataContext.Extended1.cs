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
        const string _SQL_SELECT_PRIMARY_SUPPLIER = "SELECT distinct '1' as PrimarySupplier, s.ID as SupplierID, s.Name + ' - ' + CONCAT_WS( ', ',s.AddLine, s.AddLine2, s.Ward, s.District, c.Name ) as SupplierName FROM vwPrimarySupplier s WITH (NOLOCK) JOIN Province c WITH (NOLOCK) on c.ID = s.ProvinceID LEFT JOIN Person p WITH (NOLOCK) ON p.ZoneID = s.ZoneID WHERE p.ID is null or p.ID = @p0 order by SupplierName";
        const string _SQL_SELECT_OTHER_SUPPLIER = "SELECT distinct '0' as PrimarySupplier, s.ID as SupplierID, s.Name + ' - ' + CONCAT_WS( ', ',s.AddLine, s.AddLine2, s.Ward, s.District, c.Name ) as SupplierName FROM vwOtherSupplier s WITH (NOLOCK) JOIN Province c WITH (NOLOCK) on c.ID = s.ProvinceID LEFT JOIN Person p WITH (NOLOCK) ON p.ZoneID = s.ZoneID WHERE p.ID is null or p.ID = @p0 order by SupplierName";
        const string _SQL_SELECT_USER_NEXT_ROLE = "SELECT r.Role, p.* FROM PersonRole r WITH (NOLOCK) JOIN Person p WITH (NOLOCK) ON p.ID = r.PersonID LEFT JOIN ( SELECT  r.Role as CurrentRole FROM PersonRole r WHERE PersonID = @p0 ) c on 1 = 1 WHERE 1 = CASE WHEN c.CurrentRole = 0 AND r.Role in ( 1, 101 ) THEN 1 WHEN c.CurrentRole = 2 AND r.Role in ( 3, 103) THEN 1 WHEN c.CurrentRole IN ( 1, 101, 3, 103 ) AND r.Role in ( 4, 104) THEN 1 ELSE 0 END";

        static string SQL_SELECT_LEAD_BRAND { get { return Utils.GetCustomSQL("SQL_SELECT_LEADBRAND", _SQL_SELECT_LEAD_BRAND); } }
        static string SQL_SELECT_BANK { get { return Utils.GetCustomSQL("SQL_SELECT_BANK", _SQL_SELECT_BANK); } }
        static string SQL_SELECT_BANK_CODE { get { return Utils.GetCustomSQL("SQL_SELECT_BANK_CODE", _SQL_SELECT_BANK_CODE); } }
        static string SQL_SELECT_PRIMARY_SUPPLIER { get { return Utils.GetCustomSQL("_SQL_SELECT_PRIMARY_SUPPLIER", _SQL_SELECT_PRIMARY_SUPPLIER); } }
        static string SQL_SELECT_OTHER_SUPPLIER { get { return Utils.GetCustomSQL("_SQL_SELECT_OTHER_SUPPLIER", _SQL_SELECT_OTHER_SUPPLIER); } }

        public List<UserModel> GetPersonsoOfNextRoles(int personID)
        {
            return DC.Database.SqlQuery<UserModel>(_SQL_SELECT_USER_NEXT_ROLE, personID).ToList();
        }

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

        public void InsertOrUpdateOutletExtend(OutletModel outlet)
        {
            DC.Database.ExecuteSqlCommand(
                    @"INSERT INTO OutletExtend ( OutletID ) 
                    SELECT @p0 as OutletID 
                    WHERE NOT EXISTS ( SELECT 1 FROM OutletExtend WHERE OutletID = @p0 );
                    UPDATE OutletExtend
                    SET		
	                    LeadBrandID			= @p1,
	                    VisitFrequency		= @p2,
	                    PreferredVisitWeek	= @p3,
	                    PreferredVisitDay	= @p4,
	                    LegalInformation	= @p5,
	                    BusinessOwner		= @p6,
	                    PaymentInformation	= @p7,
	                    Beneficiary			= @p8,
	                    CitizenID			= @p9,
	                    CitizenFrontImage	= @p10,
	                    CitizenRearImage	= @p11,
	                    PersonalTaxID		= @p12,
	                    BankID				= @p13,
	                    BankCodeID			= @p14
                    WHERE 
	                    OutletID = @p0;",
                    outlet.ID,
                    outlet.LeadBrandID,
                    outlet.VisitFrequency,
                    outlet.PreferredVisitWeek,
                    outlet.PreferredVisitDay,
                    outlet.LegalInformation,
                    outlet.BusinessOwner,
                    outlet.PaymentInformation,
                    outlet.Beneficiary,
                    outlet.CitizenID,
                    outlet.CitizenFrontImage,
                    outlet.CitizenRearImage,
                    outlet.PersonalTaxID,
                    outlet.BankID,
                    outlet.BankCodeID);

            if (!string.IsNullOrWhiteSpace(outlet.SupplierJson))
            {
                try
                {
                    var suppliers = Newtonsoft.Json.JsonConvert.DeserializeObject<SupplierModel[]>(outlet.SupplierJson);

                    var primarySupplier = suppliers.FirstOrDefault(x => x.PrimarySupplier == "1");
                    if (primarySupplier != null)
                    {
                        DC.Database.ExecuteSqlCommand(
                           @"INSERT INTO OutletSupplier ( OutletID, PrimarySupplier ) 
                            SELECT 
	                            @p0 as OutletID,
	                            '1'	as PrimarySupplier
                            WHERE 
	                            NOT EXISTS ( SELECT 1 FROM OutletSupplier WHERE OutletID = @p0 AND PrimarySupplier = '1' );
                            UPDATE OutletSupplier
                            SET		
	                            SupplierID = @p1,
	                            SupplierName = @p2
                            WHERE 
	                            OutletID = @p0 AND PrimarySupplier = '1';",
                               outlet.ID,
                               primarySupplier.SupplierID,
                               primarySupplier.SupplierName);
                    }

                    var otherSuppliers = suppliers.Where(x => x.PrimarySupplier != "1").ToList();
                    if (!otherSuppliers.Any())
                    {
                        DC.Database.ExecuteSqlCommand("DELETE FROM OutletSupplier WHERE OutletID = @p0 AND PrimarySupplier = '0';", outlet.ID);
                    }
                    else
                    {
                        foreach (var ss in otherSuppliers)
                        {
                            DC.Database.ExecuteSqlCommand(
                                @"INSERT INTO OutletSupplier ( OutletID, PrimarySupplier, SupplierID, SupplierName ) 
                                SELECT 
	                                @p0 as OutletID,
	                                '0'	as PrimarySupplier,
	                                @p1	as SupplierID,
	                                @p2	as SupplierName
                                WHERE 
	                                NOT EXISTS ( SELECT 1 FROM OutletSupplier WHERE OutletID = @p0 AND PrimarySupplier = '0' AND SupplierID = @p1 );",
                                outlet.ID,
                                ss.SupplierID,
                                ss.SupplierName);
                        }

                        var ids = string.Join(",", otherSuppliers.Select(x => x.SupplierID).Distinct());
                        DC.Database.ExecuteSqlCommand($"DELETE FROM OutletSupplier WHERE OutletID = @p0 AND PrimarySupplier = '0' AND SupplierID NOT IN ( {ids} );", outlet.ID);
                    }
                }
                catch
                {
                    // do nothing.
                }
            }
        }

        public List<ServerConfig> GetServerConfig()
        {
            return DC.Database.SqlQuery<ServerConfig>("select * from ServerConfig").ToList();
        }
    }
}