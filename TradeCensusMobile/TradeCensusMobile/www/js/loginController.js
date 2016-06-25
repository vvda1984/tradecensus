console.log("Add login controller");
app.controller("LoginController", ["$scope", "$location", function ($scope, $location) {
    console.log("Enter login page");

    $scope.login = function (username, password) {
        $scope.token = "123";
        $location.path("/home");
    };

    $scope.exit = function () {
        navigator.app.exitApp();
    };
}]);