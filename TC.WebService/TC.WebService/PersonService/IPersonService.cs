using System.ServiceModel;
using System.Web.Services;

namespace TradeCensus
{
    [ServiceContract]
    public interface IPersonService
    {     
        [OperationContract]       
        LoginResponse Login(string id, string pass);
    }
}
