using System;
using System.Collections.Generic;
using System.Linq;
using TradeCensus.Shared;

namespace TradeCensus
{
    public class ProvinceService : TradeCensusServiceBase, IProvinceService
    {
        public ProvinceService() : base("Province")
        { }

        public DistrictResponse GetDistricts(string provinceGeoID)
        {
            DistrictResponse resp = new DistrictResponse { Items = new List<DistrictModel>() };
            try
            {
                IBorderService borderService = DependencyResolver.Resolve<IBorderService>();
                var response = borderService.GetBorderByParent(provinceGeoID);
                if (response.Status != Constants.ErrorCode)
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
            ProvinceResponse resp = new ProvinceResponse { Items = new List<ProvinceModel>() };
            try
            {
                var provinces = DC.GetProvinces();
                foreach (var item in provinces)
                    resp.Items.Add(new ProvinceModel
                    {
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

        public BankCodeResponse GetBankCodes(string bankID)
        {
            BankCodeResponse resp = new BankCodeResponse();
            try
            {
                int id = 0;
                if(!int.TryParse(bankID, out id)) id = 0;

                var items = DC.GetBankCodes(id);
                if (items.Any())
                    resp.Items.AddRange(items);
            }
            catch (Exception ex)
            {
                resp.Status = Constants.ErrorCode;
                resp.ErrorMessage = ex.Message;
            }
            return resp;
        }

        public BankResponse GetBanks()
        {
            BankResponse resp = new BankResponse();
            try
            {
                var items = DC.GetBanks();
                if (items.Any())
                    resp.Items.AddRange(items);
            }
            catch (Exception ex)
            {
                resp.Status = Constants.ErrorCode;
                resp.ErrorMessage = ex.Message;
            }
            return resp;
        }

        public BrandResponse GetLeadBrands()
        {
            BrandResponse resp = new BrandResponse();
            try
            {
                var items = DC.GetLeadBrands();
                if (items.Any())
                    resp.Items.AddRange(items);
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