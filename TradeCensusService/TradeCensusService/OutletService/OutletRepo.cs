using System;
using System.Collections.Generic;
using System.Linq;
using TradeCensus.Shared;

namespace TradeCensus
{
    public class OutletRepo : BaseRepo
    {        
        public OutletRepo() : base("Outlet")
        {            
        }

        public List<int> GetByProvinceID(string provinceID)
        {
            Log("Get outlet by province id: {0}", provinceID);
            var items = _entities.Outlets.Where(i => i.ProvinceID == provinceID);
            Log("Found {0} outlets of province {1}", items.Count(), provinceID);
            List<int> ids = new List<int>();
            foreach (var i in items) ids.Add(i.ID);
            return ids;
        }

        public OutletModel GetByID(string id)
        {
            Log("Get outlet by id: {0}", id);
            var outlet = _entities.Outlets.FirstOrDefault(i => i.ID.ToString() == id);
            if (outlet != null)
                Log("Found outlet {0}", id);
            else
                Log("Found outlet {0} is missing", id);

            return new OutletModel
            {
                ID = outlet.ID,
                Name = outlet.Name,
                AddLine = outlet.AddLine,
                AddLine2 = outlet.AddLine2,
                AreaID = outlet.AreaID,
                CloseDate = outlet.CloseDate == null ? "" : outlet.CloseDate.Value.ToString("yyyy-mm-dd"),
                District = outlet.District,
                LastContact = outlet.LastContact,
                Latitude = outlet.Latitude,
                Longitude = outlet.Longitude,
                Note = outlet.Note,
                OTypeID = outlet.OTypeID,
                OutletTypeName = GetOutletType(outlet.OTypeID),
                OutletEmail = outlet.OutletEmail,
                PersonID = outlet.PersonID,
                Phone = outlet.Phone,
                ProvinceID = outlet.ProvinceID,
                Tracking = outlet.Tracking,
                PRowID = outlet.PRowID.ToString(),
            };
        }

        public List<OutletType> GetAllOutletTypes()
        {
            Log("Get list of OutletTypes");
            return _entities.OutletTypes.ToList();
        }

        public List<OutletModel> GetOutletByLocation(double lat, double lng, string provinceID, double meter, int count)
        {
            string value = "circle";
            try { value = _entities.Configs.FirstOrDefault(i => i.Name == "calc_distance_algorithm").Value; }
            catch
            {
                Log("Missing calc_distance_algorithm, use default (circle)");
                value = "circle";
            }
            var saleLoc = new Point { Lat = lat, Lng = lng };

            List<OutletModel> res = new List<OutletModel>();
            var query = from i in _entities.Outlets where i.ProvinceID == provinceID select i;
            if (query.Any())
            {
                var arr = query.ToArray();
                int found = 0;
                foreach (var outlet in arr)
                {
                    bool isMatched = false;
                    if (value == "circle")
                        isMatched = InDistanceCircle(saleLoc, new Point { Lat = outlet.Latitude, Lng = outlet.Longitude }, meter);
                    else if (value == "square")
                        isMatched = InDistanceSquare(saleLoc, new Point { Lat = outlet.Latitude, Lng = outlet.Longitude }, meter);

                    if (isMatched) {
                        res.Add(new OutletModel
                        {
                            ID = outlet.ID,
                            Name = outlet.Name,
                            AddLine = outlet.AddLine,
                            AddLine2 = outlet.AddLine2,
                            AreaID = outlet.AreaID,
                            CloseDate = outlet.CloseDate == null ? "" : outlet.CloseDate.Value.ToString("yyyy-mm-dd"),
                            District = outlet.District,
                            LastContact = outlet.LastContact,
                            Latitude = outlet.Latitude,
                            Longitude = outlet.Longitude,
                            Note = outlet.Note,
                            OTypeID = outlet.OTypeID,
                            OutletTypeName = GetOutletType(outlet.OTypeID),
                            OutletEmail = outlet.OutletEmail,
                            PersonID = outlet.PersonID,
                            Phone = outlet.Phone,
                            ProvinceID = outlet.ProvinceID,
                            Tracking = outlet.Tracking,
                            PRowID = outlet.PRowID.ToString(),
                        });
                        found++;
                    }

                    if (found >= count) break;
                }
            }
            return res;
        }

        private string GetOutletType(string id)
        {
            var item =_entities.OutletTypes.FirstOrDefault(i => i.ID == id);
            return item == null ? "" : item.Name;
        }

        public void UpdateOutlet(List<OutletModel> items)
        {
            foreach (var item in items)
            {
            }
        }

        public void DeleteOutlet(List<OutletModel> items)
        {

        }

        private bool InDistanceCircle(Point saleLocation, Point outletLocation, double meter)
        {
            var R = 6378137; // Earth’s mean radius in meter
            var dLat = CalculateRad(outletLocation.Lat - saleLocation.Lat);
            var dLong = CalculateRad(outletLocation.Lng - saleLocation.Lng);
            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) + Math.Cos(CalculateRad(saleLocation.Lat)) * Math.Cos(CalculateRad(outletLocation.Lat)) *
                    Math.Sin(dLong / 2) * Math.Sin(dLong / 2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            var d = R * c;
            return d <= meter;
        }

        private static double CalculateRad(double x)
        {
            return x * Math.PI / 180;
        }

        private bool InDistanceSquare(Point saleLocation, Point outletLocation, double meter)
        {
            var o1 = outletLocation.Lng + (meter * 0.0001) / 11.32;
            var o3 = outletLocation.Lng - (meter * 0.0001) / 11.32;
            var o2 = outletLocation.Lat + (meter * 0.0001) / 11.32;
            var o4 = outletLocation.Lat - (meter * 0.0001) / 11.32;

            if (saleLocation.Lat <= 0 && saleLocation.Lng >= 0) return saleLocation.Lat >= o4 && saleLocation.Lng <= o1;
            if (saleLocation.Lat >= 0 && saleLocation.Lng >= 0) return saleLocation.Lat <= o2 && saleLocation.Lng <= o1;
            if (saleLocation.Lat >= 0 && saleLocation.Lng <= 0) return saleLocation.Lat <= o2 && saleLocation.Lng >= o3;
            if (saleLocation.Lat <= 0 && saleLocation.Lng <= 0) return saleLocation.Lat >= o4 && saleLocation.Lng >= o3;
            return false;
        }    
    }

    public class Point
    {
        public double Lat { get; set; }
        public double Lng { get; set; }
    }
}