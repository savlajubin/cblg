angular.module('UserModule', ['UserService', 'ModuleService', 'InternalCommunicationService', 'LoggerService', 'ngFileUpload', 'ngTable'])

        /**************************************   User Module Section   **************************************/
        /*@function : UsersCtrl
         * Creator   :Smartdata
         * @created  : 09 July 2015
         * @modified  : 1 Oct 2015
         * @purpose  : User management (login, register, forgotton password etc...)
         */
        .controller('UsersCtrl', ['$scope', 'User', 'Module', '$location', 'logger', 'CONSTANTS',function ($scope, User, Module, $location, logger, CONSTANTS) {

            // Providing the facilities of change password to user
            $scope.showUserList = function (roleCode) {
                /*roleCode = $routeParams.code*/
                $scope.roleCode = roleCode;
                User.listUser().get({id: roleCode}, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.userList = response.data;
                        Module.pagination(response.data)
//
                    } else {
                        Module.pagination(response.data)
                        logger.logError(response.message);
                    }

                });
                $scope.roleCode = roleCode;
                $scope.showViewUser = false;
                $scope.showAddPhone = false;
                $scope.showListView = true;
                $scope.manageAccess = false;
            };


            // Providing the facilities of change password to user
            $scope.userView = function (ids) {
                $scope.id = ids
                User.findByIDUser().get({id: $scope.id}, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.userInfo = response.data[0];
                    } else {
                        logger.logError(response.message);
                    }
                });
                $scope.showListView = false;
                $scope.showAddPhone = false;
                $scope.showViewUser = false;
                $scope.manageAccess = false;
            }


            // delete the users
            $scope.deleteUser = function (userids, roleCode) {
                swal({
                    title: CONSTANTS.SWAL.deletetitle,
                    text: CONSTANTS.SWAL.deletetext,
                    type: CONSTANTS.SWAL.type,
                    showCancelButton: CONSTANTS.SWAL.showCancelButton,
                    confirmButtonColor: CONSTANTS.SWAL.confirmButtonColor,
                    confirmButtonText: CONSTANTS.SWAL.deleteconfirmButtonText,
                    closeOnConfirm: CONSTANTS.SWAL.closeOnConfirm},
                function () {

                    User.deleteUser().save({'user_ids': [{'id': userids, 'rolecode': roleCode}]}, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            Module.pagination(response.data)
                            logger.logSuccess(response.message);
                        } else {
                            logger.logError(response.message);
                        }
                    });

                });

            }


            // change the status of module
            $scope.statusUser = function (user_id, status, rolecode) {
                var user = {
                    'rolecode': rolecode,
                    'user_id': user_id,
                    'status': (status == 'active') ? 'deactive' : 'active'
                }
                User.statusUser().save(user, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.userList = response.data;
                        Module.pagination(response.data)
                        logger.logSuccess(response.message);
                    } else {
                        logger.logError(response.message);
                    }
                });
            }

            $scope.verifyADVCC = function (user_id, verified, rolecode) {
                var user = {
                    'rolecode': rolecode,
                    'user_id': user_id,
                    'verified': (verified == 'true') ? 'false' : 'true'
                }
                User.verifyADVCC().save(user, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.userList = response.data;
                        Module.pagination(response.data)
                        logger.logSuccess(response.message);
                    } else {
                        logger.logError(response.message);
                    }
                });
            }

            $scope.manageAccessLevelForm = function () {
                Module.listModule().get(function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.moduleList = response.data;
                        $scope.success = null;
                    } else {
                        logger.logError(response.message);
                    }
                });

            }

            $scope.editUser = function (user) {
                delete user.role_id;
                delete user.parent_id;
                User.saveUserInfo().save(user, function (response) {
                    if (response.result == CONSTANTS.CODES.OK) {
                        $scope.userList = response.data;
                        window.history.back();
                        logger.logSuccess(response.message);
                    } else {
                        logger.logError(response.message);
                    }
                });
            }

            // back process
            $scope.back = function () {
                window.history.back();
            }

            $scope.goToLink = function (url) {
                $location.path(url);
            }

            // pagination
            $scope.curPage = 0;
            $scope.pageSize = 5;

            $scope.numberOfPages = function ()
            {
                return Math.ceil($scope.datalists.length / $scope.pageSize);
            };

            $scope.getDataByDate = function (dateData, val) {
                dateData.role = $scope.roleCode;
                User.searchByCreated().save(dateData, function (response) {
                    if (response.code == 200) {
                        Module.pagination(response.data);
                    } else {
                        Module.pagination({});
                    }
                });
            }

            $scope.changeOutboundSupport = function (user_id, outbound, rolecode) {
                var user = {
                    'rolecode': rolecode,
                    'user_id': user_id,
                    'outbound_support': (outbound == true) ? false : true
                }
                User.changeOutboundSupport().save(user, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.userList = response.data;
                        Module.pagination(response.data)
                        logger.logSuccess(response.message);
                    } else {
                        logger.logError(response.message);
                    }
                });
            }

        }])

        /**************************************   Internal communication Start   **************************************/
        .controller('InternalCommunicationCtrl  ', ['$scope', '$location', 'User', 'InternalCommunication', 'CONSTANTS', function ($scope, $location, User, InternalCommunication, CONSTANTS) {


            $scope.list_message = function () {
                $scope.compose_section = false;
                $scope.list_message_section = true;
                $scope.view_message_section = false;
                InternalCommunication.ListMessage().get(function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        //console.log(response);
                        $scope.messageList = response.data;
                        logger.logSuccess(response.message);
                        //console.log("Success : " + response.message);
                    } else if (response.code == 404) {
                        logger.logError(response.message);
                        //console.log('Error :' + response.message);
                    }

                });
            };
            $scope.list_message();


            $scope.compose = function () {
                $scope.compose_section = true;
                $scope.list_message_section = false;
                $scope.view_message_section = false;
                // Find all users for listings
                User.listUser().get({id: 'ALL'}, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.userListDetails = response.data;
                    }
                });

            }

            $scope.sendMessage = function (mail_data) {
                //console.log(mail_data);
                InternalCommunication.SendMessage().save(mail_data, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.compose_section = false;
                        $scope.list_message_section = true;
                        $scope.view_message_section = false;
                        logger.logSuccess(response.message);
                        //console.log("Success : " + response.message);
                    } else {
                        logger.logError(response.message);
                        //console.log('Error :' + response.message);
                    }
                });

            }

            $scope.view_message = function (messageData) {
                $scope.viewMessageData = messageData;
                $scope.compose_section = false;
                $scope.list_message_section = false;
                $scope.view_message_section = true;
                // // Find message details
                // InternalCommunication.findByIDMessage().get({'id':message_id},function(response){
                //          if (response.code == CONSTANTS.CODES.OK) {
                //                 // $scope.userListDetails = response.data;
                //                 //console.log(response);
                //             }
                //      });
            }

            $scope.discard = function () {
                $scope.mail = {};
                $scope.compose_section = false;
                $scope.list_message_section = true;
                $scope.view_message_section = false;
            }

        }])
        .controller('OnboardLgnCtrl', ['$scope', '$http', '$route', 'User', 'logger', 'Upload', '$timeout', '$rootScope', 'CONSTANTS', function ($scope, $http, $route, User, logger, Upload, $timeout, $rootScope, CONSTANTS) {
            $scope.loginInfo = {};
            $scope.echeck = {};
            $scope.cc_details = {};
            $scope.supports = {};
            $scope.lgn_setUpData = {};
            // Code section for tabs open & close.
            $scope.tab = 1;
            $scope.countries = CONSTANTS.countryList;

            $scope.setTab = function (tabId) {
                $scope.tab = tabId;
                $scope.common_msg = false;
                //console.log(tabId);
                switch (tabId) {
                    case 1 :
                        // call contact info method
                        $scope.get_contactInfo();
                        break;
                    case 2 :
                        // call login credential  method
                        $scope.get_loginCredentials();
                        break;
                    case 3 :
                        // call echeck info
                        $scope.get_echeckInfo();
                        break;
                    case 4 :
                        // call credit card info
                        $scope.get_cardDetails();
                        break;
                    case 5 :
                        // hidden for now
                        $scope.get_autorecharge();
                        break;
                    case 6 :
                        // hidden for now
                        break;
                    case 7 :
                        // call it supports
                        $scope.get_supports();
                        break;
                    case 8 :
                        // call it supports
                        $scope.getOutboundSupport();
                        break;
                    case 9 :
                        // call set up LGN
                        $scope.get_lgnsetup();
                        break;
                    case 10 :
                        // call contracts
                        $scope.get_contracts();
                        break;
                    case 11 :
                        // call contracts
                        $scope.get_webphoneDetails();
                        break;
                    case 12 :
                        // call contracts
                        $scope.get_termsandconditions();
                        break;

                    default :

                        break;
                }
            };

            $scope.isSet = function (tabId) {
                return $scope.tab === tabId;
            };
            // tabs section ends

            // Method to get the contact Info details on click of tab1 LGN Section

            $scope.get_contactInfo = function () {


                User.get_contactInfo().get({'id': $scope.selected_existing_user}, function (response) {

                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.contactInfo = response.data ? response.data : {};
                        console.log('$scope.contactInfo ', $scope.contactInfo);
                        _.each($scope.countries, function (country) {
                            country.ticked = (response.data.country == country.name) ? true : false;
                        });
                        console.log('$scope.countries ',$scope.countries);

                        //console.log("Success : " + response.message);
                    } else if (response.code == 404) {
                        //console.log('Error :' + response.message);
                    }

                });

            }


            // Method to get the all details of login data. tab2 LGN Section
            $scope.get_loginCredentials = function () {
                //console.log('get_loginCredentials');
                User.get_loginCredentials().get({'id': $scope.selected_existing_user}, function (response) {

                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.loginInfo.loginemail = response.data ? response.data.email : {};
                        // $scope.loginInfo.loginpswd= response.data? response.data.password: {};
                        //console.log("Success : " + response.message);
                    } else if (response.code == 404) {
                        //console.log('Error :' + response.message);
                    }

                });
            }

            // Method to get the all details of echeck information. tab3 LGN Section
            $scope.get_echeckInfo = function () {
                //console.log("get_echeckInfo");
                User.get_echeckInfo().get({'id': $scope.selected_existing_user}, function (response) {

                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.echeck = response.data ? response.data.echeckInfo : {};
                        $scope.echeck.caccno = (response.data && response.data.echeckInfo) ? response.data.echeckInfo.acc_no : '';
                        var newZip = $scope.echeck.bank_zip;
                        console.log('newZip', newZip);
                        $scope.echeck.bank_zip = (newZip) ? newZip.toString().substring(0, 5) : '';
                        console.log('$scope.echeck.bank_zip', $scope.echeck.bank_zip);
                        //console.log("Success : " + response.message);
                    } else if (response.code == 404) {
                        //console.log('Error :' + response.message);
                    }

                });
            }

            // Method to get the credit card details on click of tab4 LGN Section

            $scope.get_cardDetails = function () {

                User.get_cardDetails().get({'id': $scope.selected_existing_user}, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.saved_cards = response.data ? response.data.credit_card_details : {};
                        $scope.cc_details = {};
                        // $scope.cc_details.allow=response.data.credit_card_details.bal_Down? true : false;
                        // //console.log($scope.cc_details);
                        //console.log("Success : " + response.message);
                    } else if (response.code == 404) {
                        //console.log('Error :' + response.message);
                    }

                });

            }

            // Method to get the auto recharge details on click of tab4 LGN Section
            $scope.get_autorecharge = function () {

                User.get_autorecharge().get({'id': $scope.selected_existing_user}, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.rechargeData = {};
                        $scope.rechargeData = (response.data && response.data.auto_recharge_details) ? response.data.auto_recharge_details : {};
                        $scope.rechargeData.allow = (response.data && response.data.auto_recharge_details.bal_Down) ? true : false;
                        $scope.selectCreditCards = [];
                        $scope.echeckAccount = (response.data && response.data.echeckInfo) ? response.data.echeckInfo : '';
                        var temp;
                        if (!$scope.echeckAccount.credit_agree) {
                            temp = {
                                id: $scope.echeckAccount.acc_no,
                                acc_no: $scope.echeckAccount.acc_no,
                                group: 'Echeck Account'
                            }
                            $scope.selectCreditCards.push(temp);
                        }
                        $scope.creditCards = response.data.credit_card_details;
                        angular.forEach($scope.creditCards, function (value) {
                            temp = '';
                            temp = {
                                id: value._id,
                                acc_no: value.card_no,
                                group: 'Credit Cards'
                            }
                            $scope.selectCreditCards.push(temp);
                        });

                    } else if (response.code == 404) {
                        //console.log('Error :' + response.message);
                    }

                });

            }


            // Method to get the all details of supports information. tab5 LGN Section
            $scope.get_supports = function () {
                //console.log("get_supports");
                User.get_supports().get({'id': $scope.selected_existing_user}, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.supports = response.data ? response.data.It_supportSettings : {};
                        //console.log("Success : " + response.message);
                    } else if (response.code == 404) {
                        //console.log('Error :' + response.message);
                    }

                });
            }
            // Method to get the all details of supports information. tab5 LGN Section
            $scope.getOutboundSupport = function () {
                console.log("get_supports");
                User.getOutboundSupport().get({'id': $scope.selected_existing_user}, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.outbound = response.data;
                        console.log($scope.outbound);
                    } else if (response.code == 404) {
                        console.log('Error :' + response.message);
                    }

                });
            }

            // Method to get the all details of set up LGN. tab6 LGN Section
            $scope.get_lgnsetup = function () {
                //console.log("get_lgnsetup" + $scope.selected_existing_user);
                User.get_lgnsetup().get({'id': $scope.selected_existing_user}, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.custom = response.data ? response.data.lgn_setup_details : {};
                        if ($scope.custom.enable_whitelabel) {
                            $scope.custom = {enable_whitelabel: true};
                            $scope.whitelabel = false;
                        }
                        $scope.custom.bgcolor = response.data ? response.data.lgn_setup_details.color_option.bgcolor : '#000';
                        $scope.custom.fontcolor = response.data ? response.data.lgn_setup_details.color_option.fontcolor : '#fff';
                        //console.log("Success : " + response.message);
                    } else if (response.code == 404) {
                        //console.log('Error :' + response.message);
                    }

                });
            }

            // Method to get the all details of set up LGN. tab7 LGN Section
            $scope.get_contracts = function () {
                //console.log("get_contracts");
                User.get_contracts().get({'id': $scope.selected_existing_user}, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.contracts = response.data.contracts;
                    } else if (response.code == 404) {
                        //console.log('Error :' + response.message);
                    }

                });
            }

            // Method to get the all plivo details  tab10 LGN Section
            $scope.get_webphoneDetails = function () {
                User.get_webphoneDetails().get({'id': $scope.selected_existing_user}, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.webphoneInfo = response.data.webphone_details;
                    } else if (response.code == 404) {
                        //console.log('Error :' + response.message);
                    }
                });
            }

            // Method to get the all plivo details  tab10 LGN Section
            $scope.save_webphoneDetails = function (data) {
                if (!$scope.plivo_val.$valid) {
                    logger.logError("Please fill all the required fields");
                    return false;
                }

                $scope.sendData = {}
                $scope.sendData.webphoneDetails = data;
                $scope.sendData.user_id = $scope.selected_existing_user;
                User.save_webphoneDetails().save($scope.sendData, function (response) {
                    $scope.common_msg = false;
                    if (response.result == CONSTANTS.CODES.OK) {
                        logger.logSuccess(response.message);
                        $scope.termss = true;
                        $scope.setTab(12)
                    } else if (response.result == CONSTANTS.CODES.Error) {
                        logger.logError(response.message);
                    }

                });
            }

            $scope.get_termsandconditions = function () {
                console.log("terms and conditions");
                var role = "LGN";
                User.checktermsandcontions(role).get(function (response) {
                    var data = angular.fromJson(response);
                    $scope.title = "Lead Generator Network";
                    $scope.terms = data.data[0].body;


                })
            }
            $scope.check = {
                value: false
            }
            $scope.acceptterms = function (value, e_signature) {
                if (value == false) {
                    logger.logError("You have not Accept terms and conditions");
                }
                else if (value == true) {
                    var id = $scope.selected_existing_user;
                    User.acceptterms().save({'value': value, 'id': id, 'e_signature': e_signature}, function (response) {
                        console.log(response);
                        if (response.code == 200) {
                            logger.logSuccess("You accept terms and conditions");
                            $scope.ip_add = response.data.ip_address;
                            $scope.current_date = new Date();
                            $scope.congrats = true;
                            $scope.setTab(13)

                        }
                        else {
                            logger.logError("OOps! Something went wrong");
                        }
                    })
                }


            }
