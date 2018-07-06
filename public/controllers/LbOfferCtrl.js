/*@function : LbOfferCtrl
 * Creator   : Smartdata(B2)
 * @purpose  : To manage lead buyers offers
 */
app.controller('LbOfferCtrl', ['$scope', '$builder', '$modal', 'Campaign', 'CONSTANTS', '$rootScope', '$routeParams', 'logger', '$filter', 'Category', 'OfferTemplate', '$location', 'Offer', 'ngAudio', 'Module', 'User', 'Prompt', 'ADVCC', function ($scope, $builder, $modal, Campaign, CONSTANTS, $rootScope, $routeParams, logger, $filter, Category, OfferTemplate, $location, Offer, ngAudio, Module, User, Prompt, ADVCC) {
        $scope.tab = 0;
        $scope.timezones = CONSTANTS.timezones;
        $scope.current_offer_id = null;
        $scope.selectedState = "";
        $scope.selected_offer_id = $routeParams.offerid;
        $scope.catVert = {};
        $scope.catVert.title = '';
        $scope.setTab = function (tabId) {
            $scope.common_err = false;
            $scope.tab = tabId;
            switch (tabId) {
                case 20 :
                    //call to get vertical/contract info
                    $scope.getExistingOfferTemplate();
                    break;
                case 0 :
                    //To get pay per call info
                    $scope.get_verticalList();
                    break;
                case 1 :
                    //To get pay per call info
                    $scope.get_verticalList();
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
                case 7 :
                    //To get state restricted info
                    $scope.get_HOOdata();
                    break;
//            case 8 :
//                //To get state restricted info
//                $scope.get_ComposeMessageData();
//                break;

                default :

                    break;
            }
        };

        /*start code for offer edit/retrieve data        */
        $scope.isSet = function (tabId) {
            return $scope.tab === tabId;
        };



        $scope.getExistingOfferTemplate = function () {
            $builder.forms['default'] = [];
            $scope.formScriptData = $builder.forms['default'];

            Offer.listOriginalOfferTemplate().get(function (response) {
                $scope.existOfferTemplate = response.data;
            });
        }


        //To get vertical list
        $builder.forms['default'] = [];
        $builder.addFormObject('default', {
            id: 0,
            index: 0,
            component: 'email',
            label: 'Email',
            description: '',
            required: true,
            editable: false
        });
        $scope.formScriptData = $builder.forms['default'];

        $scope.get_verticalList = function () {
            $scope.web = {webAffiliateMode: false};
            if ($routeParams.offerid) {
                OfferTemplate.getlistOfferTemplateByIDWhole().save({_id: $routeParams.offerid}, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        var offer_data = response.data;
                        delete offer_data.vertical_category_details.title;
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
                console.log('edit 2');
                $scope.web = {webAffiliateMode: false};
                $builder.forms['default'] = [];
                $scope.formScriptData = $builder.forms['default'];

                Offer.getlistOfferTemplateByID().save({_id: $routeParams.editOfferid}, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        var offer_data = response.data;
                        $scope.catVert = offer_data.vertical_category_details;
                        $scope.pp = offer_data.pay_per_call;
                        $scope.restricted_states = offer_data.state_restricted || [];
                        $scope.duration = offer_data.duration;
                        $scope.dc = offer_data.daily_caps;
                        if (offer_data.web_affiliate.scriptData) {
                            $scope.web = {
                                "webAffiliateMode": offer_data.web_affiliate.webAffiliateMode,
                                "leadAmountType": offer_data.web_affiliate.leadAmountType,
//                            "webLeadAmount": offer_data.web_affiliate.webLeadAmount
                                "lbamount": offer_data.web_affiliate.lbamount,
                                "lgamount": offer_data.web_affiliate.lgamount,
                                "lgnamount": offer_data.web_affiliate.lgnamount
                            };

                            angular.forEach(offer_data.web_affiliate.scriptData, function (element, eIndex) {
                                $builder.insertFormObject('default', element.index, {
                                    id: element.index, //eIndex,
                                    index: element.index, //'name',
                                    component: element.component, //'name',
                                    label: element.label, //'Name',
                                    description: element.description, //'Your name',
                                    placeholder: element.placeholder, //'Your name',
                                    required: element.required, //true,
                                    editable: element.editable, //true
                                    options: element.optionsArr, //[1,2]

                                    firstNameLabel: element.firstNameLabel,
                                    lastNameLabel: element.lastNameLabel,
                                    addressOneLabel: element.addressOneLabel,
                                    addressTwoLabel: element.addressTwoLabel,
                                    cityLabel: element.cityLabel,
                                    stateLabel: element.stateLabel,
                                    zipCodeLabel: element.zipCodeLabel
                                });
                            });

                            $scope.formScriptData = $builder.forms['default'];
                        } else {
                            $builder.addFormObject('default', {
                                id: 0,
                                index: 0,
                                component: 'email',
                                label: 'Email',
                                description: '',
                                required: true,
                                editable: false
                            });
                            $scope.formScriptData = $builder.forms['default'];
                        }

                    } else {
                        $scope.categoryList = null;
                        logger.logError(response.message);
                    }
                })
            }
        };

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

            if ($routeParams.offerid) {
                catVert.vertical_name = catVert.vertical_id.vertical_name;
                catVert.category_name = catVert.category_id.category_name;
            } else {

                $scope.current_offer_id = $routeParams.editOfferid;
            }
            Offer.saveCatVertInfo().save({current_offer_id: $scope.current_offer_id, vertical_category_details: catVert}, function (response) {

                if (response.code == CONSTANTS.CODES.OK) {
                    $scope.current_offer_id = response.data.offer_id;
                    console.log($scope.current_offer_id)
                    logger.logSuccess(response.message);
                    $scope.setTab(1);
                } else {
                    $scope.categoryList = null;
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
            Offer.savepayPerCallInfo().save({current_offer_id: $scope.current_offer_id, pay_per_call: pp}, function (response) {
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
            var states = [];
            $scope.restricted_states.forEach(function (state) {
                states.push(state.name_long);
            });
            Offer.savestateRestrictInfo().save({current_offer_id: $scope.current_offer_id, state_restricted: states}, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    logger.logSuccess(response.message);
                } else {
                    logger.logError(response.message);
                }
            });
        }


        //To get pay per call info
        $scope.get_durationInfo = function () {

        }

        //to store pay per call info tab data
        $scope.submitDurationInfo = function (duration) {
            if (!$scope.duration_form.$valid) {
                logger.logError("Please fill all the required fields");
                return false;
            }
            Offer.saveDurationInfo().save({current_offer_id: $scope.current_offer_id, duration: duration}, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    logger.logSuccess(response.message);
                } else {
                    logger.logError(response.message);
                }
            });
        }


        $scope.get_dailyCapInfo = function () {
            if ($scope.dc.setting_option == 'leave_message') {
                console.log('[data], [...]')
                $scope.showAudio2 = true;
                $scope.dc.values = $scope.dc.value;
                $scope.dc.extra_fields = $scope.dc.extra_field;
                $scope.dc.value = '';
                $scope.dc.extra_field = '';
                var filepath1 = $scope.dc.values.replace('public/assets', 'assets')
                $scope.get_greeting_audio2 = ngAudio.load(filepath1)
            }
        }


        $scope.submitDailyCapInfo = function (dc) {
            console.log(dc);
            if (!$scope.dc_form.$valid) {
                logger.logError("Please fill all the required fields");
                return false;
            }
            OfferTemplate.saveDailyCapInfo1().save({current_offer_id: $scope.current_offer_id, user_id: $scope.existing_user_id, daily_caps: dc, process_status: true}, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    logger.logSuccess(response.message);
                } else {
                    logger.logError(response.message);
                }
            });

            /* if (dc && dc.values && typeof dc.values.size != 'undefined') {
             Upload.upload({
             url: '/api_offer/saveDailyCapInfo_lb',
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
             url: '/api_offer/saveDailyCapInfo_lb',
             fields: {current_offer_id: $scope.current_offer_id, "extra_field": dc.extra_field, "setting_option": dc.setting_option, "value": dc.value, "is_reduce_rate": dc.is_reduce_rate, "reduced_rate": dc.reduced_rate, "process_status": true}
             }).success(function (data, status, headers, config) {
             logger.logSuccess(data.message);
             });
             }*/
        }

        /*End code for offer edit/retrieve data */
        //Got to particular link
        $scope.goTOLink = function (link) {
            $location.path(link);
        }

        $scope.backToBoard = function () {
            $location.path('/' + $filter('lowercase')($rootScope.authenticatedUser.role_id.code) + '/list-offers');
        }

        //to get  all offer template
        $scope.listOfferTemplate = function () {
            Offer.listOfferTemplate().get(function (response) {
                //$scope.paginationData(response.data,1);
                Module.pagination(response.data);
            })
        }
        //get data to modify offer template
        $scope.viewOffer = function (id) {

            Offer.getOffferDetailsByID().save({_id: id}, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    $scope.offerView = response.data;
                } else {
                    logger.logError(response.message);
                }
            })
        }

        //get data to modify offer template
        $scope.addOfferTemplate = function (offerid) {
            $location.path('/' + $filter('lowercase')($rootScope.authenticatedUser.role_id.code) + '/new-offer/' + offerid);
        }

        //get data to modify offer template
        $scope.editOfferTemplate = function (offerid) {
            $scope.formType = 'edit';
            $location.path('/' + $filter('lowercase')($rootScope.authenticatedUser.role_id.code) + '/edit-offer/' + offerid);
        }

        //get data to change staus of offer template
        $scope.statusOfferTemplate = function (offerid, status, process_status) {
            if (process_status) {
                Offer.statusOfferTemplateByID().save({'_id': offerid, 'active_status': status}, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        logger.logSuccess(response.message);
                        Module.pagination(response.data)
                        //$scope.paginationData(response.data,0);
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
                Offer.deleteOfferTemplateByID().save({'_id': offerid}, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        logger.logSuccess(response.message);
                        Module.pagination(response.data)
                        //$scope.paginationData(response.data,0);
                    } else {
                        logger.logError(response.message);
                    }
                });
            });
        }

        $scope.tooltipData = {};
        $scope.listActiveSellers = function (offerid, index) {
            if (!$scope.tooltipData[index]) {
                Offer.listActiveSellersForOffer().save({'offer_id': offerid}, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.tooltipData[index] = response.data;
                    } else {
                        logger.logError(response.message);
                    }
                });
            }
        }


        //To list all current campaigns
        $scope.list_currentCampaignsLB = function () {
            Offer.list_currentCampaignsLB().get({}, function (response) {
                // console.log(response);
                if (response.data && response.data[0] && response.data[0].campaigns) {
                    var campaigns = [];
                    response.data.forEach(function (item) {
                        item.campaigns.forEach(function (campaign) {
                            /* Campaign Token Encryption */
                            //var secretString = JSON.stringify('campaignTokenForWebLeadApi');
                            //var encrypted = CryptoJS.TripleDES.encrypt(secretString, campaign._id).toString();
                            var encrypted = CryptoJS.AES.encrypt(campaign._id, "campaignTokenForWebLeadApi").toString();
                            campaign.campaign_token = encrypted;

                            campaigns.push(campaign);
                            //console.log(campaigns);
                        });
                    });
                    Module.pagination(campaigns);

                } else {
                    Module.pagination({});
                }
            })
        }


        $scope.getDataByDate = function (dateData) {
            Offer.getLBOffersByCreated().save(dateData, function (response) {
                console.log(response);
                if (response.code == CONSTANTS.CODES.OK) {
                    Module.pagination(response.data, 1);
                }
            });
        }

        $scope.restricted_methods = [];
        $scope.medias = [
            {"slug": "content_review", "name": "Content / Review Site"},
            {"slug": "discount_coupon", "name": "Discount / Coupon Site"},
            {"slug": "display", "name": "Display"},
            {"slug": "email", "name": "Email"},
            {"slug": "rewards_incentive", "name": "Rewards / Incentive"},
            {"slug": "leadform", "name": "Lead Form / Co Reg"},
            {"slug": "search", "name": "Search"},
            {"slug": "socialmedia", "name": "Social Media"},
            {"slug": "software", "name": "Software"},
            {"slug": "apps", "name": "Apps"},
            {"slug": "sms", "name": "SMS"},
            {"slug": "business", "name": "Business Publication"},
            {"slug": "allCenter", "name": "All Center"},
            {"slug": "directMail", "name": "Direct Mail"},
            {"slug": "directory", "name": "Directory"},
            {"slug": "newspaper", "name": "Newspaper"},
            {"slug": "fsi", "name": "Free Standing Insert (FSI)"},
            {"slug": "in-call", "name": "In-Call Ad"},
            {"slug": "magazine", "name": "Magazine"},
            {"slug": "outdoor", "name": "Outdoor"},
            {"slug": "radio", "name": "Radio"},
            {"slug": "tv", "name": "TV"},
            {"slug": "other", "name": "Other"}
        ];

        $scope.submitMediaRestrictData = function () {
            var methods = [];
            $scope.restricted_methods.forEach(function (method) {
                methods.push(method.slug);
            });
            Offer.saveMediaRestrictData().save({current_offer_id: $scope.current_offer_id, media_restricted: methods}, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    logger.logSuccess(response.message);
                } else {
                    logger.logError(response.message);
                }
            });
        }
        //for status change
        $scope.changeTestCampignStatus = function (campaign_id, test_purpose, created_by) {

            var user = {
                'user_id': created_by,
                'campaign_id': campaign_id,
                'test_purpose': test_purpose
            }
            User.changeTestCampignStatus().save(user, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    $scope.list_currentCampaignsLB();
                    logger.logSuccess(response.message);
                } else {
                    logger.logError(response.message);
                }
            });
        }


        $scope.webAffiliateToken1 = Date.now() + Math.random().toString(36).substr(2);

        $scope.submitWebAffiliateInfo = function (formData, formScriptData) {

            if (!$scope.webLeadForm.$valid) {
                console.log('if error');
                logger.logError("Please fill all the required fields");
                return false;
            } else if (formScriptData == '' && formData.webAffiliateMode) {
                console.log('else error');
                logger.logError("Please create web lead form");
                return false;
            }

            var token = formData.webAffiliateMode ? $scope.webAffiliateToken1 : '';
            var formDataNew = {};
            if (formData.webAffiliateMode) {
                formDataNew = formData;
            } else {
                formDataNew['webAffiliateMode'] = formData.webAffiliateMode;
            }
            var formScriptData = formData.webAffiliateMode ? formScriptData : [];

            Offer.saveWebAffiliateInfo().save({current_offer_id: $scope.current_offer_id, webAffiliateformData: formDataNew, webAffiliateScript: formScriptData, token: token}, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    $scope.setTab(3);
                    logger.logSuccess(response.message);
                } else {
                    logger.logError(response.message);
                }
            });
        }

