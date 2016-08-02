using System;
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
        const byte ActionDelete = 4;
        const byte ActionRevise = 5;

        private bool AuditorNewMode
        {
            get
            {
                bool v = false;
                try
                {
                    System.Configuration.AppSettingsReader sr = new System.Configuration.AppSettingsReader();
                    v = (bool)sr.GetValue("auditorNewMode", typeof(bool));
                }
                catch
                {
                    v = false;
                }
                return v;
            }
        }

        public OutletRepo() : base("Outlet")
        {
        }

        public List<OutletShort> GetByProvinceID(int personID, string provinceID)
        {
            ValidatePerson(personID);
            Log("Get outlet by province id: {0}", provinceID);
            var items = _entities.Outlets.Where(i => i.ProvinceID == provinceID);
            Log("Found {0} outlets of province {1}", items.Count(), provinceID);
            List<OutletShort> ids = new List<OutletShort>();
            foreach (var i in items) ids.Add(new OutletShort { ID = i.ID, Name = i.Name });
            return ids;
        }

        public OutletModel GetByID(int personID, string id)
        {
            ValidatePerson(personID);
            Log("Get outlet by id: {0}", id);
            OutletModel outletModel = null;

            var outlet = _entities.Outlets.FirstOrDefault(i => i.ID.ToString() == id);
            if (outlet != null)
            {
                Log("Found outlet {0}", id);
                outletModel = ToOutletModel(outlet);
            }
            else
                Log("Found outlet {0} is missing", id);

            return outletModel;
        }

        public List<OutletType> GetAllOutletTypes()
        {
            Log("Get list of OutletTypes");
            return _entities.OutletTypes.ToList();
        }

        public List<OutletModel> GetOutletsByProvince(int personID, string provinceID)
        {
            var user = _entities.PersonRoles.FirstOrDefault(i => i.PersonID == personID);
            if (user == null)
                throw new Exception(string.Format("User {0} doesn't exist", personID));

            List<OutletModel> res = new List<OutletModel>();
            var query = (from i in _entities.Outlets
                         where i.ProvinceID == provinceID
                         select i);
            if (query.Any())
            {
                var arr = query.ToArray();
                foreach (var outlet in arr)
                    res.Add(ToOutletModel(outlet));
            }
            return res;
        }

        public List<OutletModel> GetOutletsByLocation(int personID, double lat, double lng, double meter, int count, int status)
        {
            var user = _entities.PersonRoles.FirstOrDefault(i => i.PersonID == personID);
            if (user == null)
                throw new Exception(string.Format("User {0} doesn't exist", personID));
            var auditor = user.Role == Constants.RoleAudit ||  user.Role == Constants.RoleAudit1;

            string method = GetSetting("calc_distance_algorithm", "circle");            
            Log("Calculate distance method: {0}", method);
            var curLocation = new Point { Lat = lat, Lng = lng };
            Point tl = DistanceHelper.CalcShiftedPoint(meter, 0 - meter, curLocation);
            Point tr = DistanceHelper.CalcShiftedPoint(meter, meter, curLocation);
            Point bl = DistanceHelper.CalcShiftedPoint(0 - meter, 0 - meter, curLocation);
            Point br = DistanceHelper.CalcShiftedPoint(0 - meter, meter, curLocation);

            List<OutletModel> res = new List<OutletModel>();
            IQueryable<Outlet> query;
            if (status == 0) // near-by
            {
                query = from i in _entities.Outlets
                        where i.Latitude >= bl.Lat && i.Latitude <= tl.Lat &&
                              i.Longitude >= bl.Lng && i.Longitude <= br.Lng &&
                              i.AuditStatus != Constants.StatusDelete
                        select i;
            }
            else if (status == 1) // new
            {
                if (AuditorNewMode)
                {
                    if (auditor)
                        query = from i in _entities.Outlets
                                where i.Latitude >= bl.Lat && i.Latitude <= tl.Lat &&
                                      i.Longitude >= bl.Lng && i.Longitude <= br.Lng &&
                                      i.AuditStatus == Constants.StatusPost &&
                                      i.PersonID != personID
                                select i;
                    else
                        query = from i in _entities.Outlets
                                where i.Latitude >= bl.Lat && i.Latitude <= tl.Lat &&
                                      i.Longitude >= bl.Lng && i.Longitude <= br.Lng &&
                                      (i.AuditStatus == Constants.StatusNew || i.AuditStatus == Constants.StatusPost) &&
                                      i.PersonID == personID
                                select i;
                }
                else
                {
                    query = from i in _entities.Outlets
                            where i.Latitude >= bl.Lat && i.Latitude <= tl.Lat &&
                                  i.Longitude >= bl.Lng && i.Longitude <= br.Lng &&
                                  (i.AuditStatus == Constants.StatusNew || i.AuditStatus == Constants.StatusPost) &&
                                  i.PersonID == personID
                            select i;
                }
            }
            else if (status == 2) // edit
            {
                if (auditor)
                    query = from i in _entities.Outlets
                            where i.Latitude >= bl.Lat && i.Latitude <= tl.Lat &&
                                  i.Longitude >= bl.Lng && i.Longitude <= br.Lng &&
                                  i.AuditStatus == Constants.StatusEdit &&
                                  i.PersonID != personID
                            select i;
                else
                    query = from i in _entities.Outlets
                            where i.Latitude >= bl.Lat && i.Latitude <= tl.Lat &&
                                  i.Longitude >= bl.Lng && i.Longitude <= br.Lng &&
                                  i.AuditStatus == Constants.StatusEdit &&
                                  i.AmendBy == personID
                            select i;
            }
            else // audit
            {
                query = from i in _entities.Outlets
                        where i.Latitude >= bl.Lat && i.Latitude <= tl.Lat &&
                              i.Longitude >= bl.Lng && i.Longitude <= br.Lng &&
                              (i.AuditStatus == Constants.StatusAuditAccept || i.AuditStatus == Constants.StatusAuditDeny) &&
                              i.AmendBy == personID
                        select i;
            }
                        
            if (query.Any())
            {
                var arr = query.ToArray();
                Array.Sort(arr, delegate (Outlet o1, Outlet o2)
                {
                    if (o1.Distance == 0)
                        o1.Distance = DistanceHelper.CalcDistance(curLocation, new Point { Lat = o1.Latitude, Lng = o1.Longitude });
                    if (o2.Distance == 0)
                        o2.Distance = DistanceHelper.CalcDistance(curLocation, new Point { Lat = o2.Latitude, Lng = o2.Longitude });
                    return o1.Distance.CompareTo(o2.Distance);
                });
                int found = 0;
                foreach (var outlet in arr)
                {
                    if (outlet.AuditStatus == Constants.StatusNew && outlet.PersonID != personID) continue;

                    double distance = outlet.Distance;
                    //DistanceHelper.CalcDistance(curLocation, new Point { Lat = outlet.Latitude, Lng = outlet.Longitude });
                    //value == "circle"
                    bool isMatched = string.Compare(method, "squard", StringComparison.OrdinalIgnoreCase) == 0;
                    if (string.Compare(method, "circle", StringComparison.OrdinalIgnoreCase) == 0)
                        isMatched = distance <= meter;

                    if (isMatched)
                    {
                        var foundOutlet = ToOutletModel(outlet);
                        foundOutlet.Distance = distance;
                        res.Add(foundOutlet);
                        found++;
                    }
                    if (found >= count) break;
                }
            }
            return res;
        }

        private OutletModel ToOutletModel(Outlet outlet)
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
                PAction = 0,
                PNote = "",
                InputBy = outlet.InputBy,
                AmendBy = outlet.AmendBy,
                AmendDate = outlet.AmendDate.ToString("yyyy-MM-dd HH:mm:ss"),
                AuditStatus = outlet.AuditStatus,
                CreateDate = outlet.CreateDate.ToString("yyyy-MM-dd HH:mm:ss"),
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

                //string path = AppDomain.CurrentDomain.BaseDirectory; //GetType().Assembly.Location; // ...\bin\...
                //path = Path.GetDirectoryName(path) + "\\Images";
                //EnsureDirExist(path);
               

                //if (!string.IsNullOrEmpty(foundOutlet.StringImage1))
                //{
                //    string imagePath = Path.Combine(path, string.Format("{0}_{1}.jpg", outletID, index));

                //    file.SaveAs(imagePath);
                //}
            }

            var person = _entities.People.FirstOrDefault(p=>p.ID == outlet.PersonID);
            if(person != null)
            {
                foundOutlet.PersonLastName = person.LastName;
                foundOutlet.PersonFirstName = person.FirstName;
            }

            return foundOutlet;
        }

        public string SaveOutlet(OutletModel outlet)
        {
            Outlet existingOutlet = null;
            if (!string.IsNullOrEmpty(outlet.PRowID))
                existingOutlet = _entities.Outlets.FirstOrDefault(i => i.PRowID.ToString() == outlet.PRowID);

            if (existingOutlet == null)
                existingOutlet = _entities.Outlets.FirstOrDefault(i => i.ID == outlet.ID);

           
            if (existingOutlet == null && outlet.AuditStatus != Constants.StatusDelete)
            {                
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
           
            if (outlet.AuditStatus == Constants.StatusDelete)
            {
                DeleteOutlet(outlet.PersonID, outlet.ID);
                return outlet.PRowID;
            }
            else
            {
                string note = "";
                byte action = ActionUpdate;
                switch (outlet.AuditStatus)
                {
                    case Constants.StatusAuditAccept:
                        action = ActionAudit;
                        note = "Audit Accept";
                        break;
                    case Constants.StatusAuditDeny:
                        action = ActionAudit;
                        note = "Audit Deny";
                        break;
                    case Constants.StatusDelete:
                        action = ActionDelete;
                        note = "Delete Outlet";
                        break;
                    case Constants.StatusPost:
                        action = ActionDelete;
                        note = "Post Outlet";
                        break;
                    case Constants.StatusNew:
                        action = ActionDelete;
                        note = "New Outlet";
                        break;
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
                    try {
                        existingOutlet.CloseDate = DateTime.ParseExact(outlet.CloseDate, "yyyy-MM-dd HH:mm:ss", null);
                    } catch {
                        existingOutlet.CloseDate = DateTime.ParseExact(outlet.CloseDate, "yyyy-MM-dd", null);
                    }
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
                existingOutlet.AuditStatus = (byte)outlet.AuditStatus;
                if (!string.IsNullOrEmpty(outlet.PRowID))
                    existingOutlet.PRowID = new Guid(outlet.PRowID);

                if (existingOutlet.OutletImages.Count() > 0)
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
                AppendOutletHistory(outlet.AmendBy, outlet.ID, outlet.PAction, outlet.PNote);
                _entities.SaveChanges();
                return existingOutlet.PRowID.ToString();
            }
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
  
        public string SaveImage(string personID, string outletID, string index,  HttpPostedFile file)
        {           
            string path = AppDomain.CurrentDomain.BaseDirectory; //GetType().Assembly.Location; // ...\bin\...
            path = Path.GetDirectoryName(path) + "\\Images";
            EnsureDirExist(path);
            string imagePath = Path.Combine(path, string.Format("{0}_{1}.jpg", outletID, index));

            file.SaveAs(imagePath);
          
            var id = int.Parse(outletID);
            var amendby = int.Parse(personID);
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

        private void TrackOutletChanged(Guid rowID, int personID,  string note, byte status, byte action)
        {
            SyncHistory hist = new SyncHistory()
            {
                TableName = "Outlet",
                SyncDateTime = DateTime.Now,
                SyncBy = personID,
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

        private void AppendOutletHistory(int personID, int outletID, int action, string note)
        {
            var hist = new OutletHistory {
                OutletID = outletID,
                PersonID = personID,
                Action = action,
                Note = string.IsNullOrEmpty(note) ? "" : note,
                InputBy = personID,
                InputDate = DateTime.Now,
            };
            _entities.OutletHistories.Add(hist);
        }

        public void DeleteOutlet(int personID, int outletID)
        {
            Outlet existingOutlet = _entities.Outlets.FirstOrDefault(i => i.ID == outletID);
            if (existingOutlet != null)
            {
                var imgs = existingOutlet.OutletImages.ToArray();
                foreach(var img in imgs)
                {
                    img.Outlet = null;
                    _entities.OutletImages.Remove(img);
                }
                existingOutlet.OutletImages.Clear();

                _entities.Outlets.Remove(existingOutlet);

                AppendOutletHistory(personID, outletID, ActionDelete, string.Format("Delete {0}", existingOutlet.Name));
            }

            _entities.SaveChanges();
        }
    }

    public class Point
    {
        public double Lat { get; set; }
        public double Lng { get; set; }
    }

    public class DistanceHelper
    {
        public static double CalcDistance(Point p1, Point p2)
        {
            var R = 6378137; // Earth’s mean radius in meter
            var dLat = CalcRad(p2.Lat - p1.Lat);
            var dLong = CalcRad(p2.Lng - p1.Lng);
            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) + Math.Cos(CalcRad(p1.Lat)) * Math.Cos(CalcRad(p2.Lat)) *
                    Math.Sin(dLong / 2) * Math.Sin(dLong / 2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            var d = R * c;
            return Math.Round(d, 2);
        }

        public static double CalcRad(double x)
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

        public static Point CalcShiftedPoint(double dlat, double dlng, Point p)
        {
            Point newP = new Point
            {
                Lat = p.Lat + (dlat / Constants.EarthR) * (180 / Math.PI),
                Lng = p.Lng + (dlng / Constants.EarthR) * (180 / Math.PI) / Math.Cos(p.Lat * Math.PI / 180)
            };
            return newP;
        }

    }

    partial class Outlet
    {
        public double Distance { get; set; }
    }
}