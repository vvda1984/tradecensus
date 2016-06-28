function initalizeDB(onSuccess) {
    //db = window.sqlitePlugin.openDatabase({ name: "td-v01.db", location: 'default' });
    db = window.openDatabase("Database", "2.0", "td-v01.db", 200000);
    db.transaction(function (tx) {
        //tx.executeSql('DROP TABLE IF EXISTS person');
        //tx.executeSql('DROP TABLE IF EXISTS config');
        //tx.executeSql('DROP TABLE IF EXISTS province');
        //tx.executeSql('DROP TABLE IF EXISTS outletType');
        //tx.executeSql('DROP TABLE IF EXISTS outletSync');

        log("ensure table [person] exist");
        tx.executeSql('CREATE TABLE IF NOT EXISTS [person] ( [ID] integer PRIMARY KEY NOT NULL, [FirstName] text, [LastName] text, [IsTerminate] text NOT NULL,	[HasAuditRole] text NOT NULL COLLATE NOCASE, [PosID] text NOT NULL COLLATE NOCASE, [ZoneID] text NOT NULL COLLATE NOCASE, [AreaID] text NOT NULL COLLATE NOCASE, [ProvinceID] text NOT NULL COLLATE NOCASE, [Email] text, [EmailTo] text, [HouseNo] text, [Street] text, [District] text, [HomeAddress] text, [WorkAddress] text, [Phone] text, [OfflinePassword] text NOT NULL)');

        log("ensure table [config] exist");
        tx.executeSql('CREATE TABLE IF NOT EXISTS [config] ( [Name] text PRIMARY KEY NOT NULL COLLATE NOCASE, [Value] text)');

        log("ensure table [province] exist");
        tx.executeSql('CREATE TABLE IF NOT EXISTS [province] ( [ID] text PRIMARY KEY NOT NULL, [Name] text COLLATE NOCASE)');
       
        log("ensure table [outletType] exist");
        tx.executeSql('CREATE TABLE IF NOT EXISTS [outletType] ( [ID] text PRIMARY KEY NOT NULL, [Name] text COLLATE NOCASE, [OGroupID] text COLLATE NOCASE, [KPIType] integer NOT NULL)');

        log("ensure table [outletSync] exist");
        tx.executeSql('CREATE TABLE IF NOT EXISTS [outletSync] ( [ID] text PRIMARY KEY NOT NULL, [PersonID] integer NOT NULL, [LastSyncTS] datetime NOT NULL)');

        log("initialized db successfully");
        initializeProvinces(tx, onSuccess);
    });    
}

function insertPerson(person, password, onSuccess, onError) {
    db.transaction(function (tx) {
        var sql = "INSERT OR REPLACE INTO [person] VALUES (";
        sql = sql.concat(person.ID.toString(), ", ");
        sql = sql.concat("'", person.FirstName, "', ");
        sql = sql.concat("'", person.LastName, "', ");
        sql = sql.concat("'", person.IsTerminate ? "1" : "0", "', ");
        sql = sql.concat("'", person.HasAuditRole ? "1" : "0", "', ");
        sql = sql.concat("'", person.PosID.toString(), "', ");
        sql = sql.concat("'", person.ZoneID, "', ");
        sql = sql.concat("'", person.AreaID, "', ");
        sql = sql.concat("'", person.ProvinceID, "', ");
        sql = sql.concat("'", toStr(person.Email), "', ");
        sql = sql.concat("'", toStr(person.EmailTo), "', ");
        sql = sql.concat("'", toStr(person.HouseNo), "', ");
        sql = sql.concat("'", toStr(person.Street), "', ");
        sql = sql.concat("'", toStr(person.District), "', ");
        sql = sql.concat("'", toStr(person.HomeAddress), "', ");
        sql = sql.concat("'", toStr(person.WorkAddress), "', ");
        sql = sql.concat("'", toStr(person.Phone), "', ");
        sql = sql.concat("'", hashString(password), "')");
        logSqlCommand(sql);
        tx.executeSql(sql, [], onSuccess, onError);
    });
}

