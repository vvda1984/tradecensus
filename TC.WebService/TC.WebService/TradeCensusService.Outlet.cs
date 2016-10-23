using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel.Web;
using System.Web;

namespace TradeCensus
{
    public partial class TradeCensusService
    {
        [WebInvoke(Method = "POST", UriTemplate = "outlet/getoutlettypes", ResponseFormat = WebMessageFormat.Json)]
        public GetOutletTypeResponse GetOutletTypes()
        {
            _logger.Debug("Receive get outlets types request");
            try
            {
                IOutletService service = DependencyResolver.Resolve<IOutletService>();
                return service.GetOutletTypes();
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, "Process request error");
                return new GetOutletTypeResponse
                {
                    Status = Constants.ErrorCode,
                    ErrorMessage = "Service internal error",
                };
            }
        }

        [WebInvoke(Method = "POST", UriTemplate = "outlet/getoutlets/{personID}/{password}/{lat}/{lng}/{meter}/{count}/{status}", ResponseFormat = WebMessageFormat.Json)]
        public GetOutletListResponse GetNearbyOutlets(string personID, string password, string lat, string lng, string meter, string count, string status)
        {
            _logger.Debug("Receive get near-by outlets request");
            try
            {
                IOutletService service = DependencyResolver.Resolve<IOutletService>();
                return service.GetNearbyOutlets(personID, password, lat, lng, meter, count, status);
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, "Process request error");
                return new GetOutletListResponse
                {
                    Status = Constants.ErrorCode,
                    ErrorMessage = "Service internal error",
                };
            }
        }

        [WebInvoke(Method = "POST", UriTemplate = "outlet/save/{personID}/{password}", ResponseFormat = WebMessageFormat.Json)]
        public SaveOutletResponse SaveOutlet(string personID, string password, OutletModel item)
        {
            _logger.Debug("Receive save outlet request");
            try
            {
                IOutletService service = DependencyResolver.Resolve<IOutletService>();
                return service.SaveOutlet(personID, password, item);
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, "Process request error");
                return new SaveOutletResponse
                {
                    Status = Constants.ErrorCode,
                    ErrorMessage = "Service internal error",
                };
            }
        }

        [WebInvoke(Method = "POST", UriTemplate = "outlet/saveoutlets/{personID}/{password}", ResponseFormat = WebMessageFormat.Json)]
        public SyncOutletResponse SyncOutlets(string personID, string password, OutletModel[] items)
        {
            _logger.Debug("Receive sync outlets request");
            try
            {
                IOutletService service = DependencyResolver.Resolve<IOutletService>();
                return service.SyncOutlets(personID, password, items);
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, "Process request error");
                return new SyncOutletResponse
                {
                    Status = Constants.ErrorCode,
                    ErrorMessage = "Service internal error",
                };
            }
        }

        [WebInvoke(Method = "POST", UriTemplate = "outlet/downloadzip/{personID}/{password}/{provinceID}/{from}/{to}", ResponseFormat = WebMessageFormat.Json)]
        public string DownloadOutletsZip(string personID, string password, string provinceID, string from, string to)
        {
            _logger.Debug("Receive download outlets zip request");
            try
            {
                IOutletService service = DependencyResolver.Resolve<IOutletService>();
                return service.DownloadOutletsZip(personID, password, provinceID, from, to);
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, "Process request error");
                return "";
            }
        }

        [WebInvoke(Method = "POST", UriTemplate = "outlet/gettotalbyprovince/{personID}/{password}/{provinceID}", ResponseFormat = WebMessageFormat.Json)]
        public int GetTotalProvincesCount(string personID, string password, string provinceID)
        {
            _logger.Debug("Receive get total province request");
            try
            {
                IOutletService service = DependencyResolver.Resolve<IOutletService>();
                return service.GetTotalProvincesCount(personID, password, provinceID);
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, "Process request error");
                return 0;
            }
        }

        [WebInvoke(Method = "POST", UriTemplate = "outlet/getimages/{personID}/{password}/{outletID}", ResponseFormat = WebMessageFormat.Json)]
        public GetOutletImagesResponse GetImages(string personID, string password, string outletID)
        {
            _logger.Debug("Receive get image request");
            try
            {
                IOutletService service = DependencyResolver.Resolve<IOutletService>();
                return service.GetImages(personID, password, outletID);
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, "Process request error");
                return new GetOutletImagesResponse
                {
                    Status = Constants.ErrorCode,
                    ErrorMessage = "Service internal error",
                };
            }
        }
    }
}