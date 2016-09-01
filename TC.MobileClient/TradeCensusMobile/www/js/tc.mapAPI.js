/// <reference path="tc.outletAPI.js" />

const START_LAT = 10.775432;//10.802202;    //10.775432;
const START_LNG = 106.705803; //106.660283;   //106.705803;
const earthR = 6378137;

//var devCurLat = 10.775432;
//var devCurLng = 106.705803;
//var devNewDetlta = 0.00001;
//var devNewLat = devCurLat + devNewDetlta;
//var devNewLng = devCurLng + devNewDetlta;

var map = null;
var markerClusterer;
var loadedMapAPI = false;
var isMapReady = false;
var markers = [];
var mapClicked = null;
var markerClicked = null;
var loadMapCallback = null;
var editOutletCallback = null;
var mapClickedCallback = null;
var mapViewChangedCallback = null;
var locationChangedCallback = null;
var homeMarker = null;
var curInfoWin = null;
var borders = [];

var curlat = START_LAT;
var curlng = START_LNG;
var curacc = 120;
var curaccCircle;
var panorama;

var gpsWatchID = -1;
var loadedMarkers = [];
var lastRefreshDate;

var isloadingGGapi = false;
function loadMapApi() {
    if (isloadingGGapi) return;
    isloadingGGapi = true;

    if (!getNetworkState()) {
        isloadingGGapi = false;
        if (loadMapCallback) {
            loadMapCallback();
            loadMapCallback = null;
        }
        return;
    }
	
	if (loadedMapAPI) {
	    initializeMap()
	    isloadingGGapi = false;
        return;
    }
    loadedMapAPI = true;

    showDlg(R.loading_map, R.please_wait);
	
	
    var url = 'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&key=' + config.map_api_key + '&callback=googleMapReadyCallback';
    log('Load map API: ' + url);
    $.getScript(url);
    isloadingGGapi = false;
}

function googleMapReadyCallback() {
    isMapReady = true;
    initializeMap();
}

function initializeMap() {
    isloadingGGapi = false;
    log('Create map instance');
    try {
        homeMarker = null;
        curaccCircle = null;
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: config.map_zoom,
            center: { lat: curlat, lng: curlng },
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            streetViewControlOptions: {
                position: google.maps.ControlPosition.RIGHT_BOTTOM
            },
            zoomControl: true,
            zoomControlOptions: {
                position: google.maps.ControlPosition.RIGHT_BOTTOM
            },
            mapTypeControl: false,
            //mapTypeControlOptions: {
            //    style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            //    position: google.maps.ControlPosition.BOTTOM_LEFT //BOTTOM_CENTER
            //},
            scaleControl: true,
            streetViewControl: true,
            fullscreenControl: false,
        });

        google.maps.event.addListener(map, 'click', function (event) {
            log('map clicked');
            if (mapClickedCallback != null)
                mapClickedCallback();
        });

        google.maps.event.addListener(map, 'bounds_changed', function (event) {
            log('map bounds_changed');
            if(mapClickedCallback)
              mapClickedCallback();
        });

        panorama = map.getStreetView();
        google.maps.event.addListener(panorama, 'visible_changed', function() {
            log('panorama visible_changed:' + panorama.getVisible().toString());
            if( mapViewChangedCallback){
                mapViewChangedCallback(panorama.getVisible());
            }         
        });

		//$.getScript('assets/libs/geoxml3/ProjectedOverlay.js');
		//$.getScript('assets/libs/geoxml3/kmz/geoxml3.js');
		//$.getScript('assets/libs/geoxml3/kmz/geoxml3_gxParse_kmz.js');
		//$.getScript('assets/libs/geoxml3/kmz/ZipFile.complete.js');
	
		//var myParser = new geoXML3.parser({map: map});
		//myParser.parse('assets/content/hcm.kml');
		
        hideDlg();
        isMapReady = true;
        if (loadMapCallback) {
            log('Map is ready');
            loadMapCallback();
            loadMapCallback = null;
        }			
    }
    catch (err) {
        hideDlg();
        isMapReady = false;
        log(err);
        if (loadMapCallback) {
            loadMapCallback();
            loadMapCallback = null;
        }
    }
}

