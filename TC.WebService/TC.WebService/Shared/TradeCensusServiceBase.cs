using NLog;
using System;
using System.Linq;
using TradeCensus.Data;

namespace TradeCensus.Shared
{
    public abstract class TradeCensusServiceBase : IDisposable
    {
        protected tradecensusEntities DC;
        protected ILogger _logger;
        protected bool _isDataChanged;
        protected string _name;

        protected TradeCensusServiceBase(string name)
        {
            DC = new tradecensusEntities(); // throw error
            _name = name;
            _logger = DependencyResolver.Resolve<ILogFactory>().GetLogger(name);
        }


        public void Dispose()
        {
            if (_isDataChanged && DC != null)
            {
                try
                {
                    DC.SaveChanges();
                }
                catch (Exception ex)
                {
                    Log("[{0}] Save changes error: {1}", _name, ex);
                }
            }
        }


        protected void ValidatePerson(int personID, string password, bool mustAuditor = false)
        {
            var person = DC.PersonRoles.FirstOrDefault(i => i.PersonID == personID && i.Password == password);
            if (person == null)
                throw new Exception($"Invalid user {personID}");

            if (mustAuditor && !person.IsAuditor)
                throw new Exception($"Person {personID} is not auditor");
        }

        protected void Log(string message)
        {
            _logger.Debug(message);
        }

        protected void Log(string message, params object[] args)
        {
            _logger.Debug(message, args);
        }

        protected int ToInt(string value)
        {
            try
            {
                return int.Parse(value);
            }
            catch
            {
                throw new InvalidOperationException(string.Format("Cannot convert '{0}' to number", value));
            }
        }

        protected string GetSetting(string key, string defaultValue)
        {
            string value;
            try
            {
                value = DC.Configs.FirstOrDefault(i => i.Name == key).Value;
            }
            catch
            {
                Log("Missing setting '{0}', use default: {1}", key, defaultValue);
                value = defaultValue;
            }
            return value;
        }
    }
}