using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel.Web;
using System.Web;

namespace TradeCensus
{
    public partial class TradeCensusService
    {
        [WebInvoke(Method = "POST", UriTemplate = "border/getsubborders/{parentID}", ResponseFormat = WebMessageFormat.Json)]
        public GetBorderArrayResponse GetBorderByParent(string parentID)
        {
            _logger.Debug("Receive get border by parent request");
            try
            {
                IBorderService service = DependencyResolver.Resolve<IBorderService>();
                return service.GetBorderByParent(parentID);
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, "Process request error");
                return new GetBorderArrayResponse
                {
                    Status = Constants.ErrorCode,
                    ErrorMessage = "Service internal error",
                };
            }
        }

        [WebInvoke(Method = "POST", UriTemplate = "border/get/{id}", ResponseFormat = WebMessageFormat.Json)]
        public GetBorderResponse GetBorder(string id)
        {
            _logger.Debug("Receive get border request");
            try
            {
                IBorderService service = DependencyResolver.Resolve<IBorderService>();
                return service.GetBorder(id);
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, "Process request error");
                return new GetBorderResponse
                {
                    Status = Constants.ErrorCode,
                    ErrorMessage = "Service internal error",
                };
            }
        }

        [WebInvoke(Method = "POST", UriTemplate = "border/download/{provinceID}/{provinceName}", ResponseFormat = WebMessageFormat.Json)]
        public GetBorderArrayResponse DownloadBorders(string provinceID, string provinceName)
        {
            _logger.Debug("Receive download border request");
            try
            {
                IBorderService service = DependencyResolver.Resolve<IBorderService>();
                return service.DownloadBorders(provinceID, provinceName);
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, "Process request error");
                return new GetBorderArrayResponse
                {
                    Status = Constants.ErrorCode,
                    ErrorMessage = "Service internal error",
                };
            }
        }
    }
}