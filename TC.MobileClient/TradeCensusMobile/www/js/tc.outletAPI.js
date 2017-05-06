/// <reference path="tc.databaseAPI.js" />

const StatusInitial = 0;

const StatusNew = 10;
const StatusPost = 11;
const StatusAuditAccept = 12;
const StatusAuditDeny = 13;
const StatusAuditorNew = 14;
const StatusAuditorAccept = 15;

const StatusEdit = 30;
const StatusExitingPost = 31;
const StatusExitingAccept = 32;
const StatusExitingDeny = 33;

const StatusDone = 40;

const StatusDelete = 100;
const StatusRevert = 102;

var nearByOutlets = [];
var curOutlets = [];
var firstStart = true;
var openOutletDlg = false;


function newOutlet(provinceName) {
    //var provineName  = '';
	//log('province id: ' + config.province_id);
    //for (p = 0; p < provinces.length; p++)
    //    if (provinces[p].id === config.province_id) {
    //        provinceName = provinces[p].name;
    //        break;
    //    }
    //log('provineName: ' + provineName);
    var provinceId = config.province_id;
    if (isEmpty(provinceName)) {
        for (p = 0; p < provinces.length; p++)
            if (provinces[p].id === config.province_id) {
                provinceName = provinces[p].name;
                break;
            }
    } else {
        for (p = 0; p < provinces.length; p++)
            if (provinces[p].name === provinceName) {
                provineId = provinces[p].id;
                break;
            }
    }

    return {
        Action: 0,
        AddLine: '',
        AddLine2: '',
        AmendBy: user.id,
        AmendDate: "",
        AreaID: user.areaID,
        AuditStatus: StatusNew,
        CloseDate: "",
        CreateDate: "",
        Distance: 0,
        District: '',
        FullAddress: "",
        ID: 600000000,
        InputBy: user.id,
        IsOpened: true,
        IsTracked: false,
        LastContact: "",
        LastVisit: "",
        Latitude: curlat,
        Longitude: curlng,
        Name: "",
        Note: '',
        OTypeID: outletTypes[0].ID,
        OutletEmail: null,
        OutletSource: (user.isDSM) ? 1 : 0,
        OutletTypeName: outletTypes[0].Name,
        PRowID: guid(),
        PersonID: user.id,
        Phone: "",
        ProvinceID: provinceId,
        ProvinceName: provinceName,
        StringImage1: "",
        StringImage2: "",
        StringImage3: "",
        StringImage4: "",
        StringImage5: "",
        StringImage6: "",
        TotalVolume: 0,
        Tracking: 0,
        VBLVolume: 0,
        IsDraft: true,
        IsNew: true,
        ExtractName: '',
        PersonFirstName: user.firstName,
        PersonLastName: user.lastName,
        auditResult: '',
        viewAuditStatus: false,
        marker: null,
        PStatus: 0,
        AmendByRole: user.role,
        InputByRole: user.role,
        Class: "M",
        SpShift: 0,
        CallRate: _callRates[0].ID,
        IsSent: 0,
        TerritoryID: "2",
        TaxID: "",
        LegalName: "",
    };
}

