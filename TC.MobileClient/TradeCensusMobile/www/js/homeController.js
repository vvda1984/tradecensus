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
    var appReady = false;
    var leftPanelStatus = 0;
    var righPanelStatus = 0;
    var viewDropdown = 0;
    var selectProvince;

    var curOutletView = 0; // 0: near-by; 1: new: 2: updated 4: audit
    //$scope.nearByOutlets = [];
    //$scope.newOutlets = [];
    //$scope.updatedOutlets = [];
    //$scope.auditOutlets = [];
    $scope.testlat = curlat;
    $scope.testlng = curlng;
    $scope.testacc = curacc;

    $scope.canAddNewOutlet = !user.hasAuditRole;
    $scope.dprovinces = dprovinces;
    $scope.config = config;
    $scope.editOutletFull = false;
    $scope.allowRefresh = true;
    $scope.hasAuditRole = user.hasAuditRole;
    $scope.outletHeader = R.near_by_outlets;
    $scope.showNoOutletFound = true; 
    $scope.showSyncButton = false;   
    $scope.outlets = [];
    $scope.showListButton = true;
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
        if (dprovinces[i].id === $scope.config.province_id) {
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
        if(locationChangedCallback)
            locationChangedCallback($scope.testlat, $scope.testlng, $scope.testacc);   
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
        getOutletsByView(curOutletView, false);
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
        }
        $scope.currentPage = 0;     
        getOutletsByView(false);
    }

    //*************************************************************************
    $scope.createNewOutlet = function () {
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
                //outlet/saveoutlets
                //trySyncOutlets(unsyncedOutlets, 0, onSuccess, onError);

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
        //showDlg(R.get_current_location, R.please_wait);
        //getCurPosition(false, function (lat, lng) {
        //    hideDlg();
        //    var confirmText = R.post_outlet_confirm.replace("{outletname}", outlet.Name);
        //    showConfirm(R.post_outlet, confirmText, function () {
        //        var clonedOutlet = cloneObj(outlet);
        //        clonedOutlet.positionIndex = outlet.positionIndex;
        //        if (clonedOutlet.AuditStatus == StatusNew) {
        //            clonedOutlet.IsDraft = false;
        //            clonedOutlet.AuditStatus = StatusPost;
        //        } else {
        //            clonedOutlet.IsExistingDraft = false;
        //            clonedOutlet.AuditStatus = StatusExitingPost;
        //        }
        //        clonedOutlet.AmendBy = userID;
        //        //log('Post outlet ' + outlet.ID.toString());
        //        //outlet.AuditStatus = StatusPost;
        //        log('Save outlet to server')
        //        saveOutlet(clonedOutlet, function (synced) {
        //            log('Save outlet to local db')
        //            changeOutletStatusDB($scope.config.tbl_outlet, clonedOutlet, clonedOutlet.AuditStatus, synced ? 1 : 0, function () {
        //                hideDlg();
        //                $scope.refresh();
        //            }, function (dberr) {
        //                hideDlg();
        //                showError(dberr.message);
        //            });
        //        });
        //    }, function () { });
        //}, function () {
        //    hideDlg();
        //    showError(R.cannot_approve_or_deny);
        //})

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
        //showDlg(R.get_current_location, R.please_wait);
        //getCurPosition(false, function (lat, lng) {
        //    hideDlg();
        //    var confirmText = R.revise_outlet_confirm.replace("{outletname}", outlet.Name);
        //    showConfirm(R.revise_outlet, confirmText, function () {
        //        var clonedOutlet = cloneObj(outlet);
        //        clonedOutlet.positionIndex = outlet.positionIndex;
        //        if (clonedOutlet.AuditStatus == StatusNew) {
        //            clonedOutlet.IsDraft = true;
        //            clonedOutlet.AuditStatus = StatusNew;
        //        } else {
        //            clonedOutlet.IsExistingDraft = true;
        //            clonedOutlet.AuditStatus = StatusEdit;
        //        }
        //        clonedOutlet.AmendBy = userID;
        //        log('Revise outlet ' + outlet.ID.toString());
        //        log('Save outlet to server')
        //        saveOutlet(outlet, function (synced) {
        //            log('Save outlet to local db')
        //            changeOutletStatusDB($scope.config.tbl_outlet, outlet, clonedOutlet.AuditStatus, synced ? 1 : 0, function () {
        //                hideDlg();
        //                $scope.refresh();
        //            }, function (dberr) {
        //                hideDlg();
        //                showError(dberr.message);
        //            });
        //        });
        //    }, function () { });
        //}, function () {
        //    hideDlg();
        //    showError(R.cannot_approve_or_deny);
        //})

        var confirmText = R.revise_outlet_confirm.replace("{outletname}", outlet.Name);
        showConfirm(R.revise_outlet, confirmText, function () {
            var clonedOutlet = cloneObj(outlet);
            clonedOutlet.positionIndex = outlet.positionIndex;

            if (clonedOutlet.AuditStatus == StatusNew) {
                clonedOutlet.IsDraft = true;
                clonedOutlet.AuditStatus = StatusNew;
            } else {
                clonedOutlet.IsExistingDraft = true;
                clonedOutlet.AuditStatus = StatusEdit;
            }
            clonedOutlet.AmendBy = userID;
            log('Revise outlet ' + outlet.ID.toString());

            log('Save outlet to server')
            saveOutlet(outlet, function (synced) {
                log('Save outlet to local db')
                changeOutletStatusDB($scope.config.tbl_outlet, outlet, clonedOutlet.AuditStatus, synced ? 1 : 0, function () {
                    hideDlg();
                    $scope.refresh();
                }, function (dberr) {
                    hideDlg();
                    showError(dberr.message);
                });
            });

        }, function () { });

        //if (!networkReady()) {
        //    if (outlet.IsSynced)
        //    {
        //        showError(R.cannot_revise);
        //        return;
        //    } else {
        //        var confirmText = R.revise_outlet_confirm.replace("{outletname}", outlet.Name);
        //        showConfirm(R.revise_outlet, confirmText, function () {
        //            outlet.IsDraft = false;
        //            outlet.AuditStatus = StatusPost;
        //            log('Revise outlet ' + outlet.ID.toString());
        //            outlet.AuditStatus = StatusNew;
        //            log('Save outlet to server')
        //            saveOutlet(outlet, function (synced) {
        //                log('Save outlet to local db')
        //                changeOutletStatusDB($scope.config.tbl_outlet, outlet, StatusNew, synced ? 1 : 0, function () {
        //                    hideDlg();
        //                    $scope.refresh();
        //                }, function (dberr) {
        //                    hideDlg();
        //                    showError(dberr.message);
        //                });
        //            });
        //        }, function () { });
        //    }
        //} else {
        //    var confirmText = R.revise_outlet_confirm.replace("{outletname}", outlet.Name);
        //    showConfirm(R.revise_outlet, confirmText, function () {
        //        outlet.IsDraft = false;
        //        outlet.AuditStatus = StatusPost;
        //        log('Revise outlet ' + outlet.ID.toString());
        //        outlet.AuditStatus = StatusNew;
        //        log('Save outlet to server')
        //        saveOutlet(outlet, function (synced) {
        //            log('Save outlet to local db')
        //            changeOutletStatusDB($scope.config.tbl_outlet, outlet, StatusNew, synced ? 1 : 0, function () {
        //                hideDlg();
        //                $scope.refresh();
        //            }, function (dberr) {
        //                hideDlg();
        //                showError(dberr.message);
        //            });
        //        });
        //    }, function () { });
        //}
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
                deleleDownloadProvinceDB($scope.config.tbl_outlet, $scope.config.tbl_downloadProvince, p.id, function () {
                    p.download = 0;
                    try {
                        $scope.$apply();
                    } catch (err) {
                    }
                    updateProvinceActionView();
                }, function (dberr) {
                    showError(dberr.message);
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
                        var url = baseURL + '/outlet/gettotalbyprovince/' + userID + '/' + selectProvince.id;
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
        }, function (dberr) {
            showError(dberr.message);
            isOutletDlgOpen = false;
            if (dialogClosedCallback) dialogClosedCallback();
        });
    }

    //*************************************************************************
    function addNewOutlet() {
        if (networkReady()) {
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
                    $scope.outlet.AuditStatus = ($scope.outlet.IsDraft) ? StatusNew : StatusPost;
                    //if (user.hasAuditRole)
                    //    $scope.outlet.AuditStatus = StatusPost;

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
    function downloadProvinceOutlets(provinceID, sessionID, page, maxPage, onSuccess, onError, onCancel) {
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
            var url = baseURL + '/outlet/download/' + userID + '/' + provinceID + '/' + from.toString() + '/' + to.toString();
            log('Call service api: ' + url);
            $http({
                method: config.http_method,
                url: url
            }).then(function (resp) {
                try {
                    var data = resp.data;
                    if (data.Status == -1) { // error
                        onError(data.ErrorMessage);
                    } else {
                        var items = data.Items;
                        if (cancelLoadingDlg || sessionID != downloadSession) {
                            onCancel();
                            return;
                        }

                        if (items.length > 0) {
                            showLoading(downloadMessage, R.downloading_outlet_save_outlets);
                            insertDownloadedOutletsDB(config.tbl_outlet, items,
                                function () {
                                    if (cancelLoadingDlg || sessionID != downloadSession) {
                                        onCancel();
                                    } else {
                                        if (page + 1 <= maxPage)
                                            downloadProvinceOutlets(provinceID, sessionID, page + 1, maxPage, onSuccess, onError, onCancel);
                                        else
                                            onSuccess();
                                    }
                                }, function (dberr) {
                                    onError(dberr.message);
                                });
                        } else {
                            onSuccess();
                        }
                    }
                } catch (err) {
                    onError(err.message);
                }
            }, function (err) {
                log('HTTP error...');
                log(err);
                hideDlg();
                var msg = err.statusText == '' ? $scope.R.text_ConnectionTimeout : err.statusText;
                onError(msg);
            });
        } catch (ex) {
            onError(ex.message);
        }
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
            var url = baseURL + '/outlet/downloadzip/' + userID + '/' + provinceID + '/' + from.toString() + '/' + to.toString();
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
                log('HTTP error...');
                log(err);
                hideDlg();
                var msg = err.statusText == '' ? $scope.R.text_ConnectionTimeout : err.statusText;
                onError(msg);
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

        var now = new Date();
        var dif =getDifTime(lastLoadLocationTS, now); 
        if (dif > $scope.config.ping_time) {
            lastLoadLocationTS = now;

            var adjdistance = calcDistance({ Lat: lat, Lng: lng }, { Lat: curlat, Lng: curlng });

            curacc = acc;
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
        tryOpenDialog(function () {
            // Still has issue if this outlet has been removed while user move
            log('Open outlet:' + j.toString());

            var orgOutlet;
            if (isPanTo) { // from left menu            
                orgOutlet = $scope.outlets[j + $scope.currentPage * $scope.pageSize];
            } else {
                orgOutlet = curOutlets[j];
            }
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
            var isEditNewOutlet = $scope.outlet.AuditStatus == StatusNew;
            $scope.isNewOutlet = false;
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

                if (isEditNewOutlet) {
                    if ($scope.outlet.isDeleted)
                        $scope.outlet.AuditStatus = StatusDelete;
                    else
                        $scope.outlet.AuditStatus = ($scope.outlet.IsDraft) ? StatusNew : StatusPost;
                } else {
                    if ($scope.outlet.AuditStatus == StatusInitial)
                        $scope.outlet.AuditStatus = StatusEdit;
                    else if ($scope.outlet.AuditStatus == StatusPost) {
                        if ($scope.outlet.IsDraft) {
                            $scope.outlet.AuditStatus = StatusNew;  //Revise
                        }
                    } else if ($scope.outlet.AuditStatus == StatusExitingPost) {
                        if ($scope.outlet.IsExistingDraft) {
                            $scope.outlet.AuditStatus = StatusEdit;  //Revise
                        }
                    } else if ($scope.outlet.AuditStatus == StatusEdit) {
                        if (!$scope.outlet.IsExistingDraft) {
                            $scope.outlet.AuditStatus = StatusExitingPost;  //Post
                        }
                    }
                }

                if ($scope.outlet.IsTracked)
                    $scope.outlet.Tracking = 1;
                else
                    $scope.outlet.Tracking = 0;

                if ($scope.outlet.IsOpened) $scope.outlet.CloseDate = '';

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

        //if (outlet.modifiedImage1 || outlet.modifiedImage2 || outlet.modifiedImage3) {
        //    log('Save image to database before start uploading');
        //    insertOutletImages(user.id, outlet, function (uploadItems) {
        //        submitOutlet(outlet, function (status) {
        //            if (!status) { // save failed
        //                onSuccess(status);
        //            } else {
		//				if(uploadItems.length > 0){
        //                tryUploadImages(uploadItems, 0,
        //                    function () {
        //                        onSuccess(true);
        //                    },
        //                    function () {
        //                        onSuccess(false);
        //                    });
		//				} else{
		//					onSuccess(true);
		//				}
        //            }
        //        });
        //    }, function (err) {
        //        log(err);
        //        showError(err);
        //    });
        //}
        //else
        //    submitOutlet(outlet, onSuccess);
    }

    //*************************************************************************
    function submitOutlet(outlet, callback) {
        if (networkReady()) {
            var url = baseURL + '/outlet/save';
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
    function tryUploadImages(uploadItems, i, onSuccess, onError) {
        showDlg(R.updating_image + '(' + (i + 1).toString() + '/' + uploadItems.length.toString() + ')', R.please_wait);
        var item = uploadItems[i];
        var orderId = item.OutletID.toString();
        var index = item.ImageIndex.toString();;

		log(item);
		var fileURL = item.ImagePath;
		if (fileURL == 0) {
		    fileURL = item.Uploaded;
		    orderId = item.ID;

		}

		if(isEmpty(fileURL)){
			removeUploadingInfo(item.ID, function () {
                if (i + 1 < uploadItems.length) {
                    tryUploadImages(uploadItems, i + 1, onSuccess, onError);
                } else {
                    onSuccess();
                }
            }, function (dberr) {
                log(dberr.message);
                showError(dberr.message);
                onError();
            });
			return;
		}
		
        // TODO: check file existing...
        var options = new FileUploadOptions();
        options.fileKey = 'orderfile';
        options.fileName = 'orderfile'; //fileURL.substr(fileURL.lastIndexOf('/') + 1);
        options.mimeType = "image/jpeg";
        options.params = {
            outletid: orderId,
            index: index,
            userid: user.id.toString(),
        };

        //var url = baseURL + '/outlet/uploadimage/' + options.fileKey + '/' + item.OutletID.toString() + '/' + (i + 1).toString();
        var url = baseURL + '/outlet/uploadimage';
        var ft = new FileTransfer();
        ft.upload(fileURL, url,
        function (res) {            
            log('upload file success');
			log(res);
            removeUploadingInfo(item.ID, function () {
                if (i + 1 < uploadItems.length) {
                    tryUploadImages(uploadItems, i + 1, onSuccess, onError);
                } else {
                    onSuccess();
                }
            }, function (dberr) {
                log(dberr.message);
                showError('An error has occurred: Code = " + error.code');
                onError();
            });
            //{"SaveImageResult":{"ErrorMessage":null,"Status":0,"ImageThumb":"\/images\/65000117_1.png"}}
            //if (res.response.SaveImageResult.Status == 0) {
            //    log('upload file success');
            //    removeUploadingInfo(item.ID, function () {
            //        if (i + 1 < uploadItems.length) {
            //            tryUploadImages(uploadItems, i + 1, onSuccess, onError);
            //        } else {
            //            onSuccess();
            //        }
            //    }, function (dberr) {
            //        log(dberr.message);
            //        showError('An error has occurred: Code = " + error.code');
            //        onError();
            //    });
            //} else {
            //    showError('An error has occurred: ' + errorres.response.ErrorMessage);
            //    onError();
            //}
        }, function (error) {
            showError(R.error);
            onError();
        }, options);
    }       

    //*************************************************************************
	function trySyncOutlets(unsyncedOutlets, index, onSuccess, onError) {
        var item = unsyncedOutlets[index];        
        log('Sync outlet ' + item.Name + ' (' + (index + 1).toString() + '/' + unsyncedOutlets.length.toString() + ')');
        submitOutlet(item, function (status) {
            if (status) {
                log('Sync outlet data: ' + item.ID.toString() + ' completed');
                selectUnsyncedOutletImage(user.id, item.ID, function (tx, dbres) {					
                    if (dbres.rows.length > 0) {
                        var uploadItems = [];
                        for (var i = 0; i < dbres.rows.length; i++) {
                            uploadItems[i] = dbres.rows.item(i);
                        }
                        tryUploadImages(uploadItems, 0,
                             function () {
                                 setOutletSyncStatus(tx, config.tbl_outlet, item.ID, 1, function (tx1) {
                                     if ((index + 1) < unsyncedOutlets.length) {
                                         trySyncOutlets(unsyncedOutlets, index + 1, onSuccess, onSuccess);
                                     } else {
                                         onSuccess();
                                     }
                                 }, handleDBError);
                             },
                             function () {
								 onError('Sync error, please try again!');                                 
                             });
                    } else {
                        setOutletSyncStatus(tx, config.tbl_outlet, item.ID, 1, function (tx1) {
                            if ((index + 1) < unsyncedOutlets.length) {
                                trySyncOutlets(unsyncedOutlets, index + 1, onSuccess, onError);
                            } else {
                                onSuccess();
                            }
                        }, function(dberr){
							onError(dberr.message);
						});
                    }									
                }, function(dberr){
					onError(dberr.message);
				});
            } else {				
                onError('Sync error, please try again!');
            }
        });
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
			    //outlet/saveoutlets
			    //trySyncOutlets(unsyncedOutlets, 0, onSuccess, onError);

			    submitUnsyncedOutlets(unsyncedOutlets, onSuccess, onError);
			}, function (dberr) {
			    onError('Query unsynced outlet error');
			    log(dberr);
			});
	}

    //*************************************************************************
	function submitUnsyncedOutlets(unsyncedOutlets, onSuccess, onError) {
	    if (networkReady()) {
	        var url = baseURL + '/outlet/saveoutlets';
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

	        loadMapCallback = handleMapLoaded;
	        loadMapApi();

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

	function handleMapLoaded() {
	    showDlg(R.get_near_by_outlets, R.please_wait);
	    getCurPosition(true, function (lat, lng) {
	        hideDlg();
	        if (networkReady()) {
	            if (isMapReady) {
	                log('Move to current location');
	                moveToCurrentLocation();
	            }
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
	        }
	    }, function (err) { hideDlg(); });

	  
	    loadMapCallback = null;
	};


    //*********************************** START APPLICATION **************************************           
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
        editOutletCallback = function (i) { editOutlet(i, false);};   

       
        showDlg(R.get_current_location, R.please_wait);
        getCurPosition(true, function (lat, lng) {            
            loadMapApi();
        }, function (err) {
            log(err);
            loadMapApi();
        });		                               		
    } catch (err) {
        showError(err);
        log(err);
    }
};