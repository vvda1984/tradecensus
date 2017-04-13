using Ionic.Zip;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using TradeCensus.Data;
using TradeCensus.Shared;

namespace TradeCensus
{
    public class OutletService : TradeCensusServiceBase, IOutletService
    {
        static object Locker = new object();

        const byte OActionDenyUpdate = 17;

        public OutletService() : base("Outlet")
        {
        }

        private List<OutletType> GetAllOutletTypes()
        {
            Log("Get list of OutletTypes");
            return DC.OutletTypes.ToList();
        }

        private List<OutletModel> GetOutletsByLocation(int personID, double lat, double lng, double meter, int count, int status)
        {
            var user = DC.PersonRoles.FirstOrDefault(i => i.PersonID == personID);
            if (user == null)
                throw new Exception(string.Format("User {0} doesn't exist", personID));
            var auditor = user.Role == Constants.RoleAudit || user.Role == Constants.RoleAudit1 ||
                          user.Role == Constants.RoleAgencyAudit || user.Role == Constants.RoleAgencyAudit1;

            string method = GetSetting("calc_distance_algorithm", "circle");
            Log("Calculate distance method: {0}", method);
            var curLocation = new Point { Lat = lat, Lng = lng };
            Point tl = DistanceUtil.CalcShiftedPoint(meter, 0 - meter, curLocation);
            Point tr = DistanceUtil.CalcShiftedPoint(meter, meter, curLocation);
            Point bl = DistanceUtil.CalcShiftedPoint(0 - meter, 0 - meter, curLocation);
            Point br = DistanceUtil.CalcShiftedPoint(0 - meter, meter, curLocation);

            List<OutletModel> res = new List<OutletModel>();
            var command = QueryOutletCommand(status, bl.Lat, tl.Lat, bl.Lng, br.Lng, personID, auditor);

            var query = DC.Database.SqlQuery<OutletEntity>(command);
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
		            p.IsDSM as PersonIsDSM,
                    r1.Role as InputByRole,
					r2.Role as AmendByRole
	            from 
		            Outlet as o 
                    left join Province pr with(nolock) on o.ProvinceID = pr.ID
		            left join OutletType ot with(nolock) on o.OTypeID = ot.ID
		            left join Person p with(nolock) on p.ID = o.PersonID 
                    left join PersonRole r with(nolock) on p.ID = r.PersonID 
					left join PersonRole r1 with(nolock) on r1.PersonID = o.InputBy
                    left join PersonRole r2 with(nolock) on r2.PersonID = o.AmendBy";

            if (status == 0) // near-by
            {
                sqlCommand += string.Format(
                    @" where
                        o.Latitude >= {0} AND o.Latitude <= {1} AND
                        o.Longitude >= {2} AND o.Longitude <= {3} AND
                        o.AuditStatus <> {4}", minLat, maxLat, minLng, maxLng, Constants.StatusDelete
                    );
            }
            else if (status == 1) // new
            {
                if (auditor)
                    sqlCommand += string.Format(
                        @" where
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
                       @" where
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
                       @" where
                            o.Latitude >= {0} AND o.Latitude <= {1} AND
                            o.Longitude >= {2} AND o.Longitude <= {3} AND
                            o.AuditStatus = {4} AND
                            o.PersonID <> {5}",
                            minLat, maxLat, minLng, maxLng,
                            Constants.StatusExistingPost,
                            personID);
                else
                    sqlCommand += string.Format(
                     @" where
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
                     @" where
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
                    @" where
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
                    @" where
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

        private OutletModel ToOutletModel(OutletEntity outlet)
        {
            var foundOutlet = new OutletModel
            {
                ID = outlet.ID,
                Name = outlet.Name,
                AddLine = outlet.AddLine,
                AddLine2 = outlet.AddLine2,
                Ward = outlet.Ward,
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
                AmendByRole = outlet.AmendByRole ?? 0,
                InputByRole = outlet.InputByRole ?? 0,
                Class = outlet.Class,
                CallRate = outlet.CallRate,
                SpShift = outlet.SpShift ?? 0,
                IsSent = outlet.IsSent ?? 0
            };

            foundOutlet.FullAddress = string.Format("{0} {1} {2} {3} {4}", outlet.AddLine, outlet.AddLine2, outlet.Ward, outlet.District, foundOutlet.ProvinceName);
            foundOutlet.FullAddress = foundOutlet.FullAddress.Trim().Replace("  ", " ");

            var outletImg = outlet.OutletImages.FirstOrDefault();
            if (outletImg != null)
            {
                foundOutlet.StringImage1 = ToBase64(outletImg.ImageData1);
                foundOutlet.StringImage2 = ToBase64(outletImg.ImageData2);
                foundOutlet.StringImage3 = ToBase64(outletImg.ImageData3);
                foundOutlet.StringImage4 = ToBase64(outletImg.ImageData4);
                foundOutlet.StringImage5 = ToBase64(outletImg.ImageData5);
                foundOutlet.StringImage6 = ToBase64(outletImg.ImageData6);
            }

            var person = DC.People.FirstOrDefault(p => p.ID == outlet.PersonID);
            if (person != null)
            {
                foundOutlet.PersonLastName = person.LastName;
                foundOutlet.PersonFirstName = person.FirstName;
                foundOutlet.PersonIsDSM = person.IsDSM;
                foundOutlet.OutletSource = GetOutletSource(outlet); // person.IsDSM ? 1 : 0;
            }

            return foundOutlet;
        }

        private int GetOutletSource(OutletEntity outlet)
        {
            return (outlet.PersonIsDSM != null && outlet.PersonIsDSM.Value) ? 1 : 0;

            //var amendRole = outlet.PersonRole ?? 0;
            //if (amendRole == 0 || amendRole == 1) // salesman / auditor
            //{
            //    return (outlet.PersonIsDSM != null && outlet.PersonIsDSM.Value) ? 1 : 0;
            //}
            //else // agency / agency auditor
            //{
            //    return 2;
            //}
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
                existingOutlet = DC.Outlets.FirstOrDefault(i => i.PRowID.ToString() == outlet.PRowID);

            if (existingOutlet == null && outlet.ID != 600000000)
                existingOutlet = DC.Outlets.FirstOrDefault(i => i.ID == outlet.ID);

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
                        Ward = outlet.Ward,
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
                    DC.Outlets.Add(existingOutlet);
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
                    DC.SaveChanges();
                throw new DeniedException("Cannot update because outlet(s) audited!");
            }

            if (outlet.AuditStatus == Constants.StatusDelete)
            {
                DeleteOutlet(outlet.PersonID, outlet.ID);
                return null;
            }
            else if (outlet.AuditStatus == Constants.StatusRevert)
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
                dbOutlet.Ward = outlet.Ward;
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
                dbOutlet.Class = outlet.Class;
                dbOutlet.CallRate = outlet.CallRate;
                dbOutlet.SpShift = (byte)outlet.SpShift;
                dbOutlet.IsSent = outlet.IsSent;

                if (!string.IsNullOrEmpty(outlet.PRowID))
                    dbOutlet.PRowID = new Guid(outlet.PRowID);

                // ============= IMAGES =============
                OutletImage outletImage = dbOutlet.OutletImages.FirstOrDefault();
                if (outletImage == null)
                {
                    outletImage = new OutletImage();
                    outletImage.Outlet = dbOutlet;
                    dbOutlet.OutletImages.Add(outletImage);
                }

                // IMAGE1
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

                // IMAGE2
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

                // IMAGE3
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

                // IMAGE4
                if (string.IsNullOrEmpty(outlet.StringImage4))
                {
                    outletImage.Image4 = "";
                    outletImage.ImageData4 = null;
                }
                else if (!outlet.StringImage4.ToUpper().StartsWith("/IMAGE"))
                {
                    byte[] data;
                    string relativePath;
                    SaveToFile(dbOutlet.ID, 4, outlet.StringImage4, out relativePath, out data);
                    outletImage.Image4 = relativePath;
                    outletImage.ImageData4 = data;
                }

                // IMAGE5
                if (string.IsNullOrEmpty(outlet.StringImage5))
                {
                    outletImage.Image5 = "";
                    outletImage.ImageData5 = null;
                }
                else if (!outlet.StringImage5.ToUpper().StartsWith("/IMAGE"))
                {
                    byte[] data;
                    string relativePath;
                    SaveToFile(dbOutlet.ID, 5, outlet.StringImage5, out relativePath, out data);
                    outletImage.Image5 = relativePath;
                    outletImage.ImageData5 = data;
                }

                // IMAGE6
                if (string.IsNullOrEmpty(outlet.StringImage6))
                {
                    outletImage.Image6 = "";
                    outletImage.ImageData6 = null;
                }
                else if (!outlet.StringImage6.ToUpper().StartsWith("/IMAGE"))
                {
                    byte[] data;
                    string relativePath;
                    SaveToFile(dbOutlet.ID, 6, outlet.StringImage6, out relativePath, out data);
                    outletImage.Image6 = relativePath;
                    outletImage.ImageData6 = data;
                }

                AppendOutletHistory(outlet.AmendBy, outlet.ID, (byte)outlet.AuditStatus, ToActionMsg(outlet.AuditStatus));
                if (saveChanged)
                    DC.SaveChanges();
                return dbOutlet;
            }
        }

        private int GetNextOutletID(int provinceID)
        {
            var proId = provinceID.ToString("D2");
            var q = DC.Database.SqlQuery<int>(string.Format("select top 1 dbo.ufn_GetNewOCode('{0}')", proId));
            if (q.Any()) return q.FirstOrDefault();
            var num = (new Random()).Next(10000, 99999);
            return int.Parse("6" + proId + num.ToString("D5"));
        }

        private string GetOutletType(string id)
        {
            var item = DC.OutletTypes.FirstOrDefault(i => i.ID == id);
            return item == null ? "" : item.Name;
        }

        private string GetProvinceName(string id)
        {
            var item = DC.Provinces.FirstOrDefault(i => i.ID == id);
            return item == null ? "" : item.Name;
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
            DC.OutletHistories.Add(hist);
        }

        private void DeleteOutlet(int personID, int outletID)
        {
            Outlet existingOutlet = DC.Outlets.FirstOrDefault(i => i.ID == outletID);
            if (existingOutlet != null)
            {
                var imgs = existingOutlet.OutletImages.ToArray();
                foreach (var img in imgs)
                {
                    img.Outlet = null;
                    DC.OutletImages.Remove(img);
                }
                existingOutlet.OutletImages.Clear();

                DC.Outlets.Remove(existingOutlet);

                AppendOutletHistory(personID, outletID, Constants.StatusDelete, ToActionMsg(Constants.StatusDelete));
            }

            DC.SaveChanges();
        }

        private string DownloadOutletsZip(string provinceID, int from, int to)
        {
            //ValidatePerson(personID);
            Stopwatch sw = new Stopwatch();
            sw.Start();

            DownloadOutlet[] results;
            if (AllowDownloadImages())
            {
                var command = string.Format(@"select * from (
                            select Row_Number() over(order by Outlet.ID) as RowNo,
                                o.*,
                                p.FirstName as PersonFirstName, 
                                p.LastName as PersonLastName, 
                                p.IsDSM as PersonIsDSM, 
                                p.IsDSM as OutletSource, 
                                r.Role as InputByRole,
                                r1.Role as AmendByRole,
                                ot.Name as OutletTypeName,
                                oi.ImageData1, 
                                oi.ImageData2, 
                                oi.ImageData3, 
                                oi.ImageData4,
                                oi.ImageData5, 
                                oi.ImageData6
                            from outlet o
                                left join OutletType ot on ot.ID = o.OTypeID 
                                left join Person p on p.ID = o.PersonID 
                                left join PersonRole r on r.PersonID = o.InputBy 
			                    left join PersonRole r1 on r1.PersonID = o.AmendBy 
                                left join OutletImage as oi on oi.OutletID = o.ID
                              where outlet.ProvinceID = {2}
                        ) as tmp
                        where RowNo between {0} and {1}", from + 1, to, provinceID);

                var query = DC.Database.SqlQuery<DownloadOutlet>(command);
                results = query.ToArray();

                var outletHasImages = results.Where(o =>
                    (o.ImageData1 != null || o.ImageData2 != null || o.ImageData3 != null ||
                     o.ImageData4 != null || o.ImageData5 != null || o.ImageData6 != null));
                if (outletHasImages.Count() > 0)
                    foreach (var o in outletHasImages)
                    {
                        if (o.ImageData1 != null)
                            o.StringImage1 = FormatBase64(Convert.ToBase64String(o.ImageData1));

                        if (o.ImageData2 != null)
                            o.StringImage2 = FormatBase64(Convert.ToBase64String(o.ImageData2));

                        if (o.ImageData3 != null)
                            o.StringImage3 = FormatBase64(Convert.ToBase64String(o.ImageData3));

                        if (o.ImageData4 != null)
                            o.StringImage4 = FormatBase64(Convert.ToBase64String(o.ImageData4));

                        if (o.ImageData5 != null)
                            o.StringImage5 = FormatBase64(Convert.ToBase64String(o.ImageData5));

                        if (o.ImageData6 != null)
                            o.StringImage6 = FormatBase64(Convert.ToBase64String(o.ImageData6));
                    }
            }
            else
            {
                var command = string.Format(@"select * from (
                            select Row_Number() over(order by Outlet.ID) as RowNo,
                                   Outlet.*,
                                   Person.FirstName as PersonFirstName, 
                                        Person.LastName as PersonLastName, 
                                        Person.IsDSM as PersonIsDSM, 
                                        Person.IsDSM as OutletSource, 
                                        PersonRole.Role as PersonRole,
                                        ot.Name as OutletTypeName
                              from outlet
                              left join OutletType as ot on ot.ID = Outlet.OTypeID 
                              left join Person on Person.ID = Outlet.PersonID 
                              left join PersonRole on Person.ID = PersonRole.PersonID 
                              where outlet.ProvinceID = {2}
                        ) as tmp
                        where RowNo between {0} and {1}", from + 1, to, provinceID);

                var query = DC.Database.SqlQuery<DownloadOutlet>(command);
                results = query.ToArray();
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

        private bool AllowDownloadImages()
        {
            var allowDownloadImage = DC.Configs.FirstOrDefault(c => string.Compare(c.Name, "enable_download_image", StringComparison.OrdinalIgnoreCase) == 0);
            return (allowDownloadImage != null && allowDownloadImage.Value == "1");
        }

        #region IOutletService Interfaces

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

        public GetOutletListResponse GetNearbyOutlets(string personID, string password, string lat, string lng, string meter, string count, string status)
        {
            var resp = new GetOutletListResponse();
            try
            {
                ValidatePerson(int.Parse(personID), password);

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

        public SaveOutletResponse SaveOutlet(string personID, string password, OutletModel item)
        {
            var resp = new SaveOutletResponse();
            try
            {
                ValidatePerson(int.Parse(personID), password);

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

        public int GetTotalProvincesCount(string personID, string password, string provinceID)
        {
            try
            {
                ValidatePerson(int.Parse(personID), password);

                return DC.Outlets.Count(i => i.ProvinceID == provinceID);
            }
            catch
            {
                return 0;
            }
        }

        public string DownloadOutletsZip(string personID, string password, string provinceID, string from, string to)
        {
            try
            {
                ValidatePerson(int.Parse(personID), password);

                return DownloadOutletsZip(provinceID, int.Parse(from), int.Parse(to));
            }
            catch
            {
                return null;
            }
        }

        public SyncOutletResponse SyncOutlets(string personID, string password, OutletModel[] outlets)
        {
            var resp = new SyncOutletResponse();
            try
            {
                ValidatePerson(int.Parse(personID), password);

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

        public GetOutletImagesResponse GetImages(string personID, string password, string outletID)
        {
            var resp = new GetOutletImagesResponse();
            try
            {
                ValidatePerson(int.Parse(personID), password);

                resp.Image1 = "";
                resp.Image2 = "";
                resp.Image3 = "";
                resp.Image4 = "";
                resp.Image5 = "";
                resp.Image6 = "";
                int id = int.Parse(outletID);
                var o = DC.OutletImages.FirstOrDefault(i => i.OutletID == id);
                if (o != null)
                {
                    if (o.ImageData1 != null)
                        resp.Image1 = FormatBase64(Convert.ToBase64String(o.ImageData1));

                    if (o.ImageData2 != null)
                        resp.Image2 = FormatBase64(Convert.ToBase64String(o.ImageData2));

                    if (o.ImageData3 != null)
                        resp.Image3 = FormatBase64(Convert.ToBase64String(o.ImageData3));

                    if (o.ImageData4 != null)
                        resp.Image4 = FormatBase64(Convert.ToBase64String(o.ImageData4));

                    if (o.ImageData5 != null)
                        resp.Image5 = FormatBase64(Convert.ToBase64String(o.ImageData5));

                    if (o.ImageData6 != null)
                        resp.Image6 = FormatBase64(Convert.ToBase64String(o.ImageData6));
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