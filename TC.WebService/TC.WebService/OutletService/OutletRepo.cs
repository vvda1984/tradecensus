﻿using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Web;
using TradeCensus.Shared;

namespace TradeCensus
{
    public class OutletRepo : BaseRepo
    {
        const byte ActionAdd = 0;
        const byte ActionUpdate = 1;
        const byte ActionUpdateImage = 2;
        const byte ActionAudit = 3;

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

        public List<OutletModel> GetOutletByLocation(double lat, double lng, double meter, int count)
        {
            string value = "circle";
            try { value = _entities.Configs.FirstOrDefault(i => i.Name == "calc_distance_algorithm").Value; }
            catch
            {
                Log("Missing calc_distance_algorithm, use default (circle)");
                value = "circle";
            }
            Log("Distance method: {0}", value);
            var saleLoc = new Point { Lat = lat, Lng = lng };

            Point tl = CalcRetangleBoundary(meter, 0 - meter, saleLoc);
            Point tr = CalcRetangleBoundary(meter, meter, saleLoc);
            Point bl = CalcRetangleBoundary(0 - meter, 0 - meter, saleLoc);
            Point br = CalcRetangleBoundary(0 - meter, meter, saleLoc);

            List<OutletModel> res = new List<OutletModel>();
            var query = from i in _entities.Outlets
                        where i.Latitude >= bl.Lat && i.Latitude <= tl.Lat &&
                              i.Longitude >= bl.Lng && i.Longitude <= br.Lng
                        select i;
            if (query.Any())
            {
                var arr = query.ToArray();
                int found = 0;
                foreach (var outlet in arr)
                {                    
                    double distance = int.MaxValue;
                    if (value == "circle")
                        distance = CalcDistanceCircle(saleLoc, new Point { Lat = outlet.Latitude, Lng = outlet.Longitude }, meter);

                    if (distance <= meter)
                    {
                        var foundOutlet = new OutletModel
                        {
                            ID = outlet.ID,
                            Name = outlet.Name,
                            AddLine = outlet.AddLine,
                            AddLine2 = outlet.AddLine2,
                            AreaID = outlet.AreaID,
                            CloseDate = outlet.CloseDate == null ? "" : outlet.CloseDate.Value.ToString("yyyy-mm-dd"),
                            IsOpened = outlet.CloseDate == null,
                            District = outlet.District,
                            LastContact = outlet.LastContact,
                            LastVisit = outlet.LastVisit != null ? outlet.LastVisit.Value.ToString("yyyy-mm-dd") : "",
                            Latitude = outlet.Latitude,
                            Longitude = outlet.Longitude,
                            Note = outlet.Note,
                            OTypeID = outlet.OTypeID,
                            OutletTypeName = GetOutletType(outlet.OTypeID),
                            OutletEmail = outlet.OutletEmail,
                            PersonID = outlet.PersonID,
                            Phone = outlet.Phone,
                            ProvinceID = outlet.ProvinceID,
                            ProvinceName = GetProvinceName(outlet.ProvinceID),                            
                            Tracking = outlet.Tracking,
                            IsTracked = outlet.Tracking == 1,
                            PRowID = outlet.PRowID.ToString(),
                            Action = 0,
                            InputBy = outlet.InputBy,                            
                            AmendBy = outlet.AmendBy,
                            AmendDate = outlet.AmendDate.ToString("yyyy-MM-dd HH:mm:ss"),
                            AuditStatus = outlet.AuditStatus,
                            CreateDate = outlet.CreateDate.ToString("yyyy-MM-dd HH:mm:ss"),
                            Distance = distance,
                            OutletSource = 0,
                            StringImage1 = "",
                            StringImage2 = "",
                            StringImage3 = "",
                        };
                        if (outlet.DEDISID > 0)
                            foundOutlet.OutletSource = 1;
                        else if (outlet.DISAlias != null)
                            foundOutlet.OutletSource = string.IsNullOrEmpty(outlet.DISAlias.Trim()) ? 0 : 1;

                        foundOutlet.FullAddress = string.Format("{0} {1} {2} {3}", outlet.AddLine, outlet.AddLine2, outlet.District, foundOutlet.ProvinceName);
                        foundOutlet.FullAddress = foundOutlet.FullAddress.Trim().Replace("  ", " ");

                        var outletImg = outlet.OutletImages.FirstOrDefault();
                        if (outletImg != null)
                        {
                            foundOutlet.StringImage1 = outletImg.Image1;
                            foundOutlet.StringImage2 = outletImg.Image2;
                            foundOutlet.StringImage3 = outletImg.Image3;
                        }
                        res.Add(foundOutlet);
                        found++;
                    }

                    if (found >= count) break;
                }
            }
            return res;
        }

