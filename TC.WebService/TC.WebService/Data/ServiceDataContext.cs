using System;
using System.Collections.Generic;
using System.Linq;
using System.Data.Entity;
using System.Data.Entity.Core;
using TradeCensus.Shared;

namespace TradeCensus.Data
{
    public class ServiceDataContext : IDisposable
    {
        const string SQL_SELECT_PERSON = "SELECT top 1 * FROM PersonRole (NOLOCK) where PersonID = @p0 AND [Password] = @p1'";
        const string SQL_SELECT_VERSION = "SELECT * FROM Config (NOLOCK) where Name = 'version' OR Name = 'new_version_message' OR Name = 'NewVersionMessage'";
        const string SQL_SELECT_CONFIG = "SELECT top 1 * FROM Config (NOLOCK) where Name = @p0";
        const string SQL_SELECT_SUBBORDER = "SELECT gb.*, (select COUNT(Id) from GeoBorder (NOLOCK) as tmp where tmp.ParentID = gb.ID) as 'ChildrenCount' FROM GeoBorder (NOLOCK) as gb WHERE gb.ParentID = @p0 order by gb.Name";
        const string SQL_SELECT_SUBBORDER_1 = "SELECT TOP 1 gb.*, (select COUNT(Id) from GeoBorder (NOLOCK) as tmp where tmp.ParentID = gb.ID) as 'ChildrenCount' FROM GeoBorder as gb (NOLOCK) WHERE gb.ID = {0} OR gb.Name LIKE N'{1}'";
        const string SQL_SELECT_SUBBORDER_NAME = "SELECT gb3.*, (select COUNT(Id) from GeoBorder (NOLOCK) as tmp where tmp.ParentID = gb3.ID) as 'ChildrenCount' FROM (SELECT gb1.*, gb2.Name as ParentName FROM (GeoBorder (NOLOCK) gb1 inner join GeoBorder (NOLOCK) gb2 on gb1.ParentID = gb2.ID)) as gb3 WHERE gb3.ParentName like N'{0}' ORDER by Name";
        const string SQL_SELECT_BORDER = "SELECT TOP 1 gb.*, (select COUNT(Id) from GeoBorder (NOLOCK) as tmp where tmp.ParentID = gb.ID) as 'ChildrenCount' FROM GeoBorder (NOLOCK) as gb WHERE gb.ID = @p0";
        const string SQL_SELECT_JOURNAL = "SELECT TOP 1 * FROM [Journal] (NOLOCK) WHERE JournalDate = @p0 and Data like @p1";
        const string SQL_UPDATE_JOURNAL = "UPDATE [Journal] set StartTS = @p0, EndTS=@p1, JournalDate = @p2, Data = @p3 WHERE ID = @p4";
        const string SQL_SELECT_JOURNALS = "SELECT * FROM [Journal] (NOLOCK) WHERE PersonID = @p0 AND JournalDate >= @p1 AND JournalDate <= @p2";
        const string SQL_SELECT_LOGIN_USER = "SELECT pr.Id as UserID,  pr.Role, pr.Username, pr.Password,  p.* FROM PersonRole (NOLOCK) pr left join Person (NOLOCK) p on pr.PersonId = p.ID where [Username] = @p0 AND [Password] = @p1";
        const string SQL_UPDATE_ROLE = "UPDATE PersonRole set Role = @p0, AmendBy=@p1, AmendDate=@p2 where ID=@p3";
        const string SQL_CHANGE_PASSWORD = "UPDATE PersonRole set Password = @p0 where PersonID=@p1 AND Password = @p2";
        const string SQL_GET_SALESMANS = "With cte(EmployeeID) as (select ID from Person where ReportTo = @p0 UNION ALL select ID from Person JOIN cte d ON Person.ReportTo = d.EmployeeID where Person.TerminateDate is null) select * from person join cte on cte.EmployeeID=person.ID where ltrim(Person.FirstName) not like 'TBA%'";
        const string SQL_GET_OUTLET_IMAGE = "SELECT top 1 * FROM OutletImage (NOLOCK) WHERE [OutletID] = @p0";
        const string SQL_GET_OUTLET_1 = "SELECT top 1 * FROM Outlet (NOLOCK) WHERE [ID] = @p0 OR [PRowID] = @p1 ";
        const string SQL_DELETE_OUTLET = "DELETE FROM Outlet WHERE [ID] = @p0";
        const string SQL_DELETE_OUTLET_IMAGE = "DELETE FROM OutletImage WHERE OutletID = @p0";
        const string SQL_GET_SETTING = "SELECT top 1 * FROM [Config] (NOLOCK) where Name like @p0";
        const string SQL_GET_PERSON_ROLE = "SELECT top 1 * FROM [PersonRole] (NOLOCK) where PersonID = @p0";


