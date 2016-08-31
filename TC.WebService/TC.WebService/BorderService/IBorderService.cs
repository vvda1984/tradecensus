using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.Text;

namespace TradeCensus
{
    [ServiceContract]
    public interface IBorderService : ITCService
    {
        [OperationContract]
        GetBorderArrayResponse GetBorderByParent(string parentID);

        [OperationContract]
        GetBorderResponse GetBorder(string id);

        [OperationContract]
        GetBorderArrayResponse DownloadBorders(string provinceID, string provinceName);
    }
}
