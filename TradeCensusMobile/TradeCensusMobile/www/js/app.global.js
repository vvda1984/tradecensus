var db;                             // database instance
var map = null;                     // google map
//var isOnline = true;              // network status
var isDev = false;                  // enable DEV mode
var userOutletTable = 'outlet';     // outlet table name for current user
var isDlgOpened = false;     // 
var isInitialize = false;
var provinces = [];
var outletTypes = [];
var baseURL = '';
var user = null;
const earthR = 6378137;

// For todays date;
Date.prototype.today = function () {
    return this.getFullYear() + '-' + (((this.getMonth() + 1) < 10) ? "0" : "") + (this.getMonth() + 1) + '-' + ((this.getDate() < 10) ? "0" : "") + this.getDate();
}

// For the time now
Date.prototype.timeNow = function () {
    return ((this.getHours() < 10) ? "0" : "") + this.getHours() + ":" + ((this.getMinutes() < 10) ? "0" : "") + this.getMinutes() + ":" + ((this.getSeconds() < 10) ? "0" : "") + this.getSeconds();
}

/** 
* checkConnection
*/
function isOnline() {   
    return true;   
    var networkState = navigator.connection.type;
    return (networkState != 'Unknown connection' && networkState != 'no network connection')
}

/** 
* log
*/
function log(message) {
    console.log(message);
}

/** 
* hashString
*/
function hashString(text) {
    //TODO: hash test
    return text;
}

/** 
* toStr
*/
function toStr(text) {
    return (text == null) ? 'null' : text;    
}

/** 
* isEmpty
*/
function isEmpty(text) {
    return (!text || 0 === text.length);
}

/** 
* buildURL
*/
function buildURL(protocol, ip, port, serviceName) {
    return protocol + '://' + ip + ':' + port + '/' + serviceName;
}

/** 
* showLoading
*/
function showDlg1(title, message, allowClose) {
    log("Show dlg msg: " + message);   
    var cover = null;
    if (allowClose) {
        cover =
            '<div id="loading-overlay">' +
                '<div id="loading-window">' +
                    '<div class="dialog">' +
                        '<div class="content">' +
                            '<div class="title">' + title + '</div><br>' +
                            '<div>' + message + '</div>' +
                        '</div>' +
                        '<div class="button label-blue" onclick="hideDlg()">' +
                           '<div class="center" fit>CLOSE</div>' +
                            '<paper-ripple fit></paper-ripple>' +
                        '</div>' +
                        //'<div class="button">'+
                        //    '<div class="center" fit>DECLINE</div>'+
                        //    '<paper-ripple fit></paper-ripple>'+
                        //'</div>'+                        
                    '</div>' +
                 '</div>' +
            '</div>';
    } else {
        cover =
            '<div id="loading-overlay">' +
                '<div id="loading-window">' +
                    '<div class="dialog">' +
                        '<div class="loading">' +
                            '<img src="assets/img/loader.gif" width="28" height="28" />' +
                        '</div>' +
                        '<div class="content">' +
                            '<div class="title">' + title + '</div><br>' +
                            '<div>' + message + '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
    }

    $(cover).appendTo('body');
}

/** 
* showLoading
*/
function showDlg(title, message, allowClose) {
    log("show dlg");

    if (isDlgOpened) {
        $('#dlg-title').html(title);
        $('#dlg-message').html(message);
    } else {
        var cover = null;
        if (allowClose) {
            cover =
                '<div id="loading-overlay">' +
                    '<div id="loading-window">' +
                        '<div class="dialog">' +
                            '<div class="content">' +
                                '<div id="dlg-title" class="title">' + title + '</div><br>' +
                                '<div id="dlg-message">' + message + '</div>' +
                            '</div>' +
                            '<div class="button label-blue" onclick="hideDlg()">' +
                               '<div class="center" fit>CLOSE</div>' +
                                '<paper-ripple fit></paper-ripple>' +
                            '</div>' +
                            //'<div class="button">'+
                            //    '<div class="center" fit>DECLINE</div>'+
                            //    '<paper-ripple fit></paper-ripple>'+
                            //'</div>'+                        
                        '</div>' +
                     '</div>' +
                '</div>';
        } else {
            cover =
                '<div id="loading-overlay">' +
                    '<div id="loading-window">' +
                        '<div class="dialog">' +
                            '<div class="loading">' +
                                '<img src="assets/img/loader.gif" width="28" height="28" />' +
                            '</div>' +
                            '<div class="content">' +
                                '<div id="dlg-title" class="title">' + title + '</div><br>' +
                                '<div id="dlg-message">' + message + '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>';
        }
        isDlgOpened = true;
        $(cover).appendTo('body');
    }
}

