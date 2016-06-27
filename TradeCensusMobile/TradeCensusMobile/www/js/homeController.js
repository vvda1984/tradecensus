console.log("Add home controller");
app.controller("HomeController", ["$scope", "$location", "$http", function ($scope, $location, $http) {
    console.log("Enter Home page");  
    var mapOptions = {
        zoom: 8,
        center: new google.maps.LatLng(-34.397, 150.644),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.TOP_CENTER
        },
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM
        },
        scaleControl: true,
        streetViewControl: true,
        streetViewControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM
        },
        fullscreenControl: true,
    };

    var map = new google.maps.Map(document.getElementById("map"), mapOptions);

    //setTimeout(function () {
    //    $('.modal-body').append($("#map").css("margin-top", "0px").get(0));
    //}, 500);

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

    $scope.button1Click = function () {
        $scope.button1state = 1;
        $scope.button2state = 0;
        $scope.button3state = 0;
    }
    

    $scope.button2Click = function () {
        $scope.button1state = 0;
        $scope.button2state = 1;
        $scope.button3state = 0;
    }

    $scope.button3Click = function () {
        $scope.button1state = 0;
        $scope.button2state = 0;
        $scope.button3state = 1;
    }
}]);