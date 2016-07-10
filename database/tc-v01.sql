CREATE TABLE IF NOT EXISTS [person] (
    [ID] integer KEY AUTOINCREMENT NOT NULL,    
	[FirstName] text,
	[LastName] text,    
	[IsTerminate] bit NOT NULL,	
	[HasAuditRole] text NOT NULL COLLATE NOCASE,
	[PosID] text NOT NULL COLLATE NOCASE,
    [ZoneID] text NOT NULL COLLATE NOCASE,
	[AreaID] text NOT NULL COLLATE NOCASE,
	[ProvinceID] text NOT NULL COLLATE NOCASE,
	[Email] text,
	[EmailTo] text,
	[HouseNo] text,
	[Street] text,
	[District] text,
	[HomeAddress] text,
	[WorkAddress] text,
	[Phone] text,
	[OfflinePassword] text NOT NULL,	
	[LastUpdateTS] datetime NOT NULL,
)

CREATE TABLE IF NOT EXISTS [config] (
    [ID] integer PRIMARY KEY AUTOINCREMENT NOT NULL,      
    [Name] text NOT NULL COLLATE NOCASE,    
	[Value] text,       
)

CREATE TABLE IF NOT EXISTS [outletType] (
    [ID] text PRIMARY KEY NOT NULL,     
	[Name] text COLLATE NOCASE,
    [OGroupID] text COLLATE NOCASE,
    [KPIType] integer NOT NULL,	
)

CREATE TABLE IF NOT EXISTS [province] (
    [ID] text PRIMARY KEY NOT NULL,    
	[Name] text COLLATE NOCASE,    
)

CREATE TABLE IF NOT EXISTS [outletSync{PersonID}] (
    [ID] text PRIMARY KEY NOT NULL, 
	[PersonID] integer NOT NULL,	
	[Status] integer NOT NULL,	
	[LastSyncTS] datetime NOT NULL,
)

CREATE TABLE IF NOT EXISTS [outlet{userid}] (
    [ID] text PRIMARY KEY NOT NULL,    
	[RowID] text,
	[Name] text COLLATE NOCASE,    
)

CREATE TABLE IF NOT EXISTS [outlet] (	
    [ID] int NOT NULL,
	[AreaID] text NOT NULL,
	[TerritoryID] text NOT NULL,
	[OTypeID] text NOT NULL,
	[Name] text NOT NULL,
	[AddLine] text NULL,
	[AddLine2] text NULL,
	[District] text NULL,
	[ProvinceID] text NOT NULL,
	[Phone] text NULL,
	[CallRate] int NOT NULL,
	[CloseDate] text NULL,
	[CreateDate] text NOT NULL,
	[Tracking] int NOT NULL,
	[Class] text NULL,
	[Open1st] text NULL,
	[Close1st] text NULL,
	[Open2nd] text NULL,
	[Close2nd] text NULL,
	[SpShift] int NOT NULL,
	[LastContact]text NOT NULL,
	[LastVisit] text NULL,
	[PersonID] int NOT NULL,
	[Note] text NULL,
	[Longitude] float NULL,
	[Latitude] float NULL,
	[TaxID] text NULL,
	[ModifiedStatus] int NULL,
	[InputBy] int NULL,
	[InputDate] text NULL,
	[AmendBy] int NOT NULL,
	[AmendDate] text NOT NULL,
	[OutletEmail] text NULL,		
	[AuditStatus] int NOT NULL,	
	[StringImage1] text,
	[StringImage2] text,
	[StringImage3] text,
	[OutletSource] int,
	[PRowID] text NULL,
	[PState] int,
	[PSynced] bit,
	[PLastModTS] int,
	[PMarked] bit
)

CREATE TABLE IF NOT EXISTS [outletimage] (
   [ID] text PRIMARY KEY NOT NULL, 
   [OutletID] int NOT NULL, 
   [ImageIndex] int NOT NULL, 
   [ImagePath] text NOT NULL, 
   [Uploaded] int NOT NULL, 
   [CreatedDate] text NOT NULL, 
   [CreatedBy] int NOT NULL   
)
