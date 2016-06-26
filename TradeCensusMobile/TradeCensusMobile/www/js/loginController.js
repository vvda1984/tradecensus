/// <reference path="app.service.js" />
console.log("Add LoginController");
app.controller("LoginController", ["$scope", "$location", "$http", function ($scope, $location, $http) {   
    if (!$scope.isInitialize) {
        $scope.userID = "123456";
        $scope.password = "1";
        $scope.provinces = provinces;

        $scope.isInitialize = true;
        showLoadingDlg("Initializing...", "Please wait", function () { });
        selectConfigs(function (tx2, dbres2) {
            var rowLen = dbres2.rows.length;
            console.log("Config len: " + rowLen.toString());
            if (rowLen > 0) {
                for (i = 0; i < rowLen; i++) {
                    var name = dbres2.rows.item(i).Name;
                    var value = dbres2.rows.item(i).Value;
                    if (name == "protocol") {
                        $scope.config.protocol = value;
                    } else if (name == "ip") {
                        $scope.config.ip = value;
                    } else if (name == "port") {
                        $scope.config.port = value;
                    } else if (name == "service_name") {
                        $scope.config.service_name = value;
                    } else if (name == "item_count") {
                        $scope.config.item_count = value;
                    } else if (name == "distance") {
                        $scope.config.distance = value;
                    } else if (name == "province_id") {
                        $scope.config.province_id = value;
                    } else if (name == "calc_distance_algorithm") {
                        $scope.config.calc_distance_algorithm = value;
                    } else if (name == "tbl_area_ver") {
                        $scope.config.tbl_area_ver = value;
                    } else if (name == "tbl_outlettype_ver") {
                        $scope.config.tbl_outlettype_ver = value;
                    } else if (name == "tbl_province_ver") {
                        $scope.config.tbl_province_ver = value;
                    } else if (name == "tbl_zone_ver") {
                        $scope.config.tbl_zone_ver = value;
                    }
                }
            }
            closeLoadingDlg();
            $scope.baseURL = buildURL($scope.config.protocol, $scope.config.ip, $scope.config.port, $scope.config.service_name);
        }, function (dberr) {
            showDialog(dberr.message, "DB Error", function () { });
        });



        //initalizeDB(function () {
        //    console.log("Load config");
        //    selectProvinces(function (tx1, dbrow1) {
        //        var rowLen = dbrow1.rows.length;
        //        if (rowLen > 0) {
        //            for (i = 0; i < rowLen; i++) {
        //                var p = {
        //                    id: dbrow1.rows.item(i).ID,
        //                    name: dbrow1.rows.item(i).Name,
        //                }
        //                $scope.provinces[i] = p;
        //            }
        //        }
                
        //    }, function (dberr) {
        //        showDialog(dberr.message, "DB Error", function () { });
        //    })
        //});
    }
    var protocol = $scope.config.protocol;

    $scope.login = function (userID, password) {
        // validate...
        if (isEmpty(userID)) {
            showDialog("User ID is empty!", "Error", function () { })
            return;
        }

        if (isEmpty(password)) {
            showDialog("Password is empty!", "Error", function () { })
            return;
        }

        var isCancel = false;
        showLoadingDlg("Login...", "Please wait", function () { isCancel = true; });
        if (isOnline) {            
            var url = $scope.baseURL + "/login/" + userID + "/" + password;
            log("Call service api: " + url);
            $http({
                method: 'GET',
                url: url
            }).then(function (resp) {
                closeLoadingDlg();             
                var data = resp.data;
                if (data.Status == -1) { // error
                    showDialog(data.ErrorMessage, "Error", function () { });
                } else {
                    insertPerson(data.People, password,
                        function (tx, row) {
                            afterLogin();
                        },
                        function (dberr) {
                            showDialog(dberr.message, "DB Error", function () { });
                        });
                }
            }, function (err) {
                closeLoadingDlg();                
                showDialog(err, "Unknown Error", function () { });
            });
        } else {
            log("Login using local db");
            selectUserByID(userID, password,
                function (tx, dbres) {
                    closeLoadingDlg();
                    var rowLen = dbres.rows.length;
                    if (rowLen > 0) {
                        afterLogin();
                    } else {
                        showDialog($scope.resource.text_InvalidUserPass, "Error", function () { });
                    }
                },
                function (dberr) {
                    closeLoadingDlg();
                    showDialog(err, "Unknown Error", function () { });
                });
        }
    };

    $scope.exit = function () {
        navigator.app.exitApp();
    };

    function afterLogin() {
        $scope.password = "";
        log("Login successfully");

        if (isOnline) {
            showLoadingDlg("Downloading Settings...", "Please wait", function () { isCancel = true; });
            downloadServerConfig(function () {
                closeLoadingDlg();
                $scope.changeView("home");
            }, function (err) {
                closeLoadingDlg();
                showDialog(err, "Unknown Error", function () { });
            });
        }
        else {
            $scope.changeView("home");
        }
    }

    //*******************************************
    function downloadServerConfig(onSuccess, onError) {        
        var url = $scope.baseURL + "/config/getall";        
        log("Call service api: " + url);
        $http({
            method: 'GET',
            url: url
        }).then(function (resp) {           
            var data = resp.data;
            if (data.Status == -1) { // error
                onError(data.ErrorMessage);
            } else {
                setLoadingDlgMessage("Update settings")

                var syncProvinces = false;
                var syncOutletTypes = false;
                for (var i in data.Items) {
                    p = data.Items[i];
                    if (p.Key == "calc_distance_algorithm") {
                        $scope.config.calc_distance_algorithm = p.Value;
                    } else if (p.Key == "tbl_area_ver") {

                    } else if (p.Key == "tbl_outlettype_ver") {
                        syncOutletTypes = $scope.config.tbl_outlettype_ver != p.Value;
                        $scope.config.tbl_outlettype_ver = p.Value;
                    } else if (p.Key == "tbl_province_ver") {
                        syncProvinces = $scope.config.tbl_province_ver != p.Value;
                        $scope.config.tbl_province_ver = p.Value;
                    } else if (p.Key == "tbl_zone_ver") {
                    }
                }

                insertConfig($scope.config, function () {
                    if (syncProvinces) {
                        downloadProvinces(function () {
                            if (syncOutletTypes) {
                                downloadOutletTypes(onSuccess, onError);
                            } else {
                                onSuccess();
                            }
                        }, onError)
                    }
                    else {
                        if (syncOutletTypes) {
                            downloadOutletTypes(onSuccess, onError);
                        } else {
                            onSuccess();
                        }
                    }
                }, onError);
            }
        }, onError);
    }

    //*******************************************
    function downloadProvinces(onSuccess, onError) {
        setLoadingDlgMessage("Downloading Provinces...")
        var url = $scope.baseURL + "/provinces/getall";
        log("Call service api: " + url);
        $http({
            method: 'GET',
            url: url
        }).then(function (resp) {
            var data = resp.data;
            if (data.Status == -1) { // error
                onError(data.ErrorMessage);
            } else {
                insertProvinces(data.Items, onSuccess, onError);
            }
        }, onError);
    }

    //*******************************************
    function downloadOutletTypes(onSuccess, onError) {
        setLoadingDlgMessage("Downloading Outlet Types...")
        var url = $scope.baseURL + "/outlet/getoutlettypes";
        log("Call service api: " + url);
        $http({
            method: 'GET',
            url: url
        }).then(function (resp) {
            var data = resp.data;
            if (data.Status == -1) { // error
                onError(data.ErrorMessage);
            } else {
                insertOutletTypes(data.Items, onSuccess, onError);
            }
        }, onError);
    }
}]);