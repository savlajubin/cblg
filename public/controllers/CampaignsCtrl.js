angular.module('CampaignModule', ['LoggerService'])

        /*@function  : CampaignFormCtrl
         * Creator   : SmartData (A2)
         * created   : 10 Sep 15
         * @purpose  : Controller for LG Add new Campaign form.
         */
        .controller('CampaignCtrl', ['$builder', '$modal', '$scope', '$route', '$http', '$routeParams', 'logger', '$location', 'Campaign', 'Offer', 'CONSTANTS', 'Module', '$rootScope', '$filter', function ($builder, $modal, $scope, $route, $http, $routeParams, logger, $location, Campaign, Offer, CONSTANTS, Module, $rootScope, $filter) {
                $scope.days = [
                    {name: "Mon"},
                    {name: "Tue"},
                    {name: "Wed"},
                    {name: "Thu"},
                    {name: "Fri"},
                    {name: "Sat"},
                    {name: "Sun"}
                ];
                $scope.backToBoard = function () {
                    $route.reload();
                }
                $scope.tab = 1;
                $scope.setTab = function (tabId) {
                    $scope.tab = tabId;
                }
                $scope.isSet = function (tabId) {
                    return $scope.tab === tabId;
                };

                $scope.webAffiliateScriptData = '';

                /* To get the offer details */
                $scope.getOfferDetailsForWebAffiliate = function () {

                    $builder.forms['default'] = [];
                    $scope.newForm = $builder.forms['default'];
                    Offer.getOffferDetailsByID().save({_id: $routeParams.offerid}, function (response) {

                        if (response.code == CONSTANTS.CODES.OK) {

                            $scope.webAffiliateMode = response.data.web_affiliate.webAffiliateMode;
                            //$scope.webAffiliateToken = response.data.web_affiliate.token;
                            $scope.webAffiliateToken = Date.now() + Math.random().toString(36).substr(2);

                            if ($rootScope.currentRoleCode == 'lb' || $rootScope.currentRoleCode == 'advcc') {

                                $scope.payPerCall = response.data.pay_per_call.lbamount;
                                $scope.payPerLead = '';
                                if (response.data.web_affiliate.webAffiliateMode == 'true') {
                                    $scope.payPerLead = response.data.web_affiliate.lbamount;
                                }
                            } else if ($rootScope.currentRoleCode == 'lg') {

                                $scope.payPerCall = response.data.pay_per_call.lgamount;
                                $scope.payPerLead = '';
                                if (response.data.web_affiliate.webAffiliateMode == 'true') {
                                    $scope.payPerLead = response.data.web_affiliate.lgamount;
                                }
                            }

                            angular.forEach(_.sortBy(response.data.web_affiliate.scriptData, 'index'), function (element, eIndex) {
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

                            $scope.newForm = $builder.forms['default'];

                            /*if (($rootScope.currentRoleCode == 'advcc' || $rootScope.currentRoleCode == 'lg') && $scope.webAffiliateMode) {

                             $scope.tabs = [{
                             title: 'Local Numbers',
                             url: 'one.tpl.html'
                             }, {
                             title: '800 Numbers',
                             url: 'two.tpl.html'
                             }, {
                             title: 'Vanity Numbers',
                             url: 'three.tpl.html'
                             }, {
                             title: 'Web Affiliate',
                             url: 'four.tpl.html'
                             }];
                             } else {*/
                            $scope.tabs = [{
                                    title: 'Local Numbers',
                                    url: 'one.tpl.html'
                                }, {
                                    title: '800 Numbers',
                                    url: 'two.tpl.html'
                                }, {
                                    title: 'Vanity Numbers',
                                    url: 'three.tpl.html'
                                }];
                            //}

                        } else {
                            logger.logError(response.message);
                        }
                    })
                }();

//            $scope.getHtmlCode = function () {
//
//                if ($location.host() == 'localhost') {
//                    var baseUrl = $location.protocol() + "://" + $location.host() + ":" + $location.port();
//                } else {
//                    var baseUrl = $location.protocol() + '://' + $location.host();
//                }
//
//                var htmlcode = $('#formScriptDiv').html().replace('<!-- ngRepeat: object in formObjects -->', '').replace('<!-- end ngRepeat: object in formObjects -->', '').trim();
//
////                if (htmlcode) {
////                    var htmlcode = '<html><body><form name="webAffiliateForm" method="Post" action="' + baseUrl + '/webAffiliateProgram/' + $scope.webAffiliateToken + '">'
////                    htmlcode += $('#formScriptDiv').html().replace('<!-- ngRepeat: object in formObjects -->', '').replace('<!-- end ngRepeat: object in formObjects -->', '');
////                    htmlcode += '<input type="submit" name="submit" value="Submit"></form></body></html>';
////                }
//
//                if (htmlcode) {
//                    var htmlcode = '<html><head><script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js"></script></head><body><form name="webAffiliateForm">'
//                    htmlcode += $('#formScriptDiv').html().replace('<!-- ngRepeat: object in formObjects -->', '').replace('<!-- end ngRepeat: object in formObjects -->', '');
//                    htmlcode += '<input type="submit" id="createWebLeadBtn" name="submit" value="Submit"></form></body></html>';
//                    htmlcode += '<script>\n\
//                    $(document).ready(function () {\n\
//                        $("#createWebLeadBtn").click(function () {\n\
//                            $.ajax({url: "' + baseUrl + '/webAffiliateProgram/' + $scope.webAffiliateToken + '",\n\
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
//                }
//                $scope.htmlFormElement = htmlcode;
//
//                var createHtmlCodeFormModal = $modal({scope: $scope, contentTemplate: 'htmlCode', show: false});
//                createHtmlCodeFormModal.$promise.then(createHtmlCodeFormModal.show);
//            }

//            $scope.submitWebaffiliate = function (formData, faqData) {
//                if (formData != '') {
//                    $scope.webAffiliateScriptData = formData;
//                    logger.logSuccess('Saved!');
//                }
//            };


                /* To Get html of web lead script */
                $scope.getHtmlCode = function () {

                    if ($location.host() == 'localhost') {
                        var baseUrl = $location.protocol() + "://" + $location.host() + ":" + $location.port();
                    } else {
                        var baseUrl = $location.protocol() + '://' + $location.host();
                    }

                    var postDataURL = baseUrl + '/webAffiliateProgram/' + $scope.webAffiliateToken;

                    var htmlcode = $('#formScriptDiv').html().replace('<!-- ngRepeat: object in form -->', '').replace('<!-- end ngRepeat: object in form -->', '').trim();

                    if (htmlcode) {

                        var hh = '<link rel="stylesheet" href="' + baseUrl + '/assets/css/bootstrap.css"><style>.pad0{padding:0!important}.padL0{padding-left:0!important}.padR0{padding-right:0!important}.formBuilderWrapper .panel.panel-default{border:1px solid #ddd}.formBuilderWrapper .panel-heading{cursor:pointer}.formBuilderCloseBtn{position:absolute;top:10px;right:10px}h3.popover-title{margin-top:25px}.fb-form-object-editable,.fb-form-object{border:1px solid #cbd2d5;margin-bottom:10px;width:100%;display:inline-block;background-color:#fff;padding:0}.fb-form-object-editable.empty{border:1px dashed #aaa}.fb-form-object-editable:hover,.fb-form-object:hover{box-shadow:1px 1px 10px 0 rgba(0,0,0,0.1);-webkit-box-shadow:1px 1px 10px 0 rgba(0,0,0,0.1);-moz-box-shadow:1px 1px 10px 0 rgba(0,0,0,0.1)}.formBuilderWrapper .form-group.fb_element{margin:0}.formBuilderWrapper h4.panel-heading{padding-left:0;padding-right:0;border-bottom:1px solid #cbd2d5}.formBuilderWrapper .form-group>label.control-label.headLabel{position:relative;text-align:left!important;background-color:#c8dff8;color:#31708f;padding:5px 20px 5px 5px;border-bottom-right-radius:35px;display:inline-block;margin-bottom:10px}h3.popover-title{background-color:transparent;border-bottom:0}.fb-component{padding:8px 10px;cursor:move;border:1px dotted #3190e7;margin:2px 0;text-transform:capitalize}.fb-component:hover{background-color:#3190e7;color:#fff}.fb-draggable.dragging{color:#333;height:auto!important}div.formBuilderCloseBtn button.btn.btn-xs{background-color:transparent;color:#3190e7;border:1px dotted #3190e7;border-radius:0!important;margin:0 -1px 0 0}div.formBuilderCloseBtn button.btn.btn-xs.btn-info:hover{color:#fff;background-color:#31b0d5;border-color:#269abc}div.formBuilderCloseBtn button.btn.btn-xs.btn-success:hover{color:#fff;background-color:#449d44;border-color:#398439}div.formBuilderCloseBtn button.btn.btn-xs.btn-primary:hover{color:#fff;background-color:#286090;border-color:#204d74}div.formBuilderCloseBtn button.btn.btn-xs.btn-danger:hover{color:#fff;background-color:#c9302c;border-color:#ac2925}div.formBuilderCloseBtn button.btn.btn-xs.btn-warning:hover{color:#fff;background-color:#ec971f;border-color:#d58512}</style>'

                        var htmlcode = '<html>\n<body>' + hh + '\n<div class="formBuilderWrapper"><form name="webAffiliateForm">\n'
                        htmlcode += $('#formScriptDiv').html().replace('<!-- ngRepeat: object in form -->', '').replace('<!-- end ngRepeat: object in form -->', '');
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

                    var createHtmlCodeFormModal = $modal({scope: $scope, contentTemplate: 'htmlCode', show: false});
                    createHtmlCodeFormModal.$promise.then(createHtmlCodeFormModal.show);
                }


                $scope.currentTab = 'one.tpl.html';

                $scope.onClickTab = function (tab) {
                    $scope.currentTab = tab.url;
                }

                $scope.isActiveTab = function (tabUrl) {
                    return tabUrl == $scope.currentTab;
                }

                $scope.local = '';
                $scope.second = '';
                $scope.vanity = '';
                $scope.selectNumber = function (arr, number, index) {
                    if (arr == 'local') {
                        if ($scope.local != number) {
                            $scope.local = number;
                        } else {
                            $scope.local = '';
                        }
                        console.log($scope.local);
                    } else if (arr == '800') {
                        if ($scope.second != number) {
                            $scope.second = number;
                        } else {
                            $scope.second = '';
                        }
                        console.log($scope.second);
                    } else if (arr == 'vanity') {
                        if ($scope.vanity != number) {
                            $scope.vanity = number;
                        } else {
                            $scope.vanity = '';
                        }
                        console.log($scope.vanity);
                    }
                };

                $scope.ringNext = function () {
                    $scope.finalNumbers = {"local": $scope.local, "tollfree": $scope.second, "vanity": $scope.vanity};
                    //if (($scope.finalNumbers.vanity.length == 0 && $scope.finalNumbers.local.length == 0 && $scope.finalNumbers.tollfree.length == 0) && $scope.webAffiliateScriptData == '') {

                    if ($scope.finalNumbers.vanity.length == 0 && $scope.finalNumbers.local.length == 0 && $scope.finalNumbers.tollfree.length == 0 && $scope.webAffiliateMode == 'false') {
                        //logger.logError('Select atleast one ring to number');
                        console.log('If');
                        logger.logError('Select atleast one ring to number');
                    } else {
                        console.log('else');
                        $scope.setTab(3);
                    }
                }
                $scope.getRingToNumbers = function () {
                    //Campaign.getSetPlivoNumbers().get({}, function (resp) {
                    Campaign.getRingToNumber().save({}, function (response) {
                        if (response.data) {
                            $scope.localNumbers = response.data["local"];
                            $scope.Numbers = response.data["tollfree"];
                            $scope.vanityNumbers = response.data["vanity"];
                        }
                    });
                    //});

                    Offer.getOffferDetailsByID().save({_id: $routeParams.offerid}, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            $scope.category_name = response.data.vertical_category_details.title;
                            $scope.media_restricted = response.data.media_restricted;
                        } else {
                            logger.logError(response.message);
                        }
                    })
                }

                $scope.getNewRingToNumber = function (areaCode) {
                    Campaign.getNewRingToNumber().get({areaCode: areaCode}, function (resp) {
//                    var oldNumData = _.filter($scope.localNumbers, function(newNum){
//                        return newNum.fromPlivo != true;
//                    });
//                    $scope.localNumbers = _.union(oldNumData,resp.data);
                        $scope.localNumbers = resp.data;
                    })
                }


                $scope.web = {thankYouPageURL: ''};
                $scope.submitWebAffiliateRedirectURL = function (url) {
                    $scope.web_affiliate_redirect_url = url;
                    $scope.setTab(4);
                }

                $scope.submitCampaign = function (campaign_direction, advertising_method, campaign_IVR, campaign_name, testing_purpose) {
                    if (!$scope.name_form.$valid) {
                        logger.logError("Please fill all the required fields");
                        return false;
                    }

                    $scope.selected_offer_id = $routeParams.offerid;
                    console.log(campaign_direction, advertising_method, campaign_IVR, campaign_name);

                    $scope.web_affiliate_url_token = $scope.webAffiliateToken ? $scope.webAffiliateToken : null;

                    $scope.finalNumbers = {"local": $scope.local ? $scope.local : null, "tollfree": $scope.second ? $scope.second : null, "vanity": null};//$scope.vanity ? $scope.vanity : null};
                    $scope.finalNumbersArr = [$scope.local, $scope.second, $scope.vanity];
                    $scope.finalNumbersArr = $scope.finalNumbersArr.filter(function (n) {
                        return n != ''
                    });
                    var newDays = [];
                    $scope.attr.days.forEach(function (day) {
                        newDays.push(day.name);
                    });
                    if ($rootScope.currentRoleCode == 'advcc') {
                        var sendData = {
                            campaign_direction: campaign_direction,
                            advertising_method: advertising_method,
                            ringToNumbers: $scope.finalNumbers,
                            campaign_IVR: campaign_IVR,
                            campaign_name: campaign_name,
                            offer_id: $scope.selected_offer_id,
                            finalNumbersArr: $scope.finalNumbersArr,
                            media_week_from: $scope.attr.media_week_from,
                            media_week_to: $scope.attr.media_week_to,
                            days: newDays,
                            time_range_from: moment($scope.attr.time_range_from).format("HHmm"),
                            time_range_to: moment($scope.attr.time_range_to).format("HHmm"),
                            rate: $scope.attr.rate,
                            spots_ordered: $scope.attr.spots_ordered,
                            amount_spent: $scope.attr.amount_spent,
                            amount_cleared: $scope.attr.amount_cleared,
                            test_purpose: testing_purpose,
                            web_affiliate_url_token: $scope.web_affiliate_url_token,
                            web_affiliate_redirect_url: $scope.web_affiliate_redirect_url
                        };
                    } else {
                        var sendData = {
                            campaign_direction: campaign_direction,
                            advertising_method: advertising_method,
                            ringToNumbers: $scope.finalNumbers,
                            campaign_IVR: campaign_IVR,
                            campaign_name: campaign_name,
                            offer_id: $scope.selected_offer_id,
                            finalNumbersArr: $scope.finalNumbersArr,
                            test_purpose: testing_purpose,
                            web_affiliate_url_token: $scope.web_affiliate_url_token,
                            web_affiliate_redirect_url: $scope.web_affiliate_redirect_url
                        };
                    }
                    console.log(sendData);

                    $http.post('/api_campaign/addCampaign', sendData).success(function (response) {
                        if (response.result == CONSTANTS.CODES.OK) {
                            if (response.data) {
                                if ($filter('lowercase')($rootScope.authenticatedUser.role_id.code) == 'lg') {
                                    $location.path('/' + $filter('lowercase')($rootScope.authenticatedUser.role_id.code) + '/current-campaigns');
                                } else {
                                    $location.path('/' + $filter('lowercase')($rootScope.authenticatedUser.role_id.code) + '/active-campaigns');
                                }
                                logger.logSuccess('Campaign created successfully.');
                            } else {
                                logger.logError(response.message);
                            }
                        }
                    });
                }

                $scope.listCampaignForAdmin = function () {
                    Campaign.listCampaignForAdmin().get({}, function (resp) {
                        if (resp.result == CONSTANTS.CODES.OK) {
                            if (resp.data) {
                                console.log(resp);
                                var result = Object.keys(resp.data).map(function (k) {
                                    return resp.data[k];

                                });
                                console.log(result)
                                Module.pagination(result);
                            } else {
                                Module.pagination({});
                            }
                        } else {
                            Module.pagination({});
                        }

                    });
                }

            }]);