//for LB
            $scope.get_termsandconditionsLB = function () {
                console.log("terms and conditions");
                var role = "LB";
                User.checktermsandcontionsLB(role).get(function (response) {
                    var data = angular.fromJson(response);
                    $scope.title = "Lead Byer";
                    $scope.terms = data.data[0].body;


                })
            }
            $scope.check = {
                value: false
            }
            $scope.accepttermsLB = function (value) {
                console.log(e_signature1);
                if (value == false) {
                    logger.logError("You have not Accept terms and conditions");
                }
                else if (value == true) {
                    var id = $scope.selected_existing_user;
                    User.accepttermsLB().save({'value': value, 'id': id}, function (response) {
                        console.log(response);
                        if (response.code == 200) {
                            logger.logSuccess("You accept terms and conditions");

                            $scope.setTab(13);
                            $scope.congrats = true;

                        }
                        else {
                            logger.logError("OOps! Something went wrong");
                        }
                    })
                }


            }
//  **********************  Submit tab form data one by one starts here *****************************
            $scope.changeLoginCredentials = function (data) {

                if (!data.currentpassword && !data.password) {
                    return false;  // nothing to perform if no data entry for chnage password.
                } else {

                    if (!$scope.login_val.$valid) {
                        logger.logError("Please fill all the required fields");
                        return false;
                    }

                    data.user_id = $scope.selected_existing_user;
                    $http({
                        method: 'POST',
                        url: '/api_admin/changeLoginCredentials',
                        data: data,
                    }).success(function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            logger.logSuccess(response.message);
                            //console.log("Success : " + response.message);
                        } else if (response.code == 404) {
                            $scope.setTab(2);  // back to the same tab if error occurs
                            logger.logError(response.message);
                            //console.log('Error :' + response.message);
                        }
                    });

                }
            }


            // Save user contact info tab data LGN Section
            $scope.submitContactInfo = function (data) {

                if (!$scope.contact_info.$valid) {
                    logger.logError("Please fill all the required fields");
                    return false;
                }

                data.country = (data.country[0].name)?data.country[0].name:data.country;
                data.user_id = $scope.selected_existing_user;
                $http.post('/user_profile/save_contact_details', data)
                        .success(function (response, status, headers, config) {
                            if (response.result == CONSTANTS.CODES.OK) {
                                logger.logSuccess(response.message);
                                //console.log("Success : " + response.message);
                            } else if (response.result == 404) {
                                logger.logError(response.message);
                                //console.log('Error :' + response.message);
                            }
                        })
                        .error(function (response, status) {
                            logger.logError("Error!");
                        })
            }


            // Method used to populate bank details LGN Section
            $scope.populate_bankDetails = function () {
                User.populate_bankDetails().get({routingno: $scope.echeck.routing_no}, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        //console.log(response);
                        var newZip = response.data.bank_zip;
                        // newZip.toString()substring(0, 4);
                        $scope.echeck.bank_name = response.data.bank_name;
                        $scope.echeck.bank_phone = response.data.bank_phone;
                        $scope.echeck.bank_zip = newZip.toString().substring(0, 5);
                        //$scope.echeck.bank_zip = response.data.bank_zip;
                    } else if (response.code == 404) {
                        $scope.echeck.bank_name = '';
                        $scope.echeck.bank_phone = '';
                        $scope.echeck.bank_zip = '';
                        //console.log('Error :' + response.message);
                    }

                });
            }

            // Method to save the echeck details LGN Section

            $scope.submitEcheck = function (Echeckdata) {
                if (!$scope.echeck_info.$valid) {
                    if (!Echeckdata.credit_agree) {
                        logger.logError("Please fill all the required fields");
                        return false;
                    }
                }
                Echeckdata.user_id = $scope.selected_existing_user;

                $http.post('/user_profile/add_echeckInfo', Echeckdata)
                        .success(function (response, status, headers, config) {
                            if (response.result == 200) {
                                logger.logSuccess(response.message);
                                $scope.setTab(4);
                                //console.log("Success : " + response.message);
                            } else if (response.result == 404) {
                                logger.logError(response.message);
                                //console.log('Error :' + response.message);
                            }
                        })
                        .error(function (response, status) {
                            logger.logError("Error!");
                        })

            }

            // Method to save the credit card details of user LGN Section

            $scope.submitCreditCard = function (CreditCard) {
                if (!$scope.echeck_info2.$valid || $scope.CC_validataion_err) {
                    logger.logError("Please fill all the required fields");
                    return false;
                }
                //console.log(CreditCard.card_no);
                CreditCard.user_id = $scope.selected_existing_user;
                // check for the empty data entry when there are saved cards.
                if (CreditCard.card_no == undefined) {
                    $scope.setTab(5)
                    return false;
                }

                $http.post('/user_profile/add_creditCard', CreditCard)
                        .success(function (response, status, headers, config) {
                            if (response.result == CONSTANTS.CODES.OK) {
                                logger.logSuccess(response.message);
                                $scope.setTab(5)
                                $('#ccNum').removeClass($scope.currentCC_class); // reset the applied class for CC
                            } else if (response.result == 404) {
                                logger.logError(response.message);
                            }
                        })
                        .error(function (response, status) {
                            logger.logError("Error!");
                        })

            }

            // Method to make credit card primary LGN Section
            $scope.make_primary = function (cardData) {

                cardData.user_id = $scope.selected_existing_user;

                $http.post('/user_profile/makeCard_primary', cardData)
                        .success(function (response, status, headers, config) {
                            if (response.result == CONSTANTS.CODES.OK) {
                                logger.logSuccess(response.message);
                                $scope.get_cardDetails();  //called for updated list data
                                //console.log("Success : " + response.message);
                            } else if (response.result == 404) {
                                logger.logError(response.message);
                                //console.log('Error :' + response.message);
                            }
                        })
                        .error(function (response, status) {
                            logger.logError("Error!");
                        })

            }

            // Method to make credit card primary LGN Section
            $scope.remove_card = function (card_id) {
                var postData = {'card_id': card_id, 'user_id': $scope.selected_existing_user};

                $http.post('/user_profile/remove_card', postData)
                        .success(function (response, status, headers, config) {
                            if (response.result == CONSTANTS.CODES.OK) {
                                logger.logSuccess(response.message);
                                $scope.get_cardDetails();  // called for updated list
                                //console.log("Success : " + response.message);
                            } else if (response.result == 404) {
                                logger.logError(response.message);
                                //console.log('Error :' + response.message);
                            }
                        })
                        .error(function (response, status) {
                            logger.logError("Error!");
                        })

            }

            // Method to save the auto recharge details LGN Section

            $scope.submitAutorecharge = function (RechargeData) {

                RechargeData.user_id = $scope.selected_existing_user;

                $http.post('/user_profile/add_rechargeData', RechargeData)
                        .success(function (response, status, headers, config) {
                            if (response.result == CONSTANTS.CODES.OK) {
                                logger.logSuccess(response.message);
                                //console.log("Success : " + response.message);
                            } else if (response.result == 404) {
                                logger.logError(response.message);
                                //console.log('Error :' + response.message);
                            }
                        })
                        .error(function (response, status) {
                            logger.logError("Error!");
                        })

            }

            // Method to save the It support settings LGN Section

            $scope.submitItSupprot = function (supportData) {
                if (!$scope.support_form.$valid) {
                    logger.logError("Please fill all the required fields");
                    return false;
                }
                //console.log(supportData);
                supportData.user_id = $scope.selected_existing_user;

                $http.post('/user_profile/add_supportData', supportData)
                        .success(function (response, status, headers, config) {
                            if (response.result == CONSTANTS.CODES.OK) {
                                $scope.setTab(8);
                                logger.logSuccess(response.message);
                                //console.log("Success : " + response.message);
                            } else if (response.result == 404) {
                                logger.logError(response.message);
                                //console.log('Error :' + response.message);
                            }
                        })
                        .error(function (response, status) {
                            logger.logError("Error!");
                        })

            }

            $scope.submitOutboundSupprot = function (supportData) {
                if (!$scope.outbound_form.$valid) {
                    logger.logError("Please fill all the required fields");
                    return false;
                }
                console.log('herererere');
                supportData.user_id = $scope.selected_existing_user;

                $http.post('/user_profile/add_outboundSupport', supportData)
                        .success(function (response, status, headers, config) {
                            if (response.result == CONSTANTS.CODES.OK) {
                                logger.logSuccess(response.message);
                                $scope.setTab(9);
                                //console.log("Success : " + response.message);
                            } else if (response.result == 404) {
                                logger.logError(response.message);
                                //console.log('Error :' + response.message);
                            }
                        })
                        .error(function (response, status) {
                            logger.logError("Error!");
                        })

            }


            // Save company profile LGN Section
            $scope.submitLgnSetUp = function (data) {
                console.log(data);

                if (!data.enable_whitelabel && !$scope.custom_val.$valid) {
                    logger.logError("Please fill all the required fields");
                    return false;
                }
                if (data && data.logo && typeof data.logo.size != 'undefined') {
                    Upload.upload({
                        url: '/user_profile/save_company_details',
                        file: data.logo || [],
                        fields: {'existing_user_id': $scope.selected_existing_user, 'companfy_name': data.company_name, 'domain_url': data.domain_url, 'owner_email': data.owner_email, 'owner_name': data.owner_name, 'owner_phone': data.owner_phone, 'support_email': data.support_email, 'footer_content': data.footer_content, 'enable_whitelabel': data.enable_whitelabel, 'bgcolor': data.color_option.bgcolor, 'fontcolor': data.color_option.fontcolor}
                    }).success(function (data, status, headers, config) {
                        if (data.result == CONSTANTS.CODES.OK) {
                            logger.logSuccess(data.message);
                            $scope.setTab(10);
                        } else if (data.result == CONSTANTS.CODES.notFound) {
                            logger.logError(data.message);
                        }
                    })
                } else {
                    Upload.upload({
                        url: '/user_profile/save_company_details',
                        fields: {'existing_user_id': $scope.selected_existing_user, 'company_name': data.company_name, 'domain_url': data.domain_url, 'owner_email': data.owner_email, 'owner_name': data.owner_name, 'owner_phone': data.owner_phone, 'support_email': data.support_email, 'footer_content': data.footer_content, 'enable_whitelabel': data.enable_whitelabel, 'bgcolor': (data.color_option) ? data.color_option.bgcolor : '', 'fontcolor': (data.color_option) ? data.color_option.fontcolor : ''}}).success(function (data, status, headers, config) {
                        if (data.result == CONSTANTS.CODES.OK) {
                            logger.logSuccess(data.message);
                            $scope.setTab(10);
                        } else if (data.result == CONSTANTS.CODES.notFound) {
                            logger.logError(data.message);
                        }
                    });
                }


            }

            $scope.onLogoFileSelect = function ($files) {
                // //console.log($files);
                // $scope.companyLogo = $files[0];
                // $scope.logo_clicked = true;


                var _URL = window.URL || window.webkitURL;
                var file, img;

                if ((file = $files[0])) {
                    img = new Image();
                    img.onload = function () {
                        var fwidth = 530;
                        var fheight = 330;
                        var w = this.width;
                        var h = this.height;
                        //alert(w + "*" + h);
                        if (w < fwidth && h < fheight) {
                            //console.log("Image  dimenssion not appropitae");
                            // alert("Please Choose image of size greater than " + fwidth +' * '+ fheight+ '\n' +
                            //     'Selected image size is '+ w + " * " + h);
                            logger.logError("Please choose image of dimension greater than " + fwidth + ' * ' + fheight + '\n' +
                                    'Selected image size is ' + w + " * " + h);
                            // $('#SaveBtnSubmit').prop("disabled", true);
                        }
                        else {
                            //console.log("Every thing ok now continue");

                            $scope.companyLogo = $files[0];

                        }
                    };
                    img.onerror = function () {
                        // alert( "not a valid file: " + file.type);
                        logger.logError("Not a valid file type");
                        $('#SaveBtnSubmit').prop("disabled", true);
                    };
                    img.src = _URL.createObjectURL(file);
                }

            }

            $scope.currentCC_class = '';
            $scope.CC_validataion_err = false;
            //  Method  used to validate the credit cards LGN Section
            $scope.validateCC = function (num) {
                if (num) {
                    $('#ccNum').validateCreditCard(function (result) {

                        if (result.card_type != null) {

                            $scope.currentCC_class = 'valid ' + result.card_type.name;
                            $('#ccNum').addClass('valid ' + result.card_type.name);
                            $('.log').html('');

                            if (result.valid && result.length_valid && result.luhn_valid) {
                                $('.log').html('');
                                $scope.CC_validataion_err = false;
                                // everything ok all validations good to proceed
                                return true;

                            } else {
                                $('.log').html('This credit card seems to be invalid. Please check the number or call us if you are still having issues.');
                                $scope.CC_validataion_err = true;
                                //console.log("Card number not valid.");
                                return false;

                            }

                        } else {
                            $('.log').html('Not a valid card number');
                            $('#ccNum').removeClass($scope.currentCC_class);
                            $scope.CC_validataion_err = true;
                            //console.log("Card type not found in our DB .");
                        }
                        return false;

                    });
                } else {
                    $scope.CC_validataion_err = false;
                    $('.log').html('');
                }

            }

