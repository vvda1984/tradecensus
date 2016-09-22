/// <reference path="tradecensus.js" />
/// <reference path="tc.outletAPI.js" />
/// <reference path="tc.mapAPI.js" />
/// <reference path="tc.dlgAPI.js" />
/// <reference path="tc.databaseAPI.js" />
/// <reference path="tc.appAPI.js" />

var isOutletDlgOpen = false;
var isLoadingOutlet = false;
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
    $scope.allowRefresh = true;
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

    //*************************************************************************
    $scope.testChangeLocation = function () {
        devLat = $scope.testlat;
        devLng = $scope.testlng;
        handleLocationChange($scope.testlat, $scope.testlng, $scope.testacc);
        //if(locationChangedCallback)
        //    locationChangedCallback($scope.testlat, $scope.testlng, $scope.testacc);   
    }

    //*************************************************************************
    $scope.panToCurLocation = function(){
        moveToCurrentLocation();
    }

    //*************************************************************************
    $scope.clearSearch = function(){
        $scope.searchName = '';
        $scope.searchChanged();
    };

    //*************************************************************************
    $scope.searchChanged = function(){
        log('Reset page index');
        $scope.currentPage = 0;
        if(isEmpty($scope.searchName)){
            $scope.showSearchImg = true;
            $scope.showClearSearchImg = false;
            if(curOutlets.length == 0) return;
            $scope.outlets.length = 0;
            for(var i = 0; i< curOutlets.length; i++){
                $scope.outlets[i] = curOutlets[i];
            }
        } else{           
            $scope.showSearchImg = false;
            $scope.showClearSearchImg = true;
            if(curOutlets.length == 0) return;
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
    $scope.numberOfPages = function(){        
        return Math.ceil($scope.outlets.length/$scope.pageSize);
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
        if (curOutletView == 0) {
            nearByOutlets = [];
        }
        //initializeView();
        getOutletsByView(false);
    }

    //*************************************************************************
    $scope.closeStreetViewMode = function(){
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
    $scope.expandOutletPanel = function(){
        $scope.hideDropdown();
        leftPanelStatus = 2;
        
        $scope.viewOutletPanel = true;
        $scope.showExpandButton = false;
        $scope.showCollapseButton = true; // networkReady();
        $scope.viewOutletFull = true;
        if(isEmpty($scope.searchName)){
            $scope.showNaviBar =  $scope.outlets.length > $scope.pageSize;
        } else{
            $scope.showNaviBar =  true;         
        }
        if($scope.showNaviBar)
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
        if(isEmpty($scope.searchName)){
            $scope.showNaviBar =  $scope.outlets.length > $scope.pageSize;
        } else{
            $scope.showNaviBar =  true;         
        }                           
        $("#outletPanel").css('width', '42%');
        if($scope.showNaviBar)
            $("#slider-left-content").css('margin-bottom', '48px');
        else
            $("#slider-left-content").css('margin-bottom', '4px');
    }

    //*************************************************************************
    $scope.showhideOutletPanel = function () {
        $scope.hideDropdown();
        $scope.showCollapseButton = false;

        if( $scope.viewOutletPanel){
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
            if($scope.showNaviBar)
                $("#slider-left-content").css('margin-bottom', '48px');
            else
                $("#slider-left-content").css('margin-bottom', '4px');
        }        
    }    

    //*************************************************************************
    var tempPageSize = 0;
    $scope.showHideRightPanel = function () {
        if (righPanelStatus == 0) {
			log('show right panel');
			$("#configPanel").css('width', '360px');
			$scope.showSettingCollapse = true;
            $scope.showSettingExpand = false;
            righPanelStatus = 1;
            tempPageSize = $scope.config.page_size;
        } else {
            log('hide right panel');
            $("#configPanel").css('width', '0');
            righPanelStatus = 0;
            $scope.showSettingCollapse = false;
            $scope.showSettingExpand = true;
            insertSettingDB($scope.config, function () { log('Updated config') }, function (err) { log(err); });
			if(networkReady() && !isMapReady){
				loadMapApi();		
                getCurPosition(true, function(lat, lng){                    
                }, function(err){});	
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

    //*************************************************************************
    $scope.showDropdown = function () {
        if(viewDropdown){
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
        log('change view to ' + v.toString());
        curOutletView = v;
        
        switch (curOutletView) {
            case 0:                
                $scope.outletHeader = R.near_by_outlets;
                break;
            case 1:                
                $scope.outletHeader = R.new_outlets;
                break;
            case 2:
                $scope.outletHeader = R.updated_outlets;
                break;                
            case 3:                
                $scope.outletHeader = R.auditted_outlets;
                break;
            case 4:
                $scope.outletHeader = R.my_new_outlets;
        }
        $scope.currentPage = 0;     
        getOutletsByView(false);
    }

    //*************************************************************************
    $scope.createNewOutlet = function () {
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

            log('create new outlet');
            showDlg(R.get_current_location, R.please_wait);
            if (curlat == START_LAT && curlng == START_LNG) {
                //addNewOutlet();
                getCurPosition(false, function (lat, lng) {
                    addNewOutlet();
                }, function (err) {
                    hideDlg();
                    showError(R.cannot_get_current_location);
                });
            } else
                addNewOutlet(); // location watching has updated current location already

            //try {
            //    getCurPosition(true, function (lat, lng) {
            //        lat = Math.round(lat * 100000000) / 100000000;
            //        lng = Math.round(lng * 100000000) / 100000000;                             
            //        if (networkReady()) {
            //            log('try reverse the address');
            //            var geocoder = new google.maps.Geocoder();
            //            geocoder.geocode({
            //                'latLng': new google.maps.LatLng(lat, lng),
            //                'language': 'vi',
            //            }, function (results, status) {
            //                if (status === google.maps.GeocoderStatus.OK && results.length > 0) {
            //                    var street = '';
            //                    var district = '';
            //                    try {
            //                        log(results);
            //                        if (results[0]) {
            //                            for (var i = 0; i < results[0].address_components.length; i++) {
            //                                log('foreach add_comp ' + i.toString() + ':' + results[0].address_components[i].types[0]);
            //                                if (results[0].address_components[i].types[0] == 'route') {
            //                                    street = results[0].address_components[i].long_name;
            //                                } else if (results[0].address_components[i].types[0] == 'administrative_area_level_2') {
            //                                    district = results[0].address_components[i].long_name;
            //                                    break;
            //                                }
            //                            }
            //                        } else {
            //                            log('no geocoder result.');
            //                        }
            //                    } catch (geoerr) {
            //                        log('Parse geocoder failed due to: ' + geoerr);
            //                    }
            //                    tryCreateNewOutlet(lat, lng, street, district);
            //                } else {
            //                    log('Geocoder failed due to: ' + status);
            //                    tryCreateNewOutlet(lat, lng, '', '');
            //                }
            //            });
            //        } else {
            //            tryCreateNewOutlet(lat, lng, '', '');
            //        }
            //        showingDialog = false;
            //    }, function (err) {
            //        showingDialog = false;
            //        showError(R.cannot_get_current_location);
            //    });          
            //} catch (err) {
            //    log(err);
            //}
        } else {
            //var errMsg = R.msg_validate_accuracy.replace('{distance}', $scope.config.audit_accuracy.toString());
            //errMsg = errMsg.replace('{curacc}', curAccRound);
            showError(R.msg_validate_accuracy_1);
        }
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
                    showInfo(R.synchronize_completed);
                    $("#home-topright-sync-hint").css('display', 'none');
                }, function(err){
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
        showDlg(R.label_validating, R.please_wait);
        loadImagesIfNeed(outlet, function () {
            hideDlg();
            if (isEmpty(outlet.StringImage1) && isEmpty(outlet.StringImage2) && isEmpty(outlet.StringImage3)) {
                showValidationErr(R.need_to_capture);
            }
            else
                performPostOutlet(outlet);
        });
    }

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
    }

    //*************************************************************************    
    $scope.reviseOutlet = function (outlet) {
        showDlg(R.label_validating, R.please_wait);
        loadImagesIfNeed(outlet, function () {
            hideDlg();
            performReviseOutlet(outlet);
        });
    }

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
            log('Revise outlet ' + outlet.ID.toString());

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
        showDlg(R.get_current_location, R.please_wait);
        getCurPosition(false, function (lat, lng) {
            hideDlg();
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
        catch(e){
            showError(e.message);
            isOutletDlgOpen = false;
            if (dialogClosedCallback) dialogClosedCallback();
        }
    }

    //*************************************************************************
    function addNewOutlet() {
        if (networkReady() && config.enable_rereverse_geo) {
            log('try reverse the address');
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({
                'latLng': new google.maps.LatLng(curlat, curlng),
                'language': 'vi',
            }, function (results, status) {
                if (status === google.maps.GeocoderStatus.OK && results.length > 0) {
                    var street = '';
                    var district = '';
                    var province = '';
                    try {
                        log(results);
                        if (results[0]) {
                            for (var i = 0; i < results[0].address_components.length; i++) {
                                log('foreach add_comp ' + i.toString() + ':' + results[0].address_components[i].types[0]);
                                if (results[0].address_components[i].types[0] == 'route') {
                                    street = results[0].address_components[i].long_name;
                                } else if (results[0].address_components[i].types[0] == 'administrative_area_level_2') {
                                    district = results[0].address_components[i].long_name;
                                    break;
                                } else if (results[0].address_components[i].types[0] == 'administrative_area_level_1') {
                                    province = results[0].address_components[i].long_name;
                                    break;
                                }
                            }
                        } else {
                            log('no geocoder result.');
                        }
                    } catch (geoerr) {
                        log('Parse geocoder failed due to: ' + geoerr);
                    }
                    tryCreateNewOutlet(curlat, curlng, street, district, province);
                } else {
                    log('Geocoder failed due to: ' + status);
                    tryCreateNewOutlet(curlat, curlng, '', '', '');
                }
            });
        } else {
            tryCreateNewOutlet(curlat, curlng, '', '', '');
        }
    }

    //*************************************************************************
    function tryCreateNewOutlet(lat, lng, address2, district, province) {
        tryOpenDialog(function () {
            log($scope.outletTypes);
            $scope.outlet = newOutlet(province);
            $scope.outlet.AddLine2 = address2;
            $scope.outlet.District = district;
            $scope.isNewOutlet = true;
            hideDlg();
            $mdDialog.show({
                scope: $scope.$new(),
                controller: newOutletController,
                templateUrl: 'views/outletCreate.html',
                parent: angular.element(document.body),
                clickOutsideToClose: false,
                fullscreen: false,
            })
            .then(function (answer) {
                isOutletDlgOpen = false;
                if (dialogClosedCallback) dialogClosedCallback();
                if (answer) {
                    log('save outlet')
                    if (user.hasAuditRole) {
                        $scope.outlet.AuditStatus = StatusAuditorNew;
                    } else {
                        $scope.outlet.AuditStatus = ($scope.outlet.IsDraft) ? StatusNew : StatusPost;
                    }
                   
                    log('Audit Status: ' + $scope.outlet.AuditStatus.toString());
                    showDlg(R.save_outlet, R.please_wait);
                    saveOutlet($scope.outlet,
                           function (synced) {
                               addOutletDB(config.tbl_outlet, $scope.outlet, synced,
                                   function () {
                                       $scope.refresh();
                                       hideDlg();
                                   }, function (dberr) {
                                       hideDlg();
                                       showError(dberr.message);
                                   });
                           });
                }
            }, function () {
                isOutletDlgOpen = false;
                if (dialogClosedCallback) dialogClosedCallback();
            });
            try { $scope.$apply(); } catch (er) { }
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
    
    //*************************************************************************
    var startGetOutletTS = new Date();
    function getOutletsByView(isbackground) {
        isLoadingOutlet = true;
        startGetOutletTS = new Date(); // now

        if (!isbackground)
            showDlg('Get ' + $scope.outletHeader, 'Please wait...');

        if (networkReady()) {
            queryOutletsOnline(isbackground, function (r, foundOutlets) {
                if (r) {
                    loadOutlets(foundOutlets);
                } else {
                    isLoadingOutlet = false;
                    startGetOutletTS = new Date();
                }
            });
        } else {
            queryOutlets(false, curOutletView, function (r, foundOutlets) {
                if (r) {
                    loadOutlets(foundOutlets);
                } else {
                    isLoadingOutlet = false;
                    startGetOutletTS = new Date();
                }
            });
        }
    }

    //*************************************************************************
    function queryOutletsOnline(isbackground, callback) {
        try {
            if (!config.distance) {
                if (!isbackground) showError(R.distance_is_invalid);
                callback(false, null);
                return;
            }
            if (!config.item_count) {
                if (!isbackground) showError(R.max_outlet_is_invalid);
                callback(false, null);
                return;
            }
            
            var url = baseURL + '/outlet/getoutlets/' + userID + '/'
                            + pass + '/'
                            + curlat.toString() + '/'
                            + curlng.toString() + '/'
                            + config.distance.toString() + '/'
                            + config.item_count.toString() + '/'
                            + curOutletView.toString();

            log('Call service api: ' + url);
            $http({
                method: config.http_method,
                url: url
            }).then(function (resp) {
                try {
                    var data = resp.data;
                    if (data.Status == -1) { // error
                        showError(data.ErrorMessage);
                        callback(false, null);
                    } else {
                        setDlgMsg(R.msg_found + data.Items.length.toString() + R.msg_outlets);
                        nearByOutlets = data.Items;
                        nearByOutlets.sort(function (a, b) { return a.Distance - b.Distance });
                        if (!isbackground)
                            showDlg(R.get_near_by_outlets, R.found + nearByOutlets.length.toString() + R.outlets_loading);

                        insertOutletsDB(user.id, config.tbl_outlet, nearByOutlets,
                            function () {
                                callback(true, nearByOutlets);
                                hideDlg();
                            }, function (dberr) {
                                hideDlg();
                                if (!isbackground)
                                    showError(dberr.message);
                                else
                                    log(dberr.message);
                                callback(false, null);
                            });
                    }
                } catch (err) {
                    if (!isbackground)
                        showError(err.message);
                    else
                        log(err.message);
                    callback(false, null);
                }
            }, function (err) {
                log('HTTP error...');
                log(err);
                hideDlg();
                if (!isbackground) {
                    var msg = err.statusText == '' ? $scope.R.text_ConnectionTimeout : err.statusText;
                    showError(msg);
                }
                callback(false, null);
            });
        } catch (ex) {
            showError(ex.message);
            callback(false, null);
        }
    }

    //*************************************************************************
    function loadOutlets(outlets) {
        $scope.outlets.length = 0;
        log('Set outlet list');
        if (isMapReady && networkReady()) {
            loadMarkers(curOutletView == 1, outlets,
                function () {
                    setOutletsToList(outlets);
                });
        } else {
            setOutletsToList(outlets);
        }
    }     

    //*************************************************************************
    function setOutletsToList(outlets) {
        $timeout(function () {          
            $scope.showNaviBar = leftPanelStatus > 0 && outlets.length > $scope.config.page_size;
            if($scope.showNaviBar)
                $("#slider-left-content").css('margin-bottom', '48px');
            else
                $("#slider-left-content").css('margin-bottom', '4px');

            if(outlets.length == 0){
                $scope.showNoOutletFound = true;
                $scope.showExpandButton = false;
                $scope.showCollapseButton = false;
            } else {
                $scope.showNoOutletFound = false;
            }
            
            curOutlets.length = 0;
            $scope.searchName = '';
            for(var i = 0; i< outlets.length; i++){                                
                $scope.outlets[i] = outlets[i];
                curOutlets[i] = outlets[i];
            }            
            $('.md-scroll-mask').remove();
            hideDlg();

            if (!appReady) {
                appReady = true;
                changeGPSTrackingStatus();
            }
            isLoadingOutlet = false;
            startGetOutletTS = new Date();
        }, 100);
    }
        
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
    function tryOpenDialog(callback) {
        showDlg(R.loading, R.please_wait);
        if (isLoadingOutlet) {
            setTimeout(function () {
                tryOpenDialog(callback);
            }, 500);
        } else {
            hideDlg();
            callback();
        }
    }

    //*************************************************************************
    var lastLoadLocationTS = new Date();
    function handleLocationChange(lat, lng, acc) {
        if (!appReady) return;
        curacc = acc;
        displayAccuracy();

        var now = new Date();
        var dif =getDifTime(lastLoadLocationTS, now); 
        if (dif > $scope.config.ping_time) {
            lastLoadLocationTS = now;

            var adjdistance = calcDistance({ Lat: lat, Lng: lng }, { Lat: curlat, Lng: curlng });

            //curacc = acc;
            curlat = lat;
            curlng = lng;
            displayCurrentPostion();

            if (adjdistance > $scope.config.liveGPS_distance) {
                refreshOutletList();
            }
        } 
    }

    //*************************************************************************
    var lastRefreshTS = new Date();
    function refreshOutletList() {
        //return; // disable auto refersh 
        if (!appReady) return;

        var now = new Date();
        if (getDifTime(lastRefreshTS, now) < $scope.config.refresh_time) {
            return;
        }

        if (isOutletDlgOpen) {
            log('Dialog was opened');
            return;
        }

        if (getDifTime(startGetOutletTS, now) > $scope.config.refresh_time_out) {
            isLoadingOutlet = false;
            startGetOutletTS = now;
        }

        if (isLoadingOutlet) {
            log('Get outlets was in progress');
            return;
        }
        lastRefreshTS = now;
        getOutletsByView(true);
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
                log('display outlet ' + clonedOutlet.Name + ': ' + i.toString());
                if (isPanTo && isMapReady && networkReady()) {
                    marker = markers[i];
                    panToOutlet(marker.position.lat(), marker.position.lng(), i, orgOutlet);
                }
                //var clonedOutlet = cloneObj($scope.outlets[i]); //cloneObj($scope.outlets[i]);
                $scope.outlet = clonedOutlet;
                initializeOutlet($scope.outlet);
                log('draft: ' + $scope.outlet.IsDraft);
                var isEditNewOutlet = $scope.outlet.AuditStatus == StatusNew || $scope.outlet.AuditStatus == StatusAuditorNew;
                $scope.isNewOutlet = false;
                $scope.isApproved = false;
                $scope.outlet.isChanged = false;
                $scope.outlet.isRevert = false;
                $mdDialog.show({
                    scope: $scope.$new(),
                    controller: isEditNewOutlet ? newOutletController : editOutletController,
                    templateUrl: isEditNewOutlet ? 'views/outletCreate.html' : 'views/outletEdit.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: true,
                    fullscreen: false,
                })
                .then(function (answer) {
                    isOutletDlgOpen = false;
                    if (dialogClosedCallback) dialogClosedCallback();
                    if (!answer) return;

                    if (!$scope.outlet.isChanged) return;

                    if (!$scope.outlet.isRevert) {
                        //if (isEditNewOutlet) {
                        //    if ($scope.outlet.isDeleted)
                        //        $scope.outlet.AuditStatus = StatusDelete;
                        //    else if ($scope.outlet.isApproved) {
                        //        $scope.outlet.AuditStatus = StatusAuditorAccept;
                        //    } else if ($scope.outlet.AuditStatus != StatusAuditorNew) {
                        //        $scope.outlet.AuditStatus = ($scope.outlet.IsDraft) ? StatusNew : StatusPost;
                        //    }
                        //} else {
                        //    if ($scope.outlet.AuditStatus == StatusInitial)
                        //        $scope.outlet.AuditStatus = StatusEdit;
                        //    else if ($scope.outlet.AuditStatus == StatusPost) {
                        //        $scope.outlet.AuditStatus = StatusNew;  //Revise
                        //    } else if ($scope.outlet.AuditStatus == StatusExitingPost) {
                        //        $scope.outlet.AuditStatus = StatusEdit;  //Revise
                        //    } else if ($scope.outlet.AuditStatus == StatusEdit) {
                        //        $scope.outlet.AuditStatus = ($scope.outlet.IsExistingDraft) ? StatusEdit : StatusExitingPost;
                        //    }
                        //}

                        if ($scope.outlet.IsTracked)
                            $scope.outlet.Tracking = 1;
                        else
                            $scope.outlet.Tracking = 0;

                        if ($scope.outlet.IsOpened) $scope.outlet.CloseDate = '';

                        if ($scope.outlet.PStatus == 0) {
                            if (orgOutlet.IsOpened && orgOutlet.Tracking == 1) {
                                $scope.outlet.PStatus = 1;
                            } else if (orgOutlet.IsOpened && orgOutlet.Tracking == 0) {
                                $scope.outlet.PStatus = 2;
                            } else {
                                $scope.outlet.PStatus = 3;
                            }
                        }
                        //var pstatus = $scope.outlet.PStatus;
                        //if ($scope.outlet.IsOpened != orgOutlet.IsOpened && $scope.outlet.Tracking != orgOutlet.Tracking) {
                        //    pstatus |= 4;
                        //} else if ($scope.outlet.IsOpened != orgOutlet.IsOpened && $scope.outlet.Tracking == orgOutlet.Tracking) {
                        //    pstatus |= 2;
                        //    if($scope.outlet)
                        //} else if ($scope.outlet.IsOpened == orgOutlet.IsOpened && $scope.outlet.Tracking != orgOutlet.Tracking) {
                        //    pstatus |= 1;
                        //}
                        //$scope.outlet.PStatus = pstatus;

                        $scope.outlet.AmendBy = userID;

                        var isPost = $scope.outlet.IsDraft != orgOutlet.IsDraft;
                        var isAuditChanged = $scope.outlet.AuditStatus != orgOutlet.AuditStatus;

                        orgOutlet.AuditStatus = $scope.outlet.AuditStatus;
                        orgOutlet.AmendBy = $scope.outlet.AmendBy;
                        orgOutlet.AddLine = $scope.outlet.AddLine;
                        orgOutlet.AddLine2 = $scope.outlet.AddLine2;
                        orgOutlet.AuditStatus = $scope.outlet.AuditStatus;
                        orgOutlet.CloseDate = $scope.outlet.CloseDate;
                        orgOutlet.Distance = $scope.outlet.Distance;
                        orgOutlet.District = $scope.outlet.District;
                        orgOutlet.FullAddress = $scope.outlet.FullAddress;
                        orgOutlet.IsOpened = $scope.outlet.IsOpened;
                        orgOutlet.IsTracked = $scope.outlet.IsTracked;
                        orgOutlet.Name = $scope.outlet.Name;
                        orgOutlet.Note = $scope.outlet.Note;
                        orgOutlet.OTypeID = $scope.outlet.OTypeID;
                        orgOutlet.OutletEmail = $scope.outlet.OutletEmail;
                        orgOutlet.OutletSource = $scope.outlet.OutletSource;
                        orgOutlet.OutletTypeName = $scope.outlet.OutletTypeName;
                        orgOutlet.Phone = $scope.outlet.Phone;
                        orgOutlet.ProvinceID = $scope.outlet.ProvinceID;
                        orgOutlet.ProvinceName = $scope.outlet.ProvinceName;

                        var img1 = $scope.outlet.StringImage1;
                        var img2 = $scope.outlet.StringImage2;
                        var img3 = $scope.outlet.StringImage3;

                        orgOutlet.StringImage1 = img1;
                        orgOutlet.StringImage2 = img2;
                        orgOutlet.StringImage3 = img3;

                        orgOutlet.TotalVolume = $scope.outlet.TotalVolume;
                        orgOutlet.Tracking = $scope.outlet.Tracking;
                        orgOutlet.VBLVolume = $scope.outlet.VBLVolume;
                        orgOutlet.PStatus = $scope.outlet.PStatus;

                        orgOutlet.modifiedImage1 = $scope.outlet.modifiedImage1;
                        orgOutlet.modifiedImage2 = $scope.outlet.modifiedImage2;
                        orgOutlet.modifiedImage3 = $scope.outlet.modifiedImage3;
                    } else {
                        $scope.outlet.AuditStatus = StatusRevert;
                        orgOutlet.AuditStatus = $scope.outlet.AuditStatus;
                        orgOutlet.StringImage1 = '';
                        orgOutlet.StringImage2 = '';
                        orgOutlet.StringImage3 = '';
                        orgOutlet.modifiedImage1 = false;
                        orgOutlet.modifiedImage2 = false;
                        orgOutlet.modifiedImage3 = false;
                    }
                    showDlg(R.saving_outlet, R.please_wait);
                    if ($scope.outlet.isDeleted) {
                        log('save outlet to server')
                        saveOutlet($scope.outlet, function (synced) {
                            log('Save outlet to local db')
                            if (synced) {
                                deleteOutletDB($scope.config.tbl_outlet, orgOutlet, function () {
                                    $scope.refresh();
                                    hideDlg();
                                }, function (dberr) {
                                    hideDlg();
                                    showError(dberr.message);
                                })
                            } else {
                                saveOutletDB(config.tbl_outlet, orgOutlet, curOutletView, synced,
                                function () {
                                    if (curOutletView == 1)
                                        $scope.refresh();
                                    hideDlg();
                                }, function (dberr) {
                                    hideDlg();
                                    showError(dberr.message);
                                });
                            }
                        });
                    } else {
                        if (curOutletView != 1) { // new outlet
                            var iconUrl = getMarkerIcon($scope.outlet);
                            log('change marker ' + i.toString() + ' icon: ' + iconUrl);
                            for (var m = 0; m < markers.length; m++) {
                                var mk = markers[m];
                                if (mk == null) continue;
                                if (mk.outlet != null && mk.outlet.ID == $scope.outlet.ID) {
                                    mk.setIcon(iconUrl);
                                    break;
                                }
                            }
                        }

                        log('save outlet to server')
                        saveOutlet($scope.outlet, function (synced) {
                            log('save outlet to local db')
                            saveOutletDB(config.tbl_outlet, $scope.outlet, curOutletView, synced,
                                function () {
                                    //if (curOutletView == 1)
                                    //    $scope.refresh();
                                    $scope.refresh();
                                    hideDlg();
                                }, function (dberr) {
                                    hideDlg();
                                    showError(dberr.message);
                                });
                        });
                    }
                }, function () {
                    isOutletDlgOpen = false;
                    if (dialogClosedCallback) dialogClosedCallback();
                });
                try { $scope.$apply(); } catch (er) { }
            });
        });
    }

    //*************************************************************************
    function loadImagesIfNeed(outlet, callback) {
        if (isEmpty(outlet.StringImage1) && isEmpty(outlet.StringImage2) && isEmpty(outlet.StringImage3) && networkReady()) {
            showDlg(R.load_images, R.loading);
            try {
                var url = baseURL + '/outlet/getimages/' +userID + '/' + pass + '/' + outlet.ID.toString();
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
                            callback();
                        } else {
                            outlet.StringImage1 = data.Image1;
                            outlet.StringImage2 = data.Image2;
                            outlet.StringImage3 = data.Image3;
                            updateOutletImageDB($scope.config.tbl_outlet, outlet, callback);
                        }
                    } catch (err) {
                        showError(err.message);
                        callback();
                    }
                }, function (err) {
                    log('HTTP error...');
                    hideDlg();
                    showError(R.cannot_get_outlet_images);
                    callback();
                });
            } catch (ex) {
                hideDlg();
                showError(ex.message);
                callback();
            }
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
	        $("#home-topright-sync-hint").css('display', 'none');
	    }
	}

    //*************************************************************************
	function handleConnectionChanged(networkStatus) {
	    enableOffline(networkStatus);
	    if (networkStatus) {
	        if (appReady)
	            changeGPSTrackingStatus();

	        if (!isMapReady) {
	            loadMapCallback = handleMapLoaded;
	            loadMapApi();
	        }

	        //if (!isSyncing) {
	        //    setTimeout(function () {
	        //        startAutoSyncOutlets();
	        //    }, $scope.config.sync_time);
	        //} else {
	        //    var now = new Date();
	        //    var dif = (now - lastAutoSyncTS)/1000;
	        //    if (dif > $scope.config.sync_time_out) {
	        //        setTimeout(function () {
	        //            startAutoSyncOutlets();
	        //        }, $scope.config.sync_time);
	        //    }
	        //}
	    }
	}

    //*************************************************************************
	function handleMapLoaded() {
	    showDlg(R.get_near_by_outlets, R.please_wait);
	    getCurPosition(true, function (lat, lng) {
	        hideDlg();

	        if (isMapReady) {
	            log('Move to current location');
	            //$('#current-location-button').css('display', 'block');
	            moveToCurrentLocation();
	            $scope.mapReady = true;
	         
	        }

	        if (networkReady()) {
	            if (appReady)
	                changeGPSTrackingStatus();

	            if (!isOutletDlgOpen) {
	                log('Get outlets');
	                queryOutletsOnline(false, function (r, foundOutlets) {
	                    if (r) loadOutlets(foundOutlets);
	                });
	            } else {
	                log('Dialog is opened, refresh later');
	                dialogClosedCallback = function () {
	                    queryOutletsOnline(false, function (r, foundOutlets) {
	                        if (r) loadOutlets(foundOutlets);
	                    });
	                    dialogClosedCallback = null;
	                }
	            }
	            initializeBorders(true);
	        } else {
	            if (!isOutletDlgOpen) {
	                queryOutlets(false, curOutletView, function (r, foundOutlets) {
	                    if (r) loadOutlets(foundOutlets);
	                });
	            } else {
	                dialogClosedCallback = function () {
	                    queryOutlets(false, curOutletView, function (r, foundOutlets) {
	                        if (r) loadOutlets(foundOutlets);
	                    });
	                    dialogClosedCallback = null;
	                }
	            }

	            //initializeBorders();
	        }
	    }, function (err) {
	        hideDlg();
	        initializeBorders(false);
	    });

	    loadMapCallback = null;
	};

    //*************************************************************************
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

    //*************************************************************************
	$scope.displayChangePasswordDlg = function () {
	    if (!networkReady()) {
	        showError(R.cannot_change_password_in_offline);
	        return;
	    }

	    $('#dlg-change-password').css('display', 'table');
	}

    //*************************************************************************
	$scope.changeMapType = function (i) {
	    changeMapTypeView(i);
	    $scope.isSatellite = i == 1;
	}

    //*************************************************************************
	var isInitializeBorders = false;
	var borderAutoProvinceName = null;
	var borderAutoDistrictName = null;
	var borderAutoWardName = null;
    
	$scope.canDrawBorder = false;
	$scope.selectedBorder = { ID: 0, Name: R.label_select_area};

	function initializeBorders(hasLocation) {
	    if (isInitializeBorders) return;

	    showDlg(R.loading_borders, R.please_wait);
	    isInitializeBorders = true;

	    //loadBorders(0, 1);

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
	                //loadBorders(0, 1);
                    loadTopBorders();
	            } else {
	                log('Geocoder failed due to: ' + status);
	                //loadBorders(0, 1);
	                loadTopBorders();
	            }
	        });
	    } else {
	        //loadBorders(0, 1);
	        loadTopBorders();
	    }
	}

	//function loadBorders(parentID, level) {
	//    try {
	//        var url = baseURL + '/border/getsubborders/' + parentID.toString();
	//        log('Call service api: ' + url);
	//        $http({
	//            method: config.http_method,
	//            url: url
	//        }).then(function (resp) {
	//            try {
	//                var data = resp.data;
	//                if (data.Status == -1) { // error
	//                    showError(data.ErrorMessage);
	//                    callback(false, null);
	//                } else {
	//                    var items = data.Items;
	//                    //items.unshift({ID : -1, Name:'', ParentID: -1, GeoData : ''});
	//                    if (level == 0) {
	//                        var foundAutoProvince = false;
	//                        if (borderAutoProvinceName) {
	//                            for (var i = 0; i < items.length; i++) {
	//                                if (items[i].Name === borderAutoProvinceName) {
	//                                    setBorders()
	//                                    $scope.border1 = items[i].ID;
	//                                    foundAutoProvince = true;
	//                                    break;
	//                                }
	//                            }
	//                        }
	//                        if (foundAutoProvince && borderAutoDistrictName)
	//                            loadSubBorders(1);
	//                    } else if (level == 2) {
	//                        $scope.border2IsVisible = items.length > 1;
	//                        $scope.border3IsVisible = false;
	//                        $scope.border4IsVisible = false;
	//                        $scope.border2Items = items;
	//                        var foundAutoDistrict = false;
	//                        if (borderAutoDistrictName) {
	//                            for (var i = 0; i < items.length; i++) {
	//                                if (items[i].Name === borderAutoDistrictName) {
	//                                    $scope.border2 = items[i].ID;
	//                                    foundAutoDistrict = true;
	//                                    break;
	//                                }
	//                            }
	//                        }
	//                        if (foundAutoDistrict)
	//                            loadSubBorders(2);
	//                    } else if (level == 3) {
	//                        $scope.border3IsVisible = items.length > 1;
	//                        $scope.border4IsVisible = false;
	//                        $scope.border3Items = items;
	//                        var foundAutoWard = false;
	//                        if (borderAutoWardName) {
	//                            var temp = changeAlias(borderAutoWardName);
	//                            for (var i = 0; i < items.length; i++) {
	//                                var temp1 = changeAlias(items[i].Name);
	//                                if (temp1.indexOf(temp) !== -1) {
	//                                    $scope.border3 = items[i].ID;
	//                                    foundAutoWard = true;
	//                                    break;
	//                                }
	//                            }
	//                        }
	//                        if (foundAutoWard)
	//                            loadSubBorders(3);
	//                    } else if (level == 4) {
	//                        $scope.border4IsVisible = items.length > 1;
	//                        $scope.border4Items = items;
	//                    }
	//                }
	//            } catch (err) {
	//                showError(err.message);
	//            }
	//        }, function (err) {
	//            log('HTTP error...');
	//            log(err);
	//            var msg = err.statusText == '' ? $scope.R.text_ConnectionTimeout : err.statusText;
	//            showError(msg);
	//        });
	//    } catch (ex) {
	//        showError(ex.message);
	//    }
	//}

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
	    if (!isInitializeBorders) return;
	    tryOpenDialog(function () {
	        userSelectedBorder = $scope.selectedBorder;
	        $mdDialog.show({
	            scope: $scope.$new(),
	            controller: selectGeoBorderController,
	            templateUrl: 'views/selectGeoBorderView.html',
	            parent: angular.element(document.body),
	            clickOutsideToClose: true,
	            fullscreen: false,
	        })
            .then(function (answer) {
                isOutletDlgOpen = false;
                if (dialogClosedCallback) dialogClosedCallback();
                if (answer) {
                    setCurrenBorder(userSelectedBorder);
                }
            }, function () {
                isOutletDlgOpen = false;
                if (dialogClosedCallback) dialogClosedCallback();
            });
	    });
	}

	$scope.drawBorder = function () {
	    if ($scope.selectedBorder.GeoData != null && $scope.selectedBorder.GeoData != '')
	        drawMapBorder($scope.selectedBorder.GeoData);
	    else {
	        showDlg(R.loading, R.please_wait);
	        try {
	            var url = baseURL + '/border/get/' + $scope.selectedBorder.ID.toString();
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
	                        var item = data.Item;
	                        $scope.selectedBorder.GeoData = item.GeoData;
	                        drawMapBorder($scope.selectedBorder.GeoData);
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
	}

	$scope.borderChanged = function (level) {
	    loadSubBorders(level);
	}

	function setCurrenBorder(border) {
	    $scope.canDrawBorder = border.HasGeoData;
	    $scope.selectedBorder = border;
	}

	function loadSubBorders(level) {
	    var parentID = -1;
	    if (level == 1) {
	        parentID = $scope.border1;
	        $scope.border2IsVisible = false;
	        $scope.border3IsVisible = false;
	        $scope.border4IsVisible = false;
	        
	        $scope.border2 = null;
	        $scope.border3 = null;
	        $scope.border4 = null;
	        checkToDrawBorder($scope.border1, $scope.border1Items);

	    } else if (level == 2) {
	        parentID = $scope.border2;
	        $scope.border3IsVisible = false;
	        $scope.border4IsVisible = false;

	        $scope.border3 = null;
	        $scope.border4 = null;
	        checkToDrawBorder($scope.border2, $scope.border2Items);
	    } else if (level == 3) {
	        parentID = $scope.border3;
	        $scope.border4IsVisible = false;

	        $scope.border4 = null;
	        checkToDrawBorder($scope.border3, $scope.border3Items);
	    } else if (level == 4) {

	        checkToDrawBorder($scope.border4, $scope.border4Items);
	    }

	    if (parentID >= 0 && level < 4)
	        loadBorders(parentID, level + 1);
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

    //*************************************************************************           
	function start() {
	    showDlg(R.loading, R.please_wait);
	    loadMapApi();

	    //showDlg(R.get_current_location, R.please_wait);
	    //getCurPosition(true, function (lat, lng) {
	    //    loadMapApi();
	    //}, function (err) {
	    //    log(err);
	    //    loadMapApi();
	    //});
	}
    try {
        enableOffline(networkReady());

        locationChangedCallback = handleLocationChange;
        connectionChangedCallback = handleConnectionChanged;
        //refreshOutletListCallback = refreshOutletList;
        syncOutletsCallback = autoSyncOutlets;
        loadMapCallback = handleMapLoaded;

        enableSync = true;

        mapClickedCallback = function(){ 
            $scope.hideDropdown();
        };

        mapViewChangedCallback = function(streetView){
            log('Change view: ' + streetView); 
            if(streetView){
                $("#home-topleft").css('display', 'none');
                $("#home-bottom").css('display', 'none');
                $("#home-bottomright").css('display', 'none');
                $("#home-topright").css('display', 'none');
                $("#configPanel").css('display', 'none');                
                $("#outletPanel").css('display', 'none');

                $("#home-topright-street").css('display', 'inline-block');
            } else{
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
            start();
        }
                           		
    } catch (err) {
        showError(err);
        log(err);
    }
};