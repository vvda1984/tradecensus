/**
* Initialize database
*/
function initalizeDB(onSuccess) {
    //db = window.sqlitePlugin.openDatabase({ name: "td-v01.db", location: 'default' });
    db = window.openDatabase("Database", "2.0", "td-v01.db", 200000);
    db.transaction(function (tx) {
        if (resetDB) {
            tx.executeSql('DROP TABLE IF EXISTS person');
            tx.executeSql('DROP TABLE IF EXISTS config');
            tx.executeSql('DROP TABLE IF EXISTS province');
            tx.executeSql('DROP TABLE IF EXISTS outletType');        
            tx.executeSql('DROP TABLE IF EXISTS outletImage');        
        }

        log("ensure table [person] exist");
        tx.executeSql('CREATE TABLE IF NOT EXISTS [person] ( [ID] integer PRIMARY KEY NOT NULL, [UserName] text, [FirstName] text, [LastName] text, [IsTerminate] text NOT NULL,	[HasAuditRole] text NOT NULL COLLATE NOCASE, [PosID] text NOT NULL COLLATE NOCASE, [ZoneID] text NOT NULL COLLATE NOCASE, [AreaID] text NOT NULL COLLATE NOCASE, [ProvinceID] text NOT NULL COLLATE NOCASE, [Email] text, [EmailTo] text, [HouseNo] text, [Street] text, [District] text, [HomeAddress] text, [WorkAddress] text, [Phone] text, [OfflinePassword] text NOT NULL)');

        log("ensure table [config] exist");
        tx.executeSql('CREATE TABLE IF NOT EXISTS [config] ( [Name] text PRIMARY KEY NOT NULL COLLATE NOCASE, [Value] text)');

        log("ensure table [province] exist");
        tx.executeSql('CREATE TABLE IF NOT EXISTS [province] ( [ID] text PRIMARY KEY NOT NULL, [Name] text COLLATE NOCASE)');
       
        log("ensure table [outletType] exist");
        tx.executeSql('CREATE TABLE IF NOT EXISTS [outletType] ( [ID] text PRIMARY KEY NOT NULL, [Name] text COLLATE NOCASE, [OGroupID] text COLLATE NOCASE, [KPIType] int NOT NULL)');

        log("ensure table [outletImage] exist");
        tx.executeSql('CREATE TABLE IF NOT EXISTS [outletImage] ( [ID] text PRIMARY KEY NOT NULL, [OutletID] int NOT NULL, [ImageIndex] int NOT NULL, [ImagePath] text NOT NULL, [Uploaded] int NOT NULL, [CreatedDate] text NOT NULL, [CreatedBy] int NOT NULL )');

        //log("ensure table [outletSync] exist");
        //tx.executeSql('CREATE TABLE IF NOT EXISTS [outletSync] ( [ID] text PRIMARY KEY NOT NULL, [PersonID] integer NOT NULL, [LastSyncTS] text NOT NULL)');

        log("initialized db successfully");
        initializeProvinces(tx, onSuccess);
    });    
}

function logSqlCommand(sql) {
    //log("SQL: " + sql);
}

