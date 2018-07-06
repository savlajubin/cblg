var pUser;// = pUser ? pUser : 'fakeDontRemove';
var pPass;// = pUser ? pUser : 'fakeDontRemove';

angular.module('LoginModule', ['UserService', 'InternalCommunicationService', 'LoggerService', 'ngBusy'])

        /**************************************   User Module Section   **************************************/
        /*@function : AuthenticationsCtrl
         * Creator   : SmartData
         * @created  : 09 July 2015
         * @purpose  : User management (login, register, forgotton password etc...)
         */
        .controller('AuthenticationsCtrl', ['$scope', 'User', '$rootScope', '$location', '$routeParams', 'logger', 'CONSTANTS', '$cookieStore', '$window', '$filter', function ($scope, User, $rootScope, $location, $routeParams, logger, CONSTANTS, $cookieStore, $window, $filter) {
                $scope.user = true;

                // Providing the facilities of login to user
                $scope.login = function (user) {
                    if (!$scope.form.$valid) {
                        logger.logError("Please fill all the required fields");
                        return false;
                    }
                    User.signIn().save(user, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            if ($cookieStore.get("url")) {
                                var url = $cookieStore.get("url").split('/');
                                var role = $filter('lowercase')(response.data.role_id.code);
                                var code = ['admin', 'lgn', 'lg', 'lb', 'pa', 'advcc'];
                                if (url[1] == role || code.indexOf(url[1]) == -1) {
                                    var redirectUrl = $cookieStore.get("url");
                                    $cookieStore.put("url", '');
                                    $window.location.href = '#!' + redirectUrl;
                                } else {
                                    toastr.error('You are not authorized to access this URL', 'Unauthorized', {closeButton: !0, timeOut: 10000})
                                }
                            }
                            logger.logSuccess(response.message);
                            $rootScope.authenticated = true;
                            $rootScope.authenticatedUser = response.data;

                            switch (response.data.role_id.code) {
                                case "ADMIN" :
                                    $rootScope.authenticatedAdmin = true;
                                    $location.path("/admin/dashboard");	// admin section
                                    break;
                                case "LGN" :
                                    $rootScope.authenticatedLeadGenNew = true;
                                    $location.path("/lgn/dashboard"); // lead generation network owner section
                                    break;
                                case "LB" :
                                    $rootScope.authenticatedLeadBuyer = true;
                                    $location.path("/lb/dashboard"); // lead buyer section
                                    break;
                                case "LG" :
                                    $rootScope.authenticatedLeadSeller = true;
                                    $location.path("/lg/dashboard"); // lead generator section
                                    break;
                                case "PA" :
                                    if (response.data.webphone_details && response.data.webphone_details.plivo_sip_username) {
                                        console.log(123, response.data.webphone_details.plivo_sip_username);
                                        console.log(768, response.data.webphone_details.plivo_sip_password);

                                        pUser = response.data.webphone_details.plivo_sip_username;
                                        pPass = response.data.webphone_details.plivo_sip_password;
                                    } else {
                                        pUser = 'fakeDontRemove';
                                        pPass = 'fakeDontRemove';
                                    }
                                    $rootScope.authenticatedPhoneAgent = true;
                                    $location.path("/pa/dashboard"); // for phone agent section
                                    break;
                                case "ADVCC" :
                                    $rootScope.authenticatedADVCC = true;
                                    $location.path("/advcc/dashboard"); // for phone agent section
                                    break;
                                default :
                                    User.logout().get();
                                    break;
                            }
                        } else {
                            $scope.contents = null;
                            logger.logError(response.message);
                        }
                    });
                }

                $scope.whiteLabelLogin = function (user) {
                    if (!$scope.form.$valid) {
                        logger.logError("Please fill all the required fields");
                        return false;
                    }
                    User.whitelable_signin().save(user, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            if ($cookieStore.get("url")) {
                                var url = $cookieStore.get("url").split('/');
                                var role = $filter('lowercase')(response.data.role_id.code);
                                var code = ['admin', 'lgn', 'lg', 'lb', 'pa', 'advcc'];
                                if (url[1] == role || code.indexOf(url[1]) == -1) {
                                    var redirectUrl = $cookieStore.get("url");
                                    $cookieStore.put("url", '');
                                    $window.location.href = '#!' + redirectUrl;
                                } else {
                                    toastr.error('You are not authorized to access this URL', 'Unauthorized', {closeButton: !0, timeOut: 10000})
                                }
                            }
                            logger.logSuccess(response.message);
                            $rootScope.authenticated = true;
                            $rootScope.authenticatedUser = response.data;

                            switch (response.data.role_id.code) {
                                case "LB" :
                                    $rootScope.authenticatedLeadBuyer = true;
                                    $location.path("/lb/dashboard"); // lead buyer section
                                    break;
                                case "LG" :
                                    $rootScope.authenticatedLeadSeller = true;
                                    $location.path("/lg/dashboard"); // lead generator section
                                    break;
                                case "PA" :
                                    if (response.data.webphone_details && response.data.webphone_details.plivo_sip_username) {
                                        console.log(123, response.data.webphone_details.plivo_sip_username);
                                        console.log(768, response.data.webphone_details.plivo_sip_password);

                                        pUser = response.data.webphone_details.plivo_sip_username;
                                        pPass = response.data.webphone_details.plivo_sip_password;
                                    } else {
                                        pUser = 'fakeDontRemove';
                                        pPass = 'fakeDontRemove';
                                    }
                                    $rootScope.authenticatedPhoneAgent = true;
                                    $location.path("/pa/dashboard"); // for phone agent section
                                    break;
                                case "ADVCC" :
                                    $rootScope.authenticatedADVCC = true;
                                    $location.path("/advcc/dashboard"); // for phone agent section
                                    break;
                                default :
                                    User.logout().get();
                                    break;
                            }
                        } else {
                            $scope.contents = null;
                            logger.logError(response.message);
                        }
                    });
                }

                // Providing the facilities of forgotton password to user
                $scope.forgot_password = function (user) {
                    User.forgot_password().save(user, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            logger.logSuccess(response.message);
                        } else {
                            $scope.contents = null;
                            logger.logError(response.message);
                        }
                    });
                }

                // Providing the facilities of change password to user
                $scope.changePassword = function (user) {
                    User.changePassword().save(user, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            logger.logSuccess(response.message);
                        } else {
                            $scope.contents = null;
                            logger.logError(response.message);
                        }
                    });
                }
                // Providing user to activate their account
                $scope.activate_account = function (user) {
                    user.token = $routeParams.token
                    User.activate_account().save(user, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            $location.path('/');
                            logger.logSuccess(response.message);
                        } else {
                            $scope.User = {};
                            logger.logError(response.message);
                        }
                    });
                }

                // Providing user to activate their account
                $scope.reset_password = function (user) {
                    user.token = $routeParams.token
                    User.reset_password().save(user, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            logger.logSuccess(response.message);
                        } else {
                            $scope.resetData = {};
                            logger.logError(response.message);
                        }
                    });
                }

            }])
        .controller('ThirdPartyRegistrationCtrl', ['$scope', 'User', '$rootScope', '$location', '$routeParams', 'logger', 'CONSTANTS', function ($scope, User, $rootScope, $location, $routeParams, logger, CONSTANTS) {
                $scope.user = true;
                $scope.registerInfo = {};
                // Providing the facilities of register users through third party sites.
                $scope.thirdparty_registerLB = function (user) {
                    if (!$scope.registartionLB_form.$valid) {
                        logger.logError("Please fill all the required fields");
                        return false;
                    }


                    $scope.success = $scope.error = null;
                    user.rolecode = "LB"
                    User.whitelable_signup().save(user, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            $scope.contents = response.data;
                            logger.logSuccess(response.message)
                        } else {
                            $scope.contents = null;
                            logger.logError(response.message);
                        }
                    });
                }

                // Providing the facilities of register users through third party sites.
                $scope.thirdparty_registerLS = function (user) {
                    if (!$scope.registartionLS_form.$valid) {
                        logger.logError("Please fill all the required fields");
                        return false;
                    }

                    $scope.success = $scope.error = null;
                    user.rolecode = "LG"
                    User.whitelable_signup().save(user, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            $scope.contents = response.data;
                            logger.logSuccess(response.message);
                        } else {
                            $scope.contents = null;
                            logger.logError(response.message);
                        }
                    });
                }

                $scope.thirdparty_registerLGN = function (user) {
                    if (!$scope.registartion_form.$valid) {
                        logger.logError("Please fill all the required fields");
                        return false;
                    }

                    user.role_id = $rootScope.roleIDs["LGN"] || '559a6a1723405677c3d2d436';  // hard coded for LGN User
                    User.signUpLGN().save(user, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            $location.path('/');
                            logger.logSuccess(response.message);
                            $scope.selected_existing_user = response.data._id;
                        } else {
                            logger.logError(response.message);
                        }
                    });
                }

                $scope.getInviteInfo = function () {
                    User.getInviteInfo($routeParams.inviteid).get(function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            $scope.registerInfo = {email: response.data.email, role: response.data.role, parent_id: response.data.lgn_id};
                        } else {
                            logger.logError(response.message);
                        }
                    });
                };

                $scope.invite_register = function (user) {
                    if (!$scope.invite_register_form.$valid) {
                        logger.logError("Please fill all the required fields");
                        return false;
                    }
                    user.role_id = $rootScope.roleIDs[user.role];  // hard coded for LGN User

                    User.inviteSignUp().save(user, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            $location.path('/');
                            logger.logSuccess(response.message);
                        } else {
                            logger.logError(response.message);
                        }
                    });
                }

            }]);