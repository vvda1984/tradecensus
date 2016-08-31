using System.ServiceModel;
using TradeCensus.Shared;

namespace TradeCensus
{
    [ServiceContract]
    public interface IProvinceService : ITCService
    {
        [OperationContract]
        ProvinceResponse GetProvinces();
    }
}
