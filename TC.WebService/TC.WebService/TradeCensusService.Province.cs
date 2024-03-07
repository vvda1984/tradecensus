using System;
using System.ServiceModel.Web;
using TradeCensus.Shared;

namespace TradeCensus
{
    public partial class TradeCensusService
    {
        [WebInvoke(Method = "POST", UriTemplate = "provinces/getall", ResponseFormat = WebMessageFormat.Json)]
        public ProvinceResponse GetProvinces()
        {
            _logger.Debug("Receive get provinces request");
            try
            {
                IProvinceService service = DependencyResolver.Resolve<IProvinceService>();
                return service.GetProvinces();
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, "Cannot get provinces");
                return new ProvinceResponse
                {
                    Status = Constants.ErrorCode,
                    ErrorMessage = "Service internal error",
                };
            }
        }

        [WebInvoke(Method = "POST", UriTemplate = "provinces/getdistricts/{provinceGeoID}", ResponseFormat = WebMessageFormat.Json)]
        public DistrictResponse GetDistricts(string provinceGeoID)
        {
            _logger.Debug("Receive get district request");
            try
            {
                IProvinceService service = DependencyResolver.Resolve<IProvinceService>();
                return service.GetDistricts(provinceGeoID);
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, "Cannot get districts");
                return new DistrictResponse
                {
                    Status = Constants.ErrorCode,
                    ErrorMessage = "Service internal error",
                };
            }
        }

        [WebInvoke(Method = "POST", UriTemplate = "provinces/getleadbrands", ResponseFormat = WebMessageFormat.Json)]
        public BrandResponse GetLeadBrands()
        {
            _logger.Debug("Receive get lead brand request");
            try
            {
                IProvinceService service = DependencyResolver.Resolve<IProvinceService>();
                return service.GetLeadBrands();
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, "Cannot get lead brand");
                return new BrandResponse
                {
                    Status = Constants.ErrorCode,
                    ErrorMessage = "Service internal error",
                };
            }
        }

        [WebInvoke(Method = "POST", UriTemplate = "provinces/getbanks", ResponseFormat = WebMessageFormat.Json)]
        public BankResponse GetBanks()
        {
            _logger.Debug("Receive get bank request");
            try
            {
                IProvinceService service = DependencyResolver.Resolve<IProvinceService>();
                return service.GetBanks();
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, "Cannot get bank");
                return new BankResponse
                {
                    Status = Constants.ErrorCode,
                    ErrorMessage = "Service internal error",
                };
            }
        }

        [WebInvoke(Method = "POST", UriTemplate = "provinces/getbankcodes/{bankID}", ResponseFormat = WebMessageFormat.Json)]
        public BankCodeResponse GetBankCodes(string bankID)
        {
            _logger.Debug("Receive get bank code request");
            try
            {
                IProvinceService service = DependencyResolver.Resolve<IProvinceService>();
                return service.GetBankCodes(bankID);
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, "Cannot get bank code");
                return new BankCodeResponse
                {
                    Status = Constants.ErrorCode,
                    ErrorMessage = "Service internal error",
                };
            }
        }

        [WebInvoke(Method = "POST", UriTemplate = "provinces/primarysuppliers/{personID}", ResponseFormat = WebMessageFormat.Json)]
        public SupplierResponse GetPrimarySuppliers(string personID)
        {
            _logger.Debug("Receive get primary supplier request");
            try
            {
                IProvinceService service = DependencyResolver.Resolve<IProvinceService>();
                return service.GetPrimarySuppliers(personID);
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, "Cannot get primary supplier");
                return new SupplierResponse
                {
                    Status = Constants.ErrorCode,
                    ErrorMessage = "Service internal error",
                };
            }
        }

        [WebInvoke(Method = "POST", UriTemplate = "provinces/othersuppliers/{personID}", ResponseFormat = WebMessageFormat.Json)]
        public SupplierResponse GetOtherSuppliers(string personID)
        {
            _logger.Debug("Receive get other supplier request");
            try
            {
                IProvinceService service = DependencyResolver.Resolve<IProvinceService>();
                return service.GetOtherSuppliers(personID);
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, "Cannot get other supplier");
                return new SupplierResponse
                {
                    Status = Constants.ErrorCode,
                    ErrorMessage = "Service internal error",
                };
            }
        }
    }
}