/// <reference path="app.global.js" />

app.controller('LoginController', ['$scope', '$http', function ($scope, $http) {
    console.log('Enter Login Controller');
    //if (!isInitialize) {
    //    isInitialize = true;
    //    showDlg('Read settings', 'Please wait...');
    //    selectConfigs(function (tx2, dbres2) {
    //        var rowLen = dbres2.rows.length;
    //        console.log('Config len: ' + rowLen.toString());
    //        if (rowLen) {
    //            for (i = 0; i < rowLen; i++) {
    //                var name = dbres2.rows.item(i).Name;
    //                var value = dbres2.rows.item(i).Value;
    //                if (name == 'protocol') {
    //                    $scope.config.protocol = value;
    //                } else if (name == 'ip') {
    //                    log('set ip: ' + value);
    //                    $scope.config.ip = value;
    //                } else if (name == 'port') {
    //                    $scope.config.port = value;
    //                } else if (name == 'service_name') {
    //                    $scope.config.service_name = value;
    //                } else if (name == 'item_count') {
    //                    $scope.config.item_count = value;
    //                } else if (name == 'distance') {
    //                    $scope.config.distance = value;
    //                } else if (name == 'province_id') {
    //                    $scope.config.province_id = value;
    //                } else if (name == 'calc_distance_algorithm') {
    //                    $scope.config.calc_distance_algorithm = value;
    //                } else if (name == 'tbl_area_ver') {
    //                    $scope.config.tbl_area_ver = value;
    //                } else if (name == 'tbl_outlettype_ver') {
    //                    $scope.config.tbl_outlettype_ver = value;
    //                } else if (name == 'tbl_province_ver') {
    //                    $scope.config.tbl_province_ver = value;
    //                } else if (name == 'tbl_zone_ver') {
    //                    $scope.config.tbl_zone_ver = value;
    //                }
    //            }
    //        }
    //        hideDlg();
    //        baseURL = buildURL($scope.config.protocol, $scope.config.ip, $scope.config.port, $scope.config.service_name);
    //    }, function (dberr) {
    //        showDlg(dberr.message, 'DB Error');
    //    });
    //}

    $scope.exit = function () {
        navigator.app.exitApp();
    };
   
    $scope.login = function () {
        log($scope.user.id);

        // validate user id
        if (isEmpty($scope.user.id)) {
            showError('User ID is empty!');
            return;
        }
        
        // validate password
        if (isEmpty($scope.user.password)) {
            showError('Password is empty!');
            return;
        }        

        // FOR dev
        //if ($scope.user.id == 600000 || $scope.user.id == 600001) {
        //    isDev = true;
        //    loginSuccess({
        //        ID: $scope.user.id,
        //        FirstName: 'DEV',
        //        LastName: 'A',
        //        IsTerminate: false,
        //        HasAuditRole: $scope.user.id == 600001,
        //        PosID: '1',
        //        ZoneID: 'AA',
        //        AreaID: '1',
        //        ProvinceID: '50',
        //        Email: 'test@mail.com',
        //        EmailTo: 'testmailto@mail.com',
        //        HouseNo: '1',
        //        Street: 'Nguyen Dinh Chieu',
        //        District: '1',
        //        HomeAddress: 'home',
        //        WorkAddress: 'work',
        //        Phone: '0909123456',
        //    });
        //    return;
        //}

        showDlg('Login', 'Please wait...');
        var isConnected = isOnline();
        log('Newwork status: ' + isConnected);
        if (isConnected) {
            loginOnline(loginSuccess, loginError);
        } else {
            loginOffline(loginSuccess, loginError);
        }
    };

    /**
     * Login online
     */
    function loginOnline(onSuccess, onError) {
        log('Login online');
        var url = baseURL + '/login/' + $scope.user.id + '/' + $scope.user.password;
        log('Call service api: ' + url);
        $http({
            method: $scope.config.http_method,
            url: url
        }).then(function (resp) {
            hideDlg();
            var data = resp.data;
            if (data.Status == -1) { // error
                onError(data.ErrorMessage);
            } else {
                insertPerson(data.People, $scope.user.password,
                    function (tx, row) {
                        onSuccess(data.People);
                    },
                    function (dberr) {
                        onError(dberr.message);
                    });
            }
        }, function (err) {
            log(err);            
            onError(err.statusText == '' ? $scope.resource.text_ConnectionTimeout : err.statusText);
        });
    }

    /**
     * Login offline
     */
    function loginOffline(onSuccess, onError) {
        log('Login offline');
        selectUserByID($scope.user.id, $scope.user.password,
            function (tx, dbres) {
                hideDlg();
                if (dbres.rows.length == 1) {
                    var per = dbres.rows.item(0);
                    onSuccess({
                        ID: per.ID,
                        FirstName: per.FirstName,
                        LastName: per.LastName,
                        IsTerminate: per.IsTerminate == '1',
                        HasAuditRole: per.HasAuditRole == '1',
                        PosID: per.PosID,
                        ZoneID: per.ZoneID,
                        AreaID: per.AreaID,
                        ProvinceID: per.ProvinceID,
                        Email: per.Email,
                        EmailTo: per.EmailTo,
                        HouseNo: per.HouseNo,
                        Street: per.Street,
                        District: per.District,
                        HomeAddress: per.HomeAddress,
                        WorkAddress: per.WorkAddress,
                        Phone: per.Phone,
                    });
                } else {
                    onError($scope.resource.text_InvalidUserPass);
                }
            },
            function (dberr) {
                onError(dberr.message);
            });
    }

    function loginSuccess(user) {
        log('Login successfully');
        if (user.IsTerminate) {
            showError($scope.resource.text_UserTerminated);
            return;
        }
        $scope.user.password = '';
        $scope.user.firstName = user.FirstName;
        $scope.user.lastName = user.LastName;
        $scope.user.isTerminate = user.IsTerminate;
        $scope.user.hasAuditRole = user.HasAuditRole;
        $scope.user.posID = user.PosID;
        $scope.user.zoneID = user.ZoneID;
        $scope.user.areaID = user.AreaID;
        $scope.user.provinceID = user.ProvinceID;
        $scope.user.email = user.Email;
        $scope.user.emailTo = user.EmailTo;
        $scope.user.houseNo = user.HouseNo;
        $scope.user.street = user.Street;
        $scope.user.district = user.District;
        $scope.user.homeAddress = user.HomeAddress;
        $scope.user.workAddress = user.WorkAddress;
        $scope.user.phone = user.Phone;
        $scope.config.tbl_outletSync = 'outletSync' + $scope.user.id;
        $scope.config.tbl_outlet = 'outlet' + $scope.user.id;
        log($scope.user.hasAuditRole);

        log('create outlet tables');
        createOutletTables($scope.config.tbl_outletSync, $scope.config.tbl_outlet, function () {
            if (isOnline() && !isDev) {
                showDlg('Downloading Settings', 'Please wait...');
                downloadServerConfig(function () {
                    hideDlg();
                    log('Navigate to home (online)');
                    $scope.changeView('home');
                }, function (dberr) {
                    hideDlg();
                    showError(dberr.message);
                });
            }
            else {
                log('Navigate to home (offline)');
                $scope.changeView('home');
            }
        });      
    }

    function loginError(err) {
        hideDlg();
        showError(err);
    }   

    /**
     * Download configs
     */
    function downloadServerConfig(onSuccess, onError) {
        var url = baseURL + '/config/getall';
        log('Call service api: ' + url);
        $http({
            method: $scope.config.http_method,
            url: url
        }).then(function (resp) {
            var data = resp.data;
            if (data.Status == -1) { // error
                onError(data.ErrorMessage);
            } else {
                setDlgMsg('Update settings...');

                var syncProvinces = false;
                var syncOutletTypes = false;
                for (var i in data.Items) {
                    p = data.Items[i];
                    if (p.Key == 'calc_distance_algorithm') {
                        $scope.config.calc_distance_algorithm = p.Value;
                    } else if (p.Key == 'tbl_area_ver') {

                    } else if (p.Key == 'tbl_outlettype_ver') {
                        syncOutletTypes = $scope.config.tbl_outlettype_ver != p.Value;
                        $scope.config.tbl_outlettype_ver = p.Value;
                    } else if (p.Key == 'tbl_province_ver') {
                        syncProvinces = $scope.config.tbl_province_ver != p.Value;
                        $scope.config.tbl_province_ver = p.Value;
                    } else if (p.Key == 'tbl_zone_ver') {
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
        }, handleHttpError);
    }

    /**
     * Download provinces
     */
    function downloadProvinces(onSuccess, onError) {
        setDlgMsg('Downloading Provinces...');
        var url = baseURL + '/provinces/getall';
        log('Call service api: ' + url);
        $http({
            method: $scope.config.http_method,
            url: url
        }).then(function (resp) {
            var data = resp.data;
            if (data.Status == -1) { // error
                onError(data.ErrorMessage);
            } else {
                insertProvinces(data.Items, onSuccess, onError);
            }
        }, handleHttpError);
    }

    /**
     * Dowload outlet types
     */
    function downloadOutletTypes(onSuccess, onError) {
        setDlgMsg('Downloading Outlet Types...');
        var url = baseURL + '/outlet/getoutlettypes';
        log('Call service api: ' + url);
        $http({
            method: $scope.config.http_method,
            url: url
        }).then(function (resp) {
            var data = resp.data;
            if (data.Status == -1) { // error
                onError(data.ErrorMessage);
            } else {
                insertOutletTypes(data.Items, onSuccess, onError);
            }
        }, handleHttpError);
    }
}]);