function initializeOutlet(outlet) {
    if (outlet.ProvinceName == null || isEmpty(outlet.ProvinceName)) {
        var provinceName = '';
        for (p = 0; p < provinces.length; p++)
            if (provinces[p].ID === outlet.ProvinceID) {
                provinceName = provinces[p].Name;
                break;
            }
        outlet.ProvinceName = provinceName;
    }

    if (outlet.OutletTypeName == null || isEmpty(outlet.OutletTypeName)) {
        var outletTypeName = '';
        for (p = 0; p < outletTypes.length; p++)
            if (outletTypes[p].ID === outlet.OTypeID) {
                outletTypeName = outletTypes[p].Name;
                break;
            }
        outlet.OutletTypeName = outletTypeName;
    }

    if (outlet.CallRateName == null || isEmpty(outlet.CallRateName)) {
        var callRateName = '';
        for (var c = 0; c < _callRates.length; c++)
            if (_callRates[c].ID === outlet.CallRate) {
                callRateName = _callRates[c].Name;
                break;
            }
        outlet.CallRateName = callRateName;
    }

    if (outlet.Distance == null)
        outlet.Distance = 0;

    //if (outlet.FullAddress == null || isEmpty(outlet.FullAddress))
    var fullAddress = '';
    if (outlet.AddLine == null) outlet.AddLine = '';
    if (outlet.AddLine2 == null) outlet.AddLine2 = '';
    if (outlet.Ward == null) outlet.Ward = '';
    if (outlet.District == null) outlet.District = '';
    if (outlet.ProvinceName == null) outlet.ProvinceName = '';
    if (outlet.PersonFirstName == null) outlet.PersonFirstName = '';
    if (outlet.PersonLastName == null) outlet.PersonLastName = '';

    outlet.FullAddress = outlet.AddLine + ' ' + outlet.AddLine2; // + ', ' + outlet.District + ', ' + outlet.ProvinceName;
    if (outlet.Ward !== '') outlet.FullAddress += ', ' + outlet.Ward;
    if (outlet.District !== '') outlet.FullAddress += ', ' + outlet.District;
    if (outlet.ProvinceName !== '') outlet.FullAddress += ', ' + outlet.ProvinceName;

    var exname = '';
    if (outlet.PersonFirstName) {
        exname = exname.concat(outlet.PersonFirstName, ' ');
    }
    if (outlet.PersonLastName) {
        exname = exname.concat(outlet.PersonLastName, ' ');
    }    
    exname = exname.trim();

    if (exname != '') {
        exname = exname.concat(' (', outlet.PersonID.toString(), ')');
    } 

    if (isEmpty(outlet.Note)) outlet.Note = '';
    if (isEmpty(outlet.LastVisit)) outlet.LastVisit = '';
    if (isEmpty(outlet.CloseDate)) outlet.CloseDate = '';

    outlet.ExtractName = exname;
    outlet.IsSynced = (outlet.PSynced) && (outlet.PSynced == 1);
    outlet.IsOpened = isEmpty(outlet.CloseDate);
    outlet.IsTracked = outlet.Tracking == 1;      
    outlet.IsAuditApproved = outlet.AuditStatus == 1;
    outlet.IsNew = outlet.AuditStatus == StatusNew || outlet.AuditStatus == StatusPost ||
                   outlet.AuditStatus == StatusAuditAccept || outlet.AuditStatus == StatusAuditDeny ||
                   outlet.AuditStatus == StatusAuditorNew || outlet.AuditStatus == StatusAuditorAccept;
    outlet.IsDenied = outlet.AuditStatus == StatusAuditDeny || outlet.AuditStatus == StatusExitingDeny;
    outlet.IsDraft = outlet.AuditStatus == StatusNew || outlet.AuditStatus == StatusAuditorNew;
    outlet.canDelete = (outlet.AuditStatus == StatusNew || outlet.AuditStatus == StatusAuditorNew) && outlet.PersonID == user.id;
    outlet.canRevert = false; //outlet.AuditStatus == StatusEdit && outlet.AmendBy == user.id;
    outlet.IsExistingDraft = outlet.AuditStatus == StatusEdit;
    outlet.canPost = !user.hasAuditRole && ((outlet.AuditStatus == StatusNew && outlet.PersonID == user.id ) || (outlet.AuditStatus == StatusEdit && outlet.AmendBy == user.id));
    outlet.canApprove = outlet.AuditStatus == StatusAuditorNew && outlet.PersonID == userID;
    //if (networkReady()) {
    //    outlet.canRevise = outlet.AuditStatus == StatusPost && outlet.PersonID == userID;
    //} else {
    //    outlet.canRevise = outlet.AuditStatus == StatusPost && outlet.PersonID == userID && !outlet.IsSynced;
    //}
    outlet.canRevise = !user.hasAuditRole && ((outlet.AuditStatus == StatusPost && outlet.PersonID == userID) ||
                       (outlet.AuditStatus == StatusExitingPost && outlet.AmendBy == userID));
 
    outlet.hasMarker = false;

    if (outlet.AuditStatus == StatusAuditAccept || outlet.AuditStatus == StatusExitingAccept || outlet.AuditStatus == StatusAuditorAccept) {
        outlet.IsAudited = true;
        outlet.auditResult = 'Approved',
        outlet.viewAuditStatus = true;
    } else if (outlet.AuditStatus == StatusAuditDeny || outlet.AuditStatus == StatusExitingDeny) {
        outlet.IsAudited = false;
        outlet.auditResult = 'Denied',
        outlet.viewAuditStatus = true;
    }

    if (outlet.ID == 60000000)
        outlet.IDalias = '';
    else
        outlet.IDalias = '(' + outlet.ID.toString() + ')';
}

