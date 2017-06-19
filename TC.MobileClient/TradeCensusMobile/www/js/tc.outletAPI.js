/// <reference path="tc.databaseAPI.js" />
/// <reference path="tc.utils.js" />

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
const StatusExternalSystem = 50;

const StatusDelete = 100;
const StatusRevert = 102;

var nearByOutlets = [];
var curOutlets = [];
var firstStart = true;
var openOutletDlg = false;
var NewOutletDefaultID = 600000000;


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
        ID: NewOutletDefaultID,
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

    if (outlet.ID == NewOutletDefaultID)
        outlet.IDalias = '';
    else
        outlet.IDalias = '(' + outlet.ID.toString() + ')';

    if (typeof outlet.PLastModTS != 'undefined') {
        outlet.LastModifiedTS = new Date(outlet.PLastModTS);
    } else {
        outlet.LastModifiedTS = new Date('2010-01-01 00:00:00');
    }

    if (outlet.CompressImage) {
        outlet.StringImage1 = tcutils.decompress(outlet.StringImage1);
        outlet.StringImage2 = tcutils.decompress(outlet.StringImage2);
        outlet.StringImage3 = tcutils.decompress(outlet.StringImage3);
        outlet.StringImage4 = tcutils.decompress(outlet.StringImage4);
        outlet.StringImage5 = tcutils.decompress(outlet.StringImage5);
        outlet.StringImage6 = tcutils.decompress(outlet.StringImage6);
    }
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
                showError(dberr.message);
                callback(false, null);
            });
    } catch (err) {
        log(err);        
        showError(err.message);
        callback(false, null);
    }
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

    // Main Save Outlet
    saveOutlet: function (nghttp, outlet, action, state, callback) {
        dialogUtils.showClosableDlg(R.save_outlet, R.please_wait, function (hideLoadingFunc, isCancelledFunc) {
            try {
                var __onComplete = function () {
                    if (isCancelledFunc()) return;
                    hideLoadingFunc();

                    OUTLET.checkSyncedStatus();
                    callback();
                };

                var __onSuccess = function () {
                    if (networkReady()) {
                        OUTLET.submitOutlet(nghttp, outlet, function (error, submittedOutlet) {
                            if (error) {
                                __onComplete();
                            } else {
                                saveOutletDB(config.tbl_outlet, submittedOutlet, state, true, function () { __onComplete(); }, __onError);
                            }
                        });
                    }
                    else {
                        __onComplete();
                    }
                };

                var __onError = function () {
                    if (isCancelledFunc()) return;
                    hideLoadingFunc();
                    showError('Cannot submit outlet to server, please check network connection and retry! (#12002)');
                    __onComplete();
                };

                //outlet.StringImage1 = tcutils.compress(outlet.StringImage1);
                //outlet.StringImage2 = tcutils.compress(outlet.StringImage2);
                //outlet.StringImage3 = tcutils.compress(outlet.StringImage3);
                //outlet.StringImage4 = tcutils.compress(outlet.StringImage4);
                //outlet.StringImage5 = tcutils.compress(outlet.StringImage5);
                //outlet.StringImage6 = tcutils.compress(outlet.StringImage4);
                outlet.CompressImage = false;
                
                if (action == OUTLET_NEW) {
                    addOutletDB(config.tbl_outlet, outlet, false, __onSuccess, __onError);
                } else if (action == OUTLET_EDIT) {
                    saveOutletDB(config.tbl_outlet, outlet, state, false, __onSuccess, __onError);
                } else { // DELETE
                    OUTLET.submitOutlet(nghttp, outlet, function (errMsg, submittedOutlet) {
                        if (errMsg) {
                            saveOutletDB(config.tbl_outlet, outlet, state, false, function () { __onComplete(); }, __onError);
                        } else {
                            deleteOutletDB(config.tbl_outlet, outlet, function () { __onComplete(); }, __onError);
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
                    console.log('Submit outlet successfully: ' + data.RowID + ', ' + data.ID);
                    outlet.ID = data.ID;
                    callback(null, outlet);
                }
            }, function (err) {
                callback(R.check_network_connection);
            });
        } else {
            callback(R.check_network_connection);
        }
    },

    checkSyncedStatus: function () {
        selectAllUnsyncedOutlets(config.tbl_outlet,
            function (dbres) {
                if (dbres.rows.length > 0) {
                    $("#home-topright-sync-hint").css('display', 'inline-block');
                } else {
                    $("#home-topright-sync-hint").css('display', 'none');
                }
            }, function (dberr) { });
    },

    queryOutletsOnline: function (nghttp, isbackground, view, onSuccess, onError) { // type: near-by, new, update...
        try {
            var distance = 200;
            var itemCount = 20;
            if (typeof config.distance !== undefined && config.distance !== null) {
                distance = config.distance;
            }
            if (typeof config.item_count !== undefined && config.item_count !== null) {
                itemCount = config.item_count;
            }

            var url = baseURL + '/outlet/getoutlets/'
                            + userID + '/'
                            + pass + '/'
                            + curlat.toString() + '/'
                            + curlng.toString() + '/'
                            + distance.toString() + '/'
                            + itemCount.toString() + '/'
                            + view.toString();
            console.log('Call service api: ' + url);

            $.ajax({
                url: url,
                type: "POST",
                success: function (data) {
                    try {
                        if (data.Status == -1) { // error
                            onError(data.ErrorMessage);
                        } else {
                            var foundOutlets = data.Items;
                            foundOutlets.sort(function (a, b) { return a.Distance - b.Distance });
                            if (!isbackground) {
                                showDlg(R.get_near_by_outlets, R.found + foundOutlets.length.toString() + R.outlets_loading);
                            }
                            for (var i = 0; i < foundOutlets.length; i++) {
                                var outlet = foundOutlets[i];
                                outlet.positionIndex = i;
                                outlet.isOnline = true;
                                if (outlet.PStatus == null || outlet.PStatus == undefined)
                                    outlet.PStatus = 0;
                                initializeOutlet(outlet);
                            }
                            onSuccess(false, foundOutlets);
                        }
                    } catch (err) {
                        console.error(err);
                        onError(err.message + ' (#12012)');
                    }
                },
                error: function (msg) {
                    console.error(msg);
                    onError(msg + ' (#12012)');
                }
            });

        } catch (err) {
            console.error(err);
            onError(R.check_network_connection + ' (#12010)');
        }
    },

    queryOutletsOffline: function (view, callback) {
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
                    console.log('Found outlets from db: ' + rowLen.toString());
                    if (rowLen) {
                        var found = 0;
                        var foundOutlets = [];

                        var tempOutletList = []
                        for (i = 0; i < rowLen; i++) {
                            var outlet = dbres.rows.item(i);
                            outlet.Distance = calcDistance(saleLoc, { Lat: outlet.Latitude, Lng: outlet.Longitude });
                            tempOutletList[i] = outlet;
                        }
                        tempOutletList.sort(function (a, b) { return a.Distance - b.Distance });

                        for (i = 0; i < tempOutletList.length && i < count; i++) {
                            var isMatched = true;
                            if (config.calc_distance_algorithm == "circle")
                                isMatched = tempOutletList[i].Distance <= meter;

                            if (isMatched) {
                                var outlet = tempOutletList[i];
                                initializeOutlet(outlet);
                                outlet.positionIndex = found;
                                foundOutlets[found] = outlet;
                                found++;
                            }
                        }
                        callback(true, foundOutlets);
                    } else {
                        callback(true, []);
                    }
                },
                function (dberr) {
                    console.error(dberr);
                    callback(false, []);
                });
        } catch (err) {
            console.error(err);
            callback(false, []);
        }
    },

    queryUnsyncedOutlets: function (view, callback) {
        try {
            meter = config.distance;
            count = config.item_count;
            var saleLoc = { Lat: curlat, Lng: curlng };
            var tl = calcRetangleBoundary(meter, 0 - meter, saleLoc);
            var tr = calcRetangleBoundary(meter, meter, saleLoc);
            var bl = calcRetangleBoundary(0 - meter, 0 - meter, saleLoc);
            var br = calcRetangleBoundary(0 - meter, meter, saleLoc);

            selectNearByOutlets(config.tbl_outlet, bl.Lat, tl.Lat, bl.Lng, br.Lng, view, false,
                function (dbres) {
                    var rowLen = dbres.rows.length;
                    console.log('Found outlets from db: ' + rowLen.toString());
                    if (rowLen) {
                        var found = 0;
                        var foundOutlets = [];

                        var tempOutletList = []
                        for (i = 0; i < rowLen; i++) {
                            var outlet = dbres.rows.item(i);
                            outlet.Distance = calcDistance(saleLoc, { Lat: outlet.Latitude, Lng: outlet.Longitude });
                            tempOutletList[i] = outlet;
                        }
                        tempOutletList.sort(function (a, b) { return a.Distance - b.Distance });

                        for (i = 0; i < tempOutletList.length && i < count; i++) {
                            var isMatched = true;
                            if (config.calc_distance_algorithm == "circle")
                                isMatched = tempOutletList[i].Distance <= meter;

                            if (isMatched) {
                                var outlet = tempOutletList[i];
                                initializeOutlet(outlet);
                                outlet.positionIndex = found;
                                foundOutlets[found] = outlet;
                                found++;
                            }
                        }
                        callback(true, foundOutlets);
                    } else {
                        callback(true, []);
                    }
                },
                function (dberr) {
                    console.error(dberr);
                    callback(false, []);
                });
        } catch (err) {
            console.error(err);
            callback(false, []);
        }
    },

    queryOutlets: function (nghttp, isbackground, view, callback) {
        if (!isbackground) {
            showDlg(R.get_near_by_outlets, R.please_wait, function () { });
        }
        if (!networkReady()) {
            OUTLET.queryOutletsOffline(
                view,
                function (isSuccess, outlets) {
                    if (!isbackground) hideDlg();

                    if (!isSuccess && !isbackground) {
                        showError(R.query_outlet_error);
                        callback(false, null);
                    }
                    else
                        callback(true, outlets);
                });
        } else {
            OUTLET.queryOutletsOnline(nghttp, isbackground, view,
                function (synced, onlineOutlets) {
                    if (!isbackground) hideDlg();
                    callback(true, onlineOutlets);
                },
                function (errMessage) {
                    if (!isbackground) {
                        hideDlg();
                        showError(R.query_outlet_error);
                    }
                    callback(false, []);
                });
        }
    },

    queryUserOutlets: function (date, callback) {
        var text = date.getFullYear() + "-" + (date.getMonth() + 1) + '-' + date.getDate();
        var start = new Date(text + ' 00:00:00.0000');
        var end = new Date(text + ' 23:59:59.9999');

        selectUserOutletsDB(config.tbl_outlet, start.getTime(), end.getTime(),
            function (dbres) {
                var rowLen = dbres.rows.length;
                if (rowLen <= 0) {
                    callback(null, []);
                } else {
                    var foundOutlets = [];
                    var outletIDString = '';
                    var position = 0;
                    for (i = 0; i < rowLen; i++) {
                        var outlet = dbres.rows.item(i);
                        var id = outlet.ID;
                        var isAdd = true;
                        if (id != NewOutletDefaultID) {
                            if (outletIDString.indexOf(id.toString()) == -1) {
                                outletIDString += id.toString() + '|';
                            } else {
                                isAdd = false;
                            }
                        }
                        if (isAdd) {
                            initializeOutlet(outlet);
                            outlet.Distance = 0;
                            outlet.positionIndex = position++;
                            foundOutlets.push(outlet);
                        }
                    }
                    callback(null, foundOutlets);
                }
            }, function (dberr) {
                console.error(dberr);
                callback("Error while access local database! (#3001)");
            });
    },

    ensureOutletImagesAreLoaded: function (nghttp, outlet, callback) {
        if (isEmpty(outlet.StringImage1) &&
            isEmpty(outlet.StringImage2) &&
            isEmpty(outlet.StringImage3) &&
            isEmpty(outlet.StringImage4) &&
            isEmpty(outlet.StringImage5) &&
            isEmpty(outlet.StringImage6) &&
            networkReady()) {

            dialogUtils.showClosableDlg(R.load_images, R.please_wait, function (hideLoadingFunc, isCancelledFunc) {
                try {
                    var url = baseURL + '/outlet/getimages/' + userID + '/' + pass + '/' + outlet.ID.toString();
                    console.info('Call service api: ' + url);
                    nghttp({
                        method: config.http_method,
                        url: url
                    }).then(function (resp) {
                        if (isCancelledFunc()) return;
                        hideLoadingFunc();

                        try {
                            var data = resp.data;
                            if (data.Status == -1) { // error
                                showError(data.ErrorMessage);
                            } else {
                                //outlet.StringImage1 = data.Image1;
                                if (outlet.CompressImage) {
                                    outlet.StringImage1 = tcutils.decompress(data.Image1);
                                    outlet.StringImage2 = tcutils.decompress(data.Image2);
                                    outlet.StringImage3 = tcutils.decompress(data.Image3);
                                    outlet.StringImage4 = tcutils.decompress(data.Image4);
                                    outlet.StringImage5 = tcutils.decompress(data.Image5);
                                    outlet.StringImage6 = tcutils.decompress(data.Image6);
                                } else {
                                    outlet.StringImage1 = data.Image1;
                                    outlet.StringImage2 = data.Image2;
                                    outlet.StringImage3 = data.Image3;
                                    outlet.StringImage4 = data.Image4;
                                    outlet.StringImage5 = data.Image5;
                                    outlet.StringImage6 = data.Image6;
                                }

                                callback();
                            }
                        } catch (err) {
                            console.error(err);
                            showError('Cannot connect to server, please check network connection and retry! (#10003)');
                        }
                    }, function (err) {
                        if (isCancelledFunc()) return;
                        hideLoadingFunc();

                        showError('Cannot connect to server, please check network connection and retry! (#10002)');

                        console.error(err);
                        callback();
                    });
                } catch (err) {
                    if (isCancelledFunc()) return;
                    hideLoadingFunc();
                    console.error(err);
                    showError('Cannot connect to server, please check network connection and retry! (#10001)');
                }
            });
        } else {
            callback();
        }
    },

    searchOutlets: function (nghttp, outletID, outletName, callback) {
        //showDlg(R.Searching_outlet, R.please_wait, function () { });
        if (!networkReady()) {
            OUTLET.searchOutletsOffline(outletID, outletName,
                function (isSuccess, outlets) {
                    //hideDlg();
                    if (!isSuccess && !isbackground) {
                        showError(R.query_outlet_error);
                        callback(false, null);
                    }
                    else
                        callback(true, outlets);
                });
        } else {
            OUTLET.searchOutletsOnline(nghttp, outletID, outletName,
                function (synced, onlineOutlets) {
                    //hideDlg();
                    callback(true, onlineOutlets);
                },
                function (errMessage) {
                    //hideDlg();
                    showError(R.query_outlet_error);
                    callback(false, []);
                });
        }
    },

    searchOutletsOnline: function (nghttp, outletID, outletName, onSuccess, onError) {
        try {
            var url = baseURL + '/outlet/search/' + userID + '/' + pass;
            url = url.concat("/", outletID.toString(), "/", isEmpty(outletName) ? "none" : outletName);
            console.log(url);
            $.ajax({
                url: url,
                type: "POST",
                success: function (data) {
                    try {
                        if (data.Status == -1) { // error
                            onError(data.ErrorMessage);
                        } else {
                            var foundOutlets = data.Items;
                            for (var i = 0; i < foundOutlets.length; i++) {
                                var outlet = foundOutlets[i];
                                outlet.positionIndex = i;
                                outlet.isOnline = true;
                                if (outlet.PStatus == null || outlet.PStatus == undefined)
                                    outlet.PStatus = 0;
                                initializeOutlet(outlet);
                            }

                            if (foundOutlets.length > 0) {
                                panTo(foundOutlets[0].Latitude, foundOutlets[0].Longitude);
                            }
                            onSuccess(false, foundOutlets);
                        }
                    } catch (err) {
                        console.error(err);
                        onError(err.message + ' (#12012)');
                    }
                },
                error: function (msg) {
                    console.error(msg);
                    onError(msg + ' (#12012)');
                }
            });

        } catch (err) {
            console.error(err);
            onError(R.check_network_connection + ' (#12010)');
        }
    },

    searchOutletsOffline: function (outletID, outletName, callback) {
        try {
            searchOutletsDB(config.tbl_outlet, outletID, outletName,
                function (dbres) {
                    var rowLen = dbres.rows.length;
                    if (rowLen) {
                        var foundOutlets = [];
                        for (i = 0; i < rowLen; i++) {
                            var outlet = dbres.rows.item(i);

                            initializeOutlet(outlet);
                            outlet.positionIndex = i;
                            foundOutlets.push(outlet);
                        }
                        callback(true, foundOutlets);
                    } else {
                        callback(true, []);
                    }
                },
                function (dberr) {
                    console.error(dberr);
                    callback(false, []);
                });
        } catch (err) {
            console.error(err);
            callback(false, []);
        }
    },

};
//#endregion