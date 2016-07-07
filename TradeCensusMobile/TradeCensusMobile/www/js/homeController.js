/// <reference path="app.database.js" />
/// <reference path="app.global.js" />
/// <reference path="../assets/libs/markerclusterer.js" />

app.controller('HomeController', ['$scope', '$http', '$mdDialog', '$mdMedia', '$timeout',
    function ($scope, $http, $mdDialog, $mdMedia, $timeout) {
        log('Enter Home page');
        log($scope.user.id);
        log($scope.config.province_id);

        var curIndex = 0;
        var curInfoWindow = null;
        var markers = [];
        var markerInfoWindows = [];
        var markerClusterer;

        var leftPanelStatus = 0;
        var curlat = 10.773598;
        var curlng = 106.7058;
        var isMapLoaded = false;

        $scope.editOutletFull = false;
        $scope.allowRefresh = true;
        $scope.hasAuditRole = $scope.user.hasAuditRole;
        $scope.outletHeader = 'Near-by Outlets';
        $scope.outletCategory = 0; // 0: near-by; 1: new: 2: updated 4: audit
        //$scope.nearByOutlets = [];
        //$scope.newOutlets = [];
        //$scope.updatedOutlets = [];
        //$scope.auditOutlets = [];
        var nearByOutlets = [];
        $scope.outlets = [];

        var homeMarker = null;

        $scope.outletTypes = outletTypes;

        $scope.provinces = provinces;

        $scope.outlets = [];

        $scope.refresh = function () {
            //onGetLocationSuccess(null);
            $scope.closeLeftPanel();
            log('query location...');
            try {
                showDlg('Get near-by outlets', "Please wait...");
                navigator.geolocation.getCurrentPosition(onGetLocationSuccess, onGetLocationError);
            } catch (err) {
                log(err);
            }
        }

        $scope.closeLeftPanel = function () {
            leftPanelStatus = 0
            $scope.editOutletFull = false;
            document.getElementById('outletPanel').style.width = '0%';
        }

        $scope.showLeftPanel = function () {
            if (leftPanelStatus >= 2) return;
            leftPanelStatus++;

            log("show left panel: " + leftPanelStatus.toString());
            if (leftPanelStatus == 0) {
                $scope.editOutletFull = false;
                document.getElementById('outletPanel').style.width = '0%';
                //$('#expander-2').html('>');
            } else if (leftPanelStatus == 1) {
                $scope.editOutletFull = false;
                document.getElementById('outletPanel').style.width = '40%';
                //$('#expander-2').html('>');
            } else {
                $scope.editOutletFull = true;
                log('view full outlet');
                document.getElementById('outletPanel').style.width = '100%';
                //$('#expander-2').html('<');
            }
        }

        $scope.changeOutletView = function (v) {
            $scope.hideDropdown();
            if ($scope.outletCategory === v) return;
            log('change view to ' + v.toString());

            //if (isOnline()) {            
            //    $scope.closeLeftPanel();
            //}

            $scope.outletCategory = v;
            const c = 'outlet-button-active';
            switch (v) {
                case 0:
                    log('view near by outlets');
                    $scope.outletHeader = 'Near-by Outlets';
                    //$('#outlet-panel-near').css('display', 'inherit');
                    //$('#outlet-panel-new').css('display', 'none');
                    //$('#outlet-panel-update').css('display', 'none');
                    //$('#outlet-panel-audit').css('display', 'none');
                    $scope.allowRefresh = true;
                    loadOutlets(nearByOutlets);
                    break;
                case 1:
                    log('view new outlets');
                    $scope.outletHeader = 'New Outlets';
                    //$('#outlet-panel-near').css('display', 'none');
                    //$('#outlet-panel-new').css('display', 'inherit');
                    //$('#outlet-panel-update').css('display', 'none');
                    //$('#outlet-panel-audit').css('display', 'none');

                    $scope.allowRefresh = false;
                    getOutlets(1);
                    break
                case 2:
                    log('view updated outlets');
                    $scope.outletHeader = 'Updated Outlets';
                    //$('#outlet-panel-near').css('display', 'none');
                    //$('#outlet-panel-new').css('display', 'none');
                    //$('#outlet-panel-update').css('display', 'inherit');
                    //$('#outlet-panel-audit').css('display', 'none');
                    $scope.allowRefresh = false;
                    getOutlets(2);
                    break;
                case 4:
                    log('view auditted outlets');
                    $scope.outletHeader = 'Auditted Outlets';
                    //$('#outlet-panel-near').css('display', 'none');
                    //$('#outlet-panel-new').css('display', 'none');
                    //$('#outlet-panel-update').css('display', 'none');
                    //$('#outlet-panel-audit').css('display', 'inherit');
                    $scope.allowRefresh = false;
                    getOutlets(4);
                    break;
            }
        }

        $scope.showDropdown = function () {
            $("#outlet-dropdown").css('display', 'block');
        }

        $scope.openOutlet = function (i) {
            editOutlet(i);
        }

        $scope.createNewOutlet = function () {
            showDlg('Get current location', "Please wait...");

            try {
                navigator.geolocation.getCurrentPosition(function (position) {
                    var lat = Math.round(position.coords.latitude * 1000000) / 1000000;
                    var lng = Math.round(position.coords.longitude * 1000000) / 1000000;

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
                        controller: newOutletController,
                        templateUrl: 'views/outletCreate.html',
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

        $scope.hideDropdown = function () {
            $("#outlet-dropdown").css('display', 'none');
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

        function initializeMap() {
            try {
                log('Check map...');
                if (!isMapLoaded) {
                    isMapLoaded = true;
                    log('Initialize map...');
                    if (!isOnline()) {
                        log('App is offline...');
                        return;
                    }
                    log('Load map...');
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

            log('***set debug location...');
            curlat = 10.773598;
            curlng = 106.7058;
            initializeMap();

            nearByOutlets = [];

            if (isOnline()) {
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
            $scope.closeLeftPanel();
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
                                outlet.Distance = 0;
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
                    var markerImage = $scope.outletCategory == 1 ? 'pin-new.png' : getMarkerImageName(outlet);
                    var marker = createMaker(outlet.Name, new google.maps.LatLng(outlet.Latitude, outlet.Longitude), markerImage);
                    markers.push(marker);

                    var infoWindow = new google.maps.InfoWindow({
                        content: '<div class=\'view-marker\'>' + outlet.Name + '</div>',
                    });
                    infoWindow.open(map, marker);
                    markerInfoWindows.push(infoWindow);

                    marker.addListener('click', function () {
                        editOutlet(markers.indexOf(marker));
                    });
                };

                var options = {
                    imagePath: 'assets/img/m'
                };
                markerClusterer = new MarkerClusterer(map, markers, options);
            }

            $timeout(function () {
                $scope.outlets = items;
                //switch ($scope.outletCategory) {
                //    case 0:
                //        $scope.nearByOutlets = items;
                //        break;
                //    case 1:
                //        $scope.newOutlets = items;
                //        break
                //    case 2:
                //        $scope.updatedOutlets = items;
                //        break;
                //    case 4:
                //        $scope.auditOutlets = items;
                //        break;
                //}
            });

            //$scope.outlets = items;
            //loadOutletsToListView(items);
            try {
                //$scope.$apply();
            } catch (err) {
                log(err);
            }

            log('create home marker');
            if (isOnline())
                homeMarker = createMaker('', new google.maps.LatLng(curlat, curlng), 'pin-cur.png');
            else {
                leftPanelStatus = 1;
                $scope.showLeftPanel();
            }
        }

        function loadOutletsToListView(items) {
            $("#outletlist").empty();
            for (var i = 0; i < items.length; i++) {
                var outlet = items[i];
                var html =
                '<div class="outlet-list-item-header" ng-click="openOutlet(' + i.toString() + ')">' + outlet.Name + '</div>' +
                   '<table>' +
                        '<tr>' +
                            '<td><div class="title">Address:</div></td>' +
                            '<td colspan="5"><div class="content1">' + outlet.FullAddress + '</div></td>' +
                            '<td ng-show="editOutletFull"><div class="title1">Outlet type:</div></td>' +
                            '<td ng-show="editOutletFull"><div class="content2">' + outlet.OutletTypeName + '</div></td>' +
                        '</tr>' +
                        '<tr ng-show="editOutletFull">' +
                            '<td><div class="title">Distance:</div></td>' +
                            '<td><div class="content2">' + outlet.Distance + '</div></td>' +
                            '<td><div class="title">SR/DSM:</div></td>' +
                            '<td><div class="content2">' + outlet.Name + '</div></td>' +
                            '<td><div class="title">Tel:</div></td>' +
                            '<td><div>' + outlet.Phone + '</div></td>' +
                            '<td><div class="title1">Last contact:</div></td>' +
                            '<td><div class="content2">' + outlet.LastContact + '</div></td>' +
                        '</tr>' +
                    '</table>' +
                '</div>';
                $("#outletlist").append(html);
            };
        }

        function clearMarkers() {
            if (markerClusterer)
                markerClusterer.clearMarkers();
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
                content: '<a onclick="editOutlet(' + i.toString() + ')">' + title + '</a>',
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

        function editOutlet(i) {
            log(i);
            var outlet = $scope.outlets[i];
            //switch ($scope.outletCategory) {
            //    case 0:
            //        outlet = $scope.nearByOutlets[i];
            //        break;
            //    case 1:
            //        outlet = $scope.newOutlets[i];
            //        break
            //    case 2:
            //        outlet = $scope.updatedOutlets[i];
            //        break;
            //    case 4:
            //        outlet = $scope.auditOutlets[i];
            //        break;
            //}

            var clonedOutlet = cloneObj(outlet);
            $scope.outlet = clonedOutlet;

            $mdDialog.show({
                scope: $scope.$new(),
                controller: editOutletController,
                templateUrl: 'views/outletEdit.html',
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
                    
                    if ($scope.outletCategory != 1) { // new outlet
                        var markerImage = getMarkerImageName($scope.outlet);
                        if (!isEmpty(markerImage)) {
                            var iconUrl = 'assets/img/' + markerImage;
                            log('change marker ' + i.toString() + ' icon: ' + iconUrl);
                            markers[i].setIcon(iconUrl);
                        }
                    }

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
            if (isOnline()) {
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

        function getMarkerImageName(outlet) {
            switch (outlet.OutletSource) {
                case 0: //SR
                    if (outlet.AuditStatus == 2) {
                        return 'pin-sr-error.png';
                    } 
                    if (!isEmpty(outlet.CloseDate)) {
                        return 'pin-sr-close.png';
                    } 
                    if (outlet.Tracking) {
                        return 'pin-sr-track.png';
                    }
                    return 'pin-sr-nontrack.png';
                    break;
                case 1: // DIS
                    if (outlet.AuditStatus == 2) {
                        return 'pin-dis-error.png';
                    } 
                    if (!isEmpty(outlet.CloseDate)) {
                        return 'pin-dis-close.png';
                    } 
                    return 'pin-dis-open.png';
                    break;
            }
            return '';                          
        }

        try {
            log('Refresh view to get near-by...');
            //initializeMap();
            $scope.refresh();
        } catch (err) {
            log(err);
        }
    }]);
