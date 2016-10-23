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

            DateTime fromTS = DateTime.ParseExact(dateFrom, Constants.ShortDateFormat, null);
            DateTime toTS = DateTime.ParseExact(dateTo, Constants.ShortDateFormat, null);
            GetJournalResponse response = new GetJournalResponse();

            List<JournalHistory> journals = new List<JournalHistory>();
            Dictionary<string, JournalHistory> dict = new Dictionary<string, JournalHistory>(StringComparer.InvariantCultureIgnoreCase);

            var query = DC.Journals.Where(x => x.PersonID == person && x.JournalDate >= fromTS && x.JournalDate <= toTS);
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
            SyncJournalResponse res = new SyncJournalResponse();
            foreach (var entry in entries)
                res.JournalIDs.Add(new JournalSync { Id = AddOrUpdateJournal(entry).ID, JournalID = entry.JournalID });
            return res;
        }
    }
}