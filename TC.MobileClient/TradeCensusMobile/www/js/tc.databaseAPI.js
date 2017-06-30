function initalizeDB(onSuccess, onError) {
    try {
        db = window.openDatabase('tc-v1-06.db', "2.0", 'tc-v1-06.db', 499 * 1024 * 1024); //~500MB
        db.transaction(function(tx) {
                if (resetDB) {
                    tx.executeSql("DROP TABLE IF EXISTS user1");
                    tx.executeSql("DROP TABLE IF EXISTS config");
                    //tx.executeSql("DROP TABLE IF EXISTS province");
                    tx.executeSql("DROP TABLE IF EXISTS outletType");
                    tx.executeSql("DROP TABLE IF EXISTS [outletImage1]");
                }

                if (config.versionNum < 5) {
                    tx.executeSql('DROP TABLE IF EXISTS [province]',
                        [],
                        function() {
                        },
                        function(tx1, dberr) {
                            onError(dberr.message);
                        });
                }

                log("ensure table [user] exist");
                tx.executeSql(
                    'CREATE TABLE IF NOT EXISTS [user1] ([ID] integer PRIMARY KEY NOT NULL, [UserName] text, [FirstName] text, [LastName] text, [IsTerminate] text NOT NULL,	[HasAuditRole] text NOT NULL COLLATE NOCASE, [PosID] text NOT NULL COLLATE NOCASE, [ZoneID] text NOT NULL COLLATE NOCASE, [AreaID] text NOT NULL COLLATE NOCASE, [ProvinceID] text NOT NULL COLLATE NOCASE, [Email] text, [EmailTo] text, [HouseNo] text, [Street] text, [District] text, [HomeAddress] text, [WorkAddress] text, [Phone] text, [IsDSM] text NOT NULL, [OfflinePassword] text NOT NULL)',
                    [],
                    function() {
                    },
                    function(tx1, dberr) {
                        onError(dberr.message);
                    });

                log("ensure table [config] exist");
                tx.executeSql(
                    'CREATE TABLE IF NOT EXISTS [config] ( [Name] text PRIMARY KEY NOT NULL COLLATE NOCASE, [Value] text)',
                    [],
                    function() {
                    },
                    function(tx1, dberr) {
                        onError(dberr.message);
                    });

                //log("ensure table [province] exist");
                //tx.executeSql(
                //    'CREATE TABLE IF NOT EXISTS [province] ( [id] text PRIMARY KEY NOT NULL, [name] text COLLATE NOCASE, [referenceGeoID])',
                //    [],
                //    function(tx1) {
                //    },
                //    function(tx1, dberr) {
                //        onError(dberr.message);
                //    });

                log("ensure table [outletType] exist");
                tx.executeSql(
                    'CREATE TABLE IF NOT EXISTS [outletType] ( [ID] text PRIMARY KEY NOT NULL, [Name] text COLLATE NOCASE, [OGroupID] text COLLATE NOCASE, [KPIType] int NOT NULL)',
                    [],
                    function(tx1) {
                    },
                    function(tx1, dberr) {
                        onError(dberr.message);
                    });

                log("ensure table [outletImage1] exist");
                tx.executeSql(
                    'CREATE TABLE IF NOT EXISTS [outletImage1] ( [ID] text NOT NULL, [OutletID] text NOT NULL, [ImageIndex] text NOT NULL, [ImagePath] text NOT NULL, [Uploaded] text NOT NULL, [CreatedDate] text NOT NULL, [CreatedBy] text NOT NULL )',
                    [],
                    function(tx1) {
                    },
                    function(tx1, dberr) {
                        onError(dberr.message);
                    });

                tx.executeSql('ALTER TABLE [user1] ADD COLUMN [Role] text NULL',
                    [],
                    function(tx1) {},
                    function(tx1, dberr) {});

                addressModel.initialize(db, tx);
                onSuccess(tx);

                log("initialized db successfully");
            },
            function(error) {
                // error
                System.out.println(error);
            });
    } catch (ex) {
        log(ex);
        onError(ex.message);
        //onError('Cannot access database, please restart app!');
    }
}

function logSqlCommand(sql) {
    log("SQL: " + sql);
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
            sql = sql.concat("'", hashString(quoteText(password)), "',");
            sql = sql.concat("'", quoteText(person.Role.toString()), "')");
            logSqlCommand(sql);
            tx1.executeSql(sql, [], onSuccess, onError);
        }, function (tx1, dberr) {
            console.error(dberr);
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
    var sql = "SELECT * FROM [config]";
    logSqlCommand(sql);
    tx.executeSql(sql, [], onSuccess, onError);
}

function selectUserDB(userName, password, onSuccess, onError) {
    db.transaction(function (tx) {
        var sql = "SELECT * FROM [user1] WHERE ";
        sql = sql.concat("UserName='", userName, "' AND OfflinePassword='" + hashString(quoteText(password)), "'");
        logSqlCommand(sql);
        tx.executeSql(sql, [], onSuccess, onError);
    });
}

function insertProvincesDB(curItems, items, callback) {
    db.transaction(function(tx) {
            //var deletesql = "DELETE * from " + config.tbl_downloadProvince;
            //logSqlCommand(deletesql);
            //tx.executeSql(deletesql, [], function () { }, function (tx, dberr) {
            //    console.error(dberr);
            //    callback("Insert database error.");
            //});

            provinces = [];
            var len = items.length;
            for (var i = 0; i < len; i++) {
                var p = items[i];

                console.log("add: " + JSON.stringify(p));

                var foundProvince = null;

                for (var j = 0; j < curItems.length; j++) {
                    var curProvince = curItems[j];
                    if (curProvince.id === p.id) {
                        foundProvince = curProvince;
                        break;
                    }
                }

                provinces.push({
                    id: p.id,
                    name: p.name,
                    download: foundProvince == null ? 0 : foundProvince.download,
                    referenceGeoID: p.referenceGeoID
                });

                var sql = "";
                if (foundProvince == null) {
                    sql = "INSERT INTO [" + config.tbl_downloadProvince + "] VALUES (";
                    sql = sql.concat("'", p.id, "', ");
                    sql = sql.concat("'", quoteText(p.name), "', ");
                    sql = sql.concat("0", ",");
                    sql = sql.concat(p.referenceGeoID, ")");
                } else {
                    sql = "UPDATE [" + config.tbl_downloadProvince + "] SET ";
                    sql = sql.concat("name='", p.name, "', ");
                    sql = sql.concat("download=", foundProvince.download, ", ");
                    sql = sql.concat("referenceGeoID=", p.referenceGeoID, " WHERE id='", p.id, "'");
                }

                logSqlCommand(sql);
                tx.executeSql(sql,
                    [],
                    function() {},
                    function(tx, dberr) {
                        console.error(dberr);
                        callback("Update database error.");
                    });
            };

            provinces.sort(function (a, b) {
                var n1 = changeAlias(a.name);
                var n2 = changeAlias(b.name);

                if (n1 > n2) {
                    return 1;
                } else if (n1 < n2) {
                    return -1;
                } else {
                    return 0;
                }
            });

            callback();
        },
        function(tx, dberr) {
            console.error(dberr);
            callback("Insert database error.");
        });
}

