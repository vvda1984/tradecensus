using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel.Web;
using System.Web;

namespace TradeCensus
{
    public partial class TradeCensusService
    {
        [WebInvoke(Method = "POST", UriTemplate = "config/getall", ResponseFormat = WebMessageFormat.Json)]
        public ConfigResponse GetConfig()
        {
            _logger.Debug("Receive get config request");
            try
            {
                IConfigService service = DependencyResolver.Resolve<IConfigService>();
                return service.GetConfig();
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, "Cannot get config");
                return new ConfigResponse
                {
                    Status = Constants.ErrorCode,
                    ErrorMessage = "Service internal error",
                };
            }
        }

        [WebInvoke(Method = "POST", UriTemplate = "config/getverion/{version}", ResponseFormat = WebMessageFormat.Json)]
        public CheckVersionResponse GetVersion(string version)
        {
            _logger.Debug("Receive get config request");
            try
            {
                IConfigService service = DependencyResolver.Resolve<IConfigService>();
                return service.GetVersion(version);
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, "Cannot get config");
                return new CheckVersionResponse
                {
                    Status = Constants.ErrorCode,
                    ErrorMessage = "Service internal error",
                };
            }
        }
    }
}