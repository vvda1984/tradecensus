var journals = {
    _lastUpdateTS: null,
    _lastSyncedTS: null,

    _newJournal: function () {
        if (journals._map) {
            journals._newJournalPolyline;
            journals._appendPolyline();
        }

        return {
            journalId : '',
            journalDate: utils.nowDate(),
            id: 0,
            personId: user.id,
            startTS: utils.nowDatetime(),
            endTS: utils.nowDatetime(),
            data: curlat.toString() + ',' + curlng.toString(),
            line: [{ lat: curlat, lng: curlng }],
        };
    },

    _newJournalPolyline: function (line) {
        journals._polyline = new google.maps.Polyline({
            strokeColor: '#00551E',
            strokeOpacity: 1.0,
            strokeWeight: 3
        });
        journals._polyline.setMap(journals._map);

        if (line && line.length > 0) {
            for (var coor_i = 0; coor_i < line.length; coor_i++) {
                var coor = line[coor_i];
                var path = journals._polyline.getPath();
                path.push(new google.maps.LatLng(coor.lat, coor.lng));
            }
        }
    },

    _appendPolyline: function () {
        if (journals._polyline) {
            var path = journals._polyline.getPath();
            path.push(new google.maps.LatLng(curlat, curlng));
        }
    },

    _updateJournal: function (tx, journal, status, callback) {
        var sql = 'UPDATE ' + journals.tableName + ' SET ';
        sql = sql.concat('id=', journal.id, ', ');
        sql = sql.concat('startTS="', journal.startTS, '", ');
        sql = sql.concat('endTS="', journal.endTS, '", ');
        sql = sql.concat('data="', journal.data, '", ');
        sql = sql.concat('jounalDate="', journal.jounalDate, '", ');
        sql = sql.concat('status=', status, ' ');
        sql = sql.concat('WHERE journalId = "', journal.journalId, '"');

        logSqlCommand(sql);
        tx.executeSql(sql, [],
            function (tx1) {
                callback();
            },
            function (tx1, dberr) {
                callback(dberr.message);
            });
    },

    _addJournal: function (tx, journal, status, callback) {
        journal.journalId = utils.newGUID();

        var sql = 'INSERT INTO ' + journals.tableName + ' VALUES (';        
        sql = sql.concat('"', journal.journalId, '", ');
        sql = sql.concat('"', journal.journalDate, '", ');
        sql = sql.concat(journal.id, ',');
        sql = sql.concat('"', journal.startTS, '", ');
        sql = sql.concat('"', journal.endTS, '", ');
        sql = sql.concat('"', journal.data, '", ');
        sql = sql.concat(status, ')');
        logSqlCommand(sql);
        tx.executeSql(sql, [],
            function (tx1) {
                callback();
            },
            function (tx1, dberr) {
                callback(dberr.message);
            });
    },

    _track: function (callback) {
        var now = new Date();
        var difSecond = utils.getTimeSpanInSecond(journals._lastUpdateTS, now);
        if (difSecond < config.ping_time) {
            callback(); 
            return; // END
        }

        journals._lastUpdateTS = now;
        if (config.enable_journal) {
            var curDate = utils.nowDate();
            if (journals.current.journalDate === curDate) {                
                journals.current.data += ',' + curlat.toString() + ',' + curlng.toString();
                journals.current.line.push({ lat: curlat, lng: curlng });
                journals.current.endTS = utils.nowDatetime();
                journals._appendPolyline();
            } else {
                journals.current = journals._newJournal();
            }

            if (journals._submit) {
                journals._submit(journals.current, function (isSucceded) {    
                    var status = isSucceded ? journals.statusEnum.synced : journals.statusEnum.unsynced;
                    if (journals.current.journalId === '') {
                        journals.newJournal(journals.current, status, function (errMsg) {
                            utils.writeLog(errMsg);
                            callback();
                        });
                    } else {
                        journals.updateJournal(journals.current, status, function (errMsg) {
                            utils.writeLog(errMsg);
                            callback();
                        });
                    }
                });
            } else
                callback();
        }
        else
            callback();        
    },

    _startTrackJournalTimer : function(){       
        setTimeout(function () {
            journals._track(function () {
                journals._startTrackJournalTimer();
            });
        }, config.journal_update_time * 1000);
    },

    _submit: null,
    _sync: null,
    _polyline : null,
    _map: null,
    database: null,
    tableName: '',
    current: null,
   
    statusEnum : { 
        synced : 0,
        unsynced : 1,
    },
   
    createTable: function (dbtran, callback) {
        log('ensure table [' + journals.tableName + '] exist');
        var sql = ('CREATE TABLE IF NOT EXISTS [' + journals.tableName + '](' +
                    '[journalId] text PRIMARY KEY, ' +
                    '[jounalDate] text NOT NULL, ' +
	                '[id] int NOT NULL, ' +
                    '[startTS] text NOT NULL, ' +
                    '[endTS] text NOT NULL,	' +
                    '[data] text NOT NULL, ' +
	                '[status] int NOT NULL)');
        logSqlCommand(sql);
        dbtran.executeSql(sql, [], function (tx1) {
            callback();
        }, function (dberr) {
            log(dberr.message);
            callback();
        });
        //callback();
    },

    newJournal: function (journal, status, callback) {       
        db.transaction(function (tx) {
            journals._addJournal(tx, journal, status, callback);
        });
    },

    updateJournal: function (journal, status, callback) {       
        db.transaction(function (tx) {
            journals._updateJournal(tx, journal, status, callback);         
        });
    },    

    setMap : function(map){
        journals._map = map;
        if (!journals._polyline) {
            journals._newJournalPolyline(journals.current ? journals.current.line : null);
        }
    },
    
    start: function (submit, sync) {        
        journals.current = journals._newJournal();
        journals._submit = submit;
        journals._sync = sync;
        journals._startTrackJournalTimer();

        //db.transaction(function (tx) {
        //    //var curDate = utils.nowDate();
        //    //var sql = 'SELECT * FROM ' + journals.tableName + ' WHERE jounalDate = "' + curDate + '"';
        //    //logSqlCommand(sql);
        //    //tx.executeSql(sql, [],
        //    //    function (tx, dbres) { // SUCCESS
        //    //        if (dbres.rows.length === 0) {
        //    //            journals.current = journals.newJournal();
        //    //            journals._addJournal(tx.journals.current, journals.statusEnum.synced, callback);
        //    //        } else {
        //    //            journals.current = dbres.rows.item(0);
        //    //        }
        //    //    }, function (tx, dberr) { // ERROR
        //    //        journals.current = journals.newJournal();
        //    //        journals._addJournal(tx.journals.current, journals.statusEnum.synced, callback);
        //    //    });
        //});
    },

    trackJournal: function () {       
        journals._track(function () { utils.writeLog('Tracked current location to journal'); });
    },

    syncJournal: function () {
        if (!journals._sync) {
            return; // END
        }

        var now = new Date();
        var difSecond = utils.getTimeSpanInSecond(journals._lastSyncedTS, now);
        if (difSecond < config.ping_time) {            
            return; // END
        }
        journals._lastSyncedTS = now;

        journals.database.transaction(function (tx) {            
            var sql = 'SELECT * FROM ' + journals.tableName + ' WHERE status = ' + journals.statusEnum.unsynced.toString();
            logSqlCommand(sql);
            tx.executeSql(sql, [], function (tx, dbres) {
                utils.writeLog('Found unsynced journals: ' + dbres.rows.length.toString());
                if (dbres.rows.length > 0) {                    
                    var unsyncedItems = [];
                    for (var i = 0; i < dbres.rows.length; i++) {
                        var unsyncedItem = dbres.rows.item(i);
                        if (unsyncedItem.journalDate)
                            unsyncedItems[i] = unsyncedItem;
                    }
                    journals._sync(unsyncedItems, function (isSucceeded, items) {
                        if (isSucceeded) {
                            for (var i = 0; i < items; i++) {
                                var item = items[i];
                                var updateSql =
                                    'UPDATE ' + journals.tableName + ' SET ' +
                                    'id = ' + item.id.toString() + ', ' +
                                    'status = ' + journals.statusEnum.synced.toString() + ' ' +
                                    'WHERE journalId = "' + item.journalId + '"';
                                logSqlCommand(updateSql);
                                tx.executeSql(updateSql, [], function () { }, function (dberr) {
                                    utils.writeLog(dberr.message);
                                });
                            }
                        }
                    });
                }
                
            }, function (tx, dberr) {
                utils.writeLog(dberr.message);
            });
        });
    },
};