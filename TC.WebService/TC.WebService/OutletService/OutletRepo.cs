using Ionic.Zip;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Web;
using TradeCensus.Shared;

namespace TradeCensus
{
    public class OutletRepo : BaseRepo
    {
        static object Locker = new object(); 
        //const byte ActionAdd = 0;
        //const byte ActionUpdate = 1;
        //const byte ActionUpdateImage = 2;   // absoluted
        //const byte ActionAudit = 3;
        //const byte ActionDelete = 4;
        //const byte ActionRevise = 5;

        //const byte OActionNew = 10;
        //const byte OActionPost = 11;
        //const byte OActionRevise = 12;
        //const byte OActionEdit = 13;
        //const byte OActionAuditApprove = 14;
        //const byte OActionAuditDeny = 15;
        //const byte OActionDelete = 16;
        const byte OActionDenyUpdate = 17;

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

        private string ImagesPath
        {
            get
            {
                string path = AppDomain.CurrentDomain.BaseDirectory;
                path = Path.GetDirectoryName(path) + "\\Images";
                EnsureDirExist(path);
                return path;
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
                if (auditor)
                    query = from i in _entities.Outlets
                            where i.Latitude >= bl.Lat && i.Latitude <= tl.Lat &&
                                  i.Longitude >= bl.Lng && i.Longitude <= br.Lng &&
                                  ((i.AuditStatus == Constants.StatusNew && i.PersonID == personID) || i.AuditStatus == Constants.StatusPost || i.AuditStatus == Constants.StatusAuditAccept || i.AuditStatus == Constants.StatusAuditDeny) //&&
                                  //i.PersonID != personID
                            select i;
                else
                    query = from i in _entities.Outlets
                            where i.Latitude >= bl.Lat && i.Latitude <= tl.Lat &&
                                  i.Longitude >= bl.Lng && i.Longitude <= br.Lng &&
                                  (i.AuditStatus == Constants.StatusNew || i.AuditStatus == Constants.StatusPost
                                  || i.AuditStatus == Constants.StatusAuditAccept || i.AuditStatus == Constants.StatusAuditDeny) //&&
                                  //i.PersonID == personID
                            select i;

                //if (AuditorNewMode)
                //{
                //    if (auditor)
                //        query = from i in _entities.Outlets
                //                where i.Latitude >= bl.Lat && i.Latitude <= tl.Lat &&
                //                      i.Longitude >= bl.Lng && i.Longitude <= br.Lng &&
                //                      i.AuditStatus == Constants.StatusPost &&
                //                      i.PersonID != personID
                //                select i;
                //    else
                //        query = from i in _entities.Outlets
                //                where i.Latitude >= bl.Lat && i.Latitude <= tl.Lat &&
                //                      i.Longitude >= bl.Lng && i.Longitude <= br.Lng &&
                //                      (i.AuditStatus == Constants.StatusNew || i.AuditStatus == Constants.StatusPost) &&
                //                      i.PersonID == personID
                //                select i;
                //}
                //else
                //{
                //    query = from i in _entities.Outlets
                //            where i.Latitude >= bl.Lat && i.Latitude <= tl.Lat &&
                //                  i.Longitude >= bl.Lng && i.Longitude <= br.Lng &&
                //                  (i.AuditStatus == Constants.StatusNew || i.AuditStatus == Constants.StatusPost) &&
                //                  i.PersonID == personID
                //            select i;
                //}
            }
            else if (status == 2) // edit
            {
                if (auditor)
                    query = from i in _entities.Outlets
                            where i.Latitude >= bl.Lat && i.Latitude <= tl.Lat &&
                                  i.Longitude >= bl.Lng && i.Longitude <= br.Lng &&
                                  (i.AuditStatus == Constants.StatusExistingPost) &&
                                  i.PersonID != personID
                            select i;
                else
                    query = from i in _entities.Outlets
                            where i.Latitude >= bl.Lat && i.Latitude <= tl.Lat &&
                                  i.Longitude >= bl.Lng && i.Longitude <= br.Lng &&
                                  (i.AuditStatus == Constants.StatusEdit ||
                                    i.AuditStatus == Constants.StatusExistingPost ||
                                    i.AuditStatus == Constants.StatusExistingAccept 
                                    || i.AuditStatus == Constants.StatusExistingDeny) &&  
                                  i.AmendBy == personID
                            select i;
            }
            else // audit
            {
                query = from i in _entities.Outlets
                        where i.Latitude >= bl.Lat && i.Latitude <= tl.Lat &&
                              i.Longitude >= bl.Lng && i.Longitude <= br.Lng &&
                              (i.AuditStatus == Constants.StatusAuditAccept || i.AuditStatus == Constants.StatusAuditDeny
                              || i.AuditStatus == Constants.StatusExistingAccept || i.AuditStatus == Constants.StatusExistingDeny) &&
                              i.AmendBy == personID
                        select i;
            }
                        
            if (query.Any())
            {
                var arr = query.ToArray();
                Array.Sort(arr, delegate (Outlet o1, Outlet o2)
                {
                    if (o1.Distance == 0)
                        o1.Distance = DistanceHelper.CalcDistance(curLocation, new Point { Lat = o1.Lat, Lng = o1.Lng });
                    if (o2.Distance == 0)
                        o2.Distance = DistanceHelper.CalcDistance(curLocation, new Point { Lat = o2.Lat, Lng = o2.Lng });
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
                CloseDate = outlet.CloseDate == null ? "" : outlet.CloseDate.Value.ToString("yyyy-MM-dd"),
                IsOpened = outlet.CloseDate == null,
                District = outlet.District,
                LastContact = outlet.LastContact,
                LastVisit = outlet.LastVisit != null ? outlet.LastVisit.Value.ToString("yyyy-MM-dd") : "",
                Latitude = outlet.Lat,
                Longitude = outlet.Lng,
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
                InputBy = outlet.InputBy ==null? 0 : outlet.InputBy.Value,
                AmendBy = outlet.AmendBy ==null ?0 : outlet.AmendBy.Value,
                AmendDate = outlet.AmendDate ==null ? DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss") : outlet.AmendDate.Value.ToString("yyyy-MM-dd HH:mm:ss"),
                AuditStatus = outlet.AuditStatus,
                CreateDate = outlet.CreateDate == null ? DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss") : outlet.CreateDate.Value.ToString("yyyy-MM-dd HH:mm:ss"),
                OutletSource = 0,
                StringImage1 = "",
                StringImage2 = "",
                StringImage3 = "",
                TotalVolume = outlet.TotalVolume,
                VBLVolume = outlet.VBLVolume,
            };
           
            //if (outlet.DEDISID > 0)
            //    foundOutlet.OutletSource = 1;
            //else if (outlet.DISAlias != null)
            //    foundOutlet.OutletSource = string.IsNullOrEmpty(outlet.DISAlias.Trim()) ? 0 : 1;

            foundOutlet.FullAddress = string.Format("{0} {1} {2} {3}", outlet.AddLine, outlet.AddLine2, outlet.District, foundOutlet.ProvinceName);
            foundOutlet.FullAddress = foundOutlet.FullAddress.Trim().Replace("  ", " ");

            var outletImg = outlet.OutletImages.FirstOrDefault();
            if (outletImg != null)
            {
                foundOutlet.StringImage1 = ToBase64(outletImg.ImageData1);
                foundOutlet.StringImage2 = ToBase64(outletImg.ImageData2);
                foundOutlet.StringImage3 = ToBase64(outletImg.ImageData3);

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
                foundOutlet.PersonIsDSM = person.IsDSM;
                foundOutlet.OutletSource = person.IsDSM ? 1 : 0;
            }

            return foundOutlet;
        }

        private string ToActionMsg(int auditStatus)
        {
            if (auditStatus == Constants.StatusEdit)
            {
                return "Edit existed outlet";
            }
            else if (auditStatus == Constants.StatusNew)
            {
                return "Create new outlet";
            }
            else if (auditStatus == Constants.StatusPost)
            {
                return "Post new outlet";
            }
            else if (auditStatus == Constants.StatusAuditAccept)
            {
                return "Approve new outlet (audit)";
            }
            else if (auditStatus == Constants.StatusAuditDeny)
            {
                return "Deny new outlet (audit)";
            }
            else if (auditStatus == Constants.StatusExistingAccept)
            {
                return "Approve existing outlet (audit)";
            }
            else if (auditStatus == Constants.StatusExistingDeny)
            {
                return "Deny existing outlet (audit)";
            }
            else if (auditStatus == Constants.StatusDelete)
            {
                return "Delete outlet";
            }
            else if (auditStatus == Constants.StatusDeny)
            {
                return "Deny update outlet";
            }
            else
            {
                return "Unknown";
            }
        }

        public Outlet SaveOutlet(OutletModel outlet, bool saveChanged = true)
        {
            Outlet existingOutlet = null;
            if (!string.IsNullOrEmpty(outlet.PRowID))
                existingOutlet = _entities.Outlets.FirstOrDefault(i => i.PRowID.ToString() == outlet.PRowID);

            if (existingOutlet == null && outlet.ID != 600000000)
                existingOutlet = _entities.Outlets.FirstOrDefault(i => i.ID == outlet.ID);

            if (existingOutlet == null)
            {
                if (outlet.AuditStatus == Constants.StatusDelete) return null; // already delete
                lock (Locker)
                {
                    if (outlet.ID == 600000000)
                        outlet.ID = GetNextOutletID(int.Parse(outlet.ProvinceID));
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
                        AuditStatus = Constants.StatusNew,
                    };
                    _entities.Outlets.Add(existingOutlet);
                    return UpdateOutlet(outlet, existingOutlet, saveChanged);
                }
            }
            else
                return UpdateOutlet(outlet, existingOutlet, saveChanged);
        }

        private Outlet UpdateOutlet(OutletModel outlet, Outlet existingOutlet, bool saveChanged = true)
        {
            if (existingOutlet.AuditStatus == Constants.StatusAuditAccept ||
                existingOutlet.AuditStatus == Constants.StatusAuditDeny ||
                existingOutlet.AuditStatus == Constants.StatusExistingAccept ||
                existingOutlet.AuditStatus == Constants.StatusExistingDeny ||
                existingOutlet.AuditStatus == Constants.StatusDone)
            {
                AppendOutletHistory(outlet.AmendBy, outlet.ID, Constants.StatusAuditDeny, "Cannot update audited outlet");
                if (saveChanged)
                    _entities.SaveChanges();
                throw new DeniedException("Cannot update because outlet(s) audited!");
            }

            if (outlet.AuditStatus == Constants.StatusDelete)
            {
                DeleteOutlet(outlet.PersonID, outlet.ID);
                return null;
            }
            else
            {
                //if (!isNewOutlet && outlet.AuditStatus == Constants.StatusNew && (
                //    existingOutlet.AuditStatus != Constants.StatusPost ||
                //    existingOutlet.AuditStatus != Constants.StatusNew))
                //{
                //    throw new Exception("Cannot Revise outlet, the data is out of synced. Click Refresh button to reload data");
                //}

                existingOutlet.AreaID = outlet.AreaID;
                existingOutlet.Name = outlet.Name;
                existingOutlet.OTypeID = outlet.OTypeID;
                existingOutlet.AddLine = outlet.AddLine;
                existingOutlet.AddLine2 = outlet.AddLine2;
                existingOutlet.District = outlet.District;
                existingOutlet.ProvinceID = outlet.ProvinceID;
                existingOutlet.Phone = outlet.Phone;
                if (!string.IsNullOrEmpty(outlet.CloseDate))
                    try
                    {
                        existingOutlet.CloseDate = DateTime.ParseExact(outlet.CloseDate, "yyyy-MM-dd HH:mm:ss", null);
                    }
                    catch
                    {
                        try
                        {
                            existingOutlet.CloseDate = DateTime.ParseExact(outlet.CloseDate, "yyyy-MM-dd", null);
                        }
                        catch
                        {
                            existingOutlet.CloseDate = DateTime.Now;
                        }
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

                OutletImage outletImage = existingOutlet.OutletImages.FirstOrDefault();
                if (outletImage == null)
                {
                    outletImage = new OutletImage();
                    outletImage.Outlet = existingOutlet;
                    existingOutlet.OutletImages.Add(outletImage);
                }

                if (string.IsNullOrEmpty(outlet.StringImage1))
                {
                    outletImage.Image1 = "";
                    outletImage.ImageData1 = null;
                }
                else if (!outlet.StringImage1.ToUpper().StartsWith("/IMAGE"))
                {
                    byte[] data;
                    string relativePath;
                    SaveToFile(existingOutlet.ID, 1, outlet.StringImage1, out relativePath, out data);
                    outletImage.Image1 = relativePath;
                    outletImage.ImageData1 = data;
                }

                if (string.IsNullOrEmpty(outlet.StringImage2))
                {
                    outletImage.Image2 = "";
                    outletImage.ImageData2 = null;
                }
                else if (!outlet.StringImage2.ToUpper().StartsWith("/IMAGE"))
                {
                    byte[] data;
                    string relativePath;
                    SaveToFile(existingOutlet.ID, 2, outlet.StringImage2, out relativePath, out data);
                    outletImage.Image2 = relativePath;
                    outletImage.ImageData2 = data;
                }

                if (string.IsNullOrEmpty(outlet.StringImage3))
                {
                    outletImage.Image3 = "";
                    outletImage.ImageData3 = null;
                }
                else if (!outlet.StringImage3.ToUpper().StartsWith("/IMAGE"))
                {
                    byte[] data;
                    string relativePath;
                    SaveToFile(existingOutlet.ID, 3, outlet.StringImage3, out relativePath, out data);
                    outletImage.Image3 = relativePath;
                    outletImage.ImageData3 = data;
                }

                AppendOutletHistory(outlet.AmendBy, outlet.ID, (byte)outlet.AuditStatus, ToActionMsg(outlet.AuditStatus));
                if (saveChanged)
                    _entities.SaveChanges();
                return existingOutlet; ;
            }
        }

        private int GetNextOutletID(int provinceID)
        {
            var proId = provinceID.ToString("D2");
            var q = _entities.Database.SqlQuery<int>(string.Format("select top 1 dbo.ufn_GetNewOCode('{0}')", proId));
            if (q.Any()) return q.FirstOrDefault();
            var num = (new Random()).Next(10000, 99999);
            return int.Parse("6" + proId + num.ToString("D5"));
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

                //TrackOutletChanged(outlet.PRowID, amendby, "Save image", 0, ActionUpdateImage);

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
            return;
            //SyncHistory hist = new SyncHistory()
            //{
            //    TableName = "Outlet",
            //    SyncDateTime = DateTime.Now,
            //    SyncBy = personID,
            //    Note = note,
            //    Status = status,
            //};
            //_entities.SyncHistories.Add(hist);
            //var detail = new SyncDetail()
            //{
            //    Action = action,
            //    RowID = rowID,
            //    SyncHistory = hist,
            //};
            //hist.SyncDetails.Add(detail);
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

                AppendOutletHistory(personID, outletID, Constants.StatusDelete, ToActionMsg(Constants.StatusDelete));
            }

            _entities.SaveChanges();
        }

        public List<OutletModel> DownloadOutlets(int personID, string provinceID, int from, int to)
        {
            ValidatePerson(personID);
            //Person person = _entities.People.FirstOrDefault(i => i.ID == personID);
            //if (person == null)
            //    throw new Exception("User doesn't exist");

            StringBuilder sb = new StringBuilder();
            Stopwatch sw = new Stopwatch();
            sw.Start();
            //var persons = from p in _entities.People select p;

            List<OutletModel> outlets = new List<OutletModel>();
            Stopwatch sw1 = new Stopwatch();
            sw1.Start();
            //var query =  //from i in _entities.Outlets where i.ProvinceID == provinceID orderby i.ID select i
            var query = _entities.Outlets.Where(i => i.ProvinceID == provinceID)
                .OrderBy(i => i.ID).Skip(from).Take(to - from)
                //.Include(p => p.)
                .Include(im => im.OutletImages);
            sw1.Stop();
            if (query.Any())
            {
                foreach (var outlet in query)
                {
                    Stopwatch sw2 = new Stopwatch();
                    sw2.Start();
                    var outletModel = ToOutletModel(outlet);
                    var oimg = outlet.OutletImages.FirstOrDefault();
                    if (oimg != null)
                    {
                        if(!string.IsNullOrEmpty(oimg.Image1) && oimg.ImageData1 != null)
                            outletModel.StringImage1 = FormatBase64(Convert.ToBase64String(oimg.ImageData1));

                        if (!string.IsNullOrEmpty(oimg.Image2) && oimg.ImageData2 != null)
                            outletModel.StringImage2 = FormatBase64(Convert.ToBase64String(oimg.ImageData2));

                        if (!string.IsNullOrEmpty(oimg.Image3) && oimg.ImageData3 != null)
                            outletModel.StringImage3 = FormatBase64(Convert.ToBase64String(oimg.ImageData3));
                    }
                    outlets.Add(outletModel);
                    sw2.Stop();
                    sb.AppendLine(string.Format("{0},{1}", outlet.ID, sw2.ElapsedMilliseconds));
                }
            }
            sw.Stop();
            _logger.Info(string.Format("Query outlet times: {0}", sw.ElapsedMilliseconds));

            //Stopwatch sw3 = new Stopwatch();
            //sw3.Start();
            //string data = Newtonsoft.Json.JsonConvert.SerializeObject(outlets);
            //sw3.Stop();

            return outlets;
        }

        public string DownloadOutletsZip(int personID, string provinceID, int from, int to)
        {
            //ValidatePerson(personID);
            Stopwatch sw = new Stopwatch();
            sw.Start();
            var command = string.Format(@"select * from (
                            select Row_Number() over(order by Outlet.ID) as RowNo,
                                   Outlet.*,
                                   Person.FirstName as PersonFirstName, 
                                        Person.LastName as PersonLastName, 
                                        Person.IsDSM as PersonIsDSM, 
                                        Person.IsDSM as OutletSource, 
                                   ot.Name as OutletTypeName,
                                   oi.ImageData1, 
                                   oi.ImageData2, 
                                   oi.ImageData3
                              from outlet
                              left join OutletType as ot on ot.ID = Outlet.OTypeID 
                              left join Person on Person.ID = Outlet.PersonID 
                              left join OutletImage as oi on oi.OutletID = Outlet.ID
                              where outlet.ProvinceID = {2}
                        ) as tmp
                        where RowNo between {0} and {1}", from + 1, to, provinceID);

            var query = _entities.Database.SqlQuery<DownloadOutlet>(command);
            var results = query.ToArray();
            var outletHasImages = results.Where(o => (o.ImageData1 != null || o.ImageData2 != null || o.ImageData3 != null));
            //var test = results.FirstOrDefault(o => o.ID == 65000070);
            if (outletHasImages.Count() > 0)
                foreach (var o in outletHasImages)
                {
                    if (o.ImageData1 != null)
                        o.StringImage1 = FormatBase64(Convert.ToBase64String(o.ImageData1));

                    if (o.ImageData2 != null)
                        o.StringImage2 = FormatBase64(Convert.ToBase64String(o.ImageData2));

                    if (o.ImageData3 != null)
                        o.StringImage3 = FormatBase64(Convert.ToBase64String(o.ImageData3));
                }

            Stopwatch sw3 = new Stopwatch();
            sw3.Start();
            string data = Newtonsoft.Json.JsonConvert.SerializeObject(results);
            sw3.Stop();

            sw.Stop();
            _logger.Info(string.Format("Query outlet times: {0}", sw.ElapsedMilliseconds));
            return data;

            //using (MemoryStream ms = new MemoryStream())
            //{
            //    using (ZipFile zipper = new ZipFile())
            //    {
            //        zipper.AddEntry("outlets.txt", data);
            //        zipper.Save(ms);
            //        ms.Flush();
            //    }
            //    return ms.ToArray();
            //    // string zipData = Convert.ToBase64String(ms.ToArray());
            //}
        }

        public byte[] DownloadOutletsZipByte(int personID, string provinceID, int from, int to)
        {
            var data = DownloadOutletsZipByte(personID, provinceID, from, to);
            using (MemoryStream ms = new MemoryStream())
            {
                using (ZipFile zipper = new ZipFile())
                {
                    zipper.AddEntry("outlets.txt", data);
                    zipper.Save(ms);
                    ms.Flush();
                }
                return ms.ToArray();
                // string zipData = Convert.ToBase64String(ms.ToArray());
            }
        }

        public string DownloadImageBase64(int personID, int outletID, int index)
        {
            ValidatePerson(personID);
            string imageDir = ImagesPath;
            string imagePath = Path.Combine(imageDir, string.Format("{0}_{1}.jpg", outletID, index));
            if (File.Exists(imagePath))
            {
                return Convert.ToBase64String(File.ReadAllBytes(imagePath));
            }
            else
            {
                var outlet = _entities.Outlets.FirstOrDefault(o => o.ID == outletID);
                if (outlet != null)
                {
                    var outletImg = outlet.OutletImages.FirstOrDefault();
                    if (outletImg != null)
                    {
                        if (index == 1 && outletImg.ImageData1 != null)
                            return FormatBase64(Convert.ToBase64String(outletImg.ImageData1));

                        if (index == 2 && outletImg.ImageData2 != null)
                            return FormatBase64(Convert.ToBase64String(outletImg.ImageData2));

                        if (index == 3 && outletImg.ImageData3 != null)
                            return FormatBase64(Convert.ToBase64String(outletImg.ImageData3));
                    }
                }
            }
            return "";
        }

        public void UploadImageBase64(int personID, int outletID, int index, string image)
        {
          
            byte[] data;
            string relativePath;
            SaveToFile(outletID, index, image, out relativePath, out data);

            Outlet outlet = _entities.Outlets.FirstOrDefault(i => i.ID == outletID);
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

                if (index == 1)
                {
                    outletImage.ImageData1 = data;
                    outletImage.Image1 = relativePath;
                }
                else if (index == 2)
                {
                    outletImage.ImageData2 = data;
                    outletImage.Image2 = relativePath;
                }
                else if (index == 3)
                {
                    outletImage.ImageData3 = data;
                    outletImage.Image3 = relativePath;
                }
                outlet.AmendBy = personID;
                outlet.AmendDate = DateTime.Now;

                //TrackOutletChanged(outlet.PRowID, personID, "Save image", 0, ActionUpdateImage);

                _entities.SaveChanges();
            }
        }

