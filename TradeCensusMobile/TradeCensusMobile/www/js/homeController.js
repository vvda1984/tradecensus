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
            $scope.closeLeftPanel();           
            if($scope.outletCategory == 0) {
                nearByOutlets = [];
            }
            getOutlets();
            //log('query location...');
            //try {
            //    showDlg('Get outlets', "Please wait...");
            //    navigator.geolocation.getCurrentPosition(onGetLocationSuccess, onGetLocationError);
            //} catch (err) {
            //    log(err);
            //}
        }

        $scope.closeLeftPanel = function () {
            leftPanelStatus = 0
            $scope.editOutletFull = false;
            $("#outletPanel").css('width', '0%');
            //document.getElementById('outletPanel').style.width = '0%';
        }

        $scope.showLeftPanel = function () {
            log("Left panel state: " + leftPanelStatus.toString());
            if (leftPanelStatus >= 2) {
                return;
            }
            leftPanelStatus++;
            if (leftPanelStatus == 0) {
                $scope.editOutletFull = false;
                $("#outletPanel").css('width', '0%');

                //document.getElementById('outletPanel').style.width = '0%';
                //$('#expander-2').html('>');
            } else if (leftPanelStatus == 1) {
                $scope.editOutletFull = false;
                $("#outletPanel").css('width', '40%');
                //document.getElementById('outletPanel').style.width = '40%';
                //$('#expander-2').html('>');
            } else {
                $scope.editOutletFull = true;
                log('view full outlet');
                //document.getElementById('outletPanel').style.width = '100%';
                $("#outletPanel").css('width', '100%');
                //$('#expander-2').html('<');
            }
        }

        $scope.changeOutletView = function (v) {
            $scope.hideDropdown();
            if ($scope.outletCategory === v) return;
            log('change view to ' + v.toString());
            $scope.outletCategory = v;
            getOutlets();

            //switch (v) {
            //    case 0:
            //        log('view near by outlets');
            //        $scope.outletHeader = 'Near-by Outlets';
            //        //$('#outlet-panel-near').css('display', 'inherit');
            //        //$('#outlet-panel-new').css('display', 'none');
            //        //$('#outlet-panel-update').css('display', 'none');
            //        //$('#outlet-panel-audit').css('display', 'none');
            //        $scope.allowRefresh = true;
            //        loadOutlets(nearByOutlets);
            //        break;
            //    case 1:
            //        log('view new outlets');
            //        $scope.outletHeader = 'New Outlets';
            //        //$('#outlet-panel-near').css('display', 'none');
            //        //$('#outlet-panel-new').css('display', 'inherit');
            //        //$('#outlet-panel-update').css('display', 'none');
            //        //$('#outlet-panel-audit').css('display', 'none');
            //        $scope.allowRefresh = false;
            //        getOutletsFromLocal(1);
            //        break
            //    case 2:
            //        log('view updated outlets');
            //        $scope.outletHeader = 'Updated Outlets';
            //        //$('#outlet-panel-near').css('display', 'none');
            //        //$('#outlet-panel-new').css('display', 'none');
            //        //$('#outlet-panel-update').css('display', 'inherit');
            //        //$('#outlet-panel-audit').css('display', 'none');
            //        $scope.allowRefresh = false;
            //        getOutletsFromLocal(2);
            //        break;
            //    case 4:
            //        log('view auditted outlets');
            //        $scope.outletHeader = 'Auditted Outlets';
            //        //$('#outlet-panel-near').css('display', 'none');
            //        //$('#outlet-panel-new').css('display', 'none');
            //        //$('#outlet-panel-update').css('display', 'none');
            //        //$('#outlet-panel-audit').css('display', 'inherit');
            //        $scope.allowRefresh = false;
            //        getOutletsFromLocal(4);
            //        break;
            //}
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
                        navigator.geolocation.getCurrentPosition(onGetLocationSuccess, onGetLocationError);
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
            log('***set debug location...');
            curlat = 10.773598;
            curlng = 106.7058;
            //initializeMap();

            nearByOutlets = [];

            showDlg('Load near-by outlets', "Please wait...");
            if (isOnline()) {
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
                            showError(dberr.message);
                        });
                }
            }, handleHttpError);
        }

        function getOutletsFromLocal(state) {
            showDlg('Get outlets', "Please wait...");
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
                                log(outlet);

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
                                outlet.IsOpened = isEmpty(outlet.CloseDate);
                                outlet.IsTracked = outlet.Tracking == 1;                                
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
            if (map != null) {
                loadMarkers(outlets, function () {
                    setOutletsToList(outlets);
                });
            } else {
                setOutletsToList(outlets);
            }
        }

        function setOutletsToList(outlets) {
            $timeout(function () {
                $scope.outlets = outlets;
                $('.md-scroll-mask').remove();
                hideDlg();
            }, 100);
        }

        function loadMarkers(outlets, callback) {
            log("Clear existing markers");
            clearMarkers();

            log("load outlets markers");
            var bounds = new google.maps.LatLngBounds();
            for (var i = 0; i < outlets.length; i++) {
                var outlet = outlets[i];
                var position = new google.maps.LatLng(outlet.Latitude, outlet.Longitude);
                bounds.extend(position);

                var iconUrl = $scope.outletCategory == 1 ? 'assets/img/pin-new.png' : getMarkerIcon(outlet);
                var marker = new google.maps.Marker({
                    position: position,
                    title: outlet.Name,
                    icon: iconUrl,
                    map: map,
                });
                markers[i] = marker;

                var infoWindow = new google.maps.InfoWindow({
                    content: '<div class=\'view-marker\'>' + outlet.Name + '</div>',
                });
                infoWindow.open(map, marker);
                //marker.addListener('click', function () {
                //    editOutlet(markers.indexOf(marker));
                //});
            };
            map.fitBounds(bounds);
            var options = { imagePath: 'assets/img/m' };
            markerClusterer = new MarkerClusterer(map, markers, options);

            var mapeventListener = google.maps.event.addListener(map, 'bounds_changed', function (event) {
                log('map bounds_changed');
                callback();
                google.maps.event.removeListener(mapeventListener);
            });
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
            markers = [];            
            curInfoWindow = null;
        }

        function createMaker(title, latlng, iconName) {
            var iconUrl = 'assets/img/' + iconName;
            var marker = new google.maps.Marker({
                position: latlng,
                //map: map,
                title: title,
                icon: iconUrl,
            });
            marker.setMap(map);
            return marker;
        }

        function editOutlet(i) {
            log(i);
            var clonedOutlet = cloneObj($scope.outlets[i]);
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
                    if ($scope.outlet.IsTracked) $scope.outlet.Tracking = 1;
                    if ($scope.outlet.IsOpened) $scope.outlet.CloseDate = '';
                    $scope.outlet.AmendBy = $scope.user.id;

                    if ($scope.outletCategory != 1) { // new outlet
                        var iconUrl = getMarkerIcon($scope.outlet);                        
                        log('change marker ' + i.toString() + ' icon: ' + iconUrl);
                        markers[i].setIcon(iconUrl);
                    }

                    log('save outlet')
                    showDlg('Saving Outlet', 'Please wait...');
                    saveOutlet($scope.outlet, function (synced) {
                        $scope.outlets[i].AmendBy = $scope.outlet.AmendBy;
                        $scope.outlets[i].AmendDate = new Date().today() + " " + new Date().timeNow();
                        $scope.outlets[i].CloseDate = $scope.outlet.CloseDate;
                        $scope.outlets[i].Tracking = $scope.outlet.Tracking;
                        $scope.outlets[i].PState = $scope.outlet.PState;
                        $scope.outlets[i].IsOpened = $scope.outlet.IsOpened;
                        $scope.outlets[i].IsTracked = $scope.outlet.IsTracked;
                        $scope.outlets[i].PRowID = $scope.outlet.PRowID;
                        $scope.outlets[i].StringImage1 = $scope.outlet.StringImage1;
                        $scope.outlets[i].StringImage2 = $scope.outlet.StringImage2;
                        $scope.outlets[i].StringImage3 = $scope.outlet.StringImage3;

                        saveOutletDB($scope.config.tbl_outlet, $scope.outlets[i], 2, synced,
                            function () {
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
                //var data = JSON.stringify(outlet);
                log(outlet);              
                $http({
                    method: $scope.config.http_method,                   
                    data:outlet,
                    url: url,
                    headers: { 'Content-Type': 'application/json' }
                }).then(function (resp) {
                    log(resp);
                    var data = resp.data;
                    if (data.Status == -1) { // error
                        handleError(data.ErrorMessage);
                    } else {
                        log('submit outlet successfully: ' + data.RowID);
                        outlet.PRowID = data.RowID;
                        onSuccess(true);
                    }
                }, function (err) {
                    log('ERROR');
                    log(err);
                });
                //handleHttpError
            } else {
                onSuccess(false);
            }
        }

        //function saveOutlet(outlet, onSuccess) {
        //    if (isOnline()) {
        //        var url = baseURL + '/outlet/save';
        //        log('Call service api: ' + url);
        //        var settings = {
        //            "async": true,
        //            "crossDomain": true,
        //            "url": url,
        //            "method": "POST",
        //            "headers": {
        //                "content-type": "application/json",
        //                "cache-control": "no-cache",                       
        //            },
        //            "processData": false,
        //            "data": "{\"Action\":0,\"AddLine\":\"1\",\"AddLine2\":\"Đồng Khởi\",\"AmendBy\":123456,\"AmendDate\":\"2016-11-21 00:00:00\",\"AreaID\":\"HRC\",\"AuditStatus\":0,\"CloseDate\":\"\",\"CreateDate\":\"2016-06-01 00:00:00\",\"Distance\":20.56,\"District\":\"Q.1\",\"FullAddress\":\"1 Đồng Khởi Q.1 Hồ Chí Minh\",\"ID\":65000077,\"InputBy\":11693,\"IsOpened\":true,\"IsTracked\":true,\"LastContact\":\"Mr minh\",\"LastVisit\":\"\",\"Latitude\":10.773778,\"Longitude\":106.705758,\"Name\":\"MAJESTIC HOTEL\",\"Note\":\"\",\"OTypeID\":\"HO\",\"OutletEmail\":null,\"OutletSource\":0,\"OutletTypeName\":\"Hotel\",\"PRowID\":\"84d7f047-57f5-4b2d-9ca9-0b02e6a1ffde\",\"PersonID\":12595,\"Phone\":\"838295517 \",\"ProvinceID\":\"50\",\"ProvinceName\":\"Hồ Chí Minh\",\"StringImage1\":\"\",\"StringImage2\":\"\",\"StringImage3\":\"\",\"TotalVolume\":0,\"Tracking\":1,\"VBLVolume\":0,\"PLastModTS\":0,\"$$hashKey\":\"object:25\"}"
        //        }

        //        $.ajax(settings).done(function (response) {
        //            console.log('RESPONSE');
        //            console.log(response);
        //        });

        //    } else {
        //        onSuccess(false);
        //    }            
        //}

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
                if (isOnline() && !isMapLoaded) {
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
            }            
        }

        try {
            //Load map async...
            //jQuery(function ($) {            
            //    var script = document.createElement('script');
            //    script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyDpKidHSrPMfErXLJSts9R6pam7iUOr_W0&callback=initializeMap";
            //    document.body.appendChild(script);
            //});

            log('Refresh view to get near-by...');
            initializeMap(function () { $scope.refresh() });
        } catch (err) {
            log(err);
        }
    }]);