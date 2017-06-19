using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel.Web;
using System.Web;

namespace TradeCensus
{
    public partial class TradeCensusService
    {
        [WebInvoke(Method = "POST", UriTemplate = "journal/add/{personID}/{password}", ResponseFormat = WebMessageFormat.Json)]
        public JournalResponse AddJournal(string personID, string password, JournalModel journal)
        {
            _logger.Debug("Receive add/append journal request");
            try
            {
                IJournalService service = DependencyResolver.Resolve<IJournalService>();
                return service.AddJournal(personID, password, journal);
            }
            catch (Exception ex)
            {
                _logger.Warn($"Cannot add/append journal: {ex.ToString()}");
                return new JournalResponse
                {
                    Status = Constants.ErrorCode,
                    ErrorMessage = "Service internal error",
                };
            }
        }

        [WebInvoke(Method = "POST", UriTemplate = "journal/get/{personID}/{password}/{dateFrom}/{dateTo}", ResponseFormat = WebMessageFormat.Json)]
        public GetJournalResponse GetJournals(string personID, string password, string dateFrom, string dateTo)
        {
            _logger.Debug("Receive add/append journal request");
            try
            {
                IJournalService service = DependencyResolver.Resolve<IJournalService>();
                return service.GetJournals(personID, password, dateFrom, dateTo);
            }
            catch (Exception ex)
            {
                _logger.Warn($"Cannot get journal: {ex.ToString()}");
                return new GetJournalResponse
                {
                    Status = Constants.ErrorCode,
                    ErrorMessage = "Service internal error",
                };
            }
        }

        [WebInvoke(Method = "POST", UriTemplate = "journal/sync/{personID}/{password}", ResponseFormat = WebMessageFormat.Json)]
        public SyncJournalResponse SyncJournals(string personID, string password, JournalModel[] entries)
        {
            _logger.Debug("Receive sync outlets request");
            try
            {
                IJournalService service = DependencyResolver.Resolve<IJournalService>();
                return service.SyncJournals(personID, password, entries);
            }
            catch (Exception ex)
            {
                _logger.Warn($"Cannot sync journal: {ex.ToString()}");
                return new SyncJournalResponse
                {
                    Status = Constants.ErrorCode,
                    ErrorMessage = "Service internal error",
                };
            }
        }

        [WebInvoke(Method = "POST", UriTemplate = "journal/getsales/{personID}/{password}/{salemanID}/{dateFrom}/{dateTo}", ResponseFormat = WebMessageFormat.Json)]
        public GetJournalResponse GetsalesmanJournals(string personID, string password, string salemanID, string dateFrom, string dateTo)
        {
            _logger.Debug("Receive sync outlets request");
            try
            {
                IJournalService service = DependencyResolver.Resolve<IJournalService>();
                return service.GetsalesmanJournals(personID, password, salemanID, dateFrom, dateTo);
            }
            catch (Exception ex)
            {
                _logger.Warn($"Cannot get salesman journal: {ex.ToString()}");
                return new GetJournalResponse
                {
                    Status = Constants.ErrorCode,
                    ErrorMessage = "Service internal error",
                };
            }
        }
    }
}