//*************************************************************************************/


            // Method to get the listing of LB users on click of tab LGN Section

            $scope.get_listLGN = function () {

                User.listUserDropDown().get({id: "LGN"}, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.LGNuserList = response.data;
                        //console.log("Success : " + response.message);
                    } else {
                        logger.logError(response.message);
                        //console.log('Error :' + response.message);
                    }

                });

            }
            $scope.get_listLGN(); // default call temporary, it will be manage from setTab()


            // Providing the facilities of registration to LGN user from Admin side
            $scope.register_lgn = function (user) {
                if (!$scope.user.$valid) {
                    logger.logError("Please fill all the required fields");
                    return false;
                }
                user.parent_id = $rootScope.authenticatedUser._id;
                user.role_id = CONSTANTS.ROLE_CODES.LGN;  // hard coded for LGN User
                User.signUpLGN().save(user, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        logger.logSuccess(response.message);
                        $scope.selected_existing_user = response.data._id;
                        $scope.setTab(1);
                    } else {
                        logger.logError(response.message);
                    }
                });
            }


            // Drag and Drop File upload Code ------ Start
            $scope.$watch('files', function () {
                $scope.upload($scope.files);
            });
            $scope.$watch('file', function () {
                if ($scope.file != null) {
                    $scope.upload([$scope.file]);
                }
            });
            $scope.log = '';
            $scope.progPercentage = 0;
            $scope.upload = function (files) {
                if (files && files.length) {
                    for (var i = 0; i < files.length; i++) {
                        var file = files[i];
                        if (!file.$error) {
                            Upload.upload({
                                url: '/onboardFileUpload',
                                file: file,
                                fields: {'existing_user_id': $scope.selected_existing_user}
                            }).progress(function (evt) {
                                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                                $scope.progPercentage = progressPercentage;
                                if (progressPercentage == 100) {
                                    $timeout(function () {
                                        $scope.progPercentage = 0
                                    }, 1000)
                                }
                                $scope.log = 'Progress: ' + progressPercentage + '% ' +
                                        evt.config.file.name;
                            }).success(function (data, status, headers, config) {
                                $timeout(function () {
                                    if (status == CONSTANTS.CODES.OK) {
                                        $scope.contracts = data.data ? data.data.contracts : {};
                                        logger.logSuccess(data.message);

                                        $scope.log = "File Uploaded Successfully. " + config.file.name;
                                    } else {
                                        $scope.log = "Error in Uploading File. " + config.file.name
                                    }
                                });
                            });
                        }
                    }
                }
            };
            $scope.deleteContracts = function (contract_id, filepath) {
                var userids = $scope.selected_existing_user;
                swal({
                    title: CONSTANTS.SWAL.deletetitle,
                    text: CONSTANTS.SWAL.deletetext,
                    type: CONSTANTS.SWAL.type,
                    showCancelButton: CONSTANTS.SWAL.showCancelButton,
                    confirmButtonColor: CONSTANTS.SWAL.confirmButtonColor,
                    confirmButtonText: CONSTANTS.SWAL.deleteconfirmButtonText,
                    closeOnConfirm: CONSTANTS.SWAL.closeOnConfirm},
                function () {
                    User.deleteContracts().save({'user_ids': userids, 'contract_id': contract_id, 'filepath': filepath}, function (data) {
                        if (data.result == CONSTANTS.CODES.OK) {
                            $scope.contracts = data.data ? data.data.contracts : {};
                            logger.logSuccess(data.message);

                        } else {
                            logger.logError(response.message);
                            //console.log(data.message);
                        }
                    });
                });
            }
            $scope.downloadContracts = function (filepath) {
                var filepath1 = filepath.replace('public/assets', 'assets')
                window.open(filepath1);
            }
            // Drag and Drop File upload Code ------ End

            $scope.backToBoard = function () {
                $route.reload();
            }


            $scope.getCity = function (zip) {
                var data = {'zip': zip};
                $http.post('/phoneAgent/getCityFromZip', data).success(function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        if (response.data) {
                            //console.log(response.data.ZipCode);
                            //console.log(response.data.ZipCode.length);

                            $scope.contactInfo.city = response.data.City;
                            $scope.contactInfo.state = response.data.State;
                            $scope.contactInfo.country = 'USA';
                        } else {
                            $scope.contactInfo.city = '';
                            $scope.contactInfo.state = '';
                        }
                    }
                });
            };

            $scope.skipWhiteLabel = function () {
                if ($scope.whitelabel) {
                    $scope.whitelabel = false;
                    $scope.custom_err = false;
                    $scope.common_msg = false;
                } else {
                    $scope.whitelabel = true;
                    $scope.custom_err = true;
                    $scope.common_msg = true;
                }
            };


            $scope.checkSetUpLB = function () {
                if (!$scope.custom.enable_whitelabel && $scope.custom_val.$invalid) {
                    $scope.common_msg = true;
                    $scope.custom_err = true;
                }
            }

        }])
        .controller('OnboardLBCtrl', ['$scope', '$http', '$route', 'User', 'logger', 'Upload', '$timeout', '$routeParams', '$location', '$rootScope', 'CONSTANTS', function ($scope, $http, $route, User, logger, Upload, $timeout, $routeParams, $location, $rootScope, CONSTANTS) {
            $scope.loginInfo = {};
            $scope.echeck = {};
            $scope.cc_details = {};
            $scope.supports = {};
            $scope.lgn_setUpData = {};
            // Code section for tabs open & close.
            $scope.tab = 1;
            $scope.countries = CONSTANTS.countryList;
            $scope.setTab = function (tabId) {
                $scope.tab = tabId;
                //console.log(tabId);
                $scope.common_msg = false;
                $scope.common_err = false;
                switch (tabId) {
                    case 0 :
                        // call contact info method
                        $scope.get_listLB();
                        break;
                    case 1 :
                        // call contact info method
                        $scope.get_contactInfo();
                        break;
                    case 2 :
                        // call login credential  method
                        $scope.get_loginCredentials();
                        break;
                    case 3 :
                        // call echeck info
                        $scope.get_echeckInfo();
                        break;
                    case 4 :
                        // call credit card info tab
                        $scope.get_cardDetails();
                        $scope.cvv_err = false;
                        break;
                    case 5 :
                        // for autorecharge tab
                        $scope.get_autorecharge();
                        break;
                    case 6 :
                        //  CRM options
                        $scope.get_CRMOptions();
                        break;
                    case 7 :
                        //
                        break;
                    case 8 :
                        // Customizes your instance (Lgn set up)
                        $scope.get_lgnsetup();
                        break;
                    case 9 :
                        // call contracts
                        $scope.get_contracts();
                        break;
                    case 10 :
                        //  Media agency
                        $scope.get_Lbsettings();
                        break;
                    case 11 :
                        //  Payments for calls
                        $scope.get_Lbsettings();
                        break;
                    case 12 :
                        //  Automated Marketing
                        $scope.get_Lbsettings();
                        break;
                    case 13 :
                        //  Call Recording
                        $scope.get_Lbsettings();
                        break;
                    case 14 :
                        //  Registration approval
                        $scope.get_phoneAgentInfo();
                        break;
                    case 15 :
                        //  Registration approval
                        $scope.get_RegApproval();
                        break;
                    case 16 :
                        // call contracts
                        $scope.get_termsandconditionsLB();
                        break;
                    default :

                        break;
                }
            };
//for LB
            $scope.get_termsandconditionsLB = function () {
                console.log("terms and conditions");
                var role = "LB";
                User.checktermsandcontions(role).get(function (response) {
                    var data = angular.fromJson(response);
                    $scope.title = "Lead Buyer";
                    $scope.terms = data.data[0].body;


                })
            }
            $scope.check = {
                value: false
            }
            $scope.accepttermsLB = function (value, e_signature) {
                if (value == false) {
                    logger.logError("You have not Accepted the terms and conditions");
                }
                else if (value == true) {
                    var id = $scope.selected_existing_user;
                    console.log(id);
                    User.acceptterms().save({'value': value, 'id': id, 'e_signature': e_signature}, function (response) {//559e73661fe7366c3ce2d050 for checking

                        if (response.code == 200) {
                            logger.logSuccess("You accept terms and conditions");
                            $scope.ip_add = response.data.ip_address;
                            $scope.current_date = new Date();
                            $scope.setTab(17)

                        }
                        else {
                            logger.logError("OOps! Something went wrong");
                        }
                    })
                }


            }
            $scope.isSet = function (tabId) {
                return $scope.tab === tabId;
            };
            // tabs section ends

            $scope.register_lb = function (user) {
                if (!$scope.user.$valid) {
                    logger.logError("Please fill all the required fields");
                    return false;
                }
                user.parent_id = $rootScope.authenticatedUser._id;
                user.role_id = CONSTANTS.ROLE_CODES.LB;

                User.signUpLGN().save(user, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        logger.logSuccess(response.message);
                        $scope.selected_existing_user = response.data._id;
                        $scope.setTab(1);
                    } else {
                        logger.logError(response.message);
                    }
                });
            }

            $scope.register_ls = function (user) {
                if (!$scope.user.$valid) {
                    logger.logError("Please fill all the required fields");
                    return false;
                }
                user.parent_id = $rootScope.authenticatedUser._id;
                user.role_id = CONSTANTS.ROLE_CODES.LG;
                User.signUpLGN().save(user, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        logger.logSuccess(response.message);
                        //console.log(response);
                        $route.reload();
                    } else {
                        logger.logError(response.message);
                    }
                });
            }

            // Method to get the CRM options. LB Section

            $scope.get_CRMOptions = function () {

                User.get_CRMOptions().get({'id': $scope.selected_existing_user}, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.crm = response.data.crm_options;
                        //console.log("Success : " + response.message);
                    } else {
                        logger.logError(response.message);
                        //console.log('Error :' + response.message);
                    }

                });

            }

