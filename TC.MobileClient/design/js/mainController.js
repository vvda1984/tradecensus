function mainController($scope, $route, $location) {
    log('Enter main controller');
    $scope.route = $route;
    $scope.$on('$routeChangeSuccess', function (ev) {
        console.log('routed to ' + $location.path());
    });
    $scope.changeView = function (name) {
        console.log('change view: ' + name);
        //$scope.$apply(function () {
        //    $location.path('/' + name);
        //    console.log($location.path());
        //});
        $location.path('/' + name);
        try {
            if (!$scope.$$phase) $scope.$apply();
        } catch (err) {
        }
    };
    $scope.isOnline = function () {
        if (!config.mode_online) return false;
        // ANVO: DEBUG
        if (isDev)
            return true;
        var networkState = navigator.connection.type;
        return (networkState != 'Unknown connection' && networkState != 'no network connection')
    }
    
    $scope.changeView('login');
};
