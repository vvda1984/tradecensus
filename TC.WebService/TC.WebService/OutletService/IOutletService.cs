using System.ServiceModel;

namespace TradeCensus
{
    [ServiceContract]
    public interface IOutletService
    {
        [OperationContract]
        GetOutletTypeResponse GetOutletTypes();

        [OperationContract]
        GetOutletListResponse GetNearbyOutlets(string personID, string password, string lat, string lng, string meter, string count, string status);

        [OperationContract]
        SaveOutletResponse SaveOutlet(string personID, string password, OutletModel item);

        [OperationContract]
        int GetTotalProvincesCount(string personID, string password, string provinceID);

        [OperationContract]
        string DownloadOutletsZip(string personID, string password, string provinceID, string from, string to);

        [OperationContract]
        SyncOutletResponse SyncOutlets(string personID, string password, OutletModel[] outlets);

        [OperationContract]
        GetOutletImagesResponse GetImages(string personID, string password, string outletID);

        [OperationContract]
        GetOutletListResponse SearchOutlet(string personID, string password, string outletID, string outletName);
    }
}