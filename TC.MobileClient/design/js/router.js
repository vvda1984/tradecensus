function appRouter($routeProvider) {
    $routeProvider
        .when('/', {
            controller: 'mainController',
        })
        .when('/login', {
            templateUrl: './views/login.html',
            controller: 'LoginController',
        })
        .when('/config', {
            templateUrl: './views/config.html',
            controller: 'ConfigController',
        })
        .when('/home', {
            templateUrl: './views/home.html',
            controller: 'HomeController',
        });
};