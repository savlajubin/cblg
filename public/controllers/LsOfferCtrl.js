/*@function : LSOfferCtrl
 * Creator   : Smartdata(B2)
 *@purpose  : To manage lead seller offers
 */
app.controller('LsOfferCtrl', ['$scope', 'Campaign', '$modal', '$rootScope', '$http', '$route', '$routeParams', 'logger', '$location', 'LsOffer', 'Module', 'Ivr', 'CONSTANTS', function ($scope, Campaign, $modal, $rootScope, $http, $route, $routeParams, logger, $location, LsOffer, Module, Ivr, CONSTANTS) {
    $scope.tab = 0;
    $scope.setTab = function (tabId) {
        $scope.tab = tabId;
        switch (tabId) {
            case 1 :
                //To get pay per call info
                $scope.get_verticalList();
                break;
            default :
                break;
        }
    };
    /*start code for offer edit/retrieve data        */
    $scope.isSet = function (tabId) {
        return $scope.tab === tabId;
    };

    //To list all offer created by respective parent buyers
    $scope.list_all_offer = function () {
        //Need parent id of lead buyer
        LsOffer.listAlloffersByLB().save({}, function (response) {
            Module.pagination(response.data);
        })
    }

    /* To get Web Lead Script */
    /*$scope.getWebLeadScript = function (offerId) {
     $scope.selectedOfferId = offerId;
     Offer.getlistOfferTemplateByID().save({_id: offerId}, function (response) {
     
     $builder.forms['default'] = [];
     angular.forEach(_.sortBy(response.data.web_affiliate.scriptData, 'index'), function (element, eIndex) {
     $builder.addFormObject('default', {
     id: element.index, //eIndex,
     index: element.index, //'name',
     component: element.component, //'name',
     label: element.label, //'Name',
     description: element.description, //'Your name',
     placeholder: element.placeholder, //'Your name',
     required: element.required, //true,
     editable: element.editable, //true
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
     $scope.webLeadToken = response.data.web_affiliate.token;
     
     var createHtmlCodeScriptModal = $modal({scope: $scope, templateUrl: "/views/lg/webLeadScriptForm.html", show: false});
     $scope.createHtmlCodeScriptModal = createHtmlCodeScriptModal;
     createHtmlCodeScriptModal.$promise.then(createHtmlCodeScriptModal.show);
     });
     }*/

    /* To get Web Lead Script Html Code */
    /*$scope.getHtmlCode = function () {
     
     if ($location.host() == 'localhost') {
     var baseUrl = $location.protocol() + "://" + $location.host() + ":" + $location.port();
     } else {
     var baseUrl = $location.protocol() + '://' + $location.host();
     }
     
     var htmlcode = $('#scriptDataCode').html().replace('<!-- ngRepeat: object in formObjects -->', '').replace('<!-- end ngRepeat: object in formObjects -->', '').trim();
     
     //        if (htmlcode) {
     //            var htmlcode = '<html><body><form name="webAffiliateForm" method="Post" action="' + baseUrl + '/webAffiliateProgram/' + $scope.webLeadToken + '">';
     //            htmlcode += $('#scriptDataCode').html().replace('<!-- ngRepeat: object in formObjects -->', '').replace('<!-- end ngRepeat: object in formObjects -->', '');
     //            htmlcode += '<input type="submit" name="submit" value="Submit"></form></body></html>';
     //        }
     
     if (htmlcode) {
     var htmlcode = '<html><head><script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js"></script></head><body><form name="webAffiliateForm">'
     htmlcode += $('#scriptDataCode').html().replace('<!-- ngRepeat: object in formObjects -->', '').replace('<!-- end ngRepeat: object in formObjects -->', '');
     htmlcode += '<input type="submit" id="createWebLeadBtn" name="submit" value="Submit"></form></body></html>';
     htmlcode += '<script>\n\
     $(document).ready(function () {\n\
     $("#createWebLeadBtn").click(function () {\n\
     $.ajax({url: "' + baseUrl + '/webAffiliateProgram/' + $scope.webLeadToken + '",\n\
     type: "POST",\n\
     data: $("form").serialize(),\n\
     success: function (result) {\n\
     if (result.status == 200) { \n\
     alert("Success");\n\
     window.location.href = "' + baseUrl + '/#!/support";\n\
     }\n\
     }});\n\
     return false;\n\
     });\n\
     }); \n\
     </script>';
     }
     
     $scope.htmlFormElement = htmlcode;
     
     $scope.createHtmlCodeScriptModal.$promise.then($scope.createHtmlCodeScriptModal.hide);
     
     var createHtmlCodeModal = $modal({scope: $scope, contentTemplate: "htmlCode", show: false});
     createHtmlCodeModal.$promise.then(createHtmlCodeModal.show);
     
     }*/

    //To list all current campaigns
    $scope.list_currentCampaigns = function () {
        LsOffer.list_currentCampaigns().save({}, function (response) {

            var campaigns = [];
            response.data.forEach(function (item) {
                item.campaigns.forEach(function (campaign) {
                    /* Campaign Token Encryption */
                    var encrypted = CryptoJS.AES.encrypt(campaign._id, "campaignTokenForWebLeadApi").toString();
                    campaign.campaign_token = encrypted;
                    campaigns.push(campaign);
                });
            });
            Module.pagination(campaigns);
            //Module.pagination(response.data[0].campaigns);
        })
    }


    /*Start phone Section*/

    $scope.getPhoneNumberlist = function () {
        LsOffer.listPhoneNumber().get(function (response) {
            if (response.code == CONSTANTS.CODES.OK) {
                $scope.phoneNumbers = response.data;
                Module.pagination(response.data);
            } else {
                Module.pagination({});
                logger.logError(response.message);
            }
        });
        Ivr.listIvr().get(function (response) {
            if (response.code == CONSTANTS.CODES.OK) {
                $scope.ivrs = response.ivrs;
            } else {
                $scope.error = response.message;
            }
        });
    }

    $scope.createPhoneNumber = function (data) {
        LsOffer.addPhoneNumber().save(data, function (response) {
            $location.path('/' + $rootScope.currentRoleCode + '/phone-numbers');
            logger.logSuccess('Added succesfully');

        })
    }

    //delete the Phone Number
    $scope.deletePhoneNumber = function (_ids, phoneNumber, numberProvider) {
        swal({
            title: CONSTANTS.SWAL.deletetitle,
            text: CONSTANTS.SWAL.deletetext,
            type: CONSTANTS.SWAL.type,
            showCancelButton: CONSTANTS.SWAL.showCancelButton,
            confirmButtonColor: CONSTANTS.SWAL.confirmButtonColor,
            confirmButtonText: CONSTANTS.SWAL.deleteconfirmButtonText,
            closeOnConfirm: CONSTANTS.SWAL.closeOnConfirm},
        function () {
            LsOffer.deletePhoneNumber().save({'_id': [{'id': _ids, 'phoneNumber': phoneNumber, numberProvider: numberProvider}]}, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    Module.pagination(response.data);
                    logger.logSuccess(response.message);
                } else {
                    Module.pagination({});
                    logger.logError(response.message);
                }
            })
        });
    }

    //Go to link
    $scope.goTOLink = function (link) {
        $location.path(link);
    }

    //View phone detail
    $scope.viewPhoneNO = function () {
        LsOffer.findByIDPhoneNumber().get({id: $routeParams.phoneid}, function (response) {
            if (response.code == CONSTANTS.CODES.OK) {
                $scope.phoneNumber = response.data;
            } else {
                logger.logError(response.message);
            }
        });
    }
    //Edit Phone Number
    $scope.editPhoneNumber = function () {
        if ($routeParams.phoneid) {
            LsOffer.findByIDPhoneNumber().get({id: $routeParams.phoneid}, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    $scope.phoneNumber = response.data;
                    var data = {id: $scope.phoneNumber.zipcode};
                    $http.post('/zipCodeDetail', data).success(function (res) {
                        if (res.code == CONSTANTS.CODES.OK) {
                            $scope.phoneNumber.State = res.data.City + ',' + res.data.State;
                        } else {
                            $scope.phoneNumber.State = 'Unknown location';
                            $scope.phoneNumber.zipcode = '';
                        }
                    });
                    logger.logSuccess(response.message);
                } else {
                    logger.logError(response.message);
                }
            });
        }
    }

    $scope.getZipcode = function (phone) {
        $scope.phoneno = phone;
        $scope.areacode = parseInt(phone.substring(1, 4));
        var data = {areacode: $scope.areacode};
        $http.post('/getCallerDetail', data).success(function (response) {
            if (response.code == CONSTANTS.CODES.OK) {
                $scope.phoneNumber.State = response.data.City + ',' + response.data.State;
                $scope.phoneNumber.zipcode = response.data._id;
            } else {
                $scope.phoneNumber.State = 'Unknown location';
                $scope.phoneNumber.zipcode = '';
            }
        });
    }


    $scope.getIVRList = function (id, phone) {
        $scope.phone_id = $routeParams.phoneid;
        LsOffer.findByIDPhoneNumber().get({id: $scope.phone_id}, function (res) {
            if (res.code == CONSTANTS.CODES.OK) {
                $scope.assignivr = {};
                $scope.assignivr.phone_no = res.data.phone_no;
            }
        });

        Ivr.listIvr().get(function (response) {
            if (response.code == CONSTANTS.CODES.OK) {
                $scope.ivrs = response.ivrs;
            } else {
                $scope.error = response.message;
            }
        });

    };

    $scope.assignIVR = function (data) {
        var temp = data.ivr;
        data.ivr = [];
        temp.forEach(function (item, i) {
            data.ivr.push({ivr_id: item, priority: i});
        });

        Ivr.assignPhnoToIvr().save(data, function (response) {
            if (response.code == CONSTANTS.CODES.OK) {
                logger.logSuccess(response.message);
                $scope.ivrs = response.ivrs;
                $route.reload();
            } else {
                logger.logError(response.message);
            }
        });
    };

