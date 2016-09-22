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
        ILogger _logger = Global.CurrentContext.LogFactory.GetLogger("Service");

        #region Person Service

        [WebInvoke(Method = "POST", UriTemplate = "login/{username}/{password}", ResponseFormat = WebMessageFormat.Json)]
        public LoginResponse Login(string username, string password)
        {
            _logger.Debug("Receive login resquest");
            try
            {
                IPersonService service = Global.CurrentContext.ServiceFactory.GetService<IPersonService>();
                return service.Login(username, password);
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, "Cannot get PersonService");
                return new LoginResponse
                {
                    Status = Constants.ErrorCode,
                    ErrorMessage = "Service internal error",
                };
            }
        }

        [WebInvoke(Method = "POST", UriTemplate = "changepassword/{token}/{personid}/{oldpassword}/{newpassword}", ResponseFormat = WebMessageFormat.Json)]
        public Response ChangePassword(string token, string personid, string oldpassword, string newpassword)
        {
            _logger.Debug("Receive change password resquest");
            try
            {
                IPersonService service = Global.CurrentContext.ServiceFactory.GetService<IPersonService>();
                return service.ChangePassword(token, personid, oldpassword, newpassword);
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, "Cannot change password");
                return new LoginResponse
                {
                    Status = Constants.ErrorCode,
                    ErrorMessage = "Service internal error",
                };
            }
        }

        [WebInvoke(Method = "POST", UriTemplate = "resetpassword/{token}/{personid}/{password}", ResponseFormat = WebMessageFormat.Json)]
        public Response ResetPassword(string token, string personid, string password)
        {
            _logger.Debug("Receive reset password resquest");
            try
            {
                IPersonService service = Global.CurrentContext.ServiceFactory.GetService<IPersonService>();
                return service.ResetPassword(token, personid, password);
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, "Cannot reset password resquest");
                return new LoginResponse
                {
                    Status = Constants.ErrorCode,
                    ErrorMessage = "Service internal error",
                };
            }
        }

        [WebInvoke(Method = "POST", UriTemplate = "ping/{deviceinfo}", ResponseFormat = WebMessageFormat.Json)]
        public Response Ping(string deviceinfo)
        {
            _logger.Debug("Receive ping resquest");
            try
            {
                IPersonService service = Global.CurrentContext.ServiceFactory.GetService<IPersonService>();
                return service.Ping(deviceinfo);
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, "Cannot reset password resquest");
                return new Response
                {
                    Status = Constants.ErrorCode,
                    ErrorMessage = "Service internal error",
                };
            }
        }

        #endregion

        #region Config Service

        [WebInvoke(Method = "POST", UriTemplate = "config/getall", ResponseFormat = WebMessageFormat.Json)]
        public ConfigResponse GetConfig()
        {
            _logger.Debug("Receive get config request");
            try
            {
                IConfigService service = Global.CurrentContext.ServiceFactory.GetService<IConfigService>();
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
                IConfigService service = Global.CurrentContext.ServiceFactory.GetService<IConfigService>();
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

        #endregion

        #region Province Service

        [WebInvoke(Method = "POST", UriTemplate = "provinces/getall", ResponseFormat = WebMessageFormat.Json)]
        public ProvinceResponse GetProvinces()
        {
            _logger.Debug("Receive get provinces request");
            try
            {
                IProvinceService service = Global.CurrentContext.ServiceFactory.GetService<IProvinceService>();
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

        #endregion

        #region Outlet Service

        [WebInvoke(Method = "POST", UriTemplate = "outlet/getoutlettypes", ResponseFormat = WebMessageFormat.Json)]
        public GetOutletTypeResponse GetOutletTypes()
        {
            _logger.Debug("Receive get outlets types request");
            try
            {
                IOutletService service = Global.CurrentContext.ServiceFactory.GetService<IOutletService>();
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
                IOutletService service = Global.CurrentContext.ServiceFactory.GetService<IOutletService>();
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
                IOutletService service = Global.CurrentContext.ServiceFactory.GetService<IOutletService>();
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
                IOutletService service = Global.CurrentContext.ServiceFactory.GetService<IOutletService>();
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
                IOutletService service = Global.CurrentContext.ServiceFactory.GetService<IOutletService>();
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
                IOutletService service = Global.CurrentContext.ServiceFactory.GetService<IOutletService>();
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
                IOutletService service = Global.CurrentContext.ServiceFactory.GetService<IOutletService>();
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

        #endregion

        #region Border Service

        [WebInvoke(Method = "POST", UriTemplate = "border/getsubborders/{parentID}", ResponseFormat = WebMessageFormat.Json)]
        public GetBorderArrayResponse GetBorderByParent(string parentID)
        {
            _logger.Debug("Receive get border by parent request");
            try
            {
                IBorderService service = Global.CurrentContext.ServiceFactory.GetService<IBorderService>();
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
                IBorderService service = Global.CurrentContext.ServiceFactory.GetService<IBorderService>();
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
                IBorderService service = Global.CurrentContext.ServiceFactory.GetService<IBorderService>();
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

        #endregion
    }
}
