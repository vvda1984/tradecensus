using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Text;
using TradeCensus.Data;
using TradeCensus.Shared;

namespace TradeCensus
{
    public class OutletService : TradeCensusServiceBase, IOutletService
    {
        static readonly object Locker = new object();

        public OutletService() : base("Outlet")
        {
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
                OutletTypeName = outlet.OutletTypeName,
                OutletEmail = outlet.OutletEmail,
                PersonID = outlet.PersonID,
                Phone = outlet.Phone,
                ProvinceID = outlet.ProvinceID,
                ProvinceName = outlet.ProvinceName,
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
                StringImage1 = "",
                StringImage2 = "",
                StringImage3 = "",
                StringImage4 = "",
                StringImage5 = "",
                StringImage6 = "",
                TotalVolume = outlet.TotalVolume,
                VBLVolume = outlet.VBLVolume,
                PStatus = outlet.PModifiedStatus,
                AmendByRole = outlet.AmendByRole,
                InputByRole = outlet.InputByRole,
                Class = outlet.Class,
                CallRate = outlet.CallRate,
                SpShift = outlet.SpShift ?? 0,
                IsSent = outlet.IsSent ?? 0,
                TerritoryID = outlet.TerritoryID,
                LegalName = outlet.LegalName,
                TaxID = outlet.TaxID,

                PersonLastName = outlet.PersonLastName,
                PersonFirstName = outlet.PersonFirstName,
                PersonIsDSM = outlet.PersonIsDSM,
                OutletSource = outlet.PersonIsDSM ? 1 : 0,

                CompressImage = outlet.CompressImage,
                Comment = outlet.Comment,
                Distance = Math.Round(outlet.Distance, 1),

                LeadBrandID = outlet.LeadBrandID,
                LeadBrandName = outlet.LeadBrandName,
                VisitFrequency = outlet.VisitFrequency,
                PreferredVisitWeek = outlet.PreferredVisitWeek,
                PreferredVisitDay = outlet.PreferredVisitDay,
                LegalInformation = outlet.LegalInformation,
                BusinessOwner = outlet.BusinessOwner,
                PaymentInformation = outlet.PaymentInformation,
                Beneficiary = outlet.Beneficiary,
                CitizenID = outlet.CitizenID,                
                CitizenFrontImage = outlet.CitizenFrontImage,
                CitizenRearImage = outlet.CitizenRearImage,
                PersonalTaxID = outlet.PersonalTaxID,
                BankID = outlet.BankID,
                BankName = outlet.BankName,
                BankCodeID = outlet.BankCodeID,
                BankCode = outlet.BankCode,
                AccountNumber = outlet.AccountNumber,
                SupplierJson = outlet.SupplierJson,
            };

            foundOutlet.FullAddress = $"{outlet.AddLine} {outlet.AddLine2} {outlet.Ward} {outlet.District} {foundOutlet.ProvinceName}".Trim().Replace("  ", " ");

            var outletImg = outlet.OutletImages.FirstOrDefault();
            if (outletImg != null)
            {
                foundOutlet.StringImage1 = Utils.ToBase64(outletImg.ImageData1);
                foundOutlet.StringImage2 = Utils.ToBase64(outletImg.ImageData2);
                foundOutlet.StringImage3 = Utils.ToBase64(outletImg.ImageData3);
                foundOutlet.StringImage4 = Utils.ToBase64(outletImg.ImageData4);
                foundOutlet.StringImage5 = Utils.ToBase64(outletImg.ImageData5);
                foundOutlet.StringImage6 = Utils.ToBase64(outletImg.ImageData6);
            }
            return foundOutlet;
        }

        private string ToActionName(int auditStatus)
        {
            switch (auditStatus)
            {
                case Constants.StatusEdit:
                    return "Edit existed outlet";
                case Constants.StatusNew:
                    return "Create new outlet";
                case Constants.StatusPost:
                    return "Post new outlet";
                case Constants.StatusAuditAccept:
                    return "Approve new outlet (audit)";
                case Constants.StatusAuditDeny:
                    return "Deny new outlet (audit)";
                case Constants.StatusExistingAccept:
                    return "Approve existing outlet (audit)";
                case Constants.StatusExistingDeny:
                    return "Deny existing outlet (audit)";
                case Constants.StatusDelete:
                    return "Delete outlet";
                case Constants.StatusDeny:
                    return "Deny update outlet";
                case Constants.StatusAuditorAccept:
                    return "Approve auditor outlet";
                case Constants.StatusRevert:
                    return "Revert change";
                case Constants.StatusDone:
                    return "Set read only";
                default:
                    return "Unknown";
            };
        }

