var app = angular.module("LGCallRoutingModule", ['PromptService', 'LoggerService', 'IvrService', 'UserService', 'ADVCCService', 'ModuleService']);

/**************************************   Admin Module Section   **************************************/

/*@function : ManageCallRoutingCtrl
 * Creator   : SmartData
 * @purpose  : Controller for Call Routing Manage Call Routing in LG Section
 */

app.controller("ManageCallRoutingCtrl", ['$scope', 'Module', '$rootScope', 'Ivr', 'logger', 'CONSTANTS', 'User', function ($scope, Module, $rootScope, Ivr, logger, CONSTANTS, User) {
        $scope.tab = 1;
        getSelectOptions(User, $rootScope, function (data) {
            $scope.optionarr = data;
        });
        $scope.setTab = function (tabId) {
            $scope.tab = tabId;
        };

        $scope.isSet = function (tabId) {
            return $scope.tab === tabId;
        };

        $scope.curPage = 0;
        $scope.pageSize = 5;

        $scope.numberOfPages = function ()
        {
            return Math.ceil($scope.datalists.length / $scope.pageSize);
        };

        Ivr.listIvr().get(function (response) {
            if (response.code == CONSTANTS.CODES.OK) {
                $scope.data = [];
                if (response.ivrs.length) {


                    var x = [];
                    var y = '';

                    response.ringToNumberData.forEach(function (phone) {
                        y = _.map(phone.ivr_associated, function (data, key) {
                            return {id: phone._id, ivr_id: data.ivr_id, phone_no: phone.phone_no};
                        });
                        x = _.union(x, y);
                    });

                    response.ivrs.forEach(function (ivrData) {
                        ivrData.type = 'IVR';

                        ivrData.phone_no = _.filter(x, function (d) {
                            return ivrData._id == d.ivr_id;
                        });

                        $scope.data.push(ivrData);
                    });
                }
                if (response.ibs.length) {
                    response.ibs.forEach(function (item) {
                        item.type = 'Inbound Trunk';
                        $scope.data.push(item);
                    });
                }

                var count = response.ibs.length + response.ivrs.length;
                if (count == $scope.data.length) {
                    Module.pagination($scope.data);
                }

            } else {
                $scope.error = response.message;
            }
        });

        $scope.deleteIVR = function (ivr_id, type) {
            swal({
                title: CONSTANTS.SWAL.deletetitle,
                text: CONSTANTS.SWAL.deletetext,
                type: CONSTANTS.SWAL.type,
                showCancelButton: CONSTANTS.SWAL.showCancelButton,
                confirmButtonColor: CONSTANTS.SWAL.confirmButtonColor,
                confirmButtonText: CONSTANTS.SWAL.deleteconfirmButtonText,
                closeOnConfirm: CONSTANTS.SWAL.closeOnConfirm},
            function () {
                Ivr.deleteIvr().save({id: ivr_id, type: type}, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.data = [];
                        if (response.ivrs.length) {
                            response.ivrs.forEach(function (item) {
                                item.type = 'IVR';
                                $scope.data.push(item);
                            });
                        }
                        if (response.ibs.length) {
                            response.ibs.forEach(function (item) {
                                item.type = 'Inbound Trunk';
                                $scope.data.push(item);
                            });
                        }
                        var count = response.ibs.length + response.ivrs.length;
                        if (count == $scope.data.length) {
                            Module.pagination($scope.data);
                        }
                    } else {
                        $scope.error = response.message;
                    }
                });
            });
        }

        $scope.changeIvrStatus = function (ivr_id, status, type) {
            Ivr.changeIvrStatus().save({id: ivr_id, status: status, type: type}, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    logger.logSuccess(response.message);
                } else {
                    logger.logError(response.message);
                }
            });
        }
    }]);

/*@function : PromptsCtrl
 * Creator   : SmartData
 * @purpose  : Controller for Call Routing Prompts Section in LG Section
 */

