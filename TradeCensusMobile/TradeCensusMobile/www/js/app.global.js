var app;                            // angular TradeCensus module
var db;                             // database instance
var isOnline = true;                // network status
var isDev = true                    // 
var userOutletTable = 'outlet';     // outlet table name for current user
var isLoadingDlgOpened = false;     // 
var isWeb = true;
var isInitialize = false;
var provinces = [];


/** 
* checkConnection
*/
function checkConnection() {
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
* showDialog
*/
function showDialog(message, title, onClosed) {
    navigator.notification.alert(message, onClosed, title, 'Close');
}

/** 
* showConfirm
*/
function showConfirm(message, title, onClosed) {
    navigator.notification.confirm(message, onClosed, title, ['OK', 'Cancel']);
}

function showError(message) {
    navigator.notification.alert(message, function(){}, "Error", 'Close');
}

/** 
* showLoadingDlg
*/
function showLoadingDlg(message, title, onClosed) {
    isLoadingDlgOpened = true;
    //SpinnerDialog.show(message, title, function () {
    //    IsLoadingDlgOpened = false;
    //    onClosed();        
    //});

    showOverlay(message);
}

/** 
* closeLoadingDlg
*/
function closeLoadingDlg() {
    hideOverlay();
    isLoadingDlgOpened = false;
    //SpinnerDialog.hide();
}

/** 
* setLoadingDlgMessage
*/
function setLoadingDlgMessage() {   
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
* showOverlay
*/
function showOverlay(message) {
    $('#cover').css('display', 'block');
    $('#loadingScreen').css('display', 'block');

    var cover = '<div id=\'overlay\'>' +
                    '<div id=\'overlay-view\'>'+
                        '<div id=\'overlay-content\'>' +
                            message +
                        '</div>' +
                    '</div>' +
                '</div>';
    $(cover).appendTo('body');

    // click on the overlay to remove it
    //$('#overlay').click(function() {
    //    $(this).remove();
    //});

    // hit escape to close the overlay
    //$(document).keyup(function (e) {
    //    if (e.which === 27) {
    //        $('#overlay').remove();
    //    }
    //});
}

/** 
* hideOverlay
*/
function hideOverlay() {
    try {
        $('#overlay').remove()
    }
    catch (err) {        
    }
}

/** 
* handleError
*/
function handleError(err) {
    closeLoadingDlg();
    showDialog(err, 'Error', function () { });
}

/**
* openOutletPanel
*/
function openOutletPanel() {
    document.getElementById('outletPanel').style.width = '100%';
}

/** 
* openOutletPanelHalf
*/
function openOutletPanelHalf() {
    document.getElementById('outletPanel').style.width = '40%';
}

/** 
* Close Outlet Panel
*/
function closeOutletPanel() {
    document.getElementById('outletPanel').style.width = '0%';
}