using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;

namespace TradeCensus
{
    public class GeoCoordinate
    {
        public double Lat { get; set; }

        public double Lng { get; set; }

        public static string ToJson(GeoCoordinate[] coodinates)
        {
            var serializerSettings = new JsonSerializerSettings();
            serializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
            var json = JsonConvert.SerializeObject(coodinates, serializerSettings);
            return json;
        }

        public static string ParseBorder(string data)
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

            return JsonConvert.SerializeObject(zones, new JsonSerializerSettings { ContractResolver = new CamelCasePropertyNamesContractResolver() });
        }

        public static string ParseJournal(string data)
        {
            List<GeoCoordinate> coors = new List<GeoCoordinate>();
            //string[] arr = data.Split(new string[] { "," }, StringSplitOptions.RemoveEmptyEntries);

            int step = 0;
            GeoCoordinate curCoor = null;
            StringBuilder number = new StringBuilder();
            foreach (char c in data)
            {
                if (c == ',')
                {
                    if (curCoor == null)
                    {
                        curCoor = new GeoCoordinate();
                        coors.Add(curCoor);
                    }

                    if (step % 2 == 0)
                        curCoor.Lat = double.Parse(number.ToString());
                    else
                    {
                        curCoor.Lng = double.Parse(number.ToString());
                        curCoor = null;
                    }

                    step++;
                    number.Clear();
                }
                else
                    number.Append(c);
            }

            if (curCoor != null)
                curCoor.Lng = double.Parse(number.ToString());

            return JsonConvert.SerializeObject(coors, new JsonSerializerSettings { ContractResolver = new CamelCasePropertyNamesContractResolver() });
        }

        private class GeoZone
        {
            public GeoCoordinate[] Border { get; set; }
        }
    }
}