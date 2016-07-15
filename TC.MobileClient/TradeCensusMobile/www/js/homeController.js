/// <reference path="tc.databaseAPI.js" />
/// <reference path="tc.appAPI.js" />
/// <reference path="tc.mapAPI.js" />
/// <reference path="tc.outletAPI.js" />
/// <reference path="tc.dlgAPI.js" />


function homeController($scope, $http, $mdDialog, $mdMedia, $timeout) {
    log('Enter Home page');
    log(user);    
    var leftPanelStatus = 0;
    var righPanelStatus = 0;
    var nearByOutlets = [];
    var curOutletView = 0; // 0: near-by; 1: new: 2: updated 4: audit
    //$scope.nearByOutlets = [];
    //$scope.newOutlets = [];
    //$scope.updatedOutlets = [];
    //$scope.auditOutlets = [];
     
    $scope.resource = resource;
    $scope.config = config;
    $scope.editOutletFull = false;
    $scope.allowRefresh = true;
    //$scope.hasAuditRole = user.hasAuditRole;
    $scope.outletHeader = 'Near-by Outlets';         
    $scope.showNoOutletFound = true; 
    $scope.showSyncButton = false;   
    $scope.outlets = [];
    $scope.showListButton = true;
    $scope.showCollapseButton = false;
    $scope.showExpandButton = false;

    var homeMarker = null;

    $scope.refresh = function () {
        if (curOutletView == 0) {
            nearByOutlets = [];
        }
        getOutletsByView(curOutletView);
    }

    $scope.closeLeftPanel = function () {
        $scope.hideDropdown();
        leftPanelStatus = 0;
        $scope.showListButton = true;
        $scope.showCollapseButton = false;
        $scope.showExpandButton = false;      
        $scope.viewOutletFull = false;
        $("#outletPanel").css('width', '0%');
    }

    $scope.showLeftPanel = function () {
        $scope.hideDropdown();
        leftPanelStatus = 2;
        $scope.showListButton = false;
        $scope.showExpandButton = false;        
        $scope.showCollapseButton = networkReady();
        $scope.viewOutletFull = true;
        $("#outletPanel").css('width', '100%');
    }

    $scope.showhideLeftPanel = function () {
        $scope.hideDropdown();
        log("Left panel state: " + leftPanelStatus.toString());
        if (leftPanelStatus > 1) return;
        
       
        if (leftPanelStatus == 0) {
            leftPanelStatus = 1;           
            $scope.showExpandButton = true;
            $scope.showCollapseButton = false;
            $scope.viewOutletFull = false;            
            $("#outletPanel").css('width', '40%');
        } else if (leftPanelStatus == 1){
            leftPanelStatus = 0;           
            $scope.showExpandButton = false;
            $scope.showCollapseButton = false;
            $scope.viewOutletFull = false;
            $("#outletPanel").css('width', '0%');
        }       
    }

    $scope.showRightPanel = function () {       
        if (righPanelStatus == 0) {
			log('show right panel');
			$("#home-right-panel").css('margin-right', '0');
			$("#config-form").css('width', '30%');
			
			righPanelStatus = 1;
        } else {
            log('hide right panel');
            $("#home-right-panel").css('margin-right', '-100%');
			$("#config-form").css('width', '0%');
            righPanelStatus = 0;        
			if(networkReady() && !isMapReady){
				loadMapApi();
				initializeView();
			}
        }
    }

    $scope.hideRightPanel = function () {
        log('hide right panel');
        $scope.hideDropdown();       
        $("#home-right-panel").css('margin-right', '-100%');
        righPanelStatus = 0;       
    }

    $scope.showDropdown = function () {
        $("#outlet-dropdown").css('display', 'block');
    }

    $scope.hideDropdown = function () {
        $("#outlet-dropdown").css('display', 'none');
    }

    $scope.openOutlet = function (i) {
        editOutlet(i);
    }

    $scope.changeOutletView = function (v) {
        $scope.hideDropdown();
        if (curOutletView === v) return;
        log('change view to ' + v.toString());
        //curOutletView = v;
        getOutletsByView(v);
    }

    $scope.createNewOutlet = function () {
        log('create new outlet');
        showDlg('Get current location', "Please wait...");

        devNewDetlta = devNewDetlta + 0.0001;

        try {
            getCurPosition(function (lat, lng) {
                lat = Math.round(lat * 100000000) / 100000000;
                lng = Math.round(lng * 100000000) / 100000000;
              
                // AnVO: DEBUG
                if (isDev) {
                    lat = devNewLat + devNewDetlta;
                    lng = devNewLng + devNewDetlta;
                }
                curlat = lat;
                curlng = lng;
                if (networkReady()) {
                    panTo(lat, lng);

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
                    unsyncedOutlets[i] = dbres.rows[0];
                }
                trySyncOutlets(unsyncedOutlets, 0, function () {
                    showInfo('Synchronize completed!');
                    $scope.showSyncButton = false;
                }, function(err){
					 showError(err);
				});
            }, handleDBError);
    }

    $scope.deleteOutlet = function (i) {
        var outlet = $scope.outlets[i];
        
        showConfirm('Delete Outlet', 'Are you sure you want to delete outlet ' + outlet.Name, function () { deleteDraftOutlet(outlet); }, function () { });
    }

    function initializeView() {        
        var hasNetwork = networkReady();
        log('update view when base on network: ' + hasNetwork);
        if (hasNetwork) {
            $scope.showListButton = true;
            $scope.showCollapseButton = false;
            $scope.showExpandButton = false;
            $scope.closeLeftPanel();            
        } else {
            $scope.showListButton = false;
            $scope.showCollapseButton = false;
            $scope.showExpandButton = false;
            $scope.showLeftPanel();            
        }
    }    

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
    
    function getOutletsByView(view) {
        $scope.outlets.length = 0;
        switch (view) {
            case 0:
                log('view near-by outlets');
                if (nearByOutlets.length > 0) {
                    showDlg('Load near-by outlets', "Please wait...");
                    curOutletView = view;
                    $scope.outletHeader = 'Near-by Outlets';
                    loadOutlets(nearByOutlets);
                } else {
                    showDlg('Get current location', "Please wait...");
                    getCurPosition(function (lat, lng) {
                        var isPosChanged = lat != curlat || lng != curlng;
                        curlat = lat;
                        curlng = lng;
                        curOutletView = view;
                        $scope.outletHeader = 'Near-by Outlets';
                        if (isPosChanged) {
                            panTo(curlat, curlng);                           
                        }
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
                break;
            case 1:
                log('view new outlets');
                showDlg('Get new outlets', "Please wait...");
                queryOutlets(view, function (foundOutlets) {
                    curOutletView = view;
                    $scope.outletHeader = 'New Outlets';
                    loadOutlets(foundOutlets);
                });
                break
            case 2:
                log('view updated outlets');
                showDlg('Get updated outlets', "Please wait...");
                queryOutlets(view, function (foundOutlets) {
                    curOutletView = view;
                    $scope.outletHeader = 'Updated Outlets';
                    loadOutlets(foundOutlets);
                });
                break;
            case 4:
                log('view auditted outlets');
                showDlg('Get auditted outlets', "Please wait...");
                queryOutlets(view, function (foundOutlets) {
                    curOutletView = view;
                    $scope.outletHeader = 'Auditted Outlets';
                    loadOutlets(foundOutlets);
                });
                break;
        }
    }   
     
    function getNearByOutletsOnline(callback) {
        var url = baseURL + '/outlet/getoutlets/' + curlat.toString() + '/' + curlng.toString() + '/'
                          + config.distance.toString() + '/' + config.item_count.toString();
        log('Call service api: ' + url);
        $http({
            method: config.http_method,
            url: url
        }).then(function (resp) {
            hideDlg();
            try {
                var data = resp.data;
                if (data.Status == -1) { // error
                    handleError(data.ErrorMessage);
                } else {
                    nearByOutlets = data.Items;
                    nearByOutlets.sort(function (a, b) { return a.Distance - b.Distance });
					log('Found near by outlet:' + nearByOutlets.length.toString());
                    insertOutletsDB(user.id, config.tbl_outlet, nearByOutlets,
                        function () {
                            callback(nearByOutlets);
                        },
                        function (dberr) {
                            showError(dberr.message);
                        });
                }
            } catch (err) {
                showError(dberr.message);
            }
        }, handleHttpError);
    }   

    function loadOutlets(outlets) {
        $scope.outlets.length = 0;
        clearMarkers();
        if (isMapReady && networkReady()){
            loadMarkers(curOutletView == 1, outlets, 
                function(){
                    setOutletsToList(outlets);
                });
        } else{
            setOutletsToList(outlets);
        }
    }

    function setOutletsToList(outlets) {
        $timeout(function () {
            $scope.showNoOutletFound = outlets.length == 0;
            for(var i = 0; i< outlets.length; i++){
                $scope.outlets[i] = outlets[i];               
            }            
            $('.md-scroll-mask').remove();
            hideDlg();
        }, 100);
    }   

    function editOutlet(i) {
        log(i);
        marker = markers[i]       
        panTo(marker.position.lat(), marker.position.lng());     
        //ou $scope.outlets[i]
        var clonedOutlet = cloneObj($scope.outlets[i]);
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
                
                var isUnDraft = $scope.outlet.IsDraft != $scope.outlets[i].IsDraft;

                //$scope.outlets[i].Action: 0,
                $scope.outlets[i].AddLine = $scope.outlet.AddLine;
                $scope.outlets[i].AddLine2 = $scope.outlet.AddLine2;
                //$scope.outlets[i].AreaID= $scope.outlet.AreaID;
                $scope.outlets[i].AuditStatus = $scope.outlet.AuditStatus;
                $scope.outlets[i].CloseDate = $scope.outlet.CloseDate;
                $scope.outlets[i].Distance = $scope.outlet.Distance;
                $scope.outlets[i].District = $scope.outlet.District;
                $scope.outlets[i].FullAddress = $scope.outlet.FullAddress;
                //$scope.outlets[i].InputBy=  user.id,
                $scope.outlets[i].IsOpened = $scope.outlet.IsOpened;
                $scope.outlets[i].IsTracked = $scope.outlet.IsTracked;
                $scope.outlets[i].Name = $scope.outlet.Name;
                $scope.outlets[i].Note = $scope.outlet.Note;
                $scope.outlets[i].OTypeID = $scope.outlet.OTypeID;
                $scope.outlets[i].OutletEmail = $scope.outlet.OutletEmail;
                $scope.outlets[i].OutletSource = $scope.outlet.OutletSource;
                $scope.outlets[i].OutletTypeName = $scope.outlet.OutletTypeName;
                $scope.outlets[i].Phone = $scope.outlet.Phone;
                $scope.outlets[i].ProvinceID = $scope.outlet.ProvinceID;
                $scope.outlets[i].ProvinceName = $scope.outlet.ProvinceName;
                $scope.outlets[i].StringImage1 = $scope.outlet.StringImage1;
                $scope.outlets[i].StringImage2 = $scope.outlet.StringImage2;
                $scope.outlets[i].StringImage3 = $scope.outlet.StringImage3;
                $scope.outlets[i].TotalVolume = $scope.outlet.TotalVolume;
                $scope.outlets[i].Tracking = $scope.outlet.Tracking;
                $scope.outlets[i].VBLVolume = $scope.outlet.VBLVolume;
                $scope.outlets[i].PStatus = $scope.outlet.PStatus;

                if (curOutletView != 1) { // new outlet
                    var iconUrl = getMarkerIcon($scope.outlet);
                    log('change marker ' + i.toString() + ' icon: ' + iconUrl);
                    markers[i].setIcon(iconUrl);
                }

                log('save outlet')
                showDlg('Saving Outlet', 'Please wait...');
                if ($scope.outlet.IsDraft) {
                    log('save outlet to local db')
                    saveOutletDB(config.tbl_outlet, $scope.outlets[i], 1, false,
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
                        saveOutletDB(config.tbl_outlet, $scope.outlets[i], isEditDraft ? 1 : 2, synced,
                            function () {
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

    function saveOutlet(outlet, onSuccess) {
        if (outlet.modifiedImage1 || outlet.modifiedImage2 || outlet.modifiedImage3) {
            log('Save image to database before start uploading');
            insertOutletImages(user.id, outlet, function (uploadItems) {
                submitOutlet(outlet, function (status) {
                    if (!status) { // save failed
                        onSuccess(status);
                    } else {
                        tryUploadImages(uploadItems, 0,
                            function () {
                                onSuccess(true);
                            },
                            function () {
                                onSuccess(false);
                            });
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

    function submitOutlet(outlet, callback) {
        if (networkReady()) {
            var url = baseURL + '/outlet/save';
            log('Call service api: ' + url);
            //var data = JSON.stringify(outlet);
            log(outlet);
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

    function tryUploadImages(uploadItems, i, onSuccess, onError) {
        showDlg('Uploading image (' + (i + 1).toString() + '/' + uploadItems.length.toString() + ')', 'Please wait...');
        var item = uploadItems[i];

        var fileURL = item.ImagePath;
        // TODO: check file existing...
        var options = new FileUploadOptions();
        options.fileKey = 'orderfile';
        options.fileName = 'orderfile'; //fileURL.substr(fileURL.lastIndexOf('/') + 1);
        options.mimeType = "image/jpeg";
        options.params = {
            outletid: item.OutletID.toString(),
            index: (i + 1).toString(),
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

    //******************************************
    try {
        //if (isRegisterNetworkChanged) {
        //    document.addEventListener("online", loadMapApi, false);
        //    document.addEventListener("resume", loadMapApi, false);
        //}        
		
		startSyncProgress();
        editOutletCallback = function (i) { 
			editOutlet(i); 
		};
        loadMapCallback = function () {
            log('refresh');           
            $scope.refresh();
        };
        initializeView();
        loadMapApi();		
    } catch (err) {
        showError(err);
        log(err);
    }
    //******************************************
	
	function startSyncProgress() {
		setTimeout(function () {
			syncOutletMethod(function () { startSyncProgress(); });
		}, config.sync_time);
	}

	function syncOutletMethod(callback) {
		log('*** BEGIN SYNC');
		if(!enableSync || !networkReady()) {
			log(dberr);
			log('*** SYNC Ignored: sycn is disabled or no connection');
			callback();
			return;
		}
					
		selectUnsyncedOutlets(config.tbl_outlet,
			function (dbres) {
				log('Found unsynced outlets: ' + dbres.rows.length.toString());
				if (dbres.rows.length == 0) {
					log('*** SYNC Ignored: no updated outlet');
					callback();
					return;
				}
				unsyncedOutlets = [];
				var i;			
				for (i = 0; i < dbres.rows.length; i++) {
					unsyncedOutlets[i] = dbres.rows[0];
				}
				trySyncOutlets(unsyncedOutlets, 0, function () {
					log('*** SYNC COMPLETED');									
					callback();
				}, function(err){
					log('*** SYNC Error: ' + err);									
					callback();
				});
			}, function(dberr){
				log(dberr);
				log('*** SYNC Error: Query unsynced outlet error');									
				callback();
			});		 
	}
	
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
                            uploadItems[i] = dbres.rows[i];
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
};