function insertUserDB(person, userName, password, onSuccess, onError) {
    db.transaction(function (tx) {
        log(person);        
        var sql = "INSERT OR REPLACE INTO [person] VALUES (";
        sql = sql.concat(person.ID.toString(), ", ");
        sql = sql.concat("'", userName, "', ");
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

function selectSettingDB(tx, onSuccess, onError) {
    var sql = "SELECT * FROM config";
    logSqlCommand(sql);
    tx.executeSql(sql, [], onSuccess, onError);
}

function selectConfigs(onSuccess, onError) {
    db.transaction(function (tx) {
        var sql = "SELECT * FROM config";
        logSqlCommand(sql);
        tx.executeSql(sql, [], onSuccess, onError);
    });   
}

function selectUserDB(userName, password, onSuccess, onError) {
    db.transaction(function (tx) {
        var sql = "SELECT * FROM person WHERE ";
        sql = sql.concat("UserName='", userName, "' AND OfflinePassword='" + hashString(password), "'");
        logSqlCommand(sql);
        tx.executeSql(sql, [], onSuccess, onError);
    });
}

function insertProvinces(items, onSuccess, onError) {
    db.transaction(function (tx) {
        provinces = [];
        var len = items.length;
        for (i = 0 ; i < len; i++) {
            var p = items[i];
            provinces[i] = p;
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
        outletTypes = [];
        var len = items.length;
        for (i = 0 ; i < len; i++) {
            var p = items[i];
            outletTypes[i] = p;
            var sql = "INSERT OR REPLACE INTO [outletType] VALUES (";
            sql = sql.concat("'", p.ID, "', ");
            sql = sql.concat("'", p.Name, "', ");
            sql = sql.concat("'", p.OGroupID, "', ");
            sql = sql.concat(p.KPIType.toString(), ")");
            logSqlCommand(sql);
            tx.executeSql(sql, [], function (tx) { }, function (dberr) {
                log(dberr.message);
            });
        };
        onSuccess();
    });
}

function insertSettingDB(config, onSuccess, onError) {
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
		insertConfigRow(tx, "map_api_key", config.map_api_key);
		insertConfigRow(tx, "sync_time", config.sync_time);
		insertConfigRow(tx, "cluster_size", config.cluster_size);
		insertConfigRow(tx, "cluster_max_zoom", config.cluster_max_zoom);		
        onSuccess();
    }, onError);
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
    log('initialize provinces');
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

            log('initialize provinces completed...');
            onSuccess();
        }
        else {
            log('provinces was ready...');
            onSuccess();
        }
            
    }, function (dberr) {
        onSuccess();
    });
}

function initializeProvinceRow(tx, name, value) {
    var sql = "INSERT INTO [province] VALUES (";
    sql = sql.concat("'", name, "', ");
    sql = sql.concat("'", value, "')");
    logSqlCommand(sql);
    tx.executeSql(sql);
}

function selectProvincesDB(tx, onSuccess, onError) {
    var sql = "SELECT * FROM province";
    logSqlCommand(sql);
    tx.executeSql(sql, [], onSuccess, onError);
}

function selectProvinces(onSuccess, onError) {
    db.transaction(function (tx) {
        var sql = "SELECT * FROM province";
        logSqlCommand(sql);
        tx.executeSql(sql, [], onSuccess, onError);
    });   
}

function selectOutletTypesDB(tx, onSuccess, onError) {
    var sql = "SELECT * FROM outletType";
    logSqlCommand(sql);
    tx.executeSql(sql, [], onSuccess, onError);
}

function selectOutletTypes(onSuccess, onError) {
    db.transaction(function (tx) {
        var sql = "SELECT * FROM outletType";
        logSqlCommand(sql);
        tx.executeSql(sql, [], onSuccess, onError);
    });
}

