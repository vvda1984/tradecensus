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
var __loadMapCallback = null;
var editOutletCallback = null;
var mapClickedCallback = null;
var mapViewChangedCallback = null;
var __locationChangedCallback = null;
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

var border_level = 0;
var borders_0;
var borders_1;
var borders_2;
var borders_3;
var borders_4;
var borders_5;
var borders_6;
var selected_border_0; // province
var selected_border_1; // district
var selected_border_2; // ward
//var selected_border_3;
//var selected_border_4;
//var selected_border_5;
//var selected_border_6;

var isloadingGGapi = false;
function loadMapApi(hideMaskedDlg) {
    if (isloadingGGapi) return;
    isloadingGGapi = true;

    if (!networkReady()) {
        isloadingGGapi = false;
        if (typeof hideLoadingDlg !== 'undefined') hideLoadingDlg();

        if (__loadMapCallback) {
            __loadMapCallback();
            __loadMapCallback = null;
        }
    } else {
        if (loadedMapAPI) {
            initializeMap()
            isloadingGGapi = false;
            if (typeof hideLoadingDlg !== 'undefined') hideLoadingDlg();

        } else {
            loadedMapAPI = true;            
            var url = 'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&key=' + config.map_api_key; // + '&callback=googleMapReadyCallback';
            log('Load map API: ' + url);
            $.getScript(url, function (data, textStatus, jqxhr) {
                if (hideMaskedDlg)
                    hideMaskedDlg();

                if (jqxhr.status === 200) {
                    initializeMap();
                    isMapReady = true;
                }
            });
            isMapReady = true;
        }
    }
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
            inactivityTime();
        });

        google.maps.event.addListener(map, 'bounds_changed', function (event) {
            log('map bounds_changed');
            inactivityTime();
        });

        panorama = map.getStreetView();
        google.maps.event.addListener(panorama, 'visible_changed', function() {
            log('panorama visible_changed:' + panorama.getVisible().toString());
            if( mapViewChangedCallback){
                mapViewChangedCallback(panorama.getVisible());
            }         
        });	
		
        hideDlg();
        isMapReady = true;
       
        if (__loadMapCallback) {           
            __loadMapCallback();
            __loadMapCallback = null;
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

    var bounds = new google.maps.LatLngBounds();
    
    var zones = JSON.parse(geodata);

    for (var i = 0; i < zones.length; i++) {
        var lines = zones[i].border;

        for (var j = 0; j < lines.length; j++) {
            bounds.extend(lines[j]);
        }
       
        var border = new google.maps.Polygon({
            paths: lines,
            strokeColor: '#FF0000',
            strokeOpacity: 0.5,
            strokeWeight: 4,    
            fillColor: '#000000',
            fillOpacity: config.border_fill_opacity,
        });
        border.setMap(map);
        borders.push(border);
    }

    bounds.getCenter();
    map.fitBounds(bounds);
}

