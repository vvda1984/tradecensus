/// <reference path="app.service.js" />


app.controller("LoginController", ["$scope", "$location", "$http", function ($scope, $location, $http) {
    $scope.login = function (userID, password) {
        // validate...
        if (isEmpty(userID)) {
            showDialog("User ID is empty!", "Error", function () { })
            return;
        }

        if (isEmpty(password)) {
            showDialog("Password is empty!", "Error", function () { })
            return;
        }

        var isCancel = false;
        SpinnerDialog.show("Login...", "Please wait", function () { isCancel = true; });
        if (isOnline) {
            log("Call login api...");
            var loginURL = $scope.baseURL + "/login/" + userID + "-" + password;
            $http({
                method: 'GET',
                url: loginURL
            }).then(function (resp) {
                SpinnerDialog.hide();
                if (isCancel) return;
                if (resp.Status == -1) { // error
                    showDialog(resp.ErrorMessage, "Error", function () { });
                } else {
                    addOrUpdatePerson(resp.People, password, [], function (tx) {
                        $scope.password = "";
                    });
                }
            }, function (err) {
                SpinnerDialog.hide();
                if (isCancel) return;
                showDialog(err, "Error", function () { });
            });
        } else {
            log("Login using local db");
        }
    };

    $scope.exit = function () {
        navigator.app.exitApp();
    };
}]);