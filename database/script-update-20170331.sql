ALTER TABLE [Config] ALTER COLUMN [Value] nvarchar(max);
INSERT [dbo].[Config] ([Name], [Value]) VALUES (N'enable_check_in', N'1')
INSERT [dbo].[Config] ([Name], [Value]) VALUES (N'check_rooted_device', N'1')
INSERT [dbo].[Config] ([Name], [Value]) VALUES (N'outlet_map_icons', N'{
  "version" : 1,
  "salesman_new_outlet" : "map\\salesman-pin-new.png",
  "agency_new_outlet" : "map\\agency-pin-new.png",
  "auditor_new_outlet" : "map\\auditor-pin-new.png"
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