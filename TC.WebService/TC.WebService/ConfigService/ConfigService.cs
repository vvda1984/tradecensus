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
            DownloadMapIconsResponse resp = new DownloadMapIconsResponse() { Icons = new Dictionary<string, string>() };

            try
            {
                var setting = DC.Configs.FirstOrDefault(x => string.Compare(x.Name, "outlet_map_icons", StringComparison.OrdinalIgnoreCase) == 0);
                var mapIcons = JsonConvert.DeserializeObject<OutletMapIcon>(setting.Value);
                resp.Version = mapIcons.version;

                FillMapIcon(resp, "tc_salesman_outlet", mapIcons.tc_salesman_outlet);
                FillMapIcon(resp, "tc_salesman_outlet_denied", mapIcons.tc_salesman_outlet_denied);
                FillMapIcon(resp, "tc_auditor_outlet", mapIcons.tc_auditor_outlet);
                FillMapIcon(resp, "tc_auditor_outlet_denied", mapIcons.tc_auditor_outlet_denied);

                FillMapIcon(resp, "tc_agency_new_outlet", mapIcons.tc_agency_new_outlet);
                FillMapIcon(resp, "tc_agency_new_outlet_denied", mapIcons.tc_agency_new_outlet_denied);
                FillMapIcon(resp, "tc_agency_new_outlet_approved", mapIcons.tc_agency_new_outlet_approved);
                FillMapIcon(resp, "tc_agency_existing_outlet_edited", mapIcons.tc_agency_existing_outlet_edited);
                FillMapIcon(resp, "tc_agency_existing_outlet_denied", mapIcons.tc_agency_existing_outlet_denied);
                FillMapIcon(resp, "tc_agency_existing_outlet_approved", mapIcons.tc_agency_existing_outlet_approved);

                FillMapIcon(resp, "sr_outlet_audit_denied", mapIcons.sr_outlet_audit_denied);
                FillMapIcon(resp, "sr_outlet_audit_approved", mapIcons.sr_outlet_audit_approved);
                FillMapIcon(resp, "sr_outlet_non_track", mapIcons.sr_outlet_non_track);
                FillMapIcon(resp, "sr_outlet_closed", mapIcons.sr_outlet_closed);
                FillMapIcon(resp, "sr_outlet_opened", mapIcons.sr_outlet_opened);

                FillMapIcon(resp, "dis_outlet_audit_denied", mapIcons.dis_outlet_audit_denied);
                FillMapIcon(resp, "dis_outlet_audit_approved", mapIcons.dis_outlet_audit_approved);
                FillMapIcon(resp, "dis_outlet_closed", mapIcons.dis_outlet_closed);
                FillMapIcon(resp, "dis_outlet_opened", mapIcons.dis_outlet_opened);
     
            }
            catch (Exception ex)
            {
                resp.Status = Constants.ErrorCode;
                resp.ErrorMessage = ex.Message;
            }
            return resp;
        }
    
        private void FillMapIcon(DownloadMapIconsResponse resp, string name, string relativedPath)
        {
            string content = null;
            var imageFile = Path.Combine(ImagesPath, relativedPath);
            if (File.Exists(imageFile))
                content = Convert.ToBase64String(File.ReadAllBytes(imageFile));

            if (content != null)
                resp.Icons.Add(name, content);
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
        public string tc_salesman_outlet { get; set; }
        public string tc_salesman_outlet_denied { get; set; }
        public string tc_auditor_outlet { get; set; }
        public string tc_auditor_outlet_denied { get; set; }

        public string tc_agency_new_outlet { get; set; } // Sales of Agency creates new outlets
        public string tc_agency_new_outlet_denied { get; set; } // Auditor of Agency denies new outlets
        public string tc_agency_new_outlet_approved { get; set; } // Auditor of Agency approves new outlets
        public string tc_agency_existing_outlet_edited { get; set; } // Sales of Agency edit existing outlets
        public string tc_agency_existing_outlet_denied { get; set; } // Auditor of Agency denies editing of existing outlets
        public string tc_agency_existing_outlet_approved { get; set; } // Auditor of Agency approves editing of existing outlets

        public string sr_outlet_audit_denied { get; set; }
        public string sr_outlet_audit_approved { get; set; }
        public string sr_outlet_closed { get; set; }
        public string sr_outlet_non_track { get; set; }
        public string sr_outlet_opened { get; set; }
        public string dis_outlet_audit_denied { get; set; }
        public string dis_outlet_audit_approved { get; set; }
        public string dis_outlet_closed { get; set; }
        public string dis_outlet_opened { get; set; }
    }
}