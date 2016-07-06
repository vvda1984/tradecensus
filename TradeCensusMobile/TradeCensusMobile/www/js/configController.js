
console.log("Add ConfigController");
app.controller("ConfigController", ["$scope", function ($scope) {
    console.log("Enter config page");

    var protocol = $scope.config.protocol;
    var ip = $scope.config.ip;
    var port = $scope.config.port;
    var province_id = $scope.config.province_id;
    var distance = $scope.config.distance;
    var item_count = $scope.config.item_count;
    $scope.provinces = provinces;
    log($scope.provinces.length);

    $scope.saveConfig = function () {
        if (isEmpty($scope.config.ip)) {
            showError('IP is empty!');
            return;
        }

        if (isEmpty($scope.config.port)) {
            showError('Port is empty!');
            return;
        }

        if (isEmpty($scope.config.distance)) {
            showError('Distance is empty!');
            return;
        }

        if (isEmpty($scope.config.distance)) {
            showError('Maximum outlets count is empty!');
            return;
        }

        log("save config");        
        insertConfig($scope.config, function () {
            $scope.changeView("login");            
            baseURL = buildURL($scope.config.protocol, $scope.config.ip, $scope.config.port, $scope.config.service_name);
            log('Update baseURL: ' + baseURL);
        }, handleError);
    }

    $scope.cancel = function () {
        $scope.config.protocol = protocol;
        $scope.config.ip = ip;
        $scope.config.port = port;
        $scope.config.province_id = province_id;
        $scope.distance = distance;
        $scope.item_count = item_count;
        $scope.changeView("login");
    }
}]);

//function configDialogController($scope, $mdDialog){
//    log("Enter config page");
//    var protocol = $scope.config.protocol;
//    var ip = $scope.config.ip;
//    var port = $scope.config.port;
//    var province_id = $scope.config.province_id;
//    var distance = $scope.config.distance;
//    var item_count = $scope.config.item_count;
//    $scope.provinces = provinces;
//    log($scope.provinces.length);
//    $scope.saveConfig = function () {
//        $mdDialog.hide();
//        if (isEmpty($scope.config.ip)) {
//            showError('IP is empty!');
//            return;
//        }
//        if (isEmpty($scope.config.port)) {
//            showError('Port is empty!');
//            return;
//        }
//        if (isEmpty($scope.config.distance)) {
//            showError('Distance is empty!');
//            return;
//        }
//        if (isEmpty($scope.config.distance)) {
//            showError('Maximum outlets count is empty!');
//            return;
//        }
//        log("save config");
//        $mdDialog.hide(true);
//        insertConfig($scope.config, function () {
//            $mdDialog.hide(true);
//            //$scope.changeView("login");
//            baseURL = buildURL($scope.config.protocol, $scope.config.ip, $scope.config.port, $scope.config.service_name);
//            log('Update baseURL: ' + baseURL);
//        }, handleError);
//    }
//    $scope.cancel = function () {        
//        $scope.config.protocol = protocol;
//        $scope.config.ip = ip;
//        $scope.config.port = port;
//        $scope.config.province_id = province_id;
//        $scope.distance = distance;
//        $scope.item_count = item_count;     
//        $mdDialog.hide(false);
//    }
//}