﻿/// <reference path="app.database.js" />
/// <reference path="app.global.js" />
/// <reference path="../assets/libs/markerclusterer.js" />

app.controller('HomeController', ['$scope', '$http', '$mdDialog', '$mdMedia', '$timeout',
    function ($scope, $http, $mdDialog, $mdMedia, $timeout) {
        log('Enter Home page');
        log($scope.user.id);
        log($scope.config.province_id);

        var curIndex = 0;
        //var curInfoWindow = null;
        var markers = [];        
        var markerClusterer;

        var leftPanelStatus = 0;
        var righPanelStatus = 0;
        var curlat = 10.773598;
        var curlng = 106.7058;
        var isMapLoaded = false;
        var hasNetwork = null;        
       
        $scope.editOutletFull = false;
        $scope.allowRefresh = true;
        //$scope.hasAuditRole = $scope.user.hasAuditRole;
        $scope.outletHeader = 'Near-by Outlets';
        $scope.outletCategory = 0; // 0: near-by; 1: new: 2: updated 4: audit
        //$scope.nearByOutlets = [];
        //$scope.newOutlets = [];
        //$scope.updatedOutlets = [];
        //$scope.auditOutlets = [];
        var nearByOutlets = [];
        $scope.outlets = [];
        $scope.showNoOutletFound = true;
        $scope.showSetingExpand = true;
        $scope.showSetingCollapse = false;

        var homeMarker = null;

        $scope.outletTypes = outletTypes;

        $scope.provinces = provinces;

        $scope.outlets = [];

        $scope.refresh = function () {
            hasNetwork = $scope.isOnline();          
            setSyncStatus(function () {
                updateViewWhenNetworkStatusChanged(function () {
                    if ($scope.outletCategory == 0) {
                        nearByOutlets = [];
                    }
                    getOutlets();
                });               
            });            
        }
        
        $scope.closeLeftPanel = function () {
            leftPanelStatus = 0;
            $scope.showCollapseButton = false;
            $scope.showExpandButton = false;
            changeLeftPanelView();
        }

        $scope.showLeftPanelFull = function () {
            leftPanelStatus = 2;
            $scope.showCollapseButton = hasNetwork != null && hasNetwork;
            $scope.showExpandButton = false;
            changeLeftPanelView();
        }

        $scope.showhideLeftPanel = function () {
            log("Left panel state: " + leftPanelStatus.toString());
            leftPanelStatus++;
            if (leftPanelStatus > 1)
                leftPanelStatus = 0;
            if (leftPanelStatus == 1) {
                $scope.showExpandButton = $scope.outlets.length > 0 && hasNetwork != null && hasNetwork;
            } else if (leftPanelStatus == 0) {
                $scope.showExpandButton = false;
                $scope.showCollapseButton = false;
            }
            changeLeftPanelView();
        }

        $scope.showhideRightPanel = function () {            
            $scope.hideDropdown();
            if (righPanelStatus == 0) {                
                log('show right panel');
                $("#home-right-panel").css('margin-right', '0');
                righPanelStatus = 1;
                $scope.showSetingExpand = false;
                $scope.showSetingCollapse = true;
            } else {
                log('hide right panel');
                $("#home-right-panel").css('margin-right', '-32%');
                righPanelStatus = 0;
                $scope.showSetingExpand = true;
                $scope.showSetingCollapse = false;
            }
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
            if ($scope.outletCategory === v) return;
            log('change view to ' + v.toString());
            $scope.outletCategory = v;
            getOutlets();          
        }

        $scope.createNewOutlet = function () {
            log('create new outlet');
            showDlg('Get current location', "Please wait...");

            try {
                navigator.geolocation.getCurrentPosition(function (position) {
                    var lat = Math.round(position.coords.latitude * 10000000) / 10000000;
                    var lng = Math.round(position.coords.longitude * 10000000) / 10000000;
                    log('Location found: ' + lat.toString() + ', ' + lng.toString());

                    // AnVO: DEBUG
                    if (isDev) {
                        lat = devNewLat + devNewDetlta;
                        lng = devNewLng + devNewDetlta;
                    }
                    curlat = lat;
                    curlng = lng;                                       
                    if (hasNetwork) {
                        adjustCurrentLocation(lat, lng);

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
            if (!hasNetwork) {
                showError('Please check network connection!');
                return;
            }
            showDlg('Synchronize Outlets', 'Please wait...');
            selectUnsyncedOutlets($scope.config.tbl_outlet,
                function (dbres) {
                    log('Number of unsynced outlets: ' + dbres.rows.length.toString());
                    if (dbres.rows.length == 0) {
                        showDlg('Info', 'All outlets have been synced!');
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
                    });
                }, handleDBError);
        }

        function updateViewWhenNetworkStatusChanged(callback) {
            log('update view when base on network: ' + hasNetwork.toString());
            if (hasNetwork) {
                $scope.showListButton = true;
                $scope.showCollapseButton = false;
                $scope.showExpandButton = false;
                $scope.closeLeftPanel();
                initializeMap(callback);
            } else {
                $scope.showListButton = false;
                $scope.showCollapseButton = false;
                $scope.showExpandButton = false;
                $scope.showLeftPanelFull();
                callback();
            }            
        }

        function changeLeftPanelView() {
            $scope.hideDropdown();
            if (leftPanelStatus == 0) {
                $scope.viewOutletFull = false;
                $("#outletPanel").css('width', '0%');
                //document.getElementById('outletPanel').style.width = '0%';
                //$('#expander-2').html('>');
            } else if (leftPanelStatus == 1) {
                $scope.viewOutletFull = false;
                $("#outletPanel").css('width', '40%');
                //document.getElementById('outletPanel').style.width = '40%';
                //$('#expander-2').html('>');
            } else {
                $scope.viewOutletFull = true;
                log('view full outlet');
                //document.getElementById('outletPanel').style.width = '100%';
                $("#outletPanel").css('width', '100%');
                //$('#expander-2').html('<');
            }
        }

        function tryCreateNewOutlet(lat, lng, address2, district) {
            log($scope.outletTypes);
            $scope.outlet = {
                Action: 0,
                AddLine: "",
                AddLine2: address2,
                AmendBy: 11693,
                AmendDate: "",
                AreaID: $scope.user.areaID,
                AuditStatus: 0,
                CloseDate: "",
                CreateDate: "",
                Distance: 0,
                District: district,
                FullAddress: "",
                ID: parseInt('65' + $scope.config.province_id + (Math.random() * 100000)),
                InputBy: $scope.user.id,
                IsOpened: true,
                IsTracked: false,
                LastContact: "",
                LastVisit: "",
                Latitude: lat,
                Longitude: lng,
                Name: "",
                Note: null,
                OTypeID: $scope.outletTypes[0].ID,
                OutletEmail: null,
                OutletSource: 1,
                OutletTypeName: $scope.outletTypes[0].name,
                PRowID: '',
                PersonID: $scope.user.id,
                Phone: "",
                ProvinceID: $scope.config.province_id,
                ProvinceName: "Hồ Chí Minh",
                StringImage1: "",
                StringImage2: "",
                StringImage3: "",
                TotalVolume: 0,
                Tracking: 0,
                VBLVolume: 0,
                PStatus: 0,
                IsDraft: false,
            };
            hideDlg();
            $mdDialog.show({
                scope: $scope.$new(),
                controller: newOutletController,
                templateUrl: 'views/outletCreate.html',
                parent: angular.element(document.body),
                clickOutsideToClose: false,
                fullscreen: false,
            })
            .then(function (r) {
                if (r) {
                    log('save outlet')
                    $scope.outlet.PStatus = ($scope.outlet.IsDraft) ? 1 : 0;

                    log('$scope.outlet.IsDraft: ' + $scope.outlet.IsDraft.toString());
                    showDlg('Saving Outlet', 'Please wait...');
                    if ($scope.outlet.IsDraft) {
                        addOutletDB($scope.config.tbl_outlet, $scope.outlet, false, function () {
                            if ($scope.outletCategory == 1)
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
                               addOutletDB($scope.config.tbl_outlet, $scope.outlet, synced,
                                   function () {
                                       if ($scope.outletCategory == 1)
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

        function trySyncOutlets(unsyncedOutlets, i, onSuccess) {
            var item = unsyncedOutlets[i];
            log('try sync outlet: ' + item.ID.toString());
            setDlgMsg('Sync outlet ' + item.Name + ' (' + (i + 1).toString() + '/' + unsyncedOutlets.length.toString() + ')');
            submitOutlet(item, function (status) {
                if (status) {
                    log('Sync outlet data: ' + item.ID.toString() + ' completed');
                    selectUnsyncedOutletImage($scope.user.id, item.ID, function (tx, dbres) {
                        if (dbres.rows.length > 0) {                            
                            uploadItems = [];
                            for (i = 0; i < dbres.rows.length; i++) {
                                uploadItems[i] = dbres.rows[0];
                            }
                            tryUploadImages(uploadItems, 0,
                                 function () {
                                     setOutletSyncStatus(tx, $scope.config.tbl_outlet, item.ID, 1, function (tx1) {
                                         if ((i + 1) < unsyncedOutlets.length) {
                                             trySyncOutlets(unsyncedOutlets, i + 1);
                                         } else {
                                             onSuccess();
                                         }
                                     }, handleDBError);
                                 },
                                 function () {
                                     showError('Sync error, please try again!');
                                 });
                        } else {
                            setOutletSyncStatus(tx, $scope.config.tbl_outlet, item.ID, 1, function (tx1) {
                                if ((i + 1) < unsyncedOutlets.length) {
                                    trySyncOutlets(unsyncedOutlets, i + 1);
                                } else {
                                    onSuccess();
                                }
                            }, handleDBError);
                        }
                    }, handleDBError);
                } else {
                    showError('Sync error, please try again!');
                }
            });                      
        }

        function getOutlets() {            
            switch ($scope.outletCategory) {
                case 0:
                    log('view near-by outlets');
                    $scope.outletHeader = 'Near-by Outlets';
                    if (nearByOutlets.length > 0) {
                        showDlg('Load near-by outlets', "Please wait...");
                        loadOutlets(nearByOutlets);
                    } else {
                        showDlg('Get current location', "Please wait...");
                        navigator.geolocation.getCurrentPosition(onGetLocationSuccess, onGetLocationError, { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
                    }
                    break;
                case 1:
                    log('view new outlets');
                    $scope.outletHeader = 'New Outlets';
                    showDlg('Load new outlets', "Please wait...");
                    getOutletsFromLocal(1);
                    break
                case 2:
                    log('view updated outlets');
                    $scope.outletHeader = 'Updated Outlets';
                    showDlg('Load updated outlets', "Please wait...");
                    getOutletsFromLocal(2);
                    break;
                case 4:
                    log('view auditted outlets');
                    $scope.outletHeader = 'Auditted Outlets';
                    showDlg('Load auditted outlets', "Please wait...");
                    getOutletsFromLocal(4);
                    break;
            }
        }

        function getNearbyOutlets() {
            showDlg('Get near-by outlets', "Please wait...");
            try {
                navigator.geolocation.getCurrentPosition(onGetLocationSuccess, onGetLocationError);
            } catch (err) {
                log(err);
            }
        }

        function onGetLocationSuccess(position) {
            curlat = position.coords.latitude;
            curlng = position.coords.longitude;
            log('found location: lat=' + curlat.toString() + ',lng=' + curlng.toString());

            // ANVO: DEBUG
            if (isDev) {
                log('***set debug location...');
                curlat = devCurLat;
                curlng = devCurLng;
                //initializeMap();lat = ;              
            }

            nearByOutlets = [];

            showDlg('Load near-by outlets', "Please wait...");
            if (hasNetwork) {
                getNearByOutletsOnline();
            } else {
                getNearByOutletsOffline();
            }
        }

        function onGetLocationError(error) {
            hideDlg();
            showDlg('Error', 'Cannot get current location!', true);
            getNearByOutletsOffline();
        }

        function addOutletRequiredFields(outlet) {
            var provinceName = '';
            for (p = 0; p < $scope.provinces.length; p++)
                if ($scope.provinces[p].id === outlet.ProvinceID) {
                    provinceName = $scope.provinces[p].name;
                    break;
                }

            var outletTypeName = '';
            for (p = 0; p < $scope.outletTypes.length; p++)
                if ($scope.outletTypes[p].id === outlet.OTypeID) {
                    outletTypeName = $scope.outletTypes[p].name;
                    break;
                }

            outlet.ProvinceName = provinceName;
            outlet.FullAddress = outlet.AddLine + ' ' + outlet.AddLine2 + ' ' + outlet.District + ' ' + provinceName;
            outlet.OutletTypeName = outletTypeName;
            outlet.Distance = 0;
            outlet.IsOpened = isEmpty(outlet.CloseDate);
            outlet.IsTracked = outlet.Tracking == 1;
            outlet.IsAuditApproved = outlet.AuditStatus == 1;
            outlet.IsDraft = outlet.PStatus == 1;
        }

        function getNearByOutletsOffline() {
            // hide panel
            //$scope.closeLeftPanel();
            meter = $scope.config.distance;
            count = $scope.config.item_count;
            var saleLoc = { Lat: curlat, Lng: curlng };
            var tl = calcRetangleBoundary(meter, 0 - meter, saleLoc);
            var tr = calcRetangleBoundary(meter, meter, saleLoc);
            var bl = calcRetangleBoundary(0 - meter, 0 - meter, saleLoc);
            var br = calcRetangleBoundary(0 - meter, meter, saleLoc);
            log('select outlets from local db');
            selectOutletsDistance($scope.config.tbl_outlet, bl.Lat, tl.Lat, bl.Lng, br.Lng,
                function (dbres) {
                    var rowLen = dbres.rows.length;
                    log('Found ' + rowLen.toString() + ' outlets');
                    if (rowLen) {
                        var found = 0;
                        for (i = 0; i < rowLen; i++) {
                            var outlet = dbres.rows.item(i);
                            var distance = 1000000;
                            if ($scope.config.calc_distance_algorithm == "circle")
                                distance = calcDistanceCircle(saleLoc, { Lat: outlet.Latitude, Lng: outlet.Longitude }, meter);
                            log('Distance to Outlet ' + outlet.ID.toString() + ': ' + distance.toString());

                            if (distance <= meter) {
                                log('Add outlet ' + outlet.ID.toString() + ' to list');
                                //var provinceName = '';
                                //for (p = 0; p < $scope.provinces.length; p++)
                                //    if ($scope.provinces[p].id === outlet.ProvinceID) {
                                //        provinceName = $scope.provinces[p].name;
                                //        break;
                                //    }
                                //var outletTypeName = '';
                                //for (p = 0; p < $scope.outletTypes.length; p++)
                                //    if ($scope.outletTypes[p].id === outlet.OTypeID) {
                                //        outletTypeName = $scope.outletTypes[p].name;
                                //        break;
                                //    }
                                //outlet.FullAddress = outlet.AddLine + ' ' + outlet.AddLine2 + ' ' + outlet.District + ' ' + provinceName;
                                //outlet.OutletTypeName = outletTypeName;

                                addOutletRequiredFields(outlet);
                                nearByOutlets[found] = outlet;
                                found++;
                            }

                            if (found >= count) break;
                        }
                        log('Display ' + nearByOutlets.length.toString() + ' outlets');
                        nearByOutlets.sort(function (a, b) { return a.Distance - b.Distance });
                        loadOutlets(nearByOutlets);
                    } else {
                        loadOutlets([]);
                    }
                    hideDlg();

                }, function (dberr) {
                    hideDlg();
                    showError(dberr.message);
                });
        }

        function calcRetangleBoundary(dlat, dlng, p) {
            var np = {
                Lat: p.Lat + (dlat / earthR) * (180 / Math.PI),
                Lng: p.Lng + (dlng / earthR) * (180 / Math.PI) / Math.cos(p.Lat * Math.PI / 180)
            };
            return np;
        }

        function calcDistanceCircle(saleLoc, outletLoc, meter) {
            var R = 6378137; // Earth’s mean radius in meter
            var dLat = calculateRad(outletLoc.Lat - saleLoc.Lat);
            var dLong = calculateRad(outletLoc.Lng - saleLoc.Lng);
            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(calculateRad(saleLoc.Lat)) * Math.cos(calculateRad(outletLoc.Lat)) *
                   Math.sin(dLong / 2) * Math.sin(dLong / 2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = R * c;
            return Math.round(d * 100) / 100;
        }

        function calculateRad(x) {
            return x * Math.PI / 180;
        }

        function getNearByOutletsOnline() {
            var url = baseURL + '/outlet/getoutlets/' + curlat.toString() + '/' + curlng.toString() + '/'
                      + $scope.config.distance.toString() + '/' + $scope.config.item_count.toString();
            log('Call service api: ' + url);
            $http({
                method: $scope.config.http_method,
                url: url
            }).then(function (resp) {
                hideDlg();
                var data = resp.data;
                if (data.Status == -1) { // error
                    handleError(data.ErrorMessage);
                } else {
                    nearByOutlets = data.Items;
                    nearByOutlets.sort(function (a, b) { return a.Distance - b.Distance });
                    insertOutlets($scope.user.id, $scope.config.tbl_outlet, nearByOutlets,
                        function () {
                            loadOutlets(nearByOutlets);
                        },
                        function (dberr) {
                            hideDlg();
                            log(dberr.message);
                            showError(dberr.message);
                        });
                }
            }, handleHttpError);
        }

        function getOutletsFromLocal(state) {
            showDlg('Get outlets', "Please wait...");
            try {
                selectOutlets($scope.config.tbl_outlet, state, $scope.config.province_id,
                    function (dbres) {
                        hideDlg();
                        var rowLen = dbres.rows.length;
                        log('Found ' + rowLen.toString() + ' outlets');
                        if (rowLen) {
                            var foundOutlets = [];
                            for (i = 0; i < rowLen; i++) {
                                var outlet = dbres.rows.item(i);
                                log(outlet);

                                //var provinceName = '';
                                //for (p = 0; p < $scope.provinces.length; p++)
                                //    if ($scope.provinces[p].id === outlet.ProvinceID) {
                                //        provinceName = $scope.provinces[p].name;
                                //        break;
                                //    }
                                //var outletTypeName = '';
                                //for (p = 0; p < $scope.outletTypes.length; p++)
                                //    if ($scope.outletTypes[p].id === outlet.OTypeID) {
                                //        outletTypeName = $scope.outletTypes[p].name;
                                //        break;
                                //    }
                                //outlet.FullAddress = outlet.AddLine + ' ' + outlet.AddLine2 + ' ' + outlet.District + ' ' + provinceName;
                                //outlet.OutletTypeName = outletTypeName;
                                //outlet.Distance = 0;
                                //outlet.IsOpened = isEmpty(outlet.CloseDate);
                                //outlet.IsTracked = outlet.Tracking == 1;
                                //outlet.IsAuditApproved = outlet.AuditStatus == 1;

                                addOutletRequiredFields(outlet);
                                foundOutlets[i] = outlet;
                            }
                            loadOutlets(foundOutlets);
                        } else {
                            loadOutlets([]);
                        }
                    }, function (dberr) {
                        hideDlg();
                        showError(dberr.message);
                    });
            } catch (err) {
                log(err);
                hideDlg();
                showError(err.message);
            }
        }

        function loadOutlets(outlets) {
            curIndex = 0;
            if (map != null && hasNetwork) {
                loadMarkers(outlets, function () {
                    setOutletsToList(outlets);
                });
            } else {
                setOutletsToList(outlets);
            }
        }

        function setOutletsToList(outlets) {
            $timeout(function () {
                $scope.showNoOutletFound = outlets.length == 0;
                $scope.outlets = outlets;
                $('.md-scroll-mask').remove();
                hideDlg();
            }, 100);
        }

        function loadMarkers(outlets, callback) {
            //showDlg("Load Markers...", "Please wait");
            log("Clear existing markers");
            clearMarkers();

            log("load outlets markers: " + outlets.length.toString());
            var bounds = new google.maps.LatLngBounds();
            for (var i = 0; i < outlets.length; i++) {
                var outlet = outlets[i];
                var position = new google.maps.LatLng(outlet.Latitude, outlet.Longitude);
                bounds.extend(position);               
                createMaker(outlet, position, i, $scope.outletCategory == 1);
            };
            var homePosition = new google.maps.LatLng(curlat, curlng);
            homeMarker = new google.maps.Marker({
                position: homePosition,
                icon: 'assets/img/pin-cur.png',
                map: map,
            });
            bounds.extend(homePosition);

            map.fitBounds(bounds);
            var options = {
                gridSize: $scope.config.cluster_size,
                maxZoom: $scope.config.cluster_max_zoom,
                imagePath: 'assets/img/m'
            };
            markerClusterer = new MarkerClusterer(map, markers, options);
            //adjustCurrentLocation(la)

            var mapeventListener = google.maps.event.addListener(map, 'bounds_changed', function (event) {
                log('map bounds_changed');
                google.maps.event.removeListener(mapeventListener);
                callback();                
            });
        }

        function clearMarkers() {
            if (markerClusterer)
                markerClusterer.clearMarkers();
            if (homeMarker != null) homeMarker.setMap(null);
            for (var i = 0; i < markers.length; i++) {
                markers[i].setMap(null);
            }
            markers = [];
           // curInfoWindow = null;
        }

        function createMaker(outlet, position, i, isNew) {
            var iconUrl = isNew ? 'assets/img/pin-new.png' : getMarkerIcon(outlet);
            var marker = new google.maps.Marker({
                position: position,
                title: outlet.Name,
                icon: iconUrl,
                map: map,
            });         
            markers[i] = marker;

            var infoWindow = new google.maps.InfoWindow({
                content: '<div class=\'view-marker\'>' + outlet.Name + '</div>',
                closeBoxURL: '',                
            });
            infoWindow.open(map, marker);
            marker.addListener('click', function () {
                editOutlet(markers.indexOf(marker));
            });

            return marker;
        }

        function adjustCurrentLocation(lat, lng) {
            if (homeMarker != null) homeMarker.setMap(null);
            var position = new google.maps.LatLng(lat, lng);
            homeMarker = new google.maps.Marker({
                position: position,
                icon: 'assets/img/pin-cur.png',
                map: map,
            });
            map.panTo(position);
        }

        function editOutlet(i) {
            log(i);
            var clonedOutlet = cloneObj($scope.outlets[i]);
            $scope.outlet = clonedOutlet;
            log('draft: ' + $scope.outlet.IsDraft);
            $mdDialog.show({
                scope: $scope.$new(),
                controller: $scope.outlet.IsDraft ? newOutletController : editOutletController,
                templateUrl:  $scope.outlet.IsDraft ? 'views/outletCreate.html' : 'views/outletEdit.html',
                parent: angular.element(document.body),
                clickOutsideToClose: true,
                fullscreen: false,
            })
            .then(function (answer) {
                log('answer: ' + anwser.toString());
                if (answer == 0) return;

                if (answer === 2) {
                    log('delete outlet ' + $scope.outlet.ID);
                    deteleOutletDB($scope.config.tbl_outlet, $scope.outlet, function (tx) {
                        hideDlg();
                        $scope.refresh();
                    }, function (dberr) {
                        hideDlg();
                        showError(dberr.message);
                    });
                } else if (answer === 1) {
                    if ($scope.outlet.IsTracked) $scope.outlet.Tracking = 1;
                    if ($scope.outlet.IsOpened) $scope.outlet.CloseDate = '';
                    $scope.outlet.AmendBy = $scope.user.id;
                    $scope.outlet.PStatus = ($scope.outlet.IsDraft) ? 1 : 0;

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
                    //$scope.outlets[i].InputBy=  $scope.user.id,
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

                    if ($scope.outletCategory != 1) { // new outlet
                        var iconUrl = getMarkerIcon($scope.outlet);
                        log('change marker ' + i.toString() + ' icon: ' + iconUrl);
                        markers[i].setIcon(iconUrl);
                    }

                    log('save outlet')
                    showDlg('Saving Outlet', 'Please wait...');
                    if ($scope.outlet.IsDraft) {
                        log('save outlet to local db')
                        saveOutletDB($scope.config.tbl_outlet, $scope.outlets[i], 1, false,
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
                            saveOutletDB($scope.config.tbl_outlet, $scope.outlets[i], isUnDraft ? 1 : 2, synced,
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

        function saveOutlet(outlet, onSuccess) {
            if (outlet.modifiedImage1 || outlet.modifiedImage2 || outlet.modifiedImage3) {
                log('Save image to database before start uploading');
                insertOutletImages($scope.user.id, outlet, function (uploadItems) {
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
            if (hasNetwork) {
                var url = baseURL + '/outlet/save';
                log('Call service api: ' + url);
                //var data = JSON.stringify(outlet);
                log(outlet);
                $http({
                    method: $scope.config.http_method,
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
                userid: $scope.user.id.toString(),
            };
                  
            //var url = baseURL + '/outlet/uploadimage/' + options.fileKey + '/' + item.OutletID.toString() + '/' + (i + 1).toString();
            var url = baseURL + '/outlet/uploadimage';
            var ft = new FileTransfer();
            ft.upload(fileURL, url, 
            function (res) {
                log(res);
                log('upload file success');
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

        function moveToLocation(lat, lng) {
            log('Move current location');
            var center = new google.maps.LatLng(lat, lng);
            map.panTo(center);

            //log(marker);
            //log(marker.Latitude);
            //log(marker.Longitude);

            //if(map != null)
            //    map.setCenter(marker.position);
            //var center = new google.maps.LatLng(marker.Latitude, marker.Longitude);
            //map.panTo(center);
        }

        function getMarkerIcon(outlet) {
            if (outlet != null) {
                switch (outlet.OutletSource) {
                    case 0: //SR
                        if (outlet.AuditStatus == 2) {
                            return 'assets/img/pin-sr-error.png';
                        }
                        if (!isEmpty(outlet.CloseDate)) {
                            return 'assets/img/pin-sr-close.png';
                        }
                        if (outlet.Tracking) {
                            return 'assets/img/pin-sr-track.png';
                        }
                        return 'assets/img/pin-sr-nontrack.png';
                        break;
                    case 1: // DIS
                        if (outlet.AuditStatus == 2) {
                            return 'assets/img/pin-dis-error.png';
                        }
                        if (!isEmpty(outlet.CloseDate)) {
                            return 'assets/img/pin-dis-close.png';
                        }
                        return 'assets/img/pin-dis-open.png';
                        break;
                }
            }
            return 'assets/img/pin-cur';
        }

        function initializeMap(callback) {
            try {               
                if (hasNetwork && !isMapLoaded) {
                    isMapLoaded = true;
                    log('Create map...');
                    map = new google.maps.Map(document.getElementById('map'), {
                        zoom: $scope.config.map_zoom,
                        center: { lat: curlat, lng: curlng },
                        mapTypeId: google.maps.MapTypeId.ROADMAP,
                        mapTypeControl: false,
                        mapTypeControlOptions: {
                            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                            position: google.maps.ControlPosition.TOP_CENTER
                        },
                        streetViewControlOptions: {
                            position: google.maps.ControlPosition.RIGHT_BOTTOM
                        },
                        zoomControl: true,
                        zoomControlOptions: {
                            position: google.maps.ControlPosition.RIGHT_BOTTOM
                        },
                        scaleControl: true,
                        streetViewControl: true,
                        fullscreenControl: false,
                    });

                    google.maps.event.addListener(map, 'click', function (event) {
                        log('map clicked');                        
                        $scope.hideDropdown();
                    });

                    var idleListener = google.maps.event.addListener(map, 'idle', function (event) {
                        log('map idled');
                        google.maps.event.removeListener(idleListener);
                        callback();                        
                    });
                } else {
                    callback();
                }
            } catch (err) {
                log('Cannot initialize map');
                callback();
            }            
        }

        function setSyncStatus(callback) {
            if (hasNetwork) {
                selectUnsyncedOutlets($scope.config.tbl_outlet,
                    function (dbres) {
                        log('Number of unsynced outlets: ' + dbres.rows.length.toString());
                        $scope.showSyncButton = dbres.rows.length > 0;
                        callback();
                    }, function (dberr) {
                        $scope.showSyncButton = false;
                        log(dberr.message);
                        callback();
                    });
            } else {
                $scope.showSyncButton = false;
                callback();
            }
        }

        try {
            //Load map async...
            //jQuery(function ($) {            
            //    var script = document.createElement('script');
            //    script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyDpKidHSrPMfErXLJSts9R6pam7iUOr_W0&callback=initializeMap";
            //    document.body.appendChild(script);
            //});
            //updateViewWhenNetworkStatusChanged(hasNetwork);
            log('Refresh view to get near-by...');
            initializeMap(function () { $scope.refresh(); });
        } catch (err) {
            showError(err);
            log(err);
        }
    }]);