function queryOutlets(isbackground, view, callback) {
    try {
        meter = config.distance;
        count = config.item_count;
        var saleLoc = { Lat: curlat, Lng: curlng };
        var tl = calcRetangleBoundary(meter, 0 - meter, saleLoc);
        var tr = calcRetangleBoundary(meter, meter, saleLoc);
        var bl = calcRetangleBoundary(0 - meter, 0 - meter, saleLoc);
        var br = calcRetangleBoundary(0 - meter, meter, saleLoc);

        selectOutletsDB(config.tbl_outlet, bl.Lat, tl.Lat, bl.Lng, br.Lng, view, //config.province_id,
            function (dbres) {
                var rowLen = dbres.rows.length;
                log('Found outlets: ' + rowLen.toString());
                if (rowLen) {
                    var found = 0;
                    var queryOutlets = [];
                    var foundOutlets = [];
                    for (i = 0; i < rowLen; i++) {
                        var outlet = dbres.rows.item(i);
                        outlet.Distance = calcDistance(saleLoc, { Lat: outlet.Latitude, Lng: outlet.Longitude });
                        log('Distance from outlet ' + outlet.ID.toString() + ": " + outlet.Distance.toString());
                        queryOutlets[i] = outlet;
                    }
                    queryOutlets.sort(function (a, b) { return a.Distance - b.Distance });

                    for (i = 0; i < queryOutlets.length && i < count; i++) {
                        var isMatched = true;
                        if (config.calc_distance_algorithm == "circle")
                            isMatched = queryOutlets[i].Distance <= meter;

                        if (isMatched) {
                            var outlet = queryOutlets[i];
                            log('Found outlet: ' + outlet.ID.toString());
                            
                            initializeOutlet(outlet);
                            outlet.positionIndex = found;
                            foundOutlets[found] = outlet;
                            found++;
                        }
                    }

                    //var foundOutlets = [];
                    //var found = 0;
                    //for (i = 0; i < rowLen; i++) {
                    //    var outlet = dbres.rows.item(i);
                    //    if (outlet.Name == 'Aaaa') {
                    //        log('');
                    //    }
                    //    var distance = 10000000;
                    //    if (config.calc_distance_algorithm == "circle")
                    //        distance = calcDistance(saleLoc, { Lat: outlet.Latitude, Lng: outlet.Longitude });
                    //    log('Distance to Outlet ' + outlet.ID.toString() + ': ' + distance.toString());
                    //    if (distance <= meter) {
                    //        outlet.Distance = distance;
                    //        log('Add outlet ' + outlet.ID.toString() + ' to list');
                    //        initializeOutlet(outlet);
                    //        outlet.positionIndex = foundOutlets.length;
                    //        log('Set ' + outlet.Name + ': ' + outlet.positionIndex.toString());                            
                    //        foundOutlets[found] = outlet;
                    //        found++;
                    //    }
                    //    if (found >= count) break;
                    //}
                    //foundOutlets.sort(function (a, b) { return a.Distance - b.Distance; });
                    callback(true, foundOutlets);
                } else {
                    callback(true, []);
                }
            }, function (dberr) {
                rendringOutlets = false;
                showError(dberr.message);
                callback(false, null);
            });
    } catch (err) {
        log(err);        
        showError(err.message);
        callback(false, null);
    }
}

