﻿using System.Collections.Generic;
using System.ServiceModel;

namespace TradeCensus
{
    [ServiceContract]
    public interface IOutletService
    {     
        [OperationContract]
        OutletResponse GetOutletIDsByProvince(string provinceID);

        [OperationContract]
        GetOutletResponse GetOutletByID(string id);

        [OperationContract]
        GetOutletTypeResponse GetOutlets();

        [OperationContract]
        GetOutletListResponse GetOutletLists(string lat, string lng, string meter, string count);

        [OperationContract]
        SaveOutletResponse SaveOutlet(OutletModel item);
    }
}