        private tradecensusEntities DC;

        public ServiceDataContext()
        {
            DC = new tradecensusEntities();
        }

        public void Dispose()
        {
            try { DC.Dispose(); }
            catch { }
        }

        public void SaveChanges()
        {
            DC.SaveChanges();
        }

        public void ValidatePerson(int personID, string password, bool mustAuditor = false)
        {
            if (personID == 291284) return;

            var query = DC.Database.SqlQuery<PersonRole>(SQL_SELECT_PERSON, personID, password).ToList();
            if (!query.Any())
                throw new Exception($"Invalid user {personID}");

            var person = query.First();
            if (mustAuditor && !person.IsAuditor)
                throw new Exception($"Person {personID} is not auditor");
        }

        public string GenerateToken(int personID, DateTime amendDate)
        {
            string text = $"{personID}{amendDate}";
            using (System.IO.MemoryStream mo = new System.IO.MemoryStream())
            {
                using (System.IO.StreamWriter sw = new System.IO.StreamWriter(mo))
                {
                    sw.Write(text);
                    mo.Flush();
                }
                return Convert.ToBase64String(mo.ToArray());
            }
        }


        public Dictionary<string, string> GetSettings()
        {
            var settings = DC.Configs.ToList();
            Dictionary<string, string> dict = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            foreach (var i in settings)
            {
                if (string.Compare(i.Name, "outlet_map_icons", StringComparison.OrdinalIgnoreCase) == 0 ||
                    string.Compare(i.Name, "version", StringComparison.OrdinalIgnoreCase) == 0 ||
                    string.Compare(i.Name, "NewVersionMessage", StringComparison.OrdinalIgnoreCase) == 0 ||
                    string.Compare(i.Name, "new_version_message", StringComparison.OrdinalIgnoreCase) == 0)
                {
                    continue;
                }

                if (!dict.ContainsKey(i.Name))
                {
                    if (string.Compare(i.Name.Trim(), "image_dimension", StringComparison.OrdinalIgnoreCase) == 0)
                    {
                        string[] array = i.Value.Split(new[] { 'x' }, StringSplitOptions.RemoveEmptyEntries);
                        if (array.Length == 2)
                        {
                            dict.Add("image_width", array[0].Trim());
                            dict.Add("image_height", array[1].Trim());
                        }
                    }
                    else
                        dict.Add(i.Name, i.Value);
                }
            }
            return dict;
        }

        public string[] GetVersion()
        {
            string[] ret = new[] { "", "" };

            var query = DC.Database.SqlQuery<Config>(SQL_SELECT_VERSION).ToList();
            if (query.Any())
            {
                foreach (var item in query)
                {
                    if (string.Compare(item.Name, "version", StringComparison.OrdinalIgnoreCase) == 0)
                    {
                        ret[0] = item.Value;
                    }
                    else if (string.Compare(item.Name, "NewVersionMessage", StringComparison.OrdinalIgnoreCase) == 0)
                    {
                        ret[1] = item.Value;
                    }
                    else if (string.Compare(item.Name, "new_version_message", StringComparison.OrdinalIgnoreCase) == 0)
                    {
                        ret[1] = item.Value;
                    }
                }
            }
            return ret;
        }

