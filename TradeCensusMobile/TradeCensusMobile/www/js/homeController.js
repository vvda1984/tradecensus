/// <reference path="app.database.js" />
/// <reference path="app.global.js" />


app.controller('HomeController', ['$scope', '$http', '$mdDialog', '$mdMedia', function ($scope, $http, $mdDialog, $mdMedia) {
    //TODO:
    //  - Integate google map events    
    isOnline = checkConnection();

    log('Enter Home page');
    log(isOnline);
    log($scope.user.id);
    log($scope.config.province_id);

    var curIndex = 0;
    var curInfoWindow = null;
    var markers = [];
    var markerInfoWindows = [];
    var nearbyOutlets = [];
    var markerCluster;

    var leftPanelStatus = 0;
    var curlat = 10.773598;
    var curlng = 106.7058;
    $scope.showFullOutlet = false;
    $scope.btnRefreshVisible = true;
    $scope.hasAuditRole = $scope.user.hasAuditRole;
    $scope.outletHeader = 'Near-by Outlets';
    $scope.outletCategory = 0; // 0: near-by; 1: new: 2: updated       

    var homeMarker = null;

    $scope.outletTypes = outletTypes;
    log($scope.outletTypes);

    $scope.provinces = provinces;
    $scope.outlets = [];
    $scope.refresh = function () {
        //onGetLocationSuccess(null);
        leftPanelStatus = 2;
        $scope.viewLeftPanel();
        loadMap();
        log('query location...');
        try {
            showDlg('Get near-by outlets', "Please wait...");
            navigator.geolocation.getCurrentPosition(onGetLocationSuccess, onGetLocationError);
        } catch (err) {
            log(err);
        }
    }

    $scope.viewLeftPanel = function () {
        if (leftPanelStatus >= 2) leftPanelStatus = 0;
        else
            leftPanelStatus++;

        log("show left panel: " + leftPanelStatus.toString());
        if (leftPanelStatus == 0) {
            $scope.showFullOutlet = false;
            document.getElementById('outletPanel').style.width = '0%';
            //$('#expander-2').html('>');
        } else if (leftPanelStatus == 1) {
            $scope.showFullOutlet = false;
            document.getElementById('outletPanel').style.width = '40%';
            //$('#expander-2').html('>');
        } else {
            $scope.showFullOutlet = true;
            document.getElementById('outletPanel').style.width = '100%';
            //$('#expander-2').html('<');
        }
    }

    $scope.changeOutletView = function (v) {
        if ($scope.outletCategory === v) return;
        log('change view to ' + v.toString());

        if (isOnline) {
            leftPanelStatus = 2;
            $scope.viewLeftPanel();
        }
        $scope.outletCategory = v;
        const c = 'outlet-button-active';
        switch (v) {
            case 0:
                log('view near by outlets');
                $scope.outletHeader = 'Near-by Outlets';
                $('#btn-near-by').addClass(c);
                $('#btn-new-outlet').removeClass(c);
                $('#btn-mod-outlet').removeClass(c);
                $('#btn-aud-outlet').removeClass(c);
                $scope.btnRefreshVisible = true;
                loadOutlets(nearbyOutlets);
                break;
            case 1:
                log('view new outlets');
                $scope.outletHeader = 'New Outlets';
                $('#btn-near-by').removeClass(c);
                $('#btn-new-outlet').addClass(c);
                $('#btn-mod-outlet').removeClass(c);
                $('#btn-aud-outlet').removeClass(c);
                
                $scope.btnRefreshVisible = false;
                getOutlets(1);
                break
            case 2:
                log("view updated outlets");
                $scope.outletHeader = 'Updated Outlets';
                $('#btn-near-by').removeClass(c);
                $('#btn-new-outlet').removeClass(c);
                $('#btn-mod-outlet').addClass(c);
                $('#btn-aud-outlet').removeClass(c);
                $scope.btnRefreshVisible = false;
                getOutlets(2);
                break;
            case 4:
                log("view auditted outlets");
                $scope.outletHeader = 'Auditted Outlets';
                $('#btn-near-by').removeClass(c);
                $('#btn-new-outlet').removeClass(c);
                $('#btn-mod-outlet').removeClass(c);
                $('#btn-aud-outlet').addClass(c);
                $scope.btnRefreshVisible = false;
                getOutlets(4);
                break;
        }
    }

    $scope.openOutlet = function (i) {
        viewOutlet(i);
    }

    $scope.createNewOutlet = function () {
        showDlg('Get current location', "Please wait...");

        try {
            navigator.geolocation.getCurrentPosition(function (position) {
                var lat = position.coords.latitude;
                var lng = position.coords.longitude;

                moveToLocation(lat, lng);
                log($scope.outletTypes);
                $scope.outlet = {
                    Action: 0,
                    AddLine: "",
                    AddLine2: "",
                    AmendBy: 11693,
                    AmendDate: "",
                    AreaID: $scope.user.areaID,
                    AuditStatus: 0,
                    CloseDate: "",
                    CreateDate: "",
                    Distance: 0,
                    District: "",
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
                    OTypeID: $scope.outletTypes[0].id,
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
                    VBLVolume: 0
                };
                hideDlg();
                $mdDialog.show({
                    scope: $scope.$new(),
                    controller: function ($scope, $mdDialog) {
                        $scope.saveUpdate = function () {
                            $mdDialog.hide(true);
                        };

                        $scope.cancelUpdate = function () {
                            $mdDialog.cancel();
                        };
                    },
                    templateUrl: 'outletnew.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: false,
                    fullscreen: false,
                })
                .then(function (r) {
                    if (r) {
                        log('save outlet')
                        showDlg('Saving Outlet', 'Please wait...');
                        saveOutlet($scope.outlet, function (synced) {
                            addOutletDB($scope.config.tbl_outlet, $scope.outlet, synced, function () {
                                hideDlg();
                            }, function (dberr) {
                                hideDlg();
                                showError(dberr.message);
                            });
                        });
                    }
                }, function () {
                });
            }, onGetLocationError);
        } catch (err) {
            log(err);
        }
    }

    function loadOutletTypes(onSuccess, onError) {
        if ($scope.outletTypes != null) {
            onSuccess();
        } else {
            $scope.outletTypes = [];
            selectOutletTypes(function (tx, dbrow) {                  
                var rowLen = dbrow.rows.length;
                log('found ' + rowLen.toString() + ' outlet types');
                if (rowLen) {
                    for (i = 0; i < rowLen; i++) {
                        $scope.outletTypes[i] = {
                            id: dbrow.rows.item(i).ID,
                            name: dbrow.rows.item(i).Name,
                        }
                    }
                }

                onSuccess();
            }, onError);
        }
    }

    function loadMap() {
        try {
            log('Check map...');
            if (map == null) {
                log('Initialize map...');
                isOnline = checkConnection();
                if (!isOnline) {
                    log('App is offline...');
                    return;
                }
                log('Load map...');
                map = new google.maps.Map(document.getElementById('map'), {
                    zoom: $scope.config.map_zoom,
                    center: new google.maps.LatLng(curlat, curlng),
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
            }
        } catch (err) {
            log('Cannot initialize map');
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

        curlat = 10.773598;
        curlng = 106.7058;

        log('reset near by outlets');
        nearbyOutlets = [];
        
        //log('update position')
        //moveToLocation(curlat, curlng);

        if (isOnline) {
            getNearByOutletsOnline();
        } else {
            getNearByOutletsOffline();
        }
    };

    function onGetLocationError(error) {
        hideDlg();
        showDlg('Error', 'Cannot get current location!', true);
        getNearByOutletsOffline();
    }

    function getNearByOutletsOffline() {
        // hide panel
        leftPanelStatus = 2;
        $scope.viewLeftPanel();
        meter = $scope.config.distance;
        count = $scope.config.item_count;
        var saleLoc =  { Lat : curlat, Lng : curlng };
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
                    nearbyOutlets = [];
                    var found = 0;
                    for (i = 0; i < rowLen; i++) {
                        var outlet = dbres.rows.item(i);

                        var distance = 1000000;
                        if ($scope.config.calc_distance_algorithm == "circle")
                            distance = calcDistanceCircle(saleLoc, { Lat : outlet.Latitude, Lng : outlet.Longitude }, meter);
                        log('Distance to Outlet ' + outlet.ID.toString() + ': ' + distance.toString());

                        if (distance <= meter) {
                            log('Add outlet ' + outlet.ID.toString() + ' to list');
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

                            outlet.FullAddress = outlet.AddLine + ' ' + outlet.AddLine2 + ' ' + outlet.District + ' ' + provinceName;
                            outlet.OutletTypeName = outletTypeName;
                            nearbyOutlets[found] = outlet;
                            found++;
                        }

                        if (found >= count) break;
                    }
                    log('Display ' + nearbyOutlets.length.toString() + ' outlets');
                    log(nearbyOutlets);
                    loadOutlets(nearbyOutlets);
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
            Lat : p.Lat + (dlat / earthR) * (180 / Math.PI),
            Lng : p.Lng + (dlng / earthR) * (180 / Math.PI) / Math.cos(p.Lat * Math.PI / 180)
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
        return d;
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
                nearbyOutlets = data.Items;
                nearbyOutlets.sort(function (a, b) { return a.Distance - b.Distance });
                insertOutlets($scope.user.id,
                    $scope.config.tbl_outlet,
                    nearbyOutlets,
                    function () {
                        loadOutlets(nearbyOutlets);
                    },
                    function (dberr) {
                        hideDlg();
                        log(dberr.message);
                        showDlg('Error', dberr.message);
                    });
            }
        }, handleHttpError);
    }

    function getOutlets(state) {
        showDlg('Get new outlets', "Please wait...");
        try {
            selectOutlets($scope.config.tbl_outlet, state,
                function (dbres) {
                    hideDlg();
                    var rowLen = dbres.rows.length;                    
                    log('Found ' + rowLen.toString() + ' outlets');
                    if (rowLen) {
                        var foundOutlets = [];
                        for (i = 0; i < rowLen; i++) {
                            var outlet = dbres.rows.item(i);

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

                            outlet.FullAddress = outlet.AddLine + ' ' + outlet.AddLine2 + ' ' + outlet.District + ' ' + provinceName;
                            outlet.OutletTypeName = outletTypeName;
                            foundOutlets[i] = outlet;
                        }
                        loadOutlets(foundOutlets);
                    } else {
                        loadOutlets([]);
                    }
                }, function (dberr) {
                    hideDlg();
                    showError('Error', dberr.message);
                });         
        } catch (err) {
            log(err);
            hideDlg();
            showError('Error', err.message);
        }
    }

    function loadOutlets(items) {       
        curIndex = 0;        
        
        if (map != null) {            
            clearMarkers();
            log("load outlets to map");
            for (var i = 0; i < items.length; i++) {
                var outlet = items[i];
                var marker = createMaker(outlet.Name, new google.maps.LatLng(outlet.Latitude, outlet.Longitude), 'pin-open-dis.png');
                markers.push(marker);

                var infoWindow = new google.maps.InfoWindow({
                    content: '<div class=\'view-marker\'>' + outlet.Name + '</div>',
                });
                infoWindow.open(map, marker);
                markerInfoWindows.push(infoWindow);

                marker.addListener('click', function () {
                    viewOutlet(markers.indexOf(marker));
                });
            };

            var options = {
                imagePath: 'assets/img/m'
            };
            markerCluster = new MarkerClusterer(map, markers, options);
        }
                
        $scope.outlets = items;
        try{
            $scope.$apply();
        }catch(err){
            log(err);
        }

        log('create home marker');
        if (isOnline)
            homeMarker = createMaker('', new google.maps.LatLng(curlat, curlng), 'pin-cur.png');
        else {         
            leftPanelStatus = 1;
            $scope.viewLeftPanel();
        }
    }    

    function clearMarkers() {
        if (homeMarker != null) homeMarker.setMap(null);
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
        markers.length = 0;
        markerInfoWindows.length = 0;
        curInfoWindow = null;
    }

    function createMaker(title, latlng, iconName) {
        var iconUrl = 'assets/img/' + iconName;
        return marker = new google.maps.Marker({
            position: latlng,
            map: map,
            title: title,
            icon: iconUrl,
        });
    }

    function createOutletMaker(i, title, latlng, iconName) {
        var infowindow = new google.maps.InfoWindow({
            content: '<a onclick="viewOutlet(' + i.toString() + ')">' + title + '</a>',
        });

        var iconUrl = 'assets/img/' + iconName;
        var marker = new google.maps.Marker({
            position: latlng,
            map: map,
            title: title,
            icon: iconUrl,
        });
        marker.addListener('click', function () {
            if (curInfowindow != null && curInfowindow != infowindow) {
                curInfowindow.close();
            }
            infowindow.open(map, marker);
            curInfowindow = infowindow;
        });
        return marker;
    }

    function viewOutlet(i) {
        log(i);
        //moveToLocation(nearbyOutlets[i]);     
        var outlet = $scope.outlets[i];       
        var clonedOutlet = cloneObj(outlet);
        $scope.outlet = clonedOutlet;

        $mdDialog.show({
            scope: $scope.$new(),
            controller: function ($scope, $mdDialog) {
                $scope.openedOptionVisible = !$scope.outlet.IsOpened;
                $scope.trackedOptionVisible = !$scope.outlet.IsTracked;
                $scope.saveUpdate = function () {
                    $mdDialog.hide(true);
                };

                $scope.cancelUpdate = function () {
                    $mdDialog.cancel();
                };
            },
            templateUrl: 'outletview.html',
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            fullscreen: false,
        })
        .then(function (answer) {
            if (answer) {
                if ($scope.outlet.IsTracked)
                    $scope.outlet.Tracking = 1;

                if ($scope.outlet.IsOpened)
                    $scope.outlet.CloseDate = '';

                $scope.outlet.AmendBy = $scope.user.id;

                log('save outlet')
                showDlg('Saving Outlet', 'Please wait...');
                saveOutlet($scope.outlet, function (synced) {
                    outlet.AmendBy = $scope.outlet.AmendBy;
                    outlet.CloseDate = $scope.outlet.CloseDate;
                    outlet.Tracking = $scope.outlet.Tracking;
                    outlet.PState = $scope.outlet.PState;
                    outlet.IsOpened = $scope.outlet.IsOpened;
                    outlet.IsTracked = $scope.outlet.IsTracked;
                    outlet.PRowID = $scope.outlet.PRowID;
                    outlet.StringImage1 = $scope.outlet.StringImage1;
                    outlet.StringImage2 = $scope.outlet.StringImage2;
                    outlet.StringImage3 = $scope.outlet.StringImage3;

                    saveOutletDB($scope.config.tbl_outlet, outlet, 2, synced, function () {
                        hideDlg();
                    }, function (dberr) {
                        hideDlg();
                        showError(dberr.message);
                    });
                });
            }
        }, function () {
        });
    }

    function saveOutlet(outlet, onSuccess) {
        isOnline = checkConnection();
        if (isOnline) {
            var url = baseURL + '/outlet/save';
            log('Call service api: ' + url);
            var data = JSON.stringify(outlet);
            log(data);

            if (outlet.PRowID == null)
                outlet.PRowID = guid();
            onSuccess(true);

            //$http({
            //    method: $scope.config.http_method,
            //    data: JSON.stringify(outlet),
            //    url: url,
            //    headers: { 'Content-Type': 'application/json' }
            //}).then(function (resp) {
            //    log(resp);
            //    var data = resp.data;                
            //    if (data.Status == -1) { // error
            //        handleError(data.ErrorMessage);
            //    } else {
            //        log('submit outlet successfully: ' + data.RowID);
            //        outlet.PRowID = data.RowID;
            //        onSuccess(true);
            //    }
            //}, handleHttpError);
        } else {
            onSuccess(false);            
        }


        //outlet.PState |= 2;
        //outlet.AmendBy = $scope.user.id;

        //saveOutletDB($scope.config.tbl_outlet, outlet, 2, function () {

        //}, function (dberr) {

        //});
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

    try {
        log('Refresh view to get near-by...');
        $scope.refresh();
    } catch (err) {
        log(err);
    }
}]);
