/*@function : LsUserCtrl
 * Creator   : Smartdata
 * @purpose  : To manage lead generation users
 */
app.controller('ADVCCPACtrl', ['$scope', 'ADVCC', 'Offer', 'Module', '$routeParams', '$route', 'logger', 'CONSTANTS', function ($scope, ADVCC, Offer, Module, $routeParams, $route, logger, CONSTANTS) {

        // Providing the facilities of change password to user
        $scope.showUserList = function (roleCode) {
            roleCode = $routeParams.code;

            ADVCC.listPhoneAgent().get({}, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    //$scope.userList = response.data;
                    Module.pagination(response.data);
                } else {
                    Module.pagination({});
                    //logger.logError(response.message);
                }
            });

            ADVCC.listQueue().get({}, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    $scope.queueList = response.data;
                } else {
                    //logger.logError(response.message);
                    console.log('Error :' + response.message);
                }
            });

            ADVCC.listCalendarScript().get({}, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    $scope.calendarScriptList = response.data;
                } else {
                    //logger.logError(response.message);
                    console.log('Error :' + response.message);
                }
            });

            $scope.roleCode = roleCode;
            $scope.showViewUser = false;
            $scope.showAddPhone = false;
            $scope.showListView = true;
            $scope.manageAccess = false;
        };

        $scope.formData = {pa_my_campaign: []};
        $scope.createPA = function (formData, isAdd) {
            var selectedQueues = formData.queues;
            formData.queues = [];
            angular.forEach(selectedQueues, function (queue) {
                formData.queues.push(queue._id);
            });

            var myCam = formData.pa_my_campaign;
            formData.pa_my_campaign = [];
            angular.forEach(myCam, function (myCampaign) {
                formData.pa_my_campaign.push(myCampaign._id);
            });

            var selectedScript = formData.calendarScript;
            formData.calendarScript = [];
            angular.forEach(selectedScript, function (script) {
                formData.calendarScript.push({script_id: script._id});
            });

            if (isAdd) {
                ADVCC.registerPA().save(formData, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        //$scope.userList = response.data;
                        logger.logSuccess(response.message);
                        console.log("Success : " + response.message);
                        $route.reload();
                    } else {
                        logger.logError(response.message);
                        console.log('Error :' + response.message);
                    }
                });
            } else {
                //logger.log('Backend Pending');
                ADVCC.editPA().save(formData, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        //$scope.userList = response.data;
                        logger.logSuccess(response.message);
                        console.log("Success : " + response.message);
                        $route.reload();
                    } else {
                        logger.logError(response.message);
                        console.log('Error :' + response.message);
                    }
                });
            }
        };

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
                        //$scope.userList = response.data;
                        Module.pagination(response.data);
                        logger.logSuccess(response.message);
                        console.log("Success : " + response.message);
                    } else {
                        logger.logError(response.message);
                    }
                });
            });
        };

        // change the status of module
        $scope.statusUser = function (user_id, status, rolecode) {
            var user = {
                'rolecode': rolecode,
                'user_id': user_id,
                'status': (status == 'active') ? 'deactive' : 'active'
            }
            User.statusUser().save(user, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    Module.pagination(response.data);
                    logger.logSuccess(response.message);
                    console.log("Success : " + response.message);
                } else {
                    logger.logError(response.message);
                    console.log('Error :' + response.message);
                }
            });
        };

        $scope.getAddPhoneForm = function () {
            $scope.showListView = false;
            $scope.showViewUser = false;
            $scope.showAddPhone = true;
            $scope.manageAccess = false;
            $scope.add = true;

            angular.forEach($scope.queueList, function (queue) {
                queue['ticked'] = false;
            });

            angular.forEach($scope.calendarScriptList, function (calendarScript) {
                calendarScript['ticked'] = false;
            });
        };

        $scope.getEditPhoneForm = function (ids) {
            ADVCC.findPAByID().get({advccId: ids}, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    $scope.formData = response.data;

                    angular.forEach($scope.queueList, function (queue) {
                        queue['ticked'] = (response.data.queues.indexOf(queue._id) != -1);
                    });

                    angular.forEach($scope.calendarScriptList, function (calendarScript) {
                        calendarScript['ticked'] = _.countBy(response.data.calendarScript, {script_id: calendarScript._id})['true'] ? true : false;
                    });

                    $scope.formData['pa_my_campaign'] = [];
                    if (response.campaignData && response.campaignData[0] && response.campaignData[0].campaigns) {
                        angular.forEach(response.campaignData[0].campaigns, function (myCampaign) {
                            $scope.formData.pa_my_campaign.push({label: myCampaign.campaign_name, _id: myCampaign._id, type: 'myCam'});

                            $scope.models.InBoundlist = _.reject($scope.models.InBoundlist, function (cam) {
                                return cam._id == myCampaign._id;
                            });
                            $scope.models.OutBoundlist = _.reject($scope.models.OutBoundlist, function (cam) {
                                return cam._id == myCampaign._id;
                            });
                        });
                    }
                    console.log("Success : " + response.message);
                } else {
                    logger.logError(response.message);
                    console.log('Error :' + response.message);
                }
            });
            $scope.showListView = false;
            $scope.showAddPhone = true;
            $scope.showViewUser = false;
            $scope.manageAccess = false;
            $scope.add = false;
        };

        // back process
        $scope.back = function () {
            $route.reload();
        };

        $scope.models = {
            selected: null,
            InBoundlist: [],
            OutBoundlist: []
        };

        $scope.allowIn = ['inbound'];
        $scope.allowOut = ['outbound'];
        $scope.allowAll = ['inbound', 'outbound'];
        //To list all current campaigns
        $scope.list_currentCampaignsLB = function () {
            Offer.list_currentCampaignsLB().get({}, function (response) {
                if (response.data && response.data[0] && response.data.campaigns) {
                    response.data[0].campaigns.forEach(function (campaignData, index) {
                        if (campaignData.campaign_direction == 'inbound') {
                            $scope.models.InBoundlist.push({label: campaignData.campaign_name, _id: campaignData._id, type: 'inbound'});
                        } else if (campaignData.campaign_direction == 'outbound') {
                            $scope.models.OutBoundlist.push({label: campaignData.campaign_name, _id: campaignData._id, type: 'outbound'});
                        }
                    });
                }
            })
        }();
        // Generate initial model
