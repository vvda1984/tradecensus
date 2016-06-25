app.config(["$routeProvider", function (routeProvider) {
    //sceDelegateProvider.resourceUrlWhitelist(["**"]);
    routeProvider
        .when("/login", {
            templateUrl: "./views/login.html",
            controller: "LoginController",
        })
        .when("/config", {
            templateUrl: "./views/config.html",
            controller: "ConfigController",
        })
		.when("/home", {
		    templateUrl: "./views/home.html",
		    controller: "HomeController",
		})
    ;
}]);