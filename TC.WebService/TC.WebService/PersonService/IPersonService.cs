using System.ServiceModel;
using System.Web.Services;

namespace TradeCensus
{
    [ServiceContract]
    public interface IPersonService 
    {     
        [OperationContract]       
        LoginResponse Login(string username, string password);

        [OperationContract]
        Response ChangePassword(string token, string personid, string oldpassword, string newpassword);

        [OperationContract]
        Response ResetPassword(string token, string personid, string password);

        [OperationContract]
        Response Ping(string deviceinfo);

        [OperationContract]
        GetSalesmanResponse GetSalesmansOfAuditor(string personid,string password);
    }
}
