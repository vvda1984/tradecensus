using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TradeCensus.Shared;

namespace TradeCensus
{
    public class BorderService: TradeCensusServiceBase, IBorderService
    {
        public BorderService() : base("BorderService")
        {
        }

        public GetBorderArrayResponse GetBorderByParent(string parentID)
        {
            GetBorderArrayResponse resp = new GetBorderArrayResponse();
            try
            {
                resp.Items = new List<BorderModel>();
                int id = int.Parse(parentID);
                var query = _entities.GeoBorders.Where(i => i.ParentID == id).OrderBy(i => i.Name);
                if (query.Any())
                    foreach (var i in query)
                        resp.Items.Add(new BorderModel()
                        {
                            Name = i.Name,
                            ID = i.ID.ToString(),
                            ParentID = i.ParentID.ToString(),
                            GeoData = i.Formateddata,
                        });
            }
            catch (Exception ex)
            {
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
                int geoID = int.Parse(id);
                var border = _entities.GeoBorders.FirstOrDefault(i => i.ID == geoID);
                if (border != null)
                    resp.Item = new BorderModel
                    {
                        Name = border.Name,
                        ID = border.ID.ToString(),
                        ParentID = border.ParentID.ToString(),
                        GeoData = border.Formateddata
                    };
            }
            catch (Exception ex)
            {
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
                int id = int.Parse(provinceID);
                var border = _entities.GeoBorders.FirstOrDefault(i => i.ID == id || string.Compare(i.Name, provinceName, StringComparison.OrdinalIgnoreCase) == 0);
                if (border != null)
                {
                    resp.Items.Add(new BorderModel() {
                        Name = border.Name,
                        ID = border.ID.ToString(),
                        ParentID = border.ParentID.ToString(),
                        GeoData = border.Formateddata
                    });

                    AppendChildren(id, resp.Items);
                }
            }
            catch (Exception ex)
            {
                resp.Status = Constants.ErrorCode;
                resp.ErrorMessage = ex.Message;
            }
            return resp;
        }

        private void AppendChildren(int id, List<BorderModel> items)
        {
            var query = _entities.GeoBorders.Where(i => i.ParentID == id).OrderBy(i => i.Name);
            if (query.Any())
                foreach (var i in query)
                {
                    items.Add(new BorderModel()
                    {
                        Name = i.Name,
                        ID = i.ID.ToString(),
                        ParentID = i.ParentID.ToString(),
                        GeoData = i.Formateddata,
                    });
                    AppendChildren(i.ID, items);
                }
        }
    }

    public partial class GeoBorder
    {
        public string Formateddata
        {
            get
            {
                return (new PolylineBorder()).Parse(GeoData);
            }
        }
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
                }
                else if (c == ']')
                {
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
                    }
                    else
                    {
                        if (step%2 == 0)
                        {
                            curCoor.Lng = double.Parse(number.ToString());
                        }
                        else{
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