        public DeniedException SaveOutlets(OutletModel[] outlets, List<SyncOutlet> dboutlets)
        {
            StringBuilder sb = new StringBuilder();
            foreach (var outlet in outlets)
            {
                try
                {
                    var o = SaveOutlet(outlet, true);
                    dboutlets.Add(new SyncOutlet { ID = o.ID, RowID = outlet.PRowID.ToString() });
                }
                catch (DeniedException ex)
                {
                    if (sb.Length == 0)
                    {
                        sb.AppendLine(ex.Message);
                        sb.AppendFormat("{0} ({1})", outlet.Name, outlet.ID);
                    }
                    else
                        sb.Append(", ").AppendFormat("{0} ({1})", outlet.Name, outlet.ID);

                    dboutlets.Add(new SyncOutlet { ID = outlet.ID, RowID = outlet.PRowID.ToString() });
                }
            }
            if (sb.Length > 0)
                return new DeniedException(sb.ToString());
            else return null;
        }

        private string FormatBase64(string s)
        {
            return s;//Constants.Base64 + Constants.FieldDelimeter + s;
        }

        private void SaveToFile(int outletID, int index, string image, out string relativePath, out byte[] data)
        {
            relativePath = string.Format("{0}_{1}.jpg", outletID, index);
            string imageDir = ImagesPath;
            string imagePath = Path.Combine(imageDir, relativePath);

            data = Convert.FromBase64String(image);
            try
            {
                File.WriteAllBytes(imagePath, data);
            }
            catch (Exception ex)
            {
                _logger.Warn(string.Format("Cannot save image of outlet {0} to {1}: {2}", outletID, imagePath, ex.ToString()));
            }
            relativePath = "/Images/" + relativePath;
        }

