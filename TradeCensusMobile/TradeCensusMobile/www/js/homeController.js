log("Add home controller");
app.controller("HomeController", ["$scope", "$location", "$http", function ($scope, $location, $http) {
    log("Enter Home page");
    log(isOnline);
    log($scope.userID);
    log($scope.config.province_id);
    
    var homeMarker = null;
    var curlat = 10.771136;
    var curlng = 106.702655;
    var map = new google.maps.Map(document.getElementById("map"), {
        zoom: 14,
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
        
    $scope.showExpander = true;
    $scope.showCollapser = false;
    $scope.button1state = 1;
    $scope.button2state = 0;
    $scope.button3state = 0;
    $scope.outletHeader = "Near-by Outlets";
    $scope.outletCategory = 1; // 1: near-by; 2: new: 3: updated

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
        log('Latitude: ' + position.coords.latitude + '\n' +
            'Longitude: ' + position.coords.longitude + '\n' +
            'Altitude: ' + position.coords.altitude + '\n' +
            'Accuracy: ' + position.coords.accuracy + '\n' +
            'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '\n' +
            'Heading: ' + position.coords.heading + '\n' +
            'Speed: ' + position.coords.speed + '\n' +
            'Timestamp: ' + position.timestamp + '\n');
        curlat = position.coords.latitude;
        curlng = position.coords.longitude;
        if (homeMarker == null) {
            homeMarker = createMaker("", new google.maps.LatLng(curlat, curlng), "pin-cur.png");
        }else {
            homeMarker.setPosition(new google.maps.LatLng(curlat, curlng));
        }
        moveToCurLocation();
        loadOutlets();
    };

    function onGetLocationError(error) {
        showDialog("Location is OFF!", "Error", function () { });
    }
    
    function loadOutlets() {
        log("load outlets...");
    }

    $scope.refresh = function () {
        log("query location...");
        navigator.geolocation.getCurrentPosition(onGetLocationSuccess, onGetLocationError);
    }

    $scope.refresh();

    function moveToCurLocation() {
        log("Move current location");
        var center = new google.maps.LatLng(curlat, curlng);
        map.panTo(center);
    }

    function createMaker(title, latlng, iconurl) {
        //var image = {
        //    url: iconurl,            
        //    size: new google.maps.Size(20, 30), // This marker is 20 pixels wide by 32 pixels high.            
        //    origin: new google.maps.Point(0, 0), // The origin for this image is (0, 0).
        //    // The anchor for this image is the base of the flagpole at (0, 32).
        //    anchor: new google.maps.Point(0, 32)
        //};
        var iconFullUrl = "assets/img/" + iconurl;

        return marker = new google.maps.Marker({
            position: latlng,
            map: map,
            title: title,
            icon: iconFullUrl,
        });        
    }
}]);