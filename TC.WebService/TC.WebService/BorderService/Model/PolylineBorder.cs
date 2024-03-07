using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System.Collections.Generic;
using System.Text;

namespace TradeCensus
{
    public class PolylineBorder
    {
        public string Parse(string data)
        {
            if (string.IsNullOrWhiteSpace(data)) return data;

            List<GeoZone> zones = new List<GeoZone>();
            int step = 0;

            StringBuilder number = new StringBuilder();
            GeoZone curZone = null;
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
                else if (c == ',')
                {
                    if (curZone == null)
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