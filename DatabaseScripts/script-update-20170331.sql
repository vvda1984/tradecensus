ALTER TABLE [Config] ALTER COLUMN [Value] nvarchar(max);
INSERT [dbo].[Config] ([Name], [Value]) VALUES (N'enable_check_in', N'1')
INSERT [dbo].[Config] ([Name], [Value]) VALUES (N'check_rooted_device', N'1')
INSERT [dbo].[Config] ([Name], [Value]) VALUES (N'outlet_map_icons', N'{
  "version": 2,
  "tc_salesman_outlet": "map\\tc_salesman_outlet.png",
  "tc_salesman_outlet_denied": "map\\tc_salesman_outlet_denied.png",
  "tc_agency_outlet": "map\\tc_agency_outlet.png",
  "tc_agency_outlet_denied": "map\\tc_agency_outlet_denied.png",  
  "tc_auditor_outlet": "map\\tc_auditor_outlet.png",
  "tc_auditor_outlet_denied": "map\\tc_auditor_outlet_denied.png",
  "tc_agency_auditor_outlet": "map\\tc_agency_auditor_outlet.png",
  "tc_agency_auditor_outlet_denied": "map\\tc_agency_auditor_outlet_denied.png",  
  "sr_outlet_audit_denied": "map\\sr_outlet_audit_denied.png",
  "sr_outlet_audit_approved": "map\\sr_outlet_audit_approved.png",
  "sr_outlet_closed": "map\\sr_outlet_closed.png",
  "sr_outlet_non_track": "map\\sr_outlet_non_track.png",
  "sr_outlet_opened": "map\\sr_outlet_opened.png",
  "dis_outlet_audit_denied": "map\\dis_outlet_audit_denied.png",
  "dis_outlet_audit_approved": "map\\dis_outlet_audit_approved.png",
  "dis_outlet_closed": "map\\dis_outlet_closed.png",
  "dis_outlet_opened": "map\\dis_outlet_opened.png"
}')
INSERT [dbo].[Config] ([Name], [Value]) VALUES (N'hotlines', N'[{"name": "VBL Agency 1", "phone" : "0909000123" },
{"name": "VBL Agency 2", "phone" : "0909000456" },
{"name": "Test Hotline long name long name", "phone" : "0909789123" }]')


ALTER TABLE [OutletImage] ADD [Image4] nvarchar(max) NULL;
ALTER TABLE [OutletImage] ADD [ImageData4] image NULL;
ALTER TABLE [OutletImage] ADD [Image5] nvarchar(max) NULL;
ALTER TABLE [OutletImage] ADD [ImageData5] image NULL;
ALTER TABLE [OutletImage] ADD [Image6] nvarchar(max) NULL;
ALTER TABLE [OutletImage] ADD [ImageData6] image NULL;