(function (global) {
    "use strict";
    function onDeviceReady() {
        console.log('Device Ready!');
        inactivityTime();

        // disable back button
        document.addEventListener("backbutton", function (e) { e.preventDefault(); }, false);
        document.addEventListener("resume", function () { }, false);
        //document.addEventListener("online", onNetworkConnected, false);
        //document.addEventListener("offline", onNetworkDisconnected, false);
        document.addEventListener("resume", function () { }, false);

        //logger.initialize('tradecencus');

        initializeEnvironment(function () { initializeApp(); });

        document.onmousedown = function () { inactivityTime(); };
        document.onkeypress = function () { inactivityTime(); };
        document.ontouchstart = function () { inactivityTime(); };

        try {
            // Android customization
            cordova.plugins.backgroundMode.setDefaults({ text: 'Trade Census.' });
            // Enable background mode
            cordova.plugins.backgroundMode.enable();
            // Called when background mode has been activated
            cordova.plugins.backgroundMode.onactivate = function () {
                try {
                    isRunningInBackgound = true;
                    turnOntrackLocationWhenAppInBackground();
                }
                catch (err) {
                    log(err);
                }

                setTimeout(function () {
                    // Modify the currently displayed notification
                    cordova.plugins.backgroundMode.configure({
                        text: 'Running in background.'
                    });
                }, 5000);
            };

            cordova.plugins.backgroundMode.ondeactivate = function () {
                isRunningInBackgound = false;
            };            
        }
        catch (err) {
            log(err);
        }

        //try {
        //    rootdetection.isDeviceRooted(function (result) {
        //        console.log(result);
        //        if (result === 1) {
        //            console.log('Device is rooted.');
        //            navigator.app.exitApp();
        //        }                
        //    }, function (error) {
        //        console.error(error);
        //    });
        //}
        //catch (err) {
        //    console.log(err);
        //}
    }

    $(document).ready(function () { onDeviceReady(); }); // web
    //document.addEventListener("deviceready", onDeviceReady, false); // mobile
    
})(window);

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
var pass = '';
var user = newUser();
var salesmans = [];
var config = newConfig();
var deviceInfo = newDeviceInfo();
var outletTypes = [];
var provinces = [];
var dprovinces = [];
var outletTypes = [];
var R = useLanguage();
var baseURL = '';
var sessionID = guid();
var lastActivedTS = null;
var downloadOptions = {
    downloadProvinces: false,
    downloadOutletTypes: false,
    downloadMapIcons: false
};

var isNetworkAvailable = true;      // Network monitoring status
var onNetworkChangedCallback;       // Network monitoring callback

//showDlg(R.connecting_server, R.please_wait, null);

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
    //var testBuild = false;
    var c = {
        debug_build: true,
        enable_devmode: true,
        enable_logview: false,
        page_size: 20,
        cluster_size: 50,
        cluster_max_zoom: 15.5,
        mode_online: true,
        enable_rereverse_geo: 1,
        protocol: 'http',
        //ip: '27.0.15.234/trade-census',
        ip: '203.34.144.29/tc-test',
        //ip: '203.34.144.29/trade-census',
        //ip: 'localhost/trade-census-test',        
        port: '80',
        service_name: 'TradeCensusService.svc', // absolute
        enable_liveGPS: true,       
        liveGPS_distance: 10,
        map_zoom: 17,
        distance: 200,
        border_fill_opacity: 0,
        audit_accuracy: 50, //100
        audit_range: 100, //100
        item_count: 20,
        province_id: 50, // HCM
        http_method: 'POST',
        calc_distance_algorithm: 'circle',
        map_api_key: 'AIzaSyDpKidHSrPMfErXLJSts9R6pam7iUOr_W0',
        max_oulet_download: 1,
        download_batch_size: 5000,
        time_out: 30,               // Connection timeout
        auto_sync: 0,               // 
        sync_time: 1 * 60 * 1000,   // Sync delay...
        sync_time_out: 5 * 60,      // Sync timeout
        sync_batch_size: 100,       // Number of uploaded outlets in sync request
        ping_time: 30,              // Time
        refresh_time: 30,           // 
        refresh_time_out: 3 * 60,   // Time to get outlet
        session_time_out: 0 * 60,
        location_age: 10,           // last avaliable location

        enable_journal: false,      // False after login until user start
        journal_update_time: 1 * 10,//
        journal_accuracy : 100,     //
        journal_distance: 10,       // meter
        journal_refresh_time: 3,    // second
        journal_color: '#00551E',   // 
        journal_opacity: 1.0,       // 
        journal_weight: 3,          //
        journal_nonstop: 1,         //
        journal_daily_mode: true,   // 
        hotlines: [],               // hotline
        enable_check_in: 1,         //
        map_icons_version: 0,       //
        map_salesman_new_outlet: '',
        map_agency_new_outlet: '',
        map_auditor_new_outlet: '',
        check_rooted_device : 1,

        tbl_area_ver: '0',
        tbl_outlettype_ver: '0',
        tbl_province_ver: '1',
        tbl_zone_ver: '0',
        tbl_outletSync: 'uos',
        tbl_outlet: 'uo',
        tbl_downloadProvince: 'udp',
        tbl_journal: 'jr',
        version: '1.2.17090.12',
        versionNum: 8,
    };
    if (isHttp) {
        c.protocol = 'http';
        c.port = '80';
    }

    if (c.enable_devmode)
        c.audit_range = 5000;

    //tc.config = c;

    return c;
}

