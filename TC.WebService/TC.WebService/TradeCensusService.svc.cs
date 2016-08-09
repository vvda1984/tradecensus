using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.ServiceModel.Activation;
using System.ServiceModel.Web;
using System.Web;
using TradeCensus.Shared;
using TradeCensusService.Shared;

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

        [WebInvoke(Method = "POST", UriTemplate = "outlet/getoutlets/{personID}/{lat}/{lng}/{meter}/{count}/{status}", ResponseFormat = WebMessageFormat.Json)]
        public GetOutletListResponse GetNearbyOutlets(string personID, string lat, string lng, string meter, string count, string status)
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
                                                        Convert.ToInt32(count),
                                                        Convert.ToInt32(status));
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
                    var outlet = repo.SaveOutlet(item);
                    if(outlet != null)
                    {
                        resp.ID = outlet.ID;
                        resp.RowID = outlet.PRowID.ToString();
                    } 
                }
                catch (Exception ex)
                {
                    resp.Status = Constants.ErrorCode;
                    resp.ErrorMessage = ex.Message;
                }
                return resp;
            }
        }
        
        [WebInvoke(Method = "POST", UriTemplate = "outlet/uploadimage", ResponseFormat = WebMessageFormat.Json, BodyStyle = WebMessageBodyStyle.Wrapped)]
        public SaveImageResponse SaveImage()
        {
            //public SaveImageResponse SaveImage(string fileKey, string outletID, string index, Stream stream)
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

        [WebInvoke(Method = "POST", UriTemplate = "outlet/download/{personID}/{provinceID}/{from}/{to}", ResponseFormat = WebMessageFormat.Json)]
        public GetOutletListResponse DownloadOutlets(string personID, string provinceID, string from, string to)
        {
            using (var repo = new OutletRepo())
            {
                var resp = new GetOutletListResponse();
                try
                {
                    resp.Items = repo.DownloadOutlets(int.Parse(personID), provinceID, int.Parse(from), int.Parse(to));
                }
                catch (Exception ex)
                {
                    resp.Status = Constants.ErrorCode;
                    resp.ErrorMessage = ex.Message;
                }
                return resp;
            }
        }

        [WebInvoke(Method = "POST", UriTemplate = "outlet/downloadimagebase54/{personID}/{outletID}/{index}", ResponseFormat = WebMessageFormat.Json)]
        public GetImageResponse DownloadImageBase64(string personID, string outletID, string index)
        {
            using (var repo = new OutletRepo())
            {
                var resp = new GetImageResponse();
                try
                {
                    resp.Image = repo.DownloadImageBase64(int.Parse(personID), int.Parse(outletID), int.Parse(index));
                }
                catch (Exception ex)
                {
                    resp.Status = Constants.ErrorCode;
                    resp.ErrorMessage = ex.Message;
                }
                return resp;
            }
        }

        [WebInvoke(Method = "POST", UriTemplate = "outlet/uploadmagebase54/{personID}/{outletID}/{index}/{image}", ResponseFormat = WebMessageFormat.Json)]
        public Response UploadImageBase64(string personID, string outletID, string index, string image)
        {
            using (var repo = new OutletRepo())
            {
                var resp = new Response();
                try
                {
                    repo.UploadImageBase64(int.Parse(personID), int.Parse(outletID), int.Parse(index), image);
                }
                catch (Exception ex)
                {
                    resp.Status = Constants.ErrorCode;
                    resp.ErrorMessage = ex.Message;
                }
                return resp;
            }
        }

        [WebInvoke(Method = "POST", UriTemplate = "outlet/saveoutlets", ResponseFormat = WebMessageFormat.Json)]
        public SyncOutletResponse SyncOutlets(OutletModel[] items)
        {
            using (var repo = new OutletRepo())
            {
                var resp = new SyncOutletResponse();
                try
                {
                    List<SyncOutlet> dboutlets = new List<SyncOutlet>();
                    var error = repo.SaveOutlets(items, dboutlets);
                    resp.Outlets = dboutlets;
                    if (error !=null)
                    {
                        resp.Status = Constants.Warning;
                        resp.ErrorMessage = error.Message;
                    }
                }
                catch (Exception ex)
                {
                    resp.Status = Constants.ErrorCode;
                    resp.ErrorMessage = ex.Message;
                }
                return resp;
            }
        }

        [WebInvoke(Method = "POST", UriTemplate = "ping/{deviceinfo}", ResponseFormat = WebMessageFormat.Json)]
        public Response Ping(string deviceinfo)
        {
            Response res = new Response();
            try {
                var log = LogUtil.GetLogger("service");
                log.Debug(string.Format("Received ping from {0}", deviceinfo));
            }
            catch (Exception ex){
                res.ErrorMessage = ex.Message;
                res.Status = Constants.ErrorCode;
            }
            return res;
        }

        [WebInvoke(Method = "POST", UriTemplate = "outlet/downloadzip/{personID}/{provinceID}/{from}/{to}", ResponseFormat = WebMessageFormat.Json)]

        public string DownloadOutletsZip(string personID, string provinceID, string from, string to)
        {
            using (var repo = new OutletRepo())
            {
                Stopwatch sw = new Stopwatch();
                sw.Start();
                try
                {
                  
                    return repo.DownloadOutletsZip(int.Parse(personID), provinceID, int.Parse(from), int.Parse(to));
                }
                catch
                {
                    return null;
                }
                finally
                {
                    sw.Stop();
                }
            }
        }

        [WebInvoke(Method = "POST", UriTemplate = "outlet/gettotalbyprovince/{personID}/{provinceID}", ResponseFormat = WebMessageFormat.Json)]
        public int GetTotalProvincesCount(string personID, string provinceID)
        {
            using (var repo = new OutletRepo())
            {
                Stopwatch sw = new Stopwatch();
                sw.Start();
                try
                {

                    return repo.GetTotalProvincesCount(int.Parse(personID), provinceID);
                }
                catch
                {
                    return 0;
                }
                finally
                {
                    sw.Stop();
                }
            }
        }


        [WebInvoke(Method = "POST", UriTemplate = "outlet/downloadzipbyte/{personID}/{provinceID}/{from}/{to}", ResponseFormat = WebMessageFormat.Json)]

        public byte[] DownloadOutletsZipByte(string personID, string provinceID, string from, string to)
        {
            using (var repo = new OutletRepo())
            {
                Stopwatch sw = new Stopwatch();
                sw.Start();
                try
                {

                    return repo.DownloadOutletsZipByte(int.Parse(personID), provinceID, int.Parse(from), int.Parse(to));
                }
                catch
                {
                    return null;
                }
                finally
                {
                    sw.Stop();
                }
            }
        }
    }
}
