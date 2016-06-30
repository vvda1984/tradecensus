/// <reference path='app.service.js' />
console.log('Add LoginController');
app.controller('LoginController', ['$scope', '$location', '$http', function ($scope, $location, $http) {
    console.log('Enter Login Controller');

    if (!isInitialize) {
        isInitialize = true;

        showLoadingDlg('Initializing...', 'Please wait', function () { });
        selectConfigs(function (tx2, dbres2) {
            var rowLen = dbres2.rows.length;
            console.log('Config len: ' + rowLen.toString());
            if (rowLen) {
                for (i = 0; i < rowLen; i++) {
                    var name = dbres2.rows.item(i).Name;
                    var value = dbres2.rows.item(i).Value;
                    if (name == 'protocol') {
                        $scope.config.protocol = value;
                    } else if (name == 'ip') {
                        $scope.config.ip = value;
                    } else if (name == 'port') {
                        $scope.config.port = value;
                    } else if (name == 'service_name') {
                        $scope.config.service_name = value;
                    } else if (name == 'item_count') {
                        $scope.config.item_count = value;
                    } else if (name == 'distance') {
                        $scope.config.distance = value;
                    } else if (name == 'province_id') {
                        $scope.config.province_id = value;
                    } else if (name == 'calc_distance_algorithm') {
                        $scope.config.calc_distance_algorithm = value;
                    } else if (name == 'tbl_area_ver') {
                        $scope.config.tbl_area_ver = value;
                    } else if (name == 'tbl_outlettype_ver') {
                        $scope.config.tbl_outlettype_ver = value;
                    } else if (name == 'tbl_province_ver') {
                        $scope.config.tbl_province_ver = value;
                    } else if (name == 'tbl_zone_ver') {
                        $scope.config.tbl_zone_ver = value;
                    }
                }
            }
            closeLoadingDlg();
            $scope.baseURL = buildURL($scope.config.protocol, $scope.config.ip, $scope.config.port, $scope.config.service_name);
        }, function (dberr) {
            showDialog(dberr.message, 'DB Error', function () { });
        });  
    }

    $scope.exit = function () {
        navigator.app.exitApp();
    };

    /*
    $scope.login = function () {
        log($scope.user.id);
        // validate user id
        if (isEmpty($scope.user.id)) {
            showDialog('User ID is empty!', 'Error', function () { })
            return;
        }
        // validate password
        if (isEmpty($scope.user.password)) {
            showDialog('Password is empty!', 'Error', function () { })
            return;
        }
        // FOR dev
        if ($scope.user.id == 600000) {          
            $scope.areaID = 'AA';            
            $scope.changeView('home');
            return;
        }
        var isCancel = false;        
        showLoadingDlg('Login...', 'Please wait', function () { isCancel = true; });
        if (isOnline) {
            var url = $scope.baseURL + '/login/' + $scope.user.id + '/' + $scope.user.password;
            log('Call service api: ' + url);
            $http({
                method: $scope.config.http_method,
                url: url
            }).then(function (resp) {
                closeLoadingDlg();                             
                if (data.Status == -1) { // error
                    showDialog(data.ErrorMessage, 'Error', function () { });
                } else {
                    if (data.People.IsTerminate) {
                    }
                    insertPerson(data.People, $scope.user.password,
                        function (tx, row) {
                            if (!data.People.IsTerminate) {
                                afterLogin();
                            } else {
                                showDialog($scope.resource.text_UserTerminated, 'Error', function () { });
                            }
                        },
                        function (dberr) {
                            showDialog(dberr.message, 'DB Error', function () { });
                        });
                }
            }, function (err) {
                closeLoadingDlg();                
                showDialog(err, 'Unknown Error', function () { });
            });
        } else {
            log('Login using local db');
            selectUserByID($scope.user.id, $scope.user.password,
                function (tx, dbres) {
                    closeLoadingDlg();
                    var rowLen = dbres.rows.length;
                    if (rowLen == 1) {
                        afterLogin();
                    } else {
                        showDialog($scope.resource.text_InvalidUserPass, 'Error', function () { });
                    }
                },
                function (dberr) {
                    closeLoadingDlg();
                    showDialog(dberr.message, 'Unknown Error', function () { });
                });
        }
    };
    */

    $scope.login = function () {
        log($scope.user.id);

        // validate user id
        if (isEmpty($scope.user.id)) {
            showDialog('User ID is empty!', 'Error', function () { })
            return;
        }

        // validate password
        if (isEmpty($scope.user.password)) {
            showDialog('Password is empty!', 'Error', function () { })
            return;
        }

        // FOR dev
        if ($scope.user.id == 600000 || $scope.user.id == 600001) {
            isDev = true;
            loginSuccess({
                ID: $scope.user.id,
                FirstName: 'DEV',
                LastName: 'A',
                IsTerminate: false,
                HasAuditRole: $scope.user.id == 600001,
                PosID: '1',
                ZoneID: 'AA',
                AreaID: '1',
                ProvinceID: '50',
                Email: 'test@mail.com',
                EmailTo: 'testmailto@mail.com',
                HouseNo: '1',
                Street: 'Nguyen Dinh Chieu',
                District: '1',
                HomeAddress: 'home',
                WorkAddress: 'work',
                Phone: '0909123456',
            });          
            return;
        }

        var isCancel = false;
        showLoadingDlg('Login...', 'Please wait', function () { isCancel = true; });
        if (isOnline) {
            loginOnline(loginSuccess, loginError);         
        } else {
            loginOffline(loginSuccess, loginError);
        }
    };

    /**
     * Login online
     */
    function loginOnline(onSuccess, onError) {
        var url = $scope.baseURL + '/login/' + $scope.user.id + '/' + $scope.user.password;
        log('Call service api: ' + url);
        $http({
            method: $scope.config.http_method,
            url: url
        }).then(function (resp) {
            closeLoadingDlg();
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
            onError(err.statusText);
        });
    }

    /**
     * Login offline
     */
    function loginOffline(onSuccess, onError) {
        log('Login using local db');
        selectUserByID($scope.user.id, $scope.user.password,
            function (tx, dbres) {
                closeLoadingDlg();
                if (dbres.rows.length == 1) {
                    var per = dbres.rows.item(0);
                    onSuccess( {
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

        if (isOnline && !isDev) {
            showLoadingDlg('Downloading Settings...', 'Please wait', function () { isCancel = true; });
            downloadServerConfig(function () {
                closeLoadingDlg();
                log('Navigate to home (online)');
                $scope.changeView('home');
            }, function (dberr) {
                closeLoadingDlg();
                showDialog(dberr.message, 'Unknown Error', function () { });
            });
        }
        else {
            log('Navigate to home (offline)');
            $scope.changeView('home');
        }       
    }

    function loginError(err) {
        closeLoadingDlg();
        showError(err);
    }
   
    /**
     * Download configs
     */
    function downloadServerConfig(onSuccess, onError) {        
        var url = $scope.baseURL + '/config/getall';        
        log('Call service api: ' + url);
        $http({
            method: $scope.config.http_method,
            url: url
        }).then(function (resp) {           
            var data = resp.data;
            if (data.Status == -1) { // error
                onError(data.ErrorMessage);
            } else {
                setLoadingDlgMessage('Update settings')

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
        setLoadingDlgMessage('Downloading Provinces...')
        var url = $scope.baseURL + '/provinces/getall';
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
        setLoadingDlgMessage('Downloading Outlet Types...')
        var url = $scope.baseURL + '/outlet/getoutlettypes';
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