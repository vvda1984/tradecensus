/****** Object:  Table [dbo].[Area]    Script Date: 7/17/2016 12:48:06 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[Area](
	[ID] [varchar](10) NOT NULL,
	[Name] [nvarchar](100) NOT NULL,
	[ZoneID] [varchar](10) NOT NULL,
 CONSTRAINT [PK_Area] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [dbo].[Config]    Script Date: 7/17/2016 12:48:06 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](100) NOT NULL,
	[Value] [nvarchar](100) NOT NULL,
 CONSTRAINT [PK_Config] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[Outlet]    Script Date: 7/17/2016 12:48:06 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Outlet](
	[ID] [int] NOT NULL,
	[AreaID] [nvarchar](3) NOT NULL,
	[TerritoryID] [nvarchar](3) NOT NULL,
	[OTypeID] [nvarchar](40) NOT NULL,
	[Name] [nvarchar](40) NOT NULL,
	[AddLine] [nvarchar](40) NULL,
	[AddLine2] [nvarchar](40) NULL,
	[District] [nvarchar](40) NULL,
	[ProvinceID] [nvarchar](3) NOT NULL,
	[Phone] [nchar](10) NULL,
	[CallRate] [int] NOT NULL,
	[CreateDate] [datetime] NOT NULL,
	[CloseDate] [datetime] NULL,
	[Tracking] [tinyint] NOT NULL,
	[Class] [nvarchar](3) NOT NULL,
	[Open1st] [nvarchar](3) NULL,
	[Close1st] [nvarchar](3) NULL,
	[Open2nd] [nvarchar](3) NULL,
	[Close2nd] [nvarchar](3) NULL,
	[SpShift] [tinyint] NOT NULL,
	[LastContact] [nvarchar](255) NOT NULL,
	[LastVisit] [datetime] NULL,
	[PersonID] [int] NOT NULL,
	[Note] [nvarchar](512) NULL,
	[Longitude] [float] NOT NULL,
	[Latitude] [float] NOT NULL,
	[OutletEmail] [nvarchar](512) NULL,
	[InputBy] [int] NOT NULL,
	[InputDate] [datetime] NOT NULL,
	[AmendBy] [int] NOT NULL,
	[AmendDate] [datetime] NOT NULL,
	[AuditStatus] [tinyint] NOT NULL,
	[TotalVolume] [int] NOT NULL,
	[VBLVolume] [int] NOT NULL,
	[PIsDeleted] [bit] NOT NULL,
	[PRowID] [uniqueidentifier] ROWGUIDCOL  NOT NULL,
	[ModifiedStatus] [int] NOT NULL,
	[TaxID] [nvarchar](40) NULL,
	[DISAlias] [nchar](10) NULL,
	[DEDISID] [int] NOT NULL,
	[LegalName] [nvarchar](50) NULL,
 CONSTRAINT [PK_Outlet] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[OutletImage]    Script Date: 7/17/2016 12:48:06 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[OutletImage](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[OutletID] [int] NOT NULL,
	[Image1] [nvarchar](max) NULL,
	[Image2] [nvarchar](max) NULL,
	[Image3] [nvarchar](max) NULL,
	[ImageData1] [image] NULL,
	[ImageData2] [image] NULL,
	[ImageData3] [image] NULL,
 CONSTRAINT [PK_OutletImage] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
/****** Object:  Table [dbo].[OutletType]    Script Date: 7/17/2016 12:48:06 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[OutletType](
	[ID] [varchar](5) NOT NULL,
	[Name] [nvarchar](100) NOT NULL,
	[OGroupID] [varchar](5) NOT NULL,
	[KPIType] [int] NOT NULL,
 CONSTRAINT [PK_OutletType] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [dbo].[Person]    Script Date: 7/17/2016 12:48:06 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Person](
	[ID] [int] NOT NULL,
	[FirstName] [nvarchar](40) NOT NULL,
	[LastName] [nvarchar](255) NOT NULL,
	[PosID] [int] NOT NULL,
	[HomeAddress] [nvarchar](123) NULL,
	[WorkAddress] [nvarchar](40) NULL,
	[DOB] [datetime] NULL,
	[Phone] [nvarchar](20) NULL,
	[HireDate] [datetime] NULL,
	[ReportTo] [int] NULL,
	[TerminateDate] [datetime] NULL,
	[ZoneID] [nvarchar](3) NOT NULL,
	[AreaID] [nvarchar](3) NOT NULL,
	[HouseNo] [nvarchar](40) NULL,
	[Street] [nvarchar](40) NULL,
	[District] [nvarchar](40) NULL,
	[ProvinceID] [nvarchar](3) NULL,
	[Email] [nvarchar](40) NULL,
	[OnLeave] [nvarchar](1) NULL,
	[EmailTo] [nvarchar](255) NULL,
	[InputBy] [int] NOT NULL,
	[InputDate] [datetime] NOT NULL,
	[AmendBy] [int] NOT NULL,
	[AmendDate] [datetime] NOT NULL,
	[IsDefaultSA] [bit] NULL,
	[Password] [nvarchar](100) NOT NULL,
 CONSTRAINT [PK_Person] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[PersonRole]    Script Date: 7/17/2016 12:48:06 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PersonRole](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[PersonID] [int] NOT NULL,
	[IsAudit] [tinyint] NOT NULL,
 CONSTRAINT [PK_PersonRole] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[Province]    Script Date: 7/17/2016 12:48:06 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[Province](
	[ID] [varchar](10) NOT NULL,
	[Name] [nvarchar](100) NOT NULL,
 CONSTRAINT [PK_Province] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [dbo].[SyncDetail]    Script Date: 7/17/2016 12:48:06 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SyncDetail](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[SyncHistoryID] [int] NOT NULL,
	[RowID] [uniqueidentifier] NOT NULL,
	[Action] [tinyint] NOT NULL,
 CONSTRAINT [PK_SyncDetail] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[SyncHistory]    Script Date: 7/17/2016 12:48:06 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SyncHistory](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[TableName] [nvarchar](50) NOT NULL,
	[SyncDateTime] [datetime] NOT NULL,
	[SyncBy] [int] NOT NULL,
	[Note] [nvarchar](100) NULL,
	[Status] [tinyint] NOT NULL,
 CONSTRAINT [PK_SyncHistory] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[Zone]    Script Date: 7/17/2016 12:48:06 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[Zone](
	[ID] [varchar](3) NOT NULL,
	[Name] [nvarchar](100) NOT NULL,
	[RegionID] [varchar](10) NOT NULL,
	[ZoneCode] [varchar](4) NOT NULL,
 CONSTRAINT [PK_Zone] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
ALTER TABLE [dbo].[Outlet] ADD  CONSTRAINT [DF_Outlet_TerritoryID]  DEFAULT (N'1') FOR [TerritoryID]
GO
ALTER TABLE [dbo].[Outlet] ADD  CONSTRAINT [DF_Outlet_CallRate]  DEFAULT ((0)) FOR [CallRate]
GO
ALTER TABLE [dbo].[Outlet] ADD  CONSTRAINT [DF_Outlet_CreatedDate]  DEFAULT ('2016-06-01') FOR [CreateDate]
GO
ALTER TABLE [dbo].[Outlet] ADD  CONSTRAINT [DF_Outlet_Tracking]  DEFAULT ((0)) FOR [Tracking]
GO
ALTER TABLE [dbo].[Outlet] ADD  CONSTRAINT [DF_Outlet_Class]  DEFAULT (N'E') FOR [Class]
GO
ALTER TABLE [dbo].[Outlet] ADD  CONSTRAINT [DF_Outlet_SpShift]  DEFAULT ((0)) FOR [SpShift]
GO
ALTER TABLE [dbo].[Outlet] ADD  CONSTRAINT [DF_Outlet_LastContact]  DEFAULT (N'') FOR [LastContact]
GO
ALTER TABLE [dbo].[Outlet] ADD  CONSTRAINT [DF_Outlet_OutletEmail]  DEFAULT ('') FOR [OutletEmail]
GO
ALTER TABLE [dbo].[Outlet] ADD  CONSTRAINT [DF_Outlet_AuditStatus]  DEFAULT ((0)) FOR [AuditStatus]
GO
ALTER TABLE [dbo].[Outlet] ADD  CONSTRAINT [DF_Outlet_TotalVolume]  DEFAULT ((0)) FOR [TotalVolume]
GO
ALTER TABLE [dbo].[Outlet] ADD  CONSTRAINT [DF_Outlet_VBLVolume]  DEFAULT ((0)) FOR [VBLVolume]
GO
ALTER TABLE [dbo].[Outlet] ADD  CONSTRAINT [DF_Outlet_PRowID]  DEFAULT (newid()) FOR [PRowID]
GO
ALTER TABLE [dbo].[Outlet] ADD  CONSTRAINT [DF_Outlet_ModifiedStatus]  DEFAULT ((0)) FOR [ModifiedStatus]
GO
ALTER TABLE [dbo].[Outlet] ADD  CONSTRAINT [DF_Outlet_TaxID]  DEFAULT ('') FOR [TaxID]
GO
ALTER TABLE [dbo].[Outlet] ADD  CONSTRAINT [DF_Outlet_DISAlias]  DEFAULT ('') FOR [DISAlias]
GO
ALTER TABLE [dbo].[Outlet] ADD  CONSTRAINT [DF_Outlet_DEDISID]  DEFAULT ((0)) FOR [DEDISID]
GO
ALTER TABLE [dbo].[Person] ADD  CONSTRAINT [DF_Person_Password]  DEFAULT (N'') FOR [Password]
GO
ALTER TABLE [dbo].[PersonRole] ADD  CONSTRAINT [DF_PersonRole_IsAudit]  DEFAULT ((0)) FOR [IsAudit]
GO
ALTER TABLE [dbo].[SyncHistory] ADD  CONSTRAINT [DF_SyncHistory_Status]  DEFAULT ((0)) FOR [Status]
GO
ALTER TABLE [dbo].[OutletImage]  WITH CHECK ADD  CONSTRAINT [FK_OutletImage_Outlet] FOREIGN KEY([OutletID])
REFERENCES [dbo].[Outlet] ([ID])
GO
ALTER TABLE [dbo].[OutletImage] CHECK CONSTRAINT [FK_OutletImage_Outlet]
GO
ALTER TABLE [dbo].[SyncDetail]  WITH CHECK ADD  CONSTRAINT [FK_SyncDetail_SyncHistory] FOREIGN KEY([SyncHistoryID])
REFERENCES [dbo].[SyncHistory] ([ID])
GO
ALTER TABLE [dbo].[SyncDetail] CHECK CONSTRAINT [FK_SyncDetail_SyncHistory]
GO