function queryNearbyOutlets(callback) {  
    meter = config.distance;
    count = config.item_count;
    log('item count:' + count.toString());
    var saleLoc = { Lat: curlat, Lng: curlng };
    var tl = calcRetangleBoundary(meter, 0 - meter, saleLoc);
    var tr = calcRetangleBoundary(meter, meter, saleLoc);
    var bl = calcRetangleBoundary(0 - meter, 0 - meter, saleLoc);
    var br = calcRetangleBoundary(0 - meter, meter, saleLoc);
    log('Select outlets in range ' + config.distance.toString());
    selectOutletsInRangeDB(config.tbl_outlet, bl.Lat, tl.Lat, bl.Lng, br.Lng,
        function (dbres) {
            var rowLen = dbres.rows.length;
            log('Found outlets: ' + rowLen.toString());
            nearByOutlets = [];
            if (rowLen) {
                var found = 0;    
                var foundOutlets = [];            
                for (i = 0; i < rowLen; i++) {
                    var outlet = dbres.rows.item(i);                    
                    outlet.Distance = calcDistance(saleLoc, { Lat: outlet.Latitude, Lng: outlet.Longitude });
                    log('Distance from outlet ' + outlet.ID.toString() + ": " + outlet.Distance.toString());
                    foundOutlets[i] = outlet;
                }
                foundOutlets.sort(function (a, b) { return a.Distance - b.Distance });

                for (i = 0; i < foundOutlets.length && i <= count; i++) {                    
                    var isMatched = true; 
                    if (config.calc_distance_algorithm == "circle")
                        isMatched = foundOutlets[i].Distance <= meter;
                    
                    if(isMatched){                        
                        log('Found outlet: ' + outlet.ID.toString());
                        initializeOutlet(foundOutlets[i]);                        
                        nearByOutlets[i] = foundOutlets[i];
                    }                
                }
                
                callback(nearByOutlets);
            } else {
                callback([]);
            }            
        }, function (dberr) {            
            showError(dberr.message);
        });
}

function isModified(orgOutlet, outlet) {
    if (orgOutlet.Name !== outlet.Name) return true;

    if (orgOutlet.Phone !== outlet.Phone) return true;

    if (orgOutlet.OTypeID !== outlet.OTypeID) return true;

    if (orgOutlet.AddLine !== outlet.AddLine) return true;

    if (orgOutlet.AddLine2 !== outlet.AddLine2) return true;

    if (orgOutlet.District !== outlet.District) return true;

    if (orgOutlet.ProvinceID !== outlet.ProvinceID) return true;

    if (orgOutlet.TotalVolume !== outlet.TotalVolume) return true;

    if (orgOutlet.VBLVolume !== outlet.VBLVolume) return true;

    if (orgOutlet.Note !== outlet.Note) return true;

    if (orgOutlet.StringImage1 !== outlet.StringImage1) return true;

    if (orgOutlet.StringImage2 !== outlet.StringImage2) return true;

    if (orgOutlet.StringImage3 !== outlet.StringImage3) return true;

    if (orgOutlet.StringImage4 !== outlet.StringImage4) return true;

    if (orgOutlet.StringImage5 !== outlet.StringImage5) return true;

    if (orgOutlet.StringImage6 !== outlet.StringImage6) return true;

    if (orgOutlet.IsTracked !== outlet.IsTracked) return true;

    return false;
}

function _submitOutletToServer(nghttp, outlet, callback) {
    if (!networkReady()) {
        callback(false);
    }
    else {
        var url = baseURL + '/outlet/save/' + userID + '/' + pass;
        console.log('CALL API: ' + url);
        nghttp({
            method: config.http_method,
            data: outlet,
            url: url,
            headers: { 'Content-Type': 'application/json' }
        }).then(function (resp) {
            log(resp);
            var data = resp.data;
            if (data.Status == -1) { // error
                handleError(data.ErrorMessage);
            } else {
                console.info('Submit outlet successfully: ' + data.ID + '(' + data.RowID + ')');
                outlet.PRowID = data.RowID;
                callback(true);
            }
        }, function (err) {
            log('Submit error');
            log(err);
            callback(false);
        });
    }
};


//#region CREATE NEW OUTLET
var __outletDialogContext = {
    currentOutlet: {},
    callback: null,
};

