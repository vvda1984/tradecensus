using System.ServiceModel;

namespace TradeCensus
{
    [ServiceContract]
    public interface IOutletService
    {     
        [OperationContract]
        OutletResponse GetOutletIDsByProvince(string provinceID);

        [OperationContract]
        GetOutletResponse GetOutletByID(string id);
    }
}
