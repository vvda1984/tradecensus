function initalizeDB(onSuccess, onError) {
    var dbName = 'tc-v1-03.db';
    log('Open database: ' + dbName);
    db = window.openDatabase("Database", "2.0", dbName, 200000);
    db.transaction(function (tx) {
        if (resetDB) {
            tx.executeSql('DROP TABLE IF EXISTS user1');
            tx.executeSql('DROP TABLE IF EXISTS config');
            tx.executeSql('DROP TABLE IF EXISTS province');
            tx.executeSql('DROP TABLE IF EXISTS outletType');
            tx.executeSql('DROP TABLE IF EXISTS [outletImage1]');
        }

        log("ensure table [user] exist");
        tx.executeSql('CREATE TABLE IF NOT EXISTS [user1] ( [ID] integer PRIMARY KEY NOT NULL, [UserName] text, [FirstName] text, [LastName] text, [IsTerminate] text NOT NULL,	[HasAuditRole] text NOT NULL COLLATE NOCASE, [PosID] text NOT NULL COLLATE NOCASE, [ZoneID] text NOT NULL COLLATE NOCASE, [AreaID] text NOT NULL COLLATE NOCASE, [ProvinceID] text NOT NULL COLLATE NOCASE, [Email] text, [EmailTo] text, [HouseNo] text, [Street] text, [District] text, [HomeAddress] text, [WorkAddress] text, [Phone] text, [IsDSM] text NOT NULL, [OfflinePassword] text NOT NULL)',
            [],
            function (tx1) {
            },
            function (tx1, dberr) {
                onError(dberr.message);
            });

        log("ensure table [config] exist");
        tx.executeSql('CREATE TABLE IF NOT EXISTS [config] ( [Name] text PRIMARY KEY NOT NULL COLLATE NOCASE, [Value] text)',
            [],
            function (tx1) {
            },
            function (tx1, dberr) {
                onError(dberr.message);
            });

        log("ensure table [province] exist");
        tx.executeSql('CREATE TABLE IF NOT EXISTS [province] ( [ID] text PRIMARY KEY NOT NULL, [Name] text COLLATE NOCASE)',
            [],
            function (tx1) {
            },
            function (tx1, dberr) {
                onError(dberr.message);
            });

        log("ensure table [outletType] exist");
        tx.executeSql('CREATE TABLE IF NOT EXISTS [outletType] ( [ID] text PRIMARY KEY NOT NULL, [Name] text COLLATE NOCASE, [OGroupID] text COLLATE NOCASE, [KPIType] int NOT NULL)',
            [],
            function (tx1) {
            },
            function (tx1, dberr) {
                onError(dberr.message);
            });

        log("ensure table [outletImage1] exist");
        tx.executeSql('CREATE TABLE IF NOT EXISTS [outletImage1] ( [ID] text NOT NULL, [OutletID] text NOT NULL, [ImageIndex] text NOT NULL, [ImagePath] text NOT NULL, [Uploaded] text NOT NULL, [CreatedDate] text NOT NULL, [CreatedBy] text NOT NULL )',
            [],
            function (tx1) {
            },
            function (tx1, dberr) {
                onError(dberr.message);
            });

        //log("ensure table [outletSync] exist");
        //tx.executeSql('CREATE TABLE IF NOT EXISTS [outletSync] ( [ID] text PRIMARY KEY NOT NULL, [PersonID] integer NOT NULL, [LastSyncTS] text NOT NULL)');

        log("initialized db successfully");
        initializeProvinces(tx, onSuccess);
    });
}

function logSqlCommand(sql) {
    log("SQL: " + sql);
}

function resetLocalDB(tx, outlettable, outletdownloadtable){
    //log('Reset local data');
    //tx.executeSql('DROP TABLE IF EXISTS [config]');    
    //tx.executeSql('DROP TABLE IF EXISTS [outletImage1]');
    //tx.executeSql('DROP TABLE IF EXISTS ' + outlettable);
    //tx.executeSql('DROP TABLE IF EXISTS ' + outletdownloadtable);          

    //tx.executeSql('CREATE TABLE IF NOT EXISTS [config] ( [Name] text PRIMARY KEY NOT NULL COLLATE NOCASE, [Value] text)');                
    //tx.executeSql('CREATE TABLE IF NOT EXISTS [outletImage1] ( [ID] text PRIMARY KEY NOT NULL, [OutletID] int NOT NULL, [ImageIndex] int NOT NULL, [ImagePath] text NOT NULL, [Uploaded] int NOT NULL, [CreatedDate] text NOT NULL, [CreatedBy] int NOT NULL )');
    //tx.executeSql('CREATE TABLE IF NOT EXISTS [' + outletdownloadtable + '] ( [id] text PRIMARY KEY NOT NULL, [name] text COLLATE NOCASE NOT NULL, download int NOT NULL))');            
    //sql = ('CREATE TABLE IF NOT EXISTS ' + outlettable + '(' +
    //                '[ID] int NOT NULL,' +
    //                '[AreaID] text NOT NULL,' +
    //                '[TerritoryID] text NOT NULL,' +
    //                '[OTypeID] text NOT NULL,' +
    //                '[Name] text NOT NULL,' +
    //                '[AddLine] text NULL,' +
    //                '[AddLine2] text NULL,' +
    //                '[District] text NULL,' +
    //                '[ProvinceID] text NOT NULL,' +
    //                '[Phone] text NULL,' +
    //                '[CallRate] int NOT NULL,' +
    //                '[CloseDate] text NULL,' +
    //                '[CreateDate] text NOT NULL,' +
    //                '[Tracking] int NOT NULL,' +
    //                '[Class] text NULL,' +
    //                '[Open1st] text NULL,' +
    //                '[Close1st] text NULL,' +
    //                '[Open2nd] text NULL,' +
    //                '[Close2nd] text NULL,' +
    //                '[SpShift] int NOT NULL,' +
    //                '[LastContact] text NOT NULL,' +
    //                '[LastVisit] text NULL,' +
    //                '[PersonID] int NOT NULL,' +
    //                '[PersonFirstName] text NULL,' +
    //                '[PersonLastName] text NULL,' +
    //                '[Note] text NULL,' +
    //                '[Longitude] float NULL,' +
    //                '[Latitude] float NULL,' +
    //                '[TaxID] text NULL,' +
    //                '[ModifiedStatus] int NULL,' +
    //                '[InputBy] int NULL,' +
    //                '[InputDate] text NULL,' +
    //                '[AmendBy] int NOT NULL,' +
    //                '[AmendDate] text NOT NULL,' +
    //                '[OutletEmail] text NULL,' +
    //                '[AuditStatus] int NOT NULL,' +
    //                '[TotalVolume] int NOT NULL,' +
    //                '[VBLVolume] int NOT NULL,' +                        
    //                '[StringImage1] text,' +
    //                '[StringImage2] text,' +
    //                '[StringImage3] text,' +
    //                '[OutletSource] int,' +
    //                '[PRowID] text NULL,' +
    //                '[PIsAdd] bit,' +
    //                '[PIsMod] bit,' +
    //                '[PIsAud] bit,' +
    //                '[PSynced] bit,' +
    //                '[PStatus] int,' +
    //                '[PLastModTS] int,' +
    //                '[PMarked] bit)');       
    //tx.executeSql(sql);  
    
    return;
}

