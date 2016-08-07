﻿using NLog;
using System;
using System.Linq;
using TradeCensusService.Shared;

namespace TradeCensus.Shared
{
    public abstract class BaseRepo : IDisposable
    {
        protected tradecensusEntities _entities;
        protected Logger _logger;
        protected bool _isDataChanged;
        protected string _name;     

        protected void ValidatePerson(int personID)
        {
            var user = _entities.PersonRoles.FirstOrDefault(i => i.PersonID == personID);
            if (user == null)
                throw new Exception(string.Format("User {0} doesn't exist", personID));
        }

        protected BaseRepo(string name)
        {            
            _entities = new tradecensusEntities(); // throw error
            _name = name;
            _logger = LogUtil.GetLogger(name);
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
                value = _entities.Configs.FirstOrDefault(i => i.Name == key).Value;
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