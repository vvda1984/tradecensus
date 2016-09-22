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
                //var query = _entities.GeoBorders.Where(i => i.ParentID == id).OrderBy(i => i.Name);
                var command = string.Format(@"SELECT gb.*, (select COUNT(Id) from GeoBorder as tmp where tmp.ParentID = gb.ID) as 'ChildrenCount'
                    FROM GeoBorder as gb
                    WHERE gb.ParentID = {0} order by gb.Name", parentID);
                var query = _entities.Database.SqlQuery<GeoBorderEx>(command);
                if (query.Any())
                    foreach (var i in query)
                        resp.Items.Add(new BorderModel()
                        {
                            Name = i.Name,
                            ID = i.ID.ToString(),
                            ParentID = i.ParentID.ToString(),
                            GeoData = "", //i.Formateddata,
                            ChildrenCount = i.ChildrenCount,
                            HasGeoData = !string.IsNullOrWhiteSpace(i.GeoData) ? 1 : 0,
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
                //int geoID = int.Parse(id);
                //var border = _entities.GeoBorders.FirstOrDefault(i => i.ID == geoID);
                var query = _entities.Database.SqlQuery<GeoBorderEx>(
                      string.Format(@"SELECT TOP 1 gb.*, (select COUNT(Id) from GeoBorder as tmp where tmp.ParentID = gb.ID) as 'ChildrenCount'
                        FROM GeoBorder as gb
                        WHERE gb.ID = {0}", id));
                if (query.Any())
                {
                    var border = query.FirstOrDefault();
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
                //var border = _entities.GeoBorders.FirstOrDefault(i => i.ID == id || string.Compare(i.Name, provinceName, StringComparison.OrdinalIgnoreCase) == 0);

                var query = _entities.Database.SqlQuery<GeoBorderEx>(
                    string.Format(@"SELECT TOP 1 gb.*, (select COUNT(Id) from GeoBorder as tmp where tmp.ParentID = gb.ID) as 'ChildrenCount'
                                    FROM GeoBorder as gb
                                    WHERE gb.ID = {0} OR gb.Name LIKE '%{1}%'", id, provinceName));
                if (query.Any())
                {
                    var border = query.FirstOrDefault();
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

                        AppendChildren(id, resp.Items);
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

        private void AppendChildren(int id, List<BorderModel> items)
        {
            //var query = _entities.GeoBorders.Where(i => i.ParentID == id).OrderBy(i => i.Name);
            var query = _entities.Database.SqlQuery<GeoBorderEx>(
                   string.Format(@"SELECT gb.*, (select COUNT(Id) from GeoBorder as tmp where tmp.ParentID = gb.ID) as 'ChildrenCount'
                                    FROM GeoBorder as gb
                                    WHERE gb.ParentID = {0}
                                    order by gb.Name", id));
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
                    AppendChildren(i.ID, items);
                }
        }
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