﻿var devCurLat = 10.775432;
var devCurLng = 106.705803;
var devNewDetlta = 0.00001;
var devNewLat = devCurLat + devNewDetlta;
var devNewLng = devCurLng + devNewDetlta;

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
var homeMarker = null;
var curInfoWin = null;
const earthR = 6378137;
var curlat = 10.775432;
var curlng = 106.705803;
var curacc = 120;
var curaccCircle;
var panorama;
var locationChangedCallback = null;
var gpsWatchID = -1;

function loadMapApi() { 
    if (!networkReady()) {
		initializeMap()
        return;
    }
	
	if (loadedMapAPI) {
        initializeMap()
        return;
    }
    loadedMapAPI = true;


    var url = 'https://maps.googleapis.com/maps/api/js?=v=3.exp&sensor=false&key=' + config.map_api_key + '&callback=initializeMap';
    log('Load map API: ' + url);
    $.getScript(url);
}

function initializeMap() {
	/*
    if (isMapReady) {
        if (loadMapCallback) {
            loadMapCallback();
            loadMapCallback = null;
        }
        return;
    }
	*/
    isMapReady = true;	

    log('Create map instance');
    try {
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: config.map_zoom,
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

        isMapReady = true;
        if (loadMapCallback) {
            log('Map is ready');
            loadMapCallback();
            loadMapCallback = null;
        }			
    }
    catch (err) {
        isMapReady = false;
        log(err);
        if (loadMapCallback) {
            loadMapCallback();
            loadMapCallback = null;
        }
    }
}

function drawMarkers() {

}

function clearMarkers() {
    if (markerClusterer)
        markerClusterer.clearMarkers();    
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
    // curInfoWindow = null;
}

function createMaker(outlet, position, i, isNew, bounds) {
    var iconUrl = isNew ? 'assets/img/pin-new.png' : getMarkerIcon(outlet);
    var marker = new google.maps.Marker({
        position: position,
        title: outlet.Name,
        icon: iconUrl,
        //map: map,
    });
    
    log('Add marker: ' + outlet.Name);
    marker.setMap(map);
    marker.isLoadedToMap = true;

    markers[i] = marker;
    //var index = markers.indexOf(marker);
    //var index = markers.length-1;
    //var infoWindow = new google.maps.InfoWindow({
    //    content: '<div class=\'view-marker\' onclick="javascript:editOutletCallback(' + index.toString() + ')">' + outlet.Name + '</div>',
    //    closeBoxURL: '',
    //});
    //infoWindow.open(map, marker);
  
    marker.addListener('click', function () {
        //editSelectedOutlet(markers.indexOf(marker));
        var index = markers.indexOf(marker);
        var outlet = curOutlets[index];
        var infoWindow = new google.maps.InfoWindow({
            content: '<div class=\'view-marker\' onclick="javascript:editOutletCallback(' + index.toString() + ')">' + outlet.Name + '</div>',
            closeBoxURL: '',
        });
        if(curInfoWin != null)
            curInfoWin.close();
        infoWindow.open(map, marker);
        curInfoWin = infoWindow;
    });

    return marker;
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
            case 1: // DIS
                if (outlet.AuditStatus == 2) {
                    return 'assets/img/pin-dis-error.png';
                }
                if (!isEmpty(outlet.CloseDate)) {
                    return 'assets/img/pin-dis-close.png';
                }
                return 'assets/img/pin-dis-open.png';                
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

function displayCurrentPostion(){
    if (homeMarker != null) homeMarker.setMap(null);
    var position = new google.maps.LatLng(curlat, curlng);
    homeMarker = new google.maps.Marker({
        position: position,
        icon: 'assets/img/pin-cur.png',
        map: map,
    });
   
   displayAccuracy(position);
}

function displayAccuracy(){
    var position = new google.maps.LatLng(curlat, curlng);
    if(curaccCircle) curaccCircle.setMap(null);
    var cradius = (curacc > 500) ? 500 : curacc;
    curaccCircle = new google.maps.Circle({
            center: position,
            radius: cradius,
            map: map,
            fillColor: '#2196F3',
            fillOpacity: 0.18,
            //strokeColor: '#0000FF',
            strokeOpacity: 0,
        });

    if (homeMarker != null) homeMarker.setMap(null);
    homeMarker = new google.maps.Marker({
        position: position,
        icon: 'assets/img/pin-cur.png',
        map: map,
    });
}

function markerClick(i) {
    if (markerClicked != null)
        markerClicked(i);
}

function loadMarkers(isNew, outlets, callback) {   
    log("Load outlets markers: " + outlets.length.toString());
    var bounds = map.getBounds();
    log('Current bound: ');
    log(bounds);

    markers = [];  
    for (var i = 0; i < outlets.length; i++) {
        var outlet = outlets[i];
        var position = new google.maps.LatLng(outlet.Latitude, outlet.Longitude);
        //bounds.extend(position);
        createMaker(outlet, position, i, isNew, bounds);
    };
     
    var options = {
        gridSize: config.cluster_size,
        maxZoom: config.cluster_max_zoom,
        imagePath: 'assets/img/m'
    };
    markerClusterer = new MarkerClusterer(map, markers, options);  
    callback();
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
            if (isDev) {
                log('***set debug location...');
                lat = devNewLat + devNewDetlta;
                lng = devNewLng + devNewDetlta;
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
        onError,
        { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
    } catch (err) {
        log(err);
        onError(err.message);
    }
}

function startPositionWatching(){
    if (isDev) return;    
    if(gpsWatchID == -1){
        gpsWatchID = navigator.geolocation.watchPosition(
            function(position){
                if(locationChangedCallback)
                    locationChangedCallback(position.coords.latitude, position.coords.longitude, position.coords.accuracy);   
            }, 
            function(error){
                log('GPW watching error code: ' + error.code  + '\n' + 'message: ' + error.message + '\n');
            }, { 
                enableHighAccuracy: true,
                maximumAge: 3000,
                timeout: 10000 
            });
    }
}

function stopPositionWatching(){
    if(gpsWatchID != -1){
        try{
            navigator.geolocation.clearWatch(gpsWatchID);
        } catch(err){
            log('Stop GPW watching error: ' + err.message);
        }
    }
}