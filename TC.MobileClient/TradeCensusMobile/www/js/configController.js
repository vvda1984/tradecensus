function configController($scope) {
    log("Enter config page");
   
    $scope.resource = resource;
    $scope.config = config;
    $scope.provinces = provinces;

    var protocol = $scope.config.protocol;
    var ip = $scope.config.ip;
    var port = $scope.config.port;
    var province_id = $scope.config.province_id;
    var distance = $scope.config.distance;
    var item_count = $scope.config.item_count;
    var online = $scope.config.mode_online;
       
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

        if (isEmpty($scope.config.item_count)) {
            showError('Maximum outlets count is empty!');
            return;
        }

        //config.protocol = $scope.config.protocol;
        //config.ip = $scope.config.ip;
        //config.port = $scope.config.port;
        //config.province_id = $scope.config.province_id;
        //config.mode_online = $scope.config.mode_online;
        //config.distance = $scope.distance;
        //config.item_count = $scope.item_count;

        showDlg("Update Settings", 'Please wait...');
        insertSettingDB(config, function () {
            hideDlg();
            baseURL = buildURL($scope.config.protocol, $scope.config.ip, $scope.config.port, $scope.config.service_name);
            log('Change baseURL: ' + baseURL);
            $scope.changeView("login");
        }, function (dberr) {
            showError(dberr.message);
        });
    }

    $scope.cancel = function () {
        config.protocol = protocol;
        config.ip = ip;
        config.port = port;
        config.province_id = province_id;
        config.mode_online = online;
        config.distance = distance;
        config.item_count = item_count;
     
        $scope.changeView("login");
    }
}