        public int GetTotalProvincesCount(int personID, string provinceID)
        {
            try
            {
                return _entities.Outlets.Count(i => i.ProvinceID == provinceID);
            }
            catch
            {
                return 0;
            }
        }

        public string ToBase64(byte[] img)
        {
            if (img == null) return "";
            return Convert.ToBase64String(img);
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
        public double Lat { get { return Latitude == null ? 0 : Latitude.Value; } }
        public double Lng { get { return Longitude == null ? 0 : Longitude.Value; } }
        public double Distance { get; set; }
    }

    public static class OutletExtend
    {
        public static string ToDownloadString(this Outlet outlet, Person person, string img1, string img2, string img3)
        {
            StringBuilder sb = new StringBuilder();
            //(65002226, 
            // "HRC", 
            // " ",
            // "KA", 
            // "KARAOKE E2 - NH THIÊN HỒNG", 
            // "199", 
            // "Điện Biên Phủ", 
            // "Q.3", 
            // "50", 
            // "0838248798", 
            // 0, 
            // "", 
            // "2009-04-10 00:00:00", 
            // 1, 
            // " ",
            // " ",
            // " ",
            // " ",
            // " ",
            // 0, 
            // "mr nghia", 
            // "", 
            // 12594, 
            // "Tăng Minh Gia", 
            // "Bảo", 
            // "", 
            // 106.692777, 
            // 10.785563, 
            // " ", 
            // 0, 
            // 0, 
            // " ", 
            // 11655, 
            // "2016-07-05 11:54:11", 
            // " ", 
            // 0, 
            // 0, 
            // 0, 
            // "", 
            // "", 
            // "", 
            // 0, 
            // "7a72490b-b3e6-4101-a5d8-14f8ec3cb045", 
            // 0, 
            // 0, 
            // 0, 
            // 1,
            // 0,
            // 1470384228911, 
            // 0)
            //var ts = outlet.AmendDate == null ? new TimeSpan() : outlet.AmendDate.Value.Subtract(new DateTime(1970, 1, 1));

            sb.Append(outlet.ID).Append(Constants.DataDelimeter);
            sb.Append(outlet.PRowID).Append(Constants.DataDelimeter);

            sb.Append(ToSql(outlet.ID)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(outlet.AreaID)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(outlet.TerritoryID)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(outlet.OTypeID)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(outlet.Name)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(outlet.AddLine)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(outlet.AddLine2)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(outlet.District)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(outlet.ProvinceID)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(outlet.Phone)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(outlet.CloseDate)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(outlet.CreateDate)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(outlet.Tracking)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(outlet.Class)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(outlet.Open1st)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(outlet.Close1st)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(outlet.Open2nd)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(outlet.Close2nd)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(outlet.SpShift)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(outlet.LastContact)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(outlet.LastVisit)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(outlet.PersonID)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(person.FirstName)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(person.LastName)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(outlet.Note)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(outlet.Longitude)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(outlet.Latitude)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(outlet.TaxID)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(outlet.ModifiedStatus)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(outlet.InputBy)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(outlet.InputDate)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(outlet.AmendBy)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(outlet.AmendDate)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(outlet.OutletEmail)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(outlet.AuditStatus)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(outlet.TotalVolume)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(outlet.VBLVolume)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(img1)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(img2)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(img3)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(outlet.PRowID)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(1)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(1)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(1)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(1)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(0)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(0)).Append(Constants.FieldDelimeter);
            sb.Append(ToSql(0));

            return sb.ToString();
        }

