log('Add MainController');
app.controller('MainController', ['$scope', '$route', '$location', function ($scope, $route, $location) {
    $scope.resource = loadResources();

    $scope.user = {
        id: 123456, // dev
        password: '1',
        firstName: '',
        lastName: '',
        isTerminate: false,
        hasAuditRole: false,
        posID: '0',
        zoneID: '',
        areaID: '',
        provinceID: '',
        email: '',
        emailTo: '',
        houseNo: '',
        street: '',
        district: '',
        homeAddress: '',
        workAddress: '',
        phone: '',
    };

    $scope.config = loadDefaultConfig();

    log('check network status...');   
    if (!isWeb) {
        isOnline = checkConnection();
        document.addEventListener('online', function () { isOnline = true; }, false);
        document.addEventListener('offline', function () { isOnline = false; }, false);
    }
  
    $scope.baseURL = buildURL($scope.config.protocol, $scope.config.ip, $scope.config.port, $scope.config.service_name);

    $scope.route = $route;   
   
    $scope.$on('$routeChangeSuccess', function (ev) {
        console.log('routed to ' + $location.path());
    });
   
    $scope.changeView = function (name) {        
        console.log('change view: ' + name);
        //$scope.$apply(function () {
        //    $location.path("/" + name);
        //    console.log($location.path());
        //});

        $location.path('/' + name);
        try{
            $scope.$apply();
        } catch (err) {
        }        
    };

    $location.path('/login');
}]);

//*******************************************
function loadResources() {
    return {
        text_AppName: 'Trade Censue',
        text_Login: 'Login',
        text_Exit: 'Exit',
        text_OK: 'OK',
        text_Cancel :'Cancel',
        text_InvalidUserPass: 'Invalid User/Password.',
        text_ConfigServer: 'Configure Server',
        text_UserName: 'User ID',
        text_Password: 'Password',
        text_EnterProtocol: 'Enter Protocol',
        text_EnterUserID: 'Enter User ID',        
        text_EnterIPAddress: 'Enter IP Address',
        text_EnterPort: 'Enter Port',
        text_EnterPassword: 'Enter Password',
        text_EnterProvince: 'Enter Province',
        text_ValRequired: 'Required.',
        text_ValLength10: 'Has to be less than 10 characters long.',
        text_UserTerminated: 'User has been terminated',
    };
}

//*******************************************
function loadDefaultConfig() {
    // Load database...
    return {
        protocol: 'http',
        ip: '192.168.1.104',
        port: '33334',
        service_name: 'TradeCensusService.svc',
        item_count: 20,
        distance: 1000,
        province_id: 50, // HCM
        http_method : 'POST',
        calc_distance_algorithm: 'circle',
        tbl_area_ver: '0',
        tbl_outlettype_ver: '0',
        tbl_province_ver: '1',
        tbl_zone_ver: '0',
    };
}

