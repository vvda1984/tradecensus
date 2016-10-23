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
                var items = DC.Configs.ToArray();
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

        public CheckVersionResponse GetVersion(string version)
        {
            CheckVersionResponse resp = new CheckVersionResponse();
            try
            {
                Log("Get all config");
                var latestVersion = DC.Configs.FirstOrDefault(i=>string.Compare(i.Name, "Version", StringComparison.OrdinalIgnoreCase) == 0);
                if (latestVersion != null)
                {
                    int lastVersionNumber = int.Parse(latestVersion.Value);
                    int currVersionNumber = int.Parse(version);

                    if (lastVersionNumber > currVersionNumber)
                    {
                        var msg = DC.Configs.FirstOrDefault(i => string.Compare(i.Name, "NewVersionMessage", StringComparison.OrdinalIgnoreCase) == 0);


                        resp.Version = lastVersionNumber;
                        resp.Message = msg != null ? msg.Value : "";
                    }
                }
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