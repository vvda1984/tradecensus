
var resetDB = false;                // force reset database - testing only
var db;                             // database instance
var isDev = true;                   // enable DEV mode

var userOutletTable = 'outlet';     // outlet table name for current user
var isDlgOpened = false;            // 
var isInitialize = false;
var enableSync = false;
var onImageViewerClose;
var newImageFile;
var user = newUser();
var userID = 0;
var resource = newResource();
var config = newConfig();
var provinces = [];
var outletTypes = [];
var provinces = [];
var outletTypes = [];
var baseURL = '';
var isRegisterNetworkChanged = false;

var app = angular.module('TradeCensus', ['ngRoute', 'ngMaterial', 'ngMessages'])
.config(['$routeProvider', appRouter])
.config(['$mdThemingProvider', function($mdThemingProvider) {
    $mdThemingProvider.theme('default').primaryPalette('blue');      
}])
.controller('MainController', ['$scope', '$route', '$location', mainController])
.controller('LoginController', ['$scope', '$http', loginController])
.controller('ConfigController', ['$scope', configController])
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
        // disable back button
        document.addEventListener("backbutton", function (e) { e.preventDefault(); }, false);
        //document.addEventListener("online", loadMapApi, false);
        //document.addEventListener("resume", loadMapApi, false);

        initializeEnvironment(function(){
            initializeApp();
        });        
    }

    $(document).ready(function () {
        onDeviceReady();
    });
    //document.addEventListener("deviceready", onDeviceReady, false);
})(window);

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
        text_EnterProvince: 'Select Province',
        text_ValRequired: 'Required.',
        text_ValLength10: 'Has to be less than 10 characters long.',
        text_UserTerminated: 'User has been terminated',
        text_ConnectionTimeout: 'Connection timeout',
        text_Distance: 'Distance to find outlets (meter)',
        text_ItemCount: 'Maximum outlets in result',
    };
}

function newConfig() {
    return {
        page_size: 20,
        cluster_size: 50,
        cluster_max_zoom: 15.5,
        mode_online: true,
        protocol: 'http',
        //ip: '27.0.15.234',
        //port: '3001',
        ip: 'localhost', //'27.0.15.234',        
        port: '33334',//'3001',
        service_name: 'TradeCensusService.svc',
        map_zoom: 16,
        distance: 1000,
        item_count: 20,
        sync_time: 1*60*1000,
        province_id: 50, // HCM
        http_method: 'POST',
        calc_distance_algorithm: 'circle',
        tbl_area_ver: '0',
        tbl_outlettype_ver: '0',
        tbl_province_ver: '1',
        tbl_zone_ver: '0',
        tbl_outletSync: 'outletSync',
        tbl_outlet: 'outlet',
        map_api_key: 'AIzaSyDpKidHSrPMfErXLJSts9R6pam7iUOr_W0',
    };
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
    }
}

function initializeEnvironment(callback){   
    initalizeDB(function () {
        showDlg('Starting Application', 'Please wait...', null);      
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
    selectOutletTypesDB(tx, function (tx1, dbrow) {
        var rowLen = dbrow.rows.length;
        log('Outlet found: ' + rowLen.toString());
        if (rowLen) {
            for (i = 0; i < rowLen; i++) {
                outletTypes[i] = {
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
                    log('set protocol ' + value);
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
                } else if (name == 'cluster_size') {
                    config.cluster_size = parseInt(value);
                } else if (name == 'cluster_max_zoom') {
                    config.cluster_max_zoom = parseFloat(value);
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
    hideDlg();    
    startSyncProgress();
};

//******************************************
var syncExecuter;
function startSyncProgress() {
    setTimeout(function () {
        runSync(function () { startSyncProgress(); });
    }, config.sync_time);
}

function runSync(callback) {
    log('*** BEGIN SYNC');
    if(syncExecuter == null){
        log('*** SYNC Ignored: sycn exe was not set');
    }

    if(!enableSync || !networkReady()) {
        log('*** SYNC Ignored: sycn is disabled or no connection');
        callback();
        return;
    }
    try{
        syncExecuter(function(){
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