angular.module('BasePriceModule', ['LoggerService'])

        /**************************************   Manage BasePrices Section   **************************************/
        /*@function : BasePricesCtrl
         * Creator   : SmartData
         * @created  : 14 July 2015
         * @purpose  : BasePrice management (add , edit etc...)
         */
        .controller('BasePricesCtrl', ['$scope', 'BasePrice', 'User', '$route', 'logger', 'CONSTANTS', 'Module', function ($scope, BasePrice, User, $route, logger, CONSTANTS, Module) {
                // basePrice listing
                $scope.basePriceList = function () {

                    //show hide
                    $scope.showAdd = false;
                    $scope.showView = false;
                    $scope.showEdit = false;
                    $scope.showList = true;

                    BasePrice.listBasePrice().get(function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            Module.pagination(response.data);
//                logger.logSuccess(response.message);
                            console.log("Success : " + response.message);
                        } else {
                            logger.logError(response.message);
                            console.log('Error :' + response.message);
                        }

                    });
                }();

                // show the details of the basePrices
                $scope.basePriceView = function (ids) {
                    //show hide
                    $scope.showAdd = false;
                    $scope.showList = false;
                    $scope.showEdit = false;
                    $scope.showView = true;

                    BasePrice.findByIDBasePrice().get({id: ids}, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            $scope.basePriceInfo = response.data;
//                logger.logSuccess(response.message);
                            console.log("Success : " + response.message);
                        } else {
                            logger.logError(response.message);
                            console.log('Error :' + response.message);
                        }
                    });
                }

                //show add basePrice form with listed avaiable module
                $scope.getAddBasePriceForm = function () {
                    //show hide
                    var basePrice = {
                        'reg_bounds_call': '$0.02/minute',
                        'reg_phone_no': '$1.00/month',
                        'tollfree_bounds_call': '$0.029/minute',
                        'tollfree_phone_no': '$1.25/month',
                        'reg_text_charge': '$0.015/text',
                        'automated_marketing': 'on',
                        'automated_marketing_charges': '$0.02/text or minute',
                        'call_recording': 'on',
                        'call_recording_charges': '$0.002/minute',
                        'auto_accept_offer': true,
                        'call_center_access': true,
                        'lead_generator_access': true,
                        'paid_customer_support': true,
                        'support_charge': '$250/month'
                    }

                    User.listUser().get({id: 'ALL'}, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            $scope.userListDetails = response.data;
                        }
                    });

                    $scope.basePrice = basePrice;
                    $scope.showList = false;
                    $scope.showView = false;
                    $scope.showEdit = false;
                    $scope.showAdd = true;
                    $scope.success = $scope.error = null;
                }

                // create the basePrices
                $scope.createBasePrice = function (basePrice) {

                    BasePrice.addBasePrice().save(basePrice, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            logger.logSuccess(response.message);
                            $route.reload();
                            console.log("Success : " + response.message);
                        } else {
                            logger.logError(response.message);
                            console.log('Error :' + response.message);
                        }
                    });
                }

                //show add basePrice form with listed avaiable module
                $scope.getEditBasePriceForm = function (basePrice) {

                    // get the list of users
                    User.listUser().get({id: 'ALL'}, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            $scope.userListDetails = response.data;
                        }
                    });
                    // get the data
                    BasePrice.findByIDBasePrice().get({id: basePrice}, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {

                            var updateData = {
                                '_id': response.data._id,
                                'auto_accept_offer': response.data.auto_accept_offer,
                                'automated_marketing': response.data.automated_marketing,
                                'automated_marketing_charges': response.data.automated_marketing_charges,
                                'call_center_access': response.data.call_center_access,
                                'call_recording': response.data.call_recording,
                                'call_recording_charges': response.data.call_recording_charges,
                                'created_for': response.data.created_for._id,
                                'lead_generator_access': response.data.lead_generator_access,
                                'paid_customer_support': response.data.paid_customer_support,
                                'reg_bounds_call': response.data.reg_bounds_call,
                                'reg_phone_no': response.data.reg_phone_no,
                                'reg_text_charge': response.data.reg_text_charge,
                                'status': response.data.status,
                                'support_charge': response.data.support_charge,
                                'tollfree_bounds_call': response.data.tollfree_bounds_call,
                                'tollfree_phone_no': response.data.tollfree_phone_no,
                            }
                            $scope.basePrice = updateData;
                            $scope.success = null;
                            console.log("Success : " + response.message);
                        } else {
                            logger.logError(response.message);
                            console.log('Error :' + response.message);
                        }
                    });

                    $scope.showList = false;
                    $scope.showView = false;
                    $scope.showAdd = false;
                    $scope.showEdit = true;
                }

                // edit the basePrices
                $scope.editBasePrice = function (basePrice) {
                    console.log(basePrice);
                    BasePrice.editBasePrice().save(basePrice, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            logger.logSuccess(response.message);
                            console.log("Success : " + response.message);
                        } else {
                            logger.logError(response.message);
                            console.log('Error :' + response.message);
                        }
                    });
                }

                // delete the basePrices
                $scope.deleteBasePrice = function (basePriceids) {
                    if (confirm("Are you sure,You want to delete this entry?")) {
                        BasePrice.deleteBasePrice().save({'basePrice_ids': [{'id': basePriceids}]}, function (response) {
                            if (response.code == CONSTANTS.CODES.OK) {
                                Module.pagination(response.data);
                                logger.logSuccess(response.message);
                                console.log("Success : " + response.message);
                            } else {
                                logger.logError(response.message);
                                console.log('Error :' + response.message);
                            }
                        });
                    }
                }

                // change the status of module
                $scope.statusBasePrice = function (basePrice_id, status) {
                    var basePrice = {
                        'basePrice_id': basePrice_id,
                        'status': status
                    }
                    BasePrice.statusBasePrice().save(basePrice, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            Module.pagination(response.data);
                            logger.logSuccess(response.message);
                            console.log("Success : " + response.message);
                        } else {
                            logger.logError(response.message);
                            console.log('Error :' + response.message);
                        }
                    });
                }

                // back process
                $scope.back = function () {
                    $route.reload();
                }

            }]);