function ensureUserOutletDBExist(outletSyncTbl, outletTbl, onDone) {
    db.transaction(function (tx) {
        if (resetDB) {
            tx.executeSql('DROP TABLE IF EXISTS ' + outletSyncTbl);
            tx.executeSql('DROP TABLE IF EXISTS ' + outletTbl);
        }

        log('ensure table [' + outletSyncTbl + ' exist');
        var sql = ('CREATE TABLE IF NOT EXISTS [' + outletSyncTbl + '](' +
                        '[ID] text PRIMARY KEY NOT NULL, ' +
	                    '[PersonID] integer NOT NULL,	' +
	                    '[Status] integer NOT NULL,	' +
	                    '[LastSyncTS] text NOT NULL)');
        logSqlCommand(sql);
        tx.executeSql(sql, [], function (tx1) { }, function (dberr) { log(dberr.message) });

        log('ensure table [' + outletTbl + ' exist');
        sql = ('CREATE TABLE IF NOT EXISTS ' + outletTbl + '(' +
                        '[ID] int NOT NULL,' +
	                    '[AreaID] text NOT NULL,' +
	                    '[TerritoryID] text NOT NULL,' +
	                    '[OTypeID] text NOT NULL,' +
	                    '[Name] text NOT NULL,' +
	                    '[AddLine] text NULL,' +
	                    '[AddLine2] text NULL,' +
	                    '[District] text NULL,' +
	                    '[ProvinceID] text NOT NULL,' +
	                    '[Phone] text NULL,' +
	                    '[CallRate] int NOT NULL,' +
	                    '[CloseDate] text NULL,' +
	                    '[CreateDate] text NOT NULL,' +
	                    '[Tracking] int NOT NULL,' +
	                    '[Class] text NULL,' +
	                    '[Open1st] text NULL,' +
	                    '[Close1st] text NULL,' +
	                    '[Open2nd] text NULL,' +
	                    '[Close2nd] text NULL,' +
	                    '[SpShift] int NOT NULL,' +
	                    '[LastContact] text NOT NULL,' +
	                    '[LastVisit] text NULL,' +
	                    '[PersonID] int NOT NULL,' +
	                    '[Note] text NULL,' +
	                    '[Longitude] float NULL,' +
	                    '[Latitude] float NULL,' +
	                    '[TaxID] text NULL,' +
	                    '[ModifiedStatus] int NULL,' +
	                    '[InputBy] int NULL,' +
	                    '[InputDate] text NULL,' +
	                    '[AmendBy] int NOT NULL,' +
	                    '[AmendDate] text NOT NULL,' +
	                    '[OutletEmail] text NULL,' +
	                    '[AuditStatus] int NOT NULL,' +
                        '[TotalVolume] int NOT NULL,' +
                        '[VBLVolume] int NOT NULL,' +                        
	                    '[StringImage1] text,' +
	                    '[StringImage2] text,' +
	                    '[StringImage3] text,' +
	                    '[OutletSource] int,' +
                        '[PRowID] text NULL,' +
	                    '[PIsAdd] bit,' +
                        '[PIsMod] bit,' +
                        '[PIsAud] bit,' +
	                    '[PSynced] bit,' +
                        '[PStatus] int,' +
	                    '[PLastModTS] int,' +
	                    '[PMarked] bit)');
        logSqlCommand(sql);
        tx.executeSql(sql, [], function (tx1) { }, function (dberr) { log(dberr.message) });
        onDone();
    });
}

function syncWithStorageOutletDB(tx, userID, outletTbl, outlets, i, onSuccess, onError) {  
    var outlet = outlets[i];
    log('*** ('+ i.toString() + '/' + outlets.length.toString() + ') Sync: ' + outlet.Name );     
    outlet.PStatus = 0; // no draft
    outlet.PSynced = 1; // synced
    initializeOutlet(outlet);            
    outlet.positionIndex = i;                      
    outlet.IsAuditApproved = outlet.AuditStatus == 1;     
    var sql = 'SELECT * FROM ' + outletTbl + ' WHERE PRowID="' + outlet.PRowID + '"';
    tx.executeSql(sql, [], 
        function (tx1, dbres) {
            var rowlen = dbres.rows.length;
            if(rowlen > 0){
                var existOutlet = dbres.rows.item(0); // first item only
                if(outlet.AmendDate == existOutlet.AmendDate){                            
                    // outlet wasn't changed
                    log('Outlet was not changed');
                }else{
                    log('Outlet was changed');
                    if (existOutlet.PSynced) {                        
                        // synced already, just overwrite by server value...
                        log('Overwrite local because it was synced to server');
                        updateOutlet(tx, outletTbl, outlet, 0, true);
                    } else {
                        // outlet wasn't synced, check amend date
                        // this logic can be failed if timezone in server and client are different
                        if (compareDate(outlet.AmendDate, existOutlet.AmendDate, 'yyyy-MM-dd HH:mm:ss') > 0) {
                            log('Overwrite local because server date > local date');
                            updateOutlet(tx, outletTbl, outlet, 0, true);                                    
                        }                            
                    }
                }
            } else{
                log('Add outlet to db:' + outlet.Name);
                addNewOutlet(tx1, outletTbl, outlet, false, false, false, true, false);                
            }

            if((i+1) < outlets.length){
                syncWithStorageOutletDB(tx1, userID, outletTbl, outlets, i + 1, onSuccess, onError);
            } else{
                onSuccess();
            }
        },  
        function (dberr) {
            log('select outlet error: ' + dberr.message);
            onError('Cannot sync outlet ' + outlet.Name + ': ' + dberr.message);
        });
}