/**
* Set loading message
*/
function setDlgMsg(message) {
    $('#dlg-message').html(message);
}

/** 
* hideLoading
*/
function hideDlg() {    
    try {
        $('#loading-overlay').remove();
        isDlgOpened = false;
    }
    catch (err) {        
    }
}

/** 
* showError
*/
function showError(message) {
    //navigator.notification.alert(message, function () { }, "Error", 'Close');
    hideDlg();
    showDlg("Error", message, true);
}

/** 
* handleError
*/
function handleError(err) {
    hideDlg();
    showDialog(err, 'Error', function () { });
}

/** 
* Handle http error
*/
function handleHttpError(err) {
    hideDlg();
    var msg = err.statusText == '' ? $scope.resource.text_ConnectionTimeout : err.statusText;
    showError(msg);
}

/** 
* loadResources
*/
function loadResources() {
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
        text_EnterUserID: 'Enter User ID',
        text_EnterIPAddress: 'Enter IP Address',
        text_EnterPort: 'Enter Port',
        text_EnterPassword: 'Enter Password',
        text_EnterProvince: 'Enter Province',
        text_ValRequired: 'Required.',
        text_ValLength10: 'Has to be less than 10 characters long.',
        text_UserTerminated: 'User has been terminated',
        text_ConnectionTimeout: 'Connection timeout',
        text_Distance: 'Distance to find outlets (meter)',
        text_ItemCount: 'Maximum outlets in result',
    };
}

/**
* loadDefaultConfig
*/
function loadDefaultConfig() {
    // Load database...
    return {
        protocol: 'http',
        ip: '27.0.15.234',
        port: '3001',
        service_name: 'TradeCensusService.svc',
        map_zoom: 16,
        distance: 1000,
        item_count: 20,        
        province_id: 50, // HCM
        http_method: 'POST',
        calc_distance_algorithm: 'circle',
        tbl_area_ver: '0',
        tbl_outlettype_ver: '0',
        tbl_province_ver: '1',
        tbl_zone_ver: '0',
        tbl_outletSync: 'outletSync',
        tbl_outlet: 'outlet',
    };
}

/**
* Clone object
*/
function cloneObj(i) {
    return (JSON.parse(JSON.stringify(i)));
}

/**
* Clone object
*/
function guid() {
    return randomString4() + randomString4() + '-' + randomString4() + '-' + s4randomString4 + '-' + randomString4() + '-' + randomString4() + randomString4() + randomString4();
}

/**
* random text 4 characters
*/
function randomString4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
}

/**
* Validate Empty
*/
function validateEmpty(name, value){    
    if (isEmpty(value)) {
        showError(name + ' is empty!');
        return false;
    }
    return true;
}

function compareDate(date1, date2, dateformat) {    
    if (date1 != null && date2 == null) return -1;
    if (date1 == null && date2 != null) return 1;
    if (date1 == date2) return 0;

    var d1 = getDateFromFormat(date1, dateformat);
    var d2 = getDateFromFormat(date2, dateformat);
    if (d1 == 0 || d2 == 0) {
        return 0; // invalid set they equal...
    }
    else if (d1 > d2) {
        return 1;
    }
    return -1;
}