function __resetOutletDialogContext() {
    
};

function __detroyOutletDialog() {
    try {
        var mark = $('.md-scroll-mask');
        if (typeof mark !== 'undefined') {
            mark.remove();           
        }

        var dlg = $('.md-dialog-container');        
        if (typeof dlg !== 'undefined') {
            dlg.remove();
        }

        var backdrop = $('._md-dialog-backdrop');
        if (typeof backdrop !== 'undefined') {
            backdrop.remove();
        }

        var backdrop1 = $('.md-dialog-backdrop');
        if (typeof backdrop1 !== 'undefined') {
            backdrop1.remove();
        }
    } catch (er) {
        console.error(er);
    }
};

var OUTLET_NEW = 0;
var OUTLET_EDIT = 1;
var OUTLET_DELETE = 2;

var OUTLET = {
    dialog: {
        open: function (ngmdOpenDlg, outlet, callback) {
            __outletDialogContext.callback = callback;
            __outletDialogContext.currentOutlet = outlet;

            ngmdOpenDlg();
        },

        close: function (anwser, outlet) {
            if (typeof outlet !== 'undefined') {
                __outletDialogContext.currentOutlet = outlet;
            }
            isOutletDlgOpen = false;
            __detroyOutletDialog();

            if (dialogClosedCallback) dialogClosedCallback();

            if (anwser === true) {
                __outletDialogContext.callback(anwser, __outletDialogContext.currentOutlet);
            } else {
                __outletDialogContext.callback = null;
                __outletDialogContext.ngcontext = {};
                __outletDialogContext.currentOutlet = {};
            }
        },

        outlet: function () { return __outletDialogContext.currentOutlet; },

        setCurrentOutlet: function (outlet) { __outletDialogContext.currentOutlet = outlet; },
    },

    lastSync: new Date(),
  
    saveOutletToServer: function (nghttp, outlet, action, state, callback) {
        dialogUtils.showClosableDlg(R.save_outlet, R.please_wait, function (hideLoadingFunc, isCancelledFunc) {
            try {
                var onSuccess = function () {
                    if (networkReady()) {
                        OUTLET.lastSync = new Date();
                        OUTLET.syncOutlets(nghttp, function (errMsg) {
                            if (isCancelledFunc()) return;
                            hideLoadingFunc();

                            if (errMsg)
                                showError(errMsg);
                            else
                                callback();
                        });
                    }
                    else {
                        if (isCancelledFunc()) return;
                        hideLoadingFunc();
                        callback();
                    }
                };
                var onError = function () {
                    if (isCancelledFunc()) return;
                    hideLoadingFunc();
                    showError('Cannot save outlet, please check network connection and retry! (#12001)');
                };

                if (action == OUTLET_NEW) {
                    addOutletDB(config.tbl_outlet, outlet, false, onSuccess, onError);
                } else if (action == OUTLET_EDIT) {
                    saveOutletDB(config.tbl_outlet, outlet, state, false, onSuccess, onError);
                } else {
                    OUTLET.submitOutlet(nghttp, outlet, function (errMsg) {
                        if (errMsg) {
                            saveOutletDB(config.tbl_outlet, outlet, state, false,
                                function () {
                                    hideLoadingFunc();
                                    callback();
                                }, onError);
                        } else {
                            deleteOutletDB(config.tbl_outlet, outlet,
                                function () {
                                    hideLoadingFunc();
                                    callback();
                                }, onError);
                        }
                    });
                }
            } catch (err) {
                if (isCancelledFunc()) return;
                hideLoadingFunc();
                showError('Cannot save outlet, please check network connection and retry! (#12001)');
            }
        });
    },

    saveOutlet: function (nghttp, outlet, action, state, callback) {
        dialogUtils.showClosableDlg(R.save_outlet, R.please_wait, function (hideLoadingFunc, isCancelledFunc) {
            try {
                var onSuccess = function () {
                    if (networkReady()) {
                        var now = new Date();
                        var dif = getDifTime(OUTLET.lastSync, now);
                        if (dif > config.submit_outlet_time) {
                            OUTLET.lastSync = now;

                            dialogUtils.setClosableDlgContent(R.synchronize_outlets, R.please_wait);
                            OUTLET.syncOutlets(nghttp, function (errMsg) {
                                if (isCancelledFunc()) return;
                                hideLoadingFunc();

                                if (errMsg)
                                    showError(errMsg);
                                else
                                    callback();
                            });
                        } else {
                            hideLoadingFunc();
                            callback();
                        }
                    }
                    else
                        callback();
                };
                var onError = function () {
                    if (isCancelledFunc()) return;
                    hideLoadingFunc();
                    showError('Cannot save outlet, please check network connection and retry! (#12001)');
                };

                if (action == OUTLET_NEW) {
                    addOutletDB(config.tbl_outlet, outlet, false, onSuccess, onError);
                } else if (action == OUTLET_EDIT) {
                    saveOutletDB(config.tbl_outlet, outlet, state, false, onSuccess, onError);
                } else {
                    OUTLET.submitOutlet(nghttp, outlet, function (errMsg) {
                        if (errMsg) {
                            saveOutletDB(config.tbl_outlet, outlet, state, false, function () { callback(); }, onError);
                        } else {
                            deleteOutletDB(config.tbl_outlet, outlet, function () { callback(); }, onError);
                        }
                    });
                }
            } catch (err) {
                if (isCancelledFunc()) return;
                hideLoadingFunc();
                showError('Cannot save outlet, please check network connection and retry! (#12001)');
            }
        });
    },

    syncOutlets: function (nghttp, callback) {
        selectAllUnsyncedOutlets(config.tbl_outlet,
             function (dbres) {
                 console.log('Found unsynced outlets: ' + dbres.rows.length.toString());
                 if (dbres.rows.length == 0) {
                     callback();
                 } else {
                     var syncOutletQueue = [];
                     for (var i = 0; i < dbres.rows.length; i++) {
                         syncOutletQueue[i] = dbres.rows.item(i);
                     }
                     OUTLET.submitUnsyncOutlets(nghttp, syncOutletQueue, callback, function (errMessage) { callback(errMessage); });
                 }
             }, function (dbError) {
                 console.error(dbError);
                 callback("Cannot get unsynced outlet!");
             });
    },

    submitUnsyncOutlets: function (nghttp, outlets, onSuccess, onError) {
        if (networkReady()) {
            var url = baseURL + '/outlet/saveoutlets/' + userID + '/' + pass;
            console.log('Call service api: ' + url);
            nghttp({
                method: config.http_method,
                data: outlets,
                url: url,
                headers: { 'Content-Type': 'application/json' }
            }).then(function (resp) {
                console.debug(resp);
                var data = resp.data;
                if (data.Status == -1) { // error
                    onError(data.ErrorMessage);
                } else {
                    if (data.Status == 1) { // warning
                        onError(data.ErrorMessage);
                    }
                    setSyncStatusDB(config.tbl_outlet, data.Outlets, true,
                        function () {
                            onSuccess();
                        },
                        function (err) {
                            console.error(err);
                            onError("Error while connect to location database!");
                        });
                }
            }, function (err) {
                consloe.error(err);
                onError('Cannot connect to server, please check your connection!');
            });
        } else {
            onError('Cannot connect to server, please check your connection!');
        }
    },

    submitOutlet(nghttp, outlet, callback) {
        if (networkReady()) {
            var url = baseURL + '/outlet/save/' + userID + '/' + pass;
            log('Call service api: ' + url);
            nghttp({
                method: config.http_method,
                data: outlet,
                url: url,
                headers: { 'Content-Type': 'application/json' }
            }).then(function (resp) {
                var data = resp.data;
                if (data.Status == -1) { // error
                    callback(data.ErrorMessage);
                } else {
                    consloe.log('Submit outlet successfully: ' + data.RowID + ', ' + data.ID);
                    outlet.PRowID = data.RowID;
                    outlet.ID = data.ID;
                    callback();
                }
            }, function (err) {
                callback(R.check_network_connection);
            });
        } else {
            callback(R.check_network_connection);
        }
    },
};
//#endregion