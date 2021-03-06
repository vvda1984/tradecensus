USE [test_db_tc]
GO
/****** Object:  Table [dbo].[Config]    Script Date: 4/1/2017 10:19:15 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](100) NOT NULL,
	[Value] [nvarchar](max) NOT NULL,
 CONSTRAINT [PK_Config] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
SET IDENTITY_INSERT [dbo].[Config] ON 

INSERT [dbo].[Config] ([ID], [Name], [Value]) VALUES (1, N'calc_distance_algorithm', N'circle')
INSERT [dbo].[Config] ([ID], [Name], [Value]) VALUES (2, N'tbl_area_ver', N'1')
INSERT [dbo].[Config] ([ID], [Name], [Value]) VALUES (3, N'tbl_outlettype_ver', N'2')
INSERT [dbo].[Config] ([ID], [Name], [Value]) VALUES (4, N'tbl_province_ver', N'1')
INSERT [dbo].[Config] ([ID], [Name], [Value]) VALUES (5, N'tbl_zone_ver', N'1')
INSERT [dbo].[Config] ([ID], [Name], [Value]) VALUES (6, N'audit_range', N'100000')
INSERT [dbo].[Config] ([ID], [Name], [Value]) VALUES (7, N'version', N'7')
INSERT [dbo].[Config] ([ID], [Name], [Value]) VALUES (8, N'new_version_message', N'New version (x.x.x) is available! Please download in install, from: <a href=''http://www.google.com''>http://www.google.com</a>')
INSERT [dbo].[Config] ([ID], [Name], [Value]) VALUES (10, N'enable_check_in', N'1')
INSERT [dbo].[Config] ([ID], [Name], [Value]) VALUES (11, N'outlet_map_icons', N'{
  "version" : 2,
  "salesman_new_outlet" : "map\\salesman-pin-new.png",
  "agency_new_outlet" : "map\\agency-pin-new.png",
  "auditor_new_outlet" : "map\\auditor-pin-new.png"
}')
INSERT [dbo].[Config] ([ID], [Name], [Value]) VALUES (15, N'hotlines', N'[{"name": "VBL Agency 1", "phone" : "0909000123" },
{"name": "VBL Agency 2", "phone" : "0909000456" },
{"name": "Hotline Anh Khôi", "phone" : "0909000789" },
{"name": "Hotline Anh Thư", "phone" : "0909123456" },
{"name": "Test Hotline Test Hotline Test Hotline", "phone" : "0909789123" }]')
INSERT [dbo].[Config] ([ID], [Name], [Value]) VALUES (16, N'enable_download_image', N'1')
SET IDENTITY_INSERT [dbo].[Config] OFF
