using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel.Web;
using System.Web;

namespace TradeCensus
{
    public partial class TradeCensusService
    {
        [WebInvoke(Method = "POST", UriTemplate = "login/{username}/{password}", ResponseFormat = WebMessageFormat.Json)]
        public LoginResponse Login(string username, string password)
        {
            _logger.Debug("Receive login resquest");
            try
            {
                IPersonService service = DependencyResolver.Resolve<IPersonService>();
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
                IPersonService service = DependencyResolver.Resolve<IPersonService>();
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
                IPersonService service = DependencyResolver.Resolve<IPersonService>();
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
                IPersonService service = DependencyResolver.Resolve<IPersonService>();
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

        [WebInvoke(Method = "POST", UriTemplate = "getsalesmans/{personid}/{password}", ResponseFormat = WebMessageFormat.Json)]
        public GetSalesmanResponse GetSalesmansOfAuditor(string personid, string password)
        {
            _logger.Debug("Receive GetSalesmansOfAuditor resquest");
            try
            {
                IPersonService service = DependencyResolver.Resolve<IPersonService>();
                return service.GetSalesmansOfAuditor(personid, password);
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, "Cannot reset password resquest");
                return new GetSalesmanResponse
                {
                    Status = Constants.ErrorCode,
                    ErrorMessage = "Service internal error",
                };
            }
        }
    }
}