function insertOutletsDB(userID, outletTbl, outlets, onSuccess, onError) {
    if (outlets.length == 0) {
        onSuccess();
        return;
    }
    db.transaction(function (tx) {
        syncWithStorageOutletDB(tx, userID, outletTbl, outlets, 0, onSuccess, onError);
    }, onError);
}

function addNewOutlet(tx, outletTbl, outlet, isAdd, isMod, isAud, synced, marked) {
    log('add new outlet');
    var n = (new Date()).getTime();
    var sql = 'INSERT INTO ' + outletTbl + ' VALUES (';
    sql = sql.concat(outlet.ID.toString(), ', ');           //'[ID] int NOT NULL,' +
    sql = sql.concat('"', outlet.AreaID, '", ');            //'[AreaID] text NOT NULL,' ,
    sql = sql.concat('" ",');                               //'[TerritoryID] text NOT NULL,' ,
    sql = sql.concat('"', outlet.OTypeID, '", ');           //'[OTypeID] text NOT NULL,' ,
    sql = sql.concat('"', outlet.Name, '", ');              //'[Name] text NOT NULL,'
    sql = sql.concat('"', outlet.AddLine, '", ');           //'[AddLine] text NULL,' ,
    sql = sql.concat('"', outlet.AddLine2, '", ');          //'[AddLine2] text NULL,' ,
    sql = sql.concat('"', outlet.District, '", ');          //'[District] text NULL,' ,
    sql = sql.concat('"', outlet.ProvinceID, '", ');        //'[ProvinceID] text NOT NULL,' ,
    sql = sql.concat('"', outlet.Phone, '", ');             //'[Phone] text NULL,' ,
    sql = sql.concat('0, ');                                //'[CallRate] int NOT NULL,' ,
    sql = sql.concat('"', outlet.CloseDate, '", ');         //'[CloseDate] text NULL,' ,
    sql = sql.concat('"', outlet.CreateDate, '", ');	    //'[CreateDate] text NOT NULL,' ,
    sql = sql.concat(outlet.Tracking.toString(), ', ');     //'[Tracking] int NOT NULL,' ,
    sql = sql.concat('" ",');                               //'[Class] text NULL,' ,
    sql = sql.concat('" ",');                               //'[Open1st] text NULL,' ,
    sql = sql.concat('" ",');                               //'[Close1st] text NULL,' ,
    sql = sql.concat('" ",');                               //'[Open2nd] text NULL,' ,
    sql = sql.concat('" ",');                               //'[Close2nd] text NULL,' ,
    sql = sql.concat('0, ');                                //'[SpShift] int NOT NULL,' ,
    sql = sql.concat('"', outlet.LastContact, '", ');       //'[LastContact]text NOT NULL,' ,
    sql = sql.concat('"', outlet.LastVisit, '", ');         //'[LastVisit] text NULL,' ,
    sql = sql.concat(outlet.PersonID.toString(), ', ');     //'[PersonID] int NOT NULL,' ,
    sql = sql.concat('"', outlet.Note, '", ');              //'[Note] text NULL,' ,
    sql = sql.concat(outlet.Longitude.toString(), ', ');    //'[Longitude] float NULL,' ,
    sql = sql.concat(outlet.Latitude.toString(), ', ');     //'[Latitude] float NULL,' ,
    sql = sql.concat('" ", ');                              //'[TaxID] text NULL,' ,
    sql = sql.concat('0, ');	                            //'[ModifiedStatus] int NULL,' ,
    sql = sql.concat(outlet.InputBy.toString(), ', ');      //'[InputBy] int NULL,' ,
    sql = sql.concat('" ", ');                              //'[InputDate] text NULL,' ,
    sql = sql.concat(outlet.AmendBy.toString(), ', ');      //'[AmendBy] int NOT NULL,' ,
    sql = sql.concat('"', outlet.AmendDate, '", ');         //'[AmendDate] text NOT NULL,' ,
    sql = sql.concat('" ", ');                              //'[OutletEmail] text NULL,' ,    
    sql = sql.concat(outlet.AuditStatus.toString(), ', ');  //'[AuditStatus] int NOT NULL,' ,	
    sql = sql.concat(outlet.TotalVolume.toString(), ', ');  //'[TotalVolume] int NOT NULL,' +
    sql = sql.concat(outlet.VBLVolume.toString(), ', ');    //'[VBLVolume] int NOT NULL,' +   
    sql = sql.concat('"', outlet.StringImage1, '", ');      //'[StringImage1] text,' ,
    sql = sql.concat('"', outlet.StringImage2, '", ');      //'[StringImage2] text,' ,
    sql = sql.concat('"', outlet.StringImage3, '", ');      //'[StringImage3] text,' ,
    sql = sql.concat(outlet.OutletSource.toString(), ', '); //'[OutletSource] int' ,
    sql = sql.concat('"', outlet.PRowID, '", ');            //'[PRowID] text NULL,' ,  
    sql = sql.concat(isAdd ? '1' : '0', ', ');              //'[PIsAdd] bit,' ,
    sql = sql.concat(isMod ? '1' : '0', ', ');              //'[PIsMod] bit,' ,
    sql = sql.concat(isAud ? '1' : '0', ', ');              //'[PIsAud] bit,' ,
    sql = sql.concat(synced ? '1' : '0', ', ');             //'[PSynced] bit,' ,
    sql = sql.concat(outlet.PStatus.toString(), ', ');      //'[PStatus] int,' +
    sql = sql.concat(n.toString(), ', ');                   //'[PLastModTS] int,' ,
    sql = sql.concat(marked ? '1' : '0', ')');              //'[PMarked] bit)');
    logSqlCommand(sql);
    tx.executeSql(sql, [],
        function (tx1) {
            log('Add outlet ' + outlet.ID.toString());
        },
        function (tx1, dberr) {
            log('Add outlet error ' + outlet.ID.toString());
            log(dberr.message);
        });
}

