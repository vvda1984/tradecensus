console.log("Add main controller");
app.controller("MainController", ["$scope", "$route", "$location", function ($scope, $route, $location) {
    console.log("Initialize application");

    // Initialize resources

    console.log("Load resources");
    $scope.resource = loadResources();

    console.log("Load local settings");
    $scope.config = loadSavedConfig();
    $scope.baseURL = buildURL($scope.config.Protocol, $scope.config.IP, $scope.config.Port, $scope.config.ServiceName);

    $scope.token = "";
    //$scope.route = $route;   

    //*******************************************************
    $scope.$on("$routeChangeSuccess", function (ev) {
        console.log("routed to " + $location.path());
        /*
		(function crap() {
            if (!$scope.tabStrip)
                return setTimeout(crap, 100);
            $scope.tabStrip.switchByFullUrl(path.replace(/^\//, "#"));
        })();
		*/
    });

    //*******************************************************
    $scope.changeView = function (name) {
        console.log("change view");
        //$location.path = "#/" + name;
        $location.path("/" + name);
    };    

    $location.path("/login");
}]);