// Method to get the CRM options. LB Section

            $scope.submitCRMoptions = function (crm) {
                //console.log(crm);
                //console.log($scope.crm_form.$error)
                if (!$scope.crm_form.$valid) {
                    logger.logError("Please fill all the required fields");
                    return false;
                }

                $http.post('/user_profile/save_crm_details', {'user_id': $scope.selected_existing_user, 'crm_options': crm})
                        .success(function (response, status, headers, config) {
                            if (response.result == CONSTANTS.CODES.OK) {
                                logger.logSuccess(response.message);
                                //console.log("Success : " + response.message);
                            } else if (response.result == CONSTANTS.CODES.notFound) {
                                logger.logError(response.message);
                                //console.log('Error :' + response.message);
                            }
                        })
                        .error(function (response, status) {
                            logger.logError("Error!");
                        })
            }
            // Method to get the listing of LB users  for Existing dropdown. LB Section

            $scope.get_listLB = function () {

                User.listUserDropDown().get({id: "LB"}, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.LBuserList = response.data;
                    } else {
                        //console.log('Error :' + response.message);
                    }

                });

            }

            // $scope.get_listLB(); // default call temporary, it will be manage from setTab()

            // Method to get the contact Info details on click of tab1 LB Section

            $scope.get_contactInfo = function () {
                User.get_contactInfo().get({'id': $scope.selected_existing_user}, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.contactInfo = response.data ? response.data : {};

                        _.each($scope.countries, function (country) {
                            country.ticked = (response.data.country == country.name) ? true : false;
                        });
                        //console.log("Success : " + response.message);
                    } else if (response.code == CONSTANTS.CODES.notFound) {
                        //console.log('Error :' + response.message);
                    }
                });
            }

            // Method to get the all details of login data. tab2 LB Section
            $scope.get_loginCredentials = function () {
                //console.log('get_loginCredentials');
                User.get_loginCredentials().get({'id': $scope.selected_existing_user}, function (response) {

                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.loginInfo.loginemail = response.data ? response.data.email : {};
                        // $scope.loginInfo.loginpswd= response.data? response.data.password: {};
                        //console.log("Success : " + response.message);
                    } else if (response.code == CONSTANTS.CODES.notFound) {
                        //console.log('Error :' + response.message);
                    }

                });
            }

            // Method to get the all details of echeck information. tab3 LB Section
            $scope.get_echeckInfo = function () {
                //console.log("get_echeckInfo");
                User.get_echeckInfo().get({'id': $scope.selected_existing_user}, function (response) {

                    if (response.code == CONSTANTS.CODES.OK && response.code != '') {
                        $scope.echeck = response.data ? response.data.echeckInfo : {};
                        $scope.echeck.caccno = (response.data && response.data.echeckInfo) ? response.data.echeckInfo.acc_no : '';
                        //console.log("Success : " + response.message);
                        var newZip = $scope.echeck.bank_zip;
                        $scope.echeck.bank_zip = (newZip) ? newZip.toString().substring(0, 5) : '';
                    } else if (response.code == CONSTANTS.CODES.notFound) {
                        //console.log('Error :' + response.message);
                    }

                });
            }

            // Method to get the credit card details on click of tab4 LB Section

            $scope.get_cardDetails = function () {

                User.get_cardDetails().get({'id': $scope.selected_existing_user}, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.saved_cards = response.data ? response.data.credit_card_details : {};
                        $scope.cc_details = {};
                        // $scope.cc_details.allow=response.data.credit_card_details.bal_Down? true : false;
                        // //console.log($scope.cc_details);
                        //console.log("Success : " + response.message);
                    } else if (response.code == CONSTANTS.CODES.notFound) {
                        //console.log('Error :' + response.message);
                    }

                });

            }

            // Method to get the auto recharge details on click of tab4 LGN Section

            $scope.get_autorecharge = function () {

                User.get_autorecharge().get({'id': $scope.selected_existing_user}, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.rechargeData = {};
                        $scope.rechargeData = response.data ? response.data.auto_recharge_details : {};
                        $scope.rechargeData.allow = response.data.auto_recharge_details.bal_Down ? true : false;
                        $scope.selectCreditCards = [];
                        $scope.echeckAccount = response.data.echeckInfo;
                        var temp;
                        if (!$scope.echeckAccount.credit_agree) {
                            temp = {
                                id: $scope.echeckAccount.acc_no,
                                acc_no: $scope.echeckAccount.acc_no,
                                group: 'Echeck Account'
                            }
                            $scope.selectCreditCards.push(temp);
                        }
                        $scope.creditCards = response.data.credit_card_details;
                        angular.forEach($scope.creditCards, function (value) {
                            temp = '';
                            temp = {
                                id: value._id,
                                acc_no: value.card_no,
                                group: 'Credit Cards'
                            }
                            $scope.selectCreditCards.push(temp);
                        });

                    } else if (response.code == CONSTANTS.CODES.notFound) {
                        //console.log('Error :' + response.message);
                    }

                });

            }


            // Method to get the all details of supports information. tab5 LB Section
            $scope.get_supports = function () {
                //console.log("get_supports");
                User.get_supports().get({'id': $scope.selected_existing_user}, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.supports = response.data ? response.data.It_supportSettings : {};
                        //console.log("Success : " + response.message);
                    } else if (response.code == CONSTANTS.CODES.notFound) {
                        //console.log('Error :' + response.message);
                    }

                });
            }

            // Method to get the all details of customise Instance. tab6 LB Section
            $scope.get_lgnsetup = function () {
                //console.log("get_lgnsetup" + $scope.selected_existing_user);
                User.get_lgnsetup().get({'id': $scope.selected_existing_user}, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.custom = response.data ? response.data.lgn_setup_details : {};
                        if ($scope.custom.enable_whitelabel) {
                            $scope.custom = {enable_whitelabel: true};
                            $scope.whitelabel = false;
                        }
                        $scope.custom.bgcolor = response.data ? response.data.lgn_setup_details.color_option.bgcolor : '#000';
                        $scope.custom.fontcolor = response.data ? response.data.lgn_setup_details.color_option.fontcolor : '#fff';
                        //console.log("Success : " + response.message);

                    } else if (response.code == 404) {
                        //console.log('Error :' + response.message);
                    }

                });
            }

            // Save company profile LB Section
            $scope.submitLgnSetUp = function (data) {
                console.log(data);
                if (!data.enable_whitelabel && !$scope.custom_val.$valid) {
                    logger.logError("Please fill all the required fields");
                    return false;
                }
                if (data && data.logo && typeof data.logo.size != 'undefined') {
                    //console.log('with size')
                    Upload.upload({
                        url: '/user_profile/save_company_details',
                        file: data.logo || [],
                        fields: {'existing_user_id': $scope.selected_existing_user, 'company_name': data.company_name, 'domain_url': data.domain_url, 'owner_email': data.owner_email, 'owner_name': data.owner_name, 'owner_phone': data.owner_phone, 'support_email': data.support_email, 'footer_content': data.footer_content, 'enable_whitelabel': data.enable_whitelabel, 'bgcolor': data.color_option.bgcolor, 'fontcolor': data.color_option.fontcolor}
                    }).success(function (data, status, headers, config) {
                        if (data.result == CONSTANTS.CODES.notFound) {
                            logger.logError(data.message)
                        } else {
                            $scope.setTab(9);
                        }
                    });
                } else {
                    Upload.upload({
                        url: '/user_profile/save_company_details',
                        fields: {'existing_user_id': $scope.selected_existing_user, 'company_name': data.company_name, 'domain_url': data.domain_url, 'owner_email': data.owner_email, 'owner_name': data.owner_name, 'owner_phone': data.owner_phone, 'support_email': data.support_email, 'footer_content': data.footer_content, 'enable_whitelabel': data.enable_whitelabel, 'bgcolor': data.bgcolor, 'fontcolor': data.fontcolor}
                    }).success(function (data, status, headers, config) {
                        if (data.result == CONSTANTS.CODES.notFound) {
                            logger.logError(data.message)
                        } else {
                            $scope.setTab(9);
                        }
                    });
                }


            }

            // Method to get the all details of all contracts. tab7 LB Section
            $scope.get_contracts = function () {
                //console.log("get_contracts");
                User.get_contracts().get({'id': $scope.selected_existing_user}, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.contracts = response.data ? response.data.contracts : {};
                    } else if (response.code == 404) {
                        //console.log('Error :' + response.message);
                    }

                });
            }

            // Method to get the LB settings for  tab10,11 12,13 LB Section
            //(media agency,call payments, automated marketing,call recording, registration approval tabs).
            $scope.get_Lbsettings = function () {
                //console.log("get_Lbsettings");
                User.get_Lbsettings().get({'id': $scope.selected_existing_user}, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        //console.log(response.data.lb_settings);
                        $scope.lbSettingsData = response.data ? response.data.lb_settings : {};
                    } else if (response.code == 404) {
                        //console.log('Error :' + response.message);
                    }

                });
            }

            // Method to get the phoneAgentInfo settings for  tab14 LB Section
            $scope.get_phoneAgentInfo = function () {
                User.get_phoneAgentInfo().get({'id': $scope.selected_existing_user}, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.phone_agents = response.data.phone_agent;
                    } else if (response.code == 404) {
                        //console.log('Error :' + response.message);
                    }

                });
            }

            // Method to get the phoneAgentInfo settings for  tab14 LB Section
            $scope.save_phoneAgentInfo = function (data) {
                User.save_phoneAgentInfo().save({'id': $scope.selected_existing_user, phone_agent: data}, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        logger.logSuccess(response.message);
                    } else if (response.code == 404) {
                        //console.log('Error :' + response.message);
                    }

                });
            }

            // Method to get the Registration approval settings for  tab15 LB Section
            $scope.get_RegApproval = function () {
                //console.log("get_Lbsettings");
                User.get_RegApproval().get({'id': $scope.selected_existing_user}, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        //console.log(response.data.registration_approval);
                        $scope.regData.method = response.data ? response.data.registration_approval : 0;
                    } else if (response.code == 404) {
                        //console.log('Error :' + response.message);
                    }

                });
            }