var logoutCallback;
var inactivityTime = function () {
    var t;
    document.onmousemove = resetTimer;
    document.onkeypress = resetTimer;
    document.ontouchstart = resetTimer;

    function logout() {
        if (!config.enable_journal && logoutCallback && config.session_time_out > 0)
            logoutCallback();
    }

    function resetTimer() {
        clearTimeout(t);
        if (config.session_time_out > 0) {
            t = setTimeout(logout, config.session_time_out * 1000);
        }
    }
};

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
        role: 0,
        token: ''
    }
}

function newDeviceInfo() {
    return {
        model: '',
        platform: '',
        uuid: '',
        version: '',
        manufacturer : '',
    }
}

function initializeEnvironment(callback) {
    initalizeDB(function (tx) {
        loadOutletTypes(tx, function (tx1) {
            loadProvinces(tx1, function (tx2) {
                loadSettings(tx2, function (tx3) {
                    callback();
                });
            });
        });
    }, function (errMsg) {
        showError(errMsg);
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
        try {
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
        } catch (ex) {
            showError(ex.message);
        }
        callback(tx1);
    }, function (dberr) {
        showError(dberr.message);
    });
}

function loadProvinces(tx, callback) {
    provinces = [];
    callback(tx);

    //log('Load provinces...');
    //if (provinces != null && provinces.length > 0) {
    //    log('Outlets have been loaded before.');
    //    callback(tx);
    //    return;
    //} 
    //log('Load provinces from db');
    //provinces = [];
    //selectProvincesDB(tx, function (tx1, dbrow) {
    //    try {
    //        var rowLen = dbrow.rows.length;
    //        log('Provinces found: ' + rowLen.toString());
    //        if (rowLen) {
    //            for (i = 0; i < rowLen; i++) {
    //                provinces[i] = {
    //                    id: dbrow.rows.item(i).ID,
    //                    name: dbrow.rows.item(i).Name,
    //                }
    //            }
    //        }
    //        addressModel.provinceArr = provinces;
    //    } catch (ex) {
    //        showError(ex.message);
    //    }
    //    callback(tx1);
    //}, function (dberr) {  
    //    showError(dberr.message);
    //});
}

