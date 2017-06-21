using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;

namespace TradeCensus.Shared
{
    public static class Utils
    {
        static AppSettingsReader _appSettingsReader;
        static object _locker = new object();

        public static string ToBase64(byte[] data)
        {
            return data == null || data.Length == 0 ? "" : Convert.ToBase64String(data);
        }

        public static T GetAppSetting<T>(string key, T defaultValue = default(T))
        {
            lock (_locker)
            {
                if (_appSettingsReader == null)
                    _appSettingsReader = new AppSettingsReader();
            }

            try
            {
                var value = (T)_appSettingsReader.GetValue(key, typeof(T));
                return (value == null) ? defaultValue : value;
            }
            catch
            {
                return defaultValue;
            }
        }
    }
}