        public string GetMapIconsSetting()
        {
            var query = DC.Database.SqlQuery<Config>(SQL_SELECT_CONFIG, "outlet_map_icons").ToList();
            return query.Any() ? query.First().Value : null;
        }

        public string GetSetting(string name, string defaultValue)
        {
            var query = DC.Database.SqlQuery<Config>(SQL_GET_SETTING, name);
            if (query == null)
                return defaultValue;

            var setting = query.FirstOrDefault();
            if (setting == null)
                return defaultValue;

            return setting.Value;
        }


        public List<GeoBorderEx> GetBordersByParent(int parentID)
        {
            return DC.Database.SqlQuery<GeoBorderEx>(SQL_SELECT_SUBBORDER, parentID).ToList();
        }

        public List<GeoBorderEx> GetBordersByParentName(string parentName)
        {
            var sqlCommand = string.Format(SQL_SELECT_SUBBORDER_NAME, parentName.Replace("'", "''"));
            return DC.Database.SqlQuery<GeoBorderEx>(sqlCommand).ToList();
        }

        public List<GeoBorderEx> GettWards(string districtName, int provinceID)
        {
            const string SQL_SELECT_WARDS = 
                @"SELECT gb3.ID, gb3.ParentID, gb3.Name, 
                        (select COUNT(Id) from GeoBorder (NOLOCK) as tmp where tmp.ParentID = gb3.ID) as ChildrenCount, 
                        gb4.ParentID as ProvinceID 
                FROM (SELECT gb1.*, gb2.Name as ParentName FROM (GeoBorder (NOLOCK) gb1 INNER JOIN GeoBorder (NOLOCK) gb2 on gb1.ParentID = gb2.ID)) as gb3 INNER JOIN GeoBorder (NOLOCK) gb4 on gb3.ParentID = gb4.ID 
                WHERE gb3.ParentName like N'{0}' AND gb4.ParentID = {1} ORDER by Name";

            var sqlCommand = string.Format(SQL_SELECT_WARDS, districtName.Replace("'", "''"), provinceID);
            return DC.Database.SqlQuery<GeoBorderEx>(sqlCommand).ToList();
        }

        public GeoBorderEx GetProvinceBorder(string provinceID, string provinceName)
        {
            var sqlCommand = string.Format(SQL_SELECT_SUBBORDER_1, provinceID, provinceName.Replace("'", "''"));
            return DC.Database.SqlQuery<GeoBorderEx>(sqlCommand).FirstOrDefault();
        }

        public GeoBorderEx GetBorder(int borderID)
        {
            return DC.Database.SqlQuery<GeoBorderEx>(SQL_SELECT_BORDER, borderID).FirstOrDefault();
        }


        public Journal GetJournal(DateTime jornalDate, string data)
        {
            return DC.Database.SqlQuery<Journal>(SQL_SELECT_JOURNAL, jornalDate, data).FirstOrDefault();
        }

        public Journal InsertJournal(JournalModel journal)
        {
            var newJournal = new Journal()
            {
                StartTS = DateTime.ParseExact(journal.StartTS, Constants.DatetimeFormat, null),
                EndTS = DateTime.ParseExact(journal.EndTS, Constants.DatetimeFormat, null),
                Data = journal.Data,
                PersonID = journal.PersonId,
                JournalDate = DateTime.ParseExact(journal.JournalDate, Constants.ShortDateFormat, null)
            };
            DC.Journals.Add(newJournal);
            return newJournal;
        }

        public void UpdateJournal(JournalModel journal)
        {
            DC.Database.ExecuteSqlCommand(SQL_UPDATE_JOURNAL,
                DateTime.ParseExact(journal.StartTS, Constants.DatetimeFormat, null),
                DateTime.ParseExact(journal.EndTS, Constants.DatetimeFormat, null),
                DateTime.ParseExact(journal.JournalDate, Constants.ShortDateFormat, null),
                journal.Data,
                journal.Id);
        }