function selectConfigs(onSuccess, onError) {
    db.transaction(function (tx) {
        var sql = "SELECT * FROM config";
        logSqlCommand(sql);
        tx.executeSql(sql, [], onSuccess, onError);
    });   
}

function selectUserByID(userID, password, onSuccess, onError) {
    db.transaction(function (tx) {
        var sql = "SELECT * FROM person WHERE ";
        sql = sql.concat("id=", userID.toString(), " AND OfflinePassword='" + hashString(password), "'");
        logSqlCommand(sql);
        tx.executeSql(sql, [], onSuccess, onError);
    });
}

function insertProvinces(items, onSuccess, onError) {
    db.transaction(function (tx) {
        for (var i in items) {
            p = items[i];
            var sql = "INSERT OR REPLACE INTO [province] VALUES (";           
            sql = sql.concat("'", p.ID, "', ");            
            sql = sql.concat("'", p.Name, "')");
            logSqlCommand(sql);
            tx.executeSql(sql, [], function(tx){}, onError);
        };
        onSuccess();        
    });
}

function insertOutletTypes(items, onSuccess, onError) {
    db.transaction(function (tx) {
        for (var i in items) {
            p = items[i];
            var sql = "INSERT OR REPLACE INTO [outletType] VALUES (";
            sql = sql.concat("'", p.ID, "', ");
            sql = sql.concat("'", p.Name, "', ");
            sql = sql.concat("'", p.OGroupID, "', ");
            sql = sql.concat(p.ID.toString(), ")");            
            logSqlCommand(sql);
            tx.executeSql(sql, [], function (tx) { }, onError);
        };
        onSuccess();
    });
}

function insertConfig(config, onSuccess, onError) {
    db.transaction(function (tx) {
        insertConfigRow(tx, "protocol", config.protocol);
        insertConfigRow(tx, "ip", config.ip, onError);
        insertConfigRow(tx, "port", config.port);
        insertConfigRow(tx, "service_name", config.service_name);
        insertConfigRow(tx, "item_count", config.item_count);
        insertConfigRow(tx, "distance", config.distance);
        insertConfigRow(tx, "province_id", config.province_id);
        insertConfigRow(tx, "calc_distance_algorithm", config.calc_distance_algorithm);
        insertConfigRow(tx, "tbl_area_ver", config.tbl_area_ver);
        insertConfigRow(tx, "tbl_outlettype_ver", config.tbl_outlettype_ver);
        insertConfigRow(tx, "tbl_province_ver", config.tbl_province_ver);
        insertConfigRow(tx, "tbl_zone_ver", config.tbl_zone_ver);
        onSuccess();
    });
}

function insertConfigRow(tx, name, value) {
    var sql = "INSERT OR REPLACE INTO [config] VALUES (";
    sql = sql.concat("'", name, "', ");
    sql = sql.concat("'", value, "')");
    logSqlCommand(sql);
    tx.executeSql(sql);
}

