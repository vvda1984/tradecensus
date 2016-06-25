using System;
using System.Collections.Generic;
using System.Linq;
using TradeCensus.Shared;

namespace TradeCensus
{
    public class ConfigRepo : BaseRepo
    {
        public ConfigRepo():base("Config")
        {
        }

        public Dictionary<string, string> GetAll()
        {
            Log("Get all config");
            var items = _entities.Configs.ToArray();
            Dictionary<string, string> dict = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            foreach(var i in items)
                if (!dict.ContainsKey(i.Name))
                    dict.Add(i.Name, i.Value);

            return dict;

            //using (MemoryStream ms = new MemoryStream())
            //{
            //    DataContractJsonSerializer ser = new DataContractJsonSerializer(typeof(Dictionary<string, string>));
            //    ser.WriteObject(ms, dict);
            //    ms.Position = 0;
            //    using (StreamReader sr = new StreamReader(ms))
            //        return sr.ReadToEnd();
            //}
        }
    }
}