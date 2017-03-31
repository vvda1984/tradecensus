using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using TradeCensus.Shared;

namespace TradeCensus
{
    public class ConfigService : TradeCensusServiceBase, IConfigService
    {
        public ConfigService() : base("Config")
        {
        }

        public DownloadMapIconsResponse DownloadMapIcons()
        {
            DownloadMapIconsResponse resp = new DownloadMapIconsResponse();

            try
            {
                var setting = DC.Configs.FirstOrDefault(x => string.Compare(x.Name, "outlet_map_icons", StringComparison.OrdinalIgnoreCase) == 0);
                var mapIcons = JsonConvert.DeserializeObject<OutletMapIcon>(setting.Value);
                resp.Version = mapIcons.version;

                var salesmanPath = Path.Combine(ImagesPath, mapIcons.salesman_new_outlet);                
                if (File.Exists(salesmanPath))
                    resp.SalesmanNewOutletMapIcon = Convert.ToBase64String(File.ReadAllBytes(salesmanPath));
                
                var agencyPath = Path.Combine(ImagesPath, mapIcons.agency_new_outlet);
                if (File.Exists(agencyPath))
                    resp.AgencyNewOutletMapIcon = Convert.ToBase64String(File.ReadAllBytes(agencyPath));

                var auditorPath = Path.Combine(ImagesPath, mapIcons.auditor_new_outlet);
                if (File.Exists(auditorPath))
                    resp.AuditorNewOutletMapIcon = Convert.ToBase64String(File.ReadAllBytes(auditorPath));
            }
            catch (Exception ex)
            {
                resp.Status = Constants.ErrorCode;
                resp.ErrorMessage = ex.Message;
            }
            return resp;
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
                var latestVersion = DC.Configs.FirstOrDefault(i=>string.Compare(i.Name, "version", StringComparison.OrdinalIgnoreCase) == 0);
                if (latestVersion != null)
                {
                    int lastVersionNumber = int.Parse(latestVersion.Value);
                    int currVersionNumber = int.Parse(version);

                    if (lastVersionNumber > currVersionNumber)
                    {
                        var msg = DC.Configs.FirstOrDefault(i =>
                            string.Compare(i.Name, "NewVersionMessage", StringComparison.OrdinalIgnoreCase) == 0 ||
                            string.Compare(i.Name, "new_version_message", StringComparison.OrdinalIgnoreCase) == 0);
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

    public class OutletMapIcon
    {
        public int version { get; set; }
        public string salesman_new_outlet { get; set; }
        public string agency_new_outlet { get; set; }
        public string auditor_new_outlet { get; set; }
    }
}