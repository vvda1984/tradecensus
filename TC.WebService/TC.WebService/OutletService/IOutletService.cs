using System.ServiceModel;

namespace TradeCensus
{
    [ServiceContract]
    public interface IOutletService : ITCService
    {
        //[OperationContract]
        //GetOutletIDResponse GetOutletsByProvince(string personID, string provinceID);

        //[OperationContract]
        //GetOutletResponse GetOutletByID(string personID, string id);

        [OperationContract]
        GetOutletTypeResponse GetOutletTypes();

        [OperationContract]
        GetOutletListResponse GetNearbyOutlets(string personID, string password, string lat, string lng, string meter, string count, string status);

        [OperationContract]
        SaveOutletResponse SaveOutlet(string personID, string password, OutletModel item);
        
        //[OperationContract]        
        //SaveImageResponse SaveImage();

        //[OperationContract]
        //GetImageResponse GetImage(string outletID, string index);

        //[OperationContract]
        //GetOutletListResponse DownloadOutlets(string personID, string provinceID, string from, string to);

        [OperationContract]
        int GetTotalProvincesCount(string personID, string password, string provinceID);

        [OperationContract]
        string DownloadOutletsZip(string personID, string password, string provinceID, string from, string to);

        //[OperationContract]
        //byte[] DownloadOutletsZipByte(string personID, string provinceID, string from, string to);

        //[OperationContract]
        //GetImageResponse DownloadImageBase64(string personID, string outletID, string index);

        //[OperationContract]
        //Response UploadImageBase64(string personID, string outletID, string index, string image);

        [OperationContract]
        SyncOutletResponse SyncOutlets(string personID, string password, OutletModel[] outlets);

        [OperationContract]
        GetOutletImagesResponse GetImages(string personID, string password, string outletID);

        //[OperationContract]
        //int GetNumberOfImages(string outletID);
    }
}