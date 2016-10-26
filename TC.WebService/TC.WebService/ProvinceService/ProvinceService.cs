using System;
using System.Collections.Generic;
using System.Linq;
using TradeCensus.Shared;

namespace TradeCensus
{
    public class ProvinceService : TradeCensusServiceBase, IProvinceService
    {
        public ProvinceService() : base("Province")
        {
        }

        public GetDistrictsResponse GetDistricts(string provinceGeoID)
        {
            GetDistrictsResponse resp = new GetDistrictsResponse { Items = new List<DistrictModel>() };
            try
            {
                IBorderService borderService = DependencyResolver.Resolve<IBorderService>();
                var response = borderService.GetBorderByParent(provinceGeoID);
                if(response.Status != Constants.ErrorCode)
                    foreach (var district in response.Items)
                    {
                        var districtModel = new DistrictModel()
                        {
                            Id = district.ID.ToString(),
                            Name = district.Name,
                            Wards = new List<WardModel>(),
                        };
                        resp.Items.Add(districtModel);

                        var responseWard = borderService.GetBorderByParent(district.ID.ToString());
                        if (response.Status != Constants.ErrorCode)
                            foreach (var ward in responseWard.Items)
                            {
                                var wardModel = new WardModel()
                                {
                                    Id = ward.ID.ToString(),
                                    Name = ward.Name,
                                };
                                districtModel.Wards.Add(wardModel);
                            }
                    }
            }
            catch (Exception ex)
            {
                resp.Status = Constants.ErrorCode;
                resp.ErrorMessage = ex.Message;
            }
            return resp;
        }

        public ProvinceResponse GetProvinces()
        {
            ProvinceResponse resp = new ProvinceResponse {Items = new List<ProvinceModel>() };
            try
            {
                _logger.Debug("Get all provinces");
                foreach (var item in DC.Provinces)
                    resp.Items.Add(new ProvinceModel {
                        Id = item.ID,
                        Name = item.Name,
                        ReferenceGeoID = item.RefGeoID != null ? item.RefGeoID.Value : 0,

                    });
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