//    for (var i = 1; i <= 3; ++i) {
//        $scope.models.InBoundlist.push({label: "Static In Cam " + i});
//        $scope.models.MyCampaignlist.push({label: "Static My Cam " + i});
//        $scope.models.OutBoundlist.push({label: "Static Out Cam " + i});
//    }

        // Model to JSON for demo purpose
        $scope.$watch('models', function (model) {
            $scope.modelAsJson = angular.toJson(model, true);
        }, true);

    }])
        .controller('ADVCCQueueCtrl', ['$scope', 'ADVCC', 'Module', '$routeParams', '$route', 'logger', 'CONSTANTS', function ($scope, ADVCC, Module, $routeParams, $route, logger, CONSTANTS) {

                // Providing the facilities of change password to user
                $scope.showUserList = function (roleCode) {
                    roleCode = $routeParams.code;
                    $scope.roleCode = $routeParams.code;

                    ADVCC.listQueue().get({}, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            //$scope.queueList = response.data;
                            Module.pagination(response.data);
                        } else {
                            Module.pagination({});
                            //logger.logError(response.message);
                            console.log('Error :' + response.message);
                        }
                    });

                    ADVCC.listPA().get(function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            $scope.PAList = response.data;
                        } else {
                            console.log('Error :' + response.message);
                        }
                    });

                    $scope.roleCode = roleCode;
                    $scope.showViewUser = false;
                    $scope.showAddPhone = false;
                    $scope.showListView = true;
                    $scope.manageAccess = false;
                }();

                $scope.createQueue = function (formData, isAdd) {

                    var selectedAgents = formData.associated_agents;
                    formData.associated_agents = [];
                    angular.forEach(selectedAgents, function (agent) {
                        formData.associated_agents.push(agent._id);
                    });

                    if (isAdd) {
                        ADVCC.addQueue().save(formData, function (response) {
                            if (response.code == CONSTANTS.CODES.OK) {
                                //$scope.queueList = response.data;
                                logger.logSuccess(response.message);
                                console.log("Success : " + response.message);
                                $route.reload();
                            } else {
                                logger.logError(response.message);
                                console.log('Error :' + response.message);
                            }
                        });
                    } else {
                        ADVCC.editQueue().save(formData, function (response) {
                            if (response.code == CONSTANTS.CODES.OK) {
                                //$scope.queueList = response.data;
                                logger.logSuccess(response.message);
                                console.log("Success : " + response.message);
                                $route.reload();
                            } else {
                                logger.logError(response.message);
                                console.log('Error :' + response.message);
                            }
                        });
                    }
                }

                // delete the users
                $scope.deleteQueue = function (queueId) {
                    swal({
                        title: CONSTANTS.SWAL.deletetitle,
                        text: CONSTANTS.SWAL.deletetext,
                        type: CONSTANTS.SWAL.type,
                        showCancelButton: CONSTANTS.SWAL.showCancelButton,
                        confirmButtonColor: CONSTANTS.SWAL.confirmButtonColor,
                        confirmButtonText: CONSTANTS.SWAL.deleteconfirmButtonText,
                        closeOnConfirm: CONSTANTS.SWAL.closeOnConfirm},
                    function () {
                        ADVCC.deleteQueue().save({'queue_id': queueId}, function (response) {
                            if (response.code == CONSTANTS.CODES.OK) {
                                Module.pagination(response.data);
                                logger.logSuccess(response.message);
                                console.log("Success : " + response.message);
                                $route.reload();
                            } else {
                                logger.logError(response.message);
                                console.log('Error :' + response.message);
                            }
                        });
                    })
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
                            Module.pagination(response.data);
                            logger.logSuccess(response.message);
                            console.log("Success : " + response.message);
                        } else {
                            logger.logError(response.message);
                            console.log('Error :' + response.message);
                        }
                    });
                }

                $scope.getAddPhoneForm = function () {
                    $scope.showListView = false;
                    $scope.showViewUser = false;
                    $scope.showAddPhone = true;
                    $scope.manageAccess = false;
                    $scope.add = true;

                    angular.forEach($scope.PAList, function (pa) {
                        pa['ticked'] = false;
                    });
                }

                $scope.getEditForm = function (ids) {
                    ADVCC.findByQueueID().get({queueId: ids}, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            $scope.formData = response.data;


                            _.each($scope.PAList, function (pa) {
                                pa['ticked'] = (_.findIndex(response.data.associated_agents, {'agent_id': pa._id}, 'agent_id') != -1);
                            });

                            var tempPAList = [];
                            angular.forEach(response.data.associated_agents, function (PA, index) {
                                tempPAList[index] = PA.agent_id;
                            });
                            $scope.formData.associated_agents = tempPAList;
//                        logger.logSuccess(response.message);
                            console.log("Success : " + response.message);
                        } else {
                            logger.logError(response.message);
                            console.log('Error :' + response.message);
                        }
                    });
                    $scope.showListView = false;
                    $scope.showAddPhone = true;
                    $scope.showViewUser = false;
                    $scope.manageAccess = false;
                    $scope.add = false;
                }

                // back process
                $scope.back = function () {
                    $route.reload();
                }

            }])

        .controller('agentScriptListCtrl', ['$scope', '$route', '$location', 'Module', 'ADVCC', 'logger', 'CONSTANTS', function ($scope, $route, $location, Module, ADVCC, logger, CONSTANTS) {
                $scope.listAgentScript = function () {
                    ADVCC.listAgentScript().get({}, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            console.log("Success : " + response.message);
                            var scripts = response.data;
                            var ibs = response.ib;
                            scripts.forEach(function (script) {
                                ibs.forEach(function (ib) {
                                    if (ib.agent_script == script._id) {
                                        script.ib = ib.trunk_name;
                                    }
                                });
                            });
                        } else {
                            //logger.logError(response.message);
                            console.log('Error :' + response.message);
                        }
                        Module.pagination(scripts);
                    });
                }

                $scope.listCalendarScript = function () {
                    ADVCC.listCalendarScript().get({}, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            console.log("Success : " + response.message);
                            var scripts = response.data;

                            var PAList = response.PAList;
                            _.forEach(scripts, function (script) {
                                script['associated_pa'] = _.filter(PAList, function (PA) {
                                    return _.countBy(PA.calendarScript, {script_id: script._id})['true'] ? true : false;
                                });
                            });

                        } else {
                            //logger.logError(response.message);
                            console.log('Error :' + response.message);
                        }
                        Module.pagination(scripts);
                    });
                }

                $scope.editScript = function (scriptId) {
                    $location.path('/advcc/agent-script/' + scriptId);
                }
                $scope.editCalendarScript = function (scriptId) {
                    $location.path('/advcc/calendar-script/' + scriptId);
                }

                // delete the users
                $scope.deleteScript = function (scriptId) {
                    swal({
                        title: CONSTANTS.SWAL.deletetitle,
                        text: CONSTANTS.SWAL.deletetext,
                        type: CONSTANTS.SWAL.type,
                        showCancelButton: CONSTANTS.SWAL.showCancelButton,
                        confirmButtonColor: CONSTANTS.SWAL.confirmButtonColor,
                        confirmButtonText: CONSTANTS.SWAL.deleteconfirmButtonText,
                        closeOnConfirm: CONSTANTS.SWAL.closeOnConfirm
                    }, function () {
                        ADVCC.deleteAgentScript().save({'script_id': scriptId}, function (response) {
                            if (response.code == CONSTANTS.CODES.OK) {
                                logger.logSuccess(response.message);
                                console.log("Success : " + response.message);
                                $route.reload();
                            } else {
                                logger.logError(response.message);
                                console.log('Error :' + response.message);
                            }
                        });
                    });
                };

                // back process
                $scope.back = function () {
                    $route.reload();
                }
            }])

        .controller('TestCtrl', ['$rootScope', '$scope', '$builder', 'ADVCC', 'Offer', 'CONSTANTS', function ($rootScope, $scope, $builder, ADVCC, Offer, CONSTANTS) {

                Offer.getStatesList().get({}, function (resp) {
                    $rootScope.stateList = resp.data;
                });

                $builder.forms['default'] = [];
//            ADVCC.getAgentScript().get({scriptId: '56a1f8612d777c9f26c3793c'}, function (response) {
                ADVCC.getAgentScript().get({scriptId: '56b479c2effeca2331c908d3'}, function (response) {
                    if (response.code == CONSTANTS.CODES.OK && response.data) {
                        angular.forEach(response.data.scriptData, function (element, eIndex) {
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
                        $scope.faqs = response.data.faqData;
                        $scope.formData = {
                            script_id: response.data._id,
                            script_name: response.data.script_name
                        };
                    }
                    $scope.form = $builder.forms['default'];
                });

                /* Tour Setup */
                // load cookie, or start new tour
                $scope.currentStep = 0;

                /* When Tour ended in middle */
                $scope.postTourCallback = function () {
                    alert('Tour Ended');
                }

                /* When Tour get completed */
                $scope.tourCompleteCallback = function () {
                    alert('Tour Completed');
                }

                // save cookie after each step
                //    $scope.stepComplete = function() {
                //      ipCookie('myTour', $scope.currentStep, { expires: 3000 });
                //    };
                /* Tour Setup Ends Here */
            }])
        .controller('agentScriptCtrl', ['$scope', '$location', '$routeParams', '$builder', '$validator', 'ADVCC', 'logger', 'CONSTANTS', function ($scope, $location, $routeParams, $builder, $validator, ADVCC, logger, CONSTANTS) {
                $scope.faqs = [];
                $scope.isNameEdit = false;
                $scope.isEdit = [];
                $scope.tempFaqs = [];
                $scope.addFaq = function () {
                    var que = 'Question';
                    var ans = 'Answer';
                    $scope.faqs.push({que: que, ans: ans});
                    $scope.editFaq($scope.faqs.length - 1);
                }
                $scope.editFaq = function (fIndex) {
                    $scope.isEdit[fIndex] = true;
                    $scope.tempFaqs[fIndex] = {
                        que: $scope.faqs[fIndex].que,
                        ans: $scope.faqs[fIndex].ans
                    };
                }
                $scope.saveFaq = function (fIndex) {
                    $scope.isEdit[fIndex] = false;
                    $scope.faqs[fIndex] = $scope.tempFaqs[fIndex];
                }
                $scope.deleteFaq = function (fIndex) {
                    $scope.isEdit.splice(fIndex, 1);
                    $scope.faqs.splice(fIndex, 1);
                }
                $scope.cancelFaq = function (fIndex) {
                    $scope.isEdit[fIndex] = false;
                }
                $scope.submitEverything = function (scriptData, faqData) {
                    $validator.validate($scope, 'default').success(function () {
                        console.info('validation success');
                        ADVCC.saveAgentScript().save({formData: $scope.formData, scriptData: scriptData, faqData: faqData}, function (response) {
                            if (response.code == CONSTANTS.CODES.OK) {
                                logger.logSuccess(response.message);
                                console.log("Success : " + response.message);
                                $location.path('/advcc/list-agent-script/');
                            } else {
                                logger.logError(response.message);
                                console.log('Error :' + response.message);
                            }
                        });
                    }).error(function () {
                        logger.logError('validation error');
                    });
                };

                $builder.forms['default'] = [];
                if ($routeParams.scriptId) {
                    ADVCC.getAgentScript().get({scriptId: $routeParams.scriptId}, function (response) {
                        if (response.code == CONSTANTS.CODES.OK && response.data) {
                            angular.forEach(response.data.scriptData, function (element, eIndex) {
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
                            $scope.faqs = response.data.faqData;
                            $scope.formData = {
                                script_id: response.data._id,
                                script_name: response.data.script_name
                            };
                        } else {
                            $scope.formData = {};
                            //$scope.script_id = '';

                            $builder.addFormObject('default', {
                                id: 0,
                                index: 0,
                                component: 'welcomeNote',
                                label: 'Welcome Greeting',
                                description: 'Hello. May I have your name?'
                            });
                        }

                        $scope.form = $builder.forms['default'];
                    });
                } else {
                    $scope.formData = {};
                    //$scope.script_id = '';
                    $builder.addFormObject('default', {
                        id: 0,
                        index: 0,
                        component: 'welcomeNote',
                        label: 'Welcome Greeting',
                        description: 'Hello. May I have your name?'
                    });

                    $scope.form = $builder.forms['default'];
                }
            }])
        .controller('calendarScriptCtrl', ['$scope', '$location', '$routeParams', '$builder', '$validator', 'ADVCC', 'logger', 'CONSTANTS', function ($scope, $location, $routeParams, $builder, $validator, ADVCC, logger, CONSTANTS) {
                $scope.isNameEdit = false;
                $scope.submitEverything = function (scriptData, formData) {
                    $validator.validate($scope, 'default').success(function () {
                        console.info('validation success');
                        formData['script_type'] = 'calendar_script';
                        ADVCC.saveAgentScript().save({formData: formData, scriptData: scriptData}, function (response) {
                            if (response.code == CONSTANTS.CODES.OK) {
                                logger.logSuccess(response.message);
                                console.log("Success : " + response.message);
                                $location.path('/advcc/list-calendar-script/');
                            } else {
                                logger.logError(response.message);
                                console.log('Error :' + response.message);
                            }
                        });
                    }).error(function () {
                        logger.logError('validation error');
                    });
                };

                $builder.forms['default'] = [];
                if ($routeParams.scriptId) {
                    ADVCC.getAgentScript().get({scriptId: $routeParams.scriptId}, function (response) {
                        if (response.code == CONSTANTS.CODES.OK && response.data) {
                            angular.forEach(response.data.scriptData, function (element, eIndex) {
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
                            $scope.faqs = response.data.faqData;
                            $scope.formData = {
                                script_id: response.data._id,
                                script_name: response.data.script_name
                            };
                        } else {
                            $scope.formData = {};
                            //$scope.script_id = '';
                            $builder.addFormObject('default', {
                                id: 0,
                                index: 0,
                                component: 'welcomeNote',
                                label: 'Welcome Greeting',
                                description: 'Hello. May I have your name?'
                            });
                        }

                        $scope.form = $builder.forms['default'];
                    });
                } else {
                    $scope.formData = {};
                    //$scope.script_id = '';
                    $builder.addFormObject('default', {
                        id: 0,
                        index: 0,
                        component: 'welcomeNote',
                        label: 'Welcome Greeting',
                        description: 'Hello. May I have your name?'
                    });

                    $scope.form = $builder.forms['default'];
                }
            }])
        .controller('advccOutboundCallCtrl', ['$scope', 'Prompt', 'CONSTANTS', function ($scope, Prompt, CONSTANTS) {
                $scope.timezones = [
                    {'name': 'America/New_York', 'text': 'Eastern Time Zone'},
                    {'name': 'America/Chicago', 'text': 'Central Time Zone'},
                    {'name': 'America/Boise', 'text': 'Mountain Time Zone'},
                    {'name': 'America/Los_Angeles', 'text': 'Pacific Time Zone'}
                ];


                Prompt.listPrompt().get(function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.prompts = response.data;
                    }
                });

                $scope.tab = 1;
                $scope.isSet = function (tabId) {
                    return $scope.tab === tabId;
                };
                $scope.setTab = function (tabId) {
                    switch (tabId) {
                        case 1 :
                            $scope.composee = true;
                            break;
                        case 2 :
                            $scope.receiver = true;
                            break;
                        case 3 :
                            $scope.getTimezoneData();
                            $scope.preview = true;
                            break;
                        case 4 :
                            $scope.congo = true;
                            break;
                    }
                    $scope.tab = tabId;
                };
                $scope.compose = {method: 'weekly'}
            }])
        /* ADVCC/PA Document Upload Controller */
        .controller('ADVCCDocUploadCtrl', ['$scope', '$location', 'ADVCC', 'Module', '$routeParams', 'Upload', '$timeout', 'logger', 'CONSTANTS', function ($scope, $location, ADVCC, Module, $routeParams, Upload, $timeout, logger, CONSTANTS) {

                $scope.currentLeadId = $routeParams.leadId;

                /*@function : getAssignedFormScript
                 * Creator   : Smartdata
                 * @purpose  : To get all calendar script assigned to PA
                 */
                /*$scope.getLeadList = function () {
                 ADVCC.getLeadList().get({}, function (response) {
                 if (response.code == CONSTANTS.CODES.OK) {
                 $scope.leadList = response.data;
                 console.log('response',response.data);
                 console.log('leadList', response.message);
                 } else {
                 logger.logError(response.message);
                 }
                 });
                 }();*/

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
                $scope.documentId = '';
                $scope.upload = function (files) {
                    if (files && files.length) {
                        Upload.upload({
                            url: '/api_advcc/advccPaDocumentUpload',
                            file: files,
                            fields: {'documentId': $scope.documentId}
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
                                    console.log('ResponseData', data);
                                    $scope.contracts = data.data ? data.data.files : {};
                                    $scope.documentId = data.data._id ? data.data._id : {};
                                    logger.logSuccess(data.message);

                                    $scope.log = "File Uploaded Successfully. " + config.file.name;
                                } else {
                                    $scope.log = "Error in Uploading File. " + config.file.name
                                }
                            });
                        });
                    }
                };

                /* Delete Documents */
                $scope.deleteDocuments = function (documentId, fileDocumentId, filepath) {

                    swal({
                        title: CONSTANTS.SWAL.deletetitle,
                        text: CONSTANTS.SWAL.deletetext,
                        type: CONSTANTS.SWAL.type,
                        showCancelButton: CONSTANTS.SWAL.showCancelButton,
                        confirmButtonColor: CONSTANTS.SWAL.confirmButtonColor,
                        confirmButtonText: CONSTANTS.SWAL.deleteconfirmButtonText,
                        closeOnConfirm: CONSTANTS.SWAL.closeOnConfirm},
                    function () {
                        ADVCC.deleteDocuments().save({'documentId': documentId, 'fileDocumentId': fileDocumentId, 'filepath': filepath}, function (data) {
                            if (data.result == CONSTANTS.CODES.OK) {
                                $scope.contracts = data.data ? data.data.files : {};
                                logger.logSuccess(data.message);
                            } else {
                                logger.logError(response.message);
                            }
                        });
                    });
                }

                /* Download Documents */
                $scope.downloadDocuments = function (filepath) {
                    var filepath1 = filepath.replace('public/assets', 'assets')
                    window.open(filepath1);
                }
                // Drag and Drop File upload Code ------ End
                //*************************************************************************************/

                $scope.uploadDocumentFunc = function (documentId, formData) {

                    if ($scope.uploadDocument.$invalid) {
                        logger.logError('Please provide all document details');
                        return false;
                    }

                    formData.lead_id = $scope.currentLeadId;
                    ADVCC.saveDocumentData().save({'documentId': documentId, 'formData': formData}, function (data) {
                        if (data.result == CONSTANTS.CODES.OK) {

                            $location.path('/' + data.roleId.toLowerCase() + '/listDocument/' + $scope.currentLeadId);
                            logger.logSuccess(data.message);
                        } else {
                            logger.logError(data.message);
                        }
                    });
                }

                //to get  all offer template
                $scope.listAllDocuments = function () {
                    ADVCC.listAllDocuments().get({lead_id: $scope.currentLeadId}, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            console.log('responseData', response.data);

                            Module.pagination(response.data);
                        } else {
                            Module.pagination({});
//                        logger.logError(response.message);
                        }
                    });
                }

                $scope.viewFileDocuments = function (documentId) {
                    console.log('documentId', documentId);
                    ADVCC.listAllfileUploaded().get({documentId: documentId}, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            console.log('responseFiles', response.data);
                            $scope.fileDocuments = response.data.files;
                        } else {
                            logger.logError(response.message);
                        }
                    })
                }

                $scope.viewDocument = function (filepath) {
                    var filepath1 = filepath.replace('public/assets', 'assets')
//                $scope.filePath = filepath1;
                    window.open(filepath1);
                }

                /* Delete Full Documents */
                $scope.deleteFullDocument = function (documentId) {
                    swal({
                        title: CONSTANTS.SWAL.deletetitle,
                        text: CONSTANTS.SWAL.deletetext,
                        type: CONSTANTS.SWAL.type,
                        showCancelButton: CONSTANTS.SWAL.showCancelButton,
                        confirmButtonColor: CONSTANTS.SWAL.confirmButtonColor,
                        confirmButtonText: CONSTANTS.SWAL.deleteconfirmButtonText,
                        closeOnConfirm: CONSTANTS.SWAL.closeOnConfirm},
                    function () {
                        ADVCC.deleteFullDocument().save({'documentId': documentId}, function (data) {

                            if (data.code == CONSTANTS.CODES.OK) {
                                Module.pagination(data.data);
                            } else {
                                Module.pagination({});
                                logger.logError(data.message);
                            }
                        });
                    });
                }

            }])
        /* ADVCC/PA Document Upload Controller Ends Here */

        .controller('ReferentialTableCtrl', ['Module', function (Module) {
                //Dummy data
//            Module.pagination([{a: 1}, {a: 2}, {a: 3}, {}, {}, {}, {}, {}, {}, {}, {}], 1);
                Module.pagination([{a: 1}, {a: 2}, {a: 3}, {}, {}, {}, {}, {}, {}, {}, {}]);
            }]);