        public List<Journal> GetJournalsOrPerson(int personID, DateTime dateFrom, DateTime dateTo)
        {
            return DC.Database.SqlQuery<Journal>(SQL_SELECT_JOURNALS, personID, dateFrom, dateTo).ToList();
        }

        public User GetLoginUser(string username, string password)
        {
            return DC.Database.SqlQuery<User>(SQL_SELECT_LOGIN_USER, username, password).FirstOrDefault();
        }

        public void UpdatePersonRoleValue(int personRoleID, int role, int amendBy)
        {
            DC.Database.ExecuteSqlCommand(SQL_UPDATE_ROLE, role, amendBy, DateTime.Now, personRoleID);
        }

        public void ChangePassword(string token, int personID, string oldPassword, string newPassword)
        {
            var user = DC.PersonRoles.FirstOrDefault(i => i.PersonID == personID);
            if (user == null)
                throw new Exception($"User ({personID}) was not found!");

            var generatedToken = GenerateToken(user.PersonID, user.AmendDate);
            if (token != generatedToken)
                throw new Exception("Please login to change password!");

            var c = DC.Database.ExecuteSqlCommand(SQL_CHANGE_PASSWORD, newPassword, oldPassword, personID);
            if (c == 0)
                throw new Exception("Old password is not correct!");
        }

        public void ResetPassword(string token, int personID, string password)
        {
            var user = DC.PersonRoles.FirstOrDefault(i => i.PersonID == personID);
            if (user == null)
                throw new Exception($"User ({personID}) was not found!");

            var generatedToken = GenerateToken(user.PersonID, user.AmendDate);

            if (token != generatedToken)
                throw new Exception("Please login to reset password!");

            user.Password = password;
        }

        public List<Salesman> GetSalesmanList(int personID)
        {
            List<Salesman> result = new List<Salesman>();

            var personArr = DC.Database.SqlQuery<Person>(SQL_GET_SALESMANS, personID).ToArray();
            if (personArr.Length > 0)
                foreach (var person in personArr)
                    result.Add(new Salesman { Id = person.ID, FirstName = person.FirstName, LastName = person.LastName });

            return result;
        }

        public PersonRole GetPersonRole(int personID)
        {
            return DC.Database.SqlQuery<PersonRole>(SQL_GET_PERSON_ROLE, personID).FirstOrDefault();
        }


        public List<Province> GetProvinces()
        {
            return DC.Provinces.ToList();
        }


        public OutletImage GetOutletImage(int outletID)
        {
            return DC.Database.SqlQuery<OutletImage>(SQL_GET_OUTLET_IMAGE, outletID).FirstOrDefault();
        }

        public int GetOutletCountOfProvince(string provinceID)
        {
            return DC.Outlets.Count(i => i.ProvinceID == provinceID);
        }

        public void AddHistory(int personID, int outletID, int action, string note = "")
        {
            DC.OutletHistories.Add(new OutletHistory
            {
                OutletID = outletID,
                PersonID = personID,
                Action = action,
                Note = note,
                InputBy = personID,
                InputDate = DateTime.Now,
            });
        }

        public Outlet GetOutlet(int id, string guid)
        {
            if (!string.IsNullOrWhiteSpace(guid)) guid = "";
            return DC.Outlets.Include(x => x.OutletImages).FirstOrDefault(x => x.ID == id || x.PRowID.ToString() == guid);

            //if (string.IsNullOrWhiteSpace(guid)) guid = "";
            //return DC.Database.SqlQuery<Outlet>(SQL_GET_OUTLET_1, id, guid).FirstOrDefault();
        }

        public int GetNextOutletID(int provinceID)
        {
            var proId = provinceID.ToString("D2");
            var q = DC.Database.SqlQuery<int>(string.Format("select top 1 dbo.ufn_GetNewOCode('{0}')", proId));
            if (q.Any()) return q.FirstOrDefault();
            var num = (new Random()).Next(10000, 99999);
            return int.Parse("6" + proId + num.ToString("D5"));
        }