app.controller("PromptsCtrl", ['$scope', '$rootScope', 'Prompt', '$route', 'ngAudio', 'Upload', 'Module', 'CONSTANTS', 'User', function ($scope, $rootScope, Prompt, $route, ngAudio, Upload, Module, CONSTANTS, User) {
        $scope.list = true;
        Prompt.listPrompt().get({}, function (response) {
            Module.pagination(response.data);
        });
        $scope.audioFile = [];
        $scope.text = [];


        $scope.getAddForm = function () {
            $scope.list = false;
        }

        getSelectOptions(User, $rootScope, function (data) {
            $scope.optionarr = data;
        });

        $scope.audio = false;

        $scope.submitForm = function (data) {
            if (data.text != undefined && data.text != '') {
                Upload.upload({
                    url: '/api_prompt/addPrompt',
                    fields: {'type': 'text', 'text': data.text, 'voice': data.voice, 'name': data.name, 'repeat': data.repeat}
                }).success(function (data, status, headers, config) {
                    if (status == CONSTANTS.CODES.OK) {
                        $route.reload();
                    } else {
                        $scope.error = "Please Try again.";
                    }
                });
            } else {
                Upload.upload({
                    url: '/api_prompt/addPrompt',
                    file: data.file,
                    fields: {'type': 'audio', 'name': data.name, 'repeat': data.repeat}
                }).success(function (data, status, headers, config) {
                    if (status == CONSTANTS.CODES.OK) {
                        $route.reload();
                    } else {
                        $scope.error = "Please Try again.";
                    }
                });
            }
        };

        $scope.playAudio = function (path, index) {
            $scope.audioFile[index] = ngAudio.load(path);
            $scope.audioFile[index].play();
            $scope.text[index] = "Stop";
        }
        $scope.stopAudio = function (index) {
            $scope.audioFile[index].stop();
            $scope.audioFile[index] = '';
            $scope.text[index] = "Listen";
        }

        $scope.toggleClass = function (id) {
            var element = document.getElementById(id);
            element.classList.add("activePrompts");

            if (id == "text") {
                var ele = document.getElementById('audio');
                ele.classList.remove("activePrompts");
                $scope.audio = false;
            } else {
                var ele = document.getElementById('text');
                ele.classList.remove("activePrompts");
                $scope.audio = true;
            }
        }

        //Function to delete Prompt
        $scope.deletePrompt = function (id) {
            swal({
                title: CONSTANTS.SWAL.deletetitle,
                text: CONSTANTS.SWAL.deletetext,
                type: CONSTANTS.SWAL.type,
                showCancelButton: CONSTANTS.SWAL.showCancelButton,
                confirmButtonColor: CONSTANTS.SWAL.confirmButtonColor,
                confirmButtonText: CONSTANTS.SWAL.deleteconfirmButtonText,
                closeOnConfirm: CONSTANTS.SWAL.closeOnConfirm},
            function () {
                Prompt.deletePrompt().save({'id': id}, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        Prompt.listPrompt().get({}, function (response) {
                            Module.pagination(response.data);
                        });
                    } else {
                        console.log('Error');
                    }
                });
            })
        }

    }]);

/**************************************   Admin Module Section   **************************************/

/*@function : InboundTrunkCtrl
 * Creator   : SmartData
 * @purpose  : Controller for Call Routing Inbound Trunk in ADVCC Section
 */

