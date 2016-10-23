using System.ServiceModel;
using TradeCensus.Shared;

namespace TradeCensus
{
    [ServiceContract]
    public interface IProvinceService
    {
        [OperationContract]
        ProvinceResponse GetProvinces();
    }
}