//    /* To Get html of web lead script */
//    $scope.getHtmlCode = function () {
//
//        if ($location.host() == 'localhost') {
//            var baseUrl = $location.protocol() + "://" + $location.host() + ":" + $location.port();
//        } else {
//            var baseUrl = $location.protocol() + '://' + $location.host();
//        }
//
//        var htmlcode = $('#scriptDataCode').html().replace('<!-- ngRepeat: object in form -->', '').replace('<!-- end ngRepeat: object in form -->', '').trim();
//
////        if (htmlcode) {
////            var htmlcode = '<html><body><form name="webAffiliateForm" method="Post" action="' + baseUrl + '/webAffiliateProgram/' + $scope.webAffiliateToken + '">';
////            htmlcode += $('.form-horizontal').html().replace('<!-- ngRepeat: object in formObjects -->', '').replace('<!-- end ngRepeat: object in formObjects -->', '');
////            htmlcode += '<input type="submit" name="submit" value="Submit"></form></body></html>';
////        }
//        console.log('htmlCode', htmlcode);
//        if (htmlcode) {
//            var htmlcode = '<html><head><script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js"></script></head><body><form name="webAffiliateForm">'
//            htmlcode += $('#scriptDataCode').html().replace('<!-- ngRepeat: object in form -->', '').replace('<!-- end ngRepeat: object in form -->', '');
//            htmlcode += '<input type="submit" id="createWebLeadBtn" name="submit" value="Submit"></form></body></html>';
//            htmlcode += '<script>\n\
//                    $(document).ready(function () {\n\
//                        $("#createWebLeadBtn").click(function () {\n\
//                            $.ajax({url: "' + baseUrl + '/webAffiliateProgram/' + $scope.campaingIdForWebAffiliate + '",\n\
//                                type: "POST",\n\
//                                data: $("form").serialize(),\n\
//                                success: function (result) {\n\
//                                    if (result.status == 200) { \n\
//                                        alert("Success");\n\
//                                        window.location.href = "' + baseUrl + '/#!/support";\n\
//                                    }\n\
//                                }});\n\
//                            return false;\n\
//                        });\n\
//                    }); \n\
//                    </script>';
//        }
//
//        $scope.htmlFormElement = htmlcode;
//
//        $scope.createHtmlCodeScriptModal.$promise.then($scope.createHtmlCodeScriptModal.hide);
//        var createHtmlCodeFormModal = $modal({scope: $scope, contentTemplate: 'htmlCode', show: false});
//        createHtmlCodeFormModal.$promise.then(createHtmlCodeFormModal.show);
//    }



        /* To Get html of web lead script */
        $scope.getHtmlCode = function () {

            if ($location.host() == 'localhost') {
                var baseUrl = $location.protocol() + "://" + $location.host() + ":" + $location.port();
            } else {
                var baseUrl = $location.protocol() + '://' + $location.host();
            }

            //var postDataURL = baseUrl + '/webAffiliateProgram/' + $scope.campaingIdForWebAffiliate;
            var postDataURL = baseUrl + '/webAffiliateProgram/' + $scope.webAffiliateToken;

            var htmlcode = $('#scriptDataCode').html().replace('<!-- ngRepeat: object in form -->', '').replace('<!-- end ngRepeat: object in form -->', '').trim();

            if (htmlcode) {
                var hh = '<link rel="stylesheet" href="' + baseUrl + '/assets/css/bootstrap.css"><style>.pad0{padding:0!important}.padL0{padding-left:0!important}.padR0{padding-right:0!important}.formBuilderWrapper .panel.panel-default{border:1px solid #ddd}.formBuilderWrapper .panel-heading{cursor:pointer}.formBuilderCloseBtn{position:absolute;top:10px;right:10px}h3.popover-title{margin-top:25px}.fb-form-object-editable,.fb-form-object{border:1px solid #cbd2d5;margin-bottom:10px;width:100%;display:inline-block;background-color:#fff;padding:0}.fb-form-object-editable.empty{border:1px dashed #aaa}.fb-form-object-editable:hover,.fb-form-object:hover{box-shadow:1px 1px 10px 0 rgba(0,0,0,0.1);-webkit-box-shadow:1px 1px 10px 0 rgba(0,0,0,0.1);-moz-box-shadow:1px 1px 10px 0 rgba(0,0,0,0.1)}.formBuilderWrapper .form-group.fb_element{margin:0}.formBuilderWrapper h4.panel-heading{padding-left:0;padding-right:0;border-bottom:1px solid #cbd2d5}.formBuilderWrapper .form-group>label.control-label.headLabel{position:relative;text-align:left!important;background-color:#c8dff8;color:#31708f;padding:5px 20px 5px 5px;border-bottom-right-radius:35px;display:inline-block;margin-bottom:10px}h3.popover-title{background-color:transparent;border-bottom:0}.fb-component{padding:8px 10px;cursor:move;border:1px dotted #3190e7;margin:2px 0;text-transform:capitalize}.fb-component:hover{background-color:#3190e7;color:#fff}.fb-draggable.dragging{color:#333;height:auto!important}div.formBuilderCloseBtn button.btn.btn-xs{background-color:transparent;color:#3190e7;border:1px dotted #3190e7;border-radius:0!important;margin:0 -1px 0 0}div.formBuilderCloseBtn button.btn.btn-xs.btn-info:hover{color:#fff;background-color:#31b0d5;border-color:#269abc}div.formBuilderCloseBtn button.btn.btn-xs.btn-success:hover{color:#fff;background-color:#449d44;border-color:#398439}div.formBuilderCloseBtn button.btn.btn-xs.btn-primary:hover{color:#fff;background-color:#286090;border-color:#204d74}div.formBuilderCloseBtn button.btn.btn-xs.btn-danger:hover{color:#fff;background-color:#c9302c;border-color:#ac2925}div.formBuilderCloseBtn button.btn.btn-xs.btn-warning:hover{color:#fff;background-color:#ec971f;border-color:#d58512}</style>'

                var htmlcode = '<html>\n<body>' + hh + '\n<div class="formBuilderWrapper"><form name="webAffiliateForm">\n'

                //var htmlcode = '<html>\n<body>\n<form name="webAffiliateForm">\n'
                htmlcode += $('#scriptDataCode').html().replace('<!-- ngRepeat: object in form -->', '').replace('<!-- end ngRepeat: object in form -->', '');
                htmlcode += '\n<input type="submit" id="createWebLeadBtn" name="submit" value="Submit">\n</form></div>\n</body>\n</html>\n';
                htmlcode += '<script>\n\
                var form = document.querySelector("form");\n\
                form.onsubmit = function (e) {\n\
                    // stop the regular form submission\n\
                    e.preventDefault();\n\
                    // collect the form data while iterating over the inputs\n\
                    var data = {};\n\
                    for (var i = 0, ii = form.length; i < ii-1; ++i) {\n\
                        var input = form[i];\n\
                        if (input.name) {\n\
                            data[input.name] = input.value;\n\
                        }\n\
                    }\n\
                    var http = new XMLHttpRequest();\n\
                    http.open("POST", "' + postDataURL + '", true);\n\
                    http.setRequestHeader("Content-Type", "application/json; charset=UTF-8");\n\
                    http.setRequestHeader("Connection", "close");\n\
                    http.onreadystatechange = function() {\n\
                        if (http.readyState == 4 && http.status == 200) {\n\
                            if (http.responseText){\n\
                                var responseArr = JSON.parse(http.responseText);\n\
                                if(responseArr.redirectUrl){\n\
                                    window.location = responseArr.redirectUrl;\n\
                                }else{\n\
                                    alert(responseArr.message);\n\
                                }\n\
                            }\n\
                        }\n\
                    };\n\
                    http.send(JSON.stringify(data));\n\
                };\n\
            </script>';
            }

            $scope.htmlFormElement = htmlcode;

            $scope.createHtmlCodeScriptModal.$promise.then($scope.createHtmlCodeScriptModal.hide);
            var createHtmlCodeFormModal = $modal({scope: $scope, contentTemplate: 'htmlCode', show: false});
            createHtmlCodeFormModal.$promise.then(createHtmlCodeFormModal.show);
        }


        /* To get Web Lead Script */
        $scope.getWebLeadScript = function (offerDetials, campaignId) {

            $scope.campaingIdForWebAffiliate = campaignId;

            /* Get Camapign Details by Id */
            Campaign.findByIDCampaign().get({"id": campaignId}, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    $scope.webAffiliateToken = response.data.web_affiliate_url_token;
                    $scope.redirectURL = response.data.web_affiliate_redirect_url;

                    $builder.forms['default'] = [];
                    angular.forEach(_.sortBy(offerDetials.web_affiliate.scriptData, 'index'), function (element, eIndex) {
                        $builder.addFormObject('default', {
                            id: element.index, //eIndex,
                            index: element.index, //'name',
                            component: element.component, //'name',
                            label: element.label, //'Name',
                            description: element.description, //'Your name',
                            placeholder: element.placeholder, //'Your name',
                            required: element.required, //true,
                            //editable: element.editable, //true
                            editable: false, //false
                            options: element.optionsArr, //true

                            firstNameLabel: element.firstNameLabel,
                            lastNameLabel: element.lastNameLabel,
                            addressOneLabel: element.addressOneLabel,
                            addressTwoLabel: element.addressTwoLabel,
                            cityLabel: element.cityLabel,
                            stateLabel: element.stateLabel,
                            zipCodeLabel: element.zipCodeLabel
                        });
                    });

                    $scope.formScriptData = $builder.forms['default'];

                    var createHtmlCodeScriptModal = $modal({scope: $scope, templateUrl: "/views/lg/webLeadScriptForm.html", show: false});
                    $scope.createHtmlCodeScriptModal = createHtmlCodeScriptModal;
                    createHtmlCodeScriptModal.$promise.then(createHtmlCodeScriptModal.show);

                } else {
                    logger.logError(response.message);
                }
            });
        }


        /* To get Web Lead Script */
        $scope.getWebLeadApInput = function (offerDetials, campaignId, campaignApiToken) {

            //$scope.campaingIdForWebAffiliate = campaignId;
            console.log('campaignId', campaignId);
            console.log('campaignApiToken', campaignApiToken);

            /* Get Camapign Details by Id */
            Campaign.findByIDCampaign().get({"id": campaignId}, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    $scope.webAffiliateToken = response.data.web_affiliate_url_token;
                    $scope.redirectURL = response.data.web_affiliate_redirect_url;

                    if (offerDetials && offerDetials.web_affiliate.scriptData) {
                        var scriptDetails = [];
                        var scriptDataLength = offerDetials.web_affiliate.scriptData.length;

                        angular.forEach(offerDetials.web_affiliate.scriptData, function (scriptData, index) {
                            scriptDetails.push({"label": scriptData.label, "component": scriptData.component, "index": scriptData.index, "value": ""});

                            if (scriptDataLength == index + 1) {

                                /* Encrypt user id for web lead api */
                                var encryptedUserId = CryptoJS.AES.encrypt($rootScope.userIdForApi, "userIdForWebLeadApi").toString();

                                var response = {
                                    "campaignToken": campaignApiToken,
                                    "userToken": encryptedUserId,
                                    "authToken": $rootScope.webApiToken ? $rootScope.webApiToken : "",
                                    "webLeadDetails": scriptDetails
                                }

                                $scope.apiRequestParameters = response;
                            }
                        });
                    } else {
//                    $scope.apiRequestParameters = 'No Input parameters available!';
                        $scope.apiRequestParameters = '';
                    }
                    //var createWebLeadApiModal = $modal({scope: $scope, contentTemplate: "apiParameters", show: false});
                    var createWebLeadApiModal = $modal({scope: $scope, templateUrl: "/views/lg/webLeadApiParameters.html", show: false});
                    $scope.createWebLeadApiModal = createWebLeadApiModal;
                    createWebLeadApiModal.$promise.then(createWebLeadApiModal.show);
                } else {
                    logger.logError(response.message);
                }
            });
        }