function drawMapBorder(geodata) {
    if(!isMapReady) return;
    for (var i = 0; i < borders.length; i++) {
        borders[i].setMap(null);
    }
    borders = [];

    var zones = JSON.parse(geodata);

    for (var i = 0; i < zones.length; i++) {
        var lines = zones[i].border;
       
        var border = new google.maps.Polygon({
            paths: lines,
            strokeColor: '#FF0000',
            strokeOpacity: 0.5,
            strokeWeight: 4,    
            fillColor: '#000000',
            fillOpacity: 0.1,
        });
        border.setMap(map);
        borders.push(border);
    }
}

function changeMapTypeView(i) {
    if (i == 0) {
        map.setMapTypeId('roadmap');
    } else {
        map.setMapTypeId('satellite');
    }
}

function clearMarkers() {
    //return;
    if (markerClusterer)
        markerClusterer.clearMarkers();    
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
    // curInfoWindow = null;
}

function createMaker(outlet, position, i, isNew) {
    var iconUrl = getMarkerIcon(outlet);
    var zindexval = google.maps.Marker.MAX_ZINDEX + 1;
    if (!outlet.IsOpened || !outlet.IsTracked)
        zindexval = google.maps.Marker.MAX_ZINDEX + 2;

    var marker = new google.maps.Marker({
        position: position,
        title: outlet.Name,
        icon: iconUrl,
        zIndex: zindexval
        //map: map,
    });
    
    log('Add marker: ' + outlet.Name);
    marker.setMap(map);
    marker.isLoadedToMap = true;
    marker.outlet = outlet;

    markers[i] = marker;
    //var index = markers.indexOf(marker);
    //var index = markers.length-1;
    //var infoWindow = new google.maps.InfoWindow({
    //    content: '<div class=\'view-marker\' onclick="javascript:editOutletCallback(' + index.toString() + ')">' + outlet.Name + '</div>',
    //    closeBoxURL: '',
    //});
    //infoWindow.open(map, marker);
  
    marker.addListener('click', function () {
        var outlet = marker.outlet; //curOutlets[index];
        var infoWindow = new google.maps.InfoWindow({
            content: '<div class=\'view-marker\' onclick="javascript:editOutletCallback(' + outlet.positionIndex.toString() + ')">' + outlet.Name + '</div>',
            closeBoxURL: '',
        });
        if(curInfoWin != null)
            curInfoWin.close();
        infoWindow.open(map, marker);
        curInfoWin = infoWindow;
        if (editOutletCallback != null) {
            editSelectedOutlet(outlet.positionIndex);
        }
    });

    return marker;
}

function getMarkerIcon(outlet) {
    if (outlet != null) {
        if (outlet.AuditStatus == StatusNew ||
            outlet.AuditStatus == StatusPost ||
            outlet.AuditStatus == StatusAuditAccept ||
            outlet.AuditStatus == StatusAuditorNew ||
            outlet.AuditStatus == StatusAuditorAccept) {
            return 'assets/img/pin-new.png';
        } else if (outlet.AuditStatus == StatusAuditDeny) {
            return 'assets/img/pin-new-error.png';
        } else {
            switch (outlet.OutletSource) {
                case 0: //SR
                    if (outlet.AuditStatus == StatusAuditDeny || outlet.AuditStatus == StatusExitingDeny) {
                        return 'assets/img/pin-sr-audit-wrong.png';
                    }
                    if (outlet.AuditStatus == StatusAuditAccept || outlet.AuditStatus == StatusExitingAccept) {
                        return 'assets/img/pin-sr-audit-right.png';
                    }
                    if (!outlet.IsOpened) {
                        return 'assets/img/pin-sr-close.png';
                    }
                    if (!outlet.IsTracked) {
                        return 'assets/img/pin-sr-nontrack.png';
                    }
                    return 'assets/img/pin-sr-open.png';

                case 1: // DIS
                    if (outlet.AuditStatus == StatusAuditDeny || outlet.AuditStatus == StatusExitingDeny) {
                        return 'assets/img/pin-dis-audit-error.png';
                    }
                    if (outlet.AuditStatus == StatusAuditAccept || outlet.AuditStatus == StatusExitingAccept) {
                        return 'assets/img/pin-dis-audit-right.png';
                    }
                    //if (!outlet.IsTracked) {
                    //    return 'assets/img/pin-sr-nontrack.png';
                    //}
                    if (!outlet.IsOpened) {
                        return 'assets/img/pin-dis-close.png';
                    }
                    return 'assets/img/pin-dis-open.png';
            }
        }
    }
    return 'assets/img/pin-cur';
}

