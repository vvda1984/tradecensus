using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using TradeCensus.Shared;

namespace TradeCensus
{
    public class ConfigService : TradeCensusServiceBase, IConfigService
    {
        public ConfigService() : base("Config")
        {
        }

        private void FillMapIcon(DownloadMapIconsResponse resp, string name, string relativedPath)
        {
            string content = null;
            var imageFile = Path.Combine(Utils.ImagesPath, relativedPath);
            if (File.Exists(imageFile))
                content = Convert.ToBase64String(File.ReadAllBytes(imageFile));

            if (content != null)
                resp.Icons.Add(name, content);
        }

        public DownloadMapIconsResponse DownloadMapIcons()
        {
            DownloadMapIconsResponse resp = new DownloadMapIconsResponse() { Icons = new Dictionary<string, string>() };

            try
            {
                var value = DC.GetMapIconsSetting();
                if (!string.IsNullOrWhiteSpace(value))
                {
                    var mapIcons = JsonConvert.DeserializeObject<OutletMapIcon>(value);
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
                    FillMapIcon(resp, "tc_agency_auditor_new_outlet", mapIcons.tc_agency_auditor_new_outlet);
                    FillMapIcon(resp, "tc_agency_auditor_new_outlet_denied", mapIcons.tc_agency_auditor_new_outlet_denied);
                    FillMapIcon(resp, "tc_agency_auditor_new_outlet_approved", mapIcons.tc_agency_auditor_new_outlet_approved);

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
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, "Cannot get map icons settings.");

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
                resp.Items = DC.GetSettings();
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, $"Cannot get settings.");

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
                var versions = DC.GetVersion();
                var latestVersion = versions[0];
                if (!string.IsNullOrWhiteSpace(latestVersion))
                {
                    int lastVersionNumber = int.Parse(latestVersion);
                    int currVersionNumber = int.Parse(version);

                    if (lastVersionNumber > currVersionNumber)
                    {
                        resp.Version = lastVersionNumber;
                        resp.Message = string.IsNullOrWhiteSpace(versions[1]) ? "" : versions[1];
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, $"Cannot get version.");

                resp.Status = Constants.ErrorCode;
                resp.ErrorMessage = ex.Message;
            }
            return resp;
        }
    }
}