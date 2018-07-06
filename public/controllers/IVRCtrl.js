/*@function : IVRCtrl
 * Creator   : SmartData
 * @purpose  : Controller for Call Routing IVR-Based in LG Section
 */
app.controller("IVRCtrl", ['$scope', '$rootScope', '$location', '$filter', 'Ivr', 'OfferTemplate', 'logger', 'Prompt', 'User', 'ADVCC', 'CONSTANTS', function ($scope, $rootScope, $location, $filter, Ivr, OfferTemplate, logger, Prompt, User, ADVCC, CONSTANTS) {
        $scope.update = false;
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
        $scope.tab = 1;
        $scope.maincount = 0;
        $scope.hoomaincount = 0;
        $scope.geomaincount = 0;
        $scope.ccmaincount = 0;
        $scope.dialcount = 0;
        $scope.dialc = [];
        $scope.multidialc = [];
        $scope.queuedialcount = 0;
        $scope.queuedialc = [];
        $scope.promptdialcount = 0;
        $scope.promptdialc = [];
        $scope.extdialcount = 0;
        $scope.extdialc = [];
        $scope.ivr = {};
        $scope.hoo = {'hootoggle': false};
        $scope.geo = {'geotoggle': false};
        $scope.cc = {'cctoggle': false};
        $scope.preStates = [];
        OfferTemplate.getStatesList().get(function (response) {
            if (response.code == CONSTANTS.CODES.OK) {
                $scope.preStates[0] = response.data;
            } else {
                $scope.categoryList = null;
                logger.logError(response.message);
            }
        });
        Prompt.listPrompt().get(function (response) {
            if (response.code == CONSTANTS.CODES.OK) {
                $scope.prompts = response.data;
            }
        });
        User.listPAForCallRouting().get(function (response) {
            if (response.code == CONSTANTS.CODES.OK) {
                $scope.pas = response.data;
            }
        });
        ADVCC.listQueue().get(function (response) {
            if (response.code == CONSTANTS.CODES.OK) {
                $scope.queues = response.data;
            }
        });
        getSelectOptions(User, $rootScope, function (data) {
            $scope.optionarr = data;
        });

        $scope.initMultipleDialCount = function () {
            $scope.multidialcount = 0;
        }

        $scope.initDialCount = function (index) {
            $scope.dialc[index] = 0;
        }
        $scope.initMultiDialCount = function (index) {
            $scope.multidialc[index] = 0;
        }
        $scope.initQueueDialCount = function (index) {
            $scope.queuedialc[index] = 0;
        }
        $scope.initPromptDialCount = function (index) {
            $scope.promptdialc[index] = 0;
        }
        $scope.initExtDialCount = function (index) {
            $scope.extdialc[index] = 0;
        }
        $scope.setTab = function (tabId) {
            $scope.tab = tabId;
        };
        $scope.isSet = function (tabId) {
            return $scope.tab === tabId;
        };
        $scope.submitHOO = function (data) {
            if (data && data.hootoggle && data.operationAfterBH && data.operationAfterBH[0].call_range_start && data.operationAfterBH[0].call_range_end && data.operationAfterBH[0].days.length) {
                $scope.ivr.hoo_schema = $scope.JsonToArray(data.operationAfterBH);
                $scope.ivr.hoo_schema.forEach(function (item) {
                    var start = moment(item.call_range_start).format("HHmm");
                    var end = moment(item.call_range_end).format("HHmm");
                    item.call_range_start = parseInt(start);
                    item.call_range_end = parseInt(end);

                    (item.call_range_start > item.call_range_end) ? item.round_time = true : item.round_time = false;
                });
                $scope.ivr.hoo = data.hootoggle;
                $scope.geo_tab = true;
                $scope.setTab(1);
            } else if (!data.hootoggle) {
                $scope.ivr.hoo = data.hootoggle;
                $scope.geo_tab = true;
                $scope.setTab(1);
            } else {
                logger.logError('Please fill in the Fields');
            }
        };
        $scope.submitGeo = function (data) {
            if (data && data.geotoggle && data.operations && (data.operations[0].area_code || data.operations[0].state.length)) {
                $scope.ivr.geo_schema = $scope.JsonToArray(data.operations);
                $scope.ivr.geo = data.geotoggle;
                $scope.cc_tab = true;
                $scope.setTab(2);
            } else if (!data.geotoggle) {
                $scope.ivr.geo = data.geotoggle;
                $scope.cc_tab = true;
                $scope.setTab(2);
            } else {
                logger.logError('Please fill in the Fields');
            }
        };
        $scope.submitCC = function (data) {
            if (data && data.cctoggle && data.no_of_calls) {
                $scope.ivr.no_of_calls = data.no_of_calls;
                $scope.ivr.cc = data.cctoggle;
                $scope.ivr_tab = true;
                $scope.setTab(3);
            } else if (!data.cctoggle) {
                $scope.ivr.cc = data.cctoggle;
                $scope.ivr_tab = true;
                $scope.setTab(3);
            } else if (data.cctoggle && !data.no_of_calls) {
                logger.logError('Please fill in the Fields');
            }
        };
        $scope.submitForm = function (data) {
            if (data) {
                if (!data.inital_prompt_id || data.inital_prompt_id == '' || data.inital_prompt_id == undefined) {
                    logger.logError('Please select initial prompt');
                } else if (!data.ivr_name || data.ivr_name == '' || data.ivr_name == undefined) {
                    logger.logError('Please Enter IVR Name');
                } else if (!data.pressed_operation || data.pressed_operation == '' || data.pressed_operation == undefined) {
                    logger.logError('Please Select IVR Operations');
                } else {
                    $scope.preferred_operation = $scope.JsonToArray(data.pressed_operation);
                    //tO CONVERT JSON TO ARRAY
                    data.pressed_operation = $scope.preferred_operation;
                    data.phone_no = null;
                    data.pressed_operation.forEach(function (option) {
                        switch (option.pressed_action) {
                            case "dial":
                                option.dial_schema = $scope.JsonToArray(option.dial_schema);
                                $scope.changepriority(option.dial_schema);
                                break;
                            case "multidial":
                                option.multi_dial_schema = $scope.JsonToArray(option.multi_dial_schema);
                                //$scope.changepriority(option.multi_dial_schema);
                                break;
                            case "reps":
                                option.allrepsbusy_schema = $scope.JsonToArray(option.dial_schema);
                                delete option.dial_schema;
                                $scope.changepriority(option.allrepsbusy_schema);
                                break;
                            case "prompt":
                                option.prompt_schema = $scope.JsonToArray(option.prompt_schema);
                                $scope.nestedJsonToArray(option.prompt_schema[0]);
                                break;
                            case "queue":
                                option.sendToQueue_schema = $scope.JsonToArray(option.sendToQueue_schema);
                                $scope.nestedJsonToArray(option.sendToQueue_schema[0]);
                                break;
                            case "extension":
                                option.ring_schema = $scope.JsonToArray(option.ring_schema);
                                $scope.nestedJsonToArray(option.ring_schema[0]);
                                break;
                        }
                    })

                    $scope.ivr.inital_prompt_id = data.inital_prompt_id;
                    $scope.ivr.ivr_name = data.ivr_name;
                    $scope.ivr.ivr_schema = data.pressed_operation;
                    delete $scope.ivr.pressed_operation;
                    console.log('--------------final');
                    console.log($scope.ivr);
                    Ivr.submitIVRdata().save($scope.ivr, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            logger.logSuccess(response.message);
                            $location.path('/' + $filter('lowercase')($rootScope.authenticatedUser.role_id.code) + '/manage-call-routing');
                        } else {
                            logger.logError(response.message);
                        }
                    });
                }
            } else {
                logger.logError('Please fill in the Fields');
            }
        };
        $scope.convertTime = function () {
            if ($scope.ivr.hoo_schema && $scope.ivr.hoo) {
                $scope.ivr.hoo_schema.forEach(function (item) {
//                var start = moment(item.call_range_start).format("HHmm");
//                var end = moment(item.call_range_end).format("HHmm");
//                item.call_range_start = parseInt(start);
//                item.call_range_end = parseInt(end);

                    var callStart = ('0000' + item.call_range_start).substring(item.call_range_start.toString().length);
                    var callEnd = ('0000' + item.call_range_end).substring(item.call_range_end.toString().length);

                    item.call_range_start = new Date('', '', '', callStart.substring(0, 2), callStart.substring(2, 4), 0, 0)
                    item.call_range_end = new Date('', '', '', callEnd.substring(0, 2), callEnd.substring(2, 4), 0, 0)
                });
            }
        }

        $scope.JsonToArray = function (item) {
            return  Object.keys(item).map(function (k) {
                return item[k]
            });
        }
        $scope.changepriority = function (dialschema) {
            dialschema.forEach(function (value, key) {
                value.dial_priority = key;
            });
        };
        $scope.nestedJsonToArray = function (schema) {
            switch (schema.pressed_action) {
                case "dial":
                    schema.dial_schema = $scope.JsonToArray(schema.dial_schema);
                    $scope.changepriority(schema.dial_schema);
                    break;
                case "multidial":
                    schema.multi_dial_schema = $scope.JsonToArray(schema.multi_dial_schema);
                    //$scope.changepriority(schema.multi_dial_schema);
                    break;
                case "reps":
                    schema.allrepsbusy_schema = $scope.JsonToArray(schema.dial_schema);
                    delete schema.dial_schema;
                    $scope.changepriority(schema.allrepsbusy_schema);
                    break;
                case "prompt":
                    schema.prompt_schema = $scope.JsonToArray(schema.prompt_schema);
                    break;
                case "queue":
                    schema.sendToQueue_schema = $scope.JsonToArray(schema.sendToQueue_schema);
                    break;
                case "extension":
                    schema.ring_schema = $scope.JsonToArray(schema.ring_schema);
                    break;
            }
        };
        $scope.incrementMainCount = function () {
            $scope.maincount = $scope.maincount + 1;
        }
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
        }
        $scope.incrementGeoMainCount = function (geo) {
            $scope.geomaincount = $scope.geomaincount + 1;
            OfferTemplate.getStatesList().get(function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    $scope.preStates[$scope.geomaincount] = response.data;
                    geo.operations = $scope.JsonToArray(geo.operations);
                    geo.operations.forEach(function (item) {
                        $scope.preStates[$scope.geomaincount].forEach(function (state) {
                            item.state.forEach(function (dbstate) {
                                if (dbstate.name_long == state.name_long) {
                                    state.disabled = true;
                                }
                            });
                        });
                    });
                } else {
                    $scope.categoryList = null;
                    logger.logError(response.message);
                }
            });
        }
        $scope.incrementCCMainCount = function () {
            $scope.ccmaincount = $scope.ccmaincount + 1;
        }
        $scope.incrementDialCount = function () {
            $scope.dialcount = $scope.dialcount + 1;
        }
        $scope.incrementMultiDialCount = function () {
            $scope.multidialcount = $scope.multidialcount + 1;
        }
        $scope.incrementPromptDialCount = function () {
            $scope.promptdialcount = $scope.promptdialcount + 1;
        }
        $scope.incrementQueueDialCount = function () {
            $scope.queuedialcount = $scope.queuedialcount + 1;
        }
        $scope.incrementExtDialCount = function () {
            $scope.extdialcount = $scope.extdialcount + 1;
        }
        $scope.incrementOtherDialCount = function (index) {
            $scope.dialc[index] = $scope.dialc[index] + 1;
        }
        $scope.incrementOtherMultiDialCount = function (index) {
            $scope.multidialc[index] = $scope.multidialc[index] + 1;
        }
        $scope.incrementOtherQueueDialCount = function (index) {
            $scope.queuedialc[index] = $scope.queuedialc[index] + 1;
        }
        $scope.incrementOtherPromptDialCount = function (index) {
            $scope.promptdialc[index] = $scope.promptdialc[index] + 1;
        }
        $scope.incrementOtherExtDialCount = function (index) {
            $scope.extdialc[index] = $scope.extdialc[index] + 1;
        }

        $scope.removeItem = function (data, index) {
            if (data && data[index]) {
                delete data[index];
            }
        }

        $scope.resetCount = function (index, schema) {
            $scope.initDialCount(index);
            $scope.initQueueDialCount(index);
            $scope.initPromptDialCount(index);
            $scope.initExtDialCount(index);
            resetContent(schema.pressed_action, schema);
        }

        $scope.resetInitialCount = function (schema) {
            $scope.dialcount = 0;
            $scope.queuedialcount = 0;
            $scope.promptdialcount = 0;
            $scope.extdialcount = 0;
            resetContent(schema.pressed_action, schema);
        }
    }]);