app.controller("InboundTrunkCtrl", ['$scope', 'Campaign', '$rootScope', '$filter', 'Ivr', '$location', 'logger', 'CONSTANTS', 'Offer', 'ADVCC', function ($scope, Campaign, $rootScope, $filter, Ivr, $location, logger, CONSTANTS, Offer, ADVCC) {
        Offer.listOfferTemplate().get(function (response) {
            if (response.code == CONSTANTS.CODES.OK) {
                $scope.offers = response.data;
            }
        });

        Ivr.listIvr().get(function (response) {
            if (response.code == CONSTANTS.CODES.OK) {
                $scope.ivrs = response.ivrs;
            }
        });

        ADVCC.listAgentScript().get(function (response) {
            if (response.code == CONSTANTS.CODES.OK) {
                $scope.agent_scripts = response.data;
            }
        });

        $scope.submitForm = function (data) {
            if (data) {
                var temp = data.ivr_id;
                data.ivr_id = [];
                temp.forEach(function (item, i) {
                    data.ivr_id.push({ivr_id: item, priority: i});
                });

                Ivr.submitInboundTrunk().save(data, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        logger.logSuccess(response.message);
                        $location.path('/' + $filter('lowercase')($rootScope.authenticatedUser.role_id.code) + '/manage-call-routing');
                    } else {
                        logger.logError(response.message);
                    }
                });
            } else {
                logger.logError('Please fill in the Fields');
            }
        };

        //---------------------------------------------------------------------------------//

        $scope.inbound = {phone_no: ''};
        $scope.selectNumber = function (number) {
            if ($scope.inbound.phone_no != number) {
                $scope.inbound.phone_no = number;
            } else {
                $scope.inbound.phone_no = '';
            }
        };

        /*
         Campaign.getSetPlivoNumbers().get({}, function (resp) {
         Campaign.getRingToNumber().save({}, function (response) {
         if (response.data) {
         $scope.localNumbers = response.data["local"];
         //$scope.Numbers = response.data["tollfree"];
         }
         });
         });
         */

        $scope.getNewRingToNumber = function (areaCode) {
            Campaign.getNewRingToNumber().get({areaCode: areaCode}, function (resp) {
//            var oldNumData = _.filter($scope.localNumbers, function (newNum) {
//                return newNum.fromPlivo != true;
//            });
//            $scope.localNumbers = _.union(oldNumData, resp.data);
                console.log(resp)
                $scope.phoneNoErrorMsg = false;
                if (resp.code == 404) {
                    $scope.phoneNoErrorMsg = 'No results for your search!';
                }
                $scope.localNumbers = resp.data;

            });
        };
        $scope.getNewRingToNumber();

        $scope.ngRepeater = [{}];
        $scope.inbound.ivr_id = [];

        $scope.decrementCount = function (index) {
            if ($scope.ngRepeater.length > 1) {
                $scope.inbound.ivr_id.splice(index, 1);
                $scope.ngRepeater.splice(index, 1);
            } else {
                alert("Atleast One IVR is Required")
            }
        }

        $scope.hideOpt = function (ivrId) {
            return ($scope.inbound.ivr_id.indexOf(ivrId) != -1);
        }
    }]);


/*@function : InboundTrunkEditCtrl
 * Creator   : SmartData
 * @purpose  : Controller for Call Routing Inbound Trunk in ADVCC Section
 */

app.controller("InboundTrunkEditCtrl", ['$scope', '$rootScope', '$routeParams', '$filter', 'Ivr', '$location', 'logger', 'CONSTANTS', 'Offer', 'Campaign', function ($scope, $rootScope, $routeParams, $filter, Ivr, $location, logger, CONSTANTS, Offer, Campaign) {
        Offer.listOfferTemplate().get(function (response) {
            if (response.code == CONSTANTS.CODES.OK) {
                $scope.offers = response.data;
            }
        });

        Ivr.listIvr().get(function (response) {
            if (response.code == CONSTANTS.CODES.OK) {
                $scope.ivrs = response.ivrs;
            }
        });

        $scope.update = true;
        $scope.ngRepeater = [];
        $scope.getIvrById = function () {
            Ivr.getIvrById().save({id: $routeParams.id, type: 'Inbound Trunk'}, function (res) {
                if (res.code == CONSTANTS.CODES.OK) {
                    $scope.inbound = res.data;
                    var temp = $scope.inbound.ivr_id;
                    $scope.inbound.ivr_id = [];
                    temp.forEach(function (item) {
                        $scope.ngRepeater.push({});
                        $scope.inbound.ivr_id.push(item.ivr_id);
                    });
                }
            })
        }();

        $scope.submitForm = function (data) {
            if (data) {
                var temp = data.ivr_id;
                data.ivr_id = [];
                temp.forEach(function (item, i) {
                    data.ivr_id.push({ivr_id: item, priority: i});
                });
                Ivr.submitInboundTrunk().save(data, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        logger.logSuccess(response.message);
                        $location.path('/' + $filter('lowercase')($rootScope.authenticatedUser.role_id.code) + '/manage-call-routing');
                    } else {
                        logger.logError(response.message);
                    }
                });
            } else {
                logger.logError('Please fill in the Fields');
            }
        }

        //---------------------------------------------------------------------------------//

        $scope.inbound = {phone_no: ''};
        $scope.selectNumber = function (number) {
            if ($scope.inbound.phone_no != number) {
                $scope.inbound.phone_no = number;
            } else {
                $scope.inbound.phone_no = '';
            }
        };

        /*
         Campaign.getSetPlivoNumbers().get({}, function (resp) {
         Campaign.getRingToNumber().save({}, function (response) {
         if (response.data) {
         $scope.localNumbers = response.data["local"];
         //$scope.Numbers = response.data["tollfree"];
         }
         });
         });
         */

        $scope.getNewRingToNumber = function (areaCode) {
            Campaign.getNewRingToNumber().get({areaCode: areaCode}, function (resp) {
//            var oldNumData = _.filter($scope.localNumbers, function (newNum) {
//                return newNum.fromPlivo != true;
//            });
//            $scope.localNumbers = _.union(oldNumData, resp.data);
                $scope.localNumbers = resp.data;
            });
        };
        $scope.getNewRingToNumber();


        $scope.incrementCount = function () {
            $scope.ngRepeater.push({});
        };

        $scope.decrementCount = function (index) {
            $scope.inbound.ivr_id.splice(index, 1);
            $scope.ngRepeater.splice(index, 1);
        }

        $scope.hideOpt = function (ivrId) {
            return ($scope.inbound.ivr_id.indexOf(ivrId) != -1);
        }
    }]);

