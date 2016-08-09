using System.Collections.Generic;
using System.ServiceModel;

namespace TradeCensus
{
    [ServiceContract]
    public interface IOutletService
    {
        [OperationContract]
        GetOutletIDResponse GetOutletsByProvince(string personID, string provinceID);

        [OperationContract]
        GetOutletResponse GetOutletByID(string personID, string id);

        [OperationContract]
        GetOutletTypeResponse GetOutlets();

        [OperationContract]
        GetOutletListResponse GetNearbyOutlets(string personID, string lat, string lng, string meter, string count, string status);

        [OperationContract]
        SaveOutletResponse SaveOutlet(OutletModel item);
        
        [OperationContract]        
        SaveImageResponse SaveImage();

        [OperationContract]
        GetImageResponse GetImage(string outletID, string index);

        [OperationContract]
        GetOutletListResponse DownloadOutlets(string personID, string provinceID, string from, string to);

        [OperationContract]
        int GetTotalProvincesCount(string personID, string provinceID);

        [OperationContract]
        string DownloadOutletsZip(string personID, string provinceID, string from, string to);

        [OperationContract]
        byte[] DownloadOutletsZipByte(string personID, string provinceID, string from, string to);

        [OperationContract]
        GetImageResponse DownloadImageBase64(string personID, string outletID, string index);

        [OperationContract]
        Response UploadImageBase64(string personID, string outletID, string index, string image);

        [OperationContract]
        SyncOutletResponse SyncOutlets(OutletModel[] outlets);
    }
}