        private Tuple<int, string> InsertOrUpdateOutlet(PersonRoleModel person, OutletModel outlet)
        {
            if (outlet.AuditStatus == Constants.StatusDelete)
            {
                DC.AddHistory(outlet.AmendBy, outlet.ID, (byte)outlet.AuditStatus, ToActionName(outlet.AuditStatus));
                DC.DeleteOutlet(outlet.ID);
                return new Tuple<int, string>(outlet.ID, outlet.PRowID);
            }

            var auditStatus = outlet.AuditStatus;
            var lastAmendBy = 0;
            Outlet dboutlet = DC.GetOutlet(outlet.ID, outlet.PRowID);
            if (dboutlet != null)
            {
                if (outlet.ID == Constants.DefaultOutletID)
                {
                    return new Tuple<int, string>(dboutlet.ID, dboutlet.PRowID.ToString());
                }

                //if (dboutlet.AuditStatus == Constants.StatusAuditDeny ||
                //    dboutlet.AuditStatus == Constants.StatusAuditAccept ||
                //    dboutlet.AuditStatus == Constants.StatusDone)
                //{
                //    return new Tuple<int, string>(dboutlet.ID, dboutlet.PRowID.ToString());
                //}
                lastAmendBy = dboutlet.AmendBy ?? dboutlet.InputBy ?? 0;
                UpdateOutlet(outlet, dboutlet, false, person);
            }
            else
            {
                lock (Locker)
                {
                    if (outlet.ID == Constants.DefaultOutletID)
                        outlet.ID = DC.GetNextOutletID(int.Parse(outlet.ProvinceID));

                    lastAmendBy = outlet.InputBy;
                    outlet.AmendBy = outlet.InputBy;
                    dboutlet = new Outlet
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
                        PRowID = new Guid(outlet.PRowID), //Guid.NewGuid(),
                        AuditStatus = Constants.StatusNew,
                        PModifiedStatus = 0,
                    };

                    UpdateOutlet(outlet, dboutlet, true, person);
                    DC.AddNewOutlet(dboutlet);
                }
            }

            DC.SaveChanges();

            UpdateOutletExtend(outlet);

            SendNotification(lastAmendBy, person, outlet, auditStatus);

