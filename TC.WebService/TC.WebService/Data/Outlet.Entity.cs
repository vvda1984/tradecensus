
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TradeCensus.Data
{
    public class OutletEntity : Outlet
    {
        public string ProvinceName { get; set; }

        public string PersonFirstName { get; set; }

        public string PersonLastName { get; set; }

        public bool? PersonIsDSM { get; set; }

        public string OutletTypeName { get; set; }

        public int? AmendByRole { get; set; }

        public OutletModel ToOutletModel(OutletEntity outlet)
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
                TotalVolume = outlet.TotalVolume,
                VBLVolume = outlet.VBLVolume,
                PStatus = outlet.PModifiedStatus,
                PersonLastName = outlet.PersonLastName,
                PersonFirstName = outlet.PersonFirstName,
                PersonIsDSM = outlet.PersonIsDSM ?? false,
                OutletSource = (outlet.PersonIsDSM != null && outlet.PersonIsDSM.Value) ? 1 : 0,
                AmendByRole = outlet.AmendByRole ?? 0,
            };

            return foundOutlet;
        }
    }
}