//  **********************  Submit tab form data one by one starts here *****************************


            // Save user contact info tab data LB Section
            $scope.submitContactInfo = function (data) {

                if (!$scope.contact_info.$valid) {
                    logger.logError("Please fill all the required fields");
                    return false;
                }
                
                data.country = (data.country[0].name)?data.country[0].name:data.country;
                data.user_id = $scope.selected_existing_user;
                $http.post('/user_profile/save_contact_details', data)
                        .success(function (response, status, headers, config) {
                            if (response.result == CONSTANTS.CODES.OK) {
                                logger.logSuccess(response.message);
                                //console.log("Success : " + response.message);
                            } else if (response.result == 404) {
                                logger.logError(response.message);
                                //console.log('Error :' + response.message);
                            }
                        })
                        .error(function (response, status) {
                            logger.logError("Error!");
                        })
            }

            $scope.changeLoginCredentials = function (data) {

                if (!data.currentpassword && !data.password) {
                    return false;  // nothing to perform if no data entry for chnage password.
                } else {

                    if (!$scope.login_val.$valid) {
                        logger.logError("Please fill all the required fields");
                        return false;
                    }

                    data.user_id = $scope.selected_existing_user;
                    $http({
                        method: 'POST',
                        url: '/api_admin/changeLoginCredentials',
                        data: data,
                    }).success(function (response) {
                        if (response.code == 200) {
                            logger.logSuccess(response.message);
                            //console.log("Success : " + response.message);
                        } else if (response.code == 404) {
                            $scope.setTab(2);  // back to the same tab if error occurs
                            logger.logError(response.message);
                            //console.log('Error :' + response.message);
                        }
                    });

                }
            }

            // Method to save the echeck details of user logged in LB Section

            $scope.submitEcheck = function (Echeckdata) {
                //console.log(Echeckdata);
                if (!$scope.echeck_info.$valid) {
                    if (!Echeckdata.credit_agree) {
                        logger.logError("Please fill all the required fields");
                        return false;
                    }
                }
                // //console.log(Echeckdata); return false;
                Echeckdata.user_id = $scope.selected_existing_user;

                $http.post('/user_profile/add_echeckInfo', Echeckdata)
                        .success(function (response, status, headers, config) {
                            if (response.result == 200) {
                                logger.logSuccess(response.message);
                                //console.log("Success : " + response.message);
                            } else if (response.result == 404) {
                                logger.logError(response.message);
                                //console.log('Error :' + response.message);
                            }
                        })
                        .error(function (response, status) {
                            logger.logError("Error!");
                        })

            }

            // Method to save the credit card details LB Section

            $scope.submitCreditCard = function (CreditCard) {
                if (!$scope.echeck_info2.$valid || $scope.CC_validataion_err) {
                    logger.logError("Please fill all the required fields");
                    return false;
                }
                //console.log(CreditCard.card_no);
                CreditCard.user_id = $scope.selected_existing_user;
                // check for the empty data entry when there are saved cards.
                if (CreditCard.card_no == undefined) {
                    return false;
                }

                $http.post('/user_profile/add_creditCard', CreditCard)
                        .success(function (response, status, headers, config) {
                            if (response.result == CONSTANTS.CODES.OK) {
                                logger.logSuccess(response.message);
                                $('#ccNum').removeClass($scope.currentCC_class); // reset the applied class for CC
                                //console.log("Success : " + response.message);
                            } else if (response.result == 404) {
                                logger.logError(response.message);
                                //console.log('Error :' + response.message);
                            }
                        })
                        .error(function (response, status) {
                            logger.logError("Error!");
                        })

                $scope.get_autorecharge();

            }

            // Method to make credit card primary LGN Section
            $scope.make_primary = function (cardData) {

                cardData.user_id = $scope.selected_existing_user;

                $http.post('/user_profile/makeCard_primary', cardData)
                        .success(function (response, status, headers, config) {
                            if (response.result == CONSTANTS.CODES.OK) {
                                logger.logSuccess(response.message);
                                $scope.get_cardDetails();  //called for updated list data
                                //console.log("Success : " + response.message);
                            } else if (response.result == 404) {
                                logger.logError(response.message);
                                //console.log('Error :' + response.message);
                            }
                        })
                        .error(function (response, status) {
                            logger.logError("Error!");
                        })

            }

            // Method to make credit card primary LGN Section
            $scope.remove_card = function (card_id) {
                var postData = {'card_id': card_id, 'user_id': $scope.selected_existing_user};

                $http.post('/user_profile/remove_card', postData)
                        .success(function (response, status, headers, config) {
                            if (response.result == CONSTANTS.CODES.OK) {
                                logger.logSuccess(response.message);
                                $scope.get_cardDetails();  // called for updated list
                                //console.log("Success : " + response.message);
                            } else if (response.result == 404) {
                                logger.logError(response.message);
                                //console.log('Error :' + response.message);
                            }
                        })
                        .error(function (response, status) {
                            logger.logError("Error!");
                        })

            }

            // Method to save the auto recharge details LB Section

            $scope.submitAutorecharge = function (RechargeData) {

                RechargeData.user_id = $scope.selected_existing_user;

                $http.post('/user_profile/add_rechargeData', RechargeData)
                        .success(function (response, status, headers, config) {
                            if (response.result == CONSTANTS.CODES.OK) {
                                logger.logSuccess(response.message);
                                //console.log("Success : " + response.message);
                            } else if (response.result == 404) {
                                logger.logError(response.message);
                                //console.log('Error :' + response.message);
                            }
                        })
                        .error(function (response, status) {
                            logger.logError("Error!");
                        })

            }

            // Method to save the LB settings for  tab10,11 12,13,14 LB Section
            //(media agency,call payments, automated marketing,call recording, registration approval tabs).

            $scope.submitLBSettings = function (LBSettingsData) {

                LBSettingsData.user_id = $scope.selected_existing_user;
                //console.log(LBSettingsData);
                $http.post('/user_profile/save_lbsettings', LBSettingsData)
                        .success(function (response, status, headers, config) {
                            if (response.result == CONSTANTS.CODES.OK) {
                                logger.logSuccess(response.message);
                                //console.log("Success : " + response.message);
                            } else if (response.result == 404) {
                                logger.logError(response.message);
                                //console.log('Error :' + response.message);
                            }
                        })
                        .error(function (response, status) {
                            logger.logError("Error!");
                        })

            }

            // Method to save registration approval type as well as onboard user final submit  tab14 LB Section
            //(registration approval tab).

            $scope.submit_registrationApproval = function (approvalData) {

                approvalData.user_id = $scope.selected_existing_user;
                if (approvalData.method == 0) {
                    approvalData.registration_approval = 'automatic';
                } else {
                    approvalData.registration_approval = 'manual';
                }
                // //console.log(approvalData); return false;
                $http.post('/user_profile/submit_onboardingLB', approvalData)
                        .success(function (response, status, headers, config) {
                            if (response.result == CONSTANTS.CODES.OK) {
                                logger.logSuccess(response.message);
                                //console.log("Success : " + response.message);
                            } else if (response.result == 404) {
                                logger.logError(response.message);
                                //console.log('Error :' + response.message);
                            }
                            $scope.termss = true;
                        })
                        .error(function (response, status) {
                            logger.logError("Error!");
                        })

            }

            // Method to save CRM Option settings tab06 LB Section

            $scope.save_CRM_options = function (crmData) {
                //console.log(crmData);
            }


            // Method used to populate bank details LB Section
            $scope.populate_bankDetails = function () {

                User.populate_bankDetails().get({routingno: $scope.echeck.routing_no}, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        //console.log(response);
                        var newZip = response.data.bank_zip;
                        // newZip.toString()substring(0, 4);
                        $scope.echeck.bank_name = response.data.bank_name;
                        $scope.echeck.bank_phone = response.data.bank_phone;
                        $scope.echeck.bank_zip = newZip.toString().substring(0, 5);
                        //$scope.echeck.bank_zip = response.data.bank_zip;
                    } else if (response.code == 404) {
                        $scope.echeck.bank_name = '';
                        $scope.echeck.bank_phone = '';
                        $scope.echeck.bank_zip = '';
                        //console.log('Error :' + response.message);
                    }

                });
            }

            $scope.currentCC_class = '';
            $scope.CC_validataion_err = false;
            //  Method  used to validate the credit cards LB Section
            $scope.validateCC = function (num) {
                if (num) {
                    $('#ccNum').validateCreditCard(function (result) {

                        if (result.card_type != null) {

                            $scope.currentCC_class = 'valid ' + result.card_type.name;
                            $('#ccNum').addClass('valid ' + result.card_type.name);
                            $('.log').html('');

                            if (result.valid && result.length_valid && result.luhn_valid) {
                                $('.log').html('');
                                $scope.CC_validataion_err = false;
                                // everything ok all validations good to proceed
                                return true;

                            } else {
                                $('.log').html('This credit card seems to be invalid. Please check the number or call us if you are still having issues.');
                                $scope.CC_validataion_err = true;
                                //console.log("Card number not valid.");
                                return false;

                            }

                        } else {
                            $('.log').html('Not a valid card number');
                            $('#ccNum').removeClass($scope.currentCC_class);
                            $scope.CC_validataion_err = true;
                            //console.log("Card type not found in our DB .");
                        }
                        return false;

                    });
                } else {
                    $scope.CC_validataion_err = false;
                    $('.log').html('');
                }

            }

            $scope.getCity = function (zip) {
                var data = {'zip': zip};
                $http.post('/phoneAgent/getCityFromZip', data).success(function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        if (response.data) {
                            //console.log(response.data.ZipCode);
                            //console.log(response.data.ZipCode.length);

                            $scope.contactInfo.city = response.data.City;
                            $scope.contactInfo.state = response.data.State;
                            $scope.contactInfo.country = 'USA';
                        } else {
                            $scope.contactInfo.city = '';
                            $scope.contactInfo.state = '';
                        }
                    }
                });
            };

            $scope.skipWhiteLabel = function () {
                if ($scope.whitelabel) {
                    $scope.whitelabel = false;
                    /* $scope.custom_err = false;
                     $scope.common_msg = false;*/
                } else {
                    $scope.whitelabel = true;
                    /*$scope.custom_err = true;
                     $scope.common_msg = true;*/
                }
            };

            // Drag and Drop File upload Code ------ Start
            $scope.$watch('files', function () {
                $scope.upload($scope.files);
            });
            $scope.$watch('file', function () {
                if ($scope.file != null) {
                    $scope.upload([$scope.file]);
                }
            });
            $scope.log = '';
            $scope.progPercentage = 0;
            $scope.upload = function (files) {
                if (files && files.length) {
                    for (var i = 0; i < files.length; i++) {
                        var file = files[i];
                        if (!file.$error) {
                            Upload.upload({
                                url: '/onboardFileUpload',
                                file: file,
                                fields: {'existing_user_id': $scope.selected_existing_user}
                            }).progress(function (evt) {
                                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                                $scope.progPercentage = progressPercentage;
                                if (progressPercentage == 100) {
                                    $timeout(function () {
                                        $scope.progPercentage = 0
                                    }, 1000)
                                }
                                $scope.log = 'Progress: ' + progressPercentage + '% ' +
                                        evt.config.file.name;
                            }).success(function (data, status, headers, config) {
                                $timeout(function () {
                                    if (status == CONSTANTS.CODES.OK) {
                                        $scope.contracts = data.data ? data.data.contracts : {};
                                        logger.logSuccess(data.message);

                                        $scope.log = "File Uploaded Successfully. " + config.file.name;
                                    } else {
                                        $scope.log = "Error in Uploading File. " + config.file.name
                                    }
                                });
                            });
                        }
                    }
                }
            };
            $scope.deleteContracts = function (contract_id, filepath) {
                var userids = $scope.selected_existing_user;
                swal({
                    title: CONSTANTS.SWAL.deletetitle,
                    text: CONSTANTS.SWAL.deletetext,
                    type: CONSTANTS.SWAL.type,
                    showCancelButton: CONSTANTS.SWAL.showCancelButton,
                    confirmButtonColor: CONSTANTS.SWAL.confirmButtonColor,
                    confirmButtonText: CONSTANTS.SWAL.deleteconfirmButtonText,
                    closeOnConfirm: CONSTANTS.SWAL.closeOnConfirm},
                function () {
                    User.deleteContracts().save({'user_ids': userids, 'contract_id': contract_id, 'filepath': filepath}, function (data) {
                        if (data.result == CONSTANTS.CODES.OK) {
                            $scope.contracts = data.data ? data.data.contracts : {};
                            logger.logSuccess(data.message);

                        } else {
                            logger.logError(response.message);
                            //console.log(data.message);
                        }
                    });
                });
            }
            $scope.downloadContracts = function (filepath) {
                var filepath1 = filepath.replace('public/assets', 'assets')
                //console.log(filepath1);
                window.open(filepath1);
            }
            // Drag and Drop File upload Code ------ End

            $scope.backToBoard = function () {
                $route.reload();
            }
            $scope.backToList = function () {
                $location.path('/lgn/user/LB/');
            }
            $scope.setUserOnBoard = function () {
                //console.log("I'm here");
                $scope.selected_existing_user = $routeParams.id;
            };

//*************************************************************************************/


            $scope.checkSetUpLB = function () {
                $scope.checkSetUpLB = function () {
                    console.log($scope.custom);
                    if (!$scope.custom.enable_whitelabel && $scope.custom_val.$invalid) {
                        $scope.common_msg = true;
                        $scope.custom_err = true;
                    } else {
                        $scope.submitLgnSetUp($scope.custom);
                    }

                }
            }

        }])

        .filter('htmlToPlaintext', function () {
            return function (text) {
                return  text ? String(text).replace(/<[^>]+>/gm, '') : '';
            };
        });
