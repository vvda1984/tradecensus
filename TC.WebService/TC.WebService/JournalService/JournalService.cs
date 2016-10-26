using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using TradeCensus.Shared;

namespace TradeCensus
{
    public class JournalService : TradeCensusServiceBase, IJournalService
    {
        public JournalService() : base("Journal")
        {
        }

        private Data.Journal AddNewJournal(Journal journal)
        {
            var startTS = DateTime.ParseExact(journal.StartTS, Constants.DatetimeFormat, null);
            var endTS = DateTime.ParseExact(journal.EndTS, Constants.DatetimeFormat, null);
            var journalDate = DateTime.ParseExact(journal.JournalDate, Constants.ShortDateFormat, null);

            var existing = DC.Journals.FirstOrDefault(x=> x.JournalDate == journalDate && x.Data == journal.Data );
            if (existing != null) return existing;
            
            var newJournal = new Data.Journal()
            {
                StartTS = DateTime.ParseExact(journal.StartTS, Constants.DatetimeFormat, null),
                EndTS = DateTime.ParseExact(journal.EndTS, Constants.DatetimeFormat, null),
                Data = journal.Data,
                PersonID = journal.PersonId,
                JournalDate = DateTime.ParseExact(journal.JournalDate, Constants.ShortDateFormat, null)
            };
            DC.Journals.Add(newJournal);
            DC.SaveChanges();
            return newJournal;
        }

        private Data.Journal AddOrUpdateJournal(Journal journal)
        {
            if (journal.Id == 0)
                return AddNewJournal(journal);
            else
            {
                var item = DC.Journals.FirstOrDefault(x => x.ID == journal.Id);
                if (item == null)
                    return AddNewJournal(journal);
                else
                {
                    item.StartTS = DateTime.ParseExact(journal.StartTS, Constants.DatetimeFormat, null);
                    item.EndTS = DateTime.ParseExact(journal.EndTS, Constants.DatetimeFormat, null);
                    item.JournalDate = DateTime.ParseExact(journal.JournalDate, Constants.ShortDateFormat, null);
                    item.Data = journal.Data;
                    DC.SaveChanges();
                    return item;
                }
            }
        }

        public JournalResponse AddJournal(string personID, string password, Journal journal)
        {
            var person = int.Parse(personID);
            ValidatePerson(person, password);

            return new JournalResponse { JournalID = AddOrUpdateJournal(journal).ID };
        }

        public GetJournalResponse GetJournals(string personID, string password, string dateFrom, string dateTo)
        {
            var person = int.Parse(personID);
            ValidatePerson(person, password);

            //bool nonStop = true;
            //var config = DC.Configs.FirstOrDefault(x => string.Compare(x.Name, "journal_nonstop", StringComparison.OrdinalIgnoreCase) == 0);
            //if (config != null)
            //    nonStop = config.Value == "1";

            List<JournalHistory> journals = new List<JournalHistory>();
            Dictionary<string, JournalHistory> dict = new Dictionary<string, JournalHistory>(StringComparer.InvariantCultureIgnoreCase);
            IQueryable<Data.Journal> query;

            //if (dateFrom == dateTo)
            //{
            //    DateTime fromTS = DateTime.ParseExact(dateFrom, Constants.ShortDateFormat, null);
            //    query = DC.Journals.Where(x =>
            //        x.PersonID == person && 
            //        x.JournalDate.ToString(Constants.ShortDateFormat) == dateFrom);
            //}
            //else
            //{
            //    DateTime fromTS = DateTime.ParseExact(dateFrom, Constants.ShortDateFormat, null);
            //    DateTime toTSTemp = DateTime.ParseExact(dateTo, Constants.ShortDateFormat, null);
            //    DateTime toTS = new DateTime(toTSTemp.Year, toTSTemp.Month, toTSTemp.Day, 23, 59, 59);
            //    query = DC.Journals.Where(x => x.PersonID == person && x.JournalDate >= fromTS && x.JournalDate <= toTS);
            //}

            DateTime fromTS = DateTime.ParseExact(dateFrom, Constants.ShortDateFormat, null);
            //DateTime fromTS = fromTSTemp.Subtract(new TimeSpan(0, 0, 1));
            DateTime toTSTemp = DateTime.ParseExact(dateTo, Constants.ShortDateFormat, null);
            DateTime toTS = new DateTime(toTSTemp.Year, toTSTemp.Month, toTSTemp.Day, 23, 59, 59);
            query = DC.Journals.Where(x => x.PersonID == person && x.JournalDate >= fromTS && x.JournalDate <= toTS);
            GetJournalResponse response = new GetJournalResponse();

            foreach (var item in query)
            {
                var polyineJson = GeoCoordinate.ParseJournal(item.Data);
                string key = item.JournalDate.ToString(Constants.ShortDateFormat);
                JournalHistory journal;
                if (!dict.ContainsKey(key))
                {
                    journal = new JournalHistory { date = key, Journals = new List<Journal>() };
                    journals.Add(journal);
                    dict.Add(key, journal);
                }
                else
                    journal = dict[key];

                journal.Journals.Add(new Journal
                {
                    Id = item.ID,
                    Data = polyineJson,
                    EndTS = item.EndTS.ToString(Constants.DatetimeFormat),
                    JournalDate = item.JournalDate.ToString(Constants.ShortDateFormat),
                    PersonId = item.PersonID,
                    StartTS = item.StartTS.ToString(Constants.DatetimeFormat)
                });
            }
            response.Items = journals.ToArray();
            return response;
        }

        public SyncJournalResponse SyncJournals(string personID, string password, Journal[] entries)
        {
            SyncJournalResponse res = new SyncJournalResponse { JournalIDs = new List<JournalSync>() };
            foreach (var entry in entries)
            {
                if (entry.PersonId == 0) entry.PersonId = int.Parse(personID);
                res.JournalIDs.Add(new JournalSync { Id = AddOrUpdateJournal(entry).ID, JournalID = entry.JournalID });
            }
            return res;
        }
    }
}