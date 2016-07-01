/// <reference path='app.global.js' />
var isWeb = true;                  // for testing
var db;                             // database instance
var map;                            // google map
var isOnline = true;                // network status
var isDev = false;                  // enable DEV mode
var userOutletTable = 'outlet';     // outlet table name for current user
var isLoadingDlgOpened = false;     // 
var isInitialize = false;
var provinces = [];

$(document).ready(function () {    
    initalizeDB(function () {
        showDlg('Initialize', 'Please wait...', false);
        selectProvinces(
            function (tx, dbrow) { // Load Province Success
                hideDlg();
                var rowLen = dbrow.rows.length;
                if (rowLen) {
                    for (i = 0; i < rowLen; i++) {
                        provinces[i] = {
                            id: dbrow.rows.item(i).ID,
                            name: dbrow.rows.item(i).Name,
                        }
                    }
                }               
            }, function (dberr) {     // Error
                hideDlg();
                log(dberr.message);
            })
    });
});

var app = angular
    .module('TradeCensus', ['ngRoute', 'ngMaterial', 'ngMessages'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
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
    }])
    .controller('MainController', ['$scope', '$route', '$location', function ($scope, $route, $location) {
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
            //    $location.path('/' + name);
            //    console.log($location.path());
            //});
            $location.path('/' + name);
            try {
                $scope.$apply();
            } catch (err) {
            }
        };
        $location.path('/login');
    }]);
