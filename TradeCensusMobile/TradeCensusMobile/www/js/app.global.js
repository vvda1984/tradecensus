//*********************** GLOBAL VARs *********************** 
var app;                            // angular TradeCensus module
var db;                             // database instance
var isOnline = true;                // network status
var userOutletTable = "outlet";     // outlet table name for current user
var isLoadingDlgOpened = false;     // 
var isWeb = true;
var isInitialize = false;
var provinces = [];


//***********************************************************
function checkConnection() {
    if (isWeb) return true;
    var networkState = navigator.connection.type;
    return (networkState != "Unknown connection" && networkState != "no network connection")
}

//***********************************************************
function log(message) {
    console.log(message);
}

//***********************************************************
function showDialog(message, title, onClosed) {
    navigator.notification.alert(message, onClosed, title, "Close");
}

//***********************************************************
function showConfirm(message, title, onClosed) {
    navigator.notification.confirm(message, onClosed, title, ['OK', 'Cancel']);
}

//***********************************************************
function showLoadingDlg(message, title, onClosed) {
    isLoadingDlgOpened = true;
    //SpinnerDialog.show(message, title, function () {
    //    IsLoadingDlgOpened = false;
    //    onClosed();        
    //});

    showOverlay(message);
}

//***********************************************************
function closeLoadingDlg() {
    hideOverlay();
    isLoadingDlgOpened = false;
    //SpinnerDialog.hide();
}

//***********************************************************
function setLoadingDlgMessage() {   
}

//***********************************************************
function hashString(text) {
    return text;
}

//***********************************************************
function toStr(text) {
    return (text == null) ? "null" : text;    
}

//***********************************************************
function isEmpty(text) {
    return (!text || 0 === text.length);
}

//***********************************************************
function buildURL(protocol, ip, port, serviceName) {
    return protocol + "://" + ip + ":" + port + "/" + serviceName;
}

//***********************************************************
function showOverlay(message) {
    $('#cover').css('display', 'block');
    $('#loadingScreen').css('display', 'block');

    var cover = '<div id="overlay">' +
                    '<div id="overlay-view">'+
                        '<div id="overlay-content">' +
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

//***********************************************************
function hideOverlay() {
    $('#overlay').remove();
}

//***********************************************************
function handleError(err) {
    showDialog(err, "Error", function () { });
}

//***********************************************************
function openOutletPanel() {
    document.getElementById("outletPanel").style.width = "100%";
}

function openOutletPanelHalf() {
    document.getElementById("outletPanel").style.width = "40%";
}

//***********************************************************
function closeOutletPanel() {
    document.getElementById("outletPanel").style.width = "0%";
}