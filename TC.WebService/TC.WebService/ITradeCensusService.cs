using System.ServiceModel;

namespace TradeCensus
{
    [ServiceContract]
    public interface ITradeCensusService : 
        IPersonService, 
        IProvinceService, 
        IConfigService,
        IOutletService,
        IBorderService
    {}    
}