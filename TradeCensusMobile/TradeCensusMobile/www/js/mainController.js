$(document).ready(function () {
    document.addEventListener("backbutton", onBackKeyDown, false);
    function onBackKeyDown(e) {
        e.preventDefault();
    }
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
        if (!isInitialize) {
            isInitialize = true;
            initalizeDB(function () {
                showDlg('Initialize', 'Please wait...', false);
                log('Load outlet types...')
                loadOutletTypes(
                    function () {
                        log('Load provices...')
                        loadProvinces(
                            function () {
                                loadConfig();
                            },
                            function (dberr) {
                                hideDlg();
                                showError(dberr.message);
                            });
                    },
                    function (dberr) {
                        hideDlg();
                        showError(dberr.message);
                    });
            });
        }

        function loadProvinces(onSuccess, onError) {
            if (provinces != null && provinces.length > 0) {
                onSuccess();
            } else {
                provinces = [];
                selectProvinces(function (tx, dbrow) {
                    var rowLen = dbrow.rows.length;
                    log('found ' + rowLen.toString() + ' provinces');
                    if (rowLen) {
                        for (i = 0; i < rowLen; i++) {
                            provinces[i] = {
                                id: dbrow.rows.item(i).ID,
                                name: dbrow.rows.item(i).Name,
                            }
                        }
                    }

                    onSuccess();
                }, onError);
            }
        }

        function loadOutletTypes(onSuccess, onError) {
            if (outletTypes != null && outletTypes.length > 0) {
                onSuccess();
            } else {
                outletTypes = [];
                selectOutletTypes(function (tx, dbrow) {
                    var rowLen = dbrow.rows.length;
                    log('found ' + rowLen.toString() + ' outlet types');
                    if (rowLen) {
                        for (i = 0; i < rowLen; i++) {
                            outletTypes[i] = {
                                id: dbrow.rows.item(i).ID,
                                name: dbrow.rows.item(i).Name,
                            }
                        }
                    }

                    onSuccess();
                }, onError);
            }
        }

        function loadConfig() {
            setDlgMsg('Read configuration');
            selectConfigs(function (tx2, dbres2) {
                var rowLen = dbres2.rows.length;
                console.log('Config len: ' + rowLen.toString());
                if (rowLen) {
                    for (i = 0; i < rowLen; i++) {
                        var name = dbres2.rows.item(i).Name;
                        var value = dbres2.rows.item(i).Value;
                        if (name == 'protocol') {
                            log('set protocol ' + value);
                            $scope.config.protocol = value;
                        } else if (name == 'ip') {
                            log('set ip: ' + value);
                            $scope.config.ip = value;
                        } else if (name == 'port') {
                            log('set port: ' + value);
                            $scope.config.port = value;
                        } else if (name == 'service_name') {
                            log('service name: ' + value);
                            $scope.config.service_name = value;
                        } else if (name == 'item_count') {
                            log('item_count: ' + value);
                            $scope.config.item_count = parseInt(value);
                        } else if (name == 'distance') {
                            log('distance: ' + value);
                            $scope.config.distance = parseInt(value);
                        } else if (name == 'province_id') {
                            $scope.config.province_id = value;
                        } else if (name == 'calc_distance_algorithm') {
                            $scope.config.calc_distance_algorithm = value;
                        } else if (name == 'tbl_area_ver') {
                            $scope.config.tbl_area_ver = value;
                        } else if (name == 'tbl_outlettype_ver') {
                            $scope.config.tbl_outlettype_ver = value;
                        } else if (name == 'tbl_province_ver') {
                            $scope.config.tbl_province_ver = value;
                        } else if (name == 'tbl_zone_ver') {
                            $scope.config.tbl_zone_ver = value;
                        }
                    }
                }
                hideDlg();
                baseURL = buildURL($scope.config.protocol, $scope.config.ip, $scope.config.port, $scope.config.service_name);

                $scope.changeView('login');
            }, function (dberr) {
                showDlg(dberr.message, 'DB Error');
            });
        }

        //log('check network status...');
        //if (!isWeb) {            
        //    document.addEventListener('online', function () { isOnline() = true; }, false);
        //    document.addEventListener('offline', function () { isOnline() = false; }, false);
        //}
        //baseURL = buildURL($scope.config.protocol, $scope.config.ip, $scope.config.port, $scope.config.service_name);
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
        //$location.path('/login');
    }]);
