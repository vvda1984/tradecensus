using System;
using System.Collections.Generic;
using System.Linq;
using TradeCensus.Shared;

namespace TradeCensus
{
    public class ConfigService : TradeCensusServiceBase, IConfigService
    {
        public ConfigService():base("Config")
        {
        }

        public ConfigResponse GetConfig()
        {
            ConfigResponse resp = new ConfigResponse();
            try
            {
                Log("Get all config");
                var items = _entities.Configs.ToArray();
                Dictionary<string, string> configDict = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
                foreach (var i in items)
                    if (!configDict.ContainsKey(i.Name))
                        configDict.Add(i.Name, i.Value);

                resp.Items = configDict;
            }
            catch (Exception ex)
            {
                resp.Status = Constants.ErrorCode;
                resp.ErrorMessage = ex.Message;
            }
            return resp;
        }
    }
}