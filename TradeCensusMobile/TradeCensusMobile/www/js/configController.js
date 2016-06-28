console.log("Add ConfigController");
app.controller("ConfigController", ["$scope", function ($scope) {
    console.log("Enter config page");

    var protocol = $scope.config.protocol;
    var ip = $scope.config.ip;
    var port = $scope.config.port;
    var province_id = $scope.config.province_id;
    $scope.provinces = provinces;
    log($scope.provinces.length);

    $scope.saveConfig = function () {
        log("save config");
        insertConfig($scope.config, function () {
            $scope.changeView("login");
        }, handleError);
    }

    $scope.cancel = function () {
        $scope.config.protocol = protocol;
        $scope.config.ip = ip;
        $scope.config.port = port;
        $scope.config.province_id = province_id;
        $scope.changeView("login");
    }
}]);