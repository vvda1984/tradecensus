/// <reference path="tc.language.js" />
/// <reference path="tc.appAPI.js" />

var resetDB = false;                // force reset database - testing only
var db;                             // database instance
var devLat = START_LAT;
var devLng = START_LNG;

var userOutletTable = 'outlet';     // outlet table name for current user
var isDlgOpened = false;             
var isInitialize = false;
var enableSync = false;
var onImageViewerClose;
var newImageFile;
var userID = 0;
var user = newUser();
var config = newConfig();
var provinces = [];
var outletTypes = [];
var provinces = [];
var dprovinces = [];
var outletTypes = [];
var R = useLanguage();
var baseURL = '';
var sessionID = guid();

var isNetworkAvailable = true;      // Network monitoring status
var onNetworkChangedCallback;       // Network monitoring callback

var app = angular.module('TradeCensus', ['ngRoute', 'ngMaterial', 'ngMessages'])
.config(['$routeProvider', appRouter])
.config(['$mdThemingProvider', function($mdThemingProvider) {
    //$mdThemingProvider.theme('default').primaryPalette('green');   
    $mdThemingProvider.definePalette('tradecensustheme', {
        '50': 'd078ce',
        '100': 'a3e9a4',
        '200': '72d572',
        '300': '42bd41',
        '400': '259b24',
        '500': '00551E',
        '600': '00551E',
        '700': '00551E',
        '800': '00551E',
        '900': '00551E',
        'A100': '00551E',
        'A200': '00551E',
        'A400': '00551E',
        'A700': '00551E',
        'contrastDefaultColor': 'light',    // whether, by default, text (contrast)
        // on this palette should be dark or light
        'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
         '200', '300', '400', 'A100'],
        'contrastLightColors': undefined    // could also specify this if default was 'dark'
    });
    $mdThemingProvider.theme('default')
      .primaryPalette('tradecensustheme')
}])
.controller('MainController', ['$scope', '$route', '$location', mainController])
.controller('LoginController', ['$scope', '$http', loginController])
.controller('HomeController', ['$scope', '$http', '$mdDialog', '$mdMedia', '$timeout', homeController])
.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
});

(function (global) {
    "use strict";
    function onDeviceReady() {
        console.log('Device Ready!');

        // disable back button
        document.addEventListener("backbutton", function (e) { e.preventDefault(); }, false);
        document.addEventListener("resume", function () { }, false);
        //document.addEventListener("online", onNetworkConnected, false);
        //document.addEventListener("offline", onNetworkDisconnected, false);
        //document.addEventListener("resume", loadMapApi, false);

        logger.initialize('tradecencus');
       
        initializeEnvironment(function(){
            initializeApp();
        });        
    }

    $(document).ready(function () {
        onDeviceReady();
    });
    //document.addEventListener("deviceready", onDeviceReady, false);
})(window);

showDlg(R.connecting_server, R.please_wait, null);

function newResource() {
    return {
        text_AppName: 'Trade Censue',
        text_Login: 'Login',
        text_Exit: 'Exit',
        text_OK: 'OK',
        text_Cancel: 'Cancel',
        text_InvalidUserPass: 'Invalid User/Password.',
        text_ConfigServer: 'Configure Server',
        text_UserName: 'User ID',
        text_Password: 'Password',
        text_EnterProtocol: 'Enter Protocol',
        text_EnterUserID: 'Enter User Name',
        text_EnterIPAddress: 'Enter IP Address',
        text_EnterPort: 'Enter Port',
        text_EnterPassword: 'Enter Password',
        text_EnterProvince: 'Working Province',
        text_ValRequired: 'Required.',
        text_ValLength10: 'Has to be less than 10 characters long.',
        text_UserTerminated: 'User has been terminated',
        text_ConnectionTimeout: 'Connection timeout',
        text_Distance: 'Distance to find outlets (meter)',
        text_ItemCount: 'Maximum outlets in result',
    };
}

