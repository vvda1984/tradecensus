/// <reference path="app.database.js" />
/// <reference path="app.global.js" />


app.controller('HomeController', ['$scope', '$http', '$mdDialog', '$mdMedia', function ($scope, $http, $mdDialog, $mdMedia) {
    //TODO:
    //  - Integate google map events
    //  - Marker Clusters

    log('Enter Home page');
    log(isOnline);
    log($scope.user.id);
    log($scope.config.province_id);

    var curIndex = 0;
    var curInfoWindow = null;
    var markers = [];
    var markerInfoWindows = [];
    var nearbyOutlets = [];

    var leftPanelStatus = 0;
    var curlat = 10.773598;
    var curlng = 106.7058;
    $scope.btnRefreshVisible = true;
    $scope.outletHeader = 'Near-by Outlets';
    $scope.outletCategory = 0; // 0: near-by; 1: new: 2: updated    

    var homeMarker = null;

    $scope.refresh = function () {
        //onGetLocationSuccess(null);
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
            document.getElementById('outletPanel').style.width = '0%';
            //$('#expander-2').html('>');
        } else if (leftPanelStatus == 1) {
            document.getElementById('outletPanel').style.width = '40%';
            //$('#expander-2').html('>');
        } else {
            document.getElementById('outletPanel').style.width = '100%';
            //$('#expander-2').html('<');
        }
    }

    $scope.changeOutletView = function (v) {
        if ($scope.outletCategory === v) return;
        log('change view to ' + v.toString());

        $scope.outletCategory = v;
        const c = 'outlet-button-active';
        switch (v) {
            case 0:
                log('view near by outlets');
                $('#btn-near-by').addClass(c);
                $('#btn-new-outlet').removeClass(c);
                $('#btn-new-update').removeClass(c);
                $scope.btnRefreshVisible = true;
                break;
            case 1:
                log('view new outlets');
                $('#btn-near-by').removeClass(c);
                $('#btn-new-outlet').addClass(c);
                $('#btn-new-update').removeClass(c);
                $scope.btnRefreshVisible = false;
                getOutlets([1, 3, 5]);
                break
            case 2:
                log("view updated outlets");                
                $('#btn-near-by').removeClass(c);
                $('#btn-new-outlet').removeClass(c);
                $('#btn-new-update').addClass(c);
                $scope.btnRefreshVisible = false;
                getOutlets([2, 3, 6]);
                break;
            case 4:
                log("view auditted outlets");
                $scope.btnRefreshVisible = false;
                getOutlets([4, 5, 6]);
                break;
        }
    }

    $scope.openOutlet = function (i) {
        viewOutlet(i);
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

        if (homeMarker == null) {
            homeMarker = createMaker('', new google.maps.LatLng(curlat, curlng), 'pin-cur.png');
        } else {
            homeMarker.setPosition(new google.maps.LatLng(curlat, curlng));
        }

        log('update position')
        moveToLocation(curlat, curlng);

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

    function getOutlets(states) {
        showDlg('Get new outlets', "Please wait...");
        try {
            selectOutlets($scope.config.tbl_outlet, states,
                function (dbrow) {
                    var rowLen = dbrow.rows.length;
                    log('Found ' + rowLen.toString() + ' outlets');
                    if (rowLen) {
                        loadOutlets(dbrow.rows);
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
            items.forEach(function (outlet, i) {
                var outlet = items[i];
                var marker = createMaker(outlet.Name, new google.maps.LatLng(outlet.Latitude, outlet.Longitude), 'pin-open-dis.png');
                markers.push(marker);

                //var infoWindow = new google.maps.InfoWindow({
                //    content: '<div class=\'view-marker\' ng-click=\'viewOutlet(' + i.toString() + ')\'>' + outlet.Name + '</div>',
                //});

                var infoWindow = new google.maps.InfoWindow({
                    content: '<div class=\'view-marker\'>' + outlet.Name + '</div>',
                });
                infoWindow.open(map, marker);
                markerInfoWindows.push(infoWindow);

                marker.addListener('click', function () {
                    viewOutlet(i);
                });

                //marker.addListener('click', function () {
                //    if (curInfoWindow != null && infoWindow != curInfoWindow) {
                //        curInfoWindow.close();
                //    }
                //    infoWindow.open(map, marker);
                //    curInfoWindow = infoWindow;
                //    //var loc = new google.maps.LatLng(marker.Latitude, marker.Longitude);
                //    //map.panTo(loc);
                //});
            });
        }
        
        $scope.outlets = items;
    }    

    function clearMarkers() {
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
        var outlet = nearbyOutlets[i];
        $scope.outlet = outlet;

        $mdDialog.show({
            scope: $scope.$new(),
            controller: function ($scope, $mdDialog) {               
            },
            templateUrl: 'outletview.html',
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            fullscreen: false,
        })
        .then(function (answer) {

        }, function () {

        });

        //$scope.$watch(function () {
        //    return $mdMedia('xs') || $mdMedia('sm');
        //}, function (wantsFullScreen) {
        //    $scope.customFullscreen = (wantsFullScreen === true);
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

//function moveToLocation(marker) {
//    if (map == null) return;
//    log('Move current location');
//    log(marker);
//    //log(marker.Latitude);
//    //log(marker.Longitude);
//    //var center = new google.maps.LatLng(curlat, curlng);
//    //map.panTo(center);
//    //if(map != null)
//    //    map.setCenter(marker.position);
//    //var center = new google.maps.LatLng(marker.Latitude, marker.Longitude);
//    //map.panTo(center);
//}