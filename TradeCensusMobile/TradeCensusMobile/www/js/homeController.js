log('Add home controller');
app.controller('HomeController', ['$scope', '$location', '$http', function ($scope, $location, $http) {
    log('Enter Home page');
    log(isOnline);
    log($scope.user.id);
    log($scope.config.province_id);
    
    var curlat = 10.773598;
    var curlng = 106.7058;
    var markers = [];
    $scope.showExpander = true;
    $scope.showCollapser = false;
    $scope.button1state = 1;
    $scope.button2state = 0;
    $scope.button3state = 0;
    $scope.outletHeader = 'Near-by Outlets';
    $scope.outletCategory = 1; // 1: near-by; 2: new: 3: updated
    var homeMarker = null;

    $scope.refresh = function () {
        onGetLocationSuccess(null);
        //log('query location...');
        //try{
        //    navigator.geolocation.getCurrentPosition(onGetLocationSuccess, onGetLocationError);
        //}catch (err) {
        //    log(err);
        //}
    }

    if (map == null) {
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 16,
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
            fullscreenControl: true,
        });
    }    
    
    $scope.showLeftPanel = function () {
        openOutletPanelHalf();        
    }

    $scope.showLeftPanelFull = function () {
        $scope.showExpander = false;
        $scope.showCollapser = true;
        openOutletPanel();
    }

    $scope.hideLeftPanel = function () {
        $scope.showExpander = true;
        $scope.showCollapser = false;
        closeOutletPanel();
    }
   
    $scope.button1Click = function () { // near-by
        $scope.button1state = 1;
        $scope.button2state = 0;
        $scope.button3state = 0;
        $scope.outletCategory = 1;
        loadOutlets();
    }
    
    $scope.button2Click = function () { // new
        $scope.button1state = 0;
        $scope.button2state = 1;
        $scope.button3state = 0;
        $scope.outletCategory = 2;
        loadOutlets();
    }

    $scope.button3Click = function () { // updated
        $scope.button1state = 0;
        $scope.button2state = 0;
        $scope.button3state = 1;
        $scope.outletCategory = 3;
        loadOutlets();
    }

    function onGetLocationSuccess(position) {
        //curlat = position.coords.latitude;
        //curlng = position.coords.longitude;
        if (homeMarker == null) {
            homeMarker = createMaker('', new google.maps.LatLng(curlat, curlng), 'pin-cur.png');            
        } else {
            homeMarker.setPosition(new google.maps.LatLng(curlat, curlng));
        }
        markers = [];
        markers.push(homeMarker);        
        moveToCurLocation();
        getOutletsOnline();
    };

    function onGetLocationError(error) {
        showDialog('Location is OFF!', 'Error', function () { });
    }
    
    function getOutletsOnline() {
        showLoadingDlg("Loading outlets...");
        var url = $scope.baseURL + '/outlet/getoutlets/' + curlat.toString() + '/' + curlng.toString() + '/' + $scope.config.distance.toString() + '/' + $scope.config.item_count.toString();
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
                updateLocalOutlets(data.Items, loadOutletsToMap, handleError);
            }
        }, handleHttpError);
    }

    function loadOutletsToMap(outlets) {
        log("load outlets to map");
        outlets.forEach(function (outlet, i) {
            var outlet = outlets[i];
            var marker = createMaker(outlet.Name, new google.maps.LatLng(outlet.Latitude, outlet.Longitude), 'pin-open-dis.png');
            markers.push(marker);
        });
    }

    function updateLocalOutlets(outlets, onSuccess, onError) {
        //TODO: update local outlets...
        onSuccess(outlets);
    }
      
    function moveToCurLocation() {
        log('Move current location');
        var center = new google.maps.LatLng(curlat, curlng);
        map.panTo(center);
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
    
    log('Refresh view');
    try {
        $scope.refresh();
    } catch (err) {
        log(err);
    }    
}]);