function insertUserDB(person, userName, password, onSuccess, onError) {
    db.transaction(function (tx) {
        log(person);
        var sql = 'DELETE FROM [user1]';
        logSqlCommand(sql);
        tx.executeSql(sql, [], function (tx1) {
            var sql = "INSERT INTO [user1] VALUES (";
            sql = sql.concat(person.ID.toString(), ", ");
            sql = sql.concat("'", userName, "', ");
            sql = sql.concat("'", quoteText(person.FirstName), "', ");
            sql = sql.concat("'", quoteText(person.LastName), "', ");
            sql = sql.concat("'", person.IsTerminate ? "1" : "0", "', ");
            sql = sql.concat("'", person.HasAuditRole ? "1" : "0", "', ");
            sql = sql.concat("'", person.PosID.toString(), "', ");
            sql = sql.concat("'", person.ZoneID, "', ");
            sql = sql.concat("'", person.AreaID, "', ");
            sql = sql.concat("'", person.ProvinceID, "', ");
            sql = sql.concat("'", toStr(quoteText(person.Email)), "', ");
            sql = sql.concat("'", toStr(quoteText(person.EmailTo)), "', ");
            sql = sql.concat("'", toStr(quoteText(person.HouseNo)), "', ");
            sql = sql.concat("'", toStr(quoteText(person.Street)), "', ");
            sql = sql.concat("'", toStr(quoteText(person.District)), "', ");
            sql = sql.concat("'", toStr(quoteText(person.HomeAddress)), "', ");
            sql = sql.concat("'", toStr(quoteText(person.WorkAddress)), "', ");
            sql = sql.concat("'", toStr(quoteText(person.Phone)), "', ");
            sql = sql.concat("'", toStr(person.IsDSM), "', ");
            sql = sql.concat("'", hashString(quoteText(password)), "')");
            logSqlCommand(sql);
            tx1.executeSql(sql, [], onSuccess, onError);
        }, function (tx1, dberr) {
            onError(dberr);
        });
    });
}

function changePasswordDB(userID, password, onSuccess, onError) {
    db.transaction(function (tx) {
        var sql = 'UPDATE [user1] set OfflinePassword = ';
        sql = sql.concat('"', hashString(password), '"');
        sql = sql.concat(' WHERE ID = ', userID);

        logSqlCommand(sql);
        tx.executeSql(sql, [], function (tx1) {
            onSuccess();
        }, function (tx1, dberr) {
            onError(dberr);
        });
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
        var sql = "SELECT * FROM [user1] WHERE ";
        sql = sql.concat("UserName='", userName, "' AND OfflinePassword='" + hashString(quoteText(password)), "'");
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
            sql = sql.concat("'", quoteText(p.Name), "')");
            logSqlCommand(sql);
            tx.executeSql(sql, [], function(tx){}, onError);
        };
        onSuccess();        
    });
}