function panTo(lat, lng) {
	if(!isMapReady) return;
    log('Pan to: ' + lat.toString() + ', ' + lng.toString());
    var position = new google.maps.LatLng(lat, lng);
    map.setCenter(position);
}

function panToOutlet(lat, lng, index, outlet) {
	if(!isMapReady) return;
    panTo(lat, lng);
        
    var infoWindow = new google.maps.InfoWindow({
        content: '<div class=\'view-marker\' onclick="javascript:editOutletCallback(' + index.toString() + ')">' + outlet.Name + '</div>',
        closeBoxURL: '',
    });
    if(curInfoWin != null)
        curInfoWin.close();
    infoWindow.open(map, marker);
    curInfoWin = infoWindow;
}

function moveToCurrentLocation(){
    displayCurrentPostion();
    panTo(curlat, curlng);   
}

var lastLat;
var lastLng;
function displayCurrentPostion() {
    if (!isMapReady) return;
    if (homeMarker != null) {
        homeMarker.setPosition(new google.maps.LatLng(curlat, curlng));
    }
    else {
        var position = new google.maps.LatLng(curlat, curlng);
        homeMarker = new google.maps.Marker({
            position: position,
            icon: 'assets/img/pin-cur.png',
            map: map,
        });
        homeMarker.addListener('click', function () {
            var infoWindow = new google.maps.InfoWindow({
                content: '<div class=\'view-marker\'>' + curlat.toString() + ', ' + curlng.toString() + '</div>',
            });
            infoWindow.open(map, homeMarker);
        });
    }
    displayAccuracy(position);
}

function displayAccuracy() {
    try{
        var position = new google.maps.LatLng(curlat, curlng);
        var cradius = (curacc > 500) ? 500 : curacc;
        lastAcc = cradius;
        if (curaccCircle != null) {
            curaccCircle.radius = cradius;
            curaccCircle.setCenter(position);
        } else {
            curaccCircle = new google.maps.Circle({
                center: position,
                radius: cradius,
                map: map,
                fillColor: '#2196F3',
                fillOpacity: 0.18,
                //strokeColor: '#0000FF',
                strokeOpacity: 0,
            });
        }

        if (homeMarker != null) {
            homeMarker.setPosition(new google.maps.LatLng(curlat, curlng));
        }
        else {
            var position = new google.maps.LatLng(curlat, curlng);
            homeMarker = new google.maps.Marker({
                position: position,
                icon: 'assets/img/pin-cur.png',
                map: map,
            });
        }
    }
    catch (er) {

    }
}

function markerClick(i) {
    if (markerClicked != null)
        markerClicked(i);
}

