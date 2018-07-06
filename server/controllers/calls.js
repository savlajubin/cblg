var express = require('express');
var app = express();
var fs = require('fs');
var mongoose = require('mongoose');
var callModel = require('../models/callHistories');
var callerDetailModel = require('../models/callerDetail');
var greetingAudioModel = require('../models/greetingAudio');
var ringToNumberModel = require('../models/ringToNumber');
var ivrModel = require('../models/ivr');
var inboundTrunkModel = require('../models/inbound_trunk');
var zipcode = require('../models/zipcode');
var userModel = require('../models/user');
var queuesModel = require('../models/queues.js');
var promptModel = require('../models/prompt.js');
var contactModel = require('../models/contact.js');
var campaignCtrl = require('../controllers/campaign.js');
var contactCtrlAfterHours = require('../controllers/contact.js').afterHours;
var plivo = require('plivo');
var config = require('../../config/constant.js');

var formidable = require('formidable');
var _ = require("underscore");
var async = require('async');
var moment = require('moment');

/*
 var plivoApi = plivo.RestAPI({
 authId: config.constant.PLIVO_CREDENTILAS.authId, //Client from constant file
 authToken: config.constant.PLIVO_CREDENTILAS.authToken  //Client

 //    authId: 'MAOGY2ZDQ0MDEWMTK1ZM', //smartData Test Account
 //    authToken: 'NDk4ODk3NTA5NDQ5MGZmN2RjMWQ0MDZjMzgwMjhh' //smartData Test Account
 });
 */

/* @function : isEmptyObject
 *  @Creator  : shivansh
 *  @created  : 12082015
 */

var isEmptyObject = function (obj) {
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
}

exports.callMe = function (req, res, next) {
    var response = plivo.Response();

    // generates XML string.
    console.log(response);
    /**
     * api.make_call accepts params and callback
     */

    // Keys and values to be used for params are the same as documented for our REST API.
    // So for using RestAPI.make_call, valid params can be checked
    // at https://www.plivo.com/docs/api/call/#outbound.
    var plivoBaseUrl = req.protocol + '://' + req.get('host');
    var params = {
        from: req.body.callerPhoneNumber, //'+16052045121',
        to: req.body.conferenceToPhone, //'+918055255475',
//        answer_url: 'https://52.27.242.122:3000/phoneAgent/answer_url'
        answer_url: plivoBaseUrl + '/phoneAgent/answer_url'
    };

    var plivoApi = plivo.RestAPI({
        authId: 'MAOGRINTE5YTM5Y2U5NM', //Client from constant file
        authToken: 'YmY0NDQ1MDAxYmIwNTZjY2RhNDI0NmM5MWY3NjRm'  //Client

                //authId: 'MAOGY2ZDQ0MDEWMTK1ZM', //smartData Test Account
                //authToken: 'NDk4ODk3NTA5NDQ5MGZmN2RjMWQ0MDZjMzgwMjhh' //smartData Test Account
    });

    plivoApi.make_call(params, function (status, response) {
        if (status >= 200 && status < 300) {
            console.log('Successfully made call request.');
            console.log('Response:', response);
        } else {
            console.log('Oops! Something went wrong.');
            console.log('Status:', status);
            console.log('Response:', response);
        }
        return next(response);
    });
};

exports.endCall = function (req, res, next) {
    var params = {
        request_uuid: req.params.request_uuid
    };

    var webPhoneDetails = (req.user.role_id.code == 'LGN') ? req.user.webphone_details : req.user.parent_id.webphone_details;

    var plivoApi = plivo.RestAPI({
        authId: webPhoneDetails.username,
        authToken: webPhoneDetails.password
    });

    plivoApi.hangup_request(params, function (status, response) {
        console.log('Status: ', status);
        console.log('API Response:\n', response);
        return next(response);
    });
};

exports.answer_url = function (req, res, next) {
    var plivML = plivo.Response();

//    if (req.body.To !== req.body.From) {
//        var recordParams = {'action': 'https://52.27.242.122:3000/phoneAgent/receiveRecordingDetails/', 'startOnDialAnswer': true, 'redirect': false};
//        var recordParams = {'action': 'http://192.155.246.146:2088/phoneAgent/receiveRecordingDetails/', 'startOnDialAnswer': true, 'redirect': false};
//        plivML.addRecord(recordParams);

    //If required CallUUID must be added with "-" in a format XXXXXXXX-XXXX-XXXX-XXXX-X(rest of the characters -> ie: 8-4-4-4-rest)
    var params = {'callerId': req.body.CLID, 'sipHeaders': 'X-PH-Calluuid=' + req.body.CallUUID.replace(/\-/g, '') + ',X-PH-Calledphoneno=' + req.body.To.replace('@phone.plivo.com', '').replace('sip:', '')};

    var confParams = {'startConferenceOnEnter': false, 'beep': false, 'stayAlone': true};
//        plivML.addConference('meraRoom',confParams);

    var isToSip = req.body.To;
    if (isToSip.match(/sip:(.*?)@/)) {
        plivML.addDial(params).addUser(req.body.To);
    } else {
        plivML.addDial(params).addNumber(req.body.To);
    }

//    } else {
//        var hangupParams = {'reason': 'rejected'};
//        plivML.addHangup(hangupParams);
//    }

// Generate XML String
    var xml = plivML.toXML();

// Print to console
    console.log(xml);
    return next(xml);
};

var rebuildCallUUID = function (calluuidString) {
    //converting CallUUID in format of "8-4-4-4-rest"
    var callUUID = calluuidString.toString();
    callUUID = callUUID.substr(0, 8) + '-' + callUUID.substr(8, 4) + '-' + callUUID.substr(12, 4) + '-' + callUUID.substr(16, 4) + '-' + callUUID.substr(20);
    return callUUID;
}


