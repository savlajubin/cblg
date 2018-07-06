/*@function : LgUserCtrl
 * Creator   : Smartdata(A2)
 * @purpose  : To manage lead generation users
 */
app.controller('LgUserCtrl', ['$scope', '$rootScope', '$http', 'User', 'LgUser', 'logger', 'Upload', '$timeout', '$filter', 'CONSTANTS', 'Module', function ($scope, $rootScope, $http, User, LgUser, logger, Upload, $timeout, $filter, CONSTANTS, Module) {
        $scope.showListUser = true;
        $scope.showViewUser = false;
        $scope.showEditForm = false;
        $scope.common_msg = false;
        $scope.common_err = false;
        $scope.loginInfo = {};
        $scope.echeck = {};
        $scope.cc_details = {};
        $scope.supports = {};
        $scope.lgn_setUpData = {};

        $scope.countries = CONSTANTS.countryList;

        /* Encrypt user id for web lead api */
        $scope.encryptedUserId = CryptoJS.AES.encrypt($rootScope.userIdForApi, "userIdForWebLeadApi").toString();


        // Code section for tabs open & close.
        $scope.tab = 1;
        $scope.setTab = function (tabId) {
            $scope.tab = tabId;
            $scope.common_msg = false;
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
                    // call set up LGN
                    $scope.get_lgnsetup();
                    break;
                case 4 :
                    // call set up contracts
                    $scope.get_contracts();
                    break;
                case 9 :
                    // call echeck info
                    $scope.get_echeckInfo();
                    break;
                case 10 :
                    // call credit card info
                    $scope.get_cardDetails();
                    break;
                case 11 :
                    // call credit card info
                    $scope.get_autorecharge();
                    break;
                case 5 :
                    // call credit card info
                    $scope.get_callerInfo();
                    break;
                case 6 :
                    // call credit card info
                    $scope.checkAwsEmailStatus();
                    break;
                default :

                    break;
            }
        };

        $scope.isSet = function (tabId) {
            return $scope.tab === tabId;
        };
        // tabs section ends

        //To get lgn details
        $scope.get_contactInfo = function () {
            LgUser.get_contactInfo().get({}, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    $scope.contactInfo = response.data ? response.data : {};

                    _.each($scope.countries, function (country) {
                        country['ticked'] = (response.data.country == country.name);
                    });

                    console.log("Success : " + response.message);
                } else if (response.code == 404) {
                    console.log('Error :' + response.message);
                }
            });
        }
        // Save user contact info tab data LGN Section
        $scope.submitContactInfo = function (data) {

            if (!$scope.contact_info.$valid) {
                logger.logError("Please fill all the required fields");
                return false;
            }

            //data.country = data.country[0].name;
            data.user_id = $scope.selected_existing_user;
            $http.post('/api_account/save_contact_details', data)
                    .success(function (response, status, headers, config) {
                        if (response.result == CONSTANTS.CODES.OK) {
                            logger.logSuccess(response.message);
                            console.log("Success : " + response.message);
                        } else if (response.result == 404) {
                            logger.logError(response.message);
                            console.log('Error :' + response.message);
                        }
                    })
                    .error(function (response, status) {
                        console.log("Error Occured!");
                    })
        }

        // Method to get the all details of login data. tab2
        $scope.get_loginCredentials = function () {
            LgUser.get_loginCredentials().get({}, function (response) {

                if (response.code == CONSTANTS.CODES.OK) {
                    $scope.loginInfo.loginemail = response.data ? response.data.email : {};
                    // $scope.loginInfo.loginpswd= response.data? response.data.password: {};
                    console.log("Success : " + response.message);
                } else if (response.code == 404) {
                    console.log('Error :' + response.message);
                }

            });
        }

        //change login details
        $scope.changeLoginCredentials = function (data) {
            $http({
                method: 'POST',
                url: '/api_account/change_loginCredentials',
                data: data,
            }).success(function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    logger.logSuccess(response.message);
                    console.log("Success : " + response.message);
                } else if (response.code == 404) {
                    $scope.setTab(2);  // back to the same tab if error occurs
                    logger.logError(response.message);
                    console.log('Error :' + response.message);
                }
            });


        }
        // Method to get the all details of customise Instance. tab6 LB Section
        $scope.get_lgnsetup = function () {
            LgUser.get_lgnsetup().get({}, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    $scope.custom = response.data ? response.data.lgn_setup_details : {};
                    var colors = response.data.lgn_setup_details.color_option;
                    console.log(colors);
                    $scope.custom.bgcolor = response.data ? colors.bgcolor : '#000';
                    $scope.custom.fontcolor = response.data ? colors.fontcolor : '#fff';
                    console.log("Success : " + response.message);
                    console.log($scope.custom.bgcolor);
                } else if (response.code == 404) {
                    console.log('Error :' + response.message);
                }

            });
        }
        // Save company profile LGN Section
        $scope.submitLgnSetUp = function (data) {
            console.log(data);
            if (!$scope.custom_val.$valid) {
                logger.logError("Please fill all the required fields");
                return false;
            }
            if (typeof data.logo.size != 'undefined') {
                console.log('with size')
                Upload.upload({
                    url: '/api_account/save_company_details',
                    file: data.logo || [],
                    fields: {'existing_user_id': $scope.selected_existing_user, 'company_name': data.company_name, 'domain_url': data.domain_url, 'owner_email': data.owner_email, 'owner_name': data.owner_name, 'owner_phone': data.owner_phone, 'support_email': data.support_email, 'footer_content': data.footer_content, 'enable_whitelabel': data.enable_whitelabel, 'bgcolor': data.bgcolor, 'fontcolor': data.fontcolor}
                }).success(function (data, status, headers, config) {
                    logger.logSuccess(data.message);
                });
            } else {
                Upload.upload({
                    url: '/api_account/save_company_details',
                    fields: {'existing_user_id': $scope.selected_existing_user, 'company_name': data.company_name, 'domain_url': data.domain_url, 'owner_email': data.owner_email, 'owner_name': data.owner_name, 'owner_phone': data.owner_phone, 'support_email': data.support_email, 'footer_content': data.footer_content, 'enable_whitelabel': data.enable_whitelabel, 'bgcolor': data.bgcolor, 'fontcolor': data.fontcolor}
                }).success(function (data, status, headers, config) {
                    logger.logSuccess(data.message);
                });
            }


        }
        // Method to get the all details of set up LGN. tab7
        $scope.get_contracts = function () {
            console.log("get_contracts");
            LgUser.get_contracts().get({}, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    $scope.contracts = response.data ? response.data.contracts : {};
                } else if (response.code == 404) {
                    console.log('Error :' + response.message);
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
                            url: '/api_account/onboardFileUpload',
                            file: file
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

        // Method to get the all details of echeck information. tab9
        $scope.get_echeckInfo = function () {

            LgUser.get_echeckInfo().get({}, function (response) {

                if (response.code == CONSTANTS.CODES.OK) {
                    $scope.echeck = response.data ? response.data.echeckInfo : {};

                    console.log("Success : " + response.message);
                } else if (response.code == 404) {
                    console.log('Error :' + response.message);
                }

            });

        }
        // Method used to populate bank details LGN Section
        $scope.populate_bankDetails = function () {
            User.populate_bankDetails().get({routingno: $scope.echeck.routing_no}, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    console.log(response);
                    var newZip = response.data.bank_zip;
                    // newZip.toString()substring(0, 4);
                    $scope.echeck.bank_name = response.data.bank_name;
                    $scope.echeck.bank_phone = response.data.bank_phone;
                    $scope.echeck.bank_zip = newZip.toString().substring(0, 5);
//                        $scope.echeck.bank_zip = response.data.bank_zip;
                } else if (response.code == CONSTANTS.CODES.notFound) {
                    $scope.echeck.bank_name = '';
                    $scope.echeck.bank_phone = '';
                    $scope.echeck.bank_zip = '';
                    console.log('Error :' + response.message);
                }

            });
        }
        // Method to save the echeck details of user logged in LB Section

        $scope.submitEcheck = function (Echeckdata) {
            if (!$scope.echeck_info.$valid) {
                if (!Echeckdata.credit_agree) {
                    logger.logError("Please fill all the required fields");
                    return false;
                }
            }
            // console.log(Echeckdata); return false;
            $http.post('/api_account/add_echeckInfo', Echeckdata)
                    .success(function (response, status, headers, config) {
                        if (response.result == CONSTANTS.CODES.OK) {
                            logger.logSuccess(response.message);
                            console.log("Success : " + response.message);
                        } else if (response.result == CONSTANTS.CODES.notFound) {
                            logger.logError(response.message);
                            console.log('Error :' + response.message);
                        }
                    })
                    .error(function (response, status) {
                        console.log("Error Occured!");
                    })

        }

        // Method to get the credit card details on click of tab10 LB Section

        $scope.get_cardDetails = function () {

            LgUser.get_cardDetails().get({}, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    $scope.saved_cards = response.data ? response.data.credit_card_details : {};
                    $scope.cc_details = {};
                    // $scope.cc_details.allow=response.data.credit_card_details.bal_Down? true : false;
                    // console.log($scope.cc_details);
                    console.log("Success : " + response.message);
                } else if (response.code == CONSTANTS.CODES.notFound) {
                    console.log('Error :' + response.message);
                }

            });

        }
        // Method to save the credit card details LB Section

        $scope.submitCreditCard = function (CreditCard) {
            if (!$scope.echeck_info2.$valid || $scope.CC_validataion_err) {
                logger.logError("Please fill all the required fields");
                return false;
            }
            console.log(CreditCard.card_no);
            // check for the empty data entry when there are saved cards.
            if (CreditCard.card_no == undefined) {
                return false;
            }

            $http.post('/api_account/add_creditCard', CreditCard)
                    .success(function (response, status, headers, config) {
                        if (response.result == CONSTANTS.CODES.OK) {
                            logger.logSuccess(response.message);
                            $('#ccNum').removeClass($scope.currentCC_class); // reset the applied class for CC
                            $scope.get_cardDetails();
                            console.log("Saved successfully");
                        } else if (response.result == 404) {
                            logger.logError(response.message);
                            console.log('Error :' + response.message);
                        }
                    })
                    .error(function (response, status) {
                        console.log("Error Occured!");
                    })

        }

        // Method to get the auto recharge details on click of tab11 LGN Section

        $scope.get_autorecharge = function () {

            LgUser.get_autorecharge().get({}, function (response) {
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
                } else if (response.code == 404) {
                    console.log('Error :' + response.message);
                }

            });

        }

        // Method to make credit card primary LGN Section
        $scope.make_primary = function (cardData) {


            $http.post('/api_account/makeCard_primary', cardData)
                    .success(function (response, status, headers, config) {
                        if (response.result == CONSTANTS.CODES.OK) {
                            logger.logSuccess(response.message);
                            $scope.get_cardDetails();  //called for updated list data
                            console.log("Success : " + response.message);
                        } else if (response.result == 404) {
                            logger.logError(response.message);
                            console.log('Error :' + response.message);
                        }
                    })
                    .error(function (response, status) {
                        console.log("Error Occured!");
                    })

        }

        // Method to make credit card primary LGN Section
        $scope.remove_card = function (card_id) {
            var postData = {'card_id': card_id};

            $http.post('/api_account/remove_card', postData)
                    .success(function (response, status, headers, config) {
                        if (response.result == CONSTANTS.CODES.OK) {
                            logger.logSuccess(response.message);
                            $scope.get_cardDetails();  // called for updated list
                            console.log("Success : " + response.message);
                        } else if (response.result == 404) {
                            logger.logError(response.message);
                            console.log('Error :' + response.message);
                        }
                    })
                    .error(function (response, status) {
                        console.log("Error Occured!");
                    })

        }

        // Method to save the auto recharge details LB Section

        $scope.submitAutorecharge = function (RechargeData) {
            $http.post('/api_account/add_autorechargeData', RechargeData)
                    .success(function (response, status, headers, config) {
                        if (response.result == CONSTANTS.CODES.OK) {
                            logger.logSuccess(response.message);
                            console.log("Success : " + response.message);
                        } else if (response.result == 404) {
                            logger.logError(response.message);
                            console.log('Error :' + response.message);
                        }
                    })
                    .error(function (response, status) {
                        console.log("Error Occured!");
                    })

        }

        $scope.get_listLB = function (rolecode) {

            $scope.param1 = rolecode;
            $scope.name = $scope.param1 == 'LG' ? 'Seller' : 'Buyer';
            $scope.roleCode = $scope.param1;
            LgUser.listUser().save({rolecode: $scope.param1}, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    $scope.userList = response.data;
                    console.log('12', $scope.userList);
                    Module.pagination($scope.userList);
                    console.log("Success : " + response.message);
                } else {
                    logger.logError(response.message);
                    Module.pagination({});
                    console.log('Error :' + response.message);
                }

            });

        }
        //get details for to show data in edit fields
        $scope.editForm = function (ids) {
            User.findByIDUser().get({id: ids}, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    $scope.user = response.data[0];
                    console.log("Success : " + response.message);
                } else {
                    logger.logError(response.message);
                    console.log('Error :' + response.message);
                }
            });

            $scope.showListUser = false;
            $scope.showViewUser = false;
            $scope.showEditForm = true;

        }

        //save or update form data
        $scope.saveUserForm = function (user) {
            delete user.password;
            user.rolecode = user.role_id.code;
            delete user.role_id;
            LgUser.updateUser().save(user, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    $scope.userList = response.data;
                    Module.pagination($scope.userList);
                    $scope.showListUser = true;
                    $scope.showViewUser = false;
                    $scope.showEditForm = false;
                    console.log("Success : " + response.message);
                } else {
                    logger.logError(response.message);
                    console.log('Error :' + response.message);
                }
            });
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
                LgUser.deleteUser().save({'user_ids': [{'id': userids, 'rolecode': roleCode}]}, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.userList = response.data;
                        Module.pagination($scope.userList);
                        logger.logSuccess(response.message);
                        console.log("Success : " + response.message);
                    } else {
                        logger.logError(response.message);
                        console.log('Error :' + response.message);
                    }
                });
            });
        }
        //delete contracts file
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
                        console.log(data.message);
                    }
                });
            })
        }
        //download contracts
        $scope.downloadContracts = function (filepath) {
            var filepath1 = filepath.replace('public/assets', 'assets')
            console.log(filepath1);
            window.open(filepath1);
        }
        // change the status of module
        $scope.statusUser = function (user_id, status, rolecode) {
            var user = {
                'rolecode': rolecode,
                'user_id': user_id,
                'status': (status == 'active') ? 'deactive' : 'active'
            }
            LgUser.statusUser().save(user, function (response) {
                console.log(response)
                if (response.code == CONSTANTS.CODES.OK) {
                    $scope.userList = response.data;
                    Module.pagination($scope.userList);
                    logger.logSuccess(response.message);
                    console.log("Success : " + response.message);
                } else {
                    logger.logError(response.message);
                    console.log('Error :' + response.message);
                }
            });
        }

        $scope.back = function () {
            $scope.showListUser = true;
            $scope.showViewUser = false;
            $scope.showEditForm = false;
        }

        // Providing the facilities of change password to user
        $scope.userView = function (ids) {
            User.findByIDUser().get({id: ids}, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    $scope.userInfo = response.data[0];
//                        logger.logSuccess(response.message);
                    console.log("Success : " + response.message);
                } else {
                    logger.logError(response.message);
                    console.log('Error :' + response.message);
                }
            });
