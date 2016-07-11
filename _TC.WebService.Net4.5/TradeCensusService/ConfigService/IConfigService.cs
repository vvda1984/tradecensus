using System.ServiceModel;

namespace TradeCensus
{
    [ServiceContract]
    public interface IConfigService
    {     
        [OperationContract]
        ConfigResponse GetConfig();
    }
}