exports.answer_url2 = function (req, res, next) {

    var plivoBaseUrl = req.protocol + '://' + req.get('host');
    //var plivoBaseUrl = 'https://jubin.localtunnel.me';

    var plivML = plivo.Response();


    /****************Demo START************/
//    plivML.addSpeak('Yo maaan, Leave a message maaaan! plivo!');
//    var recordParams = {'action': plivoBaseUrl + '/phoneAgent/receiveRecordingDetails_voiceMail_Plivo/', 'playBeep': 'true', 'finishOnKey': "*"};
//    plivML.addRecord(recordParams);
//    plivML.addHangup();
//
//    var xml = plivML.toXML();
//    console.log(xml);
//    return next(xml);
//
//    return false;
    /****************Demo END************/


    var currentTime = moment().format("HHmm");
    var currentDay = moment().format("ddd");

    console.log('req.body', req.body)

    if (req.body.To !== req.body.From) {
        req.body.phone = req.body.To;
        campaignCtrl.campaignDetailsForCallHistory(req, res, function (err, response, associatedIvrs, ringToNumId) {
            var campaignData = response;

            if (err) {
                console.log(err);
                //nahi mila
                var hangupParams = {'reason': 'rejected'};
                plivML.addHangup(hangupParams);
                var xml = plivML.toXML(); // Generate XML String
                console.log(xml);// Print to console
                next(xml);
            } else if (campaignData && campaignData.nonPsxPhone) {

                userModel.count({'webphone_details.plivo_sip_username': req.body.CallerName}, function (err, userCount) {
                    if (err) {
                        var hangupParams = {'reason': 'rejected'};
                        plivML.addHangup(hangupParams);
                    } else if (userCount) {
                        var params = {'callerId': req.body.CLID, 'method': 'GET'};
                        plivML.addDial(params).addNumber(req.body.To);
                    } else {
                        plivML.addSpeak('No Campaign is attached with this number');
                        var hangupParams = {'reason': 'rejected'};
                        plivML.addHangup(hangupParams);
                    }

                    var xml = plivML.toXML(); // Generate XML String
                    console.log(xml);// Print to console
                    next(xml);
                })
            } else {
                console.log('youff', campaignData);
                //console.log('youff', campaignData.offer_id.hoo_schema);
                console.log('currentDay', currentDay)
                console.log('currentTime', currentTime)

                /***************** Applying on Twilio Pending (START) ******************************/
                if (campaignData && campaignData.offer_id && campaignData.offer_id.hoo_schema) {
                    console.log('if me gaya')
                    var offerHOO = _.find(campaignData.offer_id.hoo_schema, function (d) {

                        var isDayCorrect = _.countBy(d.days, function (dayName) {
                            return dayName.name == currentDay;
                        })['true'];

                        var notRoundTime = !d.round_time && d.call_range_start <= currentTime && d.call_range_end >= currentTime;
                        var roundTime = d.round_time && (d.call_range_start <= currentTime || d.call_range_end >= currentTime);

                        return (roundTime || notRoundTime) && isDayCorrect; //true if HOO & false if afterHOO
                    });
                } else {
                    console.log('else me gaya')
                    var offerHOO = true;
                }


                if (!offerHOO) {
                    //yahan after hoo wala code aayega
                    console.log('after wala function yeeaaaaahhhhh!!');
                    contactCtrlAfterHours(req, res, campaignData, function (resp) {

                    });

                    var agentId = '';
                    if (campaignData && campaignData.offer_id && campaignData.offer_id.compose_message && campaignData.offer_id.compose_message.afterHOO_message && campaignData.offer_id.compose_message.afterHOO_message_prompt) {
                        promptModel.findOne({'_id': campaignData.offer_id.compose_message.afterHOO_message_prompt, 'isdeleted': false}, function (err, promptData) {
                            if (promptData && promptData.type == 'text') {
                                var voice = promptData.voice == 'male' ? 'MAN' : 'WOMAN';
                                var speakParams = {voice: voice, loop: promptData.repeat};
                                plivML.addSpeak(promptData.text, speakParams);
                            } else if (promptData && promptData.type == 'audio') {
                                plivML.addPlay(plivoBaseUrl + promptData.file_path, {loop: promptData.repeat});
                            } else {
                                plivML.addSpeak('You have called after hours of operation, Please leave a message after the beep and press star to end your voice message');
                            }
                        });
                        agentId = '?agentId=' + campaignData.offer_id.compose_message.phone_agent;
                    } else {
                        plivML.addSpeak('You have called after hours of operation, Please leave a message after the beep and press star to end your voice message');
                    }

                    var recordParams = {'action': plivoBaseUrl + '/phoneAgent/receiveRecordingDetails_voiceMail_Plivo' + agentId, 'playBeep': 'true', 'finishOnKey': "*"};
                    plivML.addRecord(recordParams);
                    var hangupParams = {'reason': 'rejected'};
                    plivML.addHangup(hangupParams);

                    var xml = plivML.toXML(); // Generate XML String
                    console.log(xml);// Print to console
                    next(xml);

                } else {
                    //neeche wala code yahan aayega abhi

                    console.log('hmm, normal flow :|');

                    /***************** Applying on Twilio Pending (END) ******************************/


                    var todayDate = new Date();
                    todayDate.setHours(0);
                    todayDate.setMinutes(0);
                    todayDate.setSeconds(0);


                    callModel.count({
                        'campaignData._id': campaignData._id,
                        'isdeleted': {'$ne': true},
                        'created': {'$gte': todayDate}
                    }, function (err, callCount) {

                        if (campaignData && campaignData.offer_id && campaignData.offer_id.daily_caps && campaignData.offer_id.daily_caps.call_cap < callCount) {
                            //call Reject - Daily Cap
                            plivML.addSpeak('Maximum limit of this campaign has been reached for today. Please call tomorrow');

                            //hangup call
                            var hangupParams = {'reason': 'rejected'};
                            plivML.addHangup(hangupParams);

                            // Generate XML String
                            var xml = plivML.toXML();
                            console.log(xml);// Print to console
                            next(xml);
                        } else {
                            //call Success

                            /*
                             var phoneRef = '';
                             if (campaignData.ringToNumbers && campaignData.ringToNumbers.local) {//campaignData.ringToNumbers &&
                             phoneRef = campaignData.ringToNumbers.local;
                             } else if (campaignData.ringToNumbers && campaignData.ringToNumbers.vanity) {
                             phoneRef = campaignData.ringToNumbers.vanity;
                             } else if (campaignData.ringToNumbers && campaignData.ringToNumbers.tollfree) {
                             phoneRef = campaignData.ringToNumbers.tollfree;
                             }
                             var ivrCond = {phone_no: phoneRef, ivr_status: true};
                             */

                            console.log('associatedIvrs', associatedIvrs)
                            var sortedIvrArr = _.map(_.sortBy(associatedIvrs, 'priority'), function (data) {
                                return data.ivr_id;
                            });

                            var ivrCond = {_id: {$in: sortedIvrArr}, ivr_status: true};

                            var inboundCond = {};
                            if (campaignData.offer_id) {//for Inbound Trunk attached to an offer
                                var offerId = campaignData.offer_id._id;
                                inboundCond = {offer_id: offerId, status: true};
                            } else if (ringToNumId) { //for Inbound Trunk attached to a number
                                inboundCond = {ring_to_number_id: ringToNumId, status: true};
                            }

                            inboundTrunkModel.findOne(inboundCond, function (err, inboundData) {

                                if (!isEmptyObject(inboundData) && !isEmptyObject(inboundCond)) {

                                    console.log('inboundData.ivr_id', inboundData.ivr_id)
                                    sortedIvrArr = _.map(_.sortBy(inboundData.ivr_id, 'priority'), function (data) {
                                        return data.ivr_id;
                                    });

                                    ivrCond = {_id: {$in: sortedIvrArr}, ivr_status: true};
                                }

                                console.log('ivrCond', ivrCond)
                                console.log('inboundCond', inboundCond)

                                var isToSip = req.body.From;
                                var forAreaCode = req.body.From;
                                if (isToSip.match(/sip:(.*?)@/)) {
                                    forAreaCode = req.body.CLID;
                                }

                                var areaCode = forAreaCode.substring(1, 4);

                                zipcode.findOne({'AreaCode': areaCode}, function (err, foundCode) {
                                    var stateName = (foundCode && foundCode.StateName) ? foundCode.StateName : '';
                                    var geoCond = {$or: [{geo: false}, {geo: true, $or: [{'geo_schema.area_code': areaCode}, {'geo_schema.state.name_long': stateName}]}]}

                                    //Actual Condition for HOO is written after the query result is fetched Using underscore.js
                                    //This HOO condition doesn't really work
                                    //It is here just because it may reduce the result count which would be better for below loops to satisfy HOO conditions
                                    var hooCond = {$or: [
                                            {hoo: false},
                                            {
                                                hoo: true,
                                                'hoo_schema.days.name': currentDay,
                                                $or: [{
                                                        'hoo_schema.round_time': false,
                                                        'hoo_schema.call_range_start': {$lte: currentTime},
                                                        'hoo_schema.call_range_end': {$gte: currentTime}
                                                    },
                                                    {
                                                        'hoo_schema.round_time': true,
                                                        $or: [
                                                            {'hoo_schema.call_range_start': {$lte: currentTime}},
                                                            {'hoo_schema.call_range_end': {$gte: currentTime}}
                                                        ]
                                                    }]
                                            }
                                        ]};

                                    var callTo = req.body.To;
                                    callModel.count({To: callTo, EndTime: {$exists: false}}, function (err, callCount) {

                                        console.log('callCount', callCount);

                                        var conCond = {$or: [{cc: false}, {cc: true, no_of_calls: {$gt: callCount}}]};

                                        console.log('ivrCond', ivrCond);
                                        console.log('hooCond: ', {hoo: true, 'hoo_schema.days.name': currentDay, 'hoo_schema.call_range_start': {$lte: currentTime}, 'hoo_schema.call_range_end': {$gte: currentTime}});
                                        console.log('geoCond', {'geo_schema.area_code': areaCode}, {'geo_schema.state.name_long': stateName});
                                        console.log('conCond: ', {cc: true, no_of_calls: {$gte: callCount}});

                                        ivrModel.find({$and: [ivrCond, hooCond, geoCond, conCond, {is_deleted: false}]})
                                                //ivrModel.findOne(ivrCond)
                                                .populate('inital_prompt_id')

                                                //for populating prompt
                                                .populate('ivr_schema.prompt_schema.prompt_id')
                                                .populate('ivr_schema.prompt_schema.prompt_schema.prompt_id')
                                                .populate('ivr_schema.ring_schema.prompt_schema.prompt_id')
                                                .populate('ivr_schema.sendToQueue_schema.prompt_schema.prompt_id')

                                                //for populating phoneAgent (for extension)
                                                .populate('ivr_schema.ring_schema.phone_agent_id')
                                                .populate('ivr_schema.ring_schema.ring_schema.phone_agent_id')
                                                .populate('ivr_schema.prompt_schema.ring_schema.phone_agent_id')
                                                .populate('ivr_schema.sendToQueue_schema.ring_schema.phone_agent_id')

                                                //for populating queue
                                                .populate('ivr_schema.sendToQueue_schema.queue_id')
                                                .populate('ivr_schema.ring_schema.sendToQueue_schema.queue_id')
                                                .populate('ivr_schema.prompt_schema.sendToQueue_schema.queue_id')
                                                .populate('ivr_schema.sendToQueue_schema.sendToQueue_schema.queue_id')

                                                .exec(function (err, ivrData) {
                                                    console.log('result', err, ivrData);
//                                return false;
//                                next(false)

                                                    if (!Array.isArray(sortedIvrArr) || (Array.isArray(sortedIvrArr) && !sortedIvrArr.length)) {
                                                        plivML.addSpeak('No IVR is Set for this number');

                                                        //hangup call
                                                        var hangupParams = {'reason': 'rejected'};
                                                        plivML.addHangup(hangupParams);

                                                        // Generate XML String
                                                        var xml = plivML.toXML();
                                                        console.log(xml);// Print to console
                                                        next(xml);
                                                    }

                                                    var neededIvrData = false;
                                                    var hooFail = true;
                                                    console.log('before each', sortedIvrArr)
                                                    _.each(sortedIvrArr, function (sortedIvrId, index) {

                                                        var thisIvrData = _.find(ivrData, function (d) {
                                                            console.log('yeah', d._id, sortedIvrId)
                                                            return d._id.toString() == sortedIvrId.toString();
                                                        });

                                                        console.log('thisIvrData', thisIvrData)

                                                        if (thisIvrData && thisIvrData.hoo) {
                                                            var hooFilteredSchema = _.find(thisIvrData.hoo_schema, function (d) {

                                                                var isDayCorrect = _.countBy(d.days, function (dayName) {
                                                                    return dayName.name == currentDay;
                                                                })['true'];

                                                                var notRoundTime = !d.round_time && d.call_range_start <= currentTime && d.call_range_end >= currentTime;
                                                                var roundTime = d.round_time && (d.call_range_start <= currentTime || d.call_range_end >= currentTime);

                                                                return (roundTime || notRoundTime) && isDayCorrect;
                                                            });
                                                        } else {
                                                            var hooFilteredSchema = true;
                                                        }

                                                        console.log('hooFilteredSchema', hooFilteredSchema)


                                                        if (hooFilteredSchema && !neededIvrData) {
                                                            neededIvrData = thisIvrData;
                                                            hooFail = false;
                                                        }

                                                        //Last itteration of Loop
                                                        if (sortedIvrArr.length == index + 1) {
                                                            if (neededIvrData) {
                                                                console.log('getting into ivrMenu', neededIvrData);
                                                                ivr_menu(req, res, neededIvrData, function (xml) {
                                                                    next(xml);
                                                                });
                                                            } else {
                                                                console.log('fail cond running');
                                                                //IVR Fail Condition
                                                                ivrModel.findOne(ivrCond)
                                                                        .populate('condition_fail_prompt_id')
                                                                        .exec(function (err, failedIvrData) {
                                                                            if (!isEmptyObject(failedIvrData)) {

                                                                                var repeat = failedIvrData.condition_fail_prompt_id.repeat || 1;

                                                                                if (failedIvrData.condition_fail_prompt_id.type == 'text') {
                                                                                    var voice = failedIvrData.condition_fail_prompt_id.voice == 'male' ? 'MAN' : 'WOMAN';
                                                                                    var speakParams = {voice: voice, loop: repeat};
                                                                                    plivML.addSpeak(failedIvrData.condition_fail_prompt_id.text, speakParams);
                                                                                } else if (failedIvrData.condition_fail_prompt_id.type == 'audio') {
                                                                                    plivML.addPlay(plivoBaseUrl + failedIvrData.condition_fail_prompt_id.file_path, {loop: repeat});
                                                                                } else {
                                                                                    plivML.addSpeak('No Message Set');
                                                                                }
                                                                            } else {
                                                                                plivML.addSpeak('No IVR is Set for this number');
                                                                            }

                                                                            //hangup call
                                                                            var hangupParams = {'reason': 'rejected'};
                                                                            plivML.addHangup(hangupParams);

                                                                            // Generate XML String
                                                                            var xml = plivML.toXML();
                                                                            console.log(xml);// Print to console
                                                                            next(xml);

                                                                        });
                                                            }
                                                        }
                                                    });

                                                });
                                    });
                                });
                            });


                            //Save Call Details
                            saveCallDetail(req, res, campaignData, function () {
                                //some logic if you want
                            });

                        }

                    });
                }
            }
        });
    } else {
        var hangupParams = {'reason': 'rejected'};
        plivML.addHangup(hangupParams);

        // Generate XML String
        var xml = plivML.toXML();

        // Print to console
        console.log(xml);
        return next(xml);
    }
};