            return new Tuple<int, string>(dboutlet.ID, dboutlet.PRowID.ToString());
        }

        private void UpdateOutlet(OutletModel outlet, Outlet dbOutlet, bool isNewOutlet, PersonRoleModel person)
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

            #region Audit Status
            if (outlet.AuditStatus != 0)
            {
                dbOutlet.AuditStatus = (byte)outlet.AuditStatus;
            }
            else
            {
                Log($"Request outlet {outlet.ID} has audit status=0: AmendBy={dbOutlet.AmendBy}, AmendDate={dbOutlet.AmendDate}");
            }

            var auditStatus = outlet.AuditStatus;
            if (DC.GetServerConfigValue("enable_asm_approval_new_outlet", "1") == "1" && outlet.AuditStatus == Constants.StatusAuditAccept && 
                person != null && person.IsAuditorSS)
            {
                outlet.AuditStatus = Constants.StatusPost;
                dbOutlet.AuditStatus = Constants.StatusPost; 
            }
            //if (DC.GetServerConfigValue("enable_asm_approval_edit_outlet", "1") == "1" && outlet.AuditStatus == Constants.StatusExistingAccept &&
            //    person != null && person.IsAuditorSS)
            //{
            //    outlet.AuditStatus = Constants.StatusExistingPost;
            //    dbOutlet.AuditStatus = Constants.StatusExistingPost;
            //}

            #endregion

            dbOutlet.TotalVolume = outlet.TotalVolume;
            dbOutlet.VBLVolume = outlet.VBLVolume;
            dbOutlet.PModifiedStatus = outlet.PStatus;
            dbOutlet.Class = outlet.Class;
            dbOutlet.CallRate = outlet.CallRate;
            dbOutlet.SpShift = (byte)outlet.SpShift;
            dbOutlet.IsSent = outlet.IsSent;
            dbOutlet.TerritoryID = outlet.TerritoryID;
            dbOutlet.LegalName = outlet.LegalName;
            dbOutlet.TaxID = outlet.TaxID;
            dbOutlet.Comment = outlet.Comment;

            if (!string.IsNullOrEmpty(outlet.PRowID))
                dbOutlet.PRowID = new Guid(outlet.PRowID);

            #region Images

            OutletImage outletImage = null;
            if (!isNewOutlet)
                outletImage = dbOutlet.OutletImages.FirstOrDefault();

            if (outletImage == null)
            {
                outletImage = new OutletImage { Outlet = dbOutlet };
                dbOutlet.OutletImages.Add(outletImage);
            }

            outletImage.IsCompressed = outlet.CompressImage;

            // IMAGE1
            if (!string.IsNullOrWhiteSpace(outlet.StringImage1) && !outlet.StringImage1.ToUpper().StartsWith("/IMAGE"))
            {
                string relativePath;
                byte[] data;
                Utils.SaveToFile(_logger, outlet.ID, 1, outlet.StringImage1, out relativePath, out data);

                outletImage.Image1 = relativePath;
                outletImage.ImageData1 = Convert.FromBase64String(outlet.StringImage1);

                //if (!outlet.CompressImage)
                //    outletImage.ImageData1 = Convert.FromBase64String(outlet.StringImage1);
            }

            // IMAGE2
            if (!string.IsNullOrWhiteSpace(outlet.StringImage2) && !outlet.StringImage2.ToUpper().StartsWith("/IMAGE"))
            {
                string relativePath;
                byte[] data;
                Utils.SaveToFile(_logger, outlet.ID, 2, outlet.StringImage2, out relativePath, out data);

                outletImage.Image2 = relativePath;
                outletImage.ImageData2 = Convert.FromBase64String(outlet.StringImage2);

                //outletImage.Image2 = outlet.StringImage2;
                //if (!outlet.CompressImage)
                //    outletImage.ImageData2 = Convert.FromBase64String(outlet.StringImage2);
            }

            // IMAGE3
            if (!string.IsNullOrWhiteSpace(outlet.StringImage3) && !outlet.StringImage3.ToUpper().StartsWith("/IMAGE"))
            {
                string relativePath;
                byte[] data;
                Utils.SaveToFile(_logger, outlet.ID, 3, outlet.StringImage3, out relativePath, out data);

                outletImage.Image3 = relativePath;
                outletImage.ImageData3 = Convert.FromBase64String(outlet.StringImage3);

                //outletImage.Image3 = outlet.StringImage3;
                //if (!outlet.CompressImage)
                //    outletImage.ImageData3 = Convert.FromBase64String(outlet.StringImage3);
            }

            // IMAGE4
            if (!string.IsNullOrWhiteSpace(outlet.StringImage4) && !outlet.StringImage4.ToUpper().StartsWith("/IMAGE"))
            {
                string relativePath;
                byte[] data;
                Utils.SaveToFile(_logger, outlet.ID, 4, outlet.StringImage4, out relativePath, out data);

                outletImage.Image4 = relativePath;
                outletImage.ImageData4 = Convert.FromBase64String(outlet.StringImage4);

                //outletImage.Image4 = outlet.StringImage4;
                //if (!outlet.CompressImage)
                //    outletImage.ImageData4 = Convert.FromBase64String(outlet.StringImage4);
            }

            // IMAGE5
            if (!string.IsNullOrWhiteSpace(outlet.StringImage5) && !outlet.StringImage5.ToUpper().StartsWith("/IMAGE"))
            {
                string relativePath;
                byte[] data;
                Utils.SaveToFile(_logger, outlet.ID, 5, outlet.StringImage5, out relativePath, out data);

                outletImage.Image5 = relativePath;
                outletImage.ImageData5 = Convert.FromBase64String(outlet.StringImage5);

                //outletImage.Image5 = outlet.StringImage5;
                //if (!outlet.CompressImage)
                //    outletImage.ImageData5 = Convert.FromBase64String(outlet.StringImage5);
            }

            // IMAGE6
            if (!string.IsNullOrWhiteSpace(outlet.StringImage6) && !outlet.StringImage6.ToUpper().StartsWith("/IMAGE"))
            {
                string relativePath;
                byte[] data;
                Utils.SaveToFile(_logger, outlet.ID, 6, outlet.StringImage6, out relativePath, out data);

                outletImage.Image6 = relativePath;
                outletImage.ImageData6 = Convert.FromBase64String(outlet.StringImage6);

                //outletImage.Image6 = outlet.StringImage6;
                //if (!outlet.CompressImage)
                //    outletImage.ImageData6 = Convert.FromBase64String(outlet.StringImage6);
            }

            #endregion

            DC.SetAuditStatusDirty(dbOutlet);
            DC.AddHistory(outlet.AmendBy, outlet.ID, auditStatus, ToActionName(auditStatus));
        }

        private void UpdateOutletExtend(OutletModel outlet)
        {
            DC.InsertOrUpdateOutletExtend(outlet);           
        }

        private void SendNotification(int personID, PersonRoleModel person, OutletModel outlet, int auditStatus)
        {
            try
            {
                NotificationService.Instance.Enqueue(new NotificationWob
                {
                    PersonID = personID,
                    Person = person,
                    Outlet = outlet,
                    AuditStatus = auditStatus
                });
            }
            catch (Exception ex)
            {
                _logger.Warn($"Cannot add to notification queue: {ex}", ex);
            }
        }

        private DeniedException SyncOutlets(int personID, PersonRoleModel person, OutletModel[] outlets, List<SyncOutlet> dboutlets)
        {
            StringBuilder sb = new StringBuilder();
            foreach (var outlet in outlets)
            {
                try
                {
                    outlet.AmendBy = personID;
                    var res = InsertOrUpdateOutlet(person, outlet);
                    dboutlets.Add(new SyncOutlet { ID = res.Item1, RowID = res.Item2 });
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

            return null;
        }


        #region IOutletService Interfaces

        public GetOutletTypeResponse GetOutletTypes()
        {
            var resp = new GetOutletTypeResponse();
            try
            {
                resp.Items = DC.GetOutletTypes();
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
                var person = int.Parse(personID);

                ValidatePerson(person, password);

                var user = DC.GetPersonRole(person);
                if (user == null)
                    throw new Exception($"User {person} doesn't exist");

                resp.Items = new List<OutletModel>();

                var auditor = user.Role == Constants.RoleAudit || user.Role == Constants.RoleAudit1 || 
                              user.Role == Constants.RoleAgencyAudit || user.Role == Constants.RoleAgencyAudit1;

                var query = DC.GetNearByOutlets(
                    Convert.ToDouble(lat),
                    Convert.ToDouble(lng),
                    Convert.ToDouble(meter),
                    Convert.ToInt32(count),
                    Convert.ToInt32(status),
                    person,
                    auditor);
                foreach (var outlet in query)
                {

                    resp.Items.Add(ToOutletModel(outlet));
                }
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
                var person = ValidatePerson(int.Parse(personID), password);
                if (!string.IsNullOrWhiteSpace(personID)) item.AmendBy = int.Parse(personID);

                var res = InsertOrUpdateOutlet(person, item);
                resp.ID = res.Item1;
                resp.RowID = res.Item2;
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
                return DC.GetOutletCountOfProvince(provinceID);
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

                var enaleDownloadImageStr = DC.GetSetting("enable_download_image", "0");
                var enaleDownloadImage =
                    string.Compare(enaleDownloadImageStr, "1", StringComparison.OrdinalIgnoreCase) == 0 ||
                    string.Compare(enaleDownloadImageStr, "true", StringComparison.OrdinalIgnoreCase) == 0;

                var results = DC.GetDownloadOutlets(provinceID, int.Parse(from), int.Parse(to), enaleDownloadImage);

                var data = Newtonsoft.Json.JsonConvert.SerializeObject(results);
                return data;
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, $"Cannot get download outlets.");
                return "[]";
            }
        }

        public SyncOutletResponse SyncOutlets(string personID, string password, OutletModel[] outlets)
        {
            var resp = new SyncOutletResponse();
            try
            {
                //System.Threading.Thread.Sleep(18 * 1000)
                var person = ValidatePerson(int.Parse(personID), password);
                List<SyncOutlet> dboutlets = new List<SyncOutlet>();
                var error = SyncOutlets(int.Parse(personID), person, outlets, dboutlets);
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

                var outletImage = DC.GetOutletImage(int.Parse(outletID));
                if (outletImage != null)
                {
                    if (outletImage.IsCompressed != null && outletImage.IsCompressed == true)
                    {
                        resp.Image1 = outletImage.Image1;
                        resp.Image2 = outletImage.Image2;
                        resp.Image3 = outletImage.Image3;
                        resp.Image4 = outletImage.Image4;
                        resp.Image5 = outletImage.Image5;
                        resp.Image6 = outletImage.Image6;
                    }
                    else
                    {
                        resp.Image1 = Utils.ToBase64(outletImage.ImageData1);
                        resp.Image2 = Utils.ToBase64(outletImage.ImageData2);
                        resp.Image3 = Utils.ToBase64(outletImage.ImageData3);
                        resp.Image4 = Utils.ToBase64(outletImage.ImageData4);
                        resp.Image5 = Utils.ToBase64(outletImage.ImageData5);
                        resp.Image6 = Utils.ToBase64(outletImage.ImageData6);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, $"Cannot get outlet image {outletID}.");
                resp.Status = Constants.ErrorCode;
                resp.ErrorMessage = ex.Message;
            }
            return resp;
        }

        public GetOutletListResponse SearchOutlet(string personID, string password, string outletID, string outletName)
        {
            var resp = new GetOutletListResponse { Items = new List<OutletModel>() };
            try
            {
                ValidatePerson(int.Parse(personID), password);

                var query = DC.SearchOutlets(int.Parse(personID), int.Parse(outletID), outletName);
                foreach (var outlet in query)
                {
                    resp.Items.Add(ToOutletModel(outlet));
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