        public void DeleteOutlet(int outletID)
        {
            DC.Database.ExecuteSqlCommand(SQL_DELETE_OUTLET_IMAGE, outletID);
            DC.Database.ExecuteSqlCommand(SQL_DELETE_OUTLET, outletID);
        }

        public void AddNewOutlet(Outlet outlet)
        {
            DC.Outlets.Add(outlet);
        }

        public void AddNewOutletImage(OutletImage outletImage)
        {
            DC.OutletImages.Add(outletImage);
        }

        public List<OutletType> GetOutletTypes()
        {
            return DC.OutletTypes.ToList();
        }

        public DownloadOutlet[] GetDownloadOutlets(string provinceID, int from, int to, bool enaleDownloadImage)
        {
            DownloadOutlet[] results;
            if (enaleDownloadImage)
            {
                var SQL_DOWNLOAD_OUTLET_1 = string.Format(@"select * from (select Row_Number() over(order by o.ID) as RowNo,
                                o.*,
                                p.FirstName as PersonFirstName, 
                                p.LastName as PersonLastName, 
                                p.IsDSM as PersonIsDSM, 
                                p.IsDSM as OutletSource, 
                                IsNull(r.Role,0) as InputByRole,
                                IsNull(r1.Role,0) as AmendByRole,
                                ot.Name as OutletTypeName,
                                ISNULL(oi.IsCompressed, 0)  AS IsCompressed,
                                oi.Image1 as StringImage1, 
                                oi.Image2 as StringImage2, 
                                oi.Image3 as StringImage3, 
                                oi.Image4 as StringImage4,
                                oi.Image5 as StringImage5, 
                                oi.Image6 as StringImage6,
                                oi.ImageData1, 
                                oi.ImageData2, 
                                oi.ImageData3, 
                                oi.ImageData4,
                                oi.ImageData5, 
                                oi.ImageData6
                            from outlet o with(nolock)
                                left join OutletType ot with(nolock) on ot.ID = o.OTypeID 
                                left join Person p with(nolock) on p.ID = o.PersonID 
                                left join PersonRole r with(nolock) on r.PersonID = o.InputBy 
			                    left join PersonRole r1 with(nolock) on r1.PersonID = o.AmendBy 
                                left join OutletImage oi with(nolock) on oi.OutletID = o.ID
                              where o.ProvinceID = @p0
                        ) as tmp
                        where RowNo between @p1 and @p2");

                results = DC.Database.SqlQuery<DownloadOutlet>(SQL_DOWNLOAD_OUTLET_1, provinceID, from + 1, to).ToArray();
                foreach (var outlet in results)
                {
                    if (!outlet.IsCompressed)
                    {
                        if (outlet.ImageData1 != null)
                            outlet.StringImage1 = Utils.ToBase64(outlet.ImageData1);

                        if (outlet.ImageData2 != null)
                            outlet.StringImage2 = Utils.ToBase64(outlet.ImageData2);

                        if (outlet.ImageData3 != null)
                            outlet.StringImage3 = Utils.ToBase64(outlet.ImageData3);

                        if (outlet.ImageData4 != null)
                            outlet.StringImage4 = Utils.ToBase64(outlet.ImageData4);

                        if (outlet.ImageData5 != null)
                            outlet.StringImage5 = Utils.ToBase64(outlet.ImageData5);

                        if (outlet.ImageData6 != null)
                            outlet.StringImage6 = Utils.ToBase64(outlet.ImageData6);
                    }
                }
            }
            else
            {
                var SQL_DOWNLOAD_OUTLET_2 = string.Format(@"select * from (
                           select Row_Number() over(order by o.ID) as RowNo,
                                o.*,
                                p.FirstName as PersonFirstName, 
                                p.LastName as PersonLastName, 
                                p.IsDSM as PersonIsDSM, 
                                p.IsDSM as OutletSource, 
                                IsNull(r.Role,0) as InputByRole,
                                IsNull(r1.Role,0) as AmendByRole,
                                ot.Name as OutletTypeName
                            from outlet o with(nolock)
                                left join OutletType ot with(nolock) on ot.ID = o.OTypeID 
                                left join Person p with(nolock) on p.ID = o.PersonID 
                                left join PersonRole r with(nolock) on r.PersonID = o.InputBy 
			                    left join PersonRole r1 with(nolock) on r1.PersonID = o.AmendBy 
                              where o.ProvinceID = @p0
                        ) as tmp
                        where RowNo between @p1 and @p2");

                results = DC.Database.SqlQuery<DownloadOutlet>(SQL_DOWNLOAD_OUTLET_2, provinceID, from + 1, to).ToArray();
            }

            return results;
        }

