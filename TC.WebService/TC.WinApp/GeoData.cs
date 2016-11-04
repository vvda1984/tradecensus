using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml;
using System.Xml.Linq;

namespace TC.WinApp
{
    public class KmlFileParser
    {
        public static IGeoDataBuilder DataBuidler { get; set; }

        private test_db_tcEntities _entities;
        private Dictionary<string, GeoBorder> _addedBorders;
        private int _startIndex;
        private DateTime _now;
        private ILogger log;
        private string _name;

        public KmlFileParser(string name, int startIndex, ILogger logger)
        {
            log = logger;
            _name = name;
            _now = DateTime.Now;
            _startIndex = startIndex;
            _entities = new test_db_tcEntities();
            _addedBorders = new Dictionary<string, GeoBorder>(StringComparer.OrdinalIgnoreCase);
            AddNewItem(name, null);
        }

        private GeoBorder AddNewItem(string name, string parentName, bool addtoDict = true)
        {
            try
            {
                var newItem = new GeoBorder { ID = _startIndex++, Name = name, AmendBy = 0, AmendDate = DateTime.Now, };
                if (!string.IsNullOrEmpty(parentName))
                {
                    if (!_addedBorders.ContainsKey(parentName))
                        throw new Exception(string.Format("Missing {0}", parentName));

                    newItem.ParentID = _addedBorders[parentName].ID;
                }
                else
                    newItem.ParentID = 0;

                if(addtoDict)
                    _addedBorders.Add(newItem.Name, newItem);
                _entities.GeoBorders.Add(newItem);

                return newItem;
            }
            catch
            {
                throw;
            }
        }

        public void Parse(string file)
        {
            XmlDocument xmlDocument = new XmlDocument();
            xmlDocument.Load(file);
            foreach(XmlNode node in xmlDocument.ChildNodes)
                if (node.Name == "kml")
                    ParseKmlNode(node);

            _entities.SaveChanges();
        }

        private void ParseKmlNode(XmlNode node)
        {
            log.WriteLog("Parse Kml node");
            foreach (XmlNode n in node.ChildNodes)
                if (string.Compare(n.Name, "Document", StringComparison.OrdinalIgnoreCase) == 0)
                    foreach (XmlNode n1 in n.ChildNodes)
                        if (string.Compare(n1.Name, "Folder", StringComparison.OrdinalIgnoreCase) == 0)
                            foreach (XmlNode n2 in n1.ChildNodes)
                                if (string.Compare(n2.Name, "Name", StringComparison.OrdinalIgnoreCase) == 0)
                                {
                                    // do nothing
                                }
                                else if (string.Compare(n2.Name, "Placemark", StringComparison.OrdinalIgnoreCase) == 0)
                                {
                                    ParsePlaceMark(n2);
                                }
        }

        private void ParsePlaceMark(XmlNode node)
        {
            string name = "";
            string parentName = "";
            List<string> coordinates = new List<string>();
            foreach (XmlNode n in node.ChildNodes)
                if (string.Compare(n.Name, "name", StringComparison.OrdinalIgnoreCase) == 0)
                {
                    name = n.InnerText;
                }
                else if (string.Compare(n.Name, "ExtendedData", StringComparison.OrdinalIgnoreCase) == 0)
                {
                    foreach (XmlNode n1 in n.ChildNodes)
                        if (string.Compare(n1.Name, "SchemaData", StringComparison.OrdinalIgnoreCase) == 0)
                            foreach (XmlNode n2 in n1.ChildNodes)
                                if (string.Compare(n2.Name, "SimpleData", StringComparison.OrdinalIgnoreCase) == 0)
                                    parentName = n2.InnerText;
                }
                else if (string.Compare(n.Name, "Polygon", StringComparison.OrdinalIgnoreCase) == 0)
                {
                    foreach (XmlNode n1 in n.ChildNodes)
                        if (string.Compare(n1.Name, "outerBoundaryIs", StringComparison.OrdinalIgnoreCase) == 0)
                            foreach (XmlNode n2 in n1.ChildNodes)
                                if (string.Compare(n2.Name, "LinearRing", StringComparison.OrdinalIgnoreCase) == 0)
                                    foreach (XmlNode n3 in n2.ChildNodes)
                                        if (string.Compare(n3.Name, "coordinates", StringComparison.OrdinalIgnoreCase) == 0)
                                            coordinates.Add(n3.InnerText);
                }
                else if (string.Compare(n.Name, "MultiGeometry", StringComparison.OrdinalIgnoreCase) == 0)
                {
                    foreach (XmlNode n1 in n.ChildNodes)
                        if (string.Compare(n1.Name, "Polygon", StringComparison.OrdinalIgnoreCase) == 0)
                            foreach (XmlNode n2 in n1.ChildNodes)
                                if (string.Compare(n2.Name, "outerBoundaryIs", StringComparison.OrdinalIgnoreCase) == 0)
                                    foreach (XmlNode n3 in n2.ChildNodes)
                                        if (string.Compare(n3.Name, "LinearRing", StringComparison.OrdinalIgnoreCase) == 0)
                                            foreach (XmlNode n4 in n3.ChildNodes)
                                                if (string.Compare(n4.Name, "coordinates", StringComparison.OrdinalIgnoreCase) == 0)
                                                    coordinates.Add(n4.InnerText);
                }

            if ((string.IsNullOrEmpty(name) && string.IsNullOrEmpty(parentName)) || coordinates.Count == 0)
                throw new Exception("Missing data 1");

            log.WriteLog("Found PlaceMark: {0} / {1}", name, parentName);

            GeoBorder item = null;
            if (!_addedBorders.ContainsKey(parentName))
                item = AddNewItem(parentName, _name);

            if (!string.IsNullOrEmpty(name))
                item = AddNewItem(name, parentName, false);

            if (item == null)
                throw new Exception("Missing data 2");

            List<GeoZone> zones = new List<GeoZone>();
            foreach (var coordinate in coordinates)
            {
                List<GeoCoordinate> coors = new List<GeoCoordinate>();
                string[] parr = coordinate.Split(new string[] { ",0 " }, StringSplitOptions.RemoveEmptyEntries);
                foreach (var p in parr)
                {
                    string[] lla = p.Split(new string[] { "," }, StringSplitOptions.RemoveEmptyEntries);
                    coors.Add(new GeoCoordinate()
                    {
                        Lat = double.Parse(lla[1]),
                        Lng = double.Parse(lla[0])
                    });
                }
                zones.Add(new GeoZone() { Border = coors.ToArray() });
            }

            item.GeoData = DataBuidler.BuildData(zones.ToArray());
        }
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

    public interface IGeoDataBuilder
    {
        string BuildData(GeoZone[] zones);
    }

    public class JsonBuilder : IGeoDataBuilder
    {
        public string BuildData(GeoZone[] zones)
        {
            var serializerSettings = new JsonSerializerSettings();
            serializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
            var json = JsonConvert.SerializeObject(zones, serializerSettings);
            return json;
        }
    }

    public class RawGeoBuilder : IGeoDataBuilder
    {
        public string BuildData(GeoZone[] zones)
        {
            StringBuilder sb = new StringBuilder();
            foreach(var zone in zones)
            {
                if (sb.Length > 0) sb.Append(",");
                sb.Append("[");
                StringBuilder data = new StringBuilder();
                foreach (var coor in zone.Border)
                {
                    if (data.Length > 0) data.Append(",");
                    data.Append(coor.Lng).Append(",").Append(coor.Lat);
                }
                sb.Append(data.ToString());
                sb.Append("]");
            }
            return sb.ToString();
        }
    }
}
