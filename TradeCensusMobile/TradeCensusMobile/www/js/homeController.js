console.log("Add home controller");
app.controller("HomeController", ["$scope", function ($scope) {
    console.log("Enter Home page");  
    var mapOptions = {
        zoom: 8,
        center: new google.maps.LatLng(-34.397, 150.644),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    var map = new google.maps.Map(document.getElementById("map"), mapOptions);
    setTimeout(function () {
        $('.modal-body').append($("#map").css("margin-top", "0px").get(0));
    }, 500);
}]);