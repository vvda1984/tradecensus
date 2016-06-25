CREATE TABLE IF NOT EXISTS [person] (
    [ID] integer PRIMARY KEY AUTOINCREMENT NOT NULL,    
	[FirstName] text,
    [ProvinceID] text,
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

CREATE TABLE IF NOT EXISTS [outletSync] (
    [ID] text PRIMARY KEY NOT NULL, 
	[UserID] integer NOT NULL,	
	[LastSyncTS] datetime NOT NULL,
)

CREATE TABLE IF NOT EXISTS [outlet{userid}] (
    [ID] text PRIMARY KEY NOT NULL,    
	[RowID] text;
	[Name] text COLLATE NOCASE,    
)

