using System.Collections.Generic;
using System.IO;
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
    }
}