var isLoadingMarker = false;
function loadMarkers(isNew, outlets, callback) {
    if (!isMapReady) { callback(); return; }
    if (isLoadingMarker) return;
    isLoadingMarker = true;
    try {
        log('Clear markers');
        clearMarkers();

        for (var i = 0; i < outlets.length; i++) {
            var outlet = outlets[i];
            if (!outlet.hasMarker) {
                var position = new google.maps.LatLng(outlet.Latitude, outlet.Longitude);
                //bounds.extend(position);
                createMaker(outlet, position, i, isNew);
                //keepMarkerCount++;
            }
        };
        var options = {
            gridSize: config.cluster_size,
            maxZoom: config.cluster_max_zoom,
            imagePath: 'assets/img/m'
        };
        markerClusterer = new MarkerClusterer(map, markers, options);  
        callback();


        //var removedMarkers = [];
        //var removedMarkerCount = 0;
        //var keepMarkers = [];
        //var keepMarkerCount = 0;
        //for (var m = 0; m < markers.length; m++) {
        //    var found = false;
        //    var mk = markers[m];
        //    if (mk == null) continue;
        //    for (var o = 0; o < outlets.length; o++) {
        //        if (outlets[o].ID == mk.outlet.ID) {
        //            found = true;
        //            outlets[o].hasMarker = true;
        //            mk.outlet = outlets[o];
        //            break;
        //        }
        //    }

        //    if (!found) {
        //        removedMarkers[removedMarkerCount] = mk;
        //        removedMarkerCount++;
        //    } else {
        //        keepMarkers[keepMarkerCount] = mk;
        //        keepMarkerCount++;
        //    }
        //}

        //if (removedMarkers.length > 0 && markerClusterer)
        //    markerClusterer.clearMarkers();

        //for (var i = 0; i < removedMarkers.length; i++) {
        //    removedMarkers[i].setMap(null);
        //}
        //markers = keepMarkers;

        //for (var i = 0; i < outlets.length; i++) {
        //    var outlet = outlets[i];
        //    if (!outlet.hasMarker) {
        //        var position = new google.maps.LatLng(outlet.Latitude, outlet.Longitude);
        //        //bounds.extend(position);
        //        createMaker(outlet, position, keepMarkerCount, isNew);
        //        keepMarkerCount++;
        //    }
        //};

        //var options = {
        //    gridSize: config.cluster_size,
        //    maxZoom: config.cluster_max_zoom,
        //    imagePath: 'assets/img/m'
        //};
        //markerClusterer = new MarkerClusterer(map, markers, options);
        //callback();
    } catch (er) {

    }
    isLoadingMarker = false;
}

function editSelectedOutlet(i) {
    if (editOutletCallback) {       
        editOutletCallback(i);
    }
}

function getCurPosition(moveToCur, onSuccess, onError) {
    log('Get current location...');
    try {       
        navigator.geolocation.getCurrentPosition(function (position) {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;   
            curacc = position.coords.accuracy;         
            log('Accuracy:'+ curacc.toString());

            // AnVO: DEBUG
            if (config.enable_devmode) {
                log('***set debug location...');
                lat = devLat;
                lng = devLng;
            }
            curlat = lat;
            curlng = lng;
            if(isMapReady && moveToCur)
            {
                log('Move to current location');
                moveToCurrentLocation();
            }
            log('Found location: lat=' + lat.toString() + ',lng=' + lng.toString());
            onSuccess(lat, lng);
        },
        function (err) {
            if (config.enable_devmode) {
                // AnVO: DEBUG
                log('***set debug location...');
                lat = devLat;
                lng = devLng;

                curlat = lat;
                curlng = lng;
                if (isMapReady && moveToCur) {
                    log('Move to current location');
                    moveToCurrentLocation();
                }
                onSuccess(lat, lng);
            }
            else
                onError(err);
        },
        { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
    } catch (err) {
        log(err);
        onError(err.message);
    }
}

function startPositionWatching(){
    //if (config.enable_devmode) return;    
    if(gpsWatchID == -1){
        gpsWatchID = navigator.geolocation.watchPosition(
            function (position) {
                var foundLat = position.coords.latitude;
                var foundLng = position.coords.longitude;
                var foundAcc = position.coords.accuracy;

                if (config.enable_devmode) {
                    foundLat = devLat;
                    foundLng = devLng;
                }

                if(locationChangedCallback)
                    locationChangedCallback(foundLat, foundLng, foundAcc);
            }, 
            function(error){
                log('GPS watching error code: ' + error.code  + '\n message: ' + error.message + '\n');
            }, { 
                enableHighAccuracy: true,
                maximumAge: 30000,
                timeout: 27000,
            });
    }
}

function stopPositionWatching(){
    if(gpsWatchID != -1){
        try{
            navigator.geolocation.clearWatch(gpsWatchID);
        } catch(err){
            log('Stop GPS watching error: ' + err.message);
        }
    }
}

function calcRetangleBoundary(dlat, dlng, p) {
    var np = {
        Lat: p.Lat + (dlat / earthR) * (180 / Math.PI),
        Lng: p.Lng + (dlng / earthR) * (180 / Math.PI) / Math.cos(p.Lat * Math.PI / 180)
    };
    return np;
}

function calcDistance(saleLoc, outletLoc) {
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