/*@function : MediaCreationCtrl
 * Creator   : Smartdata
 * @purpose  : To manage Media Creation Request form
 */
app.controller('MediaCreationCtrl', ['$scope', 'ADVCC', 'Module', 'logger', 'CONSTANTS', function ($scope, ADVCC, Module, logger, CONSTANTS) {

        $scope.submitForm = function (data) {
            console.log(data);
            ADVCC.saveMediaRequest().save(data, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    logger.logSuccess(response.message);
                    $scope.attr = {};
                    console.log("Success : " + response.message);
//                $location.path('/advcc/attribution-campaign');
                } else {
                    logger.logError(response.message);
                    console.log('Error :' + response.message);
                }
            });
        }

        $scope.getMediaList = function () {
            ADVCC.getMediaList().get(function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    Module.pagination(response.data);
                } else {
                    logger.logError(response.message);
                }
            });
        }
    }])

app.controller('ImportContactCtrl', ['$scope', 'fileUpload', function ($scope, fileUpload) {
        $scope.uploadFile = function () {
            var file = $scope.myFile;
            console.dir(file);
            var uploadUrl = "/api_advcc/importClientCSV";
            fileUpload.uploadFileToUrl(file, uploadUrl);
        };
    }])

app.directive('fileModel', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var model = $parse(attrs.fileModel);
                var modelSetter = model.assign;

                element.bind('change', function () {
                    scope.$apply(function () {
                        modelSetter(scope, element[0].files[0]);
                    });
                });
            }
        };
    }]);

app.service('fileUpload', ['$http', function ($http) {
        this.uploadFileToUrl = function (file, uploadUrl) {
            var fd = new FormData();
            fd.append('file', file);
            $http.post(uploadUrl, fd, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            })
                    .success(function () {
                    })
                    .error(function () {
                    });
        }
    }]);