function getSelectOptions(User, $rootScope, next) {
    User.isAuth().get(function (response) {
        if (response.code == 200) {
            $rootScope.authenticatedUser = response.data;
            var role_code = $rootScope.authenticatedUser.role_id.code;
            console.log('sdfsd');
            console.log(role_code);
            switch (role_code) {
                case "LG" :
                case "LB" :
                    var optionarr = [
                        {'value': 'dial', 'display': 'Dial Sequential'},
                        {'value': 'multidial', 'display': 'Dial Simultaneously'},
                        {'value': 'prompt', 'display': 'Play the Prompt'},
                        {'value': 'dnc', 'display': 'Add caller to DNC list and hang up'},
                    ];
                    break;
                case "LGN" :
                    var optionarr = [
                        {'value': 'dial', 'display': 'Dial Sequential'},
                        {'value': 'multidial', 'display': 'Dial Simultaneously'},
                        {'value': 'prompt', 'display': 'Play the Prompt'},
                        {'value': 'dnc', 'display': 'Add caller to DNC list and hang up'},
                    ];
                    break;
                case "ADVCC" :
                    var optionarr = [
                        {'value': 'dial', 'display': 'Dial Sequential   '},
                        {'value': 'multidial', 'display': 'Dial Simultaneously'},
                        {'value': 'reps', 'display': 'All reps busy '},
                        {'value': 'queue', 'display': 'Send to a Queue'},
                        {'value': 'prompt', 'display': 'Play the Prompt'},
                        {'value': 'extension', 'display': 'Ring Extension'},
                        {'value': 'dnc', 'display': 'Add caller to DNC list and hang up'},
                    ];
                    break;
                default :
                    var optionarr = [];
                    break;
            }
//                    console.log(optionarr);
            next(optionarr);
        }
    });
}

function resetContent(value, schema) {
    switch (value) {
        case "dial":
            delete schema.prompt_schema;
            delete schema.sendToQueue_schema;
            delete schema.ring_schema;
            break;
        case "reps":
            delete schema.prompt_schema;
            delete schema.sendToQueue_schema;
            delete schema.ring_schema;
            break;
        case "prompt":
            delete schema.dial_schema;
            delete schema.sendToQueue_schema;
            delete schema.ring_schema;
            break;
        case "queue":
            delete schema.prompt_schema;
            delete schema.dial_schema;
            delete schema.ring_schema;
            break;
        case "extension":
            delete schema.prompt_schema;
            delete schema.sendToQueue_schema;
            delete schema.dial_schema;
            break;
    }
}