function insertOutletTypesDB(items, callback) {
    db.transaction(function(tx) {
            items.sort(function(i1, i2) {
                if (i1.KPIType < i2.KPIType)
                    return -1;
                if (i1.KPIType > i2.KPIType)
                    return 1;
                return 0;
            });

            outletTypes = [];
            outletTypes[0] = { ID: '-1', Name: ' ' };

            var sql = "DELETE FROM [outletType]";
            tx.executeSql(sql,
                [],
                function(tx) {
                    var len = items.length;
                    for (i = 0; i < len; i++) {
                        var p = items[i];
                        outletTypes[i + 1] = p;
                        var sql = "INSERT INTO [outletType] VALUES (";
                        sql = sql.concat("'", p.ID, "', ");
                        sql = sql.concat("'", quoteText(p.Name), "', ");
                        sql = sql.concat("'", p.OGroupID, "', ");
                        sql = sql.concat(p.KPIType.toString(), ")");
                        logSqlCommand(sql);
                        tx.executeSql(sql, [], function() {}, function(tx, dberr) { console.error(dberr); });
                    };
                    callback();
                },
                function(tx, dberr) {
                    console.error(dberr);
                    callback("Insert database error.");
                });
        },
        function(tx, dberr) {
            console.error(dberr);
            callback("Insert database error.");
        });
}

function insertSettingDB(config, callback) {
    db.transaction(function(tx) {
            //var onError = function (tx1, dberr) { console.error(dberr); };

            __insertSetting(tx, "protocol", config.protocol);
            __insertSetting(tx, "ip", config.ip);
            __insertSetting(tx, "port", config.port);
            __insertSetting(tx, "service_name", config.service_name);
            __insertSetting(tx, "item_count", config.item_count == undefined ? 20 : config.item_count.toString());
            __insertSetting(tx, "distance", config.distance == undefined ? 200 : config.distance.toString());
            __insertSetting(tx, "province_id", config.province_id);
            __insertSetting(tx, "calc_distance_algorithm", config.calc_distance_algorithm);
            __insertSetting(tx, "tbl_area_ver", config.tbl_area_ver);
            __insertSetting(tx, "tbl_outlettype_ver", config.tbl_outlettype_ver);
            __insertSetting(tx, "tbl_province_ver", config.tbl_province_ver);
            __insertSetting(tx, "tbl_zone_ver", config.tbl_zone_ver);
            __insertSetting(tx, "map_api_key", config.map_api_key);
            __insertSetting(tx, "sync_time", config.sync_time);
            __insertSetting(tx, "cluster_size", config.cluster_size);
            __insertSetting(tx, "cluster_max_zoom", config.cluster_max_zoom);
            __insertSetting(tx, "max_oulet_download", config.max_oulet_download.toString());
            __insertSetting(tx, "enable_check_in", config.enable_check_in.toString());
            __insertSetting(tx, "enable_send_request", config.enable_send_request.toString());
            __insertSetting(tx, "hotlines", JSON.stringify(config.hotlines));
            __insertSetting(tx, "map_icons_version", config.map_icons_version.toString());
            __insertSetting(tx, "map_tc_salesman_outlet", config.map_tc_salesman_outlet);
            __insertSetting(tx, "map_tc_salesman_outlet_denied", config.map_tc_salesman_outlet_denied);
            __insertSetting(tx, "map_tc_auditor_outlet", config.map_tc_auditor_outlet);
            __insertSetting(tx, "map_tc_auditor_outlet_denied", config.map_tc_auditor_outlet_denied);
            __insertSetting(tx, "map_tc_agency_new_outlet", config.map_tc_agency_new_outlet);
            __insertSetting(tx, "map_tc_agency_new_outlet_denied", config.map_tc_agency_new_outlet_denied);
            __insertSetting(tx, "map_tc_agency_new_outlet_approved", config.map_tc_agency_new_outlet_approved);
            __insertSetting(tx, "map_tc_agency_existing_outlet_edited", config.map_tc_agency_existing_outlet_edited);
            __insertSetting(tx, "map_tc_agency_existing_outlet_denied", config.map_tc_agency_existing_outlet_denied);
            __insertSetting(tx,
                "map_tc_agency_existing_outlet_approved",
                config.map_tc_agency_existing_outlet_approved);
            __insertSetting(tx, "map_tc_agency_auditor_new_outlet", config.map_tc_agency_auditor_new_outlet);
            __insertSetting(tx,
                "map_tc_agency_auditor_new_outlet_denied",
                config.map_tc_agency_auditor_new_outlet_denied);
            __insertSetting(tx,
                "map_tc_agency_auditor_new_outlet_approved",
                config.map_tc_agency_auditor_new_outlet_approved);
            __insertSetting(tx, "map_sr_outlet_audit_denied", config.map_sr_outlet_audit_denied);
            __insertSetting(tx, "map_sr_outlet_audit_approved", config.map_sr_outlet_opened);
            __insertSetting(tx, "map_sr_outlet_closed", config.map_sr_outlet_closed);
            __insertSetting(tx, "map_sr_outlet_non_track", config.map_sr_outlet_non_track);
            __insertSetting(tx, "map_sr_outlet_opened", config.map_sr_outlet_opened);
            __insertSetting(tx, "map_dis_outlet_audit_denied", config.map_dis_outlet_audit_denied);
            __insertSetting(tx, "map_dis_outlet_audit_approved", config.map_dis_outlet_audit_approved);
            __insertSetting(tx, "map_dis_outlet_closed", config.map_dis_outlet_closed);
            __insertSetting(tx, "map_dis_outlet_opened", config.map_dis_outlet_opened);
            __insertSetting(tx, "get_location_time_out", config.get_location_time_out.toString());
            __insertSetting(tx, "item_count_max", config.item_count_max.toString());
            callback();
        },
        function(tx, dberr) {
            console.error(dberr);
            callback("Insert database error.");
        });
}