/*@function : IVREditCtrl
 * Creator   : SmartData
 * @purpose  : Controller for Call Routing IVR-Based Edit functionality
 */
app.controller("IVREditCtrl", ['$scope', '$rootScope', '$location', '$filter', '$routeParams', 'Ivr', 'logger', 'Prompt', 'User', 'ADVCC', 'CONSTANTS', 'OfferTemplate', function ($scope, $rootScope, $location, $filter, $routeParams, Ivr, logger, Prompt, User, ADVCC, CONSTANTS, OfferTemplate) {
        $scope.update = true;
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
        $scope.getIvrById = function () {
            Ivr.getIvrById().save({id: $routeParams.id, type: 'IVR'}, function (res) {
                if (res.code == CONSTANTS.CODES.OK) {
                    $scope.ivr = {'pressed_operation': res.data.ivr_schema, 'inital_prompt_id': res.data.inital_prompt_id, 'ivr_name': res.data.ivr_name, '_id': res.data._id, 'phone_no': res.data.phone_no, 'condition_fail_prompt_id': res.data.condition_fail_prompt_id};
                    $scope.cc = {'no_of_calls': res.data.no_of_calls, 'cctoggle': res.data.cc};
                    $scope.hoo = {'operationAfterBH': res.data.hoo_schema, 'hootoggle': res.data.hoo};
                    $scope.geo = {'operations': res.data.geo_schema, 'geotoggle': res.data.geo};
                    $scope.maincount = $scope.ivr.pressed_operation.length - 1;
                    $scope.hoomaincount = $scope.hoo.operationAfterBH.length - 1;
                    $scope.geomaincount = $scope.geo.operations.length - 1;
                    $scope.hoo.operationAfterBH.forEach(function (item, i) {

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

                        item.call_range_start = new Date('', '', '', callStart.substring(0, 2), callStart.substring(2, 4), 0, 0)
                        item.call_range_end = new Date('', '', '', callEnd.substring(0, 2), callEnd.substring(2, 4), 0, 0)
                        item.days.forEach(function (resday) {
                            $scope.days[i].forEach(function (day) {
                                if (day.name == resday.name) {
                                    day.ticked = true;
                                }
                            });
                        });
                    });
                    $scope.preStates = [];
                    OfferTemplate.getStatesList().get(function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            $scope.geo.operations.forEach(function (item, i) {
                                $scope.preStates[i] = response.data;
                                item.state.forEach(function (resstate) {
                                    $scope.preStates[i].forEach(function (state) {
                                        if (state.name_long == resstate.name_long) {
                                            state.ticked = true;
                                        }
                                    });
                                });
                            });
                        } else {
                            $scope.categoryList = null;
                            logger.logError(response.message);
                        }
                    });
                    $scope.ivr.pressed_operation.forEach(function (item, i) {
                        if (item) {
                            switch (item.pressed_action) {
                                case "dial":
                                    if (i == 0) {
                                        $scope.dialcount = item.dial_schema.length - 2;
                                    } else {
                                        $scope.initDialCount(i - 1);
                                        $scope.dialc[i - 1] = item.dial_schema.length - 2;
                                    }
                                    break;
                                case "multidial":
                                    if (i == 0) {
                                        $scope.multidialcount = item.multi_dial_schema.length - 2;
                                    } else {
                                        $scope.initMultiDialCount(i - 1);
                                        $scope.multidialc[i - 1] = item.multi_dial_schema.length - 2;
                                    }
                                    break;
                                case "reps":
                                    if (i == 0) {
                                        $scope.dialcount = item.dial_schema.length - 2;
                                    } else {
                                        $scope.initDialCount(i - 1);
                                        $scope.dialc[i - 1] = item.dial_schema.length - 2;
                                    }
                                    break;
                                case "prompt":
                                    if (i == 0 && item.prompt_schema[0].pressed_action == 'dial') {
                                        $scope.promptdialcount = item.prompt_schema[0].dial_schema.length - 2;
                                    } else if (i == 0 && item.prompt_schema[0].pressed_action == 'multidial') {
                                        $scope.multidialcount = item.prompt_schema[0].multi_dial_schema.length - 2;
                                    } else {
                                        $scope.initPromptDialCount(i - 1);
                                        $scope.promptdialc[i - 1] = item.prompt_schema[0].dial_schema.length - 2;
                                        $scope.initMultiDialCount(i - 1);
                                        $scope.multidialc[i - 1] = item.prompt_schema[0].multi_dial_schema.length - 2;
                                    }
                                    break;
                                case "queue":
                                    if (i == 0 && item.sendToQueue_schema[0].pressed_action == 'dial') {
                                        $scope.queuedialcount = item.sendToQueue_schema[0].dial_schema.length - 2;
                                    } else if (i == 0 && item.sendToQueue_schema[0].pressed_action == 'multidial') {
                                        $scope.multidialcount = item.sendToQueue_schema[0].multi_dial_schema.length - 2;
                                    } else {
                                        $scope.initQueueDialCount(i - 1);
                                        $scope.queuedialc[i - 1] = item.sendToQueue_schema[0].dial_schema.length - 2;
                                        $scope.initMultiDialCount(i - 1);
                                        $scope.multidialc[i - 1] = item.sendToQueue_schema[0].multi_dial_schema.length - 2;
                                    }
                                    break;
                                case "extension":
                                    if (i == 0 && item.ring_schema[0].pressed_action == 'dial') {
                                        $scope.extdialcount = item.ring_schema[0].dial_schema.length - 2;
                                    } else if (i == 0 && item.ring_schema[0].pressed_action == 'multidial') {
                                        $scope.multidialcount = item.ring_schema[0].multi_dial_schema.length - 2;
                                    } else {
                                        $scope.initExtDialCount(i - 1);
                                        $scope.extdialc[i - 1] = item.ring_schema[0].dial_schema.length - 2;
                                        $scope.initMultiDialCount(i - 1);
                                        $scope.multidialc[i - 1] = item.ring_schema[0].multi_dial_schema.length - 2;
                                    }
                                    break;
                            }
                        }
                    });
                }
            })
        }();
        $scope.setTab = function (tabId) {
            $scope.tab = tabId;
        };
        $scope.isSet = function (tabId) {
            return $scope.tab === tabId;
        };
        $scope.tab = 1;
        $scope.dialc = [];
        $scope.multidialc = [];
        $scope.queuedialc = [];
        $scope.promptdialc = [];
        $scope.extdialc = [];
        Prompt.listPrompt().get(function (response) {
            if (response.code == CONSTANTS.CODES.OK) {
                $scope.prompts = response.data;
            }
        });
        User.listPAForCallRouting().get(function (response) {
            if (response.code == CONSTANTS.CODES.OK) {
                $scope.pas = response.data;
            }
        });
        ADVCC.listQueue().get(function (response) {
            if (response.code == CONSTANTS.CODES.OK) {
                $scope.queues = response.data;
            }
        });
        getSelectOptions(User, $rootScope, function (data) {
            $scope.optionarr = data;
        });
        $scope.initMultipleDialCount = function () {
            $scope.multidialcount = 0;
        }
        $scope.initDialCount = function (index) {
            $scope.dialc[index] = 0;
        }
        $scope.initMultiDialCount = function (index) {
            $scope.multidialc[index] = 0;
        }
        $scope.initQueueDialCount = function (index) {
            $scope.queuedialc[index] = 0;
        }
        $scope.initPromptDialCount = function (index) {
            $scope.promptdialc[index] = 0;
        }
        $scope.initExtDialCount = function (index) {
            $scope.extdialc[index] = 0;
        }

        $scope.incrementMainCount = function () {
            $scope.maincount = $scope.maincount + 1;
        }
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
        }
        $scope.incrementGeoMainCount = function (geo) {
            $scope.geomaincount = $scope.geomaincount + 1;
            OfferTemplate.getStatesList().get(function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    $scope.preStates[$scope.geomaincount] = response.data;
                    geo.operations = $scope.JsonToArray(geo.operations);
                    geo.operations.forEach(function (item) {
                        $scope.preStates[$scope.geomaincount].forEach(function (state) {
                            item.state.forEach(function (dbstate) {
                                if (dbstate.name_long == state.name_long) {
                                    state.disabled = true;
                                }
                            });
                        });
                    });
                } else {
                    $scope.categoryList = null;
                    logger.logError(response.message);
                }
            });

        }
        $scope.incrementCCMainCount = function () {
            $scope.ccmaincount = $scope.ccmaincount + 1;
        }
        $scope.incrementDialCount = function () {
            $scope.dialcount = $scope.dialcount + 1;
        }
        $scope.incrementMultiDialCount = function () {
            $scope.multidialcount = $scope.multidialcount + 1;
        }
        $scope.incrementPromptDialCount = function () {
            $scope.promptdialcount = $scope.promptdialcount + 1;
        }
        $scope.incrementQueueDialCount = function () {
            $scope.queuedialcount = $scope.queuedialcount + 1;
        }
        $scope.incrementExtDialCount = function () {
            $scope.extdialcount = $scope.extdialcount + 1;
        }
        $scope.incrementOtherDialCount = function (index) {
            $scope.dialc[index] = (!isNaN($scope.dialc[index])) ? $scope.dialc[index] + 1 : $scope.dialc[index] = 1;
        }
        $scope.incrementOtherMultiDialCount = function (index) {
            $scope.multidialc[index] = (!isNaN($scope.multidialc[index])) ? $scope.multidialc[index] + 1 : $scope.multidialc[index] = 1;
        }
        $scope.incrementOtherQueueDialCount = function (index) {
//        $scope.queuedialc[index] = $scope.queuedialc[index] + 1;
            $scope.queuedialc[index] = (!isNaN($scope.queuedialc[index])) ? $scope.queuedialc[index] + 1 : $scope.queuedialc[index] = 1;
        }
        $scope.incrementOtherPromptDialCount = function (index) {
//        $scope.promptdialc[index] = $scope.promptdialc[index] + 1;
            $scope.promptdialc[index] = (!isNaN($scope.promptdialc[index])) ? $scope.promptdialc[index] + 1 : $scope.promptdialc[index] = 1;
        }
        $scope.incrementOtherExtDialCount = function (index) {
//        $scope.extdialc[index] = $scope.extdialc[index] + 1;
            $scope.extdialc[index] = (!isNaN($scope.extdialc[index])) ? $scope.extdialc[index] + 1 : $scope.extdialc[index] = 1;
        }

        $scope.JsonToArray = function (item) {
            return  Object.keys(item).map(function (k) {
                return item[k]
            });
        }
        $scope.changepriority = function (dialschema) {
            dialschema.forEach(function (value, key) {
                value.dial_priority = key;
            });
        };
        $scope.nestedJsonToArray = function (schema) {
            switch (schema.pressed_action) {
                case "dial":
                    schema.dial_schema = $scope.JsonToArray(schema.dial_schema);
                    $scope.changepriority(schema.dial_schema);
                    break;
                case "multidial":
                    schema.multi_dial_schema = $scope.JsonToArray(schema.multi_dial_schema);
                    //$scope.changepriority(schema.mullti_dial_schema);
                    break;
                case "reps":
                    schema.allrepsbusy_schema = $scope.JsonToArray(schema.dial_schema);
                    delete schema.dial_schema;
                    $scope.changepriority(schema.allrepsbusy_schema);
                    break;
                case "prompt":
                    schema.prompt_schema = $scope.JsonToArray(schema.prompt_schema);
                    break;
                case "queue":
                    schema.sendToQueue_schema = $scope.JsonToArray(schema.sendToQueue_schema);
                    break;
                case "extension":
                    schema.ring_schema = $scope.JsonToArray(schema.ring_schema);
                    break;
            }
        };
        $scope.submitHOO = function (data) {
            if (data && data.hootoggle && data.operationAfterBH && data.operationAfterBH[0].call_range_start && data.operationAfterBH[0].call_range_end && data.operationAfterBH[0].days.length) {
                $scope.ivr.hoo_schema = $scope.JsonToArray(data.operationAfterBH);
                $scope.ivr.hoo_schema.forEach(function (item) {
                    var start = moment(item.call_range_start).format("HHmm");
                    var end = moment(item.call_range_end).format("HHmm");
                    item.call_range_start = parseInt(start);
                    item.call_range_end = parseInt(end);

                    (item.call_range_start > item.call_range_end) ? item.round_time = true : item.round_time = false;
                });
                $scope.ivr.hoo = data.hootoggle;
                $scope.geo_tab = true;
                $scope.setTab(1);
            } else if (!data.hootoggle) {
                $scope.ivr.hoo = data.hootoggle;
                $scope.geo_tab = true;
                $scope.setTab(1);
            } else {
                logger.logError('Please fill in the Fields');
            }
        };
        $scope.submitGeo = function (data) {
            if (data && data.geotoggle && data.operations && (data.operations[0].area_code || data.operations[0].state.length)) {
                $scope.ivr.geo_schema = $scope.JsonToArray(data.operations);
                $scope.ivr.geo_schema.forEach(function (item, i) {
                    item.state = ($scope.states) ? $scope.states[i].title : item.state;
                });
                $scope.ivr.geo = data.geotoggle;
                $scope.cc_tab = true;
                $scope.setTab(2);
            } else if (!data.geotoggle) {
                $scope.ivr.geo = data.geotoggle;
                $scope.cc_tab = true;
                $scope.setTab(2);
            } else {
                logger.logError('Please fill in the Fields');
            }
        };
        $scope.submitCC = function (data) {
            if (data && data.cctoggle && data.no_of_calls) {
                $scope.ivr.no_of_calls = data.no_of_calls;
                $scope.ivr.cc = data.cctoggle;
                $scope.ivr_tab = true;
                $scope.setTab(3);
            } else if (!data.cctoggle) {
                $scope.ivr.cc = data.cctoggle;
                $scope.ivr_tab = true;
                $scope.setTab(3);
            } else if (data.cctoggle && !data.no_of_calls) {
                logger.logError('Please fill in the Fields');
            }
        };
        $scope.submitForm = function (data) {
            if (data) {
                if (!data.inital_prompt_id || data.inital_prompt_id == '' || data.inital_prompt_id == undefined) {
                    logger.logError('Please select initial prompt');
                } else if (!data.ivr_name || data.ivr_name == '' || data.ivr_name == undefined) {
                    logger.logError('Please Enter IVR Name');
                } else if (!data.pressed_operation || data.pressed_operation == '' || data.pressed_operation == undefined) {
                    logger.logError('Please Select IVR Operations');
                } else {
                    $scope.preferred_operation = $scope.JsonToArray(data.pressed_operation);
                    //tO CONVERT JSON TO ARRAY
                    data.pressed_operation = $scope.preferred_operation;
                    data.pressed_operation.forEach(function (option) {
                        switch (option.pressed_action) {
                            case "dial":
                                option.dial_schema = $scope.JsonToArray(option.dial_schema);
                                $scope.changepriority(option.dial_schema);
                                break;
                            case "multidial":
                                option.multi_dial_schema = $scope.JsonToArray(option.multi_dial_schema);
                                //$scope.changepriority(option.dial_schema);
                                break;
                            case "reps":
                                option.allrepsbusy_schema = $scope.JsonToArray(option.dial_schema);
                                delete option.dial_schema;
                                $scope.changepriority(option.allrepsbusy_schema);
                                break;
                            case "prompt":
                                option.prompt_schema = $scope.JsonToArray(option.prompt_schema);
                                $scope.nestedJsonToArray(option.prompt_schema[0]);
                                break;
                            case "queue":
                                option.sendToQueue_schema = $scope.JsonToArray(option.sendToQueue_schema);
                                $scope.nestedJsonToArray(option.sendToQueue_schema[0]);
                                break;
                            case "extension":
                                option.ring_schema = $scope.JsonToArray(option.ring_schema);
                                $scope.nestedJsonToArray(option.ring_schema[0]);
                                break;
                        }
                    })

                    $scope.ivr.inital_prompt_id = data.inital_prompt_id;
                    $scope.ivr.ivr_name = data.ivr_name;
                    $scope.ivr.ivr_schema = data.pressed_operation;
                    delete $scope.ivr.pressed_operation;
                    Ivr.submitIVRdata().save($scope.ivr, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            logger.logSuccess(response.message);
                            $location.path('/' + $filter('lowercase')($rootScope.authenticatedUser.role_id.code) + '/manage-call-routing');
                        } else {
                            logger.logError(response.message);
                        }
                    });
                }
            } else {
                logger.logError('Please fill in the Fields');
            }
        };
        $scope.removeItem = function (data, index) {
            if (data && data[index]) {
                delete data[index];
            }
        }

        $scope.resetCount = function (index, schema) {
            $scope.initDialCount(index);
            $scope.initQueueDialCount(index);
            $scope.initPromptDialCount(index);
            $scope.initExtDialCount(index);
            resetContent(schema.pressed_action, schema);
        }

        $scope.resetInitialCount = function (schema) {
            $scope.dialcount = 0;
            $scope.queuedialcount = 0;
            $scope.promptdialcount = 0;
            $scope.extdialcount = 0;
            resetContent(schema.pressed_action, schema);
        }

    }]);
