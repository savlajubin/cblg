angular.module('ContentModule', ['ContentService'])
        /**************************************  Static Page Handling Section   **************************************/
        /*@function : HomesCtrl
         * Creator   : SmartData
         * @created  : 09 July 2015
         * @purpose  : Content management (Home, About us, Contact us etc...)
         */

        .controller('HomesCtrl', ['$scope', function ($scope) {
                $scope.currentDate = new Date();
            }])

        .controller('styleCtrl', ['$http', '$route', '$location', '$scope', '$rootScope', 'CONSTANTS', '$filter', function ($http, $route, $location, $scope, $rootScope, CONSTANTS, $filter) {
                var styleYo = "<style>.loginForm .logo {background-color: #000;}"
                        //+ ".logo span{background-size: 95% 75%;background-repeat:no-repeat;background-position:center center; background-image: url('[LOGO_URL]')}"
                        + ".logo-mini{background-image: url('[MINI_LOGO_URL]')}"
                        + ".logo-lg{background-image: url('[LOGO_URL]')}"
                        + "</style>";

//            styleYo = String(styleYo).replace(/\[LOGO_URL]/g, 'assets/images/psx_non_io.png');
//            styleYo = String(styleYo).replace(/\[LOGO_URL]/g, 'assets/images/psx_new.png');
                styleYo = String(styleYo).replace(/\[LOGO_URL]/g, '/assets/images/psx_new_nonFPS.png');
                styleYo = String(styleYo).replace(/\[MINI_LOGO_URL]/g, '/assets/images/psx_small_dark.png');
                $scope.xxx = styleYo;
                $rootScope.routeReload = function () {
                    $route.reload();
                }
                $rootScope.goToNewLink = function (link) {
                    /*console.log(link)*/
                    $location.path(link);
                }
                $rootScope.backToDashboard = function () {
                    console.log('dahsboard');
                    $location.path('/' + $filter('lowercase')($rootScope.authenticatedUser.role_id.code) + '/dashboard');
                }

                var dontCheckOn = [
                    'localhost:3000',
                    'dev.psx.io:3000',
                    'dev.psx.io',
                    'psx.io:3000',
                    'psx.io'
                ];

                if (dontCheckOn.indexOf(location.host) == -1) {
                    $http.get('/whitelabelsettings')
                            .success(function (response) {
                                if (response.code == CONSTANTS.CODES.OK) {
                                    // .navbar-default {background-color: #262626;} // for header background
                                    // .navbar-default .navbar-nav > li > a, .navbar-default .navbar-nav > li > span {color: #fff;} // For header text color
                                    // .head-right-box {color: #fff;margin: 12px;} //For account balance text on header
                                    // .navbar-default .navbar-brand { color: #777777;} // for logo placeholder text.
                                    // header{color:[FONT_COLOR] !important;background-color: [BG_COLOR] !important} // For by default header element
                                    // footer{color:[FONT_COLOR] !important;background-color: [BG_COLOR] !important} footer .nav li a {color: [FONT_COLOR] !important;} // For footer elements & text links.
                                    // .tablehead{color:[FONT_COLOR] !important;background-color: [BG_COLOR] !important} // for table header background & font color
                                    // .gearbox {background-color: #616161;} // for right gear box.
                                    // .dropdown-menu > li > a {color:#} // for gearbox text color
                                    // .mrgbtp30 {color:} // for 404 error page color
                                    // .navbar-header {border-right: 2px solid #fff;} // for the left vertical seperation pipes
                                    // .navbar-right {border-left: 2px solid #fff;}  // for right vertical separation pipes
                                    // .login {background: none repeat scroll 0 0 #333;} // For first landing page CSS Login page

                                    if (response.data != null) {

                                        var fontcolor = response.data.lgn_setup_details.color_option.fontcolor;
                                        var bgcolor = response.data.lgn_setup_details.color_option.bgcolor;
                                        var logoURL = String(response.data.lgn_setup_details.logo).replace('public/', '/');
                                        var styleYo = "<style>.loginForm .logo {background-color: [BG_COLOR];}.logo{background-size: 100% 100%; background-image: url('[LOGO_URL]')}.login {background: none repeat scroll 0 0 [BG_COLOR] !important;} .text-muted{color:[FONT_COLOR] !important;} header{background-color: [BG_COLOR] !important}  footer{color:[FONT_COLOR] !important;background-color: [BG_COLOR] !important} footer .nav li a {color: [FONT_COLOR] !important;} .navbar-default {background-color: [BG_COLOR];} .navbar-default .navbar-nav > li > a, .navbar-default .navbar-nav > li > span {color: [FONT_COLOR] !important;} .head-right-box {color: [FONT_COLOR] !important;} .head-right-box a{color: [FONT_COLOR] !important;} .gearbox {background-color:[BG_COLOR] !important;} .tablehead{color:[FONT_COLOR] !important;background-color: [BG_COLOR] !important} table .header{background-color: [BG_COLOR] !important} .mrgbtp30 {color:[BG_COLOR] !important} .navbar-right {border-left: 2px solid [FONT_COLOR] !important;} .navbar-header {border-right: 2px solid [FONT_COLOR] !important;}</style>";

                                        styleYo = String(styleYo).replace(/\[FONT_COLOR]/g, fontcolor);
                                        styleYo = String(styleYo).replace(/\[BG_COLOR]/g, bgcolor);
                                        styleYo = String(styleYo).replace(/\[LOGO_URL]/g, logoURL);

                                        $scope.xxx = styleYo;

                                    }
                                }
                            })
                            .error(function (response, status) {
                                console.log("Error Occured!");
                            });
                }

                $http.get('/api_user/get_roleId')
                        .success(function (response) {
                            $rootScope.roleIDs = response.data;
                        })
                        .error(function (response, status) {
                            console.log("Error Occured!");
                        });
            }]);
/**************************************  Static Page Handling Section   **************************************/
