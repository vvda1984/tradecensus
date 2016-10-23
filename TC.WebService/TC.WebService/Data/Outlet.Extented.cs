using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;

namespace TradeCensus.Data
{
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

    public partial class Outlet
    {
        public double Lat { get { return Latitude == null ? 0 : Latitude.Value; } }
        public double Lng { get { return Longitude == null ? 0 : Longitude.Value; } }
        public double Distance { get; set; }
    }
}