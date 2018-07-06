/*globals angular */
angular.module('appRoutes', [])
        .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
                $routeProvider
                        .when('/', {templateUrl: 'views/marketingSite/views/home.html', title: 'PSX Pay Per Call Tracking, Analytics, and Routing'})
                        .when('/affiliates', {templateUrl: 'views/marketingSite/views/affiliates.html', title: 'PSX Affiliates'})
                        .when('/ASE_16', {templateUrl: 'views/marketingSite/views/ASE_16.html', title: 'PSX at ASE 16'})
                        .when('/buyers', {templateUrl: 'views/marketingSite/views/buyers.html', title: 'PSX Call Centers and Advertisers'})
                        .when('/custom-call-center-software', {templateUrl: 'views/marketingSite/views/custom-call-center-software.html', title: 'PSX Custom Call Center Software'})
                        .when('/custom_call_center_software', {templateUrl: 'views/marketingSite/views/custom_call_center_software.html', title: 'PSX Custom Call Center Software'})
                        .when('/definitions', {templateUrl: 'views/marketingSite/views/definitions.html', title: 'PSX Definitions'})
                        .when('/features_affiliates', {templateUrl: 'views/marketingSite/views/features_affiliates.html', title: 'PSX Networks'})
                        .when('/features_buyers', {templateUrl: 'views/marketingSite/views/features_buyers.html', title: 'PSX Features for Advertisers and Call Centers'})
                        .when('/features_networks', {templateUrl: 'views/marketingSite/views/features_networks.html', title: 'PSX Features for Affiliate Networks'})
                        .when('/free', {templateUrl: 'views/marketingSite/views/free.html', title: 'PSX Free to Use'})
                        .when('/matchmaker', {templateUrl: 'views/marketingSite/views/matchmaker.html', title: 'PSX, the Matchmaker'})
                        .when('/networks', {templateUrl: 'views/marketingSite/views/networks.html', title: 'PSX Networks'})
                        .when('/next', {templateUrl: 'views/marketingSite/views/next.html', title: 'PSX Next'})
                        .when('/support', {templateUrl: 'views/marketingSite/views/support.html', title: 'PSX Support'})
                        .when('/tcpa', {templateUrl: 'views/marketingSite/views/tcpa.html', title: 'PSX and the TCPA'})
                        //.when('/', {templateUrl: 'views/marketingSite/views/home.html'})

                        .otherwise('/error', {templateUrl: 'views/marketingSite/views/error.html', title: 'PSX Error'})
                        .otherwise({templateUrl: 'views/marketingSite/views/error.html', title: 'PSX Error'});
                $locationProvider.html5Mode(false); // true for making hash invisible

            }])
        .config(['$locationProvider', function ($locationProvider) {
                $locationProvider.hashPrefix('!');
            }
        ])
        .run(['$rootScope', function ($rootScope) {
                $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
                    $rootScope.title = current.$$route.title;
                });
            }])