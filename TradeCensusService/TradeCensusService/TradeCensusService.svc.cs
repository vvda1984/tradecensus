using System;
using System.ServiceModel.Web;
using System.Threading;
using TradeCensus.Shared;

namespace TradeCensus
{
    //http://localhost:33334/TradeCensusService.svc
    public partial class TradeCensusService : ITradeCensusService
    {             
        //[WebGet(UriTemplate = "login/{id}/{pass}", ResponseFormat = WebMessageFormat.Json)]
        [WebInvoke(Method = "POST", UriTemplate = "login/{id}/{pass}", ResponseFormat = WebMessageFormat.Json)]
        public LoginResponse Login(string id, string pass)
        {
#if DEBUG
            //Thread.Sleep(3000);
#endif
            using(var repo = new PersonRepo())
            {
                LoginResponse resp = new LoginResponse();
                try
                {
                    resp.People = repo.Get(id, pass);
                }
                catch (Exception ex)
                {
                    resp.Status = Constants.ErrorCode;
                    resp.ErrorMessage = ex.Message;
                }
                return resp;
            }
        }

        //[WebGet(UriTemplate = "provinces/getall", ResponseFormat = WebMessageFormat.Json)]
        [WebInvoke(Method = "POST", UriTemplate = "provinces/getall", ResponseFormat = WebMessageFormat.Json)]
        public ProvinceResponse GetProvinces()
        {
            using (var repo = new ProvinceRepo())
            {
                ProvinceResponse resp = new ProvinceResponse();
                try
                {
                    resp.Items = repo.GetAll();
                }
                catch (Exception ex)
                {
                    resp.Status = Constants.ErrorCode;
                    resp.ErrorMessage = ex.Message;
                }
                return resp;
            }
        }

        //[WebGet(UriTemplate = "config/getall", ResponseFormat = WebMessageFormat.Json)]
        [WebInvoke(Method = "POST", UriTemplate = "config/getall", ResponseFormat = WebMessageFormat.Json)]
        public ConfigResponse GetConfig()
        {
            using (var repo = new ConfigRepo())
            {
                ConfigResponse resp = new ConfigResponse();
                try
                {
                    resp.Items = repo.GetAll();
                }
                catch (Exception ex)
                {
                    resp.Status = Constants.ErrorCode;
                    resp.ErrorMessage = ex.Message;
                }
                return resp;
            }
        }

        //[WebGet(UriTemplate = "outlet/getbyprovince/{provinceID}", ResponseFormat = WebMessageFormat.Json)]
        [WebInvoke(Method = "POST", UriTemplate = "outlet/getbyprovince/{provinceID}", ResponseFormat = WebMessageFormat.Json)]
        public OutletResponse GetOutletIDsByProvince(string provinceID)
        {
            using (var repo = new OutletRepo())
            {
                var resp = new OutletResponse();
                try
                {
                    resp.IDs = repo.GetByProvinceID(provinceID);
                }
                catch (Exception ex)
                {
                    resp.Status = Constants.ErrorCode;
                    resp.ErrorMessage = ex.Message;
                }
                return resp;
            }
        }

        //[WebGet(UriTemplate = "outlet/get/{id}", ResponseFormat = WebMessageFormat.Json)]
        [WebInvoke(Method = "POST", UriTemplate = "outlet/get/{id}", ResponseFormat = WebMessageFormat.Json)]
        public GetOutletResponse GetOutletByID(string id)
        {
            using (var repo = new OutletRepo())
            {
                var resp = new GetOutletResponse();
                try
                {
                    resp.Item = repo.GetByID(id);
                }
                catch (Exception ex)
                {
                    resp.Status = Constants.ErrorCode;
                    resp.ErrorMessage = ex.Message;
                }
                return resp;
            }
        }

        //[WebGet(UriTemplate = "outlet/getoutlettypes", ResponseFormat = WebMessageFormat.Json)]
        [WebInvoke(Method = "POST", UriTemplate = "outlet/getoutlettypes", ResponseFormat = WebMessageFormat.Json)]
        public GetOutletTypeResponse GetOutlets()
        {
            using (var repo = new OutletRepo())
            {
                var resp = new GetOutletTypeResponse();
                try
                {
                    resp.Items = repo.GetAllOutletTypes();
                }
                catch (Exception ex)
                {
                    resp.Status = Constants.ErrorCode;
                    resp.ErrorMessage = ex.Message;
                }
                return resp;
            }
        }

        [WebInvoke(Method = "POST", UriTemplate = "outlet/getoutlets/{lat}/{lng}/{meter}/{count}", ResponseFormat = WebMessageFormat.Json)]
        public GetOutletListResponse GetOutletLists(string lat, string lng, string meter, string count)
        {
            //WebOperationContext.Current.

            using (var repo = new OutletRepo())
            {
                var resp = new GetOutletListResponse();
                try
                {
                    resp.Items = repo.GetOutletByLocation(Convert.ToDouble(lat), Convert.ToDouble(lng), Convert.ToDouble(meter), Convert.ToInt32(count));
                }
                catch (Exception ex)
                {
                    resp.Status = Constants.ErrorCode;
                    resp.ErrorMessage = ex.Message;
                }
                return resp;
            }
        }
    }
}
