using System;
using System.Runtime.Serialization;

namespace TradeCensus
{
    [DataContract]
    public class OutletModel
    {
        [DataMember]
        public int ID { get; set; }
        [DataMember]
        public string AreaID { get; set; }        
        [DataMember]
        public string OTypeID { get; set; }
        [DataMember]
        public string OutletTypeName { get; set; }
        [DataMember]
        public int OutletSource { get; set; }
        [DataMember]
        public string Name { get; set; }
        [DataMember]
        public string AddLine { get; set; }
        [DataMember]
        public string AddLine2 { get; set; }
        [DataMember]
        public string District { get; set; }        
        [DataMember]
        public string ProvinceID { get; set; }
        [DataMember]
        public string ProvinceName { get; set; }
        [DataMember]
        public string FullAddress { get; set; }
        [DataMember]
        public string Phone { get; set; }
        [DataMember]
        public string CloseDate { get; set; }
        [DataMember]
        public bool IsOpened { get; set; }
        [DataMember]
        public byte Tracking { get; set; }
        [DataMember]
        public bool IsTracked { get; set; }
        [DataMember]
        public string LastContact { get; set; }
        [DataMember]
        public string LastVisit { get; set; }
        [DataMember]
        public int PersonID { get; set; }
        [DataMember]
        public string PersonFirstName { get; set; }
        [DataMember]
        public string PersonLastName { get; set; }
        [DataMember]
        public bool PersonIsDSM { get; set; }
        [DataMember]
        public string CreateDate { get; set; }
        [DataMember]
        public string Note { get; set; }
        [DataMember]
        public double Longitude { get; set; }
        [DataMember]
        public double Latitude { get; set; }
        [DataMember]
        public string OutletEmail { get; set; }        
        [DataMember]
        public double Distance { get; set; }        
        [DataMember]
        public int InputBy { get; set; }
        [DataMember]
        public int AmendBy { get; set; }
        [DataMember]
        public string AmendDate { get; set; }
        [DataMember]
        public int AuditStatus { get; set; }        
        [DataMember]
        public string StringImage1 { get; set; }
        [DataMember]
        public string StringImage2 { get; set; }
        [DataMember]
        public string StringImage3 { get; set; }
        [DataMember]
        public int TotalVolume { get; set; }
        [DataMember]
        public int VBLVolume { get; set; }
        [DataMember]
        public string PRowID { get; set; }
        [DataMember]
        public int PAction { get; set; }
        [DataMember]
        public string PNote { get; set; }
        [DataMember]
        public int PStatus { get; set; }
    }

    [DataContract]
    public class OutletShort
    {
        [DataMember]
        public int ID { get; set; }
        [DataMember]
        public string Name { get; set; }
    }

    [DataContract]
    public class SyncOutlet
    {
        [DataMember]
        public int ID { get; set; }
        [DataMember]
        public string RowID { get; set; }
    }

    public class OutletEntity : Outlet
    {
        public string ProvinceName { get; set; }

        public string PersonFirstName { get; set; }
      
        public string PersonLastName { get; set; }
       
        public bool? PersonIsDSM { get; set; }

        public string OutletTypeName { get; set; }

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
            };

            return foundOutlet;
        }
    }
}