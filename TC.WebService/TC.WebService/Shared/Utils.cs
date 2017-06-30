using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Web;
using NLog;

namespace TradeCensus.Shared
{
    public static class Utils
    {
        static AppSettingsReader _appSettingsReader;
        static object _locker = new object();

        public static string ImagesPath
        {
            get
            {
                string path = AppDomain.CurrentDomain.BaseDirectory;
                path = Path.GetDirectoryName(path) + "\\Images";
                EnsureDirExist(path);
                return path;
            }
        }

        public static void EnsureDirExist(string path)
        {
            if (Directory.Exists(path)) return;

            string parent = Path.GetDirectoryName(path);
            EnsureDirExist(parent);
            Directory.CreateDirectory(path);
        }

        public static string ToBase64(byte[] data)
        {
            return data == null || data.Length == 0 ? "" : Convert.ToBase64String(data);
        }

        public static void SaveToFile(ILogger logger, int outletID, int index, string image, out string relativePath, out byte[] data)
        {
            relativePath = $"{outletID}_{index}.jpg";
            data = Convert.FromBase64String(image);

            try
            {
                string imageDir = ImagesPath;
                string imagePath = Path.Combine(imageDir, relativePath);

                File.WriteAllBytes(imagePath, data);
            }
            catch (Exception ex)
            {
                logger.Warn($"Cannot save image of outlet {outletID}: {ex}");
            }
            relativePath = "/Images/" + relativePath;
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