        public string SaveOutlet(OutletModel outlet)
        {
            Outlet existingOutlet = null;
            if (!string.IsNullOrEmpty(outlet.PRowID))
                existingOutlet = _entities.Outlets.FirstOrDefault(i => i.PRowID.ToString() == outlet.PRowID);

            if (existingOutlet == null)
                existingOutlet = _entities.Outlets.FirstOrDefault(i => i.ID == outlet.ID);

            string note = "";
            byte action = ActionUpdate;

            if (existingOutlet == null)
            {
                note = "Add new outlet";
                action = ActionAdd;
                existingOutlet = new Outlet
                {
                    ID = outlet.ID,
                    TerritoryID = "",
                    CallRate = 0,
                    CloseDate = null,
                    CreateDate = DateTime.Now,
                    LastContact = "",
                    Tracking = 0,
                    Class = "",
                    Open1st = null,
                    Close1st = null,
                    Open2nd = null,
                    Close2nd = null,
                    SpShift = 0,
                    LastVisit = null,
                    TaxID = null,
                    ModifiedStatus = 0,
                    InputBy = outlet.InputBy,
                    InputDate = DateTime.Now,
                    OutletEmail = null,
                    DEDISID = 0,
                    DISAlias = null,
                    LegalName = null,
                    PIsDeleted = false,
                    PRowID = Guid.NewGuid(),
                };
                _entities.Outlets.Add(existingOutlet);
            }
            else
            {
                if (existingOutlet.AuditStatus != outlet.AuditStatus)
                {
                    action = ActionAudit;
                    note = "Audit outlet";
                }
                else
                    note = "Update outlet";
            }

            existingOutlet.AreaID = outlet.AreaID;
            existingOutlet.Name = outlet.Name;
            existingOutlet.OTypeID = outlet.OTypeID;
            existingOutlet.AddLine = outlet.AddLine;
            existingOutlet.AddLine2 = outlet.AddLine2;
            existingOutlet.District = outlet.District;
            existingOutlet.ProvinceID = outlet.ProvinceID;
            existingOutlet.Phone = outlet.Phone;
            if (!string.IsNullOrEmpty(outlet.CloseDate))
                existingOutlet.CloseDate = DateTime.Parse("yyyy-MM-dd HH:mm:ss");
            else
                existingOutlet.CloseDate = null;
            existingOutlet.Tracking = outlet.Tracking;
            existingOutlet.PersonID = outlet.PersonID;
            existingOutlet.Note = outlet.Note;
            existingOutlet.Longitude = outlet.Longitude;
            existingOutlet.Latitude = outlet.Latitude;
            existingOutlet.AmendBy = outlet.AmendBy;
            existingOutlet.AmendDate = DateTime.Now;
            existingOutlet.AuditStatus = (byte)outlet.AuditStatus;
            existingOutlet.TotalVolume = outlet.TotalVolume;
            existingOutlet.VBLVolume = outlet.VBLVolume;
            if (!string.IsNullOrEmpty(outlet.PRowID))
                existingOutlet.PRowID = new Guid(outlet.PRowID);

            if(existingOutlet.OutletImages.Count() > 0)
            {
                var outletImage = existingOutlet.OutletImages.FirstOrDefault();
                if (string.IsNullOrEmpty(outlet.StringImage1))
                {
                    outletImage.Image1 = "";
                    outletImage.ImageData1 = null;
                }
                if (string.IsNullOrEmpty(outlet.StringImage2))
                {
                    outletImage.Image2 = "";
                    outletImage.ImageData2 = null;
                }
                if (string.IsNullOrEmpty(outlet.StringImage3))
                {
                    outletImage.Image3 = "";
                    outletImage.ImageData3 = null;
                }
            }
            

            TrackOutletChanged(existingOutlet.PRowID, outlet.AmendBy, note, 0, action);
            _entities.SaveChanges();

            return existingOutlet.PRowID.ToString();
        }

        private string GetOutletType(string id)
        {
            var item =_entities.OutletTypes.FirstOrDefault(i => i.ID == id);
            return item == null ? "" : item.Name;
        }

        private string GetProvinceName(string id)
        {
            var item = _entities.Provinces.FirstOrDefault(i => i.ID == id);
            return item == null ? "" : item.Name;
        }      

        public void DeleteOutlet(List<OutletModel> items)
        {

        }

        private double CalcDistanceCircle(Point saleLoc, Point outletLoc, double meter)
        {
            var R = 6378137; // Earth’s mean radius in meter
            var dLat = CalculateRad(outletLoc.Lat - saleLoc.Lat);
            var dLong = CalculateRad(outletLoc.Lng - saleLoc.Lng);
            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) + Math.Cos(CalculateRad(saleLoc.Lat)) * Math.Cos(CalculateRad(outletLoc.Lat)) *
                    Math.Sin(dLong / 2) * Math.Sin(dLong / 2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            var d = R * c;
            return Math.Round(d, 2);
        }

        private static double CalculateRad(double x)
        {
            return x * Math.PI / 180;
        }