// Hours of Opeartion Code
        $scope.hoomaincount = 0;
        $scope.days = [];
        $scope.days[0] = [
            {name: "Mon"},
            {name: "Tue"},
            {name: "Wed"},
            {name: "Thu"},
            {name: "Fri"},
            {name: "Sat"},
            {name: "Sun"}
        ];

        $scope.JsonToArray = function (item) {
            return  Object.keys(item).map(function (k) {
                return item[k]
            });
        }
        $scope.get_HOOdata = function () {
            console.log('$scope.selected_offer_id ', $scope.current_offer_id);
            Prompt.listPrompt().get(function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    $scope.prompts = response.data;
                }
            });

            ADVCC.listPhoneAgent().get({}, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    $scope.pas = response.data;
                }
            });

            Offer.get_HOOdata().save({current_offer_id: $scope.current_offer_id}, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    $scope.hoo = {"operationAfterBH": [], 'timezone': response.data.timezone};
                    $scope.compose = response.data.compose_message;
                    $scope.marketing_automation = response.data.marketing_automation;
                    $scope.hoomaincount = response.data.hoo_schema.length - 1;
                    response.data.hoo_schema.forEach(function (item, i) {

                        $scope.days[i] = [
                            {name: "Mon"},
                            {name: "Tue"},
                            {name: "Wed"},
                            {name: "Thu"},
                            {name: "Fri"},
                            {name: "Sat"},
                            {name: "Sun"}
                        ];

                        var callStart = ('0000' + item.call_range_start).substring(item.call_range_start.toString().length);
                        var callEnd = ('0000' + item.call_range_end).substring(item.call_range_end.toString().length);

//                    item.call_range_start = new Date('', '', '', callStart.substring(0, 2), callStart.substring(2, 4), 0, 0)
//                    item.call_range_end = new Date('', '', '', callEnd.substring(0, 2), callEnd.substring(2, 4), 0, 0)

                        var newStart = moment().utc().hours(callStart.substring(0, 2)).minutes(callStart.substring(2, 4));
                        var newEnd = moment().utc().hours(callEnd.substring(0, 2)).minutes(callEnd.substring(2, 4));
                        var finalStart = moment.tz(newStart, $scope.hoo.timezone);
                        var finalEnd = moment.tz(newEnd, $scope.hoo.timezone);
                        item.call_range_start = new Date('', '', '', finalStart.format('HH'), finalStart.format('mm'), 0, 0)
                        item.call_range_end = new Date('', '', '', finalEnd.format('HH'), finalEnd.format('mm'), 0, 0)

                        item.days.forEach(function (resday) {
                            $scope.days[i].forEach(function (day) {
                                if (day.name == resday.name) {
                                    day.ticked = true;
                                }
                            });
                        });
                        $scope.hoo.operationAfterBH.push(item);
                    });

                } else {
                    logger.logError(response.message);
                }
            });
        }
        $scope.submitHOO = function (hoo_data, compose_data, marketing_automation) {
            console.log('hoo ', hoo_data);
            console.log('compose_data ', compose_data);
            if (hoo_data.operationAfterBH.length && hoo_data.operationAfterBH[0] && hoo_data.operationAfterBH[0].call_range_start && hoo_data.operationAfterBH[0].call_range_end && hoo_data.operationAfterBH[0].days.length) {
                hoo_data.operationAfterBH = $scope.JsonToArray(hoo_data.operationAfterBH);
                hoo_data.operationAfterBH.forEach(function (item, i) {
                    console.log('item ', item);
                    if (hoo_data.timezone && item.call_range_end && item.call_range_start && item.days.length) {
                        var startHr = moment(item.call_range_start).format("HH");
                        var startMin = moment(item.call_range_start).format("mm");
                        var endHr = moment(item.call_range_end).format("HH");
                        var endMin = moment(item.call_range_end).format("mm");
                        var start = moment.tz(hoo_data.timezone).hours(startHr).minutes(startMin);
                        var end = moment.tz(hoo_data.timezone).hours(endHr).minutes(endMin);
                        var startUTC = moment(start).utc().format('HHmm');
                        var endUTC = moment(end).utc().format('HHmm');
                        item.call_range_start = parseInt(startUTC);
                        item.call_range_end = parseInt(endUTC);
                        console.log('startUTC ', startUTC);
                        console.log('endUTC ', endUTC);
                        // return false;
                        (item.call_range_start > item.call_range_end) ? item.round_time = true : item.round_time = false;

                        if ((i + 1 == hoo_data.operationAfterBH.length)) {
                            console.log('final hoo ', hoo_data);
                            Offer.saveOfferHOO().save({current_offer_id: $scope.current_offer_id, timezone: hoo_data.timezone, hoo_data: hoo_data.operationAfterBH, compose_message_data: compose_data, marketing_automation: marketing_automation}, function (response) {
                                if (response.code == CONSTANTS.CODES.OK) {
                                    logger.logSuccess(response.message);
                                    $scope.setTab(8);
                                } else {
                                    logger.logError(response.message);
                                }
                            });
                        }
                    } else {
                        logger.logError('Please fill all fields');
                    }

                });

            } else {
                logger.logError('Please fill in the Fields');
            }
        };

        $scope.incrementHOOMainCount = function () {
            $scope.hoomaincount = $scope.hoomaincount + 1;
            $scope.days[$scope.hoomaincount] = [
                {name: "Mon"},
                {name: "Tue"},
                {name: "Wed"},
                {name: "Thu"},
                {name: "Fri"},
                {name: "Sat"},
                {name: "Sun"}
            ];
        };

        $scope.removeItem = function (data, index) {
            if (data && data[index]) {
                delete data[index];
            }
        }


        $scope.saveComposeMessage = function (data) {
            Offer.saveComposeMessage().save({current_offer_id: $scope.current_offer_id, compose_message_data: data}, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    logger.logSuccess(response.message);
                    $scope.setTab(9);
                } else {
                    logger.logError(response.message);
                }
            });
        }


        $scope.get_ComposeMessageData = function () {
            Prompt.listPrompt().get(function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    $scope.prompts = response.data;
                }
            });
        }

    }]);