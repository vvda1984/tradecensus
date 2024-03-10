using NLog;
using System;
using TradeCensus.Data;

namespace TradeCensus.Shared
{
    public abstract class TradeCensusServiceBase : IDisposable
    {
        protected ServiceDataContext DC;
        protected ILogger _logger;
        protected bool _isDataChanged;
        protected string _name;

        protected TradeCensusServiceBase(string name)
        {
            DC = new ServiceDataContext(); // throw error
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

        protected PersonRoleModel ValidatePerson(int personID, string password, bool mustAuditor = false)
        {
            return DC.ValidatePerson(personID, password, mustAuditor, GetAppSetting("enableValidation", false));
        }

        protected void Log(string message)
        {
            _logger.Info(message);
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

        protected T GetAppSetting<T>(string key, T defaultValue = default(T))
        {
            return Utils.GetAppSetting(key, defaultValue);
        }
    }
}