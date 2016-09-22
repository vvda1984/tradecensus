using System.ServiceModel;

namespace TradeCensus
{
    [ServiceContract]
    public interface IConfigService : ITCService
    {     
        [OperationContract]
        ConfigResponse GetConfig();

        [OperationContract]
        CheckVersionResponse GetVersion(string version);
    }
}
