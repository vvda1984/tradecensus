using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TradeCensus.Data;
using TradeCensus.Shared;

namespace TradeCensus
{
    public class BorderService: TradeCensusServiceBase, IBorderService
    {
        public BorderService() : base("BorderService")
        {
        }

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

        public GetBorderArrayResponse GetWardBorders(string districtName, string provinceID)
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

    public class GeoBorderEx : GeoBorder
    {
        public string Formateddata
        {
            get
            {
                return (new PolylineBorder()).Parse(GeoData);
            }
        }

        public int ChildrenCount { get; set; }
    }

    public class PolylineBorder
    {
        public string Parse(string data)
        {
            if (string.IsNullOrWhiteSpace(data)) return data;

            List<GeoZone> zones = new List<GeoZone>();
            int step = 0;

            StringBuilder number = new StringBuilder();
            GeoZone curZone= null;
            List<GeoCoordinate> coors = new List<GeoCoordinate>();
            GeoCoordinate curCoor = new GeoCoordinate();
            foreach (char c in data)
            {
                if (c == '[')
                {
                    curZone = new GeoZone();
                    coors = new List<GeoCoordinate>();
                    step = 0;
                }
                else if (c == ']')
                {
                    curCoor.Lat = double.Parse(number.ToString());
                    coors.Add(curCoor);
                    curCoor = new GeoCoordinate();

                    if (curZone != null)
                    {
                        curZone.Border = coors.ToArray();
                        zones.Add(curZone);
                    }
                    curZone = null;
                }
                else if(c == ',')
                {
                    if(curZone == null)
                    {
                        // do nothing
                        number.Clear();
                    }
                    else
                    {
                        if (step % 2 == 0)
                        {
                            curCoor.Lng = double.Parse(number.ToString());
                        }
                        else
                        {
                            curCoor.Lat = double.Parse(number.ToString());
                            coors.Add(curCoor);
                            curCoor = new GeoCoordinate();
                        }
                        number.Clear();
                        step++;
                    }
                }
                else
                    number.Append(c);
            }

            var serializerSettings = new JsonSerializerSettings();
            serializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
            var json = JsonConvert.SerializeObject(zones, serializerSettings);
            return json;
        }

        public class GeoZone
        {
            public GeoCoordinate[] Border { get; set; }
        }

        public class GeoCoordinate
        {
            public double Lat { get; set; }
            public double Lng { get; set; }
        }
    }
}