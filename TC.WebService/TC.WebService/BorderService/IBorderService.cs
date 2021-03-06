﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.Text;

namespace TradeCensus
{
    [ServiceContract]
    public interface IBorderService
    {
        [OperationContract]
        GetBorderArrayResponse GetBorderByParent(string parentID);

        [OperationContract]
        GetBorderResponse GetBorder(string id);

        [OperationContract]
        GetBorderArrayResponse GetBorderByParentName(string parentName);

        [OperationContract]
        GetBorderArrayResponse DownloadBorders(string provinceID, string provinceName);

        [OperationContract]
        GetBorderArrayResponse GetDistrictBorders(string provinceID);

        [OperationContract]
        GetBorderArrayResponse GetWardBorders(string provinceID, string districtName);
    }
}