function updateOutlet(tx, outletTbl, outlet, state, synced) {
    log('update outlet ' + outlet.ID.toString() + '(' + outlet.PLastModTS + ')');
    var n = (new Date()).getTime();
    var marked = n < outlet.PLastModTS;
    log(outlet);

    var sql = 'UPDATE ' + outletTbl + ' SET ';
    sql = sql.concat('AreaID="', outlet.AreaID, '", ');
    // TerritoryID text NOT NULL
    sql = sql.concat('OTypeID="', outlet.OTypeID, '", ');
    sql = sql.concat('Name="', outlet.Name, '", ');
    sql = sql.concat('AddLine="', outlet.AddLine, '", ');
    sql = sql.concat('AddLine2="', outlet.AddLine2, '", ');
    sql = sql.concat('District="', outlet.District, '", ');
    sql = sql.concat('ProvinceID="', outlet.ProvinceID, '", ');
    sql = sql.concat('Phone="', outlet.Phone, '", ');
    //[CallRate] int NOT NULL
    sql = sql.concat('CloseDate="', outlet.CloseDate, '", ');
    sql = sql.concat('CreateDate="', outlet.CreateDate, '", ');
    sql = sql.concat('Tracking=', outlet.Tracking.toString(), ', ');
    //[Class] text NULL
    //'[Open1st] text NULL
    //'[Close1st] text NULL
    //'[Open2nd] text NULL
    //'[Close2nd] text NULL
    //'[SpShift] int NOT NULL
    //'[LastContact]text NOT NULL
    //'[LastVisit] text NULL
    sql = sql.concat('PersonID=', outlet.PersonID.toString(), ', ');
    sql = sql.concat('Note="', outlet.Note, '", ');
    sql = sql.concat('Longitude=', outlet.Longitude.toString(), ', ');
    sql = sql.concat('Latitude=', outlet.Latitude.toString(), ', ');
    //'[TaxID] text NULL
    //'[ModifiedStatus] int NULL
    sql = sql.concat('InputBy=', outlet.InputBy.toString(), ', ');
    sql = sql.concat('InputDate="', outlet.InputDate == null ? '' : outlet.InputDate, '", ');
    sql = sql.concat('AmendBy=', outlet.AmendBy.toString(), ', ');
    sql = sql.concat('AmendDate="', outlet.AmendDate, '", ');
    //[OutletEmail] text NULL
    sql = sql.concat('AuditStatus=', outlet.AuditStatus.toString(), ', ');
    sql = sql.concat('TotalVolume=', outlet.TotalVolume.toString(), ', ');
    sql = sql.concat('VBLVolume=', outlet.VBLVolume.toString(), ', ');
    sql = sql.concat('StringImage1="', outlet.StringImage1, '", ');
    sql = sql.concat('StringImage2="', outlet.StringImage2, '", ');
    sql = sql.concat('StringImage3="', outlet.StringImage3, '", ');
    sql = sql.concat('OutletSource=', outlet.OutletSource, ', ');
    //[PRowID] text NULL
    if (state == 1) sql = sql.concat('PIsAdd=1, ');
    if (state == 2) sql = sql.concat('PIsMod=1, ');
    if (state == 4) sql = sql.concat('PIsAud=1, ');
    sql = sql.concat('PSynced=', synced ? '1' : '0', ', ');
    sql = sql.concat('PStatus=', outlet.PStatus.toString() + ', ');
    sql = sql.concat('PLastModTS=', n.toString(), ', ');
    sql = sql.concat('PMarked=', marked ? '1' : '0');
	sql = sql.concat(' WHERE ID=', outlet.ID.toString());
	/*
    if (outlet.PRowID != null && outlet.PRowID.length > 0) {
        sql = sql.concat(' WHERE PRowID="', outlet.PRowID , '"');
    } else {
        sql = sql.concat(' WHERE ID=', outlet.ID.toString());
    } */   
    
    logSqlCommand(sql);
    tx.executeSql(sql, [],
       function (tx1) {
           log('Update outlet ' + outlet.ID.toString());
       },
       function (tx1, dberr) {
           log('Update outlet error ' + outlet.ID.toString());
           log(dberr.message);
       });
}