function newConfig() {
    var isHttp = true;
    //ip: 'localhost', //'27.0.15.234',
    //port: '33334',//'3001',
    var c = {
        enable_devmode: false,
        page_size: 20,
        cluster_size: 50,
        cluster_max_zoom: 15.5,
        mode_online: true,
        protocol: 'https',
        ip: '203.34.144.29/trade-census',
        port: '443',
        service_name: 'TradeCensusService.svc', // absolute
        enable_liveGPS: true,
        liveGPS_distance: 10,
        map_zoom: 17,
        distance: 200,
        audit_range: 50, //50
        item_count: 20,
        province_id: 50, // HCM
        http_method: 'POST',
        calc_distance_algorithm: 'circle',
        map_api_key: 'AIzaSyDpKidHSrPMfErXLJSts9R6pam7iUOr_W0',
        max_oulet_download: 1,
        download_batch_size: 8000,
        time_out: 30,               // Connection timeout
        auto_sync: 0,                // Sync delay...
        sync_time: 1 * 60 * 1000,   // Sync delay...
        sync_time_out: 5 * 60,      // Sync timeout
        sync_batch_size: 100,       // Number of uploaded outlets in sync request
        ping_time: 5,               // Time
        refresh_time: 30,           // Time to get outlet
        refresh_time_out: 3 * 60,   // Time to get outlet
        tbl_area_ver: '0',
        tbl_outlettype_ver: '0',
        tbl_province_ver: '1',
        tbl_zone_ver: '0',
        tbl_outletSync: 'uos',
        tbl_outlet: 'uo',
        tbl_downloadProvince: 'udp',
        version: 'Version 1.1.16222.12',
    };
    if (isHttp) {
        c.protocol = 'http';
        c.port = '80';
    }

    return c;
}

function newUser() {
    return {
        id: 0, // dev 
        userName: '',       
        firstName: '',
        lastName: '',
        isTerminate: false,
        hasAuditRole: false,
        posID: '0',
        zoneID: '',
        areaID: '',
        provinceID: '',
        email: '',
        emailTo: '',
        houseNo: '',
        street: '',
        district: '',
        homeAddress: '',
        workAddress: '',
        phone: '',
        isDSM: false,
    }
}

function initializeEnvironment(callback) {
    initalizeDB(function () {
        db.transaction(function (tx) {
            loadOutletTypes(tx, function(tx1){
                loadProvinces(tx1, function(tx2){
                    loadSettings(tx2, function(tx3){
                        initializeApp();
                    });
                });
            });
        }, function (dberr) {           
            showError(dberr.message);
        });        
    });
}

function loadOutletTypes(tx, callback) {
    log('Load outlet types...');
    if (outletTypes != null && outletTypes.length > 0) {
        log('Outlets have been loaded before.');
        callback(tx);
        return;
    }
    log('Load outlets from db');
    outletTypes = [];
    outletTypes[0] = { ID: '-1', Name: ' ' };
    selectOutletTypesDB(tx, function (tx1, dbrow) {
        var rowLen = dbrow.rows.length;
        log('Outlet found: ' + rowLen.toString());
        if (rowLen) {
            for (i = 0; i < rowLen; i++) {
                outletTypes[i + 1] = {
                    ID: dbrow.rows.item(i).ID,
                    Name: dbrow.rows.item(i).Name,
                }
            }
        }
        callback(tx1);
    }, function (dberr) {
        showError(dberr.message);
    });
}

function loadProvinces(tx, callback) {
    log('Load provinces...');
    if (provinces != null && provinces.length > 0) {
        log('Outlets have been loaded before.');
        callback(tx);
        return;
    } 
    log('Load provinces from db');
    provinces = [];
    selectProvincesDB(tx, function (tx1, dbrow) {
        var rowLen = dbrow.rows.length;
        log('Provinces found: ' + rowLen.toString());
        if (rowLen) {
            for (i = 0; i < rowLen; i++) {
                provinces[i] = {
                    id: dbrow.rows.item(i).ID,
                    name: dbrow.rows.item(i).Name,
                }
            }
        }

        callback(tx1);
    }, function (dberr) {  
        showError(dberr.message);
    });
}

