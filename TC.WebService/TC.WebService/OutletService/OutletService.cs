using Ionic.Zip;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using TradeCensus.Shared;

namespace TradeCensus
{
    public class OutletService : TradeCensusServiceBase, IOutletService
    {
        static object Locker = new object(); 
        
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

        public OutletService() : base("Outlet")
        {
        }

        private List<OutletShort> GetByProvinceID(int personID, string provinceID)
        {
            ValidatePerson(personID);
            Log("Get outlet by province id: {0}", provinceID);
            var items = _entities.Outlets.Where(i => i.ProvinceID == provinceID);
            Log("Found {0} outlets of province {1}", items.Count(), provinceID);
            List<OutletShort> ids = new List<OutletShort>();
            foreach (var i in items) ids.Add(new OutletShort { ID = i.ID, Name = i.Name });
            return ids;
        }

        private OutletModel GetByID(int personID, string id)
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

        private List<OutletType> GetAllOutletTypes()
        {
            Log("Get list of OutletTypes");
            return _entities.OutletTypes.ToList();
        }

        private List<OutletModel> GetOutletsByProvince(int personID, string provinceID)
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

        private List<OutletModel> GetOutletsByLocation1(int personID, double lat, double lng, double meter, int count, int status)
        {
            var user = _entities.PersonRoles.FirstOrDefault(i => i.PersonID == personID);
            if (user == null)
                throw new Exception(string.Format("User {0} doesn't exist", personID));
            var auditor = user.Role == Constants.RoleAudit ||  user.Role == Constants.RoleAudit1;

            string method = GetSetting("calc_distance_algorithm", "circle");            
            Log("Calculate distance method: {0}", method);
            var curLocation = new Point { Lat = lat, Lng = lng };
            Point tl = DistanceUtil.CalcShiftedPoint(meter, 0 - meter, curLocation);
            Point tr = DistanceUtil.CalcShiftedPoint(meter, meter, curLocation);
            Point bl = DistanceUtil.CalcShiftedPoint(0 - meter, 0 - meter, curLocation);
            Point br = DistanceUtil.CalcShiftedPoint(0 - meter, meter, curLocation);

            List<OutletModel> res = new List<OutletModel>();
            IQueryable<Outlet> query;
            if (status == 0) // near-by
            {
                query = (from i in _entities.Outlets
                         where i.Latitude >= bl.Lat && i.Latitude <= tl.Lat &&
                               i.Longitude >= bl.Lng && i.Longitude <= br.Lng &&
                               i.AuditStatus != Constants.StatusDelete
                         select i).Include(i => i.OutletImages);
            }
            else if (status == 1) // new
            {
                if (auditor)
                    query = from i in _entities.Outlets
                            where i.Latitude >= bl.Lat && i.Latitude <= tl.Lat &&
                                  i.Longitude >= bl.Lng && i.Longitude <= br.Lng &&
                                  ((i.AuditStatus == Constants.StatusAuditorNew && i.PersonID == personID) ||
                                    i.AuditStatus == Constants.StatusPost ||
                                    i.AuditStatus == Constants.StatusAuditAccept ||
                                    i.AuditStatus == Constants.StatusAuditDeny ||
                                    //i.AuditStatus == Constants.StatusAuditorNew ||
                                    i.AuditStatus == Constants.StatusAuditorAccept) //&&
                                                                                    //i.PersonID != personID
                            select i;
                else
                    query = from i in _entities.Outlets
                            where i.Latitude >= bl.Lat && i.Latitude <= tl.Lat &&
                                  i.Longitude >= bl.Lng && i.Longitude <= br.Lng &&
                                  (i.AuditStatus == Constants.StatusNew ||
                                  i.AuditStatus == Constants.StatusPost ||
                                  i.AuditStatus == Constants.StatusAuditAccept ||
                                  i.AuditStatus == Constants.StatusAuditDeny ||
                                  //i.AuditStatus == Constants.StatusAuditorNew || 
                                  i.AuditStatus == Constants.StatusAuditorAccept) //&&
                                                                                  //i.PersonID == personID
                            select i;
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
                                   i.AuditStatus == Constants.StatusExistingAccept || 
                                   i.AuditStatus == Constants.StatusExistingDeny) &&
                                  i.AmendBy == personID
                            select i;
            }
            else if (status == 3) // audit
            {
                query = from i in _entities.Outlets
                        where i.Latitude >= bl.Lat && i.Latitude <= tl.Lat &&
                              i.Longitude >= bl.Lng && i.Longitude <= br.Lng &&
                              (i.AuditStatus == Constants.StatusAuditAccept || i.AuditStatus == Constants.StatusAuditDeny ||
                              i.AuditStatus == Constants.StatusExistingAccept || i.AuditStatus == Constants.StatusExistingDeny ||
                              i.AuditStatus == Constants.StatusAuditorAccept) &&
                              i.AmendBy == personID
                        select i;
            }
            else  // new by person id
            {
                if (auditor)
                    query = from i in _entities.Outlets
                            where i.Latitude >= bl.Lat && i.Latitude <= tl.Lat &&
                                  i.Longitude >= bl.Lng && i.Longitude <= br.Lng &&
                                  i.PersonID == personID &&
                                  (i.AuditStatus == Constants.StatusAuditorNew || i.AuditStatus == Constants.StatusAuditorAccept)
                            select i;
                else
                    query = from i in _entities.Outlets
                            where i.Latitude >= bl.Lat && i.Latitude <= tl.Lat &&
                                  i.Longitude >= bl.Lng && i.Longitude <= br.Lng &&
                                  i.PersonID == personID &&
                                  (i.AuditStatus == Constants.StatusNew ||
                                   i.AuditStatus == Constants.StatusPost ||
                                   i.AuditStatus == Constants.StatusAuditAccept ||
                                   i.AuditStatus == Constants.StatusAuditDeny)
                            select i;
            }
                        