function initializeProvinces(tx1, onSuccess) {
    tx1.executeSql("SELECT * FROM province", [], function (tx, dbres) {
        if (dbres.rows.length == 0) {
            initializeProvinceRow(tx, "11", "Cao Bằng");
            initializeProvinceRow(tx, "12", "Lạng Sơn");
            initializeProvinceRow(tx, "14", "Quảng Ninh");
            initializeProvinceRow(tx, "15", "Hải Phòng");
            initializeProvinceRow(tx, "17", "Thái Bình");
            initializeProvinceRow(tx, "18", "Nam Định");
            initializeProvinceRow(tx, "19", "Phú Thọ");
            initializeProvinceRow(tx, "20", "Thái Nguyên");
            initializeProvinceRow(tx, "21", "Yên Bái");
            initializeProvinceRow(tx, "22", "Tuyên Quang");
            initializeProvinceRow(tx, "23", "Hà Giang");
            initializeProvinceRow(tx, "24", "Lào Cai");
            initializeProvinceRow(tx, "25", "Lai Châu");
            initializeProvinceRow(tx, "26", "Sơn La");
            initializeProvinceRow(tx, "28", "Hòa Bình");
            initializeProvinceRow(tx, "29", "Hà Tây");
            initializeProvinceRow(tx, "32", "Hà Nội");
            initializeProvinceRow(tx, "34", "Hải Dương");
            initializeProvinceRow(tx, "35", "Ninh Bình");
            initializeProvinceRow(tx, "36", "Thanh Hóa");
            initializeProvinceRow(tx, "37", "Nghệ An");
            initializeProvinceRow(tx, "38", "Hà Tĩnh");
            initializeProvinceRow(tx, "43", "Đà Nẵng");
            initializeProvinceRow(tx, "47", "Đắc Lắc");
            initializeProvinceRow(tx, "48", "Đắc Nông");
            initializeProvinceRow(tx, "49", "Lâm Đồng");
            initializeProvinceRow(tx, "50", "Hồ Chí Minh");
            initializeProvinceRow(tx, "60", "Đồng Nai");
            initializeProvinceRow(tx, "61", "Bình Dương");
            initializeProvinceRow(tx, "62", "Long An");
            initializeProvinceRow(tx, "63", "Tiền Giang");
            initializeProvinceRow(tx, "64", "Vĩnh Long");
            initializeProvinceRow(tx, "65", "Cần Thơ");
            initializeProvinceRow(tx, "66", "Đồng Tháp");
            initializeProvinceRow(tx, "67", "An Giang");
            initializeProvinceRow(tx, "68", "Kiên Giang");
            initializeProvinceRow(tx, "69", "Cà Mau");
            initializeProvinceRow(tx, "70", "Tây Ninh");
            initializeProvinceRow(tx, "71", "Bến Tre");
            initializeProvinceRow(tx, "72", "Bà Rịa-VũngTàu");
            initializeProvinceRow(tx, "73", "Quảng Bình");
            initializeProvinceRow(tx, "74", "Quảng Trị");
            initializeProvinceRow(tx, "75", "Thừa Thiên-Huế");
            initializeProvinceRow(tx, "76", "Quảng Ngãi");
            initializeProvinceRow(tx, "77", "Bình Định");
            initializeProvinceRow(tx, "78", "Phú Yên");
            initializeProvinceRow(tx, "79", "Khánh Hòa");
            initializeProvinceRow(tx, "81", "Gia Lai");
            initializeProvinceRow(tx, "82", "Kon Tum");
            initializeProvinceRow(tx, "83", "Sóc Trăng");
            initializeProvinceRow(tx, "84", "Trà Vinh");
            initializeProvinceRow(tx, "85", "Ninh Thuận");
            initializeProvinceRow(tx, "86", "Bình Thuận")
            initializeProvinceRow(tx, "88", "Vĩnh Phúc");
            initializeProvinceRow(tx, "89", "Hưng Yên");
            initializeProvinceRow(tx, "90", "Hà Nam");
            initializeProvinceRow(tx, "92", "Quảng Nam");
            initializeProvinceRow(tx, "93", "Bình Phước");
            initializeProvinceRow(tx, "94", "Bạc Liêu");
            initializeProvinceRow(tx, "95", "Hậu Giang");
            initializeProvinceRow(tx, "97", "Bắc Kạn");
            initializeProvinceRow(tx, "98", "Bắc Giang");
            initializeProvinceRow(tx, "99", "Bắc Ninh");

            onSuccess();
        }
        else
            onSuccess();
    }, function (dberr) {});
}

function initializeProvinceRow(tx, name, value) {
    var sql = "INSERT INTO [province] VALUES (";
    sql = sql.concat("'", name, "', ");
    sql = sql.concat("'", value, "')");
    logSqlCommand(sql);
    tx.executeSql(sql);
}

function selectProvinces(onSuccess, onError) {
    db.transaction(function (tx) {
        var sql = "SELECT * FROM province";
        logSqlCommand(sql);
        tx.executeSql(sql, [], onSuccess, onError);
    });   
}

function logSqlCommand(sql) {
    //log("Execute sql: " + sql);
}