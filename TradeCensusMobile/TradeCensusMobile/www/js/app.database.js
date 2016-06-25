function initalizeDatabase() {
    //db = window.sqlitePlugin.openDatabase({ name: "td-v01.db", location: 'default' });
    db = window.openDatabase("Database", "2.0", "td-v01.db", 200000);
    db.transaction(ensureTableExists);
}

function ensureTableExists(tx) {
    tx.executeSql('DROP TABLE IF EXISTS person');
    tx.executeSql('DROP TABLE IF EXISTS config');
    tx.executeSql('DROP TABLE IF EXISTS province');
    tx.executeSql('DROP TABLE IF EXISTS outletType');
    tx.executeSql('DROP TABLE IF EXISTS outletSync');

    log("ensure table [person] exist");
    tx.executeSql('CREATE TABLE IF NOT EXISTS [person] ( [ID] integer PRIMARY KEY NOT NULL, [FirstName] text, [LastName] text, [IsTerminate] bit NOT NULL,	[HasAuditRole] text NOT NULL COLLATE NOCASE, [PosID] text NOT NULL COLLATE NOCASE, [ZoneID] text NOT NULL COLLATE NOCASE, [AreaID] text NOT NULL COLLATE NOCASE, [ProvinceID] text NOT NULL COLLATE NOCASE, [Email] text, [EmailTo] text, [HouseNo] text, [Street] text, [District] text, [HomeAddress] text, [WorkAddress] text, [Phone] text, [OfflinePassword] text NOT NULL)');

    log("ensure table [config] exist");
    tx.executeSql('CREATE TABLE IF NOT EXISTS [config] ( [ID] integer PRIMARY KEY AUTOINCREMENT NOT NULL, [Name] text NOT NULL COLLATE NOCASE, [Value] text)');

    log("ensure table [province] exist");
    tx.executeSql('CREATE TABLE IF NOT EXISTS [province] ( [ID] text PRIMARY KEY NOT NULL, [Name] text COLLATE NOCASE)');

    log("ensure table [outletType] exist");
    tx.executeSql('CREATE TABLE IF NOT EXISTS [outletType] ( [ID] text PRIMARY KEY NOT NULL, [Name] text COLLATE NOCASE, [OGroupID] text COLLATE NOCASE, [KPIType] integer NOT NULL)');

    log("ensure table [outletSync] exist");
    tx.executeSql('CREATE TABLE IF NOT EXISTS [outletSync] ( [ID] text PRIMARY KEY NOT NULL, [UserID] integer NOT NULL, [LastSyncTS] datetime NOT NULL)');    
};

function addOrUpdatePerson(person, password, onError, onSuccess) {
    var cmd = "INSERT OR REPLACE [person] (" +
                person.ID + "," +
                person.FirstName + "," +
                person.LastName + "," +
                person.IsTerminate ? "1" : "0" + "," +
                person.HasAuditRole ? "1" : "0" + "," +
                person.PosID + "," +
                person.ZoneID + "," +
                person.AreaID + "," +
                person.ProvinceID + "," +
                person.Email + "," +
                person.EmailTo + "," +
                person.HouseNo + "," +
                person.Street + "," +
                person.District + "," +
                person.HomeAddress + "," +
                person.WorkAddress + "," +
                person.Phone + "," +
                password + ")";
    tx.executeSql(cmd, onError, onSuccess);
}