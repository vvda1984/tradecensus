using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.Text;

namespace TradeCensus
{
    [ServiceContract]
    public interface IJournalService
    {
        [OperationContract]
        JournalResponse AddJournal(string personID, string password, JournalModel entry);

        [OperationContract]
        GetJournalResponse GetJournals(string personID, string password, string dateFrom, string dateTo);

        [OperationContract]
        GetJournalResponse GetsalesmanJournals(string personID, string password, string salemanID, string dateFrom, string dateTo);

        [OperationContract]
        SyncJournalResponse SyncJournals(string personID, string password, JournalModel[] entries);
    }
}
