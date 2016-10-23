﻿using System;
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
        JournalResponse AddJournal(string personID, string password, Journal entry);

        [OperationContract]
        GetJournalResponse GetJournals(string personID, string password, string dateFrom, string dateTo);

        [OperationContract]
        SyncJournalResponse SyncJournals(string personID, string password, Journal[] entries);
    }
}
