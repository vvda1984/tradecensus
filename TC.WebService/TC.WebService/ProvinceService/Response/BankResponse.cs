using System.Runtime.Serialization;

namespace TradeCensus.Shared
{
    [DataContract]
    public class BankResponse : Response<BankModel>
    { }
}