function insertOutletTypes(items, onSuccess, onError) {
    db.transaction(function (tx) {
        outletTypes = [];
        outletTypes[0] = { ID: '-1', Name: ' ' };
        var len = items.length;
        for (i = 0 ; i < len; i++) {
            var p = items[i];
            outletTypes[i + 1] = p;
            var sql = "INSERT OR REPLACE INTO [outletType] VALUES (";
            sql = sql.concat("'", p.ID, "', ");
            sql = sql.concat("'", quoteText(p.Name), "', ");
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
        insertSetting(tx, "protocol", config.protocol);
        insertSetting(tx, "ip", config.ip, onError);
        insertSetting(tx, "port", config.port);
        insertSetting(tx, "service_name", config.service_name);
        insertSetting(tx, "item_count", config.item_count.toString());
        insertSetting(tx, "distance", config.distance);
        insertSetting(tx, "province_id", config.province_id);
        insertSetting(tx, "calc_distance_algorithm", config.calc_distance_algorithm);
        insertSetting(tx, "tbl_area_ver", config.tbl_area_ver);
        insertSetting(tx, "tbl_outlettype_ver", config.tbl_outlettype_ver);
        insertSetting(tx, "tbl_province_ver", config.tbl_province_ver);
        insertSetting(tx, "tbl_zone_ver", config.tbl_zone_ver);
		insertSetting(tx, "map_api_key", config.map_api_key);
		insertSetting(tx, "sync_time", config.sync_time);
		insertSetting(tx, "cluster_size", config.cluster_size);
		insertSetting(tx, "cluster_max_zoom", config.cluster_max_zoom);
		insertSetting(tx, "max_oulet_download", config.max_oulet_download.toString());
        onSuccess();
    }, onError);
}

function insertSetting(tx, name, value) {
    var sql = "INSERT OR REPLACE INTO [config] VALUES (";
    sql = sql.concat("'", name, "', ");
    sql = sql.concat("'", value, "')");
    logSqlCommand(sql);
    tx.executeSql(sql, [], function () { }, function (err) { log(err);});
}

function initializeProvinces(tx1, onSuccess, onError) {
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
    tx.executeSql(sql, [], function (tx1) { }, function (tx1, dberr) {
        log(dberr.message);
    });
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

function ensureUserOutletDBExist(isReset, outletSyncTbl, outletTbl, provinceDownloadTbl, callback) {
    db.transaction(function (tx) {
        if (isReset) {
            //resetLocalDB(tx, outletTbl, provinceDownloadTbl);

            tx.executeSql('DROP TABLE IF EXISTS ' + outletSyncTbl);
            tx.executeSql('DROP TABLE IF EXISTS ' + outletTbl);
            tx.executeSql('DROP TABLE IF EXISTS ' + provinceDownloadTbl);

            tx.executeSql('Delete from ' + outletTbl, [], function (tx1) { }, function (tx1, dberr) { });
            tx.executeSql('Delete from ' + provinceDownloadTbl, [], function (tx1) { }, function (tx1, dberr) { });
            tx.executeSql('Delete from ' + outletSyncTbl, [], function (tx1) { }, function (tx1, dberr) { });
        }

        log('ensure table [' + outletSyncTbl + '] exist');
        var sql = ('CREATE TABLE IF NOT EXISTS [' + outletSyncTbl + '](' +
                        '[ID] text PRIMARY KEY NOT NULL, ' +
	                    '[PersonID] integer NOT NULL,	' +
	                    '[Status] integer NOT NULL,	' +
	                    '[LastSyncTS] text NOT NULL)');
        logSqlCommand(sql);
        tx.executeSql(sql, [], function (tx1) { }, function (dberr) { log(dberr.message) });

        log('ensure table [' + provinceDownloadTbl + '] exist');
        sql = 'CREATE TABLE IF NOT EXISTS [' + provinceDownloadTbl + '] ( [id] text PRIMARY KEY NOT NULL, [name] text COLLATE NOCASE NOT NULL, download int NOT NULL)';
        logSqlCommand(sql);
        tx.executeSql(sql, [], function (tx1) { }, function (dberr) { log(dberr.message) });

        log('ensure table [' + outletTbl + '] exist');
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
                        '[PersonFirstName] text NULL,' +
                        '[PersonLastName] text NULL,' +
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
        tx.executeSql(sql);        
        callback();
    });
}

function syncWithStorageOutletDB(tx, userID, outletTbl, outlets, i, onSuccess, onError) {
    if (i == outlets.length) {
        onSuccess();
        return;
    }

    var outlet = outlets[i];
    log('*** (' + (i + 1).toString() + '/' + outlets.length.toString() + ') Sync: ' + outlet.Name);

    outlet.PSynced = 1; // synced
    outlet.positionIndex = i;
    if (outlet.PStatus == null || outlet.PStatus == undefined)
        outlet.PStatus = 0;
    //outlet.PStatus = outlet.PStatus == null ? 0 : outlet.PStatus;
    initializeOutlet(outlet);

    var sql = 'SELECT * FROM ' + outletTbl + ' WHERE PRowID="' + outlet.PRowID.toString() + '"';
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
                if (outlet.PersonIsDSM != null && (outlet.PersonIsDSM == true ||outlet.PersonIsDSM == 1)){
                    outlet.OutletSource = 1;
                } else{
                    outlet.OutletSource = 0;
                }
               
                addNewOutlet(tx1, outletTbl, outlet, false, false, false, true, false);                
            }

            if ((i + 1) < outlets.length) {
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

function insertDownloadedOutletsDB(outletTbl, outlets, onSuccess, onError) {
    if (outlets.length == 0) {
        onSuccess();
        return;
    }
    db.transaction(function (tx) {
        insertDownloadedOutletDB(tx, outletTbl, outlets, 0, onSuccess, onError);
    }, onError);
}

function insertDownloadedOutletDB(tx, outletTbl, outlets, i, onSuccess, onError) {
    if (i == outlets.length) {
        onSuccess();
        return;
    }
    var outlet = outlets[i];
    outlet.PSynced = 1; // synced
    outlet.positionIndex = i;
    if (outlet.PStatus == null || outlet.PStatus == undefined)
        outlet.PStatus = 0;
    var sql = 'DELETE FROM ' + outletTbl + ' WHERE ID = ' + outlet.ID.toString();
    logSqlCommand(sql);
    tx.executeSql(sql, [],
        function (tx1, dbres) {
            if (outlet.PersonIsDSM != null && (outlet.PersonIsDSM == true || outlet.PersonIsDSM == 1)) {
                outlet.OutletSource = 1;
            } else {
                outlet.OutletSource = 0;
            }
            addNewOutlet(tx1, outletTbl, outlet, false, false, false, true, false);

            if ((i + 1) < outlets.length) {
                insertDownloadedOutletDB(tx1, outletTbl, outlets, i + 1, onSuccess, onError);
            } else {
                onSuccess();
            }
        },
        function (dberr) {
            log('select outlet error: ' + dberr.message);
            onError('Cannot sync outlet ' + outlet.Name + ': ' + dberr.message);
        });
}

function deleleOutletsDB(outletTbl, provinceId, onSuccess, onError) {
    db.transaction(function (tx) {
        var sql = 'DELETE FROM ' + outletTbl + ' WHERE ProvinceID = "' + provinceId + '"';
        logSqlCommand(sql);
        tx.executeSql(sql, [], function (tx1) { onSuccess();}, onError);
    }, onError);
}

function addDownloadOutletsDB(outletTbl, outlets, onSuccess, onError) {
    if (outlets.length == 0) {
        onSuccess();
        return;
    }
    db.transaction(function (tx) {
        //addDownloadOutletForeachDB(tx, outletTbl, outlets, 0, onSuccess, onError);

        var err;
        for (var i = 0; i < outlets.length; i++) {
            var sql = buildOutletInsertSql(outletTbl, outlets[i]);
            log(sql);

            if (outlets[i].Name == 'Aaaa') {
                log('');
            }
            tx.executeSql(sql, [], function (tx1) { }, function (tx1, dberr) {
                err = dberr;
            });
        }
        if (err == null) {
            tx.executeSql('select * from ' + outletTbl + ' where Name = "Aaaa"', [],
                function (tx1, dbres) {
                    if(dbres.rows.length > 0)
                        log(dbres);
                    onSuccess();
                }, function (e) {
                });
            //onSuccess();
        }
        else {
            onError(err);
        }
    }, onError);

}

function addDownloadOutletForeachDB(tx, outletTbl, outlets, i, onSuccess, onError) {
    if (i == outlets.length) {
        onSuccess();
        return;
    }
    var outlet = outlets[i];
    var sql = buildOutletInsertSql(outletTbl, outlet);
    log(sql);
    if (outlets[i].Name == 'Aaaa') {
        log('');
    }

    tx.executeSql(sql, [], function (tx1) {
        if ((i + 1) < outlets.length) {
            addDownloadOutletForeachDB(tx1, outletTbl, outlets, i + 1, onSuccess, onError);
        } else {
            onSuccess();
        }
    }, function (tx1, dberr) {
        err = dberr;
        onError(dberr);
    });
}

function quoteText(str) {
    if (isEmpty(str)) return str;
    return str.replace(/'/g, " ");
    //return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
    //    switch (char) {
    //        case "\0":
    //            return "\\0";
    //        case "\x08":
    //            return "\\b";
    //        case "\x09":
    //            return "\\t";
    //        case "\x1a":
    //            return "\\z";
    //        case "\n":
    //            return "\\n";
    //        case "\r":
    //            return "\\r";
    //        case "\"":
    //        case "'":
    //        case "\\":
    //        case "%":
    //            return "\\" + char; // prepends a backslash to backslash, percent,
    //            // and double/single quotes
    //    }
    //});
}

function buildOutletInsertSql(outletTbl, outlet) {
    var n = (new Date()).getTime();
    if (outlet.PersonIsDSM != null && (outlet.PersonIsDSM == true || outlet.PersonIsDSM == 1)) {
        outlet.OutletSource = 1;
    } else {
        outlet.OutletSource = 0;
    }

    var sql = 'INSERT INTO ' + outletTbl + ' VALUES (';
    sql = sql.concat(outlet.ID.toString(), ', ');           //'[ID] int NOT NULL,' +
    sql = sql.concat("'", outlet.AreaID, "', ");            //'[AreaID] text NOT NULL,' ,
    sql = sql.concat('" ",');                               //'[TerritoryID] text NOT NULL,' ,
    sql = sql.concat("'", outlet.OTypeID, "', ");           //'[OTypeID] text NOT NULL,' ,
    sql = sql.concat("'", quoteText(outlet.Name), "', ");              //'[Name] text NOT NULL,'
    sql = sql.concat("'", quoteText(outlet.AddLine), "', ");           //'[AddLine] text NULL,' ,
    sql = sql.concat("'", quoteText(outlet.AddLine2), "', ");          //'[AddLine2] text NULL,' ,
    sql = sql.concat("'", quoteText(outlet.District), "', ");          //'[District] text NULL,' ,
    sql = sql.concat("'", outlet.ProvinceID, "', ");        //'[ProvinceID] text NOT NULL,' ,
    sql = sql.concat("'", quoteText(outlet.Phone), "', ");             //'[Phone] text NULL,' ,
    sql = sql.concat('0, ');                                //'[CallRate] int NOT NULL,' ,
    sql = sql.concat("'", outlet.CloseDate, "', ");         //'[CloseDate] text NULL,' ,
    sql = sql.concat("'", outlet.CreateDate, "', ");	    //'[CreateDate] text NOT NULL,' ,
    sql = sql.concat(outlet.Tracking.toString(), ', ');     //'[Tracking] int NOT NULL,' ,
    sql = sql.concat('" ",');                               //'[Class] text NULL,' ,
    sql = sql.concat('" ",');                               //'[Open1st] text NULL,' ,
    sql = sql.concat('" ",');                               //'[Close1st] text NULL,' ,
    sql = sql.concat('" ",');                               //'[Open2nd] text NULL,' ,
    sql = sql.concat('" ",');                               //'[Close2nd] text NULL,' ,
    sql = sql.concat('0, ');                                //'[SpShift] int NOT NULL,' ,
    sql = sql.concat("'", quoteText(outlet.LastContact), "', ");       //'[LastContact]text NOT NULL,' ,
    sql = sql.concat("'", outlet.LastVisit, "', ");         //'[LastVisit] text NULL,' ,
    sql = sql.concat(outlet.PersonID.toString(), ', ');     //'[PersonID] int NOT NULL,' ,     
    sql = sql.concat("'", quoteText(outlet.PersonFirstName), "', ");   //'[PersonFirstName] text NULL,'
    sql = sql.concat("'", quoteText(outlet.PersonLastName), "', ");    //'[PersonLastName] text NULL,' +
    sql = sql.concat("'", quoteText(outlet.Note), "', ");              //'[Note] text NULL,' ,
    sql = sql.concat(outlet.Longitude == null ? 0 : outlet.Longitude.toString(), ', ');    //'[Longitude] float NULL,' ,
    sql = sql.concat(outlet.Latitude == null ? 0 : outlet.Latitude.toString(), ', ');     //'[Latitude] float NULL,' ,
    sql = sql.concat('" ", ');                              //'[TaxID] text NULL,' ,
    sql = sql.concat('0, ');	                            //'[ModifiedStatus] int NULL,' ,
    sql = sql.concat(outlet.InputBy == null ? 0 : outlet.InputBy.toString(), ', ');      //'[InputBy] int NULL,' ,
    sql = sql.concat('" ", ');                              //'[InputDate] text NULL,' ,
    sql = sql.concat(outlet.AmendBy == null ? 0 : outlet.AmendBy.toString(), ', ');      //'[AmendBy] int NOT NULL,' ,
    sql = sql.concat("'", outlet.AmendDate, "', ");         //'[AmendDate] text NOT NULL,' ,
    sql = sql.concat('" ", ');                              //'[OutletEmail] text NULL,' ,    
    sql = sql.concat(outlet.AuditStatus.toString(), ', ');  //'[AuditStatus] int NOT NULL,' ,	
    sql = sql.concat(outlet.TotalVolume.toString(), ', ');  //'[TotalVolume] int NOT NULL,' +
    sql = sql.concat(outlet.VBLVolume.toString(), ', ');    //'[VBLVolume] int NOT NULL,' +   
    sql = sql.concat("'", outlet.StringImage1, "', ");      //'[StringImage1] text,' ,
    sql = sql.concat("'", outlet.StringImage2, "', ");      //'[StringImage2] text,' ,
    sql = sql.concat("'", outlet.StringImage3, "', ");      //'[StringImage3] text,' ,
    sql = sql.concat(outlet.OutletSource.toString(), ', '); //'[OutletSource] int' ,
    sql = sql.concat("'", outlet.PRowID, "', ");            //'[PRowID] text NULL,' ,  
    sql = sql.concat('0,');                                 //'[PIsAdd] bit,' ,
    sql = sql.concat('0,');                                 //'[PIsMod] bit,' ,
    sql = sql.concat('0,');                                 //'[PIsAud] bit,' ,
    sql = sql.concat('1,');                                 //'[PSynced] bit,' ,
    sql = sql.concat('1,');                                  //'[PStatus] int,' +
    sql = sql.concat(n.toString(), ', ');                   //'[PLastModTS] int,' ,
    sql = sql.concat('0)');                                 //'[PMarked] bit)');
    return sql;
}

function addNewOutlet(tx, outletTbl, outlet, isAdd, isMod, isAud, synced, marked) {
    log('add new outlet');
    var n = (new Date()).getTime();
    var sql = 'INSERT INTO ' + outletTbl + ' VALUES (';
    sql = sql.concat(outlet.ID.toString(), ', ');           //'[ID] int NOT NULL,' +
    sql = sql.concat('"', outlet.AreaID, '", ');            //'[AreaID] text NOT NULL,' ,
    sql = sql.concat('" ",');                               //'[TerritoryID] text NOT NULL,' ,
    sql = sql.concat('"', outlet.OTypeID, '", ');           //'[OTypeID] text NOT NULL,' ,
    sql = sql.concat('"', quoteText(outlet.Name), '", ');              //'[Name] text NOT NULL,'
    sql = sql.concat('"', quoteText(outlet.AddLine), '", ');           //'[AddLine] text NULL,' ,
    sql = sql.concat('"', quoteText(outlet.AddLine2), '", ');          //'[AddLine2] text NULL,' ,
    sql = sql.concat('"', quoteText(outlet.District), '", ');          //'[District] text NULL,' ,
    sql = sql.concat('"', outlet.ProvinceID, '", ');        //'[ProvinceID] text NOT NULL,' ,
    sql = sql.concat('"', quoteText(outlet.Phone), '", ');             //'[Phone] text NULL,' ,
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
    sql = sql.concat('"', quoteText(outlet.LastContact), '", ');       //'[LastContact]text NOT NULL,' ,
    sql = sql.concat('"', quoteText(outlet.LastVisit), '", ');         //'[LastVisit] text NULL,' ,
    sql = sql.concat(outlet.PersonID.toString(), ', ');     //'[PersonID] int NOT NULL,' ,     
    sql = sql.concat('"', quoteText(outlet.PersonFirstName), '", ');   //'[PersonFirstName] text NULL,'
    sql = sql.concat('"', quoteText(outlet.PersonLastName), '", ');    //'[PersonLastName] text NULL,' +
    sql = sql.concat('"', quoteText(outlet.Note), '", ');              //'[Note] text NULL,' ,
    sql = sql.concat(outlet.Longitude.toString(), ', ');    //'[Longitude] float NULL,' ,
    sql = sql.concat(outlet.Latitude.toString(), ', ');     //'[Latitude] float NULL,' ,
    sql = sql.concat('" ", ');                              //'[TaxID] text NULL,' ,
    sql = sql.concat('0, ');	                            //'[ModifiedStatus] int NULL,' ,
    sql = sql.concat(outlet.InputBy == null ? 0 : outlet.InputBy.toString(), ', ');      //'[InputBy] int NULL,' ,
    sql = sql.concat('" ", ');                              //'[InputDate] text NULL,' ,
    sql = sql.concat(outlet.AmendBy == null ? 0 : outlet.AmendBy.toString(), ', ');      //'[AmendBy] int NOT NULL,' ,
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
    sql = sql.concat('ID=', outlet.ID, ', ');
    sql = sql.concat('AreaID="', outlet.AreaID, '", ');
    // TerritoryID text NOT NULL
    sql = sql.concat('OTypeID="', outlet.OTypeID, '", ');
    sql = sql.concat('Name="', quoteText(outlet.Name), '", ');
    sql = sql.concat('AddLine="', quoteText(outlet.AddLine), '", ');
    sql = sql.concat('AddLine2="', quoteText(outlet.AddLine2), '", ');
    sql = sql.concat('District="', quoteText(outlet.District), '", ');
    sql = sql.concat('ProvinceID="', outlet.ProvinceID, '", ');
    sql = sql.concat('Phone="', quoteText(outlet.Phone), '", ');
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
    sql = sql.concat('InputBy=', outlet.InputBy == null ? 0 : outlet.InputBy.toString(), ', ');
    sql = sql.concat('InputDate="', outlet.InputDate == null ? '' : outlet.InputDate, '", ');
    sql = sql.concat('AmendBy=', outlet.AmendBy == null ? 0 : outlet.AmendBy.toString(), ', ');
    sql = sql.concat('AmendDate="', outlet.AmendDate, '", ');
    //[OutletEmail] text NULL
    sql = sql.concat('AuditStatus=', outlet.AuditStatus.toString(), ', ');
    sql = sql.concat('TotalVolume=', outlet.TotalVolume.toString(), ', ');
    sql = sql.concat('VBLVolume=', outlet.VBLVolume.toString(), ', ');

    if (!isEmpty(outlet.StringImage1)) {
        if (outlet.StringImage1.toUpperCase().indexOf('IMAGES') > -1) {
            // ignore this value is URL link
        } else {
            sql = sql.concat('StringImage1="', outlet.StringImage1, '", ');
        }
    } else
        sql = sql.concat('StringImage1="",');

    if (!isEmpty(outlet.StringImage2)) {
        if (outlet.StringImage2.toUpperCase().indexOf('IMAGES') > -1) {
            // ignore this value is URL link
        } else {
            sql = sql.concat('StringImage2="', outlet.StringImage2, '", ');
        }
    } else
        sql = sql.concat('StringImage2="",');

    if (!isEmpty(outlet.StringImage3)) {
        if (outlet.StringImage3.toUpperCase().indexOf('IMAGES') > -1) {
            // ignore this value is URL link
        } else {
            sql = sql.concat('StringImage3="', outlet.StringImage3, '", ');
        }
    } else
        sql = sql.concat('StringImage3="", ');

    sql = sql.concat('OutletSource=', outlet.OutletSource, ', ');
    //[PRowID] text NULL
    if (state == 1) sql = sql.concat('PIsAdd=1, ');
    if (state == 2) sql = sql.concat('PIsMod=1, ');
    if (state == 4) sql = sql.concat('PIsAud=1, ');
    sql = sql.concat('PSynced=', synced ? '1' : '0', ', ');
    sql = sql.concat('PStatus=', outlet.PStatus.toString() + ', ');
    sql = sql.concat('PLastModTS=', n.toString(), ', ');
    sql = sql.concat('PMarked=', marked ? '1' : '0');
    sql = sql.concat(' WHERE PRowID="', outlet.PRowID, '"');
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

function setSyncStatusDB(outletTbl, syncOutlets, synced, onSuccess, onError) {
    db.transaction(function (tx) {
        var isErr = false;
        var errMsg = '';
        try {
            var s = synced ? '1' : '0';
            for (var i = 0; i < syncOutlets.length; i++) {
                var outlet = syncOutlets[i];
                var sql = 'UPDATE ' + outletTbl + ' SET ID = ' + outlet.ID.toString() + ', ' +
                          'PSynced = ' + s +
                          ' WHERE PRowID = "' + outlet.RowID + '"';
                tx.executeSql(sql, [], function () { }, function (dberr) {
                    errMsg = dberr.message;
                    isErr = true;
                });
            }

            //for (var i = 0; i < outlets.length; i++) {
            //    var outlet = outlets[i];
            //    var sql = 'UPDATE ' + outletTbl + ' SET PSynced = ' + s + ' WHERE PRowID = "' + outlet.PRowID + '"';
            //    tx.executeSql(sql, [], function () { }, function (dberr) {
            //        errMsg = dberr.message;
            //        isErr = true;
            //    });
            //}
        } catch (err) {
            errMsg = err.message;
            isErr = true;
        }
        if (isErr)
            onError(errMsg);
        else
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

function findOutlet(outletTbl, prowId, callback) {
    db.transaction(function (tx) {
        var sql = 'SELECT * FROM [' + outletTbl + '] WHERE PRowID = "' + prowId + '"';
        logSqlCommand(sql);
        tx.executeSql(sql, [], function (tx1, dbres) {
            if (dbres.rows.length > 0)
                callback(dbres.rows.item(0));
            else
                callback(null);
        }, function (tx1, err) {
            callback(null);
        });
    }, function (tx1, err) {
        callback(null);
    });
}

function selectOutletsDB(outletTbl, latMin, latMax, lngMin, lngMax, view, onSuccess, onError) {
    db.transaction(function (tx) {
        log('Select outlets by view: ' + view.toString());
        var sql = 'SELECT * FROM [' + outletTbl + '] WHERE ' //' WHERE provinceID = "' + provinceID + '" AND  ';

        if (view == 0) {            
            sql = sql.concat('AuditStatus <> ' + StatusDelete.toString());
        } else if (view == 1) {
            if (user.hasAuditRole) {
                //sql = sql.concat('AuditStatus in ( ', StatusPost.toString(),
                //                    ', ', StatusAuditAccept.toString(),
                //                    ', ', StatusAuditDeny.toString(),
                //                    ', ', StatusAuditorNew.toString(),
                //                    ', ', StatusAuditorAccept.toString(), ')');
             
                sql = sql.concat(' AuditStatus = ', StatusPost.toString());
                sql = sql.concat(' OR AuditStatus = ', StatusAuditAccept.toString());
                sql = sql.concat(' OR AuditStatus = ', StatusAuditDeny.toString());
                sql = sql.concat(' OR AuditStatus = ', StatusAuditorAccept.toString());
                sql = sql.concat(' OR (AuditStatus = ', StatusAuditorNew.toString(), ' AND PersonID = ', userID.toString(), ')');
            } else {
                sql = sql.concat('AuditStatus in ( ',  StatusNew.toString(), ', ', StatusPost.toString(), ', ', StatusAuditAccept.toString(), ', ', StatusAuditDeny.toString(), ')');
                //sql = sql.concat(' AND PersonID = ' + userID.toString());
            }
        } else if (view == 2) {
            if (user.hasAuditRole) {
                sql = sql.concat('AuditStatus in ( ', StatusExitingPost.toString(), ', ', StatusDone.toString(), ')');
                sql = sql.concat(' AND PersonID <> ' + userID.toString());
            } else {
                sql = sql.concat('AuditStatus in ( ', StatusEdit.toString(), ', ', StatusExitingPost.toString(), ', ', StatusDone.toString(), ')');
                sql = sql.concat(' AND AmendBy = ' + userID.toString());
            }
        } else if (view == 3) {
            sql = sql.concat('AuditStatus in (', StatusExitingAccept.toString(), ', ', StatusExitingDeny.toString(), ', ', StatusAuditAccept.toString(), ', ', StatusAuditDeny.toString(), ')');
            sql = sql.concat(' AND PersonID = ' + userID.toString());
        } else {
            if (user.hasAuditRole) {
                sql = sql.concat('AuditStatus in ( ', StatusAuditorNew.toString(), ', ', StatusAuditorAccept.toString(), ')');
                sql = sql.concat(' AND PersonID = ' + userID.toString());
            } else {
                sql = sql.concat('AuditStatus in ( ',
                    StatusNew.toString(), ', ',
                    StatusPost.toString(), ', ',
                    StatusAuditAccept.toString(), ', ',
                    StatusAuditDeny.toString(), ')');
                sql = sql.concat(' AND PersonID = ' + userID.toString());
            }
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
    var sql = 'INSERT INTO [outletImage1] ([ID], [OutletID], [ImageIndex] , [ImagePath], [Uploaded], [CreatedDate], [CreatedBy] ) VALUES (' +
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
        //onSuccess(tx);
        try {
            var sql = 'DELETE FROM [outletImage1] WHERE ID = "' + id + '"';
            log(sql);
            tx.executeSql(sql, [], onSuccess, onError);
        } catch (err) {
            onError(err);
        }
    }, onError);    

    onSuccess();
    //db.transaction(function (tx) {
    //    try {
    //        var sql = 'DELETE FROM [outletImage] WHERE ID = "' + id + '"';
    //        log(sql);
    //        tx.executeSql(sql, [], onSuccess, onError);
    //    } catch (err) {
    //        onError(err);
    //    }
    //}, onError);    
}

function insertImageUploadingInfoDB(tx, userID, outletID, index, imagePath, now) {
    var id = outletID.toString() + '_' + index.toString();
    var sql = 'INSERT INTO [outletImage1] ([ID], [OutletID], [ImageIndex] , [ImagePath], [Uploaded], [CreatedDate], [CreatedBy] ) VALUES (';
    sql = sql.concat('"', id, '"');
    sql = sql.concat('"', outletID.toString(), '"');
    sql = sql.concat('"', index.toString(), '"');
    sql = sql.concat('"', imagePath, '"');
    sql = sql.concat('"', '0', '"');
    sql = sql.concat('"', now, '"');
    sql = sql.concat('"', userID.toString(), '")');
    log(sql);
    tx.executeSql(sql, [], function () { log('store upload info of image1'); }, function (dberr) { log(dberr.message); });
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

function selectAllUnsyncedOutlets(outletTbl, onSuccess, onError) {
    db.transaction(function (tx) {
        log('Select existing outlet')
        var sql = 'SELECT * FROM ' + outletTbl + ' WHERE PSynced = 0 ';
        logSqlCommand(sql);
        tx.executeSql(sql, [], function (tx1, dbres) {
            onSuccess(dbres);
        }, onError);
    }, onError);
}

function selectUnsyncedOutlets(outletTbl, onSuccess, onError) {
    db.transaction(function (tx) {
        log('Select existing outlet')
        var sql = 'SELECT * FROM ' + outletTbl + ' WHERE PSynced = 0 LIMIT ' + config.sync_batch_size.toString();
        logSqlCommand(sql);
        tx.executeSql(sql, [], function (tx1, dbres) {
            onSuccess(dbres);
        }, onError);
    }, onError);
}

function selectUnsyncedOutletsByView(outletTbl, view, onSuccess, onError) {
    db.transaction(function (tx) {
        log('Select unsynced outlets')
        var sql = 'SELECT * FROM ' + outletTbl + ' WHERE PSynced = 0 AND ';

        if (view == 0) {
            sql = sql.concat('AuditStatus <> ' + StatusDelete.toString());
        } else if (view == 1) {
            sql = sql.concat('AuditStatus in (' + StatusNew.toString(), ', ', StatusPost.toString(), ')');
            sql = sql.concat(' AND PersonID = ' + userID.toString());
        } else if (view == 2) {
            sql = sql.concat('AuditStatus = ' + StatusEdit.toString());
            sql = sql.concat(' AND PersonID = ' + userID.toString());
        } else {
            sql = sql.concat('AuditStatus in (' + StatusAuditAccept.toString(), ', ', StatusAuditDeny.toString(), ')');
            sql = sql.concat(' AND PersonID = ' + userID.toString());
        }
        
        logSqlCommand(sql);
        tx.executeSql(sql, [], function (tx1, dbres) {
            onSuccess(dbres);
        }, onError);
    }, onError);
}

function selectUnsyncedOutletsOfProvince(outletTbl, provinceid, onSuccess, onError) {
    db.transaction(function (tx) {
        log('Select existing outlet')
        var sql = 'SELECT * FROM ' + outletTbl + ' WHERE PSynced = 0 AND ProvinceID = " ' + provinceid + '"';
        logSqlCommand(sql);
        tx.executeSql(sql, [], function (tx1, dbres) {
            onSuccess(dbres);
        }, onError);
    }, onError);
}

function selectUnsyncedOutletImage(userID, outletID, onSuccess, onError) {
    db.transaction(function (tx) {
        log('Select existing outlet')
        var sql = 'SELECT * FROM [outletImage1] WHERE' +
                  ' OutletID = ' + outletID.toString() +
                  ' AND CreatedBy = ' + userID.toString() +
                  ' AND Uploaded = 0';
        logSqlCommand(sql);
        tx.executeSql(sql, [], onSuccess, onError);
    }, onError);
}

function selectDownloadProvincesDB(tablename, onSuccess, onError) {
    db.transaction(function (tx) {
        log('Select download provinces');
        var sql = 'SELECT * FROM ' + tablename;
        logSqlCommand(sql);
        tx.executeSql(sql, [], function (tx1, dbres) {
            onSuccess(dbres);
        }, onError);
    }, onError);
}

function saveDownloadProvincesDB(tablename, downloadProvinces, onSuccess, onError) {
    db.transaction(function (tx) {        
        log('Update download provinces');
        var i;
        var sql;
        for(i = 0; i< downloadProvinces.length;i++){
            var p = downloadProvinces[i];
            sql = 'INSERT OR REPLACE INTO ' + tablename + ' VALUES (' +
            '"' + p.id + '", ' +
            '"' + p.name + '", ' +
            + p.download.toString() + ')';
            logSqlCommand(sql);
            tx.executeSql(sql, [], function () { }, onError);
        }
        onSuccess();    
    }, onError);
}

function deleleDownloadProvinceDB(outletTableName, downloadTableName, provinceId, onSuccess, onError) {
    db.transaction(function (tx) {
        var sql = 'UPDATE ' + downloadTableName + ' SET download = 0 WHERE id = "' + provinceId + '"';           
        logSqlCommand(sql);
        tx.executeSql(sql, [], function () { }, onError);

        var sql = 'DELETE FROM ' + outletTableName + ' WHERE ProvinceID = "' + provinceId + '"';
        logSqlCommand(sql);
        tx.executeSql(sql, [], function (tx1, dbres) { onSuccess(dbres); }, onError);
    }, onError);
}

function deleteOutletDB(outletTableName, outlet, onSuccess, onError) {
    db.transaction(function (tx) {      
        var sql = 'DELETE FROM ' + outletTableName + ' WHERE ID = ' + outlet.ID.toString();
        logSqlCommand(sql);
        tx.executeSql(sql, [], function () { onSuccess() }, onError);
    }, onError);
}

function changeDownloadProvinceStatusDB(downloadTableName, provinceId, status, onSuccess, onError) {
    db.transaction(function (tx) {
        var sql = 'UPDATE ' + downloadTableName + ' SET download = ' + status.toString() + ' WHERE id = "' + provinceId + '"';        
        tx.executeSql(sql, [], function ()  { onSuccess(); }, onError);        
    }, onError);
}

function changeOutletStatusDB(outletTableName, outlet, status, synced, onSuccess, onError) {
    db.transaction(function (tx) {
        var sql = 'UPDATE ' + outletTableName +
                 ' SET AuditStatus = ' + status.toString() + ', ' +
                 ' PSynced = ' + synced.toString() +
                 ' WHERE ID = ' + outlet.ID.toString();
        logSqlCommand(sql);
        tx.executeSql(sql, [], function () { onSuccess() }, onError);
    }, onError);
}