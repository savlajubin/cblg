/*@function : LgUserCtrl
 * Creator   : Smartdata(B2)
 * @purpose  : To manage lead generation users
 */
app.controller('OfferTemplateCtrl', ['$scope', '$route', '$routeParams', 'logger', 'Upload', 'Vertical', 'Category', 'OfferTemplate', '$location', 'ngAudio', 'CONSTANTS', 'Module', function ($scope, $route, $routeParams, logger, Upload, Vertical, Category, OfferTemplate, $location, ngAudio, CONSTANTS, Module) {
    $scope.tab = 0;
    $scope.current_offer_id = null;
    /*$scope.existing_user_id = $rootScope.authenticatedUser._id;*/
    $scope.selectedState = "";
    $scope.selected_offer_id = $routeParams.offerid;
    $scope.setTab = function (tabId) {
        $scope.common_err = false;
        $scope.tab = tabId;
        switch (tabId) {
            case 0 :
                //call to get vertical/contract info
                $scope.get_verticalInfo();
                break;
            case 1 :
                //To get pay per call info
                $scope.get_payPerCallInfo();
                break;
            case 2 :
                //To get state restricted info
                $scope.get_stateRestrictInfo();
                break;
            case 5 :
                //To get state restricted info
                $scope.get_durationInfo();
                break;
            case 6 :
                //To get state restricted info
                $scope.get_dailyCapInfo();
                break;

            default :

                break;
        }
    };

    /*start code for offer edit/retrieve data        */
    $scope.isSet = function (tabId) {
        return $scope.tab === tabId;
    };

    //To get vertical list
    $scope.get_verticalList = function () {
        Vertical.listVertical().get(function (response) {
            $scope.verticalList = response.data;
            if ($routeParams.offerid) {
                $scope.form_type = "Edit";
                console.log('offerid')
                $scope.current_offer_id = $routeParams.offerid;
                OfferTemplate.getlistOfferTemplateByID().save({_id: $routeParams.offerid, user_id: $scope.existing_user_id}, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        var offer_data = response.data;
                        $scope.showCategoriesByVertical(offer_data.vertical_category_details.vertical_id);
                        $scope.catVert = offer_data.vertical_category_details;
                        $scope.pp = offer_data.pay_per_call;
                        $scope.restricted_states = offer_data.state_restricted || [];
                        $scope.duration = offer_data.duration;
                        $scope.dc = offer_data.daily_caps;

                    } else {
                        $scope.categoryList = null;
                        logger.logError(response.message);
                    }
                })
            } else {
                console.log('No offerid')
                $scope.form_type = "Add";
            }

        });
    }();

    //Show categories for selected vertical
    $scope.showCategoriesByVertical = function (vertical_id) {

        Category.listCategoryByVertical().get({'id': vertical_id}, function (response) {
            if (response.code == CONSTANTS.CODES.OK) {
                $scope.categoryList = response.data;
            } else {
                $scope.categoryList = null;
                logger.logError(response.message);
            }
        });
    }
    //To get vertical/contract info
    $scope.get_verticalInfo = function () {

    }

    //to store vertical/category tab data
    $scope.submitVerticalCatInfo = function (catVert) {
        if (!$scope.cat_form.$valid) {
            logger.logError("Please fill all the required fields");
            return false;
        }
        OfferTemplate.saveCatVertInfo().save({user_id: $scope.existing_user_id, current_offer_id: $scope.current_offer_id, vertical_category_details: catVert}, function (response) {

            if (response.code == CONSTANTS.CODES.OK) {
                $scope.current_offer_id = response.data.offer_id;
                logger.logSuccess(response.message);
                $scope.setTab(1);
            } else {
                $route.reload();
                logger.logError(response.message);
            }
        });
    }

    //To get pay per call info
    $scope.get_payPerCallInfo = function () {

    }

    //to store pay per call info tab data
    $scope.submitpayPerCallInfo = function (pp) {
        if (!$scope.pp_form.$valid) {
            logger.logError("Please fill all the required fields");
            return false;
        }
        OfferTemplate.savepayPerCallInfo().save({current_offer_id: $scope.current_offer_id, user_id: $scope.existing_user_id, pay_per_call: pp}, function (response) {
            if (response.code == CONSTANTS.CODES.OK) {
                logger.logSuccess(response.message);
            } else {
                logger.logError(response.message);
            }
        });
    }

    //To get state Restrict info
    $scope.get_stateRestrictInfo = function () {
        OfferTemplate.getStatesList().get(function (response) {
            if (response.code == CONSTANTS.CODES.OK) {
                $scope.preStates = response.data;
            } else {
                $scope.categoryList = null;
                logger.logError(response.message);
            }
        });
    }
    $scope.restricted_states = [];
    // add the data in the list of restricted state
    $scope.addResState = function (states) {
        console.log($scope.searchStr)
        if ($scope.restricted_states.indexOf(states) == -1 && ($scope.result2 && $scope.result2.title != '')) {
            $scope.restricted_states.push(states);
            $scope.stateTable = true;
        }
        $scope.$broadcast('angucomplete-alt:clearInput');
        console.log($scope.result2)
    }

    //To delete  state
    $scope.deleteState = function (index)
    {
        $scope.restricted_states.splice(index, 1);
        if (!$scope.restricted_states.length) {
            $scope.stateTable = false;
        }
    }

    //to store state Restrict info tab data
    $scope.submitstateRestrictInfo = function (pp) {
        if (!$scope.sr_form.$valid) {
            logger.logError("Please fill all the required fields");
            return false;
        }
        OfferTemplate.savestateRestrictInfo().save({current_offer_id: $scope.current_offer_id, user_id: $scope.existing_user_id, state_restricted: $scope.restricted_states}, function (response) {
            if (response.code == CONSTANTS.CODES.OK) {
                logger.logSuccess(response.message);
            } else {
                logger.logError(response.message);
            }
        });
    }


    //To get pay per call info
    $scope.get_durationInfo = function () {
//        if ($routeParams.offerid) {
//            $scope.showAudio = true;
//            var filepath1 = $scope.arb.value.replace('public/assets', 'assets')
//            $scope.get_greeting_audio2 = ngAudio.load(filepath1)
//        }
    }

    //to store pay per call info tab data
    $scope.submitDurationInfo = function (duration) {
        if (!$scope.duration_form.$valid) {
            logger.logError("Please fill all the required fields");
            return false;
        }
        OfferTemplate.saveDurationInfo().save({current_offer_id: $scope.current_offer_id, user_id: $scope.existing_user_id, duration: duration}, function (response) {
            if (response.code == CONSTANTS.CODES.OK) {
                logger.logSuccess(response.message);
            } else {
                logger.logError(response.message);
            }
        });
    }
    //To get pay per call info
    $scope.get_dailyCapInfo = function () {
        if ($scope.dc.setting_option == 'leave_message') {
            $scope.showAudio2 = true;
            $scope.dc.values = $scope.dc.value;
            $scope.dc.extra_fields = $scope.dc.extra_field;
            $scope.dc.value = '';
            $scope.dc.extra_field = '';
            var filepath1 = $scope.dc.values.replace('public/assets', 'assets')
            $scope.get_greeting_audio2 = ngAudio.load(filepath1)
        }
    }

    //to store pay per call info tab data
    $scope.submitDailyCapInfo = function (dc) {
        if (!$scope.dc_form.$valid) {
            logger.logError("Please fill all the required fields");
            return false;
        }
        /*OfferTemplate.saveDailyCapInfo().save({current_offer_id : $scope.current_offer_id,user_id : $scope.existing_user_id,daily_caps : dc,process_status: true},function(response){
         if (response.code == CONSTANTS.CODES.OK) {
         logger.logSuccess(response.message);
         } else {
         logger.logError(response.message);
         }
         });
         */
        if (dc && dc.values && typeof dc.values.size != 'undefined') {
            Upload.upload({
                url: '/api_offer/saveDailyCapInfo',
                file: dc.values || [],
                fields: {current_offer_id: $scope.current_offer_id, "extra_field": dc.extra_fields, "setting_option": dc.setting_option, "is_reduce_rate": dc.is_reduce_rate, "reduced_rate": dc.reduced_rate, "process_status": true}
            }).success(function (data, status, headers, config) {
                logger.logSuccess(data.message);
                $scope.showAudio2 = true;
                $scope.dc.value = data.data;
                var filepath1 = $scope.dc.value.replace('public/assets', 'assets');
                $scope.get_greeting_audio2 = ngAudio.load(filepath1)
            });
        } else {
            $scope.showAudio2 = false;
            Upload.upload({
                url: '/api_offer/saveDailyCapInfo',
                fields: {current_offer_id: $scope.current_offer_id, "extra_field": dc.extra_field, "setting_option": dc.setting_option, "value": dc.value, "is_reduce_rate": dc.is_reduce_rate, "reduced_rate": dc.reduced_rate, "process_status": true}
            }).success(function (data, status, headers, config) {
                logger.logSuccess(data.message);
            });
        }
    }

    /*End code for offer edit/retrieve data */

    $scope.backToBoard = function () {
        $route.reload();
    }

    //to get  all offer template
    $scope.listOfferTemplate = function () {
        OfferTemplate.listOfferTemplate().get(function (response) {
            Module.pagination(response.data);
        })
    }

    //get data to modify offer template
    $scope.editOfferTemplate = function (offerid) {
        $location.path('/admin/original-offer/' + offerid);
    }

    //Got to particular link
    $scope.goTOLink = function (link) {
        $location.path(link);
    }
    //get data to modify offer template
    $scope.viewofferTemplate = function (id) {

        OfferTemplate.getlistOfferTemplateByIDWhole().save({_id: id, user_id: $scope.existing_user_id}, function (response) {
            if (response.code == CONSTANTS.CODES.OK) {
                $scope.offerView = response.data;
            } else {
                logger.logError(response.message);
            }
        })
    }

    //get data to change staus of offer template
    $scope.statusOfferTemplate = function (offerid, status, process_status) {
        if (process_status) {
            OfferTemplate.statusOfferTemplateByID().save({'_id': offerid, 'user_id': $scope.existing_user_id, 'active_status': status}, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    logger.logSuccess(response.message);
                    Module.pagination(response.data);
                } else {
                    logger.logError(response.message);
                }
            })
        } else {
            logger.logError('Please complete offer.');
        }
    }

    //get data to delete offer template
    $scope.deleteOfferTemplate = function (offerid) {
        swal({
            title: CONSTANTS.SWAL.deletetitle,
            text: CONSTANTS.SWAL.deletetext,
            type: CONSTANTS.SWAL.type,
            showCancelButton: CONSTANTS.SWAL.showCancelButton,
            confirmButtonColor: CONSTANTS.SWAL.confirmButtonColor,
            confirmButtonText: CONSTANTS.SWAL.deleteconfirmButtonText,
            closeOnConfirm: CONSTANTS.SWAL.closeOnConfirm},
        function () {
            OfferTemplate.deleteOfferTemplateByID().save({'_id': offerid, 'user_id': $scope.existing_user_id}, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    logger.logSuccess(response.message);
                    Module.pagination(response.data);
                } else {
                    logger.logError(response.message);
                }
            });
        });
    }

    //To jump to add new offer template page
    $scope.getAddOfferForm = function () {
        $location.path('/admin/original-offer');
    }


}]);