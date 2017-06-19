using System;
using System.Collections.Generic;
using TradeCensus.Shared;

namespace TradeCensus
{
    public class JournalService : TradeCensusServiceBase, IJournalService
    {
        static object SyncJournalSave = new object();
        public JournalService() : base("Journal")
        {
        }

        private int AddNewJournal(JournalModel journal)
        {
            var startTS = DateTime.ParseExact(journal.StartTS, Constants.DatetimeFormat, null);
            var endTS = DateTime.ParseExact(journal.EndTS, Constants.DatetimeFormat, null);
            var journalDate = DateTime.ParseExact(journal.JournalDate, Constants.ShortDateFormat, null);

            var existing = DC.GetJournal(journalDate, journal.Data);
            if (existing != null) return existing.ID;

            var newJournal = DC.InsertJournal(journal);
            DC.SaveChanges();
            return newJournal.ID;
        }

        private int AddOrUpdateJournal(JournalModel journal)
        {
            lock (SyncJournalSave)
            {
                if (journal.Id <= 0)
                    return AddNewJournal(journal);
                else
                {
                    DC.UpdateJournal(journal);
                    DC.SaveChanges();
                    return journal.Id;
                }
            }
        }

        private JournalHistory[] GetJournalHistory(int person, string dateFrom, string dateTo)
        {
            List<JournalHistory> journals = new List<JournalHistory>();
            Dictionary<string, JournalHistory> dict = new Dictionary<string, JournalHistory>(StringComparer.InvariantCultureIgnoreCase);
            
            DateTime fromTS = DateTime.ParseExact(dateFrom, Constants.ShortDateFormat, null);
            DateTime toTSTemp = DateTime.ParseExact(dateTo, Constants.ShortDateFormat, null);
            DateTime toTS = new DateTime(toTSTemp.Year, toTSTemp.Month, toTSTemp.Day, 23, 59, 59);

            var query = DC.GetJournalsOrPerson(person, fromTS, toTS);
           
            foreach (var item in query)
            {
                var polyineJson = GeoCoordinate.ParseJournal(item.Data);
                string key = item.JournalDate.ToString(Constants.ShortDateFormat);
                JournalHistory journal;
                if (!dict.ContainsKey(key))
                {
                    journal = new JournalHistory { date = key, Journals = new List<JournalModel>() };
                    journals.Add(journal);
                    dict.Add(key, journal);
                }
                else
                    journal = dict[key];

                journal.Journals.Add(new JournalModel
                {
                    Id = item.ID,
                    Data = polyineJson,
                    EndTS = item.EndTS.ToString(Constants.DatetimeFormat),
                    JournalDate = item.JournalDate.ToString(Constants.ShortDateFormat),
                    PersonId = item.PersonID,
                    StartTS = item.StartTS.ToString(Constants.DatetimeFormat)
                });
            }
            return journals.ToArray();
        }


        public JournalResponse AddJournal(string personID, string password, JournalModel journal)
        {
            //var person = int.Parse(personID);
            //ValidatePerson(person, password);
            return new JournalResponse { JournalID = AddOrUpdateJournal(journal) };
        }

        public GetJournalResponse GetJournals(string personID, string password, string dateFrom, string dateTo)
        {
            var person = int.Parse(personID);
            ValidatePerson(person, password);
            GetJournalResponse response = new GetJournalResponse { Items = GetJournalHistory(person, dateFrom, dateTo) };
            return response;
        }

        public SyncJournalResponse SyncJournals(string personID, string password, JournalModel[] entries)
        {
            SyncJournalResponse res = new SyncJournalResponse { JournalIDs = new List<JournalSync>() };
            foreach (var entry in entries)
            {
                if (entry.PersonId == 0) entry.PersonId = int.Parse(personID);
                res.JournalIDs.Add(new JournalSync { Id = AddOrUpdateJournal(entry), JournalID = entry.JournalID });
            }
            return res;
        }

        public GetJournalResponse GetsalesmanJournals(string personID, string password, string salemanID, string dateFrom, string dateTo)
        {
            var person = int.Parse(personID);
            ValidatePerson(person, password);
            GetJournalResponse response = new GetJournalResponse
            {
                Items = GetJournalHistory(int.Parse(salemanID), dateFrom, dateTo)
            };
            return response;
        }
    }
}