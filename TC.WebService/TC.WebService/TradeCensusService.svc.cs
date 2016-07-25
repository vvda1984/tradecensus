using System;
using System.IO;
using System.ServiceModel.Activation;
using System.ServiceModel.Web;
using System.Web;
using Newtonsoft.Json.Linq;
using TradeCensus.Shared;

namespace TradeCensus
{
    //http://localhost:33333/TradeCensusService.svc/outlet/saveoutlets
    [AspNetCompatibilityRequirements(RequirementsMode = AspNetCompatibilityRequirementsMode.Allowed)]
    public partial class TradeCensusService : ITradeCensusService
    {             
        //[WebGet(UriTemplate = "login/{id}/{pass}", ResponseFormat = WebMessageFormat.Json)]
        [WebInvoke(Method = "POST", UriTemplate = "login/{username}/{pass}", ResponseFormat = WebMessageFormat.Json)]
        public LoginResponse Login(string username, string pass)
        {
            using(var repo = new PersonRepo())
            {
                LoginResponse resp = new LoginResponse();
                try
                {
                    resp.People = repo.Login(username, pass);
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
        [WebInvoke(Method = "POST", UriTemplate = "outlet/getbyprovince/{personID}/{provinceID}", ResponseFormat = WebMessageFormat.Json)]
        public GetOutletIDResponse GetOutletsByProvince(string personID, string provinceID)
        {
            using (var repo = new OutletRepo())
            {
                var resp = new GetOutletIDResponse();
                try
                {
                    resp.Outlets = repo.GetByProvinceID(int.Parse(personID), provinceID);
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
        [WebInvoke(Method = "POST", UriTemplate = "outlet/get/{personID}/{id}", ResponseFormat = WebMessageFormat.Json)]
        public GetOutletResponse GetOutletByID(string personID, string id)
        {
            using (var repo = new OutletRepo())
            {
                var resp = new GetOutletResponse();
                try
                {
                    resp.Item = repo.GetByID(int.Parse(personID), id);
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

        [WebInvoke(Method = "POST", UriTemplate = "outlet/getoutlets/{personID}/{lat}/{lng}/{meter}/{count}", ResponseFormat = WebMessageFormat.Json)]
        public GetOutletListResponse GetNearbyOutlets(string personID, string lat, string lng, string meter, string count)
        {            
            using (var repo = new OutletRepo())
            {
                var resp = new GetOutletListResponse();
                try
                {
                    resp.Items = repo.GetOutletsByLocation(int.Parse(personID),
                                                        Convert.ToDouble(lat),
                                                        Convert.ToDouble(lng),
                                                        Convert.ToDouble(meter),
                                                        Convert.ToInt32(count));
                }
                catch (Exception ex)
                {
                    resp.Status = Constants.ErrorCode;
                    resp.ErrorMessage = ex.Message;
                }
                return resp;
            }
        }
        
        [WebInvoke(Method = "POST", UriTemplate = "outlet/save", ResponseFormat = WebMessageFormat.Json)]
        public SaveOutletResponse SaveOutlet(OutletModel item)
        {
            using (var repo = new OutletRepo())
            {
                var resp = new SaveOutletResponse();
                try
                {
                    resp.ID = item.ID;
                    resp.RowID = repo.SaveOutlet(item); ;
                }
                catch (Exception ex)
                {
                    resp.Status = Constants.ErrorCode;
                    resp.ErrorMessage = ex.Message;
                }
                return resp;
            }
        }
        
        //public SaveImageResponse SaveImage(string fileKey, string outletID, string index, Stream stream)
        [WebInvoke(Method = "POST", UriTemplate = "outlet/uploadimage", ResponseFormat = WebMessageFormat.Json, BodyStyle = WebMessageBodyStyle.Wrapped)]
        public SaveImageResponse SaveImage()
        {
            using (var repo = new OutletRepo())
            {
                var resp = new SaveImageResponse();
                try
                {                   
                    HttpPostedFile file = HttpContext.Current.Request.Files["orderfile"];
                    if (file == null)
                        throw new Exception("File not found!");
                    string outletid = HttpContext.Current.Request.Params["outletid"];
                    string index = HttpContext.Current.Request.Params["index"];
                    string userid = HttpContext.Current.Request.Params["userid"];
                    resp.ImageThumb = repo.SaveImage(userid, outletid, index, file);
                }
                catch (Exception ex)
                {
                    resp.Status = Constants.ErrorCode;
                    resp.ErrorMessage = ex.Message;
                }
                return resp;
            }
        }

        [WebInvoke(Method = "POST", UriTemplate = "outlet/getimage/{outletID}/{index}", ResponseFormat = WebMessageFormat.Json)]
        public GetImageResponse GetImage(string outletID, string index)
        {
            using (var repo = new OutletRepo())
            {
                var resp = new GetImageResponse();
                try
                {
                    resp.Image = repo.GetImage(outletID, index);
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
