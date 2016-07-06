/** 
* checkConnection
*/
function isOnline() {   
    return true;   
    //var networkState = navigator.connection.type;
    //return (networkState != 'Unknown connection' && networkState != 'no network connection')
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
function showDlg(title, message, allowClose) {
    log("show dlg");
    //var cover = allowClose
    //    ? '<div id="loading-overlay">' +
    //        '<div id="loading-window">' +
    //            '<div id="loading-content">' +
    //                '<div id="loading-content-header">' +
    //                    '<h2 id="loading-content-title">' + title + '</h2>' +
    //                '</div>' +
    //                '<span id="loading-content-message">' + message + '</span>' +
    //                '<div id="loading-content-footer">' +
    //                    '<a onclick="hideDlg()">CLOSE</a>' +
    //                '</div>' +
    //            '</div>' +
    //        '</div>' +
    //     '</div>'
    //    : '<div id="loading-overlay">' +
    //        '<div id="loading-window">' +
    //            '<div id="loading-content">' +
    //                '<div id="loading-content-header">' +
    //                    '<h2 id="loading-content-title">' + title + '</h2>' +
    //                '</div>' +
    //                '<span id="loading-content-message">' + message + '</span>' +
    //                '<div id="loading-content-footer">' +                       
    //                '</div>' +
    //            '</div>' +
    //        '</div>' +
    //     '</div>';
    ////log(cover);
    
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
* Set loading message
*/
function setDlgMsg(message) {
    $('#loading-content-message').html(message);
}

/** 
* hideLoading
*/
function hideDlg() {
    log("hide dlg");
    try {
        $('#loading-overlay').remove();
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
        map_zoom: 18,
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
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
}

/**
* Clone object
*/
function s4() {
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