        //private double InDistanceSquare(Point saleLoc, Point outletLoc, double meter)
        //{
        //    var o1 = outletLoc.Lng + (meter * 0.0001) / 11.32;
        //    var o3 = outletLoc.Lng - (meter * 0.0001) / 11.32;
        //    var o2 = outletLoc.Lat + (meter * 0.0001) / 11.32;
        //    var o4 = outletLoc.Lat - (meter * 0.0001) / 11.32;

        //    if (saleLoc.Lat <= 0 && saleLoc.Lng >= 0) return saleLoc.Lat >= o4 && saleLoc.Lng <= o1;
        //    if (saleLoc.Lat >= 0 && saleLoc.Lng >= 0) return saleLoc.Lat <= o2 && saleLoc.Lng <= o1;
        //    if (saleLoc.Lat >= 0 && saleLoc.Lng <= 0) return saleLoc.Lat <= o2 && saleLoc.Lng >= o3;
        //    if (saleLoc.Lat <= 0 && saleLoc.Lng <= 0) return saleLoc.Lat >= o4 && saleLoc.Lng >= o3;
        //    return false;
        //}    
        
        private Point CalcRetangleBoundary(double dlat, double dlng, Point p)
        {
            Point newP = new Point
            {
                Lat = p.Lat + (dlat / Constants.EarthR) * (180 / Math.PI),
                Lng = p.Lng + (dlng / Constants.EarthR) * (180 / Math.PI) / Math.Cos(p.Lat * Math.PI / 180)
            };
            return newP;
        }

        public string SaveImage(string userID, string outletID, string index,  HttpPostedFile file)
        {           
            string path = AppDomain.CurrentDomain.BaseDirectory; //GetType().Assembly.Location; // ...\bin\...
            path = Path.GetDirectoryName(path) + "\\Images";
            EnsureDirExist(path);
            string imagePath = Path.Combine(path, string.Format("{0}_{1}.jpg", outletID, index));

            file.SaveAs(imagePath);
          
            var id = int.Parse(outletID);
            var amendby = int.Parse(userID);
            Outlet outlet = _entities.Outlets.FirstOrDefault(i => i.ID == id);
            if (outlet != null)
            {
                OutletImage outletImage = null;
                if (outlet.OutletImages.Count() > 0)
                    outletImage = outlet.OutletImages.FirstOrDefault();
                else
                {
                    outletImage = new OutletImage() { OutletID = outlet.ID, };
                    outlet.OutletImages.Add(outletImage);
                }
                           
                if (index == "1")
                {
                    outletImage.ImageData1 = File.ReadAllBytes(imagePath);
                    outletImage.Image1 = string.Format("/images/{0}_1.jpg", outletID);
                }
                else if (index == "2")
                {
                    outletImage.ImageData2 = File.ReadAllBytes(imagePath);
                    outletImage.Image2 = string.Format("/images/{0}_2.jpg", outletID);
                }
                else if (index == "3")
                {
                    outletImage.ImageData3 = File.ReadAllBytes(imagePath);
                    outletImage.Image3 = string.Format("/images/{0}_3.jpg", outletID);
                }
                outlet.AmendBy = amendby;
                outlet.AmendDate = DateTime.Now;

                TrackOutletChanged(outlet.PRowID, amendby, "Save image", 0, ActionUpdateImage);

                _entities.SaveChanges();
            }
            return string.Format("/images/{0}_{1}.jpg", outletID, index);
        }

        public bool ThumbnailCallback()
        {
            return true;
        }

        private void EnsureDirExist(string path)
        {
            if (Directory.Exists(path)) return;

            string parent = Path.GetDirectoryName(path);
            EnsureDirExist(parent);
            Directory.CreateDirectory(path);
        }

        public string GetImage(string outletID, string index)
        {           
            var id = int.Parse(outletID);
            Outlet outlet = _entities.Outlets.FirstOrDefault(i => i.ID == id);
            if (outlet != null)
            {
                OutletImage outletImage = outlet.OutletImages.FirstOrDefault();
                if (outletImage != null)
                {
                    if (index == "0")
                    {
                        return outletImage.Image1;
                    }
                    else if (index == "1")
                    {
                        return outletImage.Image2;
                    }
                    else if (index == "2")
                    {
                        return outletImage.Image3;
                    }
                }
            }
            return "";
        }

        private void TrackOutletChanged(Guid rowID, int userID,  string note, byte status, byte action)
        {
            SyncHistory hist = new SyncHistory()
            {
                TableName = "Outlet",
                SyncDateTime = DateTime.Now,
                SyncBy = userID,
                Note = note,
                Status = status,
            };
            _entities.SyncHistories.Add(hist);
            var detail = new SyncDetail()
            {
                Action = action,
                RowID = rowID,
                SyncHistory = hist,
            };
            hist.SyncDetails.Add(detail);
        }
    }

    public class Point
    {
        public double Lat { get; set; }
        public double Lng { get; set; }
    }
}