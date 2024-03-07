using System;
using System.Collections.Generic;
using System.Linq;
using TradeCensus.Shared;

namespace TradeCensus
{
    public class BorderService : TradeCensusServiceBase, IBorderService
    {
        public BorderService() : base("BorderService")
        { }

        private void AddSubBorders(int id, List<BorderModel> items)
        {
            var query = DC.GetBordersByParent(id);
            if (query.Any())
                foreach (var i in query)
                {
                    items.Add(new BorderModel()
                    {
                        Name = i.Name,
                        ID = i.ID.ToString(),
                        ParentID = i.ParentID.ToString(),
                        GeoData = i.Formateddata,
                        ChildrenCount = i.ChildrenCount,
                        HasGeoData = !string.IsNullOrWhiteSpace(i.GeoData) ? 1 : 0,
                    });
                    AddSubBorders(i.ID, items);
                }
        }

        public GetBorderArrayResponse GetBorderByParent(string parentID)
        {
            GetBorderArrayResponse resp = new GetBorderArrayResponse();
            try
            {
                resp.Items = new List<BorderModel>();
                var query = DC.GetBordersByParent(int.Parse(parentID));
                foreach (var i in query)
                    resp.Items.Add(new BorderModel()
                    {
                        Name = i.Name,
                        ID = i.ID.ToString(),
                        ParentID = i.ParentID.ToString(),
                        GeoData = "",
                        ChildrenCount = i.ChildrenCount,
                        HasGeoData = !string.IsNullOrWhiteSpace(i.GeoData) ? 1 : 0,
                    });
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, $"Cannot get sub borders of {parentID}");

                resp.Status = Constants.ErrorCode;
                resp.ErrorMessage = ex.Message;
            }
            return resp;
        }

        public GetBorderResponse GetBorder(string id)
        {
            GetBorderResponse resp = new GetBorderResponse();
            try
            {
                var border = DC.GetBorder(int.Parse(id));
                if (border != null)
                {
                    resp.Item = new BorderModel
                    {
                        Name = border.Name,
                        ID = border.ID.ToString(),
                        ParentID = border.ParentID.ToString(),
                        GeoData = border.Formateddata,
                        ChildrenCount = border.ChildrenCount,
                        HasGeoData = !string.IsNullOrWhiteSpace(border.GeoData) ? 1 : 0,
                    };
                }
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, $"Cannot get border {id}");

                resp.Status = Constants.ErrorCode;
                resp.ErrorMessage = ex.Message;
            }
            return resp;
        }

        public GetBorderArrayResponse GetBorderByParentName(string parentName)
        {
            GetBorderArrayResponse resp = new GetBorderArrayResponse();
            try
            {
                resp.Items = new List<BorderModel>();
                var query = DC.GetBordersByParentName(parentName);
                foreach (var i in query)
                    resp.Items.Add(new BorderModel()
                    {
                        Name = i.Name,
                        ID = i.ID.ToString(),
                        ParentID = i.ParentID.ToString(),
                        GeoData = "",
                        ChildrenCount = i.ChildrenCount,
                        HasGeoData = !string.IsNullOrWhiteSpace(i.GeoData) ? 1 : 0,
                    });
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, $"Cannot get sub borders of {parentName}");

                resp.Status = Constants.ErrorCode;
                resp.ErrorMessage = ex.Message;
            }
            return resp;
        }

        public GetBorderArrayResponse DownloadBorders(string provinceID, string provinceName)
        {
            GetBorderArrayResponse resp = new GetBorderArrayResponse();
            try
            {
                resp.Items = new List<BorderModel>();

                var border = DC.GetProvinceBorder(provinceID, provinceName);
                if (border != null)
                {
                    resp.Items.Add(new BorderModel()
                    {
                        Name = border.Name,
                        ID = border.ID.ToString(),
                        ParentID = border.ParentID.ToString(),
                        GeoData = border.Formateddata,
                        ChildrenCount = border.ChildrenCount,
                        HasGeoData = !string.IsNullOrWhiteSpace(border.GeoData) ? 1 : 0,
                    });
                    AddSubBorders(int.Parse(provinceID), resp.Items);
                }
            }
            catch (Exception ex)
            {
                resp.Status = Constants.ErrorCode;
                resp.ErrorMessage = ex.Message;
            }
            return resp;
        }

        public GetBorderArrayResponse GetDistrictBorders(string provinceID)
        {
            return GetBorderByParent(provinceID);
        }

        public GetBorderArrayResponse GetWardBorders(string provinceID, string districtName)
        {
            GetBorderArrayResponse resp = new GetBorderArrayResponse();
            try
            {
                resp.Items = new List<BorderModel>();
                var query = DC.GettWards(districtName, int.Parse(provinceID));
                foreach (var i in query)
                    resp.Items.Add(new BorderModel
                    {
                        Name = i.Name,
                        ID = i.ID.ToString(),
                        ParentID = i.ParentID.ToString(),
                        GeoData = "",
                        ChildrenCount = i.ChildrenCount,
                        HasGeoData = !string.IsNullOrWhiteSpace(i.GeoData) ? 1 : 0,
                    });
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, $"Cannot get sub borders of {districtName}");

                resp.Status = Constants.ErrorCode;
                resp.ErrorMessage = ex.Message;
            }
            return resp;
        }

        //public GetProvinceDataResponse GetProvinceData(string provinceName)
        //{
        //    GetProvinceDataResponse resp = new GetProvinceDataResponse();
        //    try
        //    {
        //        var province = DC.GeoBorders.FirstOrDefault(i => string.Compare(i.Name, provinceName, StringComparison.OrdinalIgnoreCase) == 0);
        //        if (province != null)
        //        {
        //            resp.Item = new ProvinceModel
        //            {
        //                Id = province.ID.ToString(),
        //                Name = province.Name,
        //                ParentID = "0",
        //                Districts = new List<DistrictModel>()
        //            };
        //            var dists = DC.GeoBorders.Where(x => x.ParentID == province.ID).ToArray();
        //            if (dists.Length > 0)
        //            {
        //                foreach (var dist in dists)
        //                {
        //                    var distModel = new DistrictModel
        //                    {
        //                        Id = dist.ID.ToString(),
        //                        Name = dist.Name,
        //                        ParentID = dist.ParentID.ToString(),
        //                    };
        //                    resp.Item.Districts.Add(distModel);

        //                    var wards = DC.GeoBorders.Where(x => x.ParentID == dist.ID).ToArray();
        //                    if (wards.Length > 0)
        //                    {
        //                        foreach (var ward in wards)
        //                        {
        //                            var wardModel = new WardModel
        //                            {
        //                                Id = ward.ID.ToString(),
        //                                Name = ward.Name,
        //                                ParentID = ward.ParentID.ToString(),
        //                            };
        //                            distModel.Wards.Add(wardModel);
        //                        }
        //                    }
        //                }
        //            }
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        resp.Status = Constants.ErrorCode;
        //        resp.ErrorMessage = ex.Message;
        //    }
        //    return resp;
        //}
    }
}