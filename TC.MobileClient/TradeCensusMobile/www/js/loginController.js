﻿

function loginController($scope, $http) {
    log('Enter Login Controller');
    
    if(isDev){
        $scope.userName = 'sale1';
        $scope.password = '1';
    }

    $scope.resource = resource;
    $scope.config = config;
    $scope.user = user;
    $scope.password = '';    

    $scope.exit = function () {
        navigator.app.exitApp();
    };

    $scope.changeMode = function (i) {
        log('Change mode: ' + i.toString());
        if(i == 0){
            if (isEmpty($scope.config.ip)) {
                showError('IP is empty!');
                return;
            }

            if (isEmpty($scope.config.port)) {
                showError('Port is empty!');
                return;
            }
                     
            insertSettingDB($scope.config, function () {                
                baseURL = buildURL($scope.config.protocol, $scope.config.ip, $scope.config.port, $scope.config.service_name);
                $scope.showConfig = false;
            }, function (dberr) {
                showError(dberr.message);
            });
        } else{
             $scope.showConfig = true; 
        }
    };
   
    $scope.login = function () {
        log($scope.user.id);        
        // validate user id
        if (isEmpty($scope.userName)) {
            showError('User Name is empty!');
            return;
        }
        
        // validate password
        if (isEmpty($scope.password)) {
            showError('Password is empty!');
            return;
        }       

        showDlg('Login', 'Please wait...');    
        if (networkReady()) {
            loginOnline(0, loginSuccess, loginError);
        } else {
            loginOffline(loginSuccess, loginError);
        }
    };
   
    function loginOnline(retry, onSuccess, onError) {
        log('Login online');
        var url = baseURL + '/login/' + $scope.userName + '/' + $scope.password;
        log('Call service api: ' + url);
        $http({
            method: config.http_method,
            url: url
        }).then(function (resp) {
            hideDlg();            
            try {
                log('Login response: ');                
                var data = resp.data;
                if (data.Status == -1) { // error
                    onError(data.ErrorMessage);
                } else {                    
                    insertUserDB(data.People, $scope.userName,  $scope.password,
                        function (tx, row) {                                                  
                            onSuccess(data.People);
                        },
                        function (dberr) {
                            onError(dberr.message);
                        });
                }
            }
            catch (ex) {
                log(ex);
                onError(ex.message);
            }
        }, function (err) {            
            log('HTTP error!');
            log(err);
            if(retry == 0){   
                loginOnline(1, onSuccess, onError);             
            }
            try{
                onError(err.statusText == '' ? $scope.resource.text_ConnectionTimeout : err.statusText);
            }catch(ex){
                onError(err);
            }
        });
    }
  
    function loginOffline(onSuccess, onError) {
        log('Login offline');
        selectUserDB($scope.userName, hashString($scope.password),
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
                        Role : per.HasAuditRole == '1' ? 1 : 0,
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
      
        userID = user.ID;
        $scope.user.id = user.ID;
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
        
        config.tbl_outletSync = 'outletsync_' + $scope.user.id;
        config.tbl_outlet = 'outlet' + $scope.user.id;
        config.tbl_downloadProvince = 'outlet_province_' + $scope.user.id;
        
        log($scope.user.hasAuditRole);
		enableSync = true;

        log('create outlet tables');
        ensureUserOutletDBExist(user.Role == 101 || user.Role == 100, config.tbl_outletSync, config.tbl_outlet, config.tbl_downloadProvince,
            function () {
                if (networkReady()) {
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
    
    function downloadServerConfig(onSuccess, onError) {
        var url = baseURL + '/config/getall';
        log('Call service api: ' + url);
        $http({
            method: config.http_method,
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
                        config.calc_distance_algorithm = p.Value;
                    } else if (p.Key == 'tbl_area_ver') {
                        // do nothing
                    } else if (p.Key == 'tbl_outlettype_ver') {
                        syncOutletTypes = config.tbl_outlettype_ver != p.Value;
                        config.tbl_outlettype_ver = p.Value;
                    } else if (p.Key == 'tbl_province_ver') {
                        syncProvinces = config.tbl_province_ver != p.Value;
                        config.tbl_province_ver = p.Value;
                    } else if (p.Key == 'tbl_zone_ver') {
                        // do nothing
                    } else if (p.Key == 'map_api_key') {
                        config.map_api_key = p.Value;                      
                    } else if (p.Key == 'http_method') {
                        config.http_method = p.Value;
                    } else if (p.Key == 'sync_time') {                        
                        config.sync_time = parseInt(p.Value);
                    } else if (p.Key == 'protocol') {
                        config.protocol = p.Value;
                    }
                }

                insertSettingDB(config, function () {
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
   
    function downloadProvinces(onSuccess, onError) {
        setDlgMsg('Downloading Provinces...');
        var url = baseURL + '/provinces/getall';
        log('Call service api: ' + url);
        $http({
            method: config.http_method,
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
   
    function downloadOutletTypes(onSuccess, onError) {
        setDlgMsg('Downloading Outlet Types...');
        var url = baseURL + '/outlet/getoutlettypes';
        log('Call service api: ' + url);
        $http({
            method: config.http_method,
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
};