exports.hangup_url = function (req, res, next) {
    console.log('hangup url');
    if (req.body.To !== req.body.From) {

        req.body.phone = req.body.To;
        campaignCtrl.campaignDetailsForCallHistory(req, res, function (err, response) {
            if (err) {
                console.log(err);
            } else {
                var campaignData = response;
                console.log('cd', campaignData);

                //Save Call Details
                saveCallDetail(req, res, campaignData, function () {
                    //some login if you want
                });
            }
        });
    }
    next(true);
}

var transferWebPhoneCall = function (req, res, next) {
    var plivoBaseUrl = req.protocol + '://' + req.get('host');
    //var plivoBaseUrl = 'https://jubin.localtunnel.me';

    var CallUUID = rebuildCallUUID(req.body.CallUUID);

    if (CallUUID && req.body.option) {

        var transferToPhone;
        var option = req.body.option;

        async.parallel({
            phone: function (callback) {
                switch (option) {
                    case 'phone':
                        transferToPhone = req.body.phone;
                        callback(null, transferToPhone);
                        break;
                    case 'extension':
                        userModel.findOne({extension: req.body.extension, parent_id: req.user.parent_id}, function (err, paData) {
                            if (err || isEmptyObject(paData)) {
                                callback(err, null);
                            } else {
                                if (paData.call_forward && paData.call_forward.status && paData.call_forward.phone) {
                                    option = 'phone';
                                    transferToPhone = paData.call_forward.phone;
                                } else {
                                    transferToPhone = paData.webphone_details.plivo_sip_username;
                                }
                                callback(null, transferToPhone);
                            }
                        });
                        break;
                    case 'queue':
                        transferToPhone = req.body.queue;
                        callback(null, transferToPhone);
                        break;
                    default:
                        callback(true, null);
                }
            }
        }, function (err, switchResult) {
            if (err) {
                //Have to do something
                console.log('switch Err', err);
                return res.json({code: config.constant.CODES.Error, message: config.constant.MESSAGES.Error, resp: 'switch err'});
            } else {
                var params = {
                    call_uuid: CallUUID,
                    aleg_url: plivoBaseUrl + '/phoneAgent/transfer_call_plivo?option=' + option + '&transferTo=' + switchResult.phone
                };

                userModel.findOne({_id: req.user.parent_id._id})
                        .populate('parent_id')
                        .exec(function (err, advccData) {
                            if (err || isEmptyObject(advccData)) {
                                console.log('user modal Err', err);
                                return res.json({code: config.constant.CODES.Error, message: config.constant.MESSAGES.Error, resp: 'user Err'});
                            } else {
                                var webPhoneDetails = (advccData.parent_id && advccData.parent_id.webphone_details) ? advccData.parent_id.webphone_details : {};

                                var plivoApi = plivo.RestAPI({
                                    authId: webPhoneDetails.username,
                                    authToken: webPhoneDetails.password
                                });


                                plivoApi.transfer_call(params, function (status, response) {
                                    if (status >= 200 && status < 300) {
                                        console.log('Successfully made transfer request.');
                                        console.log('Response:', response);
                                    } else {
                                        console.log('Oops! Something went wrong.');
                                        console.log('Status:', status);
                                        console.log('Response:', response);
                                    }
                                    return res.json({code: config.constant.CODES.OK, message: config.constant.MESSAGES.Success, resp: response});
                                    //return next(response);
                                });
                            }
                        });
            }
        });
    } else {
        console.log('else condition');
        return res.json({code: config.constant.CODES.BadRequest, message: config.constant.MESSAGES.invalid, resp: 'CallUUID Empty'});
    }
}
module.exports.transferWebPhoneCall = transferWebPhoneCall;

exports.transfer_call_plivo = function (req, res, next) {
    var plivML = plivo.Response();

    var params = {'method': 'GET'};
    var transferTo = req.body.transferTo;

    switch (req.body.option.toString()) {
        case 'phone':
            console.log('this is phone')
            plivML.addDial(params).addNumber('+1' + transferTo);
            break;
        case 'extension':
            console.log('this is ext')
            var paSIP = 'sip:' + transferTo + '@phone.plivo.com';
            var sipHeaders = 'X-PH-Calluuid=' + req.body.CallUUID.replace(/\-/g, '') + ',X-PH-Calledphoneno=' + transferTo.replace('@phone.plivo.com', '').replace('sip:', '');
            params['sipHeaders'] = sipHeaders;
            plivML.addDial(params).addUser(paSIP);
            break;
        case 'queue':
            console.log('this is queue')
            queuesModel.findOne({_id: transferTo})
                    .populate('associated_agents.agent_id')
                    .exec(function (err, queueData) {
                        transferToQueueFunc(req, res, plivML, queueData, function (plivML) {
                            var xml = plivML.toXML(); // Generate XML String
                            console.log(xml); // Print to console
                            return next(xml);
                        });
                    });
            break;
        default:
            var hangupParams = {'reason': 'rejected'};
            plivML.addHangup(hangupParams);
    }

    if (req.query.option != 'queue') {
        var xml = plivML.toXML(); // Generate XML String
        console.log(xml); // Print to console
        return next(xml);
    }
};

var transferToQueueFunc = function (req, res, plivML, queueData, next) {
    console.log('this is queu func')
    var associatedAgentLength = queueData.associated_agents.length;
    if (associatedAgentLength) {
        var sipHeaders = 'X-PH-Calluuid=' + req.body.CallUUID.replace(/\-/g, '') + ',X-PH-Calledphoneno=' + req.body.transferTo.replace('@phone.plivo.com', '').replace('sip:', '');
        var params = {'method': 'GET', 'sipHeaders': sipHeaders};
        var dialElement = plivML.addDial(params);

        queueData.associated_agents.forEach(function (paUser, index) {
            if (paUser.agent_id.call_forward && paUser.agent_id.call_forward.status && paUser.agent_id.call_forward.phone) {
                dialElement.addNumber('+1' + paUser.agent_id.call_forward.phone);
            } else {
                var paSIP = 'sip:' + paUser.agent_id.webphone_details.plivo_sip_username + '@phone.plivo.com';
                dialElement.addUser(paSIP);
            }

            if (associatedAgentLength == index + 1) {
                next(plivML);
            }
        });
    } else {
        var hangupParams = {'reason': 'rejected'};
        plivML.addHangup(hangupParams);
        next(plivML);
    }
}


exports.forwardCallToSip = function (req, res, next) {
    var plivML = plivo.Response();
    var plivoBaseUrl = req.protocol + '://' + req.get('host');

    if (req.body.To !== req.body.From) {


        var params = {'callerId': req.body.From, 'action': plivoBaseUrl + '/phoneAgent/voice_mail_url', 'method': 'GET', 'timeout': '50'};
        plivML.addDial(params).addUser('sip:benne2jp150707140133@phone.plivo.com');
//        plivML.addDial(params).addUser('sip:smartdatatest150702065602@phone.plivo.com');
//        plivML.addDial(params).addNumber('918149524302');

        /*saveCallDetail(req, res);*/
    } else {
        var hangupParams = {'reason': 'rejected'};
        plivML.addHangup(hangupParams);
    }

// Generate XML String
    var xml = plivML.toXML();

// Print to console
    console.log(xml);
    return next(xml);

};

var saveCallDetail = function (req, res, campaignData, next) {

    var data = req.body;

    if (req.body.CallUUID) {
        data.provider = 'plvio';
    } else if (req.body.CallSid) {
        data.provider = 'twilio';
    } else {
        data.provider = 'NA';
    }

    var forAreaCode = '';

    var isToSip = data.From;
    if (isToSip.match(/sip:(.*?)@/)) {
        forAreaCode = data.CLID;
    } else {
        forAreaCode = data.From;
    }

    var areaCode = forAreaCode.substring(1, 4);

    if (forAreaCode.charAt(0) == '+') {
        areaCode = forAreaCode.substring(2, 5);
    }


    zipcode.findOne({'AreaCode': areaCode}, function (err, foundCode) {
        if (err) {
            console.log(err);
        } else {

            if (foundCode) {
                data.State = foundCode.State;
                data.StateName = foundCode.StateName;
            } else {
                data.State = 'N/A';
                data.StateName = 'N/A';
            }

            if (isEmptyObject(campaignData.errMsg)) {
                //var stateRestrictedArr = new Array();
                var stateRestrictedArr = campaignData.offer_id.state_restricted;

                if (data.provider == 'plvio' && !campaignData.test_purpose && (stateRestrictedArr.indexOf(data.StateName) != -1 || !stateRestrictedArr.length) && data.Duration > campaignData.offer_id.duration.billable_callsecs) {
                    data.is_billable = true;
                } else if (data.provider == 'twilio' && !campaignData.test_purpose && (stateRestrictedArr.indexOf(data.StateName) != -1 || !stateRestrictedArr.length) && data.CallDuration > campaignData.offer_id.duration.billable_callsecs) {
                    data.is_billable = true;
                } else {
                    data.is_billable = false;
                }
            }

            //Adding Campaign Data to CallHistory
            data.campaignData = campaignData;

            callModel.findOne({$or: [{'CallUUID': data.CallUUID}, {'CallSid': data.CallSid}]}, function (err, foundData) {
                if (err)
                    console.log(err);

                if (foundData) {
                    callModel.where({'_id': foundData._id}).update({$set: data}, function (err, count) {
                        if (err) {
                            console.log(err);
                        } else {
                            return 1;
                        }
                    });
                } else {
                    var savingData = new callModel(data);
                    savingData.save(function (err, savedData) {
                        if (err) {
                            console.log(err);
                        } else {
                            return 1;
                        }
                    });
                }
            });
        }
    });
};
module.exports.saveCallDetail = saveCallDetail;