function __insertSetting(tx, name, value) {
    var sql = "INSERT OR REPLACE INTO [config] VALUES (";
    sql = sql.concat("'", name, "', ");
    sql = sql.concat("'", value, "')");
    logSqlCommand(sql);
    tx.executeSql(sql,
        [],
        function() {
            log("Inserted settings: " + name + "=" + value);
        },
        function(tx, err) { console.error(err); });
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
    var sql = "SELECT * FROM outletType ORDER BY [KPIType]";
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

function ensureUserOutletDBExist(isReset, outletSyncTbl, outletTbl, provinceDownloadTbl, journalTbl, callback) {
    db.transaction(function (tx) {
        if (isReset) {
            console.error('RESET USER DATABASE');

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
                        '[ID] int NOT NULL,' +              // 1
	                    '[AreaID] text NOT NULL,' +
	                    '[TerritoryID] text NOT NULL,' +
	                    '[OTypeID] text NOT NULL,' +
	                    '[Name] text NOT NULL,' +
	                    '[AddLine] text NULL,' +
	                    '[AddLine2] text NULL,' +                        
	                    '[District] text NULL,' +
	                    '[ProvinceID] text NOT NULL,' +
	                    '[Phone] text NULL,' +              // 10
	                    '[CallRate] int NOT NULL,' + 
 	                    '[CloseDate] text NULL,' +
	                    '[CreateDate] text NOT NULL,' +
	                    '[Tracking] int NOT NULL,' +
	                    '[Class] text NULL,' +
	                    '[Open1st] text NULL,' +
	                    '[Close1st] text NULL,' +
	                    '[Open2nd] text NULL,' +
	                    '[Close2nd] text NULL,' +
	                    '[SpShift] int NOT NULL,' +         // 20
	                    '[LastContact] text NOT NULL,' +
	                    '[LastVisit] text NULL,' +
	                    '[PersonID] int NOT NULL,' +
                        '[PersonFirstName] text NULL,' +
                        '[PersonLastName] text NULL,' +
	                    '[Note] text NULL,' +
	                    '[Longitude] float NULL,' +
	                    '[Latitude] float NULL,' +
	                    '[TaxID] text NULL,' +
	                    '[ModifiedStatus] int NULL,' +      // 30
	                    '[InputBy] int NULL,' +
	                    '[InputDate] text NULL,' +
	                    '[AmendBy] int NOT NULL,' +
	                    '[AmendDate] text NOT NULL,' +
	                    '[OutletEmail] text NULL,' +
	                    '[AuditStatus] int NOT NULL,' +
                        '[TotalVolume] int NOT NULL,' +
                        '[VBLVolume] int NOT NULL,' +                        
	                    '[StringImage1] text,' +
	                    '[StringImage2] text,' +            // 40
	                    '[StringImage3] text,' +            
	                    '[OutletSource] int,' +
                        '[PRowID] text NULL,' +
	                    '[PIsAdd] bit,' +
                        '[PIsMod] bit,' +
                        '[PIsAud] bit,' +
	                    '[PSynced] bit,' +
                        '[PStatus] int,' +
	                    '[PLastModTS] int,' +
                        '[PMarked] bit,' +                  // 50
	                    '[Ward] text NULL,' +
                        '[StringImage4] text,' + 
	                    '[StringImage5] text,' +
	                    '[StringImage6] text,' +
                        '[InputByRole] int NULL,' +
                        '[AmendByRole] int NULL,' +
                        '[IsSent] int NULL,' +
                        '[LegalName] text NULL' +           // 58
                        ')');
        logSqlCommand(sql);
        tx.executeSql(sql);

        tx.executeSql('ALTER TABLE ' + outletTbl + ' ADD COLUMN [Ward] text NULL', [], function (tx1) { }, function (tx1, dberr) { });
        tx.executeSql('ALTER TABLE ' + outletTbl + ' ADD COLUMN [StringImage4] text NULL', [], function (tx1) { }, function (tx1, dberr) { console.error(dberr); });
        tx.executeSql('ALTER TABLE ' + outletTbl + ' ADD COLUMN [StringImage5] text NULL', [], function (tx1) { }, function (tx1, dberr) { console.error(dberr); });
        tx.executeSql('ALTER TABLE ' + outletTbl + ' ADD COLUMN [StringImage6] text NULL', [], function (tx1) { }, function (tx1, dberr) { console.error(dberr); });
        tx.executeSql('ALTER TABLE ' + outletTbl + ' ADD COLUMN [InputByRole] int NULL', [], function (tx1) { }, function (tx1, dberr) { console.error(dberr); });
        tx.executeSql('ALTER TABLE ' + outletTbl + ' ADD COLUMN [AmendByRole] int NULL', [], function (tx1) { }, function (tx1, dberr) { console.error(dberr); });
        tx.executeSql('ALTER TABLE ' + outletTbl + ' ADD COLUMN [IsSent] int NULL', [], function (tx1) { }, function (tx1, dberr) { console.error(dberr); });
        tx.executeSql('ALTER TABLE ' + outletTbl + ' ADD COLUMN [LegalName] text NULL', [], function (tx1) { }, function (tx1, dberr) { console.error(dberr); });
        tx.executeSql('ALTER TABLE ' + outletTbl + ' ADD COLUMN [Comment] text NULL', [], function (tx1) { }, function (tx1, dberr) { console.error(dberr); });
        tx.executeSql('ALTER TABLE ' + outletTbl + ' ADD COLUMN [IsCompressed] bit default 0', [], function (tx1) { }, function (tx1, dberr) { console.error(dberr); });

        tx.executeSql('ALTER TABLE ' + provinceDownloadTbl + ' ADD COLUMN [referenceGeoID]', [], function (tx1) { }, function (tx1, dberr) { });

        //if (config.versionNum <= 4) {
        //    tx.executeSql('ALTER TABLE ' + outletTbl + ' ADD COLUMN [Ward] text NULL', [], function (tx1) { }, function (tx1, dberr) { });
        //}

        //if (config.versionNum < 10) {
        //    tx.executeSql('ALTER TABLE ' + outletTbl + ' ADD COLUMN [StringImage4] text NULL', [], function (tx1) { }, function (tx1, dberr) { console.error(dberr); });
        //    tx.executeSql('ALTER TABLE ' + outletTbl + ' ADD COLUMN [StringImage5] text NULL', [], function (tx1) { }, function (tx1, dberr) { console.error(dberr); });
        //    tx.executeSql('ALTER TABLE ' + outletTbl + ' ADD COLUMN [StringImage6] text NULL', [], function (tx1) { }, function (tx1, dberr) { console.error(dberr); });
        //    tx.executeSql('ALTER TABLE ' + outletTbl + ' ADD COLUMN [InputByRole] int NULL', [], function (tx1) { }, function (tx1, dberr) { console.error(dberr); });
        //    tx.executeSql('ALTER TABLE ' + outletTbl + ' ADD COLUMN [AmendByRole] int NULL', [], function (tx1) { }, function (tx1, dberr) { console.error(dberr); });
        //}

        //if (config.versionNum < 11) {
        //    tx.executeSql('ALTER TABLE ' + outletTbl + ' ADD COLUMN [IsSent] int NULL', [], function (tx1) { }, function (tx1, dberr) { console.error(dberr); });
        //}

        //if (config.versionNum < 12) {
        //    tx.executeSql('ALTER TABLE ' + outletTbl + ' ADD COLUMN [LegalName] text NULL', [], function (tx1) { }, function (tx1, dberr) { console.error(dberr); });
        //}
        
        journals.tableName = journalTbl;
        journals.database = db;
        journals.createTable(tx, callback);

        //callback();
    });
}

//*****************************************************
function _syncWithStorageOutletDB(tx, userID, outletTbl, outlets, i, onSuccess, onError) {
    if (i == outlets.length) {
        onSuccess();
        return;
    }

    var outlet = outlets[i];
    log('*** (' + (i + 1).toString() + '/' + outlets.length.toString() + ') Sync: ' + outlet.Name);

    outlet.PSynced = 1; // synced
    outlet.positionIndex = i;
    outlet.isOnline = true;
    if (outlet.PStatus == null || outlet.PStatus == undefined)
        outlet.PStatus = 0;
    initializeOutlet(outlet);

    //var sql = 'SELECT * FROM ' + outletTbl + ' WHERE PRowID like \'' + outlet.PRowID.toString() + '\'';
    var sql = 'SELECT * FROM ' + outletTbl + ' WHERE ID = ' + outlet.ID.toString();
    tx.executeSql(sql, [], 
        function (tx1, dbres) {
            var rowlen = dbres.rows.length;
            if (rowlen > 0) {
                var existOutlet = dbres.rows.item(0); // first item only
                if (outlet.AmendDate == existOutlet.AmendDate) {
                    // outlet wasn't changed
                    log('Outlet was not changed');
                } else {
                    log('Outlet was changed');
                    if (existOutlet.PSynced) {
                        // synced already, just overwrite by server value...
                        log('Overwrite local because it was synced to server');
                        _updateOutlet(tx, outletTbl, outlet, 0, true, false);
                    } else {
                        // outlet wasn't synced, check amend date
                        // this logic can be failed if timezone in server and client are different
                        if (compareDate(outlet.AmendDate, existOutlet.AmendDate, 'yyyy-MM-dd HH:mm:ss') > 0) {
                            log('Overwrite local because server date > local date');
                            _updateOutlet(tx, outletTbl, outlet, 0, true, false);
                        }
                    }
                }
            } else {
                log('Add outlet to db:' + outlet.Name);
                if (outlet.PersonIsDSM != null && (outlet.PersonIsDSM == true || outlet.PersonIsDSM == 1)) {
                    outlet.OutletSource = 1;
                } else {
                    outlet.OutletSource = 0;
                }

                _addNewOutlet(tx1, outletTbl, outlet, false, false, false, true, false);
            }

            if ((i + 1) < outlets.length) {
                _syncWithStorageOutletDB(tx1, userID, outletTbl, outlets, i + 1, onSuccess, onError);
            } else{
                onSuccess();
            }
        },  
        function (dberr) {
            log('select outlet error: ' + dberr.message);
            onError('Cannot sync outlet ' + outlet.Name + ': ' + dberr.message);
        });
}

//*****************************************************
function insertOutletsDB(userID, outletTbl, outlets, onSuccess, onError) {
    if (outlets.length == 0) {
        onSuccess();
        return;
    }
    db.transaction(function (tx) {
        _syncWithStorageOutletDB(tx, userID, outletTbl, outlets, 0, onSuccess, onError);
    }, onError);
}

function deleleOutletsDB(outletTbl, provinceId, onSuccess, onError) {
    db.transaction(function (tx) {
        var sql = 'DELETE FROM ' + outletTbl + ' WHERE ProvinceID = "' + provinceId + '"';
        logSqlCommand(sql);
        tx.executeSql(sql, [], function (tx1) { onSuccess();}, onError);
    }, onError);
}

//*****************************************************
function addDownloadOutletsDB(outletTbl, outlets, onSuccess, onError) {
    if (outlets.length == 0) {
        onSuccess();
        return;
    }
    db.transaction(function (tx) {
        //addDownloadOutletForeachDB(tx, outletTbl, outlets, 0, onSuccess, onError);

        var err;
        for (var i = 0; i < outlets.length; i++) {
            var outlet = outlets[i];
            var date = new Date(outlet.AmendDate);
            try {
                var d1 = new Date(date);
                d1.setHours(date.getHours() - 7);
                date = d1;
            }
            catch (e) {
                console.error(e);
            }
            var sql = buildOutletInsertSql(outletTbl, outlets[i], date);
            tx.executeSql(sql, [], function (tx1) { }, function (tx1, dberr) {
                err = dberr;
                console.log(sql);
                console.error(dberr);
            });
        }
        if (err == null) {
            tx.executeSql('select * from ' + outletTbl + ' where Name = "Aaaa"', [],
                function (tx1, dbres) {
                    if (dbres.rows.length > 0) log(dbres);
                    onSuccess();
                }, function (e) {

                });
        }
        else {
            onError(err);
        }
    }, onError);

}

function _addDownloadOutletForeachDB(tx, outletTbl, outlets, i, onSuccess, onError) {
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
           _addDownloadOutletForeachDB(tx1, outletTbl, outlets, i + 1, onSuccess, onError);
        } else {
            onSuccess();
        }
    }, function (tx1, dberr) {
        err = dberr;
        onError(dberr);
    });
}