//        $scope.showListUser = false;
//        $scope.showViewUser = true;
//        $scope.showEditForm = false;
        }

        //get call list as per date
        $scope.getDataByDate = function (dateData, val) {
            LgUser.callHistoryByDate().save(dateData, function (response) {
                Module.pagination(response.data)
            });
        }

        //Function to specify indexes to inline editable textarea
        $scope.showBox = [];
        $scope.showInput = function (index) {
            var i = 0;
            $scope.tableParams.data.forEach(function (data) {
                if (i == index) {
                    $scope.showBox[index] = true;
                } else {
                    $scope.showBox[i] = false;
                }
                i = i + 1;
            });
        }

        //Saves the provided note for call
        $scope.noteSave = function (data) {

            var data = {
                _id: data._id,
                note: data.Note
            }
            LgUser.saveNoteForCall().save(data, function (response) {
                console.log('success');
            });

        }


        //save original caller
        $scope.OrignalCaller = function () {
            console.log("inside original caller");
            console.log($scope.original_caller);
            LgUser.SaveOrignalCaller().save({'original_user': $scope.original_caller}, function (response) {
                if (response.code == 200) {
                    logger.logSuccess(response.message);
                } else {
                    logger.logError(response.message);
                }
            });

        }

        //caller details
        $scope.get_callerInfo = function () {
            console.log("inside callerinfo")
            LgUser.get_callerInfo().get({'user_id': $scope.select_existing_user}, function (response) {
                console.log(response);
                console.log(response.data.original_caller_connect);
                if (response.data.original_caller_connect == true) {
                    $scope.original_caller = "true";
                } else {
                    $scope.original_caller = "false";
                }


            });
        }


        $scope.manualDate = function () {
            $scope.fromD = $filter('date')($scope.from, 'MMMM dd, yyyy');
            $scope.toD = $filter('date')($scope.to, 'MMMM dd, yyyy');
            $scope.filter = $scope.fromD + '-' + $scope.toD;

        };

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
                            console.log("Card number not valid.");
                            return false;

                        }

                    } else {
                        $('.log').html('Not a valid card number');
                        $('#ccNum').removeClass($scope.currentCC_class);
                        $scope.CC_validataion_err = true;
                        console.log("Card type not found in our DB .");
                    }
                    return false;

                });
            } else {
                $scope.CC_validataion_err = false;
                $('.log').html('');
            }

        }


        $scope.addDisaproveNote = function (callId, message) {
            var data = {
                id: callId,
                is_lgn_aproved: false,
                disaproved_note: message
            }
            LgUser.addDisaproveNote().save(data, function (response) {
                Module.pagination(response.data)
            });
        }

        //$scope.emailAddress = $rootScope.authenticatedUser.email;

        console.log('$rootScope.authenticatedUser.aws_verified_email', $rootScope.authenticatedUser.aws_verified_email);
        $scope.emailAddress = $rootScope.authenticatedUser.aws_verified_email ? $rootScope.authenticatedUser.aws_verified_email : $rootScope.authenticatedUser.email;

        $scope.aws_verified_email = $rootScope.authenticatedUser.aws_verified_email;
        $scope.aws_verified_email_status = $rootScope.authenticatedUser.aws_verified_email_status;

        /* Amazon AWS SES email verification */
        $scope.awsEmailVerification = function (emailAddress) {
            console.log('emailAddress', emailAddress);
            User.awsEmailVerification().save({"emailAddress": emailAddress}, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    if (response.data) {
                        $scope.aws_verified_email_status = response.data.verifiedStatus;
                        $scope.aws_verified_email = emailAddress;
                    }
                    logger.logSuccess(response.message);
                } else {
                    logger.logError(response.message);
                }
            });
        }

        /* Amazon AWS SES check email status */
        $scope.checkAwsEmailStatus = function () {
            var emailAddress = $rootScope.authenticatedUser.aws_verified_email;
            console.log('$rootScope.authenticatedUser.aws_verified_email', $rootScope.authenticatedUser.aws_verified_email);
            if (emailAddress) {
                User.checkAwsEmailStatus().get({"emailAddress": emailAddress}, function (response) {
                    if (response.code == CONSTANTS.CODES.OK && response.data) {
                        $scope.emailAddress = emailAddress;
                        $scope.aws_verified_email_status = response.data.verifiedStatus;
                    }
                });
            }
        }

    }]);
