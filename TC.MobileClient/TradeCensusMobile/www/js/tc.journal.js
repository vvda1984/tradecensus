var journals = {
    _lastUpdateTS: null,
    _lastSyncedTS: null,
    _lastSubmittedTS: null,
    _expiredLines: [],
    _colors: [],

    _newJournal: function () {
        if (journals._map) {
            //if (journals._polyline) {
            //    if(!config.journal_nonstop) journals._newJournalPolyline();
            //}
            //else {
            //    journals._newJournalPolyline();
            //}
            journals._newJournalPolyline();
            journals._appendPolyline();
        }

        return {
            journalId : '',
            journalDate: tcutils.nowDate(),
            id: 0,
            personId: user.id,
            startTS: tcutils.nowDatetime(),
            endTS: tcutils.nowDatetime(),
            data: curlng.toString() + ',' + curlat.toString(),
            line: [{ lat: curlat, lng: curlng }],
        };
    },

    _newJournalPolyline: function (line) {
        if (journals._polyline)
            journals._expiredLines.push(journals._polyline);

        journals._polyline = new google.maps.Polyline({
            geodesic: true,
            strokeColor: config.journal_color,
            strokeOpacity: config.journal_opacity,
            strokeWeight: config.journal_weight,
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
        sql = sql.concat('journalDate="', journal.journalDate, '", ');
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
        journal.journalId = tcutils.newGUID();

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

    _canUpdate : function (now){
        var difSecond = tcutils.getTimeSpanInSecond(journals._lastUpdateTS, now);
        if (difSecond < config.journal_refresh_time) {
            return false;
        }
        journals._lastUpdateTS = now;
        return true;
    },

    _canSubmit: function (now) {
        var difSecond = tcutils.getTimeSpanInSecond(journals._lastSubmittedTS, now);
        if (difSecond < config.journal_submit_time) {
            return false;
        }
        journals._lastSubmittedTS = now;
        return true;
    },

    _saveToServer : function(callback){
        if (journals._submit) {
            if (journals._canSubmit(new Date())) {
                journals._submit(journals.current, function (isSucceded) {
                    var status = isSucceded ? journals.statusEnum.synced : journals.statusEnum.unsynced;
                    if (journals.current.journalId === '') {
                        journals.newJournal(journals.current, status, function (errMsg) {
                            if (errMsg) tcutils.logging.error(errMsg);
                            callback();
                        });
                    } else {
                        journals.updateJournal(journals.current, status, function (errMsg) {
                            if (errMsg) tcutils.logging.error(errMsg);
                            callback();
                        });
                    }
                });
            } else {
                var status = journals.statusEnum.unsynced;
                if (journals.current.journalId === '') {
                    journals.newJournal(journals.current, status, function (errMsg) {
                        if (errMsg) tcutils.logging.error(errMsg);
                        callback();
                    });
                } else {
                    journals.updateJournal(journals.current, status, function (errMsg) {
                        if (errMsg) tcutils.logging.error(errMsg);
                        callback();
                    });
                }
            }
        } else
            callback();
    },

    _track: function (callback) {
        if (journals.current == null) return;
        var now = new Date();
        if (!journals._canUpdate(now)) {
            callback();
            return;//END
        }

        tcutils.logging.info('Track journal (' + curlat.toString() + ', ' + curlng.toString() + ')');

        if (journals.isTracking) {
            var curDate = tcutils.nowDate();
            if (journals.current.journalDate === curDate) {                
                journals.current.data += ',' + curlng.toString() + ',' + curlat.toString();
                journals.current.line.push({ lat: curlat, lng: curlng });
                journals.current.endTS = tcutils.nowDatetime();
                journals._appendPolyline();
                journals._saveToServer(callback);
            } else {
                journals.current = journals._newJournal();
                callback();
            }
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

    _clearPolyines : function(){
        for (var i = 0; i < journals._historyPolyines.length; i++) {
            var line = journals._historyPolyines[i];
            line.polyline.setMap(null);
        }
        journals._historyPolyines = [];

        for (var i = 0; i < journals._expiredLines.length; i++) {
            var line = journals._expiredLines[i];
            line.setMap(null);
        }
        journals._expiredLines = [];
    },

    _getColor: function (i) {
        var color = '';
        if (i < journals._colors.length) {
            color = journals._colors[i];
        } else {
            color = tcutils.randomColor();
            journals._colors.push(color);
        }

        while (color === config.journal_color) {
            color = tcutils.randomColor();
        }
        return color
    },

    _submit: null,
    _sync: null,
    _query:null,
    _polyline : null,
    _map: null,
    _historyPolyines: [],

    database: null,
    tableName: '',
    current: null,
    isTracking: false,
    lastTrackedLat: 0,
    lastTrackedLng: 0,
   
    statusEnum : { 
        synced : 0,
        unsynced : 1,
    },
  
    createTable: function (dbtran, callback) {
        log('ensure table [' + journals.tableName + '] exist');
        var sql = ('CREATE TABLE IF NOT EXISTS [' + journals.tableName + '](' +
                    '[journalId] text PRIMARY KEY, ' +
                    '[journalDate] text NOT NULL, ' +
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
        //if (!journals._polyline) {
        //    journals._newJournalPolyline(journals.current ? journals.current.line : null);
        //}
    },
    
    initialize: function (submit, sync, query) {        
        journals._submit = submit;
        journals._sync = sync;
        journals._query = query;
        //journals._startTrackJournalTimer();
    },

    start: function () {
        tcutils.logging.info('Start tracking journal');
        journals.isTracking = true;
        journals.current = journals._newJournal();
    },

    end: function () {
        tcutils.logging.info('Stop tracking journal');
        journals._saveToServer(function () {
            journals.current = null;
            if (journals._polyline) {
                journals._expiredLines.push(journals._polyline);
                journals._polyline = null;
            }
        });
    },

    trackJournal: function (newLat, newLng, acc) {
        if (!journals.isTracking) return;
        if (journals.validateNewLocation(newLat, newLng, acc))
            journals._track(function () { tcutils.logging.debug('Tracked current location to journal'); });
    },

    syncJournal: function () {
        if (!journals._sync) {
            return; // END
        }

        var now = new Date();
        var difSecond = tcutils.getTimeSpanInSecond(journals._lastSyncedTS, now);
        if (difSecond < config.journal_refresh_time) {
            return; // END
        }
        journals._lastSyncedTS = now;

        journals.database.transaction(function (tx) {            
            var sql = 'SELECT * FROM ' + journals.tableName + ' WHERE status = ' + journals.statusEnum.unsynced.toString();
            logSqlCommand(sql);
            tx.executeSql(sql, [], function (tx, dbres) {
                tcutils.logging.debug('Found unsynced journals: ' + dbres.rows.length.toString());
                if (dbres.rows.length > 0) {
                    var unsyncedItems = [];
                    var index = 0;
                    for (var i = 0; i < dbres.rows.length; i++) {
                        var item = dbres.rows.item(i);
                        if (item.journalDate != null && item.journalDate != undefined)
                            unsyncedItems[index++] = item;
                    }

                    if (unsyncedItems.length == 0) return; //END

                    tcutils.logging.info("Syncing journals...");
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
                                    tcutils.logging.debug(dberr.message);
                                });
                            }
                        }
                    });
                }
                
            }, function (tx, dberr) {
                tcutils.logging.error(dberr.message);
            });
        });
    },

    viewJournalHistory: function (dateFrom, dateTo) {
        if (journals._query) {
            if (dateFrom > dateTo) {
                tcutils.messageBox.error("Date range is invalid!");
                return;
            }

            journals._query(tcutils.formatDate(dateFrom), tcutils.formatDate(dateTo), function (isSucceeded, items) {
                if (isSucceeded) {
                    journals._clearPolyines();
                    var colorIndex = 0;
                    if (items.length > 0) {
                        for (var i = 0; i < items.length; i++) {
                            var journalDate = items[i];
                            
                            var color = journals._getColor(colorIndex++);

                            for (var j = 0; j < journalDate.journals.length; j++) {
                                var journal = journalDate.journals[j];
                                var coorArr = JSON.parse(journal.data);

                                var lineColor = color;
                                if (!config.journal_daily_mode) {
                                    lineColor = journals._getColor(colorIndex++);
                                }

                                var ggline = new google.maps.Polyline({
                                    path: coorArr,
                                    geodesic: true,
                                    fillOpacity: 0,
                                    strokeColor: lineColor,                                  
                                    strokeOpacity: config.journal_opacity,
                                    strokeWeight: config.journal_weight,
                                });

                                ggline.setMap(journals._map);

                                var line = {
                                    date: journalDate.date,
                                    polyline: ggline,
                                };
                                journals._historyPolyines.push(line);
                            }
                        }
                    } else
                        tcutils.messageBox.info("No journals for selected date(s)!");
                }
            });
        }
    },

    clearJournalHistory: function () {
        journals._clearPolyines();
        tcutils.messageBox.info('Clear journal histories');
    },

    validateNewLocation: function (newLat, newLng, acc) {
        if (acc > config.journal_accuracy) {
            tcutils.logging.info('Ingore new location > accuracy is too high.');
            return false;
        }

        var distance = tcutils.locations.calculateDistance(newLat, newLng, journals.lastTrackedLat, journals.lastTrackedLng);
        if (distance >= config.journal_distance) {
            journals.lastTrackedLat = newLat;
            journals.lastTrackedLng = newLng;
            return true;
        }
        return false;
    },
};