function quoteText(str) {
    if (isEmpty(str)) return '';
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

function quoteInt(v) {
    return (typeof v === 'undefined' || v == null) ? 0 : v.toString();
}

function buildOutletInsertSql(outletTbl, outlet, modifiedDate) {
    var n;
    if (typeof modifiedDate == 'undefined') {
        n = (new Date()).getTime();
    } else {
        n = modifiedDate.getTime();
    }

    if (outlet.PersonIsDSM != null && (outlet.PersonIsDSM == true || outlet.PersonIsDSM == 1)) {
        outlet.OutletSource = 1;
    } else {
        outlet.OutletSource = 0;
    }

    var sql = 'INSERT INTO ' + outletTbl + ' VALUES (';
    sql = sql.concat(outlet.ID.toString(), ', ');               //[ID] int NOT NULL,' +
    sql = sql.concat("'", outlet.AreaID, "', ");                //[AreaID] text NOT NULL,' ,
    sql = sql.concat("'", quoteText(outlet.TerritoryID), "', ");//[TerritoryID] text NOT NULL,' ,
    sql = sql.concat("'", outlet.OTypeID, "', ");               //[OTypeID] text NOT NULL,' ,
    sql = sql.concat("'", quoteText(outlet.Name), "', ");       //[Name] text NOT NULL,'
    sql = sql.concat("'", quoteText(outlet.AddLine), "', ");    //[AddLine] text NULL,' ,
    sql = sql.concat("'", quoteText(outlet.AddLine2), "', ");   //[AddLine2] text NULL,' ,
    sql = sql.concat("'", quoteText(outlet.District), "', ");   //[District] text NULL,' ,
    sql = sql.concat("'", outlet.ProvinceID, "', ");            //[ProvinceID] text NOT NULL,' ,
    sql = sql.concat("'", quoteText(outlet.Phone), "', ");      //[Phone] text NULL,' ,
    sql = sql.concat(quoteInt(outlet.CallRate), ",");           //[CallRate] int NOT NULL,' ,
    sql = sql.concat("'", outlet.CloseDate, "', ");             //[CloseDate] text NULL,' ,
    sql = sql.concat("'", outlet.CreateDate, "', ");	        //[CreateDate] text NOT NULL,' ,
    sql = sql.concat(outlet.Tracking.toString(), ', ');         //[Tracking] int NOT NULL,' ,
    sql = sql.concat("'", quoteText(outlet.Class) + "',");      //[Class] text NULL,' ,
    sql = sql.concat("' ',");                                   //[Open1st] text NULL,' ,
    sql = sql.concat("' ',");                                   //[Close1st] text NULL,' ,
    sql = sql.concat("' ',");                                   //[Open2nd] text NULL,' ,
    sql = sql.concat("' ',");                                   //[Close2nd] text NULL,' ,
    sql = sql.concat(quoteInt(outlet.SpShift), ",");            //[SpShift] int NOT NULL,' ,
    sql = sql.concat("'", quoteText(outlet.LastContact), "', ");       //[LastContact]text NOT NULL,' ,
    sql = sql.concat("'", outlet.LastVisit, "', ");             //[LastVisit] text NULL,' ,
    sql = sql.concat(outlet.PersonID.toString(), ', ');         //[PersonID] int NOT NULL,' ,     
    sql = sql.concat("'", quoteText(outlet.PersonFirstName), "', ");   //[PersonFirstName] text NULL,'
    sql = sql.concat("'", quoteText(outlet.PersonLastName), "', ");    //[PersonLastName] text NULL,' +
    sql = sql.concat("'", quoteText(outlet.Note), "', ");       //[Note] text NULL,' ,
    sql = sql.concat(quoteInt(outlet.Longitude), ', ');         //[Longitude] float NULL,' ,
    sql = sql.concat(quoteInt(outlet.Latitude), ', ');          //[Latitude] float NULL,' ,
    sql = sql.concat("'", quoteText(outlet.TaxID), "', ");      //[TaxID] text NULL,' ,
    sql = sql.concat("0, ");	                                //[ModifiedStatus] int NULL,' ,
    sql = sql.concat(quoteInt(outlet.InputBy), ', ');           //[InputBy] int NULL,' ,
    sql = sql.concat("' ', ");                                  //[InputDate] text NULL,' ,
    sql = sql.concat(quoteInt(outlet.AmendBy), ', ');           //[AmendBy] int NOT NULL,' ,
    sql = sql.concat("'", outlet.AmendDate, "', ");             //[AmendDate] text NOT NULL,' ,
    sql = sql.concat("' ', ");                                  //[OutletEmail] text NULL
    sql = sql.concat(outlet.AuditStatus.toString(), ', ');      //[AuditStatus] int NOT NULL
    sql = sql.concat(outlet.TotalVolume.toString(), ', ');      //[TotalVolume] int NOT NULL
    sql = sql.concat(outlet.VBLVolume.toString(), ', ');        //[VBLVolume] int NOT NULL
    sql = sql.concat("'", outlet.StringImage1, "', ");          //[StringImage1] text
    sql = sql.concat("'", outlet.StringImage2, "', ");          //[StringImage2] text
    sql = sql.concat("'", outlet.StringImage3, "', ");          //[StringImage3] text
    sql = sql.concat(outlet.OutletSource.toString(), ', ');     //[OutletSource] int
    sql = sql.concat("'", outlet.PRowID, "', ");                //[PRowID] text NULL
    sql = sql.concat("0, ");                                    //[PIsAdd] bit
    sql = sql.concat("0, ");                                    //[PIsMod] bit
    sql = sql.concat("0, ");                                    //[PIsAud] bit
    sql = sql.concat("1, ");                                    //[PSynced] bit
    sql = sql.concat("1, ");                                    //[PStatus] int
    sql = sql.concat(n.toString(), ', ');                       //[PLastModTS] int
    sql = sql.concat("0, ");                                    //[PMarked] bit
    sql = sql.concat("'", quoteText(outlet.Ward), "',");        //[Ward] text
    sql = sql.concat("'", outlet.StringImage4, "', ");          //[StringImage4] text
    sql = sql.concat("'", outlet.StringImage5, "', ");          //[StringImage5] text
    sql = sql.concat("'", outlet.StringImage6, "',");           //[StringImage6] text
    sql = sql.concat(quoteInt(outlet.InputByRole), ",");        //[InputByRole] int
    sql = sql.concat(quoteInt(outlet.AmendByRole), ",");        //[AmendByRole] int
    sql = sql.concat(quoteInt(outlet.IsSent), ",");             //[IsSent] int
    sql = sql.concat("'", quoteText(outlet.LegalName), "',");   //[LegalName] text
    sql = sql.concat("'", quoteText(outlet.Comment), "',");     //[Comment] text
    sql = sql.concat(outlet.IsCompressed ? "1" : "0", ")");       //[IsCompressed] text
    return sql;
}

function _addNewOutlet(tx, outletTbl, outlet, isAdd, isMod, isAud, synced, marked) {
    log("add new outlet");
    var n = (new Date()).getTime();
    var sql = "INSERT INTO " + outletTbl + " VALUES (";
    sql = sql.concat(outlet.ID.toString(), ", ");               //[ID] int NOT NULL
    sql = sql.concat("'", outlet.AreaID, "', ");                //[AreaID] text NOT NULL
    sql = sql.concat("'", quoteText(outlet.TerritoryID), "', ");//[TerritoryID] text NOT NULL
    sql = sql.concat("'", outlet.OTypeID, "', ");               //[OTypeID] text NOT NULL
    sql = sql.concat("'", quoteText(outlet.Name), "', ");       //[Name] text NOT NULL
    sql = sql.concat("'", quoteText(outlet.AddLine), "', ");    //[AddLine] text NULL
    sql = sql.concat("'", quoteText(outlet.AddLine2), "', ");   //[AddLine2] text NULL
    sql = sql.concat("'", quoteText(outlet.District), "', ");   //[District] text NULL
    sql = sql.concat("'", outlet.ProvinceID, "', ");            //[ProvinceID] text NOT NULL
    sql = sql.concat("'", quoteText(outlet.Phone), "', ");      //[Phone] text NULL
    sql = sql.concat(quoteInt(outlet.CallRate), ", ");          //[CallRate] int NOT NULL
    sql = sql.concat("'", outlet.CloseDate, "', ");             //[CloseDate] text NULL
    sql = sql.concat("'", outlet.CreateDate, "', ");	        //[CreateDate] text NOT NULL
    sql = sql.concat(outlet.Tracking.toString(), ", ");         //[Tracking] int NOT NULL
    sql = sql.concat("'", quoteText(outlet.Class) + "',");     //[Class] text NULL
    sql = sql.concat("' ',");                                   //[Open1st] text NULL
    sql = sql.concat("' ',");                                   //[Close1st] text NULL
    sql = sql.concat("' ',");                                   //[Open2nd] text NULL
    sql = sql.concat("' ',");                                   //[Close2nd] text NULL
    sql = sql.concat(quoteInt(outlet.SpShift), ", ");           //[SpShift] int NOT NULL
    sql = sql.concat("'", quoteText(outlet.LastContact), "', ");//[LastContact]text NOT NULL
    sql = sql.concat("'", quoteText(outlet.LastVisit), "', ");  //[LastVisit] text NULL
    sql = sql.concat(outlet.PersonID.toString(), ", ");         //[PersonID] int NOT NULL   
    sql = sql.concat("'", quoteText(outlet.PersonFirstName), "', ");   //[PersonFirstName] text NULL
    sql = sql.concat("'", quoteText(outlet.PersonLastName), "', ");    //[PersonLastName] text NULL
    sql = sql.concat("'", quoteText(outlet.Note), "', ");              //[Note] text NULL
    sql = sql.concat(outlet.Longitude.toString(), ", ");        //[Longitude] float NULL
    sql = sql.concat(outlet.Latitude.toString(), ", ");         //[Latitude] float NULL
    sql = sql.concat("'", quoteText(outlet.TaxID), "', ");      //[TaxID] text NULL
    sql = sql.concat("0, ");	                                //[ModifiedStatus] int NULL
    sql = sql.concat(quoteInt(outlet.InputBy), ", ");           //[InputBy] int NULL
    sql = sql.concat("' ', ");                                  //[InputDate] text NULL
    sql = sql.concat(quoteInt(outlet.AmendBy), ", ");           //[AmendBy] int NOT NULL
    sql = sql.concat("'", outlet.AmendDate, "', ");             //[AmendDate] text NOT NULL
    sql = sql.concat("' ', ");                                  //[OutletEmail] text NULL   
    sql = sql.concat(outlet.AuditStatus.toString(), ", ");      //[AuditStatus] int NOT NULL	
    sql = sql.concat(outlet.TotalVolume.toString(), ", ");      //[TotalVolume] int NOT NULL
    sql = sql.concat(outlet.VBLVolume.toString(), ", ");        //[VBLVolume] int NOT NULL  
    sql = sql.concat("'", outlet.StringImage1, "',");           //[StringImage1] text
    sql = sql.concat("'", outlet.StringImage2, "',");           //[StringImage2] text
    sql = sql.concat("'", outlet.StringImage3, "',");           //[StringImage3] text
    sql = sql.concat(outlet.OutletSource.toString(), ", ");     //[OutletSource] int
    sql = sql.concat("'", outlet.PRowID, "', ");                //[PRowID] text NULL  
    sql = sql.concat(isAdd ? "1" : "0", ", ");                  //[PIsAdd] bit
    sql = sql.concat(isMod ? "1" : "0", ", ");                  //[PIsMod] bit
    sql = sql.concat(isAud ? "1" : "0", ", ");                  //[PIsAud] bit
    sql = sql.concat(synced ? "1" : "0", ", ");                 //[PSynced] bit
    sql = sql.concat(outlet.PStatus.toString(), ", ");          //[PStatus] int
    sql = sql.concat(quoteInt(n), ", ");                        //[PLastModTS] int
    sql = sql.concat(marked ? "1" : "0", ", ");                 //[PMarked] bit
    sql = sql.concat("'", quoteText(outlet.Ward), "',");        //[Ward] text
    sql = sql.concat("'", outlet.StringImage4, "',");           //[StringImage4] text
    sql = sql.concat("'", outlet.StringImage5, "',");           //[StringImage5] text
    sql = sql.concat("'", outlet.StringImage6, "',");           //[StringImage6] text
    sql = sql.concat(outlet.InputByRole, ",");                  //[InputByRole] int
    sql = sql.concat(outlet.AmendByRole, ",");                  //[AmendByRole] int
    sql = sql.concat(quoteInt(outlet.IsSent), ",");             //[IsSent] int
    sql = sql.concat("'", quoteText(outlet.LegalName), "',");   //[LegalName] text
    sql = sql.concat("'", quoteText(outlet.Comment), "',");     //[Comment] text
    sql = sql.concat(outlet.IsCompressed ? "1" : "0", ")");       //[IsCompressed] text

    logSqlCommand(sql);
    tx.executeSql(sql, [],
        function (tx1) {
            log("Add outlet " + outlet.ID.toString());
        },
        function (tx1, dberr) {
            log("Add outlet error " + outlet.ID.toString());
            log(dberr.message);
        });
}

function _updateOutlet(tx, outletTbl, outlet, state, synced, updateImage) {
    var n = (new Date()).getTime();
    var marked = n < outlet.PLastModTS;

    log(outlet);

    var sql = "UPDATE " + outletTbl + " SET ";
    sql = sql.concat("ID=", outlet.ID, ", ");
    sql = sql.concat("AreaID='", outlet.AreaID, "', ");
    sql = sql.concat("TerritoryID='", outlet.TerritoryID, "', ");
    sql = sql.concat("OTypeID='", outlet.OTypeID, "', ");
    sql = sql.concat("Name='", quoteText(outlet.Name), "', ");
    sql = sql.concat("AddLine='", quoteText(outlet.AddLine), "', ");
    sql = sql.concat("AddLine2='", quoteText(outlet.AddLine2), "', ");
    sql = sql.concat("Ward='", quoteText(outlet.Ward), "', ");
    sql = sql.concat("District='", quoteText(outlet.District), "', ");
    sql = sql.concat("ProvinceID='", outlet.ProvinceID, "', ");
    sql = sql.concat("Phone='", quoteText(outlet.Phone), "', ");
    sql = sql.concat("CallRate=", quoteInt(outlet.CallRate), ", ");
    sql = sql.concat("CloseDate='", outlet.CloseDate, "', ");
    sql = sql.concat("CreateDate='", outlet.CreateDate, "', ");
    sql = sql.concat("Tracking=", outlet.Tracking.toString(), ", ");
    sql = sql.concat("Class='", quoteText(outlet.Class), "', ");
    //[Open1st] text NULL
    //[Close1st] text NULL
    //[Open2nd] text NULL
    //[Close2nd] text NULL
    sql = sql.concat("SpShift=", quoteInt(outlet.SpShift), ", ");
    //[LastContact]text NOT NULL
    //[LastVisit] text NULL
    sql = sql.concat("IsSent=", quoteInt(outlet.IsSent), ", ");
    sql = sql.concat("PersonID=", outlet.PersonID.toString(), ", ");
    sql = sql.concat("Note='", outlet.Note, "', ");
    sql = sql.concat("Longitude=", outlet.Longitude.toString(), ", ");
    sql = sql.concat("Latitude=", outlet.Latitude.toString(), ", ");
    sql = sql.concat("TaxID='", quoteText(outlet.TaxID), "', ");
    //[ModifiedStatus] int NULL
    sql = sql.concat("InputBy=", outlet.InputBy == null ? 0 : outlet.InputBy.toString(), ", ");
    sql = sql.concat("InputDate='", outlet.InputDate == null ? "" : outlet.InputDate, "', ");
    sql = sql.concat("AmendBy=", outlet.AmendBy == null ? 0 : outlet.AmendBy.toString(), ", ");
    sql = sql.concat("AmendDate='", outlet.AmendDate, "', ");
    //[OutletEmail] text NULL
    sql = sql.concat("AuditStatus=", outlet.AuditStatus.toString(), ", ");
    sql = sql.concat("TotalVolume=", outlet.TotalVolume.toString(), ", ");
    sql = sql.concat("VBLVolume=", outlet.VBLVolume.toString(), ", ");

    if (updateImage) {
        if (!isEmpty(outlet.StringImage1)) {
            if (outlet.StringImage1.toUpperCase().indexOf("IMAGES") > -1) {
                // ignore this value is URL link
            } else {
                sql = sql.concat("StringImage1='", outlet.StringImage1, "', ");
            }
        } else
            sql = sql.concat("StringImage1='',");

        if (!isEmpty(outlet.StringImage2)) {
            if (outlet.StringImage2.toUpperCase().indexOf("IMAGES") > -1) {
                // ignore this value is URL link
            } else {
                sql = sql.concat("StringImage2='", outlet.StringImage2, "', ");
            }
        } else
            sql = sql.concat("StringImage2='',");

        if (!isEmpty(outlet.StringImage3)) {
            if (outlet.StringImage3.toUpperCase().indexOf("IMAGES") > -1) {
                // ignore this value is URL link
            } else {
                sql = sql.concat("StringImage3='", outlet.StringImage3, "', ");
            }
        } else
            sql = sql.concat("StringImage3='', ");

        if (!isEmpty(outlet.StringImage4)) {
            if (outlet.StringImage4.toUpperCase().indexOf("IMAGES") > -1) {
            } else {
                sql = sql.concat("StringImage4='", outlet.StringImage4, "', ");
            }
        } else
            sql = sql.concat("StringImage4='',");

        if (!isEmpty(outlet.StringImage5)) {
            if (outlet.StringImage5.toUpperCase().indexOf("IMAGES") > -1) {
            } else {
                sql = sql.concat("StringImage5='", outlet.StringImage5, "', ");
            }
        } else
            sql = sql.concat("StringImage5='',");

        if (!isEmpty(outlet.StringImage6)) {
            if (outlet.StringImage6.toUpperCase().indexOf("IMAGES") > -1) {
            } else {
                sql = sql.concat("StringImage6='", outlet.StringImage6, "', ");
            }
        } else
            sql = sql.concat("StringImage6='', ");
    }

    sql = sql.concat("OutletSource=", outlet.OutletSource, ", ");
    //[PRowID] text NULL
    if (state == 1) sql = sql.concat("PIsAdd=1, ");
    if (state == 2) sql = sql.concat("PIsMod=1, ");
    if (state == 4) sql = sql.concat("PIsAud=1, ");
    sql = sql.concat("PSynced=", synced ? "1" : "0", ", ");
    sql = sql.concat("PStatus=", outlet.PStatus.toString() + ", ");
    sql = sql.concat("PLastModTS=", n.toString(), ", ");
    sql = sql.concat("PMarked=", marked ? "1" : "0", ", ");
    sql = sql.concat("InputByRole=", quoteInt(outlet.InputByRole), ", ");
    sql = sql.concat("AmendByRole=", quoteInt(outlet.AmendByRole), ", ");
    sql = sql.concat("LegalName='", quoteText(outlet.LegalName), "', ");
    sql = sql.concat("Comment='", quoteText(outlet.Comment), "', ");
    sql = sql.concat("IsCompressed=", outlet.IsCompressed ? "1" : "0");

    sql = sql.concat(" WHERE PRowID like '", outlet.PRowID, "'");
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
           console.error(dberr);
           log('Error while update outlet');
       });
}

