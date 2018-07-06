var longi = "";
var lati = "";

var phoneAgentApp = angular.module('PhoneAgents', ['ngAudio', 'LoggerService', 'ngTable'])

        /**************************************   Phone Agent Module Section   **************************************/
        /*@function : PhoneAgentCtrl
         * Creator   : Jubin Savla
         * @created  : 10 July 2015
         * @purpose  : Phone Agent (webPhone, callHistory etc...)
         */

        .controller('webPhoneCtrl', ['$interval', '$scope', 'logger', '$builder', '$validator', 'PAUser', 'CONSTANTS', function ($interval, $scope, logger, $builder, $validator, PAUser, CONSTANTS) {

                $scope.setTab = function (value) {
                    $scope.isSoftPhone = value ? false : true;
                }
                this.setTab = function (tabId) {
                    this.tab = tabId;
                };

                this.isSet = function (tabId) {
                    return this.tab === tabId;
                };


                $scope.saveCallerDetails = function (formData) {
                    console.log('formData', formData);
                    $validator.validate($scope, 'default').success(function () {
                        console.info('validation success');
                        resetAgentScript();
                        PAUser.saveCallerDetails().save({formData: formData, 'callData': $scope.callData}, function (response) {
                            if (response.code == CONSTANTS.CODES.OK) {
                                logger.logSuccess(response.message);
                                console.log("Success : " + response.message);
                                //$location.path('/advcc/list-agent-script/');
                            } else {
                                logger.logError(response.message);
                                console.log('Error :' + response.message);
                            }
                        });
                    }).error(function () {
                        logger.logError('validation error');
                    });
                }


                var mapFunc = function (zipData) {
                    if (zipData) {
                        var myLatLng = new google.maps.LatLng(parseFloat(zipData.Latitude), parseFloat(zipData.Longitude));

                        if (!$scope.map) {
                            $scope.map = new google.maps.Map(document.getElementById('map'), {
                                zoom: 6,
                                center: myLatLng
                            });
                        }

                        if ($scope.marker) {
                            $scope.marker.setMap(null);
                            $scope.map.setCenter(myLatLng);
                        }

                        $scope.marker = new google.maps.Marker({
                            position: myLatLng,
                            map: $scope.map
                        });
                    }
                    $scope.showDetailDiv = true;
                };

                var resetAgentScript = function (isResetAll) {
                    $builder.forms['default'] = [];
                    if (!isResetAll) {
                        $builder.addFormObject('default', {
                            id: 0,
                            index: 0,
                            component: 'welcomeNote',
                            label: 'Welcome Greeting',
                            description: 'Hello. May I have your name?'
                        });
                    }
                    $scope.newForm = $builder.forms['default'];
                    $scope.showDetailDiv = false;
                }
                resetAgentScript();

                $scope.callBillableTimer = 0;
                $scope.startCountDown = function (time) {
                    if (time) {
                        $scope.callBillableTimer = parseInt(time);
                        $interval.cancel($scope.thisTimer);
                        $scope.thisTimer = $interval(function () {
                            $scope.callBillableTimer -= 1;
                            if (!$scope.callBillableTimer) {
                                $interval.cancel($scope.thisTimer);
                            }
                        }, 1000)
                    } else {
                        $scope.callBillableTimer = 0;
                        $interval.cancel($scope.thisTimer);
                    }
                }

                $scope.campaignData = {};
                $scope.activePanel = -1;
                $scope.campaignDetails = function (callToNumber, calluuid, callFromNumber) {

                    resetAgentScript(true);
                    $scope.activePanel = -1;

                    $scope.callData = {phone: callToNumber, calluuid: calluuid, callFromNumber: callFromNumber}//13305202763}//number}
                    PAUser.campaignDetailsForNumber().save($scope.callData, function (response) {
                        $scope.showMapAndCampData(response)
                    });
                };

                $scope.campaignDetails_twilio = function (CallSid, callFromNumber) {

                    resetAgentScript(true);
                    $scope.activePanel = -1;

                    $scope.callData = {CallSid: CallSid, callFromNumber: callFromNumber}//13305202763}//number}
                    PAUser.campaignDetailsForNumber_twilio().save($scope.callData, function (response) {
                        $scope.showMapAndCampData(response)
                    });
                };


                $scope.showMapAndCampData = function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.campaignData = response.campaignData;

                        mapFunc(response.zipData);
                        if ($scope.campaignData && $scope.campaignData.offer_id && $scope.campaignData.offer_id.duration) {
                            setTimeForTimer($scope.campaignData.offer_id.duration.billable_callsecs);
                        } else {
                            setTimeForTimer(0);
                        }

                        if (response.inboundData) {
                            //angular.forEach(_.sortBy(response.inboundData.scriptData, 'index'), function (element, eIndex) {
                            angular.forEach(response.inboundData.scriptData, function (element, eIndex) {
                                console.log('element', element)
                                $builder.insertFormObject('default', element.index, {
                                    id: element.index, //eIndex,
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
                            $scope.faqs = response.inboundData.faqData;
                        }

                    }
                    $scope.newForm = $builder.forms['default'];
                }


                console.log('$scope.authenticatedUser', $scope.authenticatedUser);
                if ($scope.authenticatedUser && $scope.authenticatedUser.webphone_details && $scope.authenticatedUser.webphone_details.provider) {
                    switch ($scope.authenticatedUser.webphone_details.provider) {
                        case 'plivo':
                            $scope.provider = 'plivo';
                            plivoCallFunc($scope, logger, PAUser, CONSTANTS);
                            break;
                        case 'twilio':
                            $scope.provider = 'twilio';
                            twilioCallFunc($scope, logger, PAUser, CONSTANTS);
                            break;
                        default:
                            $scope.provider = false;
                    }
                } else {
                    $scope.provider = false;
                }

            }])


var plivoCallFunc = function ($scope, logger, PAUser, CONSTANTS) {

    $scope.call = function (call_no) {
        console.log("dial to number.." + call_no);
        call_login(call_no);
    };

    $scope.transferCall = function (transferData) {
        transferData['CallUUID'] = $scope.callData.calluuid;
        PAUser.transferWebPhoneCall().save(transferData, function (response) {
            if (response.code == CONSTANTS.CODES.OK) {
                logger.logSuccess(response.message);
                console.log("Success : " + response.message);
            } else {
                logger.logError(response.message);
                console.log('Error :' + response.message);
            }
        });
    }

    // dialer
    $scope.dialer = function (dial_value) {
        $scope.dial_number = ($scope.dial_number) ? $scope.dial_number + "" + dial_value : dial_value;
    }

    $scope.reset = function (tel_no) {
        if (tel_no) {
            $scope.dial_number = tel_no;
        } else {
            $scope.dial_number = '';
        }
    }

    //on init
    intiateWebPhone($scope);
}

var twilioCallFunc = function ($scope, logger, PAUser, CONSTANTS) {

    $scope.tw_MakeCall = function (call_no) {
        console.log("twilio dial to number.." + call_no);
        tw_MakeCall(call_no);
    }

    $scope.transferCall = function (transferData) {
        transferData['CallSid'] = $scope.callData.CallSid;
        PAUser.transferWebPhoneCall_twilio().save(transferData, function (response) {
            if (response.code == CONSTANTS.CODES.OK) {
                logger.logSuccess(response.message);
                console.log("Success : " + response.message);
            } else {
                logger.logError(response.message);
                console.log('Error :' + response.message);
            }
        });
    }

    // dialer
    $scope.tw_dialer = function (dial_value) {
        $scope.dial_number = ($scope.dial_number) ? $scope.dial_number + "" + dial_value : dial_value;
        tw_dialer(dial_value); //twilio send digits
    }

    $scope.reset = function (tel_no) {
        if (tel_no) {
            $scope.dial_number = tel_no;
        } else {
            $scope.dial_number = '';
        }
    }

    //on init
    PAUser.getTwilioDetail().get(function (response) {
        if (response.code == CONSTANTS.CODES.OK) {
            initTwilioWebPhone(response.token, $scope);
        } else {
            //Anything
        }
    });
}



phoneAgentApp.controller('callHistoryCtrl', ['$scope', 'Report', 'Module', function ($scope, Report, Module) {
        // Initiate plivo and login for call back initialization.
        intiateCallBackWebPhone($scope);
        $scope.callback = function (sip, elemId) {
            console.log("angular callback called" + sip);
            console.log(elemId);
            callback_login(sip, elemId);
        }

        //get call list as per date
        $scope.getDataByDate = function (dateData, val) {
            Report.callHistoryByDate().save(dateData, function (response) {
                var resCount = response.callListData.length;

                //getting commission, total calls, billable calls and avarage Duration Data
                var totalCallCount = response.callListData.length;

                var bcount = 0;
                var avgDuration = 0;
                angular.forEach(response.callListData, function (value, key) {
                    avgDuration = avgDuration + value.Duration;
                    if (value.is_billable == true) {
                        bcount = bcount + 1;
                    }
                });

                $scope.totalCallCount = {resCount: resCount, bcount: bcount, avgDuration: avgDuration};
                Module.pagination(response.callListData, val);
            });
        }

    }])

        .controller('voice_mailHistoryCtrl', ['$http', '$location', '$scope', '$timeout', 'ngAudio', 'ngProgressFactory', 'logger', 'CONSTANTS', 'Module', function ($http, $location, $scope, $timeout, ngAudio, ngProgressFactory, logger, CONSTANTS, Module) {

                // Initiate plivo and login for call back initialization.
                //intiateCallBackWebPhone($scope);

                $scope.audioFile = {};
                $scope.text = {};

                $scope.list_voiceMail = function () {
                    $http({
                        method: 'POST',
                        url: '/phoneAgent/voice_callHistory',
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
                    }).success(function (data) {
                        if (data.status == CONSTANTS.CODES.OK) {
                            console.log(data.resp)
                            $scope.voice_callHistory = data.resp;

                            _.each($scope.voice_callHistory, function (history, index) {
                                if (history.Timestamp && !history.StartTime) {
                                    history.StartTime = history.Timestamp;
                                }
                            })

                            Module.pagination($scope.voice_callHistory);
                        } else {
                            Module.pagination({});
                            $location.path(CONSTANTS.CODES.notFound);
                        }
                    });
                }
                $scope.list_voiceMail();

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

//            $scope.get_greeting = function () {
//                $http({
//                    method: 'POST',
//                    url: '/phoneAgent/get_greeting_audio',
//                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
//                }).success(function (data) {
//                    if (data.status == CONSTANTS.CODES.OK) {
//                        $scope.greeting_audio_name = data.resp.greeting_audio;
//                        $scope.get_greeting_audio = ngAudio.load("assets/greeting_audio/" + data.resp.greeting_audio);
//                    } else {
//                        $location.path(CONSTANTS.CODES.notFound);
//                    }
//                });
//            }
//            $scope.get_greeting();

                $scope.onAudioFileSelect = function ($files) {
                    console.log($files);
                    $scope.audio_file = $files[0];
                    $scope.audiofile_clicked = true;
                }

                $scope.uploadGreeting = function () {

                    console.log($scope.audio_file);
                    var ext = $('#greeting_audio').val().split('.').pop().toLowerCase();
                    if ($.inArray(ext, ['mp3', 'mpeg', '.m3u', '.wav']) == -1) {
                        alert('invalid file upload either of the format .mp3,.mpeg');
                        return false;
                    } else {
                        // progress bar start
                        $scope.progressbar = ngProgressFactory.createInstance();
                        $scope.progressbar.start();


                        $timeout(function () {
                            var fd = new FormData();
                            fd.append('greeting_audio', $scope.audio_file);
                            $http.post('/phoneAgent/upload_greeting', fd, {
                                transformRequest: angular.identity,
                                headers: {'Content-Type': undefined}
                            })
                                    .success(function (response, status, headers, config) {
                                        if (response.result == CONSTANTS.CODES.OK) {
                                            $scope.success_msg = response.message;
                                            logger.logSuccess(response.message);
                                            console.log("Success : " + response.message);
                                            $scope.get_greeting();
                                        } else if (response.result == CONSTANTS.CODES.notFound) {
                                            $scope.error_msg = response.message;
                                            logger.logError(response.message);
                                            console.log('Error :' + response.message);
                                        }
                                        $scope.progressbar.complete();
                                    })
                                    .error(function (response, status) {
                                        console.log("Error Occured!");
                                        $scope.progressbar.complete();
                                    })
                        }, 6000); // delay 250 ms
                    }


                }

                $scope.deleteVoiceMail = function (voiceId) {

                    //   if (confirm("Are you sure,You want to delete this entry?")) {
                    data = {'voiceId': voiceId};
                    $http.post('/phoneAgent/delete_voiceMail', data)
                            .success(function (response, status, headers, config) {
                                if (response.code == CONSTANTS.CODES.OK) {
                                    $scope.success_delete = response.message;
                                    logger.logSuccess(response.message);
                                    console.log("Success : " + response.message);
                                    $scope.list_voiceMail();
                                } else if (response.code == CONSTANTS.CODES.notFound) {
                                    $scope.error_delete = response.message;
                                    logger.logError(response.message);
                                    console.log('Error :' + response.message);
                                }
                            })
                            .error(function (response, status) {
                                console.log("Error Occured!");
                            })
                    //    }

                }

                $scope.callback = function (sip, elemId) {
                    console.log("angular callback called" + sip);
                    console.log(elemId);
                    callback_login(sip, elemId);
                }
            }])

        .controller('paCallForwardCtrl', ['$scope', 'logger', 'PAUser', 'CONSTANTS', function ($scope, logger, PAUser, CONSTANTS) {

                PAUser.getCallForwardDetails().get(function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.paInfo = response.data;
                        //logger.logSuccess(response.message);
                    } else if (response.code == CONSTANTS.CODES.Error) {
                        logger.logError(response.message);
                    }
                });

                $scope.submitPaInfo = function (formData) {
                    if (!$scope.paInfo.call_forward.status || ($scope.paInfo.call_forward.status && $scope.paInfo.call_forward.phone)) {
                        PAUser.saveCallForwardDetails().save(formData, function (response) {
                            if (response.code == CONSTANTS.CODES.OK) {
                                logger.logSuccess(response.message);
                            } else if (response.code == CONSTANTS.CODES.Error) {
                                logger.logError(response.message);
                            }
                        });
                    } else if (!$scope.paInfo.call_forward.status) {
                        logger.logError('Please Fill All the fields');
                    }
                }
            }])