function changeMapTypeView(i) {
    if (i == 0) {
        map.setMapTypeId('roadmap');
    } else {
        map.setMapTypeId('hybrid');
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

            var imgName = null;
            if (outlet.InputByRole == 0) { // Sale
                imgName = config.map_tc_salesman_outlet;
            } else if (outlet.InputByRole == 1) { // Sale auditor
                imgName = config.map_tc_auditor_outlet;
            } else if (outlet.InputByRole == 2) { // Agency

                if (outlet.AuditStatus !== StatusAuditAccept && outlet.AuditStatus !== StatusAuditorAccept) {
                    imgName = config.map_tc_agency_new_outlet;
                } else {
                    imgName = config.map_tc_agency_new_outlet_approved;
                }

            } else if (outlet.InputByRole == 3) { // Agency auditor

                if (outlet.AuditStatus !== StatusAuditAccept && outlet.AuditStatus !== StatusAuditorAccept) {
                    imgName = config.map_tc_agency_auditor_new_outlet;
                } else {
                    imgName = config.map_tc_agency_auditor_new_outlet_approved;
                }
            }

            return isEmpty(imgName) ? 'assets/img/pin-new.png' : 'data:image/png;base64,' + imgName;

        } else if (outlet.AuditStatus == StatusAuditDeny) {

            var imgName = null;
            if (outlet.InputByRole == 0) { // Sale
                imgName = config.map_tc_salesman_outlet_denied;
            } else if (outlet.InputByRole == 1) { // Sale auditor
                imgName = config.map_tc_auditor_outlet_denied;
            } else if (outlet.InputByRole == 2) { // Agency
                imgName = config.map_tc_agency_new_outlet_denied;
            } else if (outlet.InputByRole == 3) { // Agency
                imgName = config.map_tc_agency_auditor_new_outlet_denied;
            }

            return isEmpty(imgName) ? 'assets/img/pin-new-error.png' : 'data:image/png;base64,' + imgName;

        } else {
            if (outlet.AmendByRole == 2 || outlet.AmendByRole == 3) {

                if (outlet.AuditStatus == StatusAuditDeny || outlet.AuditStatus == StatusExitingDeny) {
                    if (isEmpty(config.map_tc_agency_existing_outlet_denied))
                        return 'assets/img/pin-dis-audit-error.png';
                    else
                        return 'data:image/png;base64,' + config.map_tc_agency_existing_outlet_denied;
                }
                if (outlet.AuditStatus == StatusAuditAccept || outlet.AuditStatus == StatusExitingAccept) {
                    if (isEmpty(config.map_tc_agency_existing_outlet_approved))
                        return 'assets/img/pin-dis-audit-right.png';
                    else
                        return 'data:image/png;base64,' + config.map_tc_agency_existing_outlet_approved;
                }
                if (isEmpty(config.map_tc_agency_existing_outlet_edited)) {
                    return 'assets/img/pin-dis-open.png';
                } else {
                    return 'data:image/png;base64,' + config.map_tc_agency_existing_outlet_edited;
                }

            } else {
                switch (outlet.OutletSource) {
                    case 0: //SR
                        if (outlet.AuditStatus == StatusAuditDeny || outlet.AuditStatus == StatusExitingDeny) {
                            if (isEmpty(config.map_sr_outlet_audit_denied))
                                return 'assets/img/pin-sr-audit-wrong.png';
                            else
                                return 'data:image/png;base64,' + config.map_sr_outlet_audit_denied;
                        }

                        if (outlet.AuditStatus == StatusAuditAccept || outlet.AuditStatus == StatusExitingAccept) {
                            if (isEmpty(config.map_sr_outlet_audit_approved)) {
                                return 'assets/img/pin-sr-audit-right.png';
                            } else {
                                return 'data:image/png;base64,' + config.map_sr_outlet_audit_approved;
                            }
                        }

                        if (!outlet.IsOpened) {
                            if (isEmpty(config.map_sr_outlet_closed)) {
                                return 'assets/img/pin-sr-close.png';
                            } else {
                                return 'data:image/png;base64,' + config.map_sr_outlet_closed;
                            }
                        }

                        if (!outlet.IsTracked) {
                            if (isEmpty(config.map_sr_outlet_non_track)) {
                                return 'assets/img/pin-sr-nontrack.png';
                            } else {
                                return 'data:image/png;base64,' + config.map_sr_outlet_non_track;
                            }
                        }

                        if (isEmpty(config.map_sr_outlet_opened)) {
                            return 'assets/img/pin-sr-open.png';
                        } else {
                            return 'data:image/png;base64,' + config.map_sr_outlet_opened;
                        }

                    case 1: // DIS
                        if (outlet.AuditStatus == StatusAuditDeny || outlet.AuditStatus == StatusExitingDeny) {
                            if (isEmpty(config.map_dis_outlet_audit_denied))
                                return 'assets/img/pin-dis-audit-error.png';
                            else
                                return 'data:image/png;base64,' + config.map_dis_outlet_audit_denied;
                        }

                        if (outlet.AuditStatus == StatusAuditAccept || outlet.AuditStatus == StatusExitingAccept) {
                            if (isEmpty(config.map_dis_outlet_audit_approved))
                                return 'assets/img/pin-dis-audit-right.png';
                            else
                                return 'data:image/png;base64,' + config.map_dis_outlet_audit_approved;
                        }

                        //if (!outlet.IsTracked) {
                        //    return 'assets/img/pin-sr-nontrack.png';
                        //}
                        if (!outlet.IsOpened) {
                            if (isEmpty(config.map_dis_outlet_closed))
                                return 'assets/img/pin-dis-close.png';
                            else
                                return 'data:image/png;base64,' + config.map_dis_outlet_closed;
                        }

                        if (isEmpty(config.map_dis_outlet_opened)) {
                            return 'assets/img/pin-dis-open.png';
                        } else {
                            return 'data:image/png;base64,' + config.map_dis_outlet_opened;
                        }
                }
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
    displayAccuracy();

    journals.setMap(map);   
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

var isWaitingForLocation = false;
var __getLocationTimeout = null;
function getCurPosition(moveToCur, onSuccess, onError) {    
    isWaitingForLocation = true;
    if (__getLocationTimeout != null) {
        clearTimeout(__getLocationTimeout);
        __getLocationTimeout = null;
    }

    __getLocationTimeout = setTimeout(function () {
        if (!isWaitingForLocation) return;

        isWaitingForLocation = false;
        __getLocationTimeout = null;
        onError(R.msg_cannot_get_location);        
    }, config.get_location_time_out * 1000);

    try {
        navigator.geolocation.getCurrentPosition(function (position) {
            if (!isWaitingForLocation) return;

            isWaitingForLocation = false;
            if (__getLocationTimeout != null) {
                clearTimeout(__getLocationTimeout);
                __getLocationTimeout = null;
            }

            isWaitingForLocation = false;
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;
            curacc = position.coords.accuracy;
            log('Accuracy:' + curacc.toString());

            // AnVo: DEBUG
            if (config.enable_devmode) {
                log('***set debug location...');
                lat = devLat;
                lng = devLng;
            }
            curlat = lat;
            curlng = lng;
            if (isMapReady && moveToCur) {
                log('Move to current location');
                moveToCurrentLocation();
            }
            log('Found location: lat=' + lat.toString() + ',lng=' + lng.toString());
            onSuccess(lat, lng);
        },
        function (err) {
            if (!isWaitingForLocation) return;
            try {
                isWaitingForLocation = false;
                if (__getLocationTimeout != null) {
                    clearTimeout(__getLocationTimeout);
                    __getLocationTimeout = null;
                }

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
                    return;
                }
            } catch(e){
            }
            onError(err);
        },
        { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
    } catch (err) {
        console.error("ERROR");
        console.error(err);
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

                if (__locationChangedCallback)
                    __locationChangedCallback(foundLat, foundLng, foundAcc);
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

function setBorders(items, level) {
    if (level == 0) {
        borders_0 = items;
    } else if (level == 1) {
        borders_1 = items;
    } else if (level == 2) {
        borders_2 = items;
    } else if (level == 3) {
        borders_3 = items;
    } else if (level == 4) {
        borders_4 = items;
    } else if (level == 5) {
        borders_5 = items;
    } else if (level == 6) {
        borders_6 = items;
    }
}

function getBorders(level) {
    if (level == 0) {
        return borders_0; 
    } else if (level == 1) {
        return borders_1;
    } else if (level == 2) {
        return borders_2;
    } else if (level == 3) {
        return borders_3;
    } else if (level == 4) {
        return borders_4;
    } else if (level == 5) {
        return borders_5;
    } else if (level == 6) {
        return borders_6;
    }
    return [];
}

var isRunningInBackgound = false;
function __trackLocationWhenAppInBackground(callback) {
    if (__locationChangedCallback) {
        getCurPosition(false, function (lat, lng) {
            __locationChangedCallback(lat, lng, curacc);
            callback();
        }, function (err) {
            log(err);
            callback();
        });
    }
}
function turnOntrackLocationWhenAppInBackground() {
    if (__locationChangedCallback && isRunningInBackgound) {
        setTimeout(function () {
            __trackLocationWhenAppInBackground(function () {
                turnOntrackLocationWhenAppInBackground();
            });
        }, 1000 * config.journal_update_time);
    }
}

function showCurPositionDlg(moveToCur, onSuccess, onError) {
    var isCancelled = false;
    var __getCurPosition = function (m, s, e) {
        getCurPosition(
            m,
            function (lat, lng) {
                if (isCancelled) return;
                dialogUtils.hideProcessing();
                s(lat, lng);
            },
            function () {
                if (isCancelled) return;
                dialogUtils.hideProcessing();

                dialogUtils.showGetLocationError(
                    function () {
                        showCurPositionDlg(m, s, e);
                    },
                    function () {
                        //do nothing
                    });
            });
    };

    dialogUtils.showProcessing(R.get_current_location, {
        cancelCallback: function () {
            isCancelled = true;
            if (__getLocationTimeout != null) {
                clearTimeout(__getLocationTimeout);
                __getLocationTimeout = null;
            }
        },
    });

    __getCurPosition(moveToCur, onSuccess, onError);
}