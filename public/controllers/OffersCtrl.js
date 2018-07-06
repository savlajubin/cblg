angular.module('OfferModule', ['LoggerService'])

        /**************************************   Manage Offers Section   **************************************/
        /*@function : OffersCtrl
         * Creator   : SmartData  
         * @created  : 14 July 2015
         * @purpose  : Offer management (add offer, edit offer etc...)
         */
        .controller('OffersCtrl', ['$scope', 'Category', 'Vertical', 'Offer', '$route', 'logger', 'CONSTANTS', function ($scope, Category, Vertical, Offer, $route, logger, CONSTANTS) {

            $scope.restricted_states = [];
            // offer listing
            $scope.offerlist = function () {

                //show hide
                $scope.showAddOffer = false;
                $scope.showViewOffer = false;
                $scope.showEditOffer = false;
                $scope.showListOffer = true;

                Offer.listOffer().get(function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.offerList = response.data;
//                logger.logSuccess(response.message);
                        console.log("Success : " + response.message);
                    } else {
                        logger.logError(response.message);
                        console.log('Error :' + response.message);
                    }

                });
            }();

            // show the details of the offers
            $scope.offerView = function (ids) {

                //show hide
                $scope.showAddOffer = false;
                $scope.showListOffer = false;
                $scope.showEditOffer = false;
                $scope.showViewOffer = true;

                Offer.findByIDOffer().get({id: ids}, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.offerInfo = response.data;
//                logger.logSuccess(response.message);
                        console.log("Success : " + response.message);
                    } else {
                        logger.logError(response.message);
                        console.log('Error :' + response.message);
                    }
                });
            }


            //show add offer form with listed avaiable offer
            $scope.getAddOfferForm = function () {
                //show hide
                $scope.error = null;
                $scope.showListOffer = false;
                $scope.showViewOffer = false;
                $scope.showEditOffer = false;
                $scope.showAddOffer = true;

                Vertical.listVertical().get(function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.verticalList = response.data;
                        $scope.success = null;
                        console.log("Success : " + response.message);
                    } else if (response.code == 404) {
                        logger.logError(response.message);
                        console.log('Error :' + response.message);
                    }

                });
            }


            $scope.showCategoriesByVertical = function (vertical_id) {

                if (vertical_id === undefined) {
                    $scope.error = "Please select the vertical.";
                    $scope.categoryList = null;
                } else {
                    Category.listCategoryByVertical().get({'id': vertical_id}, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            $scope.categoryList = response.data;
                            $scope.success = null;
                            console.log("Success : " + response.message);
                        } else {
                            $scope.categoryList = null;
                            logger.logError(response.message);
                            console.log('Error :' + response.message);
                        }
                    });
                }

            }

            // create offers
            $scope.createOffer = function (offer) {
                console.log(offer);
                offer.restricted_states = $scope.restricted_states;

                Offer.addOffer().save(offer, function (response) {
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

            //show add offer form with listed avaiable offer
            $scope.getEditOfferForm = function (offer) {
                // show hide 
                $scope.showListOffer = false;
                $scope.showViewOffer = false;
                $scope.showAddOffer = false;
                $scope.showEditOffer = true;

                Vertical.listVertical().get(function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.verticalList = response.data;
                        $scope.success = null;
                        console.log("Success : " + response.message);
                    } else if (response.code == 404) {
                        logger.logError(response.message);
                        console.log('Error :' + response.message);
                    }

                });

                Offer.findByIDOffer().get({id: offer}, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        var routing_settings = [];
                        var operation_settings = [];
                        var payment_settings = [];
                        $scope.showCategoriesByVertical(response.data.vertical_id._id);

                        angular.forEach(response.data.routing_settings, function (value, key) {
                            /* do something for all key: value pairs */
                            console.log(value);
                            routing_settings.push({
                                'is_IVR': value.is_IVR,
                                'end_pointPhone': value.end_pointPhone
                            });
                        });
                        angular.forEach(response.data.operation_settings, function (value, key) {
                            /* do something for all key: value pairs */
                            operation_settings.push({
                                'start_day': value.start_day,
                                'end_day': value.end_day,
                                'start_time': value.start_time,
                                'end_time': value.end_time
                            });
                        });
                        angular.forEach(response.data.payment_settings, function (value, key) {
                            /* do something for all key: value pairs */
                            payment_settings.push({
                                'LB': value.LB,
                                'LG': value.LG,
                                'LGN': value.LGN,
                            });
                        });



                        var offer = {
                            '_id': response.data._id,
                            'title': response.data.title,
                            'description': response.data.description,
                            'duration': response.data.duration,
                            'offer_status': response.data.offer_status,
                            'is_unique': response.data.is_unique,
                            'category_id': response.data.category_id._id,
                            'vertical_id': response.data.vertical_id._id,
                            'exclusive_seller_id': response.data.exclusive_seller_id,
                            'start_date': response.data.start_date,
                            'end_date': response.data.end_date,
                            'daily_cap': response.data.daily_cap,
                            'restricted_states': response.data.restricted_states,
                            'routing_settings': routing_settings,
                            'operation_settings': operation_settings,
                            'payment_settings': payment_settings
                        }

                        $scope.offer = offer;
                        $scope.success = null;
                        console.log("Success : " + response.message);
                    } else {
                        logger.logError(response.message);
                        console.log('Error :' + response.message);
                    }
                });
            }


            // edit the offers 
            $scope.editOffer = function (offer) {
                Offer.editOffer().save(offer, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        logger.logSuccess(response.message);
                        console.log("Success : " + response.message);
                    } else {
                        logger.logError(response.message);
                        console.log('Error :' + response.message);
                    }
                });
            }

            // add the data in the list of restricted state
            $scope.addResState = function (states) {
                console.log($scope.searchStr)
                if ($scope.restricted_states.indexOf(states) == -1) {
                    $scope.restricted_states.push(states);
                    $scope.stateTable = true;
                }
                $scope.$broadcast('angucomplete-alt:clearInput');
                console.log($scope.result2)
            }

            // delete the offers 
            $scope.deleteOffer = function (offerids) {
                swal({
                    title: CONSTANTS.SWAL.deletetitle,
                    text: CONSTANTS.SWAL.deletetext,
                    type: CONSTANTS.SWAL.type,
                    showCancelButton: CONSTANTS.SWAL.showCancelButton,
                    confirmButtonColor: CONSTANTS.SWAL.confirmButtonColor,
                    confirmButtonText: CONSTANTS.SWAL.deleteconfirmButtonText,
                    closeOnConfirm: CONSTANTS.SWAL.closeOnConfirm},
                function () {
                    Offer.deleteOffer().save({'offer_ids': [{'id': offerids}]}, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            $scope.offerList = response.data;
                            logger.logSuccess(response.message);
                            console.log("Success : " + response.message);
                        } else {
                            logger.logError(response.message);
                            console.log('Error :' + response.message);
                        }
                    });
                });
            }


            // change the status of offer
            $scope.statusOffer = function (offer_id, status) {
                var offer = {
                    'offer_id': offer_id,
                    'status': status
                }
                Offer.statusOffer().save(offer, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.offerList = response.data;
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