function saveOutletDB(outletTbl, outlet, state, synced, onSuccess, onError) {
    db.transaction(function (tx) {
        try {            
            updateOutlet(tx, outletTbl, outlet, state, synced);
        } catch (err) {
            log(err);
        }
        onSuccess();
    }, onError);
}

function addOutletDB(outletTbl, outlet, synced, onSuccess, onError) {
    db.transaction(function (tx) {
        try {
            addNewOutlet(tx, outletTbl, outlet, true, false, false, synced, false);
        } catch (err) {
            log(err);
        }
        onSuccess();
    }, onError);
}

function deteleOutletDB(outletTbl, outlet, onSuccess, onError) {
    db.transaction(function (tx) {
        log('Delete outlet ' + outlet.ID);
        var sql = 'DELETE FROM ' + outletTbl + ' WHERE'
        sql = sql.concat(' ID = ', outlet.ID);        
        logSqlCommand(sql);
        tx.executeSql(sql, [], onSuccess, onError);
    }, onError);
}

function selectOutletsDB(outletTbl, latMin, latMax, lngMin, lngMax, view, onSuccess, onError) {
    db.transaction(function (tx) {
        log('Select outlets by view: ' + view.toString());
        var sql = 'SELECT * FROM ' + outletTbl + ' WHERE '; //' WHERE provinceID = "' + provinceID + '" AND  ';

        if (view == 1) {
            sql = sql.concat('PIsAdd = 1 ');
        } else if (view == 2) {
            sql = sql.concat('PIsMod = 1 ');
        } else if (view == 4) {
            sql = sql.concat('PIsAud = 1 ');
        }
        sql = sql.concat(' AND Latitude >= ', latMin.toString(), ' AND Latitude <= ', latMax.toString());
        sql = sql.concat(' AND Longitude >= ', lngMin.toString(), ' AND Longitude <= ', lngMax.toString());

        logSqlCommand(sql);
        tx.executeSql(sql, [], function (tx1, dbres) {
            onSuccess(dbres);
        }, onError);
    }, onError);
}

