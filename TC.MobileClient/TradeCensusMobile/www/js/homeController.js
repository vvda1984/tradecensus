/// <reference path="tradecensus.js" />
/// <reference path="tc.outletAPI.js" />
/// <reference path="tc.mapAPI.js" />
/// <reference path="tc.dlgAPI.js" />
/// <reference path="tc.databaseAPI.js" />
/// <reference path="tc.appAPI.js" />

var requestingDisplayOutlet = false;
var rendringOutlets = false;
function homeController($scope, $http, $mdDialog, $mdMedia, $timeout) {
    log('Enter Home page');
    $scope.R = R;
    log(user);
    var firstStart = true;
    var leftPanelStatus = 0;
    var righPanelStatus = 0;
    var viewDropdown = 0;
    var selectProvince;

    //var nearByOutlets = [];
 
    var curOutletView = 0; // 0: near-by; 1: new: 2: updated 4: audit
    //$scope.nearByOutlets = [];
    //$scope.newOutlets = [];
    //$scope.updatedOutlets = [];
    //$scope.auditOutlets = [];
    $scope.testlat = curlat;
    $scope.testlng = curlng;
    $scope.testacc = curacc;

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
    $scope.testChangeLocation = function(){
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
            for(var i = 0; i< curOutlets.length; i++){
                if(curOutlets[i].Name.toUpperCase().indexOf($scope.searchName.toUpperCase()) > -1){
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
        $("#outletPanel").css('width', '40%');
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
                                                           
            $("#outletPanel").css('width', '40%');
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
			    if (!firstStart)
			        changeGPSTrackingStatus();
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
        log('create new outlet');
        requestingDisplayOutlet = true;

        showDlg(R.get_current_location, R.please_wait);
        if (networkReady()) {
            if (!rendringOutlets)
                addNewOutlet();
            else {
                waitCount = 0;
                tryCreateNewOutlet();
            }
        } else {
            getCurPosition(false, function (lat, lng) {
                if (!rendringOutlets)
                    addNewOutlet();
                else {
                    waitCount = 0;
                    tryCreateNewOutlet();
                }
            }, function (err) {
                hideDlg();
                requestingDisplayOutlet = false;
                showError(R.cannot_get_current_location);
            });
        }
           

        //devNewDetlta = devNewDetlta + 0.0001;
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
        selectUnsyncedOutlets(config.tbl_outlet,
            function (dbres) {
                log('Number of unsynced outlets: ' + dbres.rows.length.toString());
                if (dbres.rows.length == 0) {
                    showInfo(R.all_outlets_have_been_synced);
                    return;
                }
                var i;
                unsyncedOutlets = [];
                for (i = 0; i < dbres.rows.length; i++) {
                    unsyncedOutlets[i] = dbres.rows.item(i);
                }
                trySyncOutlets(unsyncedOutlets, 0, function () {
                    showInfo(R.synchronize_completed);
                    $scope.showSyncButton = false;
                }, function(err){
					 showError(err);
				});
            }, handleDBError);
    }
   
    //*************************************************************************
    $scope.deleteOutlet = function (outlet) {
        //var outlet = $scope.outlets[i];
        
        showConfirm(R.delete_outlet, R.delete_outlet_confirm + outlet.Name, function () {
            deleteDraftOutlet(outlet);
        }, function () { });
    }

    //*************************************************************************    
    $scope.postOutlet = function (outlet) {
        //var outlet = $scope.outlets[i];
        showConfirm(R.post_outlet, R.post_outlet_confirm + outlet.Name, function () {
            outlet.IsDraft = false;
            outlet.AuditStatus = StatusPost;

            log('Post outlet ' + outlet.ID.toString());
            outlet.AuditStatus = StatusPost;

            log('Save outlet to server')
            saveOutlet(outlet, function (synced) {
                log('Save outlet to local db')
                changeOutletStatusDB($scope.config.tbl_outlet, outlet, StatusPost, synced ? 1 : 0, function () {
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
        //var outlet = $scope.outlets[i];
        showConfirm(R.revise_outlet, R.revise_outlet_confirm + outlet.Name, function () {
            outlet.IsDraft = false;
            outlet.AuditStatus = StatusPost;

            log('Revise outlet ' + outlet.ID.toString());
            outlet.AuditStatus = StatusNew;

            log('Save outlet to server')
            saveOutlet(outlet, function (synced) {
                log('Save outlet to local db')
                changeOutletStatusDB($scope.config.tbl_outlet, outlet, StatusNew, synced ? 1 : 0, function () {
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
    
    //*************************************************************************
    $scope.downloadOutlets = function () {
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

        selectUnsyncedOutletsOfProvince($scope.config.tbl_outlet, p.id, function (dbres) {
            if (dbres.rows.length > 0) {
                showDlg(R.error, R.unsynced_outlet_in_province);
                return;
            }

            showConfirm(R.download_outlets, R.download_outlets_confim + selectProvince.name + '?', function () {
                setTimeout(function () {
                    try {
                        showLoading(R.downloading_outlet, R.please_wait, R.cancel_download_confirm,
                            function () {
                                log('****** CANCEL download');
                                cancelLoadingDlg = true;
                            }
                        );
                        var url = baseURL + '/outlet/getbyprovince/' + userID + '/' + selectProvince.id;
                        log('Call service api: ' + url);
                        $http({
                            method: config.http_method,
                            url: url
                        }).then(function (resp) {
                            try {
                                var data = resp.data;
                                if (data.Status == -1) { // error
                                    showError(data.ErrorMessage);
                                } else {
                                    var outletHeaders = data.Outlets;
                                    if (outletHeaders.length > 0) {
                                        log('Found ' + outletHeaders.length.toString() + ' outlets');
                                        downloadOutlet(outletHeaders, 0);
                                    }
                                    else {
                                        hideLoadingDlg();
                                        showInfo(R.no_outlet_found);
                                    }
                                }
                            } catch (err) {
                                showError(err.message);
                            }
                        }, function (err) {
                            log('HTTP error...');
                            log(err);
                            hideDlg();
                            var msg = err.statusText == '' ? $scope.resource.text_ConnectionTimeout : err.statusText;
                            showError(msg);
                        });
                    } catch (ex) {
                        showError(ex.message);
                    }
                }, 500);               
            }, function () {
            });
        }, function (dberr) {
            showError(dberr.message);
        });
    }

    //*************************************************************************
    var waitCount = 0;
    function waitingToAddNewOutlet() {
        setTimeout(function () {
            waitCount++;
            if (!rendringOutlets)
                addNewOutlet();
            else
            {
                if (waitCount >= 15) {
                    requestingDisplayOutlet = false;
                } else {
                    waitingToAddNewOutlet();
                }
            }
        }, 300);
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
                                }
                            }
                        } else {
                            log('no geocoder result.');
                        }
                    } catch (geoerr) {
                        log('Parse geocoder failed due to: ' + geoerr);
                    }
                    tryCreateNewOutlet(curlat, curlng, street, district);
                } else {
                    log('Geocoder failed due to: ' + status);
                    tryCreateNewOutlet(curlat, curlng, '', '');
                }
            });
        } else {
            tryCreateNewOutlet(curlat, curlng, '', '');
        }
    }

    //*************************************************************************
    function tryCreateNewOutlet(lat, lng, address2, district) {
        log($scope.outletTypes);
        $scope.outlet = newOutlet();
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
            requestingDisplayOutlet = false;
            if (answer) {
                log('save outlet')
                $scope.outlet.AuditStatus = ($scope.outlet.IsDraft) ? StatusNew : StatusPost;

                log('Audit Status: ' + $scope.outlet.AuditStatus.toString());
                showDlg(R.save_outlet, R.please_wait);
                saveOutlet($scope.outlet,
                       function (synced) {
                           addOutletDB(config.tbl_outlet, $scope.outlet, synced,
                               function () {
                                   //if (curOutletView == 1)
                                   //    $scope.refresh();
                                   //else
                                   //    $scope.changeOutletView(1);
                                   $scope.refresh();
                                   hideDlg();
                               }, function (dberr) {
                                   hideDlg();
                                   showError(dberr.message);
                               });
                       });
            }
        }, function () {
            requestingDisplayOutlet = false;
        });
    }

    //*************************************************************************
    function downloadOutlet(outletHeaders, i) {
        try {
            var outletheader = outletHeaders[i];
            showLoading(R.downloading_outlet + '(' + (i + 1).toString() + '/' + outletHeaders.length + ')');
            var url = baseURL + '/outlet/get/' + userID + '/' + outletheader.ID.toString();
            log('Call service api: ' + url);
            $http({
                method: config.http_method,
                url: url
            }).then(function (resp) {
                try {
                    var data = resp.data;
                    if (data.Status == -1) { // error
                        showError(data.ErrorMessage);
                    } else {
                        var outlet = data.Item;
                        log(data);
                        var temp = [];
                        temp[0] = outlet;
                        insertOutletsDB(user.id, config.tbl_outlet, temp,
                            function () {
                                if (!cancelLoadingDlg) {
                                    if ((i + 1) < outletHeaders.length) {
                                        downloadOutlet(outletHeaders, i + 1);                                        
                                    } else {                                        
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
                                } else {
                                    hideLoadingDlg();
                                }
                            }, function (dberr) {
                                showError(dberr.message);
                            });
                    }
                } catch (err) {
                    showError(err.message);
                }
            }, function (err) {
                log('HTTP error...');
                log(err);
                hideDlg();
                var msg = err.statusText == '' ? $scope.resource.text_ConnectionTimeout : err.statusText;
                showError(msg);
            });
        } catch (ex) {
            showError(ex.message);
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
            if (!firstStart)
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
    function getOutletsByView(isbackground) {
        if (requestingDisplayOutlet || rendringOutlets) return;

        rendringOutlets = true;

        if (!isbackground)
            showDlg('Get ' + $scope.outletHeader, 'Please wait...');

        if (networkReady()) {
            queryOutletsOnline(isbackground, function (foundOutlets) {
                if (isbackground && requestingDisplayOutlet) return;
                loadOutlets(foundOutlets);
            });
        } else {
            queryOutlets(false, curOutletView, function (foundOutlets) {
                if (isbackground && requestingDisplayOutlet) return;
                loadOutlets(foundOutlets);
            });
        }
    }

    //*************************************************************************
    function queryOutletsOnline(isbackground, callback) {
        try {
            if (!config.distance) {
                if(!isbackground) showError( R.distance_is_invalid);
                return;
            }
            if (!config.item_count) {
                if (!isbackground) showError(R.max_outlet_is_invalid);
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
                if (isbackground && requestingDisplayOutlet) return;
                try {
                    var data = resp.data;
                    if (data.Status == -1) { // error
                        rendringOutlets = false;
                        handleError(data.ErrorMessage);
                    } else {
                        nearByOutlets = data.Items;
                        nearByOutlets.sort(function (a, b) { return a.Distance - b.Distance });
                        if (!isbackground)
                            showDlg(R.get_near_by_outlets, R.found + nearByOutlets.length.toString() + R.outlets_loading);

                        if (isbackground && requestingDisplayOutlet) return;
                        insertOutletsDB(user.id, config.tbl_outlet, nearByOutlets,
                            function () {
                                if (isbackground && requestingDisplayOutlet) return;
                                callback(nearByOutlets);
                            }, function (dberr) {
                                rendringOutlets = false;
                                if (!isbackground)
                                    showError(dberr.message);
                                else
                                    log(dberr.message);
                            });
                    }
                } catch (err) {
                    rendringOutlets = false;
                    if (!isbackground)
                        showError(err.message);
                    else
                        log(err.message);
                }
            }, function (err) {
                rendringOutlets = false;
                log('HTTP error...');
                log(err);
                hideDlg();
                if (!isbackground) {
                    var msg = err.statusText == '' ? $scope.resource.text_ConnectionTimeout : err.statusText;
                    showError(msg);
                }
                
            });
        } catch (ex) {
            rendringOutlets = false;
            showError(ex.message);
        }
    }

    //*************************************************************************
    function loadOutlets(outlets) {
        if (!requestingDisplayOutlet) {
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

            if (firstStart) {
                firstStart = false;
                changeGPSTrackingStatus();
            }
            rendringOutlets = false;
        }, 100);
    }
        
    //*************************************************************************
    function changeGPSTrackingStatus() {
        //if(!registeredLocation)

        if ($scope.config.enable_liveGPS) {
            log('Register Location Service');
            startPositionWatching();
        } else {
            log('Stop Location Service');
            stopPositionWatching();
        }
    }

    //*************************************************************************
    function handleLocationChange(lat, lng, acc) {
        //return;
        if (requestingDisplayOutlet) return;
        var distance = calcDistance({Lat: curlat, Lng : curlng}, {Lat : lat, Lng : lng});
        curacc = acc;
        curlat = lat;
        curlng = lng;
        displayCurrentPostion();

        if (distance > $scope.config.liveGPS_distance) {
            getOutletsByView(true);
        }      
    }

    //*************************************************************************
    function editOutlet(j, isPanTo) {
        log('Open outlet:' + j.toString());
        requestingDisplayOutlet = true;

        if (!rendringOutlets)
            tryEditOutlet(j, isPanTo);
        else {
            waitCount = 0;
            waitingToEditOutlet(j, isPanTo);
        }
    }
    
    //*************************************************************************
    function waitingToEditOutlet(j, isPanTo) {
        setTimeout(function () {
            waitCount++;
            if (!rendringOutlets)
                tryEditOutlet(j, isPanTo);
            else {
                if (waitCount >= 15) {
                    requestingDisplayOutlet = false;
                } else {
                    waitingToEditOutlet(j, isPanTo);
                }
            }
        }, 300);
    }

    //*************************************************************************
    function tryEditOutlet(j, isPanTo) {
        // Still has issue if this outlet has been removed while user move
        log('Open outlet:' + j.toString());
        requestingDisplayOutlet = true;

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
        var isEditDraft = $scope.outlet.IsDraft;
        $scope.isNewOutlet = false;

        $mdDialog.show({
            scope: $scope.$new(),
            controller: isEditDraft ? newOutletController : editOutletController,
            templateUrl: isEditDraft ? 'views/outletCreate.html' : 'views/outletEdit.html',
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            fullscreen: false,
        })
        .then(function (answer) {
            requestingDisplayOutlet = false;
            if (!answer) return;

            if (isEditDraft) {
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
                }
            }

            if ($scope.outlet.IsTracked)
                $scope.outlet.Tracking = 1;
            else
                $scope.outlet.Tracking = 0;

            if ($scope.outlet.IsOpened) $scope.outlet.CloseDate = '';

            $scope.outlet.AmendBy = user.id;

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
            orgOutlet.StringImage1 = $scope.outlet.StringImage1;
            orgOutlet.StringImage2 = $scope.outlet.StringImage2;
            orgOutlet.StringImage3 = $scope.outlet.StringImage3;
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
                            if (curOutletView == 1)
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
                    saveOutletDB(config.tbl_outlet, orgOutlet, curOutletView, synced,
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
            requestingDisplayOutlet = false;
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
        if (outlet.modifiedImage1 || outlet.modifiedImage2 || outlet.modifiedImage3) {
            log('Save image to database before start uploading');
            insertOutletImages(user.id, outlet, function (uploadItems) {
                submitOutlet(outlet, function (status) {
                    if (!status) { // save failed
                        onSuccess(status);
                    } else {
						if(uploadItems.length > 0){						
                        tryUploadImages(uploadItems, 0,
                            function () {
                                onSuccess(true);
                            },
                            function () {
                                onSuccess(false);
                            });
						} else{
							onSuccess(true);
						}
                    }
                });
            }, function (err) {
                log(err);
                showError(err);
            });
        }
        else
            submitOutlet(outlet, onSuccess);
    }

    //*************************************************************************
    function submitOutlet(outlet, callback) {
        if (networkReady()) {
            var url = baseURL + '/outlet/save';
            log('Call service api: ' + url);
            //var data = JSON.stringify(outlet);
            //log(outlet);
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

		log(item);
        var fileURL = item.ImagePath;
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
            outletid: item.OutletID.toString(),
            index: item.ImageIndex.toString(),
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
	function syncOutletMethod(onSuccess, onError) {
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
				trySyncOutlets(unsyncedOutlets, 0, onSuccess, onError);
			}, function(dberr){
                onError('Query unsynced outlet error');
				log(dberr);				
			});		 
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
	function enableOffline(isOnline) {
	    if (isOnline) {
	        $("#home-topright-offline").css('display', 'none');
	    } else {	        
	        $("#home-topright-offline").css('display', 'inline-block');
	    }
	}

    //*************************************************************************
    try {
        enableOffline(networkReady());

        locationChangedCallback = handleLocationChange;

        onNetworkChangedCallback = function (networkStatus) {            
            enableOffline(networkStatus);
            if (networkStatus) {
                if (!isMapReady) {
                    loadMapApi();
                    getCurPosition(true, function (lat, lng) {
                        if (!firstStart)
                            changeGPSTrackingStatus();
                    }, function (err) { });
                }
                syncOutletMethod(function () {
                    log('*** SYNC COMPLETED');
                }, function () {
                    log('*** SYNC ERROR');
                });
            }
        }

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

        syncExecuter = syncOutletMethod;

        initializeView();
        editOutletCallback = function (i) { editOutlet(i, false);};   
        loadMapCallback = function () {          
            if (networkReady()) {
                if(isMapReady)
                {
                    log('Move to current location');
                    moveToCurrentLocation();
                }
                queryOutletsOnline(false, function (foundOutlets) {
                    loadOutlets(foundOutlets);
                });
            } else {
                queryOutlets(false, curOutletView, function (foundOutlets) {
                    loadOutlets(foundOutlets);
                });
            }
            loadMapCallback = null;
        };

        getCurPosition(true, function (lat, lng) {            
            loadMapApi();
        }, function (err) {
            log(err);
            //showError('Cannot get current location!');
            loadMapApi();
        });		                               		
    } catch (err) {
        showError(err);
        log(err);
    }
};