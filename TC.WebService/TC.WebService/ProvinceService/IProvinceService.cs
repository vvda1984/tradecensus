using System.ServiceModel;
using TradeCensus.Shared;

namespace TradeCensus
{
    [ServiceContract]
    public interface IProvinceService
    {
        [OperationContract]
        ProvinceResponse GetProvinces();

        [OperationContract]
        DistrictResponse GetDistricts(string provinceGeoID);

        [OperationContract]
        BrandResponse GetLeadBrands();

        [OperationContract]
        BankResponse GetBanks();

        [OperationContract]
        BankCodeResponse GetBankCodes(string bankID);
    }
}