        private static string ToSql(object value)
        {
            if (value == null) return "\" \"";
            if (value is String)
            {
                // quoted text
                return "\"" + value + "\"";
            }
            else if (value is bool)
            {
                return (bool)value ? "1" : "0";
            }
            else if (value is long)
            {
                return value.ToString();
            }
            else if (value is int)
            {
                return value.ToString();
            }
            else if (value is decimal)
            {
                return value.ToString();
            }
            else if (value is DateTime)
            {
                return "\"" + ((DateTime)value).ToString("yyyy-MM-dd HH:mm:ss") + "\""; 
            }
            else
                return value.ToString();
        }
    }

    [Serializable]
    public class DownloadOutlet : Outlet
    {
        public long RowNo { get; set; }
        public string PersonFirstName { get; set; }
        public string PersonLastName { get; set; }
        public bool? PersonIsDSM { get; set; }

        [IgnoreDataMember]
        public byte[] ImageData1 { get; set; }
        [IgnoreDataMember]
        public byte[] ImageData2 { get; set; }
        [IgnoreDataMember]
        public byte[] ImageData3 { get; set; }

        public string StringImage1 { get; set; }
        public string StringImage2 { get; set; }
        public string StringImage3 { get; set; }
    }

    public class DeniedException : Exception
    {
        public DeniedException() : base()
        {

        }
        public DeniedException(string msg): base(msg)
        {

        }
    }
}