            if (query.Any())
            {
                var arr = query.ToArray();
                Array.Sort(arr, delegate (Outlet o1, Outlet o2)
                {
                    if (o1.Distance == 0)
                        o1.Distance = DistanceUtil.CalcDistance(curLocation, new Point { Lat = o1.Lat, Lng = o1.Lng });
                    if (o2.Distance == 0)
                        o2.Distance = DistanceUtil.CalcDistance(curLocation, new Point { Lat = o2.Lat, Lng = o2.Lng });
                    return o1.Distance.CompareTo(o2.Distance);
                });
                int found = 0;
                foreach (var outlet in arr)
                {
                    if ((outlet.AuditStatus == Constants.StatusNew || outlet.AuditStatus == Constants.StatusAuditorNew) && 
                        outlet.PersonID != personID) continue;

                    double distance = outlet.Distance;
                    //DistanceUtil.CalcDistance(curLocation, new Point { Lat = outlet.Latitude, Lng = outlet.Longitude });
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

        private List<OutletModel> GetOutletsByLocation(int personID, double lat, double lng, double meter, int count, int status)
        {
            var user = _entities.PersonRoles.FirstOrDefault(i => i.PersonID == personID);
            if (user == null)
                throw new Exception(string.Format("User {0} doesn't exist", personID));
            var auditor = user.Role == Constants.RoleAudit || user.Role == Constants.RoleAudit1;

            string method = GetSetting("calc_distance_algorithm", "circle");
            Log("Calculate distance method: {0}", method);
            var curLocation = new Point { Lat = lat, Lng = lng };
            Point tl = DistanceUtil.CalcShiftedPoint(meter, 0 - meter, curLocation);
            Point tr = DistanceUtil.CalcShiftedPoint(meter, meter, curLocation);
            Point bl = DistanceUtil.CalcShiftedPoint(0 - meter, 0 - meter, curLocation);
            Point br = DistanceUtil.CalcShiftedPoint(0 - meter, meter, curLocation);

            List<OutletModel> res = new List<OutletModel>();
            var command = QueryOutletCommand(status, bl.Lat, tl.Lat, bl.Lng, br.Lng,  personID, auditor);

            var query = _entities.Database.SqlQuery<OutletEntity>(command); 
            if (query.Any())
            {
                var arr = query.ToArray();
                Array.Sort(arr, delegate (OutletEntity o1, OutletEntity o2)
                {
                    if (o1.Distance == 0)
                        o1.Distance = DistanceUtil.CalcDistance(curLocation, new Point { Lat = o1.Lat, Lng = o1.Lng });
                    if (o2.Distance == 0)
                        o2.Distance = DistanceUtil.CalcDistance(curLocation, new Point { Lat = o2.Lat, Lng = o2.Lng });
                    return o1.Distance.CompareTo(o2.Distance);
                });
                int found = 0;
                foreach (var outlet in arr)
                {
                    if ((outlet.AuditStatus == Constants.StatusNew || outlet.AuditStatus == Constants.StatusAuditorNew) &&
                        outlet.PersonID != personID) continue;

                    double distance = outlet.Distance;
                    //DistanceUtil.CalcDistance(curLocation, new Point { Lat = outlet.Latitude, Lng = outlet.Longitude });
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

        private string QueryOutletCommand(int status, double minLat, double maxLat, double minLng, double maxLng, int personID, bool auditor)
        {
            string sqlCommand =
              @"select o.*, 
		            ot.Name as OutletTypeName, 
                    pr.Name as ProvinceName,
		            p.FirstName as PersonFirstName,  
		            p.LastName as PersonLastName,
		            p.IsDSM as PersonIsDSM
	            from 
		            Outlet as o 
                    left join Province pr on o.ProvinceID = pr.ID
		            left join OutletType ot on o.OTypeID = ot.ID
		            left join Person p on p.ID = o.PersonID ";

            if (status == 0) // near-by
            {
                sqlCommand += string.Format(
                    @"where
                        o.Latitude >= {0} AND o.Latitude <= {1} AND
                        o.Longitude >= {2} AND o.Longitude <= {3} AND
                        o.AuditStatus <> {4}", minLat, maxLat, minLng, maxLng, Constants.StatusDelete
                    );
            }
            else if (status == 1) // new
            {
                if (auditor)
                    sqlCommand += string.Format(
                        @"where
                            o.Latitude >= {0} AND o.Latitude <= {1} AND
                            o.Longitude >= {2} AND o.Longitude <= {3} AND
                            (
                                (o.AuditStatus = {4} AND o.PersonID = {5}) OR 
                                o.AuditStatus IN ({6}, {7}, {8}, {9})  
                            )",
                            minLat, maxLat, minLng, maxLng,
                            Constants.StatusAuditorNew, personID,
                            Constants.StatusPost,
                            Constants.StatusAuditAccept,
                            Constants.StatusAuditDeny,
                            Constants.StatusAuditorAccept
                        );
                else
                    sqlCommand += string.Format(
                       @"where
                            o.Latitude >= {0} AND o.Latitude <= {1} AND
                            o.Longitude >= {2} AND o.Longitude <= {3} AND 
                            o.AuditStatus IN ({4}, {5}, {6}, {7}, {8})",
                            minLat, maxLat, minLng, maxLng,
                            Constants.StatusNew,
                            Constants.StatusPost,
                            Constants.StatusAuditAccept,
                            Constants.StatusAuditDeny,
                            Constants.StatusAuditorAccept
                       );
            }
            else if (status == 2) // edit
            {
                if (auditor)
                    sqlCommand += string.Format(
                       @"where
                            o.Latitude >= {0} AND o.Latitude <= {1} AND
                            o.Longitude >= {2} AND o.Longitude <= {3} AND
                            o.AuditStatus = {4} AND
                            o.PersonID <> {5}",
                            minLat, maxLat, minLng, maxLng,
                            Constants.StatusExistingPost,
                            personID);
                else
                    sqlCommand += string.Format(
                     @"where
                        o.Latitude >= {0} AND o.Latitude <= {1} AND
                        o.Longitude >= {2} AND o.Longitude <= {3} AND 
                        o.AmendBy = {4} AND
                        o.AuditStatus IN ({5}, {6}, {7}, {8})",
                          minLat, maxLat, minLng, maxLng,
                          personID,
                          Constants.StatusEdit,
                          Constants.StatusExistingPost,
                          Constants.StatusExistingAccept,
                          Constants.StatusExistingDeny
                     );
            }
            else if (status == 3) // audit
            {
                sqlCommand += string.Format(
                     @"where
                        o.Latitude >= {0} AND o.Latitude <= {1} AND
                        o.Longitude >= {2} AND o.Longitude <= {3} AND 
                        o.AmendBy = {4} AND
                        o.AuditStatus IN ({5}, {6}, {7}, {8}, {9})",
                          minLat, maxLat, minLng, maxLng,
                          personID,
                          Constants.StatusAuditAccept,
                          Constants.StatusAuditDeny,
                          Constants.StatusExistingAccept,
                          Constants.StatusExistingDeny,
                          Constants.StatusAuditorAccept
                     );
            }
            else  // new by person id
            {
                if (auditor)
                    sqlCommand += string.Format(
                    @"where
                            o.Latitude >= {0} AND o.Latitude <= {1} AND
                            o.Longitude >= {2} AND o.Longitude <= {3} AND 
                            o.PersonID = {4} AND
                            o.AuditStatus IN ({5}, {6})",
                         minLat, maxLat, minLng, maxLng,
                         personID,
                         Constants.StatusAuditorNew,
                         Constants.StatusAuditorAccept
                    );
                else
                    sqlCommand += string.Format(
                    @"where
                            o.Latitude >= {0} AND o.Latitude <= {1} AND
                            o.Longitude >= {2} AND o.Longitude <= {3} AND 
                            o.PersonID = {4} AND
                            o.AuditStatus IN ({5}, {6}, {7}, {8})",
                         minLat, maxLat, minLng, maxLng,
                         personID,
                         Constants.StatusNew,
                         Constants.StatusPost,
                         Constants.StatusAuditAccept,
                         Constants.StatusAuditDeny
                    );
            }

            return sqlCommand;
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
                InputBy = outlet.InputBy == null ? 0 : outlet.InputBy.Value,
                AmendBy = outlet.AmendBy == null ? 0 : outlet.AmendBy.Value,
                AmendDate = outlet.AmendDate == null ? DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss") : outlet.AmendDate.Value.ToString("yyyy-MM-dd HH:mm:ss"),
                AuditStatus = outlet.AuditStatus,
                CreateDate = outlet.CreateDate == null ? DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss") : outlet.CreateDate.Value.ToString("yyyy-MM-dd HH:mm:ss"),
                OutletSource = 0,
                StringImage1 = "",
                StringImage2 = "",
                StringImage3 = "",
                TotalVolume = outlet.TotalVolume,
                VBLVolume = outlet.VBLVolume,
                PStatus = outlet.PModifiedStatus,
            };

            //int pstatus = 0;
            //if(outlet.PCloseDate != outlet.CloseDate)
            //    pstatus |= 1;
            //if (outlet.PTracking != outlet.PTracking)
            //    pstatus |= 2;
            //foundOutlet.PStatus = pstatus;

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
            else if (auditStatus == Constants.StatusAuditorAccept)
            {
                return "Approve auditor outlet";
            }
            else if (auditStatus == Constants.StatusRevert)
            {
                return "Revert change";
            }
            else
            {
                return "Unknown";
            }
        }

        private Outlet InsertOrUpdateOutlet(OutletModel outlet, bool saveChanged = true)
        {
            Outlet existingOutlet = null;
            if (!string.IsNullOrEmpty(outlet.PRowID))
                existingOutlet = _entities.Outlets.FirstOrDefault(i => i.PRowID.ToString() == outlet.PRowID);

            if (existingOutlet == null && outlet.ID != 600000000)
                existingOutlet = _entities.Outlets.FirstOrDefault(i => i.ID == outlet.ID);

            if (existingOutlet == null && outlet.AuditStatus == Constants.StatusDelete)
                return null;

            if (existingOutlet == null)
            {
                if (outlet.AuditStatus == Constants.StatusDelete) return null; // already delete
                lock (Locker)
                {
                    if (outlet.ID == 600000000)
                        outlet.ID = GetNextOutletID(int.Parse(outlet.ProvinceID));

                    outlet.AmendBy = outlet.InputBy;
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
                        PRowID = Guid.NewGuid(),
                        AuditStatus = Constants.StatusNew,
                        PModifiedStatus = 0,
                    };
                    _entities.Outlets.Add(existingOutlet);
                    return UpdateOutlet(outlet, existingOutlet, saveChanged);
                }
            }
            else
                return UpdateOutlet(outlet, existingOutlet, saveChanged);
        }

        private Outlet UpdateOutlet(OutletModel outlet, Outlet dbOutlet, bool saveChanged = true)
        {
            if (dbOutlet.AuditStatus == Constants.StatusAuditAccept ||
                dbOutlet.AuditStatus == Constants.StatusAuditDeny ||
                dbOutlet.AuditStatus == Constants.StatusExistingAccept ||
                dbOutlet.AuditStatus == Constants.StatusExistingDeny ||
                dbOutlet.AuditStatus == Constants.StatusAuditorAccept ||
                dbOutlet.AuditStatus == Constants.StatusDone)
            {
                AppendOutletHistory(outlet.AmendBy, outlet.ID, Constants.StatusDeny, "Cannot update audited outlet");
                if (saveChanged)
                    _entities.SaveChanges();
                throw new DeniedException("Cannot update because outlet(s) audited!");
            }

            if (outlet.AuditStatus == Constants.StatusDelete)
            {
                DeleteOutlet(outlet.PersonID, outlet.ID);
                return null;
            }
            else if(outlet.AuditStatus == Constants.StatusRevert)
            {
                throw new NotImplementedException("Revert was not implemented!");
            }
            else
            {
                dbOutlet.AreaID = outlet.AreaID;
                dbOutlet.Name = outlet.Name;
                dbOutlet.OTypeID = outlet.OTypeID;
                dbOutlet.AddLine = outlet.AddLine;
                dbOutlet.AddLine2 = outlet.AddLine2;
                dbOutlet.District = outlet.District;
                dbOutlet.ProvinceID = outlet.ProvinceID;
                dbOutlet.Phone = outlet.Phone;
                if (!string.IsNullOrEmpty(outlet.CloseDate))
                    try
                    {
                        dbOutlet.CloseDate = DateTime.ParseExact(outlet.CloseDate, "yyyy-MM-dd HH:mm:ss", null);
                    }
                    catch
                    {
                        try
                        {
                            dbOutlet.CloseDate = DateTime.ParseExact(outlet.CloseDate, "yyyy-MM-dd", null);
                        }
                        catch
                        {
                            dbOutlet.CloseDate = DateTime.Now;
                        }
                    }
                else
                    dbOutlet.CloseDate = null;

                dbOutlet.Tracking = outlet.Tracking;
                dbOutlet.PersonID = outlet.PersonID;
                dbOutlet.Note = outlet.Note;
                dbOutlet.Longitude = outlet.Longitude;
                dbOutlet.Latitude = outlet.Latitude;
                dbOutlet.AmendBy = outlet.AmendBy;
                dbOutlet.AmendDate = DateTime.Now;
                dbOutlet.AuditStatus = (byte)outlet.AuditStatus;
                dbOutlet.TotalVolume = outlet.TotalVolume;
                dbOutlet.VBLVolume = outlet.VBLVolume;
                dbOutlet.AuditStatus = (byte)outlet.AuditStatus;
                dbOutlet.PModifiedStatus = outlet.PStatus;

                if (!string.IsNullOrEmpty(outlet.PRowID))
                    dbOutlet.PRowID = new Guid(outlet.PRowID);

                OutletImage outletImage = dbOutlet.OutletImages.FirstOrDefault();
                if (outletImage == null)
                {
                    outletImage = new OutletImage();
                    outletImage.Outlet = dbOutlet;
                    dbOutlet.OutletImages.Add(outletImage);
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
                    SaveToFile(dbOutlet.ID, 1, outlet.StringImage1, out relativePath, out data);
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
                    SaveToFile(dbOutlet.ID, 2, outlet.StringImage2, out relativePath, out data);
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
                    SaveToFile(dbOutlet.ID, 3, outlet.StringImage3, out relativePath, out data);
                    outletImage.Image3 = relativePath;
                    outletImage.ImageData3 = data;
                }

                AppendOutletHistory(outlet.AmendBy, outlet.ID, (byte)outlet.AuditStatus, ToActionMsg(outlet.AuditStatus));
                if (saveChanged)
                    _entities.SaveChanges();
                return dbOutlet;
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

        private string GetOutletImage(string outletID, string index)
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
                Note = "",
                InputBy = personID,
                InputDate = DateTime.Now,
            };
            _entities.OutletHistories.Add(hist);
        }

        private void DeleteOutlet(int personID, int outletID)
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

        private List<OutletModel> DownloadOutlets(int personID, string provinceID, int from, int to)
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

        private string DownloadOutletsZip(int personID, string provinceID, int from, int to)
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

        private byte[] DownloadOutletsZipByte(int personID, string provinceID, int from, int to)
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

        private string DownloadImageBase64(int personID, int outletID, int index)
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

        private void UploadImageBase64(int personID, int outletID, int index, string image)
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

        private DeniedException SaveOutlets(OutletModel[] outlets, List<SyncOutlet> dboutlets)
        {
            StringBuilder sb = new StringBuilder();
            foreach (var outlet in outlets)
            {
                try
                {
                    var o = InsertOrUpdateOutlet(outlet, true);
                    if (o != null)
                        dboutlets.Add(new SyncOutlet { ID = o.ID, RowID = outlet.PRowID.ToString() });
                    else
                        dboutlets.Add(new SyncOutlet { ID = 0, RowID = outlet.PRowID.ToString() });
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

        private string ToBase64(byte[] img)
        {
            if (img == null) return "";
            return Convert.ToBase64String(img);
        }


        #region IOutletService Interfaces

        public GetOutletIDResponse GetOutletsByProvince(string personID, string provinceID)
        {
            var resp = new GetOutletIDResponse();
            try
            {
                resp.Outlets = GetByProvinceID(int.Parse(personID), provinceID);
            }
            catch (Exception ex)
            {
                resp.Status = Constants.ErrorCode;
                resp.ErrorMessage = ex.Message;
            }
            return resp;
        }

        public GetOutletResponse GetOutletByID(string personID, string id)
        {
            var resp = new GetOutletResponse();
            try
            {
                resp.Item = GetByID(int.Parse(personID), id);
            }
            catch (Exception ex)
            {
                resp.Status = Constants.ErrorCode;
                resp.ErrorMessage = ex.Message;
            }
            return resp;
        }

        public GetOutletTypeResponse GetOutletTypes()
        {
            var resp = new GetOutletTypeResponse();
            try
            {
                resp.Items = GetAllOutletTypes();
            }
            catch (Exception ex)
            {
                resp.Status = Constants.ErrorCode;
                resp.ErrorMessage = ex.Message;
            }
            return resp;
        }

        public GetOutletListResponse GetNearbyOutlets(string personID, string lat, string lng, string meter, string count, string status)
        {
            var resp = new GetOutletListResponse();
            try
            {
                resp.Items = GetOutletsByLocation(int.Parse(personID),
                    Convert.ToDouble(lat), Convert.ToDouble(lng),
                    Convert.ToDouble(meter), Convert.ToInt32(count),
                    Convert.ToInt32(status));
            }
            catch (Exception ex)
            {
                resp.Status = Constants.ErrorCode;
                resp.ErrorMessage = ex.Message;
            }
            return resp;
        }

        public SaveOutletResponse SaveOutlet(OutletModel item)
        {
            var resp = new SaveOutletResponse();
            try
            {
                resp.ID = item.ID;
                var outlet = InsertOrUpdateOutlet(item);
                if (outlet != null)
                {
                    resp.ID = outlet.ID;
                    resp.RowID = outlet.PRowID.ToString();
                }
            }
            catch (Exception ex)
            {
                resp.Status = Constants.ErrorCode;
                resp.ErrorMessage = ex.Message;
            }
            return resp;
        }

        public SaveImageResponse SaveImage()
        {
            var resp = new SaveImageResponse();
            try
            {
                HttpPostedFile file = HttpContext.Current.Request.Files["orderfile"];
                if (file == null)
                    throw new Exception("File not found!");
                string outletid = HttpContext.Current.Request.Params["outletid"];
                string index = HttpContext.Current.Request.Params["index"];
                string userid = HttpContext.Current.Request.Params["userid"];
                resp.ImageThumb = SaveImage(userid, outletid, index, file);
            }
            catch (Exception ex)
            {
                resp.Status = Constants.ErrorCode;
                resp.ErrorMessage = ex.Message;
            }
            return resp;
        }

        public GetImageResponse GetImage(string outletID, string index)
        {
            var resp = new GetImageResponse();
            try
            {
                resp.Image = GetOutletImage(outletID, index);
            }
            catch (Exception ex)
            {
                resp.Status = Constants.ErrorCode;
                resp.ErrorMessage = ex.Message;
            }
            return resp;
        }

        public GetOutletListResponse DownloadOutlets(string personID, string provinceID, string from, string to)
        {
            var resp = new GetOutletListResponse();
            try
            {
                resp.Items = DownloadOutlets(int.Parse(personID), provinceID, int.Parse(from), int.Parse(to));
            }
            catch (Exception ex)
            {
                resp.Status = Constants.ErrorCode;
                resp.ErrorMessage = ex.Message;
            }
            return resp;
        }

        public int GetTotalProvincesCount(string personID, string provinceID)
        {
            try
            {
                ValidatePerson(int.Parse(personID));
                return _entities.Outlets.Count(i => i.ProvinceID == provinceID);
            }
            catch
            {
                return 0;
            }
        }

        public string DownloadOutletsZip(string personID, string provinceID, string from, string to)
        {
            try
            {
                return DownloadOutletsZip(int.Parse(personID), provinceID, int.Parse(from), int.Parse(to));
            }
            catch
            {
                return null;
            }
        }

        public byte[] DownloadOutletsZipByte(string personID, string provinceID, string from, string to)
        {
            try
            {

                return DownloadOutletsZipByte(int.Parse(personID), provinceID, int.Parse(from), int.Parse(to));
            }
            catch
            {
                return null;
            }
        }

        public GetImageResponse DownloadImageBase64(string personID, string outletID, string index)
        {
            var resp = new GetImageResponse();
            try
            {
                resp.Image = DownloadImageBase64(int.Parse(personID), int.Parse(outletID), int.Parse(index));
            }
            catch (Exception ex)
            {
                resp.Status = Constants.ErrorCode;
                resp.ErrorMessage = ex.Message;
            }
            return resp;
        }

        public Response UploadImageBase64(string personID, string outletID, string index, string image)
        {
            var resp = new Response();
            try
            {
                UploadImageBase64(int.Parse(personID), int.Parse(outletID), int.Parse(index), image);
            }
            catch (Exception ex)
            {
                resp.Status = Constants.ErrorCode;
                resp.ErrorMessage = ex.Message;
            }
            return resp;
        }

        public SyncOutletResponse SyncOutlets(OutletModel[] outlets)
        {
            var resp = new SyncOutletResponse();
            try
            {
                List<SyncOutlet> dboutlets = new List<SyncOutlet>();
                var error = SaveOutlets(outlets, dboutlets);
                resp.Outlets = dboutlets;
                if (error != null)
                {
                    resp.Status = Constants.Warning;
                    resp.ErrorMessage = error.Message;
                }
            }
            catch (Exception ex)
            {
                resp.Status = Constants.ErrorCode;
                resp.ErrorMessage = ex.Message;
            }
            return resp;
        }

        public GetOutletImagesResponse GetImages(string outletID)
        {
            var resp = new GetOutletImagesResponse();
            try
            {
                resp.Image1 = "";
                resp.Image2 = "";
                resp.Image3 = "";
                int id = int.Parse(outletID);
                var o = _entities.OutletImages.FirstOrDefault(i=>i.OutletID == id);
                if(o != null)
                {
                    if (o.ImageData1 != null)
                        resp.Image1 = FormatBase64(Convert.ToBase64String(o.ImageData1));

                    if (o.ImageData2 != null)
                        resp.Image2 = FormatBase64(Convert.ToBase64String(o.ImageData2));

                    if (o.ImageData3 != null)
                        resp.Image3 = FormatBase64(Convert.ToBase64String(o.ImageData3));
                }
            }
            catch (Exception ex)
            {
                resp.Status = Constants.ErrorCode;
                resp.ErrorMessage = ex.Message;
            }
            return resp;
        }

        #endregion
    }
}