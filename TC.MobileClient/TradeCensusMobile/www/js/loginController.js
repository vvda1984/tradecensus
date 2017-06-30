
function loginController($scope, $http) {
    log('Enter Login Controller');
    editOutletCallback = null;
    mapClickedCallback = null;
    mapViewChangedCallback = null;
    __locationChangedCallback = null;
    __connectionChangedCallback = null;
    $scope.R = R;
    $scope.config = config;
    $scope.user = user;
    $scope.password = '';
    isMapReady = false;

    if (config.enable_devmode) {
        $scope.userName = 'sale1';
        $scope.password = '1';
    }

    var protocol = $scope.config.protocol;
    var ip = $scope.config.ip;
    var port = $scope.config.port;
    var province_id = $scope.config.province_id;        
    var online = $scope.config.mode_online;
    var timeo = $scope.config.time_out;
    var dist = $scope.config.liveGPS_distance;

    $scope.exit = function () {
        navigator.app.exitApp();
    };

    $scope.closeConfig = function (r) {
        if (r === 0) { // cancel
            config.protocol = protocol;
            config.ip = ip;
            config.port = port;
            config.province_id = province_id;
            config.mode_online = online;
            $scope.config.time_out = timeo;
            $scope.config.liveGPS_distance = dist;

            $("#loginscreen").css('display', 'block');
            $("#configscreen").css('display', 'none');
        } else {
            if (isEmpty($scope.config.ip)) {
                showError(R.ip_is_empty);
                return;
            }

            if (isEmpty($scope.config.port)) {
                showError(R.port_is_empty);
                return;
            }

            if (isEmpty($scope.config.time_out)) {
                showError(R.timeout_is_empty);
                return;
            }

            if (isEmpty($scope.config.liveGPS_distance)) {
                showError('Refresh Distance is empty!');
                return;
            }

            showDlg(R.update_settings, R.please_wait);
            insertSettingDB(config, function () {
                hideDlg();
                baseURL = buildURL(
                    $scope.config.protocol,
                    $scope.config.ip,
                    $scope.config.port,
                    $scope.config.service_name);
                log('Change baseURL: ' + baseURL);
                $("#configscreen").css('display', 'none');
                $("#loginscreen").css('display', 'block');
            }, function (dberr) {
                showError(dberr.message);
            });
        }
    }

    $scope.changeMode = function () {
        $scope.config = config;
        //log('Change mode: ' + i.toString());
        $("#loginscreen").css('display', 'none');
        $("#configscreen").css('display', 'block');
    };
   
    $scope.login = function () {

        log($scope.user.id);
        // validate user id
        if (isEmpty($scope.userName)) {
            showError(R.username_is_empty);
            return;
        }

        // validate password
        if (isEmpty($scope.password)) {
            showError(R.password_is_empty);
            return;
        }

        // reset varibles
        salesmans = [];

        showDlg(R.btn_login, R.please_wait);

        isGPSAvailable(function (isEnable) {
            if (!isEnable) {
                hideDlg();
                showError(R.cannot_get_cur_location);
            } else {
                if (networkReady()) {
                    loginOnline(0, loginSuccess, function (msg) {
                        if (msg == R.connection_timeout) {
                            loginOffline(loginSuccess, function (err) {
                                loginError(msg);
                            });
                        } else {
                            loginError(msg);
                        }
                    });
                } else {
                    loginOffline(loginSuccess, loginError);
                }
            }
        });
    }
    
    function loginOnline(retry, onSuccess, onError) {
        log('Login online ' + retry.toString());
        pass = hashString($scope.password);
        var url = baseURL + '/login/' + $scope.userName + '/' + pass;
        log('Call service api: ' + url);

        $.ajax({
            type: "POST",
            contentType: "application/json; charset=utf-8",
            url: url,
            data: '',
            processData: false,
            dataType: "json",
            timeout: config.time_out * 1000,
            success: function (data) {
                hideDlg();
                try {
                    log('Login response: ');
                    //var data = resp.data;
                    if (data.Status == -1) { // error
                        onError(data.ErrorMessage);
                    } else {
                        salesmans.push({ personID: 0, firstName: '', lastName: '', display: '', searchKey: '' });
                        if (data.People.HasAuditRole && data.salesmans) {
                            for (var i = 0; i < data.salesmans.length; i++) {
                                var item = data.salesmans[i];
                                item.display = item.firstName + ' ' + item.lastName + ' (' + item.personID.toString() + ')';
                                item.searchKey = changeAlias(item.display);
                                salesmans.push(item);
                            }
                        }

                        salesmans.sort(function (a, b) {
                            var keyA = a.display,
                                keyB = b.display;
                            if (keyA < keyB) return -1;
                            if (keyA > keyB) return 1;
                            return 0;
                        });

                        insertUserDB(data.People, $scope.userName, $scope.password,
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
            },
            error: function (a, b, c) {
                if (retry < $scope.config.time_out) {
                    setTimeout(function () {
                        loginOnline(retry + 1, onSuccess, onError);
                    }, 1000);
                } else {
                    try {
                        onError(R.connection_timeout);
                    } catch (ex) {
                        onError(ex.message);
                    }
                }
            }
        });
    }
  
    function loginOffline(onSuccess, onError) {
        log('Login offline');
        pass = hashString($scope.password);
        selectUserDB($scope.userName, $scope.password,
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
                        Role: per.Role,
                        Token: '',
                    });
                } else {
                    onError(R.invalid_user_password);
                }
            },
            function (dberr) {
                onError(dberr.message);
            });
    }

    function loginSuccess(loginUser) {
        log('Login successfully');
        if (loginUser.IsTerminate) {
            showError(R.user_terminated);
            return;
        }

        userID = loginUser.ID;
        $scope.user.id = loginUser.ID;
        $scope.user.firstName = loginUser.FirstName;
        $scope.user.lastName = loginUser.LastName;
        $scope.user.isTerminate = loginUser.IsTerminate;
        $scope.user.hasAuditRole = loginUser.HasAuditRole;
        $scope.user.posID = loginUser.PosID;
        $scope.user.zoneID = loginUser.ZoneID;
        $scope.user.areaID = loginUser.AreaID;
        $scope.user.provinceID = loginUser.ProvinceID;
        $scope.user.email = loginUser.Email;
        $scope.user.emailTo = loginUser.EmailTo;
        $scope.user.houseNo = loginUser.HouseNo;
        $scope.user.street = loginUser.Street;
        $scope.user.district = loginUser.District;
        $scope.user.homeAddress = loginUser.HomeAddress;
        $scope.user.workAddress = loginUser.WorkAddress;
        $scope.user.phone = loginUser.Phone;
        $scope.user.isDSM = loginUser.isDSM;
        $scope.user.role = loginUser.Role % 10;
        $scope.user.token = loginUser.Token == undefined ? '' : loginUser.Token;

        user = $scope.user;

        config.tbl_outletSync = 'outletsync_' + $scope.user.id;
        config.tbl_outlet = 'outlet_' + $scope.user.id;
        config.tbl_downloadProvince = 'outlet_province_' + $scope.user.id;
        config.tbl_journal = 'journal_tracking_' + $scope.user.id;

        log($scope.user.hasAuditRole);
        resetLocal = loginUser.Role >= 100;

        console.info($scope.user);
        console.log("ensureUserOutletDBExist");
        ensureUserOutletDBExist(resetLocal,
            config.tbl_outletSync,
            config.tbl_outlet,
            config.tbl_downloadProvince,
            config.tbl_journal,
            function() {
                if (networkReady()) {
                    showDlg(R.download_settings, R.please_wait);
                    downloadServerConfig(function(errMsg) {
                        if (errMsg != undefined) {
                            showError(errMsg);
                        } else {
                            checkRootDevice(function() {
                                finalizeLoginView();
                            });
                        }
                    });
                } else {
                    checkRootDevice(function() {
                        finalizeLoginView();
                    });
                }
            });
    }

    function loginError(err) {
        hideDlg();
        showError(err);
    }   
    
    function checkRootDevice(onsucccess) {
        if (config.check_rooted_device && _WEB === false) {
            detectRootedDevice(function (result) {
                if (result === 1) {
                    hideDlg();
                    showDlg(R.error, "Your device is rooted!",
                        function () {
                            navigator.app.exitApp();
                        });
                } else {
                    onsucccess();
                }
            });
        } else {
            onsucccess();
        }
    }

    function finalizeLoginView() {
        enableBackgroundMode();
        startMonitorNetworkState();

        $scope.changeView('home');

        //selectDownloadProvincesDB(config.tbl_downloadProvince, function (dbres) {
        //    log('Found downloaded provinces: ' + dbres.rows.length.toString());
        //    if (dbres.rows.length === 0 || dbres.rows.item(0).referenceGeoID == undefined) {
        //        for (var i = 0; i < provinces.length; i++) {
        //            dprovinces[i] = {
        //                id: provinces[i].id,
        //                name: provinces[i].name,
        //                referenceGeoID: provinces[i].referenceGeoID,
        //                download: 0,
        //            };
        //        }
        //        saveDownloadProvincesDB(config.tbl_downloadProvince, dprovinces, function () {
        //            dprovinces.sort(function (a, b) {
        //                if (a.name > b.name) {
        //                    return 1;
        //                } else if (a.name < b.name) {
        //                    return -1;
        //                } else {
        //                    return 0;
        //                }
        //            });        
        //            hideDlg();
        //            $scope.changeView('home');
        //        }, function (dberr) {
        //            hideDlg();
        //            showError(dberr.message);
        //        });
        //    } else {
        //        for (var i = 0; i < dbres.rows.length; i++) {
        //            dprovinces[i] = {
        //                id: dbres.rows.item(i).id,
        //                name: dbres.rows.item(i).name,
        //                download: dbres.rows.item(i).download,
        //                referenceGeoID: dbres.rows.item(i).referenceGeoID,
        //            };
        //        }
        //        dprovinces.sort(function (a, b) {
        //            if (a.name > b.name) {
        //                return 1;
        //            } else if (a.name < b.name) {
        //                return -1;
        //            } else {
        //                return 0;
        //            }
        //        });
        //        hideDlg();
        //        $scope.changeView('home');
        //    }            
        //}, function (dberr) {
        //    hideDlg();
        //    showError(dberr.message);
        //});
    }
   
    function downloadServerConfig(callback) {
        var url = baseURL + '/config/getall';
        log('Call service api: ' + url);
        $http({
            method: config.http_method,
            url: url
        }).then(function (resp) {
            var data = resp.data;
            if (data.Status == -1) { // error
                callback(data.ErrorMessage);
            } else {
                setDlgMsg(R.update_settings);

                var syncProvinces = true;
                var syncOutletTypes = false;
                var syncMapIcons = false;
                for (var i = 0; i < data.Items.length; i++) {
                    p = data.Items[i];
                    var name = data.Items[i].Key;
                    var value = data.Items[i].Value;
                    if (name == 'calc_distance_algorithm') {
                        config.calc_distance_algorithm = value;
                    } else if (name == 'tbl_area_ver') {
                        // do nothing
                    } else if (name == 'tbl_outlettype_ver') {
                        syncOutletTypes = config.tbl_outlettype_ver != value;
                        config.tbl_outlettype_ver = value;
                    } else if (name == 'tbl_province_ver') {
                        //syncProvinces = config.tbl_province_ver != value;
                        //config.tbl_province_ver = value;
                    } else if (name == 'tbl_zone_ver') {
                        // do nothing
                    } else if (name == 'map_api_key') {
                        config.map_api_key = value;
                    } else if (name == 'http_method') {
                        config.http_method = value;
                    } else if (name == 'sync_time') {
                        config.sync_time = parseInt(value);
                    } else if (name == 'protocol') {
                        config.protocol = value;
                    } else if (name == 'max_province_download') {
                        config.max_oulet_download = value;
                    } else if (name == 'map_zoom') {
                        config.map_zoom = parseInt(value);
                        if (config.map_zoom > 21) config.map_zoom = 21;
                    } else if (name == 'cluster_size') {
                        config.cluster_size = value;
                    } else if (name == 'cluster_max_zoom') {
                        config.cluster_max_zoom = value;
                    } else if (name == 'audit_range') {
                        config.audit_range = parseInt(value);
                    } else if (name == 'audit_accuracy') {
                        config.audit_accuracy = parseInt(value);
                    } else if (name == 'download_batch_size') {
                        config.download_batch_size = parseInt(value);
                    } else if (name == 'auto_sync') {
                        config.auto_sync = parseInt(value);
                    } else if (name == 'sync_time') {
                        config.sync_time = parseInt(value);
                    } else if (name == 'sync_time_out') {
                        config.sync_time_out = parseInt(value);
                    } else if (name == 'sync_batch_size') {
                        config.sync_batch_size = parseInt(value);
                    } else if (name == 'ping_time') {
                        config.ping_time = parseInt(value);
                    } else if (name == 'refresh_time') {
                        config.refresh_time = parseInt(value);
                    } else if (name == 'refresh_time_out') {
                        config.refresh_time_out = parseInt(value);
                    } else if (name == 'session_time_out') {
                        config.session_time_out = parseInt(value);
                    } else if (name == 'border_fill_opacity') {
                        config.border_fill_opacity = parseFloat(value);
                    } else if (name == 'enable_rereverse_geo') {
                        config.enable_rereverse_geo = parseInt(value);
                    } else if (name == 'download_batch_size') {
                        config.download_batch_size = parseInt(value);
                    } else if (name == 'journal_update_time') {
                        config.journal_update_time = parseInt(value);
                    } else if (name == 'journal_distance') {
                        config.journal_distance = parseInt(value);
                    } else if (name == 'journal_accuracy') {
                        config.journal_accuracy = parseInt(value);
                    } else if (name == 'journal_color') {
                        config.journal_color = value;
                    } else if (name == 'journal_opacity') {
                        try {
                            config.journal_opacity = parseFloat(value);
                        } catch (err) {
                        }
                    } else if (name == 'journal_weight') {
                        config.journal_weight = parseInt(value);
                    } else if (name == 'journal_nonstop') {
                        config.journal_nonstop = parseInt(value);
                    } else if (name == 'enable_check_in') {
                        config.enable_check_in = parseInt(value);
                    } else if (name == 'hotlines') {
                        config.hotlines = JSON.parse(value);
                    } else if (name == 'outlet_map_icons') {
                        var mapIcons = JSON.parse(value);
                        syncMapIcons = mapIcons.version > config.map_icons_version;
                        config.map_icons_version = mapIcons.version;
                    } else if (name == 'enable_send_request') {
                        config.enable_send_request = parseInt(value);
                    } else if (name == 'get_location_time_out') {
                        config.get_location_time_out = parseInt(value);
                    } else if (name == 'item_count_max') {
                        config.item_count_max = parseInt(value);
                    } else if (name == 'submit_outlet_time') {
                        config.submit_outlet_time = parseInt(value);
                    } else if (name == 'image_width') {
                        config.image_width = parseInt(value);
                    } else if (name == 'image_height') {
                        config.image_height = parseInt(value);
                    } else if (name == 'manual_monitor_network') {
                        config.manual_monitor_network = parseInt(value);
                    }
                }

                var downloadOptions = {
                    downloadProvinces: syncProvinces,
                    downloadOutletTypes: syncOutletTypes,
                    downloadMapIcons: syncMapIcons
                };

                downloadProvinces(downloadOptions,
                    function(errMsg1) {
                        if (typeof errMsg1 != 'undefined') {
                            callback(errMsg1);
                        } else {
                            downloadOutletTypes(downloadOptions,
                                function(errMsg2) {
                                    if (typeof errMsg2 != 'undefined') {
                                        callback(errMsg2);
                                    } else {
                                        downloadOutletMapIcons(downloadOptions,
                                            function(errMsg3) {
                                                if (typeof errMsg3 != 'undefined') {
                                                    callback(errMsg3);
                                                } else {
                                                    insertSettingDB(config,
                                                        function(errMsg4) {
                                                            callback(errMsg4);
                                                        });
                                                }
                                            });
                                    }
                                });
                        }
                    });
            }
        }, handleHttpError);
    }

    function downloadProvinces(downloadOptions, callback) {
        getProvinceDataDB(function (dbres) {
            var notDownload = dbres.rows.length === 0 || dbres.rows.item(0).referenceGeoID == undefined;
            if (notDownload || downloadOptions.downloadProvinces === true) {
                setDlgMsg(R.download_provinces);
                var url = baseURL + '/provinces/getall';
                log('Call service api: ' + url);
                $http({
                    method: config.http_method,
                    url: url
                }).then(function(resp) {
                        var data = resp.data;
                        if (data.Status === -1) { // error
                            callback(data.ErrorMessage);
                        } else {

                            var curProvinces = [];
                            for (var i = 0; i < dbres.rows.length; i++) {
                                curProvinces.push(
                                    {
                                        id: dbres.rows.item(i).id,
                                        name: dbres.rows.item(i).name,
                                        download: dbres.rows.item(i).download,
                                        referenceGeoID: dbres.rows.item(i).referenceGeoID
                                    });
                            }

                            insertProvincesDB(curProvinces, data.Items, callback);
                        }
                    },
                    function() {
                        callback("Cannot connect to server!");
                    });
            } else {
                provinces.sort(function (a, b) {
                    var n1 = changeAlias(a.name);
                    var n2 = changeAlias(b.name);

                    if (n1 > n2) {
                        return 1;
                    } else if (n1 < n2) {
                        return -1;
                    } else {
                        return 0;
                    }
                });

                callback();
            }
        });
    }

    function downloadOutletTypes(downloadOptions, callback) {
        if (!downloadOptions.downloadOutletTypes) {
            callback();
        } else { // force download
            setDlgMsg(R.download_outlet_types);
            var url = baseURL + '/outlet/getoutlettypes';
            log('Call service api: ' + url);
            $http({
                method: config.http_method,
                url: url
            }).then(function(resp) {
                    var data = resp.data;
                    if (data.Status === -1) { // error
                        callback(data.ErrorMessage);
                    } else {
                        insertOutletTypesDB(data.Items, callback);
                    }
                },
                function() {
                    callback("Cannot connect to server!");
                });
        }
    }

    function downloadOutletMapIcons(downloadOptions, callback) {
        if (!downloadOptions.downloadMapIcons) {
            callback();
        } else {
            setDlgMsg(R.download_map_icons);
            var url = baseURL + '/config/downloadmapicons';
            log('Call service api: ' + url);
            $http({
                method: config.http_method,
                url: url
            }).then(function(resp) {
                    var data = resp.data;
                    if (data.Status === -1) { // error
                        callback(data.ErrorMessage);
                    } else {
                        for (var i = 0; i < data.Icons.length; i++) {
                            var name = data.Icons[i].Key;
                            var value = data.Icons[i].Value;

                            if (name == 'tc_salesman_outlet') {
                                config.map_tc_salesman_outlet = value;
                            } else if (name == 'tc_salesman_outlet_denied') {
                                config.map_tc_salesman_outlet_denied = value;
                            } else if (name == 'tc_auditor_outlet') {
                                config.map_tc_auditor_outlet = value;
                            } else if (name == 'tc_auditor_outlet_denied') {
                                config.map_tc_auditor_outlet_denied = value;
                            } else if (name == 'tc_agency_new_outlet') {
                                config.map_tc_agency_new_outlet = value;
                            } else if (name == 'tc_agency_new_outlet_denied') {
                                config.map_tc_agency_new_outlet_denied = value;
                            } else if (name == 'tc_agency_new_outlet_approved') {
                                config.map_tc_agency_new_outlet_approved = value;
                            } else if (name == 'tc_agency_existing_outlet_edited') {
                                config.map_tc_agency_existing_outlet_edited = value;
                            } else if (name == 'tc_agency_existing_outlet_denied') {
                                config.map_tc_agency_existing_outlet_denied = value;
                            } else if (name == 'tc_agency_existing_outlet_approved') {
                                config.map_tc_agency_existing_outlet_approved = value;
                            } else if (name == 'tc_agency_auditor_new_outlet') {
                                config.map_tc_agency_auditor_new_outlet = value;
                            } else if (name == 'tc_agency_auditor_new_outlet_denied') {
                                config.map_tc_agency_auditor_new_outlet_denied = value;
                            } else if (name == 'tc_agency_auditor_new_outlet_approved') {
                                config.map_tc_agency_auditor_new_outlet_approved = value;
                            } else if (name == 'sr_outlet_audit_denied') {
                                config.map_sr_outlet_audit_denied = value;
                            } else if (name == 'sr_outlet_audit_approved') {
                                config.map_sr_outlet_audit_approved = value;
                            } else if (name == 'sr_outlet_closed') {
                                config.map_sr_outlet_closed = value;
                            } else if (name == 'sr_outlet_non_track') {
                                config.map_sr_outlet_non_track = value;
                            } else if (name == 'sr_outlet_opened') {
                                config.map_sr_outlet_opened = value;
                            } else if (name == 'dis_outlet_audit_denied') {
                                config.map_dis_outlet_audit_denied = value;
                            } else if (name == 'dis_outlet_audit_approved') {
                                config.map_dis_outlet_audit_approved = value;
                            } else if (name == 'dis_outlet_closed') {
                                config.map_dis_outlet_closed = value;
                            } else if (name == 'dis_outlet_opened') {
                                config.map_dis_outlet_opened = value;
                            }
                        }

                        callback();
                    }
                },
                function() {
                    callback("Cannot connect to server!");
                });
        }
    }

    function enableBackgroundMode() {
        return;

        try {
            // Android customization
            cordova.plugins.backgroundMode.setDefaults({ text: 'Trade Census.' });
            // Enable background mode
            cordova.plugins.backgroundMode.enable();
            // Called when background mode has been activated
            cordova.plugins.backgroundMode.onactivate = function () {
                try {
                    isRunningInBackgound = true;
                    turnOntrackLocationWhenAppInBackground();
                }
                catch (err) {
                    log(err);
                }

                setTimeout(function () {
                    // Modify the currently displayed notification
                    cordova.plugins.backgroundMode.configure({
                        text: 'Running in background.'
                    });
                }, 5000);
            };

            cordova.plugins.backgroundMode.ondeactivate = function () {
                isRunningInBackgound = false;
            };
        }
        catch (err) {
            log(err);
        }
    }
};