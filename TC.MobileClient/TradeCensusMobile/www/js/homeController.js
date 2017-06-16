/// <reference path="tradecensus.js" />
/// <reference path="tc.outletAPI.js" />
/// <reference path="tc.mapAPI.js" />
/// <reference path="tc.dlgAPI.js" />
/// <reference path="tc.databaseAPI.js" />
/// <reference path="tc.appAPI.js" />

var isOutletDlgOpen = false;
var __isLoadingOutlet = false;
var dialogClosedCallback;

function homeController($scope, $http, $mdDialog, $mdMedia, $timeout) {
    log('Enter Home page');
    $scope.R = R;
    log(user);
    logoutCallback = function () {
        $scope.changeView('login');
    };

    var appReady = false;
    var leftPanelStatus = 0;
    var righPanelStatus = 0;
    var viewDropdown = 0;
    var selectProvince;

    var curOutletView = 0; // 0: near-by; 1: new: 2: updated 4: audit
    $scope.testlat = curlat;
    $scope.testlng = curlng;
    $scope.testacc = curacc;

    $scope.curPass = '';
    $scope.newPass = '';
    $scope.confirmPass = '';

    $scope.mapReady = false;
    $scope.isSatellite = false;
    $scope.canAddNewOutlet = true; //!user.hasAuditRole;
    $scope.dprovinces = dprovinces;
    $scope.config = config;
    $scope.editOutletFull = false;
    $scope.hasAuditRole = user.hasAuditRole;
    $scope.outletHeader = R.near_by_outlets;
    $scope.showNoOutletFound = true;
    $scope.showSyncButton = false;
    $scope.outlets = [];
    $scope.showCollapseButton = false;
    $scope.showExpandButton = false;
    $scope.showSettingCollapse = false;
    $scope.showSettingExpand = true;
    $scope.showSearchImg = true;
    $scope.showClearSearchImg = false;
    $scope.viewOutletPanel = false;
    $scope.currentPage = 0;
    $scope.pageSize = config.page_size;
    $scope.hotlines = config.hotlines;
    $scope.enableNearby = true;
    $scope.enableSearch = false;

    for (var i = 0; i < dprovinces.length; i++) {
        if (dprovinces[i].id == $scope.config.province_id) {
            selectProvince = dprovinces[i];
            if (dprovinces[i].download) {
                $("#buttonDownload").css('display', 'none');
                $("#buttonRedownload").css('display', 'table');
                $("#buttonDeleteOffline").css('display', 'table');
            } else {
                $("#buttonDownload").css('display', 'table');
                $("#buttonRedownload").css('display', 'none');
                $("#buttonDeleteOffline").css('display', 'none');
            }
            break;
        }
    }

    for (var i = 0; i < provinces.length; i++) {
        if (provinces[i].id === $scope.config.province_id) {
            addressModel.provinceRaw = provinces[i];
            break;
        }
    }

    //*************************************************************************
    $scope.logoutFromHome = function () {
        selectAllUnsyncedOutlets(config.tbl_outlet,
             function (dbres) {
                 if (dbres.rows.length > 0) {
                     showConfirm('Logout', 'Your data is still not synced to server. Are you sure you want to logout?', function () {
                         $scope.changeView('login');
                     }, function () { });
                 } else {
                     $scope.changeView('login');
                 }
             }, function (dberr) {
                 $scope.changeView('login');
             });
    }

    //*************************************************************************
    $scope.testChangeLocation = function () {
        devLat = $scope.testlat;
        devLng = $scope.testlng;
        lastLoadLocationTS = null;
        handleLocationChange($scope.testlat, $scope.testlng, $scope.testacc);
    }

    //*************************************************************************
    $scope.panToCurLocation = function () {
        moveToCurrentLocation();
    }

    //*************************************************************************
    $scope.clearSearch = function () {
        $scope.searchName = '';
        $scope.searchChanged();
    };

    //*************************************************************************
    $scope.searchChanged = function () {
        log('Reset page index');
        $scope.currentPage = 0;
        if (isEmpty($scope.searchName)) {
            $scope.showSearchImg = true;
            $scope.showClearSearchImg = false;
            if (curOutlets.length == 0) return;
            $scope.outlets.length = 0;
            for (var i = 0; i < curOutlets.length; i++) {
                $scope.outlets[i] = curOutlets[i];
            }
        } else {
            $scope.showSearchImg = false;
            $scope.showClearSearchImg = true;
            if (curOutlets.length == 0) return;
            $scope.outlets.length = 0;
            var foundIndex = 0;
            var searchText = changeAlias($scope.searchName).toUpperCase();
            for (var i = 0; i < curOutlets.length; i++) {
                var text = changeAlias(curOutlets[i].Name);
                if (text.toUpperCase().indexOf(searchText) > -1) {
                    $scope.outlets[foundIndex] = curOutlets[i];
                    foundIndex++;
                }
            }
        }
    }

    //*************************************************************************
    $scope.numberOfPages = function () {
        return Math.ceil($scope.outlets.length / $scope.pageSize);
    }

    //*************************************************************************
    $scope.pageSizeChanged = function () {
        $scope.pageSize = $scope.config.page_size;
        log('Change page size: ' + $scope.pageSize.toString());
    }

    //*************************************************************************
    $scope.navPrev = function () {
        $scope.currentPage = $scope.currentPage - 1
        //$('#outlet-list').scrollTop(0);
    }

    //*************************************************************************
    $scope.navNext = function () {
        $scope.currentPage = $scope.currentPage + 1;
        //$('#outlet-list').scrollTop(0);
    }

    //*************************************************************************
    $scope.refresh = function () {
        if (curOutletView == 0) nearByOutlets = [];
        getOutletsByView(false);
    }

    //*************************************************************************
    $scope.closeStreetViewMode = function () {
        panorama.setVisible(false);
    }

    //*************************************************************************
    $scope.closeLeftPanel = function () {
        $scope.hideDropdown();
        leftPanelStatus = 0;
        //$scope.showListButton = true;
        $scope.showCollapseButton = false;
        $scope.showExpandButton = false;
        $scope.viewOutletFull = false;
        $scope.showNaviBar = false;
        $scope.viewOutletPanel = false;
        $("#outletPanel").css('width', '0%');
        $("#slider-left-content").css('margin-bottom', '4px');
    }

    //*************************************************************************  
    $scope.expandOutletPanel = function () {
        $scope.hideDropdown();
        leftPanelStatus = 2;

        $scope.viewOutletPanel = true;
        $scope.showExpandButton = false;
        $scope.showCollapseButton = true; // networkReady();
        $scope.viewOutletFull = true;
        if (isEmpty($scope.searchName)) {
            $scope.showNaviBar = $scope.outlets.length > $scope.pageSize;
        } else {
            $scope.showNaviBar = true;
        }
        if ($scope.showNaviBar)
            $("#slider-left-content").css('margin-bottom', '48px');
        else
            $("#slider-left-content").css('margin-bottom', '4px');
        log('navBarStatus: ' + $scope.showNaviBar.toString());
        $("#outletPanel").css('width', '100%');
    }

    //*************************************************************************  
    $scope.collapseOutletPanel = function () {
        $scope.hideDropdown();
        $scope.viewOutletPanel = true;
        $scope.showExpandButton = $scope.outlets.length > 0;
        $scope.showCollapseButton = false;
        $scope.viewOutletFull = false;
        if (isEmpty($scope.searchName)) {
            $scope.showNaviBar = $scope.outlets.length > $scope.pageSize;
        } else {
            $scope.showNaviBar = true;
        }
        $("#outletPanel").css('width', '42%');
        if ($scope.showNaviBar)
            $("#slider-left-content").css('margin-bottom', '48px');
        else
            $("#slider-left-content").css('margin-bottom', '4px');
    }

    //*************************************************************************
    $scope.showhideOutletPanel = function () {
        $scope.hideDropdown();
        $scope.showCollapseButton = false;

        if ($scope.viewOutletPanel) {
            $scope.viewOutletPanel = false;
            leftPanelStatus = 0;
            $scope.showExpandButton = false;
            $scope.viewOutletFull = false;
            $scope.showNaviBar = false;
            $scope.clearSearch();
            $("#outletPanel").css('width', '0%');
            $("#slider-left-content").css('margin-bottom', '4px');
        } else {
            leftPanelStatus = 1;
            $scope.viewOutletPanel = true;
            $scope.showExpandButton = $scope.outlets.length > 0;
            $scope.viewOutletFull = false;
            $scope.showNaviBar = $scope.outlets.length > $scope.pageSize;

            $("#outletPanel").css('width', '42%');
            if ($scope.showNaviBar)
                $("#slider-left-content").css('margin-bottom', '48px');
            else
                $("#slider-left-content").css('margin-bottom', '4px');
        }
    }

    //*************************************************************************
    var tempPageSize = 0;
    $scope.showHideRightPanel = function () {
        if (righPanelStatus == 0) {
            if ($scope.journal.viewPanel)
                $scope.journal.hidePanel();

            $scope.cfg.showPanel();
        } else {
            $scope.cfg.hidePanel();
        }
    }

    //*************************************************************************
    $scope.showDropdown = function () {
        if (viewDropdown) {
            viewDropdown = 0;
            $("#outlet-dropdown").css('display', 'none');
        } else {
            viewDropdown = 1;
            $("#outlet-dropdown").css('display', 'block');
        }
    }

    //*************************************************************************
    $scope.hideDropdown = function () {
        viewDropdown = 0;
        $("#outlet-dropdown").css('display', 'none');
    }

    //*************************************************************************
    $scope.openOutlet = function (i) {
        editOutlet(i, true);
        /*
        var marker = markers[i];
        try{
            google.maps.event.trigger(marker, 'click');
        }catch(ex){
            log(ex);
        };                           
        panTo(marker.position.lat(), marker.position.lng());
        */
    }

    //*************************************************************************
    $scope.changeOutletView = function (v) {
        $scope.hideDropdown();
        if (curOutletView === v) return;
        $scope.closeLeftPanel();

        var previousView = curOutletView;
        curOutletView = v;
        $scope.currentPage = 0;
        switchView(previousView, curOutletView);
        switch (curOutletView) {
            case 0:
                $scope.outletHeader = R.near_by_outlets;
                getOutletsByView(false);
                break;
            case 1:
                $scope.outletHeader = R.new_outlets;
                getOutletsByView(false);
                break;
            case 2:
                $scope.outletHeader = R.updated_outlets;
                getOutletsByView(false);
                break;
            case 3:
                $scope.outletHeader = R.auditted_outlets;
                getOutletsByView(false);
                break;
            case 4:
                $scope.outletHeader = R.my_new_outlets;
                getOutletsByView(false);
                break;
            case 5:
                $scope.outletHeader = R.search_outlets;
                break;
        }
    }

    function switchView(previousView, curOutletView) {
        if (previousView <= 4 && curOutletView == 5) {
            $scope.enableNearby = false;
            $scope.enableSearch = true;
        } else if (previousView == 5 && curOutletView <= 4) {
            $scope.enableNearby = true;
            $scope.enableSearch = false;
        }
    }

    //*************************************************************************
    $scope.createNewOutlet = function () {
        showCurPositionDlg(false,
            function (lat, lng) {
                var curAccRound = parseInt(curacc);
                if (curAccRound <= $scope.config.audit_accuracy) {
                    if (!networkReady()) {
                        var hasDownloadProvince = false;
                        for (var i = 0; i < dprovinces.length; i++) {
                            if (dprovinces[i].download) {
                                hasDownloadProvince = true;
                                break;
                            }
                        }
                        if (!hasDownloadProvince) {
                            showError('There is no downloaded provices!');
                            return;
                        }
                    }
                    addNewOutlet();
                } else {
                    showError(R.msg_validate_accuracy_1);
                }
            },
            function (err) {
                console.error(err);
            });
    }

    //*************************************************************************
    $scope.syncOutlets = function () {
        if (!networkReady()) {
            showError(R.check_network_connection);
            return;
        }
        showDlg(R.synchronize_outlets, R.please_wait);
        selectAllUnsyncedOutlets(config.tbl_outlet,
            function (dbres) {
                log('Found unsynced outlets: ' + dbres.rows.length.toString());
                if (dbres.rows.length == 0) {
                    showInfo(R.synchronize_completed);
                    return;
                }
                unsyncedOutlets = [];
                for (var i = 0; i < dbres.rows.length; i++) {
                    unsyncedOutlets[i] = dbres.rows.item(i);
                }

                submitUnsyncedOutlets(unsyncedOutlets, function () {
                    OUTLET.lastSync = new Date();
                    showInfo(R.synchronize_completed);
                    $("#home-topright-sync-hint").css('display', 'none');
                }, function (err) {
                    showInfo(err);
                });
            }, handleDBError);
    }

    //*************************************************************************
    $scope.deleteOutlet = function (outlet) {       
        //var outlet = $scope.outlets[i];
        var confirmText = R.delete_outlet_confirm.replace("{outletname}", outlet.Name);
        showConfirm(R.delete_outlet, confirmText, function () {
            deleteDraftOutlet(outlet);
        }, function () { });
    }

    //*************************************************************************    
    $scope.postOutlet = function (outlet) {
        loadImagesIfNeed(outlet, function () {            
            if (isEmpty(outlet.StringImage1) && isEmpty(outlet.StringImage2) && isEmpty(outlet.StringImage3) &&
                //isEmpty(outlet.StringImage4) && // ignore selfie image
                isEmpty(outlet.StringImage5) && isEmpty(outlet.StringImage6)) {
                showValidationErr(R.need_to_capture);
            }
            else
                performPostOutlet(outlet);
        });
    }

    //*************************************************************************
    function performPostOutlet(outlet) {
        var confirmText = R.post_outlet_confirm.replace("{outletname}", outlet.Name);
        showConfirm(R.post_outlet, confirmText, function () {
            var clonedOutlet = cloneObj(outlet);
            clonedOutlet.positionIndex = outlet.positionIndex;

            if (clonedOutlet.AuditStatus == StatusNew) {
                clonedOutlet.IsDraft = false;
                clonedOutlet.AuditStatus = StatusPost;
            } else {
                clonedOutlet.IsExistingDraft = false;
                clonedOutlet.AuditStatus = StatusExitingPost;
            }
            clonedOutlet.AmendBy = userID;

            OUTLET.saveOutlet($http, clonedOutlet, OUTLET_EDIT, 0, function () { $scope.refresh(); });

            //log('Post outlet ' + outlet.ID.toString());
            //outlet.AuditStatus = StatusPost;
            //log('Save outlet to server')
            //saveOutlet(clonedOutlet, function (synced) {
            //    log('Save outlet to local db')
            //    changeOutletStatusDB($scope.config.tbl_outlet, clonedOutlet, clonedOutlet.AuditStatus, synced ? 1 : 0, function () {
            //        hideDlg();
            //        $scope.refresh();
            //    }, function (dberr) {
            //        hideDlg();
            //        showError(dberr.message);
            //    });
            //});

        }, function () { });
    }

    //*************************************************************************    
    $scope.reviseOutlet = function (outlet) {                       
        loadImagesIfNeed(outlet, function () {
            performReviseOutlet(outlet);
        });
    }

    //
    function performReviseOutlet(outlet) {
        var confirmText = R.revise_outlet_confirm.replace("{outletname}", outlet.Name);
        showConfirm(R.revise_outlet, confirmText, function () {
            var clonedOutlet = cloneObj(outlet);
            clonedOutlet.positionIndex = outlet.positionIndex;

            if (clonedOutlet.AuditStatus == StatusPost) {
                clonedOutlet.IsDraft = true;
                clonedOutlet.AuditStatus = StatusNew;
            } else {
                clonedOutlet.IsExistingDraft = true;
                clonedOutlet.AuditStatus = StatusEdit;
            }

            clonedOutlet.IsDraft = true;
            clonedOutlet.IsExistingDraft = true;
            clonedOutlet.AmendBy = userID;

            OUTLET.saveOutlet($http, clonedOutlet, OUTLET_EDIT, 0, function () { $scope.refresh(); });

            //saveOutlet(clonedOutlet, function (synced) {
            //    log('Save outlet to local db')
            //    changeOutletStatusDB($scope.config.tbl_outlet, clonedOutlet, clonedOutlet.AuditStatus, synced ? 1 : 0, function () {                    
            //        $scope.refresh();
            //    }, function (dberr) {                
            //        showError(dberr.message);
            //    });
            //});

        }, function () { });
    }

    //*************************************************************************    
    $scope.revertOutlet = function (outlet) {
        var confirmText = R.revert_outlet_confirm.replace("{outletname}", outlet.Name);
        showConfirm(R.revert_outlet, confirmText, function () {
            var clonedOutlet = cloneObj(outlet);
            clonedOutlet.positionIndex = outlet.positionIndex;

            clonedOutlet.AuditStatus = StatusRevert;
            clonedOutlet.AmendBy = userID;

            log('Save outlet to server')
            saveOutlet(clonedOutlet, function (synced) {
                log('Save outlet to local db')
                changeOutletStatusDB($scope.config.tbl_outlet, clonedOutlet, clonedOutlet.AuditStatus, synced ? 1 : 0, function () {
                    hideDlg();
                    $scope.refresh();
                }, function (dberr) {
                    hideDlg();
                    showError(dberr.message);
                });
            });

        }, function () { });
    }

    //*************************************************************************    
    $scope.approveOutlet = function (outlet) {
        showCurPositionDlg(false, function (lat, lng) {
            var confirmText = R.approve_outlet_confirm.replace("{outletname}", outlet.Name);
            showConfirm(R.approve_outlet, confirmText, function () {
                var clonedOutlet = cloneObj(outlet);
                clonedOutlet.AuditStatus = StatusAuditorAccept;
                clonedOutlet.AmendBy = userID;
                //log('Post outlet ' + outlet.ID.toString());
                //outlet.AuditStatus = StatusPost;
                log('Save outlet to server')
                saveOutlet(clonedOutlet, function (synced) {
                    log('Save outlet to local db')
                    changeOutletStatusDB($scope.config.tbl_outlet, clonedOutlet, clonedOutlet.AuditStatus, synced ? 1 : 0, function () {
                        hideDlg();
                        $scope.refresh();
                    }, function (dberr) {
                        hideDlg();
                        showError(dberr.message);
                    });
                });
            }, function () { });
        }, function () {
            hideDlg();
            showError(R.cannot_approve_or_deny);
        })
    }

    //*************************************************************************    
    $scope.provinceChanged = function () {

        var provId = $scope.config.province_id;
        log('Change to province: ' + provId.toString());

        for (var i = 0; i < dprovinces.length; i++) {
            if (dprovinces[i].id === provId) {
                selectProvince = dprovinces[i];
                if (dprovinces[i].download) {
                    $("#buttonDownload").css('display', 'none');
                    $("#buttonRedownload").css('display', 'table');
                    $("#buttonDeleteOffline").css('display', 'table');
                } else {
                    $("#buttonDownload").css('display', 'table');
                    $("#buttonRedownload").css('display', 'none');
                    $("#buttonDeleteOffline").css('display', 'none');
                }
                break;
            }
        }

        for (var i = 0; i < provinces.length; i++) {
            if (provinces[i].id === provId) {
                addressModel.provinceRaw = provinces[i];
                break;
            }
        }

        addressModel.districtArr = [];
        addressModel.wardArr = [];
    }

    //*************************************************************************    
    $scope.deleteOfflineOutlets = function () {
        var p = selectProvince;
        showConfirm(R.confirm, R.delete_offline_outlets_of + p.name + '?', function () {
            selectUnsyncedOutletsOfProvince($scope.config.tbl_outlet, p.id, function (dbres) {
                if (dbres.rows.length > 0) {
                    showDlg(R.error, R.unsynced_outlet_in_province);
                    return;
                }
                //showLoading(R.label_deleting, R.please_wait);
                p.download = 0;
                updateProvinceActionView();

                deleleDownloadProvinceDB($scope.config.tbl_outlet, $scope.config.tbl_downloadProvince, p.id, function () {
                    //hideDlg();
                    //p.download = 0;
                    //try {
                    //    $scope.$apply();
                    //} catch (err) {
                    //}
                    //updateProvinceActionView();
                }, function (dberr) {
                    //hideDlg();
                    //showError(dberr.message);
                });
            }, function (dberr) {
                showError(dberr.message);
            });
        }, function () { });
    }

    function validateRange(lat, lng) {
        var d = calcDistance({ Lat: lat, Lng: lng }, { Lat: $scope.outlet.Latitude, Lng: $scope.outlet.Longitude });
        if (d > $scope.config.audit_range) {
            var errMsg = R.ovar_audit_distance.replace('{distance}', $scope.config.audit_range.toString());
            showError(errMsg);
            return false;
        }
        return true;
    }

    //*************************************************************************
    var lastDownloadProvinceTS = new Date();
    var downloadSession = 1;
    $scope.downloadOutlets = function () {
        var now = new Date();
        if (getDifTime(lastDownloadProvinceTS, now) < 5) {
            return;
        }

        if (!networkReady()) {
            showError(R.download_network_warn);
            return;
        }
        var p = selectProvince;
        var downloadedCount = 0;
        for (var i = 0; i < $scope.dprovinces.length; i++) {
            if ($scope.dprovinces[i].download && p.id != $scope.dprovinces[i].id)
                downloadedCount++;

            if (downloadedCount >= config.max_oulet_download) {
                showError(R.reach_maximum_download);
                return;
            }
        }

        if (!addressModel.provinceRaw) {
            for (var i = 0; i < provinces.length; i++) {
                if (provinces[i].id === selectProvince.id) {
                    addressModel.provinceRaw = provinces[i];
                    break;
                }
            }
        }

        try {
            showDlg(R.validate_unsynced_outlets, R.please_wait);
            selectUnsyncedOutletsOfProvince($scope.config.tbl_outlet, p.id, function (dbres) {
                hideDlg();
                if (dbres.rows.length > 0) {
                    showDlg(R.error, R.unsynced_outlet_in_province);
                    return;
                }
                isOutletDlgOpen = true;

                showConfirm(R.download_outlets, R.download_outlets_confim + selectProvince.name + '?', function () {
                    setTimeout(function () {
                        downloadSession++;
                        try {
                            showLoading(R.downloading_outlet, R.please_wait, R.cancel_download_confirm,
                                function () {
                                    isOutletDlgOpen = false;
                                    if (dialogClosedCallback) dialogClosedCallback();
                                    log('*** CANCEL download');
                                    cancelLoadingDlg = true;
                                    downloadSession++;
                                }
                            );
                            var sessionID = downloadSession;
                            var url = baseURL + '/outlet/gettotalbyprovince/' + userID + '/' + pass + '/' + selectProvince.id;
                            log('Call service api: ' + url);
                            $http({
                                method: config.http_method,
                                url: url
                            }).then(function (resp) {
                                if (cancelLoadingDlg || sessionID != downloadSession) {
                                    lastDownloadProvinceTS = new Date();
                                    isOutletDlgOpen = false;
                                    if (dialogClosedCallback) dialogClosedCallback();
                                    return;
                                }
                                try {
                                    var outletCount = resp.data;
                                    if (outletCount > 0) {
                                        deleleOutletsDB(config.tbl_outlet, selectProvince.id,
                                            function () {
                                                log('Found ' + outletCount.toString() + ' outlets');
                                                var maxPage1 = parseInt(outletCount / $scope.config.download_batch_size)
                                                var maxPage2 = outletCount % $scope.config.download_batch_size;
                                                var maxPage = maxPage1 + (maxPage2 > 0 ? 1 : 0);

                                                downloadProvinceOutletsZip(selectProvince.id, sessionID, 0, maxPage,
                                                    function () {
                                                        downloadDistricts(addressModel.provinceRaw.referenceGeoID, function () {
                                                            isOutletDlgOpen = false;
                                                            if (dialogClosedCallback) dialogClosedCallback();
                                                            if (sessionID == downloadSession) {
                                                                changeDownloadProvinceStatusDB(config.tbl_downloadProvince, selectProvince.id, 1, function () {
                                                                    selectProvince.download = 1;
                                                                    hideLoadingDlg();
                                                                    showInfo('Download outlets completed!');
                                                                    if (selectProvince.download) {
                                                                        $("#buttonDownload").css('display', 'none');
                                                                        $("#buttonRedownload").css('display', 'table');
                                                                        $("#buttonDeleteOffline").css('display', 'table');
                                                                    }
                                                                }, function (dberr) {
                                                                    showError(dberr.message);
                                                                });
                                                            }
                                                        });
                                                    }, function (errMsg) {
                                                        isOutletDlgOpen = false;
                                                        if (dialogClosedCallback) dialogClosedCallback();
                                                        if (sessionID == downloadSession) {
                                                            showError(errMsg);
                                                        }
                                                    }, function () {
                                                        isOutletDlgOpen = false;
                                                        if (dialogClosedCallback) dialogClosedCallback();
                                                        try {
                                                            hideLoadingDlg();
                                                        }
                                                        catch (er) { };
                                                    })
                                            },
                                            function (err) {
                                                if (sessionID == downloadSession) {
                                                    showError(err.message);
                                                }
                                            });
                                    }
                                    else {
                                        if (sessionID == downloadSession) {
                                            hideLoadingDlg();
                                            showInfo(R.no_outlet_found);
                                        }
                                    }
                                } catch (err) {
                                    showError(err.message);
                                    isOutletDlgOpen = false;
                                    if (dialogClosedCallback) dialogClosedCallback();
                                }
                            }, function (err) {
                                if (sessionID == downloadSession) {
                                    isOutletDlgOpen = false;
                                    if (dialogClosedCallback) dialogClosedCallback();
                                    showError($scope.R.text_ConnectionTimeout);
                                    log('HTTP error...');
                                    log(err);
                                    //hideDlg();
                                    //var msg = err.statusText == '' ? $scope.R.text_ConnectionTimeout : err.statusText;
                                }
                            });
                        } catch (ex) {
                            showError(ex.message);
                            isOutletDlgOpen = false;
                            if (dialogClosedCallback) dialogClosedCallback();
                        }
                        lastDownloadProvinceTS = new Date();
                    }, 500);
                }, function () {
                    isOutletDlgOpen = false;
                    if (dialogClosedCallback) dialogClosedCallback();
                });
            }, function (tx, dberr) {
                showError(dberr.message);
                isOutletDlgOpen = false;
                if (dialogClosedCallback) dialogClosedCallback();
            });
        }
        catch (e) {
            showError(e.message);
            isOutletDlgOpen = false;
            if (dialogClosedCallback) dialogClosedCallback();
        }
    }

    //*************************************************************************
    function addNewOutlet() {
        var selfieImage = null;
        var addOutletFunc = function () {
            var provinceId = 0;
            if (addressModel.province) {
                provinceId = addressModel.province.ID;
            }
            else {
                var provId = $scope.config.province_id;
                for (var i = 0; i < provinces.length; i++) {
                    if (provinces[i].id == $scope.config.province_id) {
                        provinceId = provinces[i].referenceGeoID;
                        break;
                    }
                }
            }

            if (networkReady()) {
                if (addressModel.districtArr.length == 0 && provinceId > 0) {
                    //var url = baseURL + '/border/getsubbordersbyparentname/' + addressModel.province;
                    var url = baseURL + '/border/getsubborders/' + provinceId.toString();
                    log('Call service api: ' + url);                
                    $http({
                        method: config.http_method,
                        url: url
                    }).then(function (resp) {                        
                        try {
                            var data = resp.data;
                            if (data.Status == -1) { // error
                                tcutils.messageBox.error(data.ErrorMessage);
                            } else {
                                addressModel.districtArr = data.Items;
                                loadWardIfNot(function () {
                                    tryCreateNewOutlet(curlat, curlng,
                                        '',
                                        addressModel.ward ? addressModel.ward.Name : '',
                                        addressModel.district ? addressModel.district.Name : '',
                                        '', 
                                        selfieImage);
                                });
                            }                           
                        } catch (err) {
                            tcutils.messageBox.error(err.message);                          
                        }
                    }, function (err) {
                        log(err);
                        tryCreateNewOutlet(curlat, curlng, '', '', '', '', selfieImage);                      
                    });
                }
                else {
                    loadWardIfNot(function () {
                        tryCreateNewOutlet(curlat, curlng,
                                        '',
                                        addressModel.ward ? addressModel.ward.Name : '',
                                        addressModel.district ? addressModel.district.Name : '',
                                        '',
                                        selfieImage);
                    });
                }
            } else {
                addressModel.getDistricts(provinceId, function (districts) {
                    addressModel.districtArr = districts;
                    tryCreateNewOutlet(curlat, curlng, '', '', '', '', selfieImage);
                });
            }
        };

        if (!config.enable_check_in) {
            addOutletFunc();
        } else {
            captureImage(function (imageURI) {
                getFileContentAsBase64(imageURI, function (content) {
                    selfieImage = content.replace('data:image/jpeg;base64,', '');
                    addOutletFunc();
                })
            }, function (err) {
                log(err);
                showError('Cannot create new outlet because without selfie image');
            }, true); // front camera
        }
    }

    function loadWardIfNot(callback) {
        if (addressModel.wardArr.length == 0 && addressModel.district) {
            
            dialogUtils.showClosableDlg('Load sub border data', R.please_wait, function (hideDlgFunc, isCancelledFunc) {
                var url = baseURL + '/border/getsubborders/' + addressModel.district.ID;
                log('Call service api: ' + url);
                $http({
                    method: config.http_method,
                    url: url
                }).then(function (resp) {
                    if (isCancelledFunc()) return;
                    hideDlgFunc();

                    var data = resp.data;
                    if (data.Status == -1) { // error
                        tcutils.logging.error(data.ErrorMessage);
                    } else {
                        addressModel.wardArr = data.Items;
                    }
                    callback();
                }, function (err) {
                    if (isCancelledFunc()) return;
                    hideDlgFunc();

                    tcutils.logging.error(err);
                    callback();
                });
            });
            
            //tcutils.messageBox.loading(R.loading, R.please_wait);
           
        }
        else
            callback();
    }

    //*************************************************************************
    function tryCreateNewOutlet(lat, lng, address2, ward, district, province, selfieImage) {
        tryOpenDialog(function () {            
            var outlet = newOutlet(province);
            outlet = newOutlet(province);
            outlet.AddLine2 = address2;
            outlet.Ward = ward;
            outlet.District = district;
            isNewOutlet = true;
            outlet.StringImage4 = selfieImage;
            hideDlg();

            OUTLET.dialog.open(
                   function () {
                       $mdDialog.show({
                           scope: $scope.$new(),
                           controller: newOutletController,
                           templateUrl: 'views/outletCreate.html',
                           parent: angular.element(document.body),
                           clickOutsideToClose: false,
                           fullscreen: false,
                       })
                   },
                   outlet,
                   function (answer, outlet) {
                       console.debug('Save outlet...');
                       if (user.hasAuditRole) {
                           outlet.AuditStatus = StatusAuditorNew;
                       } else {
                           outlet.AuditStatus = (outlet.IsDraft) ? StatusNew : StatusPost;
                       }
                       console.debug('Audit Status: ' + outlet.AuditStatus.toString());
                       OUTLET.saveOutlet($http, outlet, OUTLET_NEW, 0, function () { $scope.refresh(); });
                   });
        });
    }

    //*************************************************************************
    function downloadProvinceOutletsZip(provinceID, sessionID, page, maxPage, onSuccess, onError, onCancel) {
        try {
            if (cancelLoadingDlg || sessionID != downloadSession) {
                onCancel();
                return;
            }
            var percent = (page + 1) * 100 / maxPage;
            var downloadMessage = R.downloading_outlet_msg.replace("{percent}", parseInt(percent).toString());
            //downloadMessage = downloadMessage.replace('{total}', maxPage.toString());

            var from = page * $scope.config.download_batch_size;
            var to = from + $scope.config.download_batch_size;

            showLoading(downloadMessage, R.downloading_outlet_get_outlets);
            //outlet/download/{personID}/{provinceID}/{from}/{to}
            var url = baseURL + '/outlet/downloadzip/' + userID + '/' + pass + '/' + provinceID + '/' + from.toString() + '/' + to.toString();
            log('Call service api: ' + url);
            $http({
                method: config.http_method,
                url: url
            }).then(function (resp) {
                try {
                    if (cancelLoadingDlg || sessionID != downloadSession) {
                        onCancel();
                        return;
                    }

                    items = JSON.parse(resp.data);
                    //items = JArray.Parse(resp.data); // parse as array  
                    if (items.length > 0) {
                        showLoading(downloadMessage, R.downloading_outlet_save_outlets);
                        addDownloadOutletsDB(config.tbl_outlet, items,
                            function () {
                                if (cancelLoadingDlg || sessionID != downloadSession) {
                                    onCancel();
                                } else {
                                    if (page + 1 < maxPage)
                                        downloadProvinceOutletsZip(provinceID, sessionID, page + 1, maxPage, onSuccess, onError, onCancel);
                                    else
                                        onSuccess();
                                }
                            }, function (tx11, dberr) {
                                onError(dberr.message);
                            });
                    } else {
                        onSuccess();
                    }
                } catch (err) {
                    onError(err.message);
                }
            }, function (err) {
                log(err);
                hideDlg();
                onError(err_download_province);
            });
        } catch (ex) {
            onError(ex.message);
        }
    }

    //*************************************************************************    
    function updateProvinceActionView() {
        if (selectProvince.download) {
            $("#buttonDownload").css('display', 'none');
            $("#buttonRedownload").css('display', 'table');
            $("#buttonDeleteOffline").css('display', 'table');
        } else {
            $("#buttonDownload").css('display', 'table');
            $("#buttonRedownload").css('display', 'none');
            $("#buttonDeleteOffline").css('display', 'none');
        }
    }

    //*************************************************************************
    function initializeView() {
        var hasNetwork = networkReady();
        log('update view when base on network: ' + hasNetwork);
        enableOffline(hasNetwork);
        if (hasNetwork) {
            //$scope.showListButton = true;
            //$scope.showCollapseButton = false;
            //$scope.showExpandButton = false;
            $scope.closeLeftPanel();
            //$("#slider-left-content").css('right', '32px');
            if (appReady)
                changeGPSTrackingStatus();
        } else {
            //$scope.showListButton = false;
            //$scope.showCollapseButton = false;
            //$scope.showExpandButton = false;
            $scope.expandOutletPanel();
            //$("#slider-left-content").css('right', '0');            
        }
    }

    // #region Get Outlets

    var lastRefreshTS = new Date();
    var startGetOutletTS = new Date();
   
    function getOutletsByView(isbackground) {
        __isLoadingOutlet = true;
        startGetOutletTS = new Date(); // now
        OUTLET.queryOutlets($http, isbackground, curOutletView, function (isSuccess, foundOutlets) {
            if (isSuccess) {
                //if (curOutletView == 0) nearByOutlets = foundOutlets;                
                nearByOutlets = foundOutlets;
                loadOutlets(foundOutlets);
                startGetOutletTS = new Date();
            }
            __isLoadingOutlet = false;
        });
    }

    function loadOutlets(outlets) {
        $scope.outlets.length = 0;        
        if (isMapReady && networkReady()) {
            loadMarkers(curOutletView == 1, outlets,
                function () {
                    setOutletsToList(outlets);
                });
        } else {
            clearMarkers();
            setOutletsToList(outlets);
        }
    }

    function setOutletsToList(outlets) {
        $timeout(function () {
            $scope.showNaviBar = leftPanelStatus > 0 && outlets.length > $scope.config.page_size;
            if ($scope.showNaviBar)
                $("#slider-left-content").css('margin-bottom', '48px');
            else
                $("#slider-left-content").css('margin-bottom', '4px');

            if (outlets.length == 0) {
                $scope.showNoOutletFound = true;
                $scope.showExpandButton = false;
                $scope.showCollapseButton = false;
            } else {
                $scope.showNoOutletFound = false;
            }

            curOutlets.length = 0;
            $scope.searchName = '';
            for (var i = 0; i < outlets.length; i++) {
                $scope.outlets[i] = outlets[i];
                curOutlets[i] = outlets[i];
            }
            $('.md-scroll-mask').remove();
            //hideDlg();

            if (!appReady) {
                appReady = true;
                changeGPSTrackingStatus();
            }
            __isLoadingOutlet = false;
            startGetOutletTS = new Date();
        }, 100);
    }

    //#endregion

    //*************************************************************************
    function changeGPSTrackingStatus() {
        if ($scope.config.enable_liveGPS) {
            log('Register Location Service');
            startPositionWatching();
        } else {
            log('Stop Location Service');
            stopPositionWatching();
        }
    }

    //*************************************************************************
    var __hideOpenOutletDlg;
    var __isCancelOpenOutletDlg;
    var __openOutletDlgCallback;

    function __tryOpenOutletDialog() {
        if (__isCancelOpenOutletDlg()) {
            __hideOpenOutletDlg();
        } else {
            if (!__isLoadingOutlet) {
                __hideOpenOutletDlg();

                __hideOpenOutletDlg = null;
                __isCancelOpenOutletDlg = null;
                __openOutletDlgCallback();
            }
            else {
                setTimeout(function () { __tryOpenOutletDialog(); }, 500);
            }
        }
    }
    function tryOpenDialog(callback) {

        callback();

        //dialogUtils.showClosableDlg('Initializing Dialog', R.please_wait, function (hideDlgFunc, isCancelledFunc) {
        //    __hideOpenOutletDlg = hideDlgFunc;
        //    __isCancelOpenOutletDlg = isCancelledFunc;
        //    __openOutletDlgCallback = callback;
        //    __tryOpenOutletDialog();
        //});
    }

    //*************************************************************************
    var lastLoadLocationTS = new Date();
    function handleLocationChange(lat, lng, acc) {
        if (!appReady) return;

        curacc = acc;
        curlat = lat;
        curlng = lng;

        tcutils.tcapp.lastUpdateLocationTS = new Date();

        displayCurrentPostion();

        journals.trackJournal(lat, lng, acc);

        if (tcutils.tcapp.checkToRefreshOutlet(lat, lng)) {
            tcutils.logging.info('Refreshing outlet list...');

            var now = new Date();
            if (getDifTime(lastRefreshTS, now) < $scope.config.refresh_time) {
                return;
            }

            if (isOutletDlgOpen) {
                log('Dialog was opened');
                return;
            }

            if (getDifTime(startGetOutletTS, now) > $scope.config.refresh_time_out) {
                __isLoadingOutlet = false;
                startGetOutletTS = now;
            }

            if (__isLoadingOutlet) {
                log('Get outlets was in progress');
                return;
            }
            lastRefreshTS = now;
            getOutletsByView(true);
        }
    }

    //*************************************************************************
    function editOutlet(j, isPanTo) {
        $('#searchInput').blur();
        tryOpenDialog(function () {
            // Still has issue if this outlet has been removed while user move
            log('Open outlet:' + j.toString());

            var orgOutlet;
            if (isPanTo) { // from left menu            
                orgOutlet = $scope.outlets[j + $scope.currentPage * $scope.pageSize];
            } else {
                orgOutlet = curOutlets[j];
            }

            loadImagesIfNeed(orgOutlet, function () {
                var clonedOutlet = cloneObj(orgOutlet);
                var i = clonedOutlet.positionIndex;
                console.log('Display outlet...');
                console.log(clonedOutlet);
                if (isPanTo && isMapReady && networkReady()) {
                    marker = markers[i];
                    panToOutlet(marker.position.lat(), marker.position.lng(), i, orgOutlet);
                }                              
                initializeOutlet(clonedOutlet);

                var isEditNewOutlet = clonedOutlet.AuditStatus == StatusNew || clonedOutlet.AuditStatus == StatusAuditorNew;
                $scope.isNewOutlet = false;
                $scope.isApproved = false;
                clonedOutlet.isChanged = false;
                clonedOutlet.isRevert = false;
                var isSent = clonedOutlet.IsSent;
                OUTLET.dialog.open(
                  function () {
                      $mdDialog.show({
                          scope: $scope.$new(),
                          controller: isEditNewOutlet ? newOutletController : editOutletController,
                          templateUrl: isEditNewOutlet ? 'views/outletCreate.html' : 'views/outletEdit.html',
                          parent: angular.element(document.body),
                          clickOutsideToClose: true,
                          fullscreen: false,
                      });
                  },
                  clonedOutlet,
                  function (answer, outlet) {
                      console.debug('Save outlet...');                      
                      if (!outlet.isChanged) return;

                      var isSendNewOutletRequest = isSent !== outlet.IsSent;
                      orgOutlet.IsSent = outlet.IsSent;
                      if (!isSendNewOutletRequest) {
                          if (!outlet.isRevert) {

                              if (outlet.IsTracked)
                                  outlet.Tracking = 1;
                              else
                                  outlet.Tracking = 0;

                              if (outlet.IsOpened) outlet.CloseDate = '';

                              if (outlet.PStatus == 0) {
                                  if (orgOutlet.IsOpened && orgOutlet.Tracking == 1) {
                                      outlet.PStatus = 1;
                                  } else if (orgOutlet.IsOpened && orgOutlet.Tracking == 0) {
                                      outlet.PStatus = 2;
                                  } else {
                                      outlet.PStatus = 3;
                                  }
                              }

                              outlet.AmendBy = userID;
                              outlet.AmendByRole = user.role;

                              var isPost = outlet.IsDraft != orgOutlet.IsDraft;
                              var isAuditChanged = outlet.AuditStatus != orgOutlet.AuditStatus;

                              orgOutlet.AuditStatus = outlet.AuditStatus;
                              orgOutlet.AmendBy = outlet.AmendBy;
                              orgOutlet.AddLine = outlet.AddLine;
                              orgOutlet.AddLine2 = outlet.AddLine2;
                              orgOutlet.AuditStatus = outlet.AuditStatus;
                              orgOutlet.CloseDate = outlet.CloseDate;
                              orgOutlet.Distance = outlet.Distance;
                              orgOutlet.District = outlet.District;
                              orgOutlet.Ward = outlet.Ward;
                              orgOutlet.FullAddress = outlet.FullAddress;
                              orgOutlet.IsOpened = outlet.IsOpened;
                              orgOutlet.IsTracked = outlet.IsTracked;
                              orgOutlet.Name = outlet.Name;
                              orgOutlet.Note = outlet.Note;
                              orgOutlet.OTypeID = outlet.OTypeID;
                              orgOutlet.OutletEmail = outlet.OutletEmail;
                              orgOutlet.OutletSource = outlet.OutletSource;
                              orgOutlet.OutletTypeName = outlet.OutletTypeName;
                              orgOutlet.Phone = outlet.Phone;
                              orgOutlet.ProvinceID = outlet.ProvinceID;
                              orgOutlet.ProvinceName = outlet.ProvinceName;
                              orgOutlet.TaxID = outlet.TaxID;
                              orgOutlet.LegalName = outlet.LegalName;
                              orgOutlet.Class = outlet.Class;
                              orgOutlet.SpShift = outlet.SpShift;
                              orgOutlet.CallRate = outlet.CallRate;
                              orgOutlet.TerritoryID = outlet.TerritoryID;

                              var img1 = outlet.StringImage1;
                              var img2 = outlet.StringImage2;
                              var img3 = outlet.StringImage3;
                              var img4 = outlet.StringImage4;
                              var img5 = outlet.StringImage5;
                              var img6 = outlet.StringImage6;

                              orgOutlet.StringImage1 = img1;
                              orgOutlet.StringImage2 = img2;
                              orgOutlet.StringImage3 = img3;
                              orgOutlet.StringImage4 = img4;
                              orgOutlet.StringImage5 = img5;
                              orgOutlet.StringImage6 = img6;

                              orgOutlet.TotalVolume = outlet.TotalVolume;
                              orgOutlet.Tracking = outlet.Tracking;
                              orgOutlet.VBLVolume = outlet.VBLVolume;
                              orgOutlet.PStatus = outlet.PStatus;

                              orgOutlet.modifiedImage1 = outlet.modifiedImage1;
                              orgOutlet.modifiedImage2 = outlet.modifiedImage2;
                              orgOutlet.modifiedImage3 = outlet.modifiedImage3;
                              orgOutlet.modifiedImage4 = outlet.modifiedImage4;
                              orgOutlet.modifiedImage5 = outlet.modifiedImage5;
                              orgOutlet.modifiedImage6 = outlet.modifiedImage6;

                              orgOutlet.AmendByRole = user.role;
                          } else {
                              outlet.AuditStatus = StatusRevert;
                              orgOutlet.AuditStatus = outlet.AuditStatus;
                              orgOutlet.StringImage1 = '';
                              orgOutlet.StringImage2 = '';
                              orgOutlet.StringImage3 = '';
                              orgOutlet.StringImage4 = '';
                              orgOutlet.StringImage5 = '';
                              orgOutlet.StringImage6 = '';
                              orgOutlet.modifiedImage1 = false;
                              orgOutlet.modifiedImage2 = false;
                              orgOutlet.modifiedImage3 = false;
                              orgOutlet.modifiedImage4 = false;
                              orgOutlet.modifiedImage5 = false;
                              orgOutlet.modifiedImage6 = false;
                          }
                      }
                      else {
                          orgOutlet.AuditStatus = outlet.AuditStatus;
                          orgOutlet.TaxID = outlet.TaxID;
                          orgOutlet.LegalName = outlet.LegalName;
                          orgOutlet.Class = outlet.Class;
                          orgOutlet.SpShift = outlet.SpShift;
                          orgOutlet.CallRate = outlet.CallRate;
                          orgOutlet.TerritoryID = outlet.TerritoryID;
                      }

                      //showDlg(R.saving_outlet, R.please_wait);
                      if (outlet.isDeleted) {
                          OUTLET.saveOutlet($http, orgOutlet, OUTLET_DELETE, curOutletView, function () { $scope.refresh(); });                      
                      } else {
                          if (curOutletView != 1) { // new outlet
                              var iconUrl = getMarkerIcon(orgOutlet);
                              log('change marker ' + i.toString() + ' icon: ' + iconUrl);
                              for (var m = 0; m < markers.length; m++) {
                                  var mk = markers[m];
                                  if (mk == null) continue;
                                  if (mk.outlet != null && mk.outlet.ID == outlet.ID) {
                                      mk.setIcon(iconUrl);
                                      break;
                                  }
                              }
                          }
                          OUTLET.saveOutlet($http, orgOutlet, OUTLET_EDIT, curOutletView, function () { $scope.refresh(); });
                      }
                  });               
            });
        });
    }

    //*************************************************************************
    function loadImagesIfNeed(outlet, callback) {
        if (isEmpty(outlet.StringImage1) && isEmpty(outlet.StringImage2) && isEmpty(outlet.StringImage3) &&
            isEmpty(outlet.StringImage4) && isEmpty(outlet.StringImage5) && isEmpty(outlet.StringImage6) &&
            networkReady()) {

            dialogUtils.showClosableDlg(R.load_images, R.please_wait, function (hideLoadingFunc, isCancelledFunc) {
                try {
                    var url = baseURL + '/outlet/getimages/' + userID + '/' + pass + '/' + outlet.ID.toString();
                    console.info('Call service api: ' + url);
                    $http({
                        method: config.http_method,
                        url: url
                    }).then(function (resp) {
                        if (isCancelledFunc()) return;
                        hideLoadingFunc();

                        try {
                            var data = resp.data;
                            if (data.Status == -1) { // error
                                showError(data.ErrorMessage);
                            } else {
                                outlet.StringImage1 = data.Image1;
                                outlet.StringImage2 = data.Image2;
                                outlet.StringImage3 = data.Image3;
                                outlet.StringImage4 = data.Image4;
                                outlet.StringImage5 = data.Image5;
                                outlet.StringImage6 = data.Image6;

                                callback();

                                //updateOutletImageDB($scope.config.tbl_outlet, outlet, callback);
                            }
                        } catch (err) {
                            console.error(err);
                            showError('Cannot connect to server, please check network connection and retry! (#10003)');
                        }
                    }, function (err) {
                        if (isCancelledFunc()) return;
                        hideLoadingFunc();

                        showError('Cannot connect to server, please check network connection and retry! (#10002)');

                        console.error(err);
                        callback();
                    });
                } catch (err) {
                    if (isCancelledFunc()) return;
                    hideLoadingFunc();                                        
                    console.error(err);
                    //callback();
                    showError('Cannot connect to server, please check network connection and retry! (#10001)');
                }
            });
        } else {
            callback();
        }
    }

    //*************************************************************************
    function deleteDraftOutlet(outlet) {
        log('delete outlet ' + outlet.ID.toString());
        outlet.AuditStatus = StatusDelete;

        log('save outlet to server')
        saveOutlet(outlet, function (synced) {
            log('Save outlet to local db')
            if (synced) {
                deleteOutletDB($scope.config.tbl_outlet, outlet, function () {
                    hideDlg();
                    $scope.refresh();
                }, function (dberr) {
                    hideDlg();
                    showError(dberr.message);
                })
            } else {
                saveOutletDB(config.tbl_outlet, outlet, curOutletView, synced,
                function () {
                    hideDlg();
                    $scope.refresh();
                }, function (dberr) {
                    hideDlg();
                    showError(dberr.message);
                });
            }
        });
    }

    //*************************************************************************
    function saveOutlet(outlet, onSuccess) {
        submitOutlet(outlet, onSuccess);
    }

    //*************************************************************************
    function submitOutlet(outlet, callback) {
        if (networkReady()) {
            var url = baseURL + '/outlet/save/' + userID + '/' + pass;
            log('Call service api: ' + url);
            $http({
                method: config.http_method,
                data: outlet,
                url: url,
                headers: { 'Content-Type': 'application/json' }
            }).then(function (resp) {
                log(resp);
                var data = resp.data;
                if (data.Status == -1) { // error
                    handleError(data.ErrorMessage);
                } else {
                    log('submit outlet successfully: ' + data.RowID + ', ' + data.ID);
                    outlet.PRowID = data.RowID;
                    outlet.ID = data.ID;
                    callback(true);
                }
            }, function (err) {
                log('Submit error');
                log(err);
                callback(false);
            });
        } else {
            callback(false);
        }
    }

    //*************************************************************************
    var isSyncing = false;
    var lastAutoSyncTS = new Date();
    function autoSyncOutlets(onSuccess, onError) {
        if (!config.auto_sync) {
            log('Auto sync is OFF');
            onSuccess();
            return;
        }
        log('Select unsynced outlets');
        selectUnsyncedOutlets(config.tbl_outlet,
			function (dbres) {
			    log('Found unsynced outlets: ' + dbres.rows.length.toString());
			    if (dbres.rows.length == 0) {
			        onSuccess();
			        return;
			    }
			    unsyncedOutlets = [];
			    for (var i = 0; i < dbres.rows.length; i++) {
			        unsyncedOutlets[i] = dbres.rows.item(i);
			    }

			    submitUnsyncedOutlets(unsyncedOutlets, onSuccess, onError);
			}, function (dberr) {
			    onError('Query unsynced outlet error');
			    log(dberr);
			});
    }

    //*************************************************************************
    function submitUnsyncedOutlets(unsyncedOutlets, onSuccess, onError) {
        if (networkReady()) {
            var url = baseURL + '/outlet/saveoutlets/' + userID + '/' + pass;
            log('Call service api: ' + url);
            $http({
                method: config.http_method,
                data: unsyncedOutlets,
                url: url,
                headers: { 'Content-Type': 'application/json' }
            }).then(function (resp) {
                log(resp);
                var data = resp.data;
                if (data.Status == -1) { // error
                    onError(data.ErrorMessage);
                } else {
                    if (data.Status == 1) { // warning
                        onError(data.ErrorMessage);
                    }
                    setSyncStatusDB($scope.config.tbl_outlet, data.Outlets, true,
                        function () {
                            onSuccess();
                        },
                        function (err) {
                            onError(err);
                        });
                }
            }, function (err) {
                log('Submit error');
                log(err);
                onError('http error');
            });
        } else {
            onError('Disconnected server');
        }
    }

    //*************************************************************************
    function enableOffline(isOnline) {
        if (isOnline) {
            $("#home-topright-offline").css('display', 'none');
            $("#home-topright-sync-hint").css('display', 'none');
            selectAllUnsyncedOutlets(config.tbl_outlet,
              function (dbres) {
                  if (dbres.rows.length > 0) {
                      $("#home-topright-sync-hint").css('display', 'inline-block');
                  } else {
                      $("#home-topright-sync-hint").css('display', 'none');
                  }
              }, function (dberr) { });

        } else {
            $("#home-topright-offline").css('display', 'inline-block');
            //$("#home-topright-sync-hint").css('display', 'none');
        }
    }

    //*************************************************************************
    function handleConnectionChanged(networkStatus) {
        enableOffline(networkStatus);
        if (networkStatus) {
            if (appReady)
                changeGPSTrackingStatus();

            if (!isMapReady) {
                __loadMapCallback = handleMapLoaded;
                loadMapApi();
            }
        }
    }

    //*************************************************************************
    function handleMapLoaded() {
        showCurPositionDlg(true, function (lat, lng) {
            if (isMapReady) {
                moveToCurrentLocation();
                $scope.mapReady = true;
            }
            initializeBorders(true);
            if (!isOutletDlgOpen) {
                if (tcutils.tcapp.lastRefreshOutletsTS == null)
                    tcutils.tcapp.lastRefreshOutletsTS = new Date();
                OUTLET.queryOutlets($http, false, curOutletView, function (isSuccess, foundOutlets) {
                    loadOutlets(foundOutlets);
                });
                //handleLocationChange(lat, lng, curacc);
            } else {
                dialogClosedCallback = function () {
                    //dialogClosedCallback = null;
                    //handleLocationChange(lat, lng, curacc);
                    
                    if (tcutils.tcapp.lastRefreshOutletsTS == null)
                        tcutils.tcapp.lastRefreshOutletsTS = new Date();
                    OUTLET.queryOutlets($http, false, curOutletView, function (isSuccess, foundOutlets) {
                        dialogClosedCallback = null;
                        loadOutlets(foundOutlets);
                    });
                };
            }
        }, function (err) {
            hideDlg();
            initializeBorders(false);
        });

        __loadMapCallback = null;
    };

    $scope.changeMapType = function (i) {
        changeMapTypeView(i);
        $scope.isSatellite = i == 1;
    }
   
    //#region SETTINGS

    $scope.cfg = {
        showPanel: function () {
            log('show right panel');
            $("#configPanel").css('width', '360px');
            $scope.showSettingCollapse = true;
            $scope.showSettingExpand = false;
            righPanelStatus = 1;
            tempPageSize = $scope.config.page_size;
        },

        hidePanel: function () {
            log('hide right panel');
            $("#configPanel").css('width', '0');
            righPanelStatus = 0;
            $scope.showSettingCollapse = false;
            $scope.showSettingExpand = true;
            insertSettingDB($scope.config, function () { log('Updated config') }, function (err) { log(err); });
            if (networkReady() && !isMapReady) {
                loadMapApi();
                getCurPosition(true, function (lat, lng) {
                }, function (err) { });
            }
            var hasNetwork = networkReady();
            log('update view when base on network: ' + hasNetwork);
            enableOffline(hasNetwork);
            if (hasNetwork) {
                if (appReady) changeGPSTrackingStatus();
            }

            if (tempPageSize != $scope.config.page_size) {
                $scope.pageSize = $scope.config.page_size;
                tempPageSize = $scope.pageSize;
                log('Update paging');
                if (curOutlets.length == 0) return;
                $scope.outlets.length = 0;
                for (var i = 0; i < curOutlets.length; i++) {
                    $scope.outlets[i] = curOutlets[i];
                }
            }
        }
    }

    $scope.displayChangePasswordDlg = function () {
        if (!networkReady()) {
            showError(R.cannot_change_password_in_offline);
            return;
        }

        $('#dlg-change-password').css('display', 'table');
    }

    $scope.changePassword = function (isCancel) {
        if (isCancel) {
            $('#dlg-change-password').css('display', 'none');
            if (!appReady) start();
        } else {
            if (!$scope.forceChangePassword && isEmpty($scope.curPass)) {
                showErrorAdv(R.current_pass_is_empty, function () { $("#cur-pass").focus(); });
                return;
            }

            if (isEmpty($scope.newPass)) {
                showErrorAdv(R.new_pass_is_empty, function () { $("#new-pass").focus(); });
                return;
            }

            if ($scope.newPass != $scope.confirmPass) {
                showErrorAdv(R.confirm_pass_doesnot_match, function () { $("#confirm-pass").focus(); });
                return;
            }

            showDlg(R.submitting, R.please_wait);
            try {
                var url = baseURL;
                if ($scope.forceChangePassword) {
                    url = url.concat('/resetpassword');
                    url = url.concat('/', user.token);
                    url = url.concat('/', user.id);
                    url = url.concat('/', hashString($scope.newPass));
                } else {
                    url = url.concat('/changepassword');
                    url = url.concat('/', user.token);
                    url = url.concat('/', user.id);
                    url = url.concat('/', hashString($scope.curPass));
                    url = url.concat('/', hashString($scope.newPass));
                }

                log('Call service api: ' + url);
                $http({
                    method: config.http_method,
                    url: url
                }).then(function (resp) {
                    try {
                        hideDlg();
                        var data = resp.data;
                        if (data.Status == -1) { // error
                            showError(data.ErrorMessage);
                        } else {
                            $scope.forceChangePassword = false;
                            changePasswordDB(userID, $scope.newPass, function () {
                                $scope.curPass = '';
                                $scope.newPass = '';
                                $scope.confirmPass = '';
                                $('#dlg-change-password').css('display', 'none');
                                if (!appReady) start();
                            }, function (dberr) {
                                showError(dberr.message);
                            });
                        }
                    } catch (err) {
                        showError(err.message);
                    }
                }, function (err) {
                    log('HTTP error...');
                    var msg = err.statusText == '' ? $scope.R.text_ConnectionTimeout : err.statusText;
                    showError(msg);
                });
            } catch (ex) {
                showError(ex.message);
            }
        }
    };

    //#endregion

    //#region BORDER
    var isInitializeBorders = false;
    var borderAutoProvinceName = null;
    var borderAutoDistrictName = null;
    var borderAutoWardName = null;

    $scope.canDrawBorder = false;
    $scope.selectedBorder = { ID: 0, Name: R.label_select_area };

    function initializeBorders(hasLocation) {
        if (isInitializeBorders) return;

        //showDlg(R.loading_borders, R.please_wait);
        isInitializeBorders = true;

        if (networkReady() && hasLocation && config.enable_rereverse_geo) {
            log('try reverse the address');
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({
                'latLng': new google.maps.LatLng(curlat, curlng),
                'language': 'vi',
            }, function (results, status) {
                if (status === google.maps.GeocoderStatus.OK && results.length > 0) {
                    borderAutoProvinceName = null;
                    borderAutoDistrictName = null;
                    var street;
                    try {
                        log(results);
                        if (results[0]) {
                            for (var i = 0; i < results[0].address_components.length; i++) {
                                log('foreach add_comp ' + i.toString() + ':' + results[0].address_components[i].types[0]);
                                if (results[0].address_components[i].types[0] == 'route') {
                                    street = results[0].address_components[i].long_name;
                                } else if (results[0].address_components[i].types[0] == 'political') {
                                    borderAutoWardName = results[0].address_components[i].long_name;
                                } else if (results[0].address_components[i].types[0] == 'administrative_area_level_2') {
                                    borderAutoDistrictName = results[0].address_components[i].long_name;
                                } else if (results[0].address_components[i].types[0] == 'administrative_area_level_1') {
                                    borderAutoProvinceName = results[0].address_components[i].long_name;
                                }
                            }
                        } else {
                            log('no geocoder result.');
                        }
                    } catch (geoerr) {
                        log('Parse geocoder failed due to: ' + geoerr);
                    }
                    loadTopBorders();
                } else {
                    log('Geocoder failed due to: ' + status);
                    loadTopBorders();
                }
            });
        } else {
            loadTopBorders();
        }
    }

    function loadTopBorders() {
        try {
            var url = baseURL + '/border/getsubborders/0';
            log('Call service api: ' + url);
            $http({
                method: config.http_method,
                url: url
            }).then(function (resp) {
                hideDlg();
                try {
                    var data = resp.data;
                    if (data.Status == -1) { // error
                        showError(data.ErrorMessage);
                    } else {
                        var items = data.Items;
                        setBorders(data.Items, 0);
                        border_level = 0;
                        if (borderAutoProvinceName) {
                            var ap = changeAlias(borderAutoProvinceName);
                            for (var i = 0; i < items.length; i++) {
                                var cp = changeAlias(items[i].Name);
                                if (ap === cp || cp.indexOf(ap) > -1) {
                                    addressModel.province = items[i];
                                    setCurrenBorder(items[i]);
                                    break;
                                }
                            }
                        }
                    }
                } catch (err) {
                    showError(err.message);
                }
            }, function (err) {
                log('HTTP error...');
                log(err);
                var msg = err.statusText == '' ? $scope.R.text_ConnectionTimeout : err.statusText;
                showError(msg);
            });
        } catch (ex) {
            showError(ex.message);
        }
    }

    $scope.showSelectedBorderDlg = function () {
        if (!isInitializeBorders || !networkReady()) return;
        tryOpenDialog(function () {

            OUTLET.dialog.open(
                  function () {
                      userSelectedBorder = $scope.selectedBorder;
                      $mdDialog.show({
                          scope: $scope.$new(),
                          controller: selectGeoBorderController,
                          templateUrl: 'views/selectGeoBorderView.html',
                          parent: angular.element(document.body),
                          clickOutsideToClose: true,
                          fullscreen: false,
                      });
                  },
                  null,
                  function (answer, outlet) {
                      isOutletDlgOpen = false;
                      if (dialogClosedCallback) dialogClosedCallback();
                      if (answer) {
                          setCurrenBorder(userSelectedBorder);
                      }
                  });
        });
    }

    $scope.drawBorder = function () {
        if (!networkReady()) return;

        if ($scope.selectedBorder.GeoData != null && $scope.selectedBorder.GeoData != '')
            drawMapBorder($scope.selectedBorder.GeoData);
        else {
            dialogUtils.showClosableDlg('Load borders', R.please_wait, function (hideDlgFunc, isCancelledFunc) {
                try {
                    var url = baseURL + '/border/get/' + $scope.selectedBorder.ID.toString();
                    log('Call service api: ' + url);
                    $http({
                        method: config.http_method,
                        url: url
                    }).then(function (resp) {
                        if (isCancelledFunc()) return;
                        hideDlgFunc();
                        try {
                            var data = resp.data;
                            if (data.Status == -1) { // error
                                showError(data.ErrorMessage);
                            } else {
                                var item = data.Item;
                                $scope.selectedBorder.GeoData = item.GeoData;
                                drawMapBorder($scope.selectedBorder.GeoData);
                            }
                        } catch (err) {
                            showError(err.message);
                        }
                    }, function (err) {
                        if (isCancelledFunc()) return;
                        hideDlgFunc();
                        showError($scope.R.text_ConnectionTimeout);
                    });
                } catch (err) {
                    if (isCancelledFunc()) return;
                    hideDlgFunc();

                    showError('Error while getting border data, please retry!');
                }
            });
        }
    }

    function setCurrenBorder(border) {
        $scope.canDrawBorder = border.HasGeoData;
        $scope.selectedBorder = border;
    }

    function checkToDrawBorder(selectID, items) {
        selectedBorder = null;
        for (var i = 0; i < items.length; i++) {
            if (selectID == items[i].ID) {
                selectedBorder = items[i];
                break;
            }
        }

        if (selectedBorder) {
            $scope.canDrawBorder = selectedBorder.GeoData != null && selectedBorder.GeoData != '';
        }
    }
    //#endregion

    //#region JOURNAL
    $scope.journal = {
        from: new Date(),
        to: new Date(),
        viewPanel: false,
        showCollapse: false,
        showExpend: true,
        isStoped : true,
        isStarted: false,
        selectedSaler :0,

        showPanel: function () {
            if (righPanelStatus === 1)
                $scope.cfg.hidePanel();

            $("#journal-panel").css('width', '360px');
            $scope.journal.viewPanel = true;
            $scope.journal.showCollapse = true;
            $scope.journal.showExpend = false;
        },

        hidePanel : function(){
            $("#journal-panel").css('width', '0px');
            $scope.journal.viewPanel = false;
            $scope.journal.showCollapse = false;
            $scope.journal.showExpend = true;
        },

        showHideJournalPanel: function () {
            if (righPanelStatus === 1)
                 $scope.showHideRightPanel();
            
            if ($scope.journal.viewPanel) {
                $scope.journal.hidePanel();
            } else {
                $scope.journal.showPanel();
            }
        },

        viewJournal: function () {
            journals.viewJournalHistory($scope.journal.from, $scope.journal.to);
        },

        clearJournal: function () {
            journals.clearJournalHistory();
        },

        //statusChanged: function () {
        //    if (config.enable_journal) {
        //        $("#journalImage").attr("src", "assets/img/journal-red.svg");
        //        journals.start();
        //    } else {
        //        $("#journalImage").attr("src", "assets/img/journal.svg");
        //        journals.end();
        //    }
        //},

        start: function () {
            $("#journalImage").attr("src", "assets/img/journal-red.svg");
            $("#btnStartJournal").css('display', 'none');
            $("#btnStopJournal").css('display', 'inline-block');
            //$scope.journal.isStoped = false;
            //$scope.journal.isStarted = true;
            journals.start();
        },

        stop: function () {
            $("#journalImage").attr("src", "assets/img/journal.svg");
            $("#btnStartJournal").css('display', 'inline-block');
            $("#btnStopJournal").css('display', 'none');
            //$scope.journal.isStoped = true;
            //$scope.journal.isStarted = false;
            journals.end();
        },
    };
    $scope.subSalers = salesmans;

    $scope.querySearch = querySearch;
    $scope.salemanSearchText = '';
    $scope.selectedItemChange = selectedItemChange;
    $scope.clearSalemanSearch = clearSalemanSearch;

    function submitJournal(journal, callback) {
        if (tcutils.networks.isReady()) {
            var url = baseURL + '/journal/add/' + user.id + '/' + pass;
            //tcutils.writeLog('Call service api: ' + url);
            tcutils.logging.debug('Call service api: ' + url);
            $http({
                method: config.http_method,
                data: journal,
                url: url,
                headers: { 'Content-Type': 'application/json' }
            }).then(function (resp) {
                tcutils.writeLog(resp);
                var data = resp.data;
                if (data.Status == -1) { // error
                    callback(false);
                    tcutils.showErrorDlg(data.ErrorMessage);
                } else {
                    tcutils.writeLog('Submit journal successfully');
                    journal.id = data.id;
                    callback(true);
                }
            }, function (err) {
                tcutils.writeLog('Submit error: ' + err.message);
                tcutils.writeLog(err);
                callback(false);
            });
        } else {
            callback(false);
        }
    };

    function submitUnsyncedJournals(unsyncJournals, callback) {
        if (tcutils.networks.isReady()) {
            var url = baseURL + '/journal/sync/' + userID + '/' + pass;
            tcutils.writeLog('Call service api: ' + url);
            $http({
                method: config.http_method,
                data: unsyncJournals,
                url: url,
                headers: { 'Content-Type': 'application/json' }
            }).then(function (resp) {
                tcutils.writeLog(resp);
                var data = resp.data;
                if (data.Status == -1) { // error
                    tcutils.writeLog(data.ErrorMessage);
                    callback(false, null);
                } else {
                    callback(false, data.items);
                }
            }, function (err) {
                tcutils.writeLog('Submit error');
                tcutils.writeLog(err);
                callback(false, null);
            });
        } else {
            callback(false, null);
        }
    };

    function queryJournals(from, to, callback) {
        if (tcutils.networks.isReady()) {
            tcutils.messageBox.loading(R.get_journals, R.please_wait)
            var url = baseURL + '/journal/get/' + userID + '/' + pass + '/' + from + '/' + to;
            if ($scope.journal.selectedSaler > 0) {
                var queryId = $scope.journal.selectedSaler;
                url = baseURL + '/journal/getsales/' + userID + '/' + pass + '/' + queryId + '/' + from + '/' + to;
            }
            tcutils.writeLog('Call service api: ' + url);
            $http({
                method: config.http_method,
                data: null,
                url: url,
                headers: { 'Content-Type': 'application/json' }
            }).then(function (resp) {
                tcutils.messageBox.hide();
                tcutils.writeLog(resp);
                var data = resp.data;
                if (data.Status == -1) { // error
                    //tcutils.writeLog(data.ErrorMessage);
                    tcutils.messageBox.error(data.ErrorMessage);
                    callback(false, null);
                } else {
                    callback(true, data.items);
                }
            }, function (err) {
                tcutils.messageBox.hide();
                tcutils.messageBox.error("Error while get journal history, please try again!");
                tcutils.writeLog(err);
                callback(false, null);
            });
        } else {
            tcutils.messageBox.hide();
            tcutils.messageBox.info("This feature is only work for Online Mode!");
        }
    }
   
    function querySearch(query) {
        var results = query ? $scope.subSalers.filter(createFilterFor(query)) : $scope.subSalers,
            deferred;
        if ($scope.simulateQuery) {
            deferred = $q.defer();
            $timeout(function () { deferred.resolve(results); }, Math.random() * 1000, false);
            return deferred.promise;
        } else {
            return results;
        }
    }

    function selectedItemChange(item) {
        $scope.journal.selectedSaler = item ? item.personID : 0;
    }
    
    function createFilterFor(query) {
        var lowercaseQuery = changeAlias(angular.lowercase(query));

        return function filterFn(s) {
            return s.searchKey.indexOf(lowercaseQuery) >= 0;
        };

    }

    function clearSalemanSearch() {
        $scope.salemanSearchText = '';
    }

    function downloadDistricts(geoProvinceId, callback) {
        addressModel.isDistrictsDownloaded(geoProvinceId.toString(), function (isdownloaded) {
            if (isdownloaded) {
                callback();
            } else {
                var url = baseURL + '/provinces/getdistricts/' + geoProvinceId.toString();
                log('Call service api: ' + url);
                $http({
                    method: config.http_method,
                    url: url
                }).then(function (resp) {
                    try {
                        var data = resp.data;
                        if (data.Status == -1) { // error
                            tcutils.logging.error(data.ErrorMessage);
                        } else {
                            addressModel.insertDistricts(geoProvinceId.toString(), data.items, callback);
                        }
                    } catch (err) {
                        tcutils.logging.error(err.message);
                        callback();
                    }
                }, function (err) {
                    tcutils.logging.error(err);
                    callback();
                });
            }
        });
    }

    //#endregion
  
    //#region HOTLINE
    $scope.makePhoneCall = function (hotline) {
        log(hotline);
        try {
            window.PhoneCaller.call(hotline.phone, function () { }, function (error) { });
        } catch (e) {
            log(e);
        }
    };
    //#endregion

    //#region OUTLET STATUS
    $scope.openOutletStatusView = function () {
        tryOpenDialog(function () {
            OUTLET.dialog.open(
                  function () {
                      $mdDialog.show({
                          scope: $scope.$new(),
                          controller: outletStatusControlle,
                          templateUrl: 'views/outletStatusView.html',
                          parent: angular.element(document.body),
                          clickOutsideToClose: false,
                          fullscreen: false,
                      });
                  },
                  null,
                  function (answer, outlet) {

                  });
        });
    }
    //#endregion
   
    try {
        enableOffline(networkReady());

        __locationChangedCallback = handleLocationChange;
        __handleNetworkStateChanged = handleConnectionChanged;        
        __autoSyncOutletFunc = autoSyncOutlets;
        __loadMapCallback = handleMapLoaded;

        enableSync = true;

        mapClickedCallback = function () {
            $scope.hideDropdown();
        };

        mapViewChangedCallback = function (streetView) {
            log('Change view: ' + streetView);
            if (streetView) {
                $("#home-topleft").css('display', 'none');
                $("#home-bottom").css('display', 'none');
                $("#home-bottomright").css('display', 'none');
                $("#home-topright").css('display', 'none');
                $("#configPanel").css('display', 'none');
                $("#outletPanel").css('display', 'none');

                $("#home-topright-street").css('display', 'inline-block');
            } else {
                $("#home-topleft").css('display', 'inline-block');
                $("#home-topright").css('display', 'inline-block');
                $("#home-bottom").css('display', 'inline-block');
                $("#home-bottomright").css('display', 'inline-block');
                $("#outletPanel").css('display', 'inline');
                $("#configPanel").css('display', 'inline');

                $("#home-topright-street").css('display', 'none');
            }
        };

        initializeView();
        editOutletCallback = function (i) { editOutlet(i, false); };

        // Get current location first before do another stubs
        if (user.role == 10 || user.role == 11) {
            $scope.forceChangePassword = true;
            $('#dlg-change-password').css('display', 'table');
        } else {
            loadMapApi();
        }

        journals.initialize(submitJournal, submitUnsyncedJournals, queryJournals);
    } catch (err) {
        showError(err);
        log(err);
    }

};

function provinceItemClicked() {
    try {
        $('.md-select-menu-container').addClass('md-leave');
        console.log('hide dropdown');
    } catch (e) {
    }
}