exports.saveCallerDetails = function (req, res, callback) {
    if (req.body.callData) {
        userModel.findOne({_id: req.user.parent_id._id}, {parent_id: 1}).populate('parent_id').exec(function (err, advccData) {
            if (err) {
                console.log('userModelErr', err);
            } else {

                async.parallel({
                    plivoTwilioDetail: function (callback) {
                        if (req.body.callData && req.body.callData.calluuid) {
                            //plivo
                            //converting CallUUID in format of "8-4-4-4-rest"
                            var callUUID = rebuildCallUUID(req.body.callData.calluuid);

                            callback(null, {provider: 'plivo', callUUID: callUUID})
                        } else if (req.body.callData && req.body.callData.CallSid) {
                            //Twilio
                            var webPhoneDetails = (advccData.parent_id && advccData.parent_id.webphone_details) ? advccData.parent_id.webphone_details : {};

                            var twilioApi = new twilio(webPhoneDetails.username, webPhoneDetails.password);

                            twilioApi.calls(req.body.callData.CallSid).get(function (err, call) {
                                callback(null, {provider: 'twilio', CallSid: call.parent_call_sid})
                            })
                        } else {
                            callback({err: 'No Call ID Detected Error'}, null)
                        }
                    }
                }, function (err, result) {

                    if (err) {
                        callback({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error});
                    } else {

                        var saveData = {
                            //CLID: {type: String},
                            //lead_status: {type: String},
                            //phone_no: req.body.callData.phone, //call To Number
                            phone_no: req.body.callData.callFromNumber, //call To Number
                            scriptData: req.body.formData,
                            added_by: req.user._id,
                            parent_id: req.user.parent_id._id,
                            parent_lgn: advccData.parent_id._id
                        };

                        callerDetailModel(saveData).save(function (err, respSavedData) {

                            var callHistoryData = {Attend_by: req.user._id};
                            var forCallBack;

                            if (err) {
                                console.log('callerDetailModelSaveErr', err);
                                forCallBack = {'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error};
                            } else {
                                callHistoryData['callerDetailId'] = respSavedData._id;
                                forCallBack = {'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.saveSuccess};
                            }

                            var updateCond = {nothing: 'nothing'};
                            if (result.plivoTwilioDetail && result.plivoTwilioDetail.provider == 'plivo') {
                                updateCond = {'callUUID': result.plivoTwilioDetail.callUUID}
                            } else if (result.plivoTwilioDetail && result.plivoTwilioDetail.provider == 'twilio') {
                                updateCond = {'CallSid': result.plivoTwilioDetail.CallSid}
                            }

                            callModel.update(updateCond, {$set: callHistoryData}, {upsert: true, multi: true}, function (err, count) {
                                if (err)
                                    console.log(err);

                                callback(forCallBack);
                            });
                        });
                    }
                })
            }
        })
    } else {
        callback({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error});
    }
};

exports.callHistory = function (req, res, next) {
//    plivoApi.request('Call','GET','', function (status, response) {
//        console.log('Status: ', status);
//        console.log('API Response:\n', response);
//        return next(response.objects);
//    });

    callModel.find(function (err, foundData) {
        if (err) {
            console.log(err);
        }

        return next(foundData);
    });
};
/* @function :voice_callHistory
 * Creator : Shivansh
 * @created  : 11082015
 * @modified :
 * @purpose  : Listing all voice call to PA
 */
exports.voice_callHistory = function (req, res, next) {
    callModel.find({'Recording.type': {$in: ['voicemail', 'afterHOOVoicemail']}, $or: [{'Attend_by': {$exists: false}}, {'Attend_by': req.user._id}], 'isdeleted': false}, function (err, foundData) {
        if (err)
            console.log(err);
        console.log('err', err)
        console.log('foundData', foundData)
        return next(foundData);
    });
};

exports.voice_mail = function (req, res, next) {
    var plivoBaseUrl = req.protocol + '://' + req.get('host');
    console.log("voice mail url2");
    console.log(config.constant.USER_AUDIO);
    var plivML = plivo.Response();
    console.log("voice mail action called");

    if (config.constant.USER_AUDIO == '') {
        console.log("data not found");
        plivML.addSpeak('Please leave a message after the beep and press star to end your voice message');
        var recordParams = {'action': plivoBaseUrl + '/phoneAgent/receiveRecordingDetails_voiceMail_Plivo/', 'playBeep': 'true', 'finishOnKey': "*"};
        plivML.addRecord(recordParams);
        plivML.addHangup();
        // Generate XML String
        var xml = plivML.toXML();
        return next(xml);
        console.log(xml);

    } else {
        console.log(config.constant.USER_AUDIO);
        var audio_url = plivoBaseUrl + '/assets/greeting_audio/' + config.constant.USER_AUDIO;
        // var audio_url='https://jubin.localtunnel.me/assets/greeting_audio/test.mp3';
        console.log(audio_url);
        plivML.addPlay(audio_url);

        var recordParams = {'action': plivoBaseUrl + '/phoneAgent/receiveRecordingDetails_voiceMail_Plivo/', 'playBeep': 'true', 'finishOnKey': "*"};
        plivML.addRecord(recordParams);
        plivML.addHangup();
        // Generate XML String
        var xml = plivML.toXML();
        return next(xml);
        console.log(xml);

    }
};

/* @function :receiveRecordingDetails_voiceMail_Plivo
 * Creator : Jubin
 * @created  : 23042016
 * @modified :
 * @purpose  : Receive recordings from plivo and save to Db
 */

var receiveRecordingDetails_voiceMail_Plivo = function (req, res, next) {

    console.log('req.body', req.body)

    saveRecordingDetails_voiceMail(req, res, function (err, response) {
        var plivML = plivo.Response();
        plivML.addSpeak('We will get in touch with you soon');
        plivML.addHangup();

        var xml = plivML.toXML();
        console.log(xml);

        next(xml);
    })
}
module.exports.receiveRecordingDetails_voiceMail_Plivo = receiveRecordingDetails_voiceMail_Plivo;


var saveRecordingDetails_voiceMail = function (req, res, next) {

    callModel.findOne({$or: [{'CallUUID': req.body.CallUUID}, {'CallSid': req.body.CallSid}]}, function (err, foundData) {
        if (err)
            console.log(err);

        var data = {};

        if (req.body.CallUUID) {
            data.provider = 'plvio';
        } else if (req.body.CallSid) {
            data.provider = 'twilio';
        } else {
            data.provider = 'NA';
        }

        if (foundData) {
            req.body.type = 'voicemail';
            data.Recording = req.body;
            callModel.update({'_id': foundData._id}, {$set: data}, {upsert: true, multi: true}, function (err, count) {
                if (err)
                    console.log(err);

                next(err, count);
            });
        } else {

            if (req.query.agentId) {
                req.body.Attend_by = req.query.agentId;
            }

            req.body.type = 'afterHOOVoicemail';
            data = req.body;

            data['Recording'] = {
                RecordingSid: req.body.RecordingSid, //Twilio
                RecordingUrl: req.body.RecordingUrl, //Twilio
                RecordingID: req.body.RecordingID,
                RecordUrl: req.body.RecordUrl,
                RecordingDuration: req.body.RecordingDuration, //plivo & Twilio both
                RecordingDurationMs: req.body.RecordingDurationMs,
                RecordingStartMs: req.body.RecordingStartMs,
                RecordingEndMs: req.body.RecordingEndMs,
                CallUUID: req.body.CallUUID,
                Event: req.body.Event,
                type: req.body.type
            }

            console.log('data to save', data);
            console.log('data to save', data.Recording);

            callModel(data).save(function (err, savedData) {
                if (err)
                    console.log(err);

                next(err, savedData);
            });
        }
    });
};
module.exports.saveRecordingDetails_voiceMail = saveRecordingDetails_voiceMail;


/* @function :upload_greeting
 * Creator : Shivansh
 * @created  : 12082015
 * @modified :
 * @purpose  : Upload mp3 for user greeting in voice  mail
 */
exports.upload_greeting = function (req, res, next) {

    console.log("Hi i m inside upload");
    var form = new formidable.IncomingForm();
    form.uploadDir = "./public/assets/greeting_audio/";       //set upload directory
    form.keepExtensions = true;     //keep file extension
    form.parse(req, function (err, fields, files)
    {
        var greeting_audio = files.greeting_audio.name;
        var insertData = {
            'user_id': req.user._id,
            'greeting_audio': greeting_audio,
            'created': new Date(),
            'modified': new Date()
        }
        // var savingData = new greetingAudioModel(insertData);
        // savingData.save(function (err, savedData) {
        //     if (err) {
        //         console.log(err);
        //         res.json({'result':404,"message":"Error while uploading greeting audio."});
        //     } else {
        //             fs.rename(files.greeting_audio.path, "./public/assets/greeting_audio/"+ greeting_audio,function (err)
        //             {
        //             if (err){console.log(err);res.json({'result':404,"message":"Error while uploading greeting audio."});}
        //             });
        //         res.json({'result':200,"message":"greeting audio uploaded sucessfully"})
        //     }
        // });


        greetingAudioModel.findOne({'user_id': req.user._id}, function (err, data) {
            if (err)
            {
                console.log(err);
                res.json({'result': 404})
            }
            else
            {
                if (isEmptyObject(data)) {

                    var savingData = new greetingAudioModel(insertData);
                    savingData.save(function (err, savedData) {
                        if (err) {
                            console.log(err);
                            res.json({'result': 404, "message": "Error while uploading greeting audio."});
                        } else {
                            fs.rename(files.greeting_audio.path, "./public/assets/greeting_audio/" + greeting_audio, function (err)
                            {
                                if (err) {
                                    console.log(err);
                                    res.json({'result': 404, "message": "Error while uploading greeting audio."});
                                }
                            });
                            res.json({'result': 200, "message": "Greeting audio uploaded sucessfully"})
                        }
                    });
                }
                else {
                    var oldFilePath = "./public/assets/greeting_audio/" + data.greeting_audio;
                    fs.unlinkSync(oldFilePath);
                    greetingAudioModel.update({_id: data._id}, {$set: {
                            'greeting_audio': greeting_audio,
                            'modified': new Date()
                        }}, function (err, data) {
                        if (err)
                        {
                            console.log(err)
                            res.json({'result': 404, "message": "Error while uploading greeting audio."})
                        }
                        else
                        {
                            fs.rename(files.greeting_audio.path, "./public/assets/greeting_audio/" + greeting_audio, function (err)
                            {
                                if (err) {
                                    console.log(err);
                                    res.json({'result': 404, "message": "Error while uploading greeting audio."});
                                }
                            });
                            config.constant.USER_AUDIO = greeting_audio; // assign the new audio value to config varriable
                            res.json({'result': 200, "message": "Greeting audio uploaded sucessfully"})

                        }
                    });
                }


            }
        })

    });
};

exports.get_greeting_audio = function (req, res, next) {
    greetingAudioModel.findOne({'user_id': req.user._id}, function (err, foundData) {
        if (err)
            console.log(err);
        return next(foundData);
    });
};

/* @function : delete_voiceMail
 *  @Creator  : Shivansh
 *  @created  : 13082015
 *  @modified :
 *  @purpose  : delete the voice_mail from the system  (true,false)
 */
exports.delete_voiceMail = function (req, res, callback) {

    callModel.update({_id: req.body.voiceId}, {$set: {'isdeleted': true, 'modified': Date.now()}}, function (err) {
        if (err) {
            console.log("System Error (deleteVoiceMail) : " + err);
            callback({'code': 404, "message": "Oops !!! Error occured while perform operation, Please try again."});
        } else {

            console.log("Deleted VoiceMail");
            callback({'code': 200, "message": "Voice mail has been deleted successfully."});
        }
    });
}


/* @function : getCityFromZip
 *  @Creator  : Shivansh
 *  @created  : 27082015
 *  @modified :
 *  @purpose  : Gets City and State from Zip
 */
var getCityFromZip = function (req, res, callback) {

    zipcode.findOne({ZipCode: req.body.zip}, function (err, data) {
        if (err) {
            callback({'code': 500, "message": "Error!"});
        } else {
            callback({'code': 200, "message": "Success", "data": data});
        }
    });
}
exports.getCityFromZip = getCityFromZip;
/* @function : listCallerLeads
 *  @Creator  : B2
 *  @created  : 06102015
 *  @modified :
 *  @purpose  : Gets leads list
 */
var listCallerLeads = function (req, res, callback) {
    console.log('user_id', req.user._id);
    if (req.user.role_id.code == "ADMIN") {
        callerDetailModel.find({is_deleted: false}, function (err, data) {
            if (err) {
                callback({'code': 500, "message": "Error!"});
            } else {
                callback({'code': 200, "message": "Success", "data": data});
            }
        });
    } else if (req.user.role_id.code == "LGN") {
        var lgnContions = {$or: [{parent_lgn: req.user._id}, {'webLeadDetails.parent_lgn': req.user._id}], 'is_deleted': false};

        callerDetailModel.find(lgnContions, function (err, data) {
            if (err) {
                callback({'code': 500, "message": "Error!"});
            } else {
                callback({'code': 200, "message": "Success", "data": data});
            }
        });
    } else {
        var conditions = {};
        if (req.user.role_id.code == "ADVCC" || req.user.role_id.code == "LG" || req.user.role_id.code == "LB") {

            conditions = {$or: [{added_by: req.user._id}, {'webLeadDetails.campaignData.created_by': mongoose.Types.ObjectId(req.user._id)}], 'is_deleted': false};
        } else if (req.user.role_id.code == "PA") {
            console.log('resquestParentId', req.user.parent_id._id);
            conditions = {$or: [{added_by: req.user._id}, {'webLeadDetails.campaignData.created_by': mongoose.Types.ObjectId(req.user.parent_id._id)}], 'is_deleted': false};
        }

        callerDetailModel.find(conditions, function (err, data) {
            if (err) {
                callback({'code': 500, "message": "Error!"});
            } else {
                console.log('data', data);
                callback({'code': 200, "message": "Success", "data": data});
            }
        });
    }

}
exports.listCallerLeads = listCallerLeads;
/* @function : getCallerLeadByID
 *  @Creator  : B2
 *  @created  : 06102015
 *  @modified :
 *  @purpose  : Get lead details by ID
 */
var getCallerLeadByID = function (req, res, callback) {

    callerDetailModel.findOne({_id: req.body.id}, function (err, data) {
        if (err) {
            callback({'code': 500, "message": "Error!"});
        } else {
            callback({'code': 200, "message": "Success", "data": data});
        }
    });

}
exports.getCallerLeadByID = getCallerLeadByID;
/* @function : deleteLeadByID
 *  @Creator  : B2
 *  @created  : 06102015
 *  @modified :
 *  @purpose  : Get lead details by ID
 */
var deleteLeadByID = function (req, res, callback) {

    callerDetailModel.update({_id: req.body.id}, {$set: {is_deleted: true}}, function (err) {
        if (err) {
            callback({'code': 404, "message": "Error"})
        } else {
            listCallerLeads(req, res, function (response) {
                callback({'code': 200, "data": response.data, "message": "Updated successfully."});
            });
        }
    });

}
exports.deleteLeadByID = deleteLeadByID;

var menuSelector = function (req, res, selector, ivrData, next) {
    switch (selector) {
        case 'hoo':
            hoo_menu(req, res, ivrData, function (xml) {
                next(xml);
            });
            break;
        case 'geo':
            geo_menu(req, res, ivrData, function (xml) {
                next(xml);
            });
            break;
        case 'concurrent':
            concurrent_menu(req, res, ivrData, function (xml) {
                next(xml);
            });
            break;
        case 'ivr':
            ivr_menu(req, res, ivrData, function (xml) {
                next(xml);
            });
            break;
        default:
            ivr_menu(req, res, ivrData, function (xml) {
                next(xml);
            });
            break;
    }
}

var ivr_menu = function (req, res, ivrData, next) {
    //plivoBaseUrl = 'https://jubin.localtunnel.me';
    var plivoBaseUrl = req.protocol + '://' + req.get('host');

    var plivML = plivo.Response();


    //var prevSessionID = req.query.prevSessionID;
    var prevSessionID = req.body.prevSessionID;

    var pressedDigit = req.body.Digits;
    console.log('body', req.body)

    if (req.body.To !== req.body.From) {

        var thisSessionID = req.sessionID;
        var params = {};
        if (pressedDigit) {
            var prevSessionData = JSON.parse(req.sessionStore.sessions[prevSessionID]);
            //var prevSessionData = JSON.parse('{"cookie":{"originalMaxAge":43200000,"expires":"2015-10-29T00:19:43.693Z","httpOnly":true,"path":"/"},"passport":{"test":"session1"}}');
            var prevIvrData = prevSessionData.ivrData;

            var pressedAct = _.find(prevIvrData.ivr_schema, function (d) {
                return d.pressed_option == pressedDigit;
            });


            //var newIvrData = pressedAct;
            req.session['ivrData'] = pressedAct;

            console.log('yahan tak chal raha hai')
            console.log('>>', pressedAct.pressed_action)

            switchFunc(req, res, plivML, pressedAct, function (plivML) {
                // Generate XML String
                var xml = plivML.toXML();

                // Print to console
                console.log(xml);
                return next(xml);
            });
        } else {
            req.session['ivrData'] = ivrData;

            params = {'action': plivoBaseUrl + '/phoneAgent/ivr_menu/?CLID=' + req.body.CLID + '&prevSessionID=' + thisSessionID, 'method': 'POST', 'timeout': '50'};

            var repeat = ivrData.inital_prompt_id.repeat || 1;

            if (ivrData.inital_prompt_id && ivrData.inital_prompt_id.type == 'text') {
                var voice = ivrData.inital_prompt_id.voice == 'male' ? 'MAN' : 'WOMAN';
                var speakParams = {voice: voice, loop: repeat};
                plivML.addGetDigits(params).addSpeak(ivrData.inital_prompt_id.text, speakParams);
            } else if (ivrData.inital_prompt_id && ivrData.inital_prompt_id.type == 'audio') {
                plivML.addGetDigits(params).addPlay(plivoBaseUrl + ivrData.inital_prompt_id.file_path, {loop: repeat});
            } else {
                plivML.addGetDigits(params).addSpeak('No Message Set');
            }
            var xml = plivML.toXML();
            console.log(xml);
            next(xml);
        }

        //saveCallDetail(req, res);
        console.log(512);

    } else {
        var hangupParams = {'reason': 'rejected'};
        plivML.addHangup(hangupParams);
        var xml = plivML.toXML();
        console.log(xml);
        next(xml);
    }

}
module.exports.ivr_menu = ivr_menu;

var hoo_menu = function (req, res, hooFilteredData, next) {
    var plivML = plivo.Response();

    if (req.body.To !== req.body.From) {

        console.log('yahan tak chal raha hai')
        console.log('>>', hooFilteredData)

        switchFunc(req, res, plivML, hooFilteredData, function (plivML) {
            // Generate XML String
            var xml = plivML.toXML();

            // Print to console
            console.log(xml);
            return next(xml);
        });

        //saveCallDetail(req, res);
        console.log(512);

    } else {
        var hangupParams = {'reason': 'rejected'};
        plivML.addHangup(hangupParams);
        next(plivML.toXML());
    }

}
module.exports.hoo_menu = hoo_menu;

var geo_menu = function (req, res, geoFilteredData, next) {
    var plivML = plivo.Response();

    if (req.body.To !== req.body.From) {

        console.log('yahan tak chal raha hai')
        console.log('>>', geoFilteredData)

        switchFunc(req, res, plivML, geoFilteredData, function (plivML) {
            // Generate XML String
            var xml = plivML.toXML();

            // Print to console
            console.log(xml);
            return next(xml);
        });

        //saveCallDetail(req, res);
        console.log(512);

    } else {
        var hangupParams = {'reason': 'rejected'};
        plivML.addHangup(hangupParams);
        next(plivML.toXML());
    }

}
module.exports.geo_menu = geo_menu;

var concurrent_menu = function (req, res, concurrentData, next) {
    var plivML = plivo.Response();

    if (req.body.To !== req.body.From) {

        console.log('yahan tak chal raha hai')
        console.log('>>', concurrentData)

        switchFunc(req, res, plivML, concurrentData, function (plivML) {
            // Generate XML String
            var xml = plivML.toXML();

            // Print to console
            console.log(xml);
            return next(xml);
        });

        //saveCallDetail(req, res);
        console.log(512);

    } else {
        var hangupParams = {'reason': 'rejected'};
        plivML.addHangup(hangupParams);
        next(plivML.toXML());
    }

}
module.exports.concurrent_menu = concurrent_menu;


var switchFunc = function (req, res, plivML, schema, next) {
    console.log('check', schema);
    if (schema && schema.pressed_action) {
        switch (schema.pressed_action) {
            case "dial":
            case "reps":
                var dialSchema = (schema.pressed_action == 'dial') ? schema.dial_schema : schema.allrepsbusy_schema;
                dialFunc(req, res, plivML, dialSchema, function (plivML) {
                    next(plivML);
                });
                break;
            case "prompt":
                promtFunc(req, res, plivML, schema.prompt_schema[0], function (plivML) {
                    next(plivML);
                });
                break;
            case "queue":
                queueFunc(req, res, plivML, schema.sendToQueue_schema[0], function (plivML) {
                    next(plivML);
                });
                break;
            case "extension":
                extFunc(req, res, plivML, schema.ring_schema[0], function (plivML) {
                    next(plivML);
                });
                break;
            case "dnc":
                //hangup call
                var hangupParams = {'reason': 'rejected'};
                plivML.addHangup(hangupParams);
                next(plivML);
                break;
            case "multidial":
                multidialFunc(req, res, plivML, schema.multi_dial_schema, function (plivML) {
                    next(plivML);
                });
                break;
            default:
                //hangup call
                var hangupParams = {'reason': 'rejected'};
                plivML.addHangup(hangupParams);
                next(plivML);
        }
    } else {
        next(plivML);
    }
}

var dialFunc = function (req, res, plivML, initDialSchema, next) {
    console.log(initDialSchema);
    var checkIsNext = true;
    initDialSchema.forEach(function (dialSchema, index) {
        //Direct Dial Section (START)
        if (dialSchema.dial_to && checkIsNext) {
            var params = {'callerId': req.body.CLID, 'method': 'GET', timeout: dialSchema.wait_time ? dialSchema.wait_time : 30};
            plivML.addDial(params).addNumber('+1' + dialSchema.dial_to);
            //Direct Dial Section (END)
        }

        checkIsNext = dialSchema.is_next_dial;

        if (initDialSchema.length == index + 1) {
            next(plivML);
        }
    });
}

var multidialFunc = function (req, res, plivML, initDialSchema, next) {
    console.log(initDialSchema);

    var params = {'callerId': req.body.CLID, 'method': 'GET'};
    var dialElement = plivML.addDial(params);

    initDialSchema.forEach(function (dialSchema, index) {
        if (dialSchema.dial_to) {
            dialElement.addNumber('+1' + dialSchema.dial_to);
        }

        if (initDialSchema.length == index + 1) {
            next(plivML);
        }
    });
}

var promtFunc = function (req, res, plivML, initPromptSchema, next) {
    var plivoBaseUrl = req.protocol + '://' + req.get('host');
    //var initPromptSchema = pressedAct.prompt_schema[0];
    var repeat = initPromptSchema.prompt_id.repeat || 1;

    if (initPromptSchema.prompt_id.type == 'text') {
        var voice = initPromptSchema.prompt_id.voice == 'male' ? 'MAN' : 'WOMAN';
        var speakParams = {voice: voice, loop: repeat};
        plivML.addSpeak(initPromptSchema.prompt_id.text, speakParams);
    } else if (initPromptSchema.prompt_id.type == 'audio') {
        plivML.addPlay(plivoBaseUrl + initPromptSchema.prompt_id.file_path, {loop: repeat});
    } else {
        plivML.addSpeak('No Message Set');
    }

    switchFunc(req, res, plivML, initPromptSchema, function (plivML) {
        next(plivML);
    });
}

var extFunc = function (req, res, plivML, initRingSchema, next) {
    var plivoBaseUrl = req.protocol + '://' + req.get('host');

    if (initRingSchema.phone_agent_id.call_forward && initRingSchema.phone_agent_id.call_forward.status && initRingSchema.phone_agent_id.call_forward.phone) {
        var params = {'callerId': req.body.CLID, 'method': 'GET'};
        plivML.addDial(params).addNumber('+1' + initRingSchema.phone_agent_id.call_forward.phone);
    } else {
        var paSIP = 'sip:' + initRingSchema.phone_agent_id.webphone_details.plivo_sip_username + '@phone.plivo.com';
        var sipHeaders = 'X-PH-Calluuid=' + req.body.CallUUID.replace(/\-/g, '') + ',X-PH-Calledphoneno=' + req.body.To.replace('@phone.plivo.com', '').replace('sip:', '');
        var params = {'callerId': req.body.CLID, 'method': 'GET', timeout: initRingSchema.wait_time ? initRingSchema.wait_time : 30, 'sipHeaders': sipHeaders};

        plivML.addDial(params).addUser(paSIP);
    }

    if (!initRingSchema.leave_message) {
        switchFunc(req, res, plivML, initRingSchema, function (plivML) {
            next(plivML);
        });
    } else if (initRingSchema.leave_message == true) {
        //leave msg code
        plivML.addSpeak('Please leave a message after the beep and press star to end your voice message');
        var recordParams = {'action': plivoBaseUrl + '/phoneAgent/receiveRecordingDetails_voiceMail_Plivo/', 'playBeep': 'true', 'finishOnKey': "*"};
        plivML.addRecord(recordParams);
        plivML.addHangup();
        next(plivML);
    }
}

var queueFunc = function (req, res, plivML, initQueueSchema, next) {
    if (initQueueSchema.queue_id.associated_agents.length) {
        var agentsArr = [];

        var sipHeaders = 'X-PH-Calluuid=' + req.body.CallUUID.replace(/\-/g, '') + ',X-PH-Calledphoneno=' + req.body.To.replace('@phone.plivo.com', '').replace('sip:', '');
        var params = {'callerId': req.body.CLID, 'method': 'GET', 'sipHeaders': sipHeaders};
        initQueueSchema.queue_id.associated_agents.forEach(function (agent, index) {
            agentsArr.push(agent.agent_id);
            if (initQueueSchema.queue_id.associated_agents.length == index + 1) {
                userModel.find({_id: {$in: agentsArr}}, function (err, paUserData) {
                    if (err || isEmptyObject(paUserData)) {
                        var hangupParams = {'reason': 'rejected'};
                        plivML.addHangup(hangupParams);
                        next(plivML);
                    } else {
                        var dialElement = plivML.addDial(params);
                        paUserData.forEach(function (paUser, innerIndex) {

                            if (paUser.call_forward && paUser.call_forward.status && paUser.call_forward.phone) {
                                dialElement.addNumber('+1' + paUser.call_forward.phone);
                            } else {
                                var paSIP = 'sip:' + paUser.webphone_details.plivo_sip_username + '@phone.plivo.com';
                                dialElement.addUser(paSIP);
                            }

                            if (paUserData.length == innerIndex + 1) {
                                console.log('check 2', initQueueSchema);
                                switchFunc(req, res, plivML, initQueueSchema, function (plivML) {
                                    next(plivML);
                                });
                            }
                        });
                    }
                });
            }
        });
    } else {
        var hangupParams = {'reason': 'rejected'};
        plivML.addHangup(hangupParams);
        next(plivML);
    }
}


var ivr_menu_old = function (req, res, ivrData, next) {
    var plivML = plivo.Response();

    //var prevSessionID = req.query.prevSessionID;
    var prevSessionID = req.body.prevSessionID;

    var pressedDigit = req.body.Digits;
    console.log('body', req.body)

    if (req.body.To !== req.body.From) {

        var dummyJson = {
            "inital_prompt_id": {
                user_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
                name: {type: String},
                house_prompt: {type: Boolean},
                type: {type: String}, //text="Text to Speech" and audio="Audio File"
                text: {type: String}, // Required if type=text
                voice: {type: String}, //will consist 'male' or 'female' Required if type=text
                repeat: {type: Number}, // Required if type=text and type=audio
                file_name: {type: String}, // Required type=audio
                file_path: {type: String}, // Required type=audio
                isdeleted: {type: Boolean, default: false}, // delete status
                created: {type: Date, default: Date.now()}, //created Date
                modified: {type: Date, default: Date.now()}
            },
            "ivr_name": "test",
            "_id": "562f2be56adaea651b5518a4",
            "pressed_operation": [
                {
                    "pressed_option": "1",
                    "pressed_action": "dial",
                    "_id": "562f2be56adaea651b5518a9",
                    "sendToQueue_schema": [],
                    "ring_schema": [],
                    "allrepsbusy_schema": [],
                    "prompt_schema": [],
                    "dial_schema": [
                        {
                            "dial_to": "918055255475",
                            "_id": "562f2be56adaea651b5518ad",
                            "wait_time": "0",
                            "is_next_dial": false,
                            "dial_priority": 0
                        },
                        {
                            "dial_to": "918149524302",
                            "_id": "562f2be56adaea651b5518ac",
                            "wait_time": "456",
                            "is_next_dial": true,
                            "dial_priority": 0
                        },
                        {
                            "dial_to": "918055255475",
                            "_id": "562f2be56adaea651b5518ab",
                            "wait_time": "6456456",
                            "is_next_dial": true,
                            "dial_priority": 0
                        },
                        {
                            "dial_to": "918149524302",
                            "_id": "562f2be56adaea651b5518aa",
                            "wait_time": "456456",
                            "is_next_dial": true,
                            "dial_priority": 0
                        }
                    ]
                },
                {
                    "pressed_option": "2",
                    "pressed_action": "prompt",
                    "_id": "562f2be56adaea651b5518a5",
                    "sendToQueue_schema": [],
                    "ring_schema": [],
                    "allrepsbusy_schema": [],
                    "prompt_schema": [//why is this an array? -> because of multiple actions possible, but where to put prompt_msg now?
                        {"prompt_msg": "Hello, This is Me and I'm very Happy", //added by Jubin
                            "prompt_id": "562f2be56adaea651b5518a6",
                            "pressed_action": "dial",
                            "_id": "562f2be56adaea651b5518a6",
                            "sendToQueue_schema": [],
                            "ring_schema": [],
                            "allrepsbusy_schema": [],
                            "prompt_schema": [],
                            "dial_schema": [
                                {
                                    "dial_to": "456456456456456",
                                    "_id": "562f2be56adaea651b5518a8",
                                    "wait_time": "0",
                                    "is_next_dial": false,
                                    "dial_priority": 0
                                },
                                {
                                    "dial_to": "456456",
                                    "_id": "562f2be56adaea651b5518a7",
                                    "wait_time": "456456",
                                    "is_next_dial": true,
                                    "dial_priority": 0
                                }
                            ]
                        }
                    ],
                    "dial_schema": []
                }
            ],
            "__v": 0
        };

        var thisSessionID = req.sessionID;

        if (pressedDigit) {
            var prevSessionData = JSON.parse(req.sessionStore.sessions[prevSessionID]);
            //var prevSessionData = JSON.parse('{"cookie":{"originalMaxAge":43200000,"expires":"2015-10-29T00:19:43.693Z","httpOnly":true,"path":"/"},"passport":{"test":"session1"}}');
            var prevIvrData = prevSessionData.ivrData;

            var pressedAct = _.find(prevIvrData.pressed_operation, function (d) {
                return d.pressed_option == pressedDigit;
            });


            var newIvrData = pressedAct;
            req.session['ivrData'] = newIvrData;

            console.log('yahan tak chal raha hai')
            console.log('>>', pressedAct.pressed_action)

            switch (pressedAct.pressed_action) {
                case "dial":
                    //dialFunc(newIvrData);
                    break;
                case "reps":
                    //repsFunc(newIvrData);
                    break;
                case "prompt":
                    //promtFunc(newIvrData);
                    var promtMsg = pressedAct.prompt_schema[0].prompt_msg;

                    //var params = {'action': config.constant.PLIVO_CREDENTILAS.API_BASE_URL + '/phoneAgent/ivr_menu_2', 'method': 'POST', 'timeout': '50'};
                    var params = {'action': 'https://jubin.localtunnel.me/phoneAgent/ivr_menu/?prevSessionID=' + thisSessionID, 'method': 'POST', 'timeout': '50'};
                    plivML.addGetDigits(params).addSpeak(promtMsg);
                    break;
                case "queue":
                    //queueFunc(newIvrData);
                    break;
                case "extension":
                    //extFunc(newIvrData);
                    break;
                default:
                    //hangup call
            }
        } else {
            req.session['ivrData'] = dummyJson;

            var promtMsg = dummyJson.prompt_msg;

            //var params = {'action': config.constant.PLIVO_CREDENTILAS.API_BASE_URL + '/phoneAgent/ivr_menu_2', 'method': 'POST', 'timeout': '50'};
            var params = {'action': 'https://jubin.localtunnel.me/phoneAgent/ivr_menu/?prevSessionID=' + thisSessionID, 'method': 'POST', 'timeout': '50'};
            plivML.addGetDigits(params).addSpeak(promtMsg);
        }


        // plivML.addDial(params).addNumber(req.body.To);

        //saveCallDetail(req, res);
        console.log(5);

    } else {
        var hangupParams = {'reason': 'rejected'};
        plivML.addHangup(hangupParams);
    }

// Generate XML String
    var xml = plivML.toXML();

// Print to console
    console.log(xml);
    return next(xml);


}
module.exports.ivr_menu_old = ivr_menu_old;

/* @function : getCampaignLeadByDate
 *  @Creator  : B2
 *  @created  : 07102015
 *  @modified :
 *  @purpose  : Get lead details by date
 */
var getCampaignLeadByDate = function (req, res, callback) {
    var FromDate = req.body.FromDate;
    var ToDate = req.body.ToDate;
    var FromToDate = {'$gte': FromDate, '$lte': ToDate};
    var cond = {isdeleted: {'$ne': true}};
    if (req.user.role_id.code == "ADMIN") {
        callerDetailModel.find({is_deleted: false, created: FromToDate}, function (err, data) {
            if (err) {
                callback({'code': 500, "message": "Error!"});
            } else {
                callback({'code': 200, "message": "Success", "data": data});
            }
        });
    } else if (req.user.role_id.code == "LGN") {
        callerDetailModel.find({parent_lgn: req.user._id, is_deleted: false, created: FromToDate}, function (err, data) {
            if (err) {
                callback({'code': 500, "message": "Error!"});
            } else {
                callback({'code': 200, "message": "Success", "data": data});
            }
        });
    } else {
        callerDetailModel.find({added_by: req.user._id, is_deleted: false, created: FromToDate}, function (err, data) {
            if (err) {
                callback({'code': 500, "message": "Error!"});
            } else {
                callback({'code': 200, "message": "Success", "data": data});
            }
        });
    }

}
exports.getCampaignLeadByDate = getCampaignLeadByDate;

/* @function : getSetPlivoNumbers
 * @Creator  : Jubin
 * @created  : 05112015
 * @purpose  : Get all the phone numbers from plivo
 */
var getSetPlivoNumbers = function (req, res) {

    if (!isEmptyObject(req.user) && !isEmptyObject(req.user.role_id) && (req.user.role_id.code == 'LGN' || req.user.role_id.code == 'LG')) {

        var webPhoneDetails = (req.user.role_id.code == 'LGN') ? req.user.webphone_details : req.user.parent_id.webphone_details;

        var plivoApi = plivo.RestAPI({
            authId: webPhoneDetails.username,
            authToken: webPhoneDetails.password
        });

        var params = {};

        plivoApi.get_numbers(params, function (status, response) {
            if (status >= 200 && status < 300) {
                console.log('Successfully made call request.');
                console.log('Response:', response);

                var phoneArr = [];

                var createdById = (req.user.role_id.code == 'LGN') ? req.user._id : req.user.parent_id._id;

                var noOfPhoneNumber = response.objects.length;

                if (noOfPhoneNumber) {

                    response.objects.forEach(function (datu, indu) {
                        phoneArr.push(datu.number)
                        if (indu == noOfPhoneNumber - 1) {
                            console.log(phoneArr, createdById);
                            ringToNumberModel.update({
                                created_by: createdById,
                                phone_no: {$nin: phoneArr}
                            }, {$set: {is_deleted: true}}, {multi: true}, function (err, resp) {

                                console.log('err', err);
                                console.log('resp', resp);

                                response.objects.forEach(function (data, index) {

                                    var forAreaCode = data.number;
                                    var areaCode = forAreaCode.substring(1, 4);

                                    zipcode.findOne({'AreaCode': areaCode}, function (err, foundCode) {

                                        var thisArr = {
                                            created_by: createdById,
                                            assigned_to: req.user._id,
                                            phone_no: data.number,
                                            provider_type: data.number_type //or data.type (yet to decide)
                                        }

                                        if (err || isEmptyObject(foundCode)) {
                                            console.log('err', err);
                                        } else {
                                            thisArr['zipcode'] = foundCode._id;
                                        }

                                        ringToNumberModel.count({
                                            phone_no: data.number,
                                            is_deleted: false
                                        }, function (error, dataCount) {
                                            if (error) {
                                                console.log(error);
                                            }

                                            if (!dataCount) {
                                                //insert
                                                ringToNumberModel(thisArr).save(function (err, savedNo) {
                                                    if (err) {
                                                        console.log(err);
                                                    } else {
                                                        console.log(savedNo);
                                                    }

                                                    if ((noOfPhoneNumber - 1) == index) {
                                                        res.json({status: 200});
                                                    }
                                                });

                                            } else {
                                                //do nothing
                                                if ((noOfPhoneNumber - 1) == index) {
                                                    res.json({status: 200});
                                                }
                                            }
                                        });
                                    });
                                });
                            });
                        }
                    });

                } else {
                    res.json({status: 404, message: 'No Number Found'});
                }

            } else {
                console.log('Oops! Something went wrong.');
                console.log('Status:', status);
                console.log('Response:', response);
                res.json({status: status, resp: response});
            }
            //return next(response);
        });
    } else {
        res.json({status: 401, message: 'You are not authorised'});
    }
}
exports.getSetPlivoNumbers = getSetPlivoNumbers;

/* @function :get_liveCalls
 * Creator : Shivansh
 * @created  : 05102015
 * @modified :
 * @purpose  :Get all the live calls from plivo
 */
exports.get_liveCalls = function (req, res) {
    var params = {};

    var webPhoneDetails = (req.user.role_id.code == 'LGN') ? req.user.webphone_details : req.user.parent_id.webphone_details;

    var plivoApi = plivo.RestAPI({
        authId: webPhoneDetails.username,
        authToken: webPhoneDetails.password
    });

    plivoApi.get_live_calls(params, function (status, response) {
        res.json({status: 200, resp: response});
    });
};


/* @function : getCallForwardDetails
 *  @Creator  :
 *  @created  : 03022016
 *  @modified :
 *  @purpose  : Get call forward details by logged in user's _id
 */
var getCallForwardDetails = function (req, res) {
    userModel.findOne({_id: req.user._id}, {call_forward: 1}, function (err, data) {
        if (err) {
            res.json({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error});
        } else {
            res.json({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.Success, "data": data});
        }
    });
}
exports.getCallForwardDetails = getCallForwardDetails;


/* @function : getCallForwardDetails
 *  @Creator  :
 *  @created  : 03022016
 *  @modified :
 *  @purpose  : Get call forward details by logged in user's _id
 */
var saveCallForwardDetails = function (req, res) {
    userModel.update({_id: req.user._id}, {$set: {call_forward: req.body.call_forward}}, function (err, data) {
        if (err) {
            res.json({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error});
        } else {
            res.json({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.Success, "data": data});
        }
    });
}
exports.saveCallForwardDetails = saveCallForwardDetails;


/*  @function : outboundCampaignCallPlivo
 *  @created  : 31032016
 *  @modified :
 *  @purpose  : Call Outbound Campaign users
 */
var outboundCampaignCallPlivo = function (req, res, contactsData, data, webPhoneDetails, next) {
    var plivoBaseUrl;

    var plivoApi = plivo.RestAPI({
        authId: webPhoneDetails.username,
        authToken: webPhoneDetails.password
    });

    console.log('data', data)

    var fromPhoneNumber;
    var toPhoneNumber;
    contactsData.forEach(function (contact, index) {

        //only for AfterHOO agenda, as we dont get req parameters in the function call
        if (contact && contact.base_url) {
            plivoBaseUrl = contact.base_url;
        } else {
            plivoBaseUrl = req.protocol + '://' + req.get('host');
        }

        //condition checked for AfterHOO agenda
//        if (contact.from_phone_no) {
//            if (contact.from_phone_no.charAt(0) == '+') {
//                fromPhoneNumber = contact.from_phone_no.substring(2);
//            } else if (contact.from_phone_no.charAt(0) == '1') {
//                fromPhoneNumber = contact.from_phone_no.substring(1);
//            } else {
//                fromPhoneNumber = contact.from_phone_no;
//            }
//        } else {
        fromPhoneNumber = data.phone_no; //'+16052045121';
//        }


        if (contact.phone_no.charAt(0) == '+') {
            toPhoneNumber = contact.phone_no.substring(2);
        } else if (contact.phone_no.charAt(0) == '1') {
            toPhoneNumber = contact.phone_no.substring(1);
        } else {
            toPhoneNumber = contact.phone_no;
        }


        var sipHeader = 'preRecordedMsg=' + data.pre_record_message
                + '&preRecordedMsgPromptID=' + data.pre_record_prompt
                + '&preRecordedMsg_amd=' + data.pre_record_message_amd
                + '&preRecordedMsgPromptID_amd=' + data.pre_record_prompt_amd
                + '&whisperMsg=' + data.whisper_message
                + '&whisperMsgPromptID=' + data.whisper_prompt
                + '&phoneNumber=' + fromPhoneNumber;

        var MachineDetectedSipHeader = 'webPhoneDetails_username=' + webPhoneDetails.username
                + '&webPhoneDetails_password=' + webPhoneDetails.password
                + '&preRecordedMsg_amd=' + data.pre_record_message_amd
                + '&preRecordedMsgPromptID_amd=' + data.pre_record_prompt_amd;

        console.log('sipHeader', sipHeader)

        var params = {
            from: '+1' + fromPhoneNumber,
            to: '+1' + toPhoneNumber, //'+918055255475',
            answer_url: plivoBaseUrl + '/phoneAgent/outboundCampaignCall_PlivoXML?' + sipHeader,
            //sip_headers: sipHeader
            machine_detection: 'true',
            machine_detection_url: plivoBaseUrl + '/phoneAgent/outboundCampaignCall_PlivoMachineDetected?' + MachineDetectedSipHeader
        };

        plivoApi.make_call(params, function (status, response) {
            if (status >= 200 && status < 300) {
                console.log('Successfully made call request.');
                console.log('Response:', response);
            } else {
                console.log('Oops! Something went wrong.');
                console.log('Status:', status);
                console.log('Response:', response);
            }
        });

        if (index + 1 == contactsData.length) {
            return next({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.Success});
        }

    });
}
exports.outboundCampaignCallPlivo = outboundCampaignCallPlivo;


/*  @function : outboundCampaignCallPlivo
 *  @created  : 31032016
 *  @modified :
 *  @purpose  : Call Outbound Campaign users
 */
var outboundCampaignCall_PlivoXML = function (req, res, next) {

    console.log('req.body', req.body);
    console.log('req.query', req.query);

    var plivoBaseUrl = req.protocol + '://' + req.get('host');
    //var plivoBaseUrl = 'https://jubin.localtunnel.me';

    var plivML = plivo.Response();

    if (req.body.To !== req.body.From) {
        async.parallel({
            preRecorded: function (callback) {
                if (req.query['preRecordedMsg'] == 'true') {
                    var promptID = req.query['preRecordedMsgPromptID'];
                    promptModel.findOne({'_id': promptID, 'isdeleted': false}, function (err, promptData) {
                        callback(err, promptData);
                    });
                } else {
                    callback(null, null);
                }
            }
        }, function (err, promptResult) {

            console.log('err, promptResult', err, promptResult)

            if (err) {
                var hangupParams = {'reason': 'rejected'};
                plivML.addHangup(hangupParams);

                // Generate XML String
                var xml = plivML.toXML();

                // Print to console
                console.log(xml);
                return next(xml);
            } else {

                plivML.addWait({length: 10, silence: true, minSilence: 3000});
//                < Wait length = "10" silence = "true" minSilence = "3000" / >
                params = {'action': plivoBaseUrl + '/phoneAgent/outboundCampaignCallPlivo_optOut', 'method': 'POST'};
                var getDigitPlivML = plivML.addGetDigits(params);

                if (promptResult.preRecorded) {
                    if (promptResult.preRecorded.type == 'text') {
                        var voice = promptResult.preRecorded.voice == 'male' ? 'MAN' : 'WOMAN';
                        var speakParams = {voice: voice};
                        getDigitPlivML.addSpeak(promptResult.preRecorded.text, speakParams);
                    } else if (promptResult.preRecorded.type == 'audio') {
                        getDigitPlivML.addPlay(plivoBaseUrl + promptResult.preRecorded.file_path);
                    } else {
                        getDigitPlivML.addSpeak('No Message Set');
                    }
                } else {
                    getDigitPlivML.addSpeak('Press 1 to Opt Out from calling list');
                }

                var params = {'method': 'GET'};

                if (req.query['whisperMsg'] == 'true') {
                    params['confirmSound'] = plivoBaseUrl + '/phoneAgent/whisperMsg_PlivoXML/' + req.query['whisperMsgPromptID'];
                }

                plivML.addDial(params).addNumber('+1' + req.query['phoneNumber']);
            }

            // Generate XML String
            var xml = plivML.toXML();

            // Print to console
            console.log(xml);
            return next(xml);
        });

    } else {
        var hangupParams = {'reason': 'rejected'};
        plivML.addHangup(hangupParams);

        // Generate XML String
        var xml = plivML.toXML();

        // Print to console
        console.log(xml);
        return next(xml);
    }
}
exports.outboundCampaignCall_PlivoXML = outboundCampaignCall_PlivoXML;


/*  @function : outboundCampaignCall_PlivoMachineDetected
 *  @created  : 05042016
 *  @modified :
 *  @purpose  : Respose from plivo when machine/voicemail is detected
 */
var outboundCampaignCall_PlivoMachineDetected = function (req, res) {
    var plivoBaseUrl = req.protocol + '://' + req.get('host');
    //var plivoBaseUrl = 'https://jubin.localtunnel.me';

    console.log('plivo Machine Detected')


    var from_number = req.body.From;
    var to_number = req.body.To;
    var machine = req.body.Machine;
    var call_uuid = req.body.CallUUID;
    var event = req.body.Event;
    var status = req.body.CallStatus;

    console.log("From: ", from_number,
            "To: ", to_number,
            "Machine: ", machine,
            "Call UUID: ", call_uuid,
            "Event: ", event,
            "Status: ", status);

    var plivoApi = plivo.RestAPI({
        authId: req.query['webPhoneDetails_username'],
        authToken: req.query['webPhoneDetails_password']
    });


    var transferURLSipHeader = 'preRecordedMsg_amd=' + req.query['preRecordedMsg_amd']
            + '&preRecordedMsgPromptID_amd=' + req.query['preRecordedMsgPromptID_amd'];


    var params = {
        call_uuid: call_uuid,
        aleg_url: plivoBaseUrl + '/phoneAgent/PlivoMachineDetected_transferCallURL_XML?' + transferURLSipHeader
    };


    plivoApi.transfer_call(params, function (status, response) {
        if (status >= 200 && status < 300) {
            console.log('Successfully made transfer request.');
            console.log('Response:', response);
        } else {
            console.log('Oops! Something went wrong.');
            console.log('Status:', status);
            console.log('Response:', response);
        }
        res.send("OK");
    });


};
exports.outboundCampaignCall_PlivoMachineDetected = outboundCampaignCall_PlivoMachineDetected;


/*  @function : outboundCampaignCall_PlivoMachineDetected
 *  @created  : 05042016
 *  @modified :
 *  @purpose  : Respose from plivo when machine/voicemail is detected
 */
var PlivoMachineDetected_transferCallURL_XML = function (req, res, next) {

    var plivoBaseUrl = req.protocol + '://' + req.get('host');
    //var plivoBaseUrl = 'https://jubin.localtunnel.me';

    console.log('plivo Machine Detected XML')

    var plivML = plivo.Response();

    plivML.addWait({length: 10, silence: true, minSilence: 3000});
    plivML.addSpeak('This is first line Machine Detected. Now it dosent matter dosent matter dosent matter dosent matter dosent matter dosent matter dosent matter dosent matter dosent matter dosent matter dosent matter dosent matter dosent matter');
    //< Wait length = "10" silence = "true" minSilence = "3000" / >

    async.parallel({
        preRecordedAmd: function (callback) {
            if (req.query['preRecordedMsg_amd'] == 'true') {
                var promptID = req.query['preRecordedMsgPromptID_amd'];
                promptModel.findOne({'_id': promptID, 'isdeleted': false}, function (err, promptData) {
                    callback(err, promptData);
                });
            } else {
                callback(null, null);
            }
        }
    }, function (err, promptResult) {
        if (err) {
            //nahi mila
            plivML.addSpeak('Machine Detected');
        } else {
            if (promptResult.preRecordedAmd) {
                if (promptResult.preRecordedAmd.type == 'text') {
                    var voice = promptResult.preRecordedAmd.voice == 'male' ? 'MAN' : 'WOMAN';
                    var speakParams = {voice: voice};
                    plivML.addSpeak(promptResult.preRecordedAmd.text, speakParams);
                } else if (promptResult.preRecordedAmd.type == 'audio') {
                    plivML.addPlay(plivoBaseUrl + promptResult.preRecordedAmd.file_path);
                } else {
                    plivML.addSpeak('No Message Set');
                }
            } else {
                plivML.addSpeak('Machine Detected');
            }
        }

        var hangupParams = {'reason': 'rejected'};
        plivML.addHangup(hangupParams);
        var xml = plivML.toXML(); // Generate XML String
        console.log(xml);// Print to console
        next(xml);
    });
}
exports.PlivoMachineDetected_transferCallURL_XML = PlivoMachineDetected_transferCallURL_XML;


/*  @function : outboundCampaignCallPlivo_optOut
 *  @created  : 05042016
 *  @modified :
 *  @purpose  : Respose from plivo when user press any digit
 */
var outboundCampaignCallPlivo_optOut = function (req, res) {
    console.log('body', req.body)

    var plivML = plivo.Response();

    if (req.body.Digits == 1) {
        var contactNumber = req.body.To;
        if (contactNumber.charAt(0) == '+') {
            contactNumber = contactNumber.substring(2);
        } else if (contactNumber.charAt(0) == '1') {
            contactNumber = contactNumber.substring(1);
        }

        contactModel.update({'phone_no': contactNumber}, {$set: {'optout_call': true}}, function (err, count) {
            if (err) {
                plivML.addSpeak('Error Occured while opting out');
            } else {
                plivML.addSpeak('You have successfully opted out');
            }
        })

    } else {
        plivML.addSpeak('Sorry, You Entered a wrong Input');
        var hangupParams = {'reason': 'rejected'};
        plivML.addHangup(hangupParams);
    }

    // Generate XML String
    var xml = plivML.toXML();

    // Print to console
    console.log(xml);
    return next(xml);

}
exports.outboundCampaignCallPlivo_optOut = outboundCampaignCallPlivo_optOut;



/*  @function : outboundCampaignCallPlivo
 *  @created  : 31032016
 *  @modified :
 *  @purpose  : Call Outbound Campaign users
 */
var whisperMsg_PlivoXML = function (req, res, next) {
    console.log('req.body', req.body);
    console.log('req.query', req.query);
    console.log('req.params', req.params);

    var plivoBaseUrl = req.protocol + '://' + req.get('host');
    //var plivoBaseUrl = 'https://jubin.localtunnel.me';

    var plivML = plivo.Response();

    var promptID = req.params.promptID;
    promptModel.findOne({'_id': promptID, 'isdeleted': false}, function (err, promptData) {
        if (promptData && promptData.type == 'text') {
            var voice = promptData.voice == 'male' ? 'MAN' : 'WOMAN';
            var speakParams = {voice: voice};
            plivML.addSpeak(promptData.text, speakParams);
        } else if (promptData && promptData.type == 'audio') {
            plivML.addPlay(plivoBaseUrl + promptData.file_path);
        } else {
            plivML.addSpeak('No Message Set');
        }

        // Generate XML String
        var xml = plivML.toXML();

        // Print to console
        console.log(xml);
        return next(xml);
    });
}
exports.whisperMsg_PlivoXML = whisperMsg_PlivoXML;