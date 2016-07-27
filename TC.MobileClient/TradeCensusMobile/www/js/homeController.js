﻿/// <reference path="tradecensus.js" />
/// <reference path="tc.outletAPI.js" />
/// <reference path="tc.mapAPI.js" />
/// <reference path="tc.dlgAPI.js" />
/// <reference path="tc.databaseAPI.js" />
/// <reference path="tc.appAPI.js" />


function homeController($scope, $http, $mdDialog, $mdMedia, $timeout) {
    log('Enter Home page');
    log(user);    
    var leftPanelStatus = 0;
    var righPanelStatus = 0;
    var viewDropdown = 0;
    //var nearByOutlets = [];
 
    var curOutletView = 0; // 0: near-by; 1: new: 2: updated 4: audit
    //$scope.nearByOutlets = [];
    //$scope.newOutlets = [];
    //$scope.updatedOutlets = [];
    //$scope.auditOutlets = [];
    $scope.testlat = curlat;
    $scope.testlng = curlng;
    $scope.testacc = curacc;

    $scope.provinces = provinces;
    $scope.resource = resource;
    $scope.config = config;
    $scope.editOutletFull = false;
    $scope.allowRefresh = true;
    $scope.hasAuditRole = user.hasAuditRole;
    $scope.outletHeader = 'Near-by Outlets';         
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

    $scope.currentPage = 0;
    $scope.pageSize = config.page_size;
    $scope.numberOfPages = function(){        
        return Math.ceil($scope.outlets.length/$scope.pageSize);                
    }  

    //*************************************************************************
    $scope.refresh = function () {
        if (curOutletView == 0) {
            nearByOutlets = [];
        }
        initializeView();
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
        $("#outletPanel").css('width', '0%');
        $("#slider-left-content").css('margin-bottom', '4px');
    }

    //*************************************************************************  
    $scope.expandOutletPanel = function(){
        $scope.hideDropdown();
        leftPanelStatus = 2;
        //$scope.showListButton = true;

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
    $scope.collapseOutletPanel = function(){
        $scope.hideDropdown();
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
    $scope.showRightPanel = function () {       
        if (righPanelStatus == 0) {
			log('show right panel');
			$("#configPanel").css('width', '360px');
			$scope.showSettingCollapse = true;
            $scope.showSettingExpand = false;
			righPanelStatus = 1;
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
            initializeView();            
        }
    }

    //*************************************************************************
    $scope.hideRightPanel = function () {
        log('hide right panel');
        $scope.hideDropdown();       
        $("#home-right-panel").css('margin-right', '-100%');
        righPanelStatus = 0;       
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
        $scope.closeLeftPanel();
        if (curOutletView === v) return;
        log('change view to ' + v.toString());
        //curOutletView = v;
        $scope.currentPage = 0;     
        getOutletsByView(v, false);
    }

    //*************************************************************************
    $scope.createNewOutlet = function () {
        log('create new outlet');
        showDlg('Get current location', "Please wait...");

        devNewDetlta = devNewDetlta + 0.0001;

        try {
            getCurPosition(true, function (lat, lng) {
                lat = Math.round(lat * 100000000) / 100000000;
                lng = Math.round(lng * 100000000) / 100000000;                             
                if (networkReady()) {
                    log('try reverse the address');
                    var geocoder = new google.maps.Geocoder();
                    geocoder.geocode({
                        'latLng': new google.maps.LatLng(lat, lng),
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
                            tryCreateNewOutlet(lat, lng, street, district);
                        } else {
                            log('Geocoder failed due to: ' + status);
                            tryCreateNewOutlet(lat, lng, '', '');
                        }
                    });
                } else {
                    tryCreateNewOutlet(lat, lng, '', '');
                }
            }, function () {
                showError('Cannot get current location!');
            });          
        } catch (err) {
            log(err);
        }
    }

    //*************************************************************************
    $scope.syncOutlets = function () {
        if (!networkReady()) {
            showError('Please check network connection!');
            return;
        }
        showDlg('Synchronize Outlets', 'Please wait...');
        selectUnsyncedOutlets(config.tbl_outlet,
            function (dbres) {
                log('Number of unsynced outlets: ' + dbres.rows.length.toString());
                if (dbres.rows.length == 0) {
                    showInfo('All outlets have been synced!');
                    return;
                }
                var i;
                unsyncedOutlets = [];
                for (i = 0; i < dbres.rows.length; i++) {
                    unsyncedOutlets[i] = dbres.rows.item(i);
                }
                trySyncOutlets(unsyncedOutlets, 0, function () {
                    showInfo('Synchronize completed!');
                    $scope.showSyncButton = false;
                }, function(err){
					 showError(err);
				});
            }, handleDBError);
    }

    //*************************************************************************
    $scope.deleteOutlet = function (i) {
        var outlet = $scope.outlets[i];
        
        showConfirm('Delete Outlet', 'Are you sure you want to delete outlet ' + outlet.Name, function () { deleteDraftOutlet(outlet); }, function () { });
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
    function tryCreateNewOutlet(lat, lng, address2, district) {
        log($scope.outletTypes);
        $scope.outlet = newOutlet();
        $scope.outlet.AddLine2 = address2;
        $scope.outlet.District = district;        
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
            if (answer) {
                log('save outlet')
                $scope.outlet.PStatus = ($scope.outlet.IsDraft) ? 1 : 0;

                log('$scope.outlet.IsDraft: ' + $scope.outlet.IsDraft.toString());
                showDlg('Saving Outlet', 'Please wait...');
                if ($scope.outlet.IsDraft) {
                    addOutletDB(config.tbl_outlet, $scope.outlet, false, function () {
                        if (curOutletView == 1)
                            $scope.refresh();
                        else
                            $scope.changeOutletView(1);
                        hideDlg();
                    }, function (dberr) {
                        hideDlg();
                        showError(dberr.message);
                    });
                } else {
                    saveOutlet($scope.outlet,
                       function (synced) {
                           addOutletDB(config.tbl_outlet, $scope.outlet, synced,
                               function () {
                                   if (curOutletView == 1)
                                       $scope.refresh();
                                   else
                                       $scope.changeOutletView(1);
                                   //$scope.refresh();
                                   //addOutletRequiredFields($scope.outlet);
                                   //$scope.outlets[$scope.outlets.length] = $scope.outlet;
                                   //createMaker($scope.outlet, new google.maps.LatLng($scope.outlet.Latitude, $scope.outlet.Longitude), markers.length, true);
                                   hideDlg();
                               }, function (dberr) {
                                   hideDlg();
                                   showError(dberr.message);
                               });
                       });
                }
            }
        }, function () {
        });
    }
    
    //*************************************************************************
    function getOutletsByView(view, isbackground) {
        $scope.outlets.length = 0;
        switch (view) {
            case 0:
                log('view near-by outlets');
                if(isbackground){
                    nearByOutlets = [];
                    if (networkReady()) {
                        getNearByOutletsOnline(isbackground, function (foundOutlets) {
                            log('*** Load outlet...');
                            loadOutlets(foundOutlets);
                        });
                    } else {
                        queryNearbyOutlets(function (foundOutlets) {
                            loadOutlets(foundOutlets);
                        });
                    }
                } else{
                    showDlg('Get current location', "Please wait...");
                    getCurPosition(false, function (lat, lng) {                       
                        curOutletView = view;
                        $scope.outletHeader = 'Near-by Outlets';                        
                        nearByOutlets = [];
                        if (networkReady()) {
                            getNearByOutletsOnline(isbackground, function (foundOutlets) {
                                log('*** Load outlet...');
                                loadOutlets(foundOutlets);
                            });
                        } else {
                            queryNearbyOutlets(function (foundOutlets) {
                                loadOutlets(foundOutlets);
                            });
                        }
                    }, function (err) {
                        log(err);
                        if(!isbackground) showError('Cannot get current location!');
                    });
                }
              
                /*
                if (nearByOutlets.length > 0) {
                    showDlg('Load near-by outlets', "Please wait...");
                    curOutletView = view;
                    $scope.outletHeader = 'Near-by Outlets';
                    loadOutlets(nearByOutlets);
                } else {
                    showDlg('Get current location', "Please wait...");
                    getCurPosition(function (lat, lng) {                       
                        curOutletView = view;
                        $scope.outletHeader = 'Near-by Outlets';                        
                        nearByOutlets = [];
                        if (networkReady()) {
                            getNearByOutletsOnline(function (foundOutlets) {
                                loadOutlets(foundOutlets);
                            });
                        } else {
                            queryNearbyOutlets(function (foundOutlets) {
                                loadOutlets(foundOutlets);
                            });
                        }
                    }, function (err) {
						log(err);
                        showError('Cannot get current location!');
                    });
                }
                */
                break;
            case 1:
                log('view new outlets');
                if(!isbackground) showDlg('Get new outlets', "Please wait...");
                queryOutlets(view, function (foundOutlets) {
                    curOutletView = view;
                    $scope.outletHeader = 'New Outlets';
                    loadOutlets(foundOutlets);
                });
                break
            case 2:
                log('view updated outlets');
                if(!isbackground) showDlg('Get updated outlets', "Please wait...");
                queryOutlets(view, function (foundOutlets) {
                    curOutletView = view;
                    $scope.outletHeader = 'Updated Outlets';
                    loadOutlets(foundOutlets);
                });
                break;
            case 4:
                log('view auditted outlets');
                if(!isbackground) showDlg('Get auditted outlets', "Please wait...");
                queryOutlets(view, function (foundOutlets) {
                    curOutletView = view;
                    $scope.outletHeader = 'Auditted Outlets';
                    loadOutlets(foundOutlets);
                });
                break;
        }
    }   
     
    //*************************************************************************
    function getNearByOutletsOnline(isbackground, callback) {       
        try{
            if(!config.distance)
            {
                showError("Distance is invalid!");
                return;
            }
            if(!config.item_count)
            {
                showError("Max Outlets is invalid!");
                return;
            }

            var url = baseURL + '/outlet/getoutlets/' + userID + '/' + 
                            + curlat.toString() + '/' + curlng.toString() + '/'
                            + config.distance.toString() + '/' + config.item_count.toString();
            log('Call service api: ' + url);
            $http({
                method: config.http_method,
                url: url
            }).then(function (resp) {            
                try {
                    var data = resp.data;
                    if (data.Status == -1) { // error
                        handleError(data.ErrorMessage);
                    } else {
                        nearByOutlets = data.Items;
                        nearByOutlets.sort(function (a, b) { return a.Distance - b.Distance });
                        if(!isbackground) 
                            showDlg('Get near-by outlets', 'Found ' + nearByOutlets.length.toString() + ' outlet(s)... loading outlets');
                        
                        insertOutletsDB(user.id, config.tbl_outlet, nearByOutlets,
                            function () {
                                log('Sync outlet from server completed');
                                callback(nearByOutlets);
                            },
                            function (dberr) {
                                if(!isbackground)
                                    showError(dberr.message);
                                else
                                    log(dberr.message);
                            });                    
                    }
                } catch (err) {
                    if(!isbackground)
                        showError(err.message);
                    else
                        log(err.message);
                }
            }, function(err){
                log('HTTP error...');
                log(err);
                hideDlg();
                if(!isbackground){
                    var msg = err.statusText == '' ? $scope.resource.text_ConnectionTimeout : err.statusText;
                    showError(msg);
                }            
            });
        } catch(ex){
            showError(ex.message);
        }
    }   

    //*************************************************************************
    function loadOutlets(outlets) {
        $scope.outlets.length = 0;
        log('Clear markers');
        clearMarkers();

        log('Set outlet list');
        if (isMapReady && networkReady()){
            loadMarkers(curOutletView == 1, outlets, 
                function(){
                    setOutletsToList(outlets);
                });
        } else{
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

            if(firstStart){
                firstStart = false;
                changeGPSTrackingStatus();
            }  
        }, 100);
    }
    
    //*************************************************************************
    $scope.downloadOutlets = function(){
        showDlg('Loading...', 'Please wait');        
	    selectDownloadProvincesDB(config.tbl_downloadProvince,
			function (dbres) {
				log('Found download provinces: ' + dbres.rows.length.toString());
                var dprovinces = [];
			    if (dbres.rows.length == 0) {					
					for(var i = 0; i< provinces.length; i++){                    
                        dprovinces[i] = {
                            id : provinces[i].id,
                            name : provinces[i].name,
                            download : 0,                            
                        };
                    }
			    } else {
			        for (var i = 0; i < dbres.rows.length; i++) {
			            dprovinces[i] = {
			                id: dbres.rows.item(i).id,
			                name: dbres.rows.item(i).name,
			                download: dbres.rows.item(i).download,
			            };
			        }
			    }

                $scope.dprovinces = dprovinces;
                hideDlg();				                            
                $mdDialog.show({
                    scope: $scope.$new(),
                    controller: downloadProvinceController,
                    templateUrl: 'views/downloadProvince.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: false,
                    fullscreen: false,
                })
                .then(function (answer) {
                    if (answer) {
                        log('save download')
                         saveDownloadProvincesDB(config.tbl_downloadProvince, $scope.dprovinces, 
                            function(){

                            }, 
                            function(dberr){
                                showError('Query error: ' + dberr.message);                                
                            });
                        $scope.dprovinces = [];
                    }
                }, function () {
                });

			}, function(dberr){
                log(dberr);
                showError('Query error: ' + dberr.message);					
			});		         
    }  

    //*************************************************************************
    function changeGPSTrackingStatus(){
        if($scope.enable_liveGPS){
            startPositionWatching();
        } else {
            stopPositionWatching();
        }
    }

    //*************************************************************************
    function handleLocationChange(lat, lng, acc){
        var distance = calcDistance({Lat: curlat, Lng : curlng}, {Lat : lat, Lng : lng});
        curacc = acc;
        if(distance > 10){
            curlat = lat;
            curlng = lng;            
            displayCurrentPostion();
            getOutletsByView(curOutletView, true);
        }      
        else 
            displayAccuracy() 
    }

    //*************************************************************************
    function editOutlet(j, isPanTo) {
        log('Open outlet:' + j.toString());

        var orgOutlet;                
        if(isPanTo){ // from left menu            
            orgOutlet = $scope.outlets[j + $scope.currentPage * $scope.pageSize];
        } else {
            orgOutlet = curOutlets[j];
        }        
        var clonedOutlet = cloneObj(orgOutlet);
        var i = clonedOutlet.positionIndex;
        log('display outlet ' + clonedOutlet.Name + ': ' + i.toString());    
        if(isPanTo && isMapReady && networkReady()){            
            marker = markers[i];                                       
            panToOutlet(marker.position.lat(), marker.position.lng(), i, orgOutlet);
        }
        //var clonedOutlet = cloneObj($scope.outlets[i]); //cloneObj($scope.outlets[i]);
        $scope.outlet = clonedOutlet;
        initializeOutlet($scope.outlet);        
        log('draft: ' + $scope.outlet.IsDraft);
		var isEditDraft = $scope.outlet.IsDraft;
        $mdDialog.show({
            scope: $scope.$new(),
            controller: isEditDraft ? newOutletController : editOutletController,
            templateUrl: isEditDraft ? 'views/outletCreate.html' : 'views/outletEdit.html',
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            fullscreen: false,
        })
        .then(function (answer) {           
            if (!answer) return

            if ($scope.outlet.isDeleted) {
                log('delete outlet ' + $scope.outlet.ID);
                deleteDraftOutlet($scope.outlet);
            } else {
                if ($scope.outlet.IsTracked) $scope.outlet.Tracking = 1;
                if ($scope.outlet.IsOpened) $scope.outlet.CloseDate = '';
                $scope.outlet.PStatus = ($scope.outlet.IsDraft) ? 1 : 0;
                $scope.outlet.AmendBy = user.id;
                
                var isUnDraft = $scope.outlet.IsDraft != orgOutlet.IsDraft;
                var isAuditChanged = $scope.outlet.AuditStatus != orgOutlet.AuditStatus;

                //orgOutlet.Action: 0,
                orgOutlet.AddLine = $scope.outlet.AddLine;
                orgOutlet.AddLine2 = $scope.outlet.AddLine2;
                //orgOutlet.AreaID= $scope.outlet.AreaID;
                orgOutlet.AuditStatus = $scope.outlet.AuditStatus;
                orgOutlet.CloseDate = $scope.outlet.CloseDate;
                orgOutlet.Distance = $scope.outlet.Distance;
                orgOutlet.District = $scope.outlet.District;
                orgOutlet.FullAddress = $scope.outlet.FullAddress;
                //orgOutlet.InputBy=  user.id,
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

                if (curOutletView != 1) { // new outlet
                    var iconUrl = getMarkerIcon($scope.outlet);
                    log('change marker ' + i.toString() + ' icon: ' + iconUrl);
                    markers[i].setIcon(iconUrl);
                }

                log('save outlet')
                showDlg('Saving Outlet', 'Please wait...');
                if ($scope.outlet.IsDraft) {
                    log('save outlet to local db')
                    saveOutletDB(config.tbl_outlet, orgOutlet, 1, false,
                            function () {
                                hideDlg();
                            }, function (dberr) {
                                hideDlg();
                                showError(dberr.message);
                            });
                } else {
                    log('save outlet to server')
                    saveOutlet($scope.outlet, function (synced) {
                        log('save outlet to local db')
                        saveOutletDB(config.tbl_outlet, orgOutlet, isEditDraft ? 1 : (isAuditChanged ? 4 : 2), synced,
                            function () {
                                if (curOutletView == 1)
                                       $scope.refresh();                                   
                                hideDlg();
                            }, function (dberr) {
                                hideDlg();
                                showError(dberr.message);
                            });
                    });
                }
            }
        }, function () {
        });
    }

    //*************************************************************************
    function deleteDraftOutlet(outlet) {    
        log('delete outlet ' + outlet.ID.toString());
        deteleOutletDB(config.tbl_outlet, outlet, function (tx) {
            hideDlg();
            $scope.refresh();
        }, function (dberr) {
            hideDlg();
            showError(dberr.message);
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
        showDlg('Uploading image (' + (i + 1).toString() + '/' + uploadItems.length.toString() + ')', 'Please wait...');
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
                showError('An error has occurred: Code = " + error.code');
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
            showError('An error has occurred: Code = " + error.code');
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

        onNetworkChangedCallback = function (connected) {            
            enableOffline(connected);
            if (connected && !isMapReady) {
                loadMapApi();
                getCurPosition(true, function (lat, lng) {
                    changeGPSTrackingStatus();
                }, function (err) { });
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
                getNearByOutletsOnline(false, function (foundOutlets) {
                    loadOutlets(foundOutlets);
                });
            } else {
                queryNearbyOutlets(function (foundOutlets) {
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