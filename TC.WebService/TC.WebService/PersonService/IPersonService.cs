using System.ServiceModel;
using System.Web.Services;

namespace TradeCensus
{
    [ServiceContract]
    public interface IPersonService
    {     
        [OperationContract]       
        LoginResponse Login(string username, string pass);

        [OperationContract]
        LoginResponse ChangePassword(string token, string personid, string oldpassword, string newpassword);

        [OperationContract]
        LoginResponse ResetPassword(string token, string personid, string password);
    }
}
