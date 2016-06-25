using System;
using TradeCensusService.Shared;

namespace TradeCensus.Shared
{
    public abstract class BaseRepo : IDisposable
    {
        protected tradecensusEntities _entities;
        protected Logger _logger;
        protected bool _isDataChanged;
        protected string _name;
                
        protected BaseRepo(string name)
        {            
            _entities = new tradecensusEntities(); // throw error
            _name = name;
            _logger = LogManager.GetLogger(name);
        }        
        public void Dispose()
        {
            if (_isDataChanged && _entities != null)
            {
                try {
                    _entities.SaveChanges();
                }
                catch(Exception ex)
                {
                    Log("[{0}] Save changes error: {1}", _name, ex);
                }                
            }
        }
        protected void Log(string message)
        {
            _logger.Write(message);
        }
        protected void Log(string message, params object[] args)
        {
            _logger.Write(message, args);
        }
    }
}