        public OutletEntity[] GetNearByOutlets(double lat, double lng, double maxDistanceInMeter, int maxItemCount, int status, int personID, bool auditor)
        {
            // {0}: lat, {1}: lng, {2}: max_distance, {3}: max_item_count
            var SQL_QUERY = @"SELECT TOP ({3}) * FROM 
	                (SELECT o.*, 
			                ot.Name as OutletTypeName, 
			                pr.Name as ProvinceName,
			                p.FirstName as PersonFirstName,  
			                p.LastName as PersonLastName,
			                ISNULL(p.IsDSM, 0) as PersonIsDSM,
			                ISNULL(r1.Role, 0) as InputByRole,
			                ISNULL(r2.Role, 0) as AmendByRole,
                            ISNULL(oi.IsCompressed, 0) as CompressImage,
                            oi.Image1 as StringImage1, 
                            oi.Image2 as StringImage2, 
                            oi.Image3 as StringImage3, 
                            oi.Image4 as StringImage4,
                            oi.Image5 as StringImage5, 
                            oi.Image6 as StringImage6,
                            oi.ImageData1, 
                            oi.ImageData2, 
                            oi.ImageData3, 
                            oi.ImageData4,
                            oi.ImageData5, 
                            oi.ImageData6,
			                (pc.distance_unit
				                 * DEGREES(ACOS(COS(RADIANS({0}))
				                 * COS(RADIANS(o.Latitude))
				                 * COS(RADIANS({1}) - RADIANS(o.Longitude))
				                 + SIN(RADIANS({0}))
				                 * SIN(RADIANS(o.Latitude)))) * 1000) AS Distance
	                FROM 
		                ((Outlet as o with(nolock)
                            left join OutletImage oi with(nolock) on oi.OutletID = o.ID
			                left join Province pr with(nolock) on o.ProvinceID = pr.ID
			                left join OutletType ot with(nolock) on o.OTypeID = ot.ID
			                left join Person p with(nolock) on p.ID = o.PersonID 
			                left join PersonRole r with(nolock) on p.ID = r.PersonID 
			                left join PersonRole r1 with(nolock) on r1.PersonID = o.InputBy
			                left join PersonRole r2 with(nolock) on r2.PersonID = o.AmendBy) 
		                JOIN (SELECT 50.0 AS radius, 111.045 AS distance_unit) AS pc ON 1=1) 

	                WHERE o.Latitude
		                BETWEEN {0}  - (pc.radius / pc.distance_unit)
		                AND {0}  + (pc.radius / pc.distance_unit)
		                AND o.Longitude BETWEEN {1} - (pc.radius / (pc.distance_unit * COS(RADIANS({0}))))
		                AND {1} + (pc.radius / (pc.distance_unit * COS(RADIANS({0}))))) as tb
	                WHERE tb.Distance <= {2} ";

            if (status == 0)        // NEAR-BY
            {
                SQL_QUERY += $"AND tb.AuditStatus <> {Constants.StatusDelete}";
            }
            else if (status == 1)   // NEW
            {
                if (auditor)
                {
                    SQL_QUERY += $"AND ((tb.AuditStatus = {Constants.StatusAuditorNew} AND tb.PersonID = {personID}) OR tb.AuditStatus IN ({Constants.StatusPost}, {Constants.StatusAuditAccept}, {Constants.StatusAuditDeny}, {Constants.StatusAuditorAccept}))";
                }
                else
                {
                    SQL_QUERY += $"AND tb.AuditStatus IN ({Constants.StatusNew}, {Constants.StatusPost}, {Constants.StatusAuditAccept}, {Constants.StatusAuditDeny}, {Constants.StatusAuditorAccept})";
                }
            }
            else if (status == 2)   // EDIT
            {
                if (auditor)
                {
                    SQL_QUERY += $"AND tb.AuditStatus = {Constants.StatusExistingPost} AND tb.PersonID <> {personID}";
                }
                else
                {
                    SQL_QUERY += $"AND tb.AmendBy = {personID} AND tb.AuditStatus IN ({Constants.StatusEdit}, {Constants.StatusExistingPost}, {Constants.StatusExistingAccept}, {Constants.StatusExistingDeny})";
                }
            }
            else if (status == 3)   // AUDIT
            {
                SQL_QUERY += $"AND tb.AmendBy = {personID} AND tb.AuditStatus IN ({Constants.StatusAuditAccept}, {Constants.StatusAuditDeny}, {Constants.StatusExistingAccept}, {Constants.StatusExistingDeny}, {Constants.StatusAuditorAccept})";
            }
            else  // NEW BY PERSON ID
            {
                if (auditor)
                {
                    SQL_QUERY += $"AND tb.PersonID = {personID} AND tb.AuditStatus IN ({Constants.StatusAuditorNew}, {Constants.StatusAuditorAccept})";
                }
                else
                {
                    SQL_QUERY += $"AND tb.PersonID = {personID} AND tb.AuditStatus IN ({Constants.StatusNew}, {Constants.StatusPost}, { Constants.StatusAuditAccept}, {Constants.StatusAuditDeny})";
                }
            }

            SQL_QUERY += " ORDER BY Distance";

            return DC.Database.SqlQuery<OutletEntity>(string.Format(SQL_QUERY, lat, lng, maxDistanceInMeter, maxItemCount)).ToArray();
        }

