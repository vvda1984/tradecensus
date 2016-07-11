using System;
using System.IO;
using System.Text;

namespace TestConsole
{
    class Program
    {
        static void Main(string[] args)
        {
            string file = @"E:\Personal\Work\Mobiles.TradeCensus\Github\tradecensus\database\temp.txt";
            string[] lines = File.ReadAllLines(file);
            long outletID = 605030000;
            int outletIndex = 0;
            bool isClosed = false;
            bool isTracked = false; 

            foreach (string line in lines)
            {
                isClosed = !isClosed;
                isTracked = !isTracked;
                outletID++;
                string[] part = line.Split(new string[] { " " }, StringSplitOptions.RemoveEmptyEntries);
                double lng = double.Parse(part[0]);
                double lat = double.Parse(part[1]);

                StringBuilder sb = new StringBuilder();
                sb.Append(outletID.ToString()).Append(","); // ID
                sb.Append("HRC").Append(",");               // AreaID
                sb.Append("1").Append(",");                 // TerritoryID
                sb.Append("GR").Append(",");                // OTypeID
                sb.Append("TEST OUTLET " + (outletIndex++).ToString()).Append(","); // AreaID
                sb.Append("Số " + (outletIndex).ToString()).Append(","); // AddLine2
                sb.Append("Nguyễn Đình Chiễu").Append(","); // AddLine2
                sb.Append("Quận 1").Append(",");            // District
                sb.Append("50").Append(",");                // Province
                sb.Append("84 909 123 456").Append(",");    // Phone
                sb.Append("0").Append(",");                 // CallRate
                if(isClosed)
                    sb.Append("2016-07-01 00:00:00").Append(","); // CloseDate
                else
                    sb.Append("NULL").Append(",");          // CloseDate
                if (isTracked)
                    sb.Append("1").Append(",");             // Tracking
                else
                    sb.Append("0").Append(",");             // Tracking
                sb.Append("E").Append(",");                 // Class
                sb.Append("NULL").Append(",");              // Open1st			
                sb.Append("NULL").Append(",");              // Close1st
                sb.Append("NULL").Append(",");              // Open2nd
                sb.Append("NULL").Append(",");              // Close2nd
                sb.Append("0").Append(",");                 // SpShift
                sb.Append("Mr Nguyen Van A").Append(",");   // LastContact
                sb.Append("NULL").Append(",");              // LastVisit
                sb.Append("12414").Append(",");             // PersonID
                sb.Append("").Append(",");                  // Note
                sb.Append(lng.ToString()).Append(",");      // Longitude
                sb.Append(lat.ToString()).Append(",");      // Latitude
                sb.Append("NULL").Append(",");              // OutletEmail
                sb.Append("11693").Append(",");             // InputBy
                sb.Append("2016-07-01 00:00:00").Append(",");  // InputDate
                sb.Append("11693").Append(",");             // AmendBy
                sb.Append("2016-07-01 00:00:00").Append(",");  // AmendDate
                sb.Append("0").Append(",");                 // AuditStatus
                sb.Append("0").Append(",");                 // TotalVolume
                sb.Append("0").Append(",");                 // VBLVolume
                sb.Append("0").Append(",");                 // PIsDeleted
                sb.Append("0").Append(",");                 // ModifiedStatus
                sb.Append("0").Append(",");                 // TaxID
                sb.Append("NULL").Append(",");              // DISAlias
                sb.Append("0").Append(",");                 // DEDISID
                sb.Append("NULL").Append(",");              // LegalName
            };
            Console.WriteLine("Press any key to exit...");
            Console.ReadLine();
        }
    }
}