function selectOutletsInRangeDB(outletTbl, latMin, latMax, lngMin, lngMax, onSuccess, onError) {
    db.transaction(function (tx) {
        log('Select existing outlet');
        var sql = 'SELECT * FROM ' + outletTbl + ' WHERE'
        sql = sql.concat(' Latitude >= ', latMin.toString(), ' AND Latitude <= ', latMax.toString());
        sql = sql.concat(' AND Longitude >= ', lngMin.toString(), ' AND Longitude <= ', lngMax.toString());
        logSqlCommand(sql);
        tx.executeSql(sql, [], function (tx1, dbres) {
            onSuccess(dbres);
        }, onError);
    }, onError);
}

function setOutletSyncStatus(tx, outletTbl, outletID, synced, onSuccess, onError) {    
    var n = (new Date()).getTime();
    var sql = 'UPDATE ' + outletTbl + ' SET ';
    sql = sql.concat('PSynced=', synced ? '1' : '0', ', ');
    sql = sql.concat('PLastModTS=', n.toString(), ' ');
    sql = sql.concat(' WHERE ID=', outletID.toString());

    logSqlCommand(sql);
    tx.executeSql(sql, [], onSuccess, onError);
}

function insertImageUploadingInfo(tx, userID, outletID, index, imagePath, now) {
    var id = outletID.toString() + '_' + index.toString();
    var sql = 'INSERT OR REPLACE INTO [outletImage] VALUES (' +
        '"' + id + '", ' +
        outletID.toString() + ', ' +
        index.toString() + ', ' +
        '0, ' +
        '"' + imagePath + '", ' +
        '"' + now + '", ' +
        userID.toString() + ')';
    log(sql);
    tx.executeSql(sql, [], function () { log('store upload info of image1'); }, function (dberr) { log(dberr.message); });
    return {
        ID: id,
        OutletID: outletID,
        ImageIndex: index,
        ImagePath: imagePath,
        Uploaded: 0,
        CreatedDate: now,
        CreatedBy: userID,
    };
}

function removeUploadingInfo(id, onSuccess, onError) {
    db.transaction(function (tx) {
        try {
            var sql = 'DELETE FROM outletImage WHERE ID = "' + id + '"';
            log(sql);
            tx.executeSql(sql, [], onSuccess, onError);
        } catch (err) {
            onError(err);
        }
    }, onError);    
}

function insertOutletImages(userID, outlet, onSuccess, onError) {
    db.transaction(function (tx) {        
        try {
            var uploadItems = [];
            var now = new Date().today() + ' ' + new Date().timeNow();        
            if (outlet.modifiedImage1 && !isEmpty(outlet.StringImage1)) {                
                uploadItems.push(insertImageUploadingInfo(tx, userID, outlet.ID, 1, outlet.StringImage1, now))
            }
            if (outlet.modifiedImage2 && !isEmpty(outlet.StringImage2)) {
                uploadItems.push(insertImageUploadingInfo(tx, userID, outlet.ID, 2, outlet.StringImage2, now));
            }
            if (outlet.modifiedImage3 && !isEmpty(outlet.StringImage3)) {
                uploadItems.push(insertImageUploadingInfo(tx, userID, outlet.ID, 3, outlet.StringImage3, now));                
            }
            onSuccess(uploadItems);
        }catch(err){
            onError(err);
        }
    }, onError);
}

function selectUnsyncedOutlets(outletTbl, onSuccess, onError) {
    db.transaction(function (tx) {
        log('Select existing outlet')
        var sql = 'SELECT * FROM ' + outletTbl + ' WHERE PSynced = 0 AND PStatus = 0';
        logSqlCommand(sql);
        tx.executeSql(sql, [], function (tx1, dbres) {
            onSuccess(dbres);
        }, onError);
    }, onError);
}

function selectUnsyncedOutletImage(userID, outletID, onSuccess, onError) {
    db.transaction(function (tx) {
        log('Select existing outlet')
        var sql = 'SELECT * FROM outletImage WHERE' +
                  ' OutletID = ' + outletID.toString() +
                  ' AND CreatedBy = ' + userID.toString() +
                  ' AND Uploaded = 0';
        logSqlCommand(sql);
        tx.executeSql(sql, [], onSuccess, onError);
    }, onError);
}