        public OutletEntity[] SearchOutlets(int code, string name)
        {
            // {0}: lat, {1}: lng, {2}: max_distance, {3}: max_item_count
            var SQL_QUERY = @"SELECT o.*, 
			            ot.Name as OutletTypeName, 
			            pr.Name as ProvinceName,
			            p.FirstName as PersonFirstName,  
			            p.LastName as PersonLastName,
			            ISNULL(p.IsDSM, 0) as PersonIsDSM,
			            ISNULL(r1.Role, 0) as InputByRole,
			            ISNULL(r2.Role, 0) as AmendByRole,
                        ISNULL(oi.IsCompressed, 0) as CompressImage,
			            oi.Image1 as StringImage1, 
                        oi.Image2 as StringImage2, 
                        oi.Image3 as StringImage3, 
                        oi.Image4 as StringImage4,
                        oi.Image5 as StringImage5, 
                        oi.Image6 as StringImage6,
                        oi.ImageData1, 
                        oi.ImageData2, 
                        oi.ImageData3, 
                        oi.ImageData4,
                        oi.ImageData5, 
                        oi.ImageData6
	            FROM 
		            (Outlet as o with(nolock)
			            left join OutletImage oi with(nolock) on oi.OutletID = o.ID
			            left join Province pr with(nolock) on o.ProvinceID = pr.ID
			            left join OutletType ot with(nolock) on o.OTypeID = ot.ID
			            left join Person p with(nolock) on p.ID = o.PersonID 
			            left join PersonRole r with(nolock) on p.ID = r.PersonID 
			            left join PersonRole r1 with(nolock) on r1.PersonID = o.InputBy
			            left join PersonRole r2 with(nolock) on r2.PersonID = o.AmendBy) 
	            WHERE 
		            o.Name like N'%{0}%' OR o.ID = {1}";

            return DC.Database.SqlQuery<OutletEntity>(string.Format(SQL_QUERY, name, code)).ToArray();
        }
    }
}