function loadSettings(tx, callback) {
    log('Load settings...');
    selectSettingDB(tx, function (tx1, dbres) {
        try {
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
                    } else if (name == 'audit_accuracy') {
                        config.audit_accuracy = parseInt(value);
                    } else if (name == 'ping_time') {
                        config.ping_time = parseInt(value);
                    } else if (name == 'refresh_time') {
                        config.refresh_time = parseInt(value);
                    } else if (name == 'refresh_time_out') {
                        config.refresh_time_out = parseInt(value);
                    } else if (name == 'session_time_out') {
                        config.session_time_out = parseInt(value);
                    } else if (name == 'border_fill_opacity') {
                        try {
                            config.border_fill_opacity = parseFloat(value);
                        }
                        catch (err) {
                        }
                    } else if (name == 'enable_rereverse_geo') {
                        config.enable_rereverse_geo = parseInt(value);
                    } else if (name == 'download_batch_size') {
                        config.download_batch_size = parseInt(value);
                    } else if (name == 'journal_update_time') {
                        config.journal_update_time = parseInt(value);
                    } else if (name == 'journal_distance') {
                        config.journal_distance = parseInt(value);
                    } else if (name == 'journal_accuracy') {
                        config.journal_accuracy = parseInt(value);
                    } else if (name == 'journal_color') {
                        config.journal_color = value;
                    } else if (name == 'journal_opacity') {
                        try { config.journal_opacity = parseFloat(value); }
                        catch (err) { }
                    } else if (name == 'journal_weight') {
                        config.journal_weight = parseInt(value);
                    } else if (name == 'journal_nonstop') {
                        config.journal_nonstop = parseInt(value);
                    } else if (name == 'enable_check_in') {
                        config.enable_check_in = parseInt(value);
                    } else if (name == 'hotlines') {
                        config.hotlines = JSON.parse(value);
                    } else if (name == 'map_icons_version') {
                        config.map_icons_version = parseInt(value);
                    } else if (name == 'map_salesman_new_outlet') {
                        config.map_salesman_new_outlet = value;
                    } else if (name == 'map_agency_new_outlet') {
                        config.map_agency_new_outlet = value;
                    } else if (name == 'map_auditor_new_outlet') {
                        config.map_auditor_new_outlet = value;
                    } else if (name == 'check_rooted_device') {
                        config.check_rooted_device = parseInt(value);
                    }
                }
            }
        } catch (er) {
            showError('Load settings error:' + er.message);
        }
        baseURL = buildURL(config.protocol, config.ip, config.port, config.service_name);
        callback(tx1);
    }, function (dberr) {
        showError(dberr.message);
    });
}

function getDeviceInfo() {
    try{
        if (config.enable_devmode) {
            deviceInfo.model = 'Samsung Tab 3';
            deviceInfo.platform = 'Web';
            deviceInfo.uuid = '123-456-789';
            deviceInfo.version = '1.0';
            deviceInfo.manufacturer = 'Samsung';
        } else {
            deviceInfo.model = device.model;
            deviceInfo.platform = device.platform;
            deviceInfo.uuid = device.uuid;
            deviceInfo.version = device.version;
            deviceInfo.manufacturer = device.manufacturer;
        }
    }
    catch(ex)
    {
        deviceInfo.model = 'unknown';
        deviceInfo.platform = 'unknown';
        deviceInfo.uuid = '000-000-000';
        deviceInfo.version = '1.0';
        deviceInfo.manufacturer = 'unknown';
    }
}

function initializeApp() {
    hideDlg();
    getDeviceInfo();
    log('Initialize angular app.');
    ping(function (r) {
        serverConnected = r;
        startPingProgress();
        startSyncProgress();
    });
    if (getNetworkState()) {
        checkUpdate();
    }
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
            if(user.id > 0)
                journals.syncJournal();
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

    var text = '';
    text = text.concat('user_id~', user.id);
    text = text.concat('||token~', user.token);
    text = text.concat('||app_version~', config.version);
    text = text.concat('||model~', deviceInfo.model);
    text = text.concat('||platform~', deviceInfo.platform);
    text = text.concat('||uuid~', deviceInfo.uuid);
    text = text.concat('||version~', deviceInfo.version);
    text = text.concat('||manufacturer~', deviceInfo.manufacturer);
    var url = baseURL + '/ping/' + text;
    log(url);
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: url,
        data: '',
        processData: false,
        dataType: "json",
        timeout: config.time_out * 1000,
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

function checkUpdate() {
    try {
        showDlg(R.check_update, R.please_wait);
        var url = baseURL + '/config/getverion/' + config.versionNum.toString();
        log('Call service api: ' + url);

        $.ajax({
            type: "POST",
            contentType: "application/json; charset=utf-8",
            url: url,
            data: '',
            processData: false,
            dataType: "json",
            timeout: config.time_out * 1000,
            success: function (response) {
                hideDlg();
                if (response.Status == -1) { // error
                    showError(response.ErrorMessage);
                } else {
                    if (!isEmpty(response.Message)) {
                        showInfo(response.Message);
                    }
                }
            },
            error: function (a, b, c) {
                hideDlg();
            }
        });
    } catch (err) {
        hideDlg();
        log(err);
    }
}
