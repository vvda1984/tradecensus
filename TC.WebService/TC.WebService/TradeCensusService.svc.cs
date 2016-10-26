using NLog;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.ServiceModel.Activation;
using System.ServiceModel.Web;
using System.Web;
using TradeCensus.Shared;

namespace TradeCensus
{
    [AspNetCompatibilityRequirements(RequirementsMode = AspNetCompatibilityRequirementsMode.Allowed)]
    public partial class TradeCensusService : ITradeCensusService
    {
        ILogger _logger = DependencyResolver.Resolve<ILogFactory>().GetLogger("Service");

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
        public GetDistrictsResponse GetDistricts(string provinceGeoID)
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
                return new GetDistrictsResponse
                {
                    Status = Constants.ErrorCode,
                    ErrorMessage = "Service internal error",
                };
            }
        }
    }
}
