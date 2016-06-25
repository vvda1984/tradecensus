using System.ServiceModel;

namespace TradeCensus
{
    [ServiceContract]
    public interface IPersonService
    {     
        [OperationContract]
        LoginResponse Login(string id, string pass);
    }
}