//    $scope.ngRepeater = [];
//    $scope.data = {ivr: []};
    $scope.count = 1;
    $scope.getIVRs = function (phoneId) {
        $scope.phone_id = phoneId;
        $scope.phoneNumbers.forEach(function (item) {
            if (item._id == phoneId) {
                $scope.data = {ivr: []};
                $scope.ngRepeater = [];
                item.ivr_associated.forEach(function (ivr) {
                    if (ivr.ivr_id) {
                        $scope.ngRepeater.push({});
                        $scope.data.ivr.push(ivr.ivr_id._id);
                    }
                });
                if (!item.ivr_associated || item.ivr_associated.length == 0) {
                    $scope.ngRepeater.push({});
                }
            }
        });
    };

    $scope.decrementCount = function (index) {
        $scope.data.ivr.splice(index, 1);
        $scope.ngRepeater.splice(index, 1);
    }

    $scope.hideOpt = function (ivrId) {
        return ($scope.data.ivr.indexOf(ivrId) != -1);
    }

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
//            var htmlcode = '<html>\n<body>\n<form name="webAffiliateForm">\n'
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

        console.log('offerDetials', offerDetials);
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
                    $scope.apiRequestParameters = 'No Input parameters available!';
                }
                var createWebLeadApiModal = $modal({scope: $scope, contentTemplate: "apiParameters", show: false});
                $scope.createWebLeadApiModal = createWebLeadApiModal;
                createWebLeadApiModal.$promise.then(createWebLeadApiModal.show);
            } else {
                logger.logError(response.message);
            }
        });
    }

}]);

app.controller('sendInviteCtrl', ['$scope', '$routeParams', 'LsOffer', 'CONSTANTS', 'logger', function ($scope, $routeParams, LsOffer, CONSTANTS, logger) {
    if ($routeParams.code == 'LB') {
        $scope.code = "LB or ADVCC";
    } else {
        $scope.code = $routeParams.code;
    }

    $scope.send = {};

    $scope.sendInvite = function (data) {
        if (!data.role) {
            data.role = $routeParams.code;
        }
        LsOffer.sendInvite().save(data, function (response) {
            if (response.code == CONSTANTS.CODES.OK) {
                logger.logSuccess(response.message);
            } else {
                logger.logError(response.message);
            }
        });
        console.log(data);
    }
}]);