//*****************************************************
function saveOutletDB(outletTbl, outlet, state, synced, onSuccess, onError) {
    db.transaction(function (tx) {
        var sql = 'SELECT * FROM ' + outletTbl + ' WHERE PRowID like \'' + outlet.PRowID.toString() + '\'';
        tx.executeSql(sql, [],
            function (tx, dbres) {
                var rowlen = dbres.rows.length;
                if (dbres.rows.length == 0) {
                    _addNewOutlet(tx, outletTbl, outlet, true, false, false, synced, false);
                } else {
                    _updateOutlet(tx, outletTbl, outlet, state, synced, true);
                }
                onSuccess();
            },
            function (dberr) {
                console.error(dberr);
                onError('Error while save outet to local database!');
            });
    });
}

function setSyncStatusDB(outletTbl, syncOutlets, synced, onSuccess, onError) {
    db.transaction(function (tx) {
        var isErr = false;
        var errMsg = '';
        try {
            var s = synced ? '1' : '0';
            for (var i in syncOutlets) {
                var outlet = syncOutlets[i];
                var sql = 'UPDATE ' + outletTbl
                        + ' SET ID = ' + outlet.ID.toString() + ','
                        + ' PSynced = ' + s +
                          ' WHERE PRowID = "' + outlet.RowID + '"';
                tx.executeSql(sql, [], function () { }, function (dberr) {
                    errMsg = dberr.message;
                    isErr = true;
                });
            }
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

//*****************************************************
function addOutletDB(outletTbl, outlet, synced, onSuccess, onError) {
    db.transaction(function (tx) {
        try {
            _addNewOutlet(tx, outletTbl, outlet, true, false, false, synced, false);
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
    selectNearByOutlets(outletTbl, latMin, latMax, lngMin, lngMax, view, null, onSuccess, onError);
}

function selectNearByOutlets(outletTbl, latMin, latMax, lngMin, lngMax, view, synced, onSuccess, onError) {
    db.transaction(function (tx) {
        log('Select outlets by view: ' + view.toString());
        var sql = 'SELECT * FROM [' + outletTbl + '] WHERE ' // WHERE provinceID = "' + provinceID + '" AND  ';

        if (view == 0) {
            var statusArr = [];
            statusArr.push(StatusInitial);
            statusArr.push(StatusPost);
            statusArr.push(StatusAuditAccept);
            statusArr.push(StatusAuditDeny);
            statusArr.push(StatusAuditorAccept);
            statusArr.push(StatusEdit);
            statusArr.push(StatusExitingPost);
            statusArr.push(StatusExitingDeny);
            statusArr.push(StatusExitingAccept);
            statusArr.push(StatusDone);
            statusArr.push(StatusDeny);
            statusArr.push(StatusRevert);

            sql = sql.concat('AuditStatus IN (', statusArr.join() ,') ');
            sql = sql.concat('OR ((AuditStatus=', StatusNew,' OR AuditStatus=', StatusAuditorNew, ') AND PersonID=', user.id , ')');
        } else if (view == 1) {
            if (user.hasAuditRole) {
                sql = sql.concat(' AuditStatus = ', StatusPost.toString());
                sql = sql.concat(' OR AuditStatus = ', StatusAuditAccept.toString());
                sql = sql.concat(' OR AuditStatus = ', StatusAuditDeny.toString());
                sql = sql.concat(' OR AuditStatus = ', StatusAuditorAccept.toString());
                sql = sql.concat(' OR (AuditStatus = ', StatusAuditorNew.toString(), ' AND PersonID = ', userID.toString(), ')');
            } else {
                sql = sql.concat('AuditStatus in ( ', StatusNew.toString(), ', ', StatusPost.toString(), ', ', StatusAuditAccept.toString(), ', ', StatusAuditDeny.toString(), ')');
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
        
        if (synced !== null) {
            sql = sql.concat(' AND PSynced = ', synced ? '1' : '0');
        }

        sql = sql.concat(' ORDER BY [ID]');

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
            if (outlet.modifiedImage4 && !isEmpty(outlet.StringImage4)) {
                uploadItems.push(insertImageUploadingInfo(tx, userID, outlet.ID, 4, outlet.StringImage4, now));
            }
            if (outlet.modifiedImage5 && !isEmpty(outlet.StringImage5)) {
                uploadItems.push(insertImageUploadingInfo(tx, userID, outlet.ID, 5, outlet.StringImage5, now));
            }
            if (outlet.modifiedImage6 && !isEmpty(outlet.StringImage6)) {
                uploadItems.push(insertImageUploadingInfo(tx, userID, outlet.ID, 6, outlet.StringImage6, now));
            }
            onSuccess(uploadItems);
        }catch(err){
            onError(err);
        }
    }, onError);
}

function selectAllUnsyncedOutlets(outletTbl, onSuccess, onError) {
    db.transaction(function (tx) {
        var sql = 'SELECT * FROM ' + outletTbl + ' WHERE PSynced = 0 ';
        logSqlCommand(sql);
        tx.executeSql(sql, [], function (tx1, dbres) {
            onSuccess(dbres);
        }, onError);
    }, onError);
}

function selectUnsyncedOutlets(outletTbl, onSuccess, onError) {
    db.transaction(function (tx) {
        var sql = 'SELECT * FROM ' + outletTbl + ' WHERE PSynced = 0 LIMIT ' + config.sync_batch_size.toString();
        logSqlCommand(sql);
        tx.executeSql(sql, [], function (tx1, dbres) {
            onSuccess(dbres);
        }, onError);
    }, onError);
}

function selectUnsyncedOutletsByView(outletTbl, view, onSuccess, onError) {
    db.transaction(function (tx) {
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
        var sql = 'SELECT * FROM ' + outletTbl + ' WHERE PSynced = 0 AND ProvinceID = " ' + provinceid + '"';
        logSqlCommand(sql);
        tx.executeSql(sql, [], function (tx1, dbres) {
            onSuccess(dbres);
        }, onError);
    }, onError);
}

function selectUnsyncedOutletsDB(outletTbl, onSuccess, onError) {
    db.transaction(function (tx) {
        var sql = 'SELECT * FROM [' + outletTbl + '] WHERE PSynced = 0';
        logSqlCommand(sql);
        tx.executeSql(sql, [], function (tx, dbres) {
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

function deleteDownloadProvincesDB(tablename, onSuccess, onError) {
    db.transaction(function (tx) {
        var sql = 'DELETE * FROM ' + tablename;
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
            p.download.toString() + ', ' +
            p.referenceGeoID.toString() + ')';
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

function selectUserOutletsDB(outletTbl, start, end, onSuccess, onError) {
    db.transaction(function (tx) {
        var sql = 'SELECT * FROM [' + outletTbl + '] WHERE AmendBy=' + userID.toString()
                + ' AND AuditStatus > 0 AND PLastModTS >= ' + start.toString() + ' AND PLastModTS <= ' + end.toString()
                + ' ORDER BY PLastModTS';

        logSqlCommand(sql);
        tx.executeSql(sql, [], function (tx, dbres) {
            onSuccess(dbres);
        }, onError);
    }, onError);
}

function searchOutletsDB(outletTbl, outletID, outletName, onSuccess, onError) {
    db.transaction(function (tx) {
        var sql = 'SELECT * FROM [' + outletTbl + '] WHERE ID = ' + outletID;

        var statusArr = [];
        statusArr.push(StatusInitial);
        statusArr.push(StatusPost);
        statusArr.push(StatusAuditAccept);
        statusArr.push(StatusAuditDeny);
        statusArr.push(StatusAuditorAccept);
        statusArr.push(StatusEdit);
        statusArr.push(StatusExitingPost);
        statusArr.push(StatusExitingDeny);
        statusArr.push(StatusExitingAccept);
        statusArr.push(StatusDone);
        statusArr.push(StatusDeny);
        statusArr.push(StatusRevert);

        sql = sql.concat(' AND (AuditStatus IN (', statusArr.join(), ') ');
        sql = sql.concat('OR ((AuditStatus=', StatusNew, ' OR AuditStatus=', StatusAuditorNew, ') AND PersonID=', user.id, '))');
        sql = sql.concat(' LIMIT 1');

        logSqlCommand(sql);
        tx.executeSql(sql, [], function (tx, dbres) {
            onSuccess(dbres);
        }, onError);
    }, onError);
}

function getProvinceDataDB(callback) {
    db.transaction(function(tx) {
            var sql = "SELECT * FROM [" + config.tbl_downloadProvince + "]";
            logSqlCommand(sql);
            tx.executeSql(sql,
                [],
                function(tx, dbres) {
                    callback(dbres);
                },
                function () {
                    callback();
                });
        },
        function() {
            callback();
        });
}
