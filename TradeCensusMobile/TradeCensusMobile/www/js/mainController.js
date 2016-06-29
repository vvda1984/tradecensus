log("Add MainController");
app.controller("MainController", ["$scope", "$route", "$location", function ($scope, $route, $location) {
    log("Load resources");
    $scope.resource = loadResources();    
    $scope.userID = "123456";
    $scope.password = "1";

    log("check network status...");   
    if (!isWeb) {
        isOnline = checkConnection();
        document.addEventListener("online", function () { isOnline = true; }, false);
        document.addEventListener("offline", function () { isOnline = false; }, false);
    }

    $scope.config = loadDefaultConfig();
    $scope.baseURL = buildURL($scope.config.protocol, $scope.config.ip, $scope.config.port, $scope.config.service_name);

    $scope.route = $route;   
    //*******************************************************
    $scope.$on("$routeChangeSuccess", function (ev) {
        console.log("routed to " + $location.path());
    });

    //*******************************************************
    $scope.changeView = function (name) {        
        console.log("change view: " + name);
        $location.path("/" + name);
        $scope.$apply()
    };

    //log("initalize database...");
    //db = window.openDatabase("Database", "2.0", "td-v01.db", 200000);
    //db.transaction(function (tx) {
    //    log("create table if not exist");
    //    initalizeDB(tx, function () {
    //         log("Load config");
    //    });
    //});
    //showLoadingDlg("Initializing...", "Please wait", function () { });
    //console.log("Load config");
    //selectConfig(function (tx, dbres) {
    //    var rowLen = dbres.rows.length;
    //    console.log("Config len: " + rowLen.toString());
    //    if (rowLen > 0) {
    //        for (i = 0; i < rowLen; i++) {
    //            var name = dbres.rows.item(i).Name;
    //            var value = dbres.rows.item(i).Value;
    //            if (name == "protocol") {
    //                $scope.config.protocol = value;
    //            } else if (name == "ip") {
    //                $scope.config.ip = value;
    //            } else if (name == "port") {
    //                $scope.config.port = value;
    //            } else if (name == "service_name") {
    //                $scope.config.service_name = value;
    //            } else if (name == "item_count") {
    //                $scope.config.item_count = value;
    //            } else if (name == "distance") {
    //                $scope.config.distance = value;
    //            } else if (name == "province_id") {
    //                $scope.config.province_id = value;
    //            } else if (name == "calc_distance_algorithm") {
    //                $scope.config.calc_distance_algorithm = value;
    //            } else if (name == "tbl_area_ver") {
    //                $scope.config.tbl_area_ver = value;
    //            } else if (name == "tbl_outlettype_ver") {
    //                $scope.config.tbl_outlettype_ver = value;
    //            } else if (name == "tbl_province_ver") {
    //                $scope.config.tbl_province_ver = value;
    //            } else if (name == "tbl_zone_ver") {
    //                $scope.config.tbl_zone_ver = value;
    //            }
    //        }
    //    }
    //    closeLoadingDlg();
    //    $scope.baseURL = buildURL($scope.config.protocol, $scope.config.ip, $scope.config.port, $scope.config.service_name);
    //      
    //    log("redict to login");
    //    //$scope.changeView("login");
    //    //$location.path("/login");
    //}, function (dberr) {
    //    showDialog(dberr.message, "DB Error", function () { });
    //});

    $location.path("/login");
}]);

//*******************************************
function loadResources() {
    return {
        text_AppName: "Trade Censue",
        text_Login: "Login",
        text_Exit: "Exit",
        text_OK: "OK",
        text_Cancel :"Cancel",
        text_InvalidUserPass: "Invalid User/Password.",
        text_ConfigServer: "Configure Server",
        text_UserName: "User ID",
        text_Password: "Password",
        text_EnterProtocol: "Enter Protocol",
        text_EnterUserID: "Enter User ID",        
        text_EnterIPAddress: "Enter IP Address",
        text_EnterPort: "Enter Port",
        text_EnterPassword: "Enter Password",
        text_EnterProvince: "Enter Province",
        text_ValRequired: "Required.",
        text_ValLength10: "Has to be less than 10 characters long.",
        text_UserTerminated: "User has been terminated",
    };
}

//*******************************************
function loadDefaultConfig() {
    // Load database...
    return {
        protocol: "http",
        ip: "192.168.1.104",
        port: "33334",
        service_name: "TradeCensusService.svc",
        item_count: 20,
        distance: 200,
        province_id: 50, // HCM
        http_method : "GET",
        calc_distance_algorithm: "circle",
        tbl_area_ver: "0",
        tbl_outlettype_ver: "0",
        tbl_province_ver: "1",
        tbl_zone_ver: "0",
    };
}

