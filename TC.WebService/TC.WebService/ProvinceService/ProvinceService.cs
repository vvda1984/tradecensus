using System;
using System.Linq;
using TradeCensus.Shared;

namespace TradeCensus
{
    public class ProvinceService : TradeCensusServiceBase, IProvinceService
    {
        public ProvinceService() : base("Province")
        {
        }

        public ProvinceResponse GetProvinces()
        {
            ProvinceResponse resp = new ProvinceResponse();
            try
            {
                _logger.Debug("Get all provinces");
                resp.Items = DC.Provinces.ToList();
            }
            catch (Exception ex)
            {
                resp.Status = Constants.ErrorCode;
                resp.ErrorMessage = ex.Message;
            }
            return resp;
        }
    }
}