function loadSettings(tx, callback) {
    log('Load settings...');
    selectSettingDB(tx, function (tx1, dbres) {
        var rowLen = dbres.rows.length;
        log('Settings found: ' + rowLen.toString());
        if (rowLen) {
            for (i = 0; i < rowLen; i++) {
                var name = dbres.rows.item(i).Name;
                var value = dbres.rows.item(i).Value;
                if (name == 'protocol') {                    
                    config.protocol = value;
                } else if (name == 'ip') {
                    log('set ip: ' + value);
                    config.ip = value;
                } else if (name == 'port') {
                    log('set port: ' + value);
                    config.port = value;
                } else if (name == 'service_name') {
                    log('service name: ' + value);
                    config.service_name = value;
                } else if (name == 'item_count') {
                    log('item_count: ' + value);
                    config.item_count = parseInt(value);
                } else if (name == 'distance') {
                    log('distance: ' + value);
                    config.distance = parseInt(value);
                } else if (name == 'province_id') {
                    config.province_id = value;
                } else if (name == 'calc_distance_algorithm') {
                    config.calc_distance_algorithm = value;
                } else if (name == 'tbl_area_ver') {
                    config.tbl_area_ver = value;
                } else if (name == 'tbl_outlettype_ver') {
                    config.tbl_outlettype_ver = value;
                } else if (name == 'tbl_province_ver') {
                    config.tbl_province_ver = value;
                } else if (name == 'tbl_zone_ver') {
                    config.tbl_zone_ver = value;
                } else if (name == 'map_api_key') {
                    config.map_api_key = value;
                } else if (name == 'sync_time') {
                    config.sync_time = parseInt(value);
                } else if (name == 'sync_time_out') {
                    config.sync_time_out = parseInt(value);
                } else if (name == 'sync_batch_size') {
                    config.sync_batch_size = parseInt(value);
                } else if (name == 'cluster_size') {
                    config.cluster_size = parseInt(value);
                } else if (name == 'cluster_max_zoom') {
                    config.cluster_max_zoom = parseFloat(value);
                } else if (name == 'http_method') {
                    config.http_method = value;
                } else if (name == 'map_api_key') {
                    config.map_api_key = value;
                } else if (name == 'max_oulet_download') {
                    config.max_oulet_download = parseInt(value);
                } else if (name == 'audit_range') {
                    config.audit_range = parseInt(value);
                } else if (name == 'ping_time') {
                    config.ping_time = parseInt(value);
                } else if (name == 'refresh_time') {
                    config.refresh_time = parseInt(value);
                } else if (name == 'refresh_time_out') {
                    config.refresh_time_out = parseInt(value);
                }
            }
        }     
        baseURL = buildURL(config.protocol, config.ip, config.port, config.service_name);       
        callback(tx1);
    },  function (dberr) {      
        showError(dberr.message);
    });
}

function initializeApp() {
    log('Initialize angular app.');
    ping(function (r) {
        serverConnected = r;
        hideDlg();
        startPingProgress();
        startSyncProgress();
    });
};

/****************************************************************/
var syncOutletsCallback;
function startSyncProgress() {
    setTimeout(function () {
        runSync(function () { startSyncProgress(); });
    }, config.sync_time);
}

function runSync(callback) {
    log('*** BEGIN SYNC');
    if (syncOutletsCallback == null) {
        log('*** SYNC Ignored: sycn exe was not set');
        callback();
        return;
    }

    if(!enableSync || !networkReady()) {
        log('*** SYNC Ignored: sycn is disabled or no connection');
        callback();
        return;
    }
    try{
        syncOutletsCallback(function () {
            log('*** SYNC COMPLETED');									
            callback();
        }, function(err){
            log('*** SYNC ERROR: ' + err);									
            callback();
        });
    }catch(ex){
        log('*** SYNC ERROR: ' + ex);									
        callback();
    }
}

/****************************************************************/
var isPausePing = false;
var connectionChangedCallback;
var refreshOutletListCallback;
var pingTimeout = 5;
function startPingProgress () {
    startPingTimer();
}

function startPingTimer() {
    setTimeout(function () {
        if (isPausePing || isOutletDlgOpen)
        {
            startPingTimer();
            return;
        } else {
            ping(function (b) {
                try {
                    log('ping...' + baseURL);
                    if (b != serverConnected) {
                        serverConnected = b;
                        if (connectionChangedCallback != null)
                            connectionChangedCallback(b);
                    }

                    if (refreshOutletListCallback != null)
                        refreshOutletListCallback();
                }
                catch(e){
                }
                startPingTimer();
            });
        }
    }, config.ping_time * 1000);
}

function ping(callback) {
    tryping(0, callback);

    //if (!getNetworkState()) {
    //    callback(false);
    //    return;
    //}
    ////else {
    ////    callback(true);
    ////    return;
    ////}
    ////return;

    // ignore
    //var devideInfo = userID.toString();
    //var url = baseURL + '/ping/' + devideInfo;
    //$.ajax({
    //    type: "POST",
    //    contentType: "application/json; charset=utf-8",
    //    url: url,
    //    data: '',
    //    processData: false,
    //    dataType: "json",
    //    timeout: config.time_out * 100, // sets timeout to 3 seconds
    //    success: function (response) {
    //        callback(true);
    //    },
    //    error: function (a, b, c) {
    //        callback(false);
    //        //alert(a.responseText);
    //    }
    //});
}

function tryping(retry, callback) {
    if (!getNetworkState()) {
        callback(false);
        return;
    }

    var devideInfo = userID.toString();
    var url = baseURL + '/ping/' + devideInfo;
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: url,
        data: '',
        processData: false,
        dataType: "json",
        timeout: config.time_out * 1000, // sets timeout to 3 seconds
        success: function (response) {
            callback(true);
        },
        error: function (a, b, c) {
            if (retry >= 1)
                callback(false);
            else {
                setTimeout(function () { tryping(retry + 1, callback);}, 300);
            }
        }
    });
}

/****************************************************************/
