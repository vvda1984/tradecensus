﻿using System.ServiceModel;

namespace TradeCensus
{
    // NOTE: You can use the "Rename" command on the "Refactor" menu to change the interface name "IService1" in both code and config file together.
    [ServiceContract]
    public interface ITradeCensusService : 
        IPersonService, 
        IProvinceService, 
        IConfigService,
        IOutletService
    {
        [OperationContract]
        Response Ping(string deviceinfo);
    }    
}