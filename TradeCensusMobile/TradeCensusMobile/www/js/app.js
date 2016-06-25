//*********************** GLOBAL VARs *********************** 
var app;                    // angular TradeCensus module
var db;                     // database instance
var isOnline = false;       // network status
var userOutletTable = "outlet"; // outlet table name for current user

log("initialize application...");
var app = angular.module("TradeCensus", ["ngRoute", 'ngMaterial', 'ngMessages']);

// for WEB
$(document).ready(function () {
    console.log("ready!");
    initalizeApp();
});

// for Mobile
//document.addEventListener('deviceready', onDeviceReady, false);
//function onDeviceReady() {
//    log("device is ready");
//    initalizeApp();
//};

function initalizeApp() {   
    log("check network status...");

    isOnline = true;
    // for mobile
    //isOnline = checkConnection();
    //document.addEventListener("online", function () { isOnline = true; }, false);
    //document.addEventListener("offline", function () { isOnline = false; }, false);

    log("initalize database...");
    initalizeDatabase();
}

function loadResources() {
    return {
        text_AppName: "Trade Censue",
        text_Login: "Login",
        text_Exit: "Exit",
        text_OK: "OK",
        text_ConfigServer: "Configure Server",
        text_UserName: "User ID",
        text_Password: "Password",
        text_EnterUserID: "Enter User ID",        
        text_EnterPassword: "Enter Password",        
        text_ValRequired: "Required.",
        text_ValLength10: "Has to be less than 10 characters long.",
    };
}

function loadSavedConfig() {
    // Load database...
    return {
        Protocol: "http",
        IPAddress: "localhost",
        Port: "33333",
        ServiceName: "TradeCensusService.svc",
        ItemCount: 20,
        Distance: 200,
        // add more here...
    };
}