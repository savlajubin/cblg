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
//var callCtrl = require('../controllers/calls.js');
var saveCallDetail = require('../controllers/calls.js').saveCallDetail;
var saveRecordingDetails_voiceMail = require('../controllers/calls.js').saveRecordingDetails_voiceMail;
var campaignCtrl = require('../controllers/campaign.js');
var promptModel = require('../models/prompt.js');
var contactModel = require('../models/contact.js');
var twilio = require('twilio');
var config = require('../../config/constant.js');
var _ = require("underscore");
var async = require('async');
var moment = require('moment');



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

//var twilioApi = new twilio.RestClient('AC9518e4d7985e80cb80555cdb55047691', '9d24efad2692915f9db60de65ad67e60'); //smartdata Test
//var twilioApi = new twilio.RestClient('ACfdae27f48102a567dd8040b7d803cdfe', '336d891e797c29ab1eade8a5c9ca0e62'); //smartdata Live
//var twilioApi = new twilio.RestClient('AC30ea915f45a5b377afe709dba1b9ad49', '570a49181b435d09806dc91e8245b539'); //Jason Live

var getTwilioDetail = function (req, res) {

    userModel.findOne({_id: req.user.parent_id._id})
            .populate('parent_id')
            .exec(function (err, advccData) {
                if (err || isEmptyObject(advccData)) {
                    console.log('user modal Err', err);
                    return res.json({code: config.constant.CODES.Error, message: config.constant.MESSAGES.Error, resp: 'user Err'});
                } else {
                    var webPhoneDetails = (advccData.parent_id && advccData.parent_id.webphone_details) ? advccData.parent_id.webphone_details : {};

                    console.log('webPhoneDetails', webPhoneDetails);

                    var capability = new twilio.Capability(webPhoneDetails.username, webPhoneDetails.password);//Jason Live
                    //capability.allowClientOutgoing('APc993552c411ca5a225ee6e96d9e68743'); //Jason Live
                    //capability.allowClientOutgoing(webPhoneDetails.app_id); //Jason Live
                    capability.allowClientIncoming(req.user.webphone_details.tw_webphone_name);

                    var token = capability.generate();

                    res.json({code: 200, token: token});
                }
            });
};
exports.getTwilioDetail = getTwilioDetail;


// Providing the Outgoing call facilities
var outgoingCalls = function (req, res, clb) {
    console.log(req.query);
    var callTo = req.query.callTo;
    var strURL = config.constant.TWILIO_CREDENTILAS.API_BASE_URL + '/phoneAgent/tw/answer_url';
    var caller = "+" + callTo;
    var called = '+15005550006';
    var strCallBackURL = config.constant.TWILIO_CREDENTILAS.API_BASE_URL + '/phoneAgent/tw/getCallEvent';

    twilioApi.calls.create({
        url: strURL + "?callTo=" + caller, // Url From Making Call
        to: caller, // Number Where You Do Call
        from: called, //From Number Use While Calling
        method: "GET",
        statusCallback: strCallBackURL,
        statusCallbackMethod: "POST",
        statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
        record: "true"		    // Enable recording
    }, function (err, call) {
        if (err) {
            console.log(err)
            res.json({status: 403, message: err, data: null});
        } else {
            console.log(call);
            res.json({status: 200, message: 'connection successfully', data: call.sid});
        }
    });
};
exports.outgoingCalls = outgoingCalls;

// Providing the incomming call facilities
var incommingCalls = function (req, res, clb) {
    twilioApi.incomingPhoneNumbers.create({
    }, function (err, number) {
        if (err) {
            res.json({status: 403, message: err, data: null})
        } else {
            res.json({status: 200, message: 'connection successfully', data: number});
        }
    });
};
exports.incommingCalls = incommingCalls;

// Providing the mute call facilities
var muteCall = function (req, res, clb) {
    var callRefID = req.query.callRefID;
    twilioApi.calls(callRefID).update({
        Muted: "True"
    }, function (err, call) {
        if (err) {
            res.json({status: 403, message: err, data: null})
        } else {
            res.json({status: 200, message: 'connection successfully', data: call.direction});
        }
    });
};
exports.muteCall = muteCall;

// Providing the terminate call facilities  (callRefID: "CAe1644a7eed5088b159577c5802d8be38")
var terminateCall = function (req, res, clb) {
    var callRefID = req.query.callRefID;
    twilioApi.calls(callRefID).update({
        status: "completed"
    }, function (err, call) {
        if (err) {
            console.log(err);
            res.json({status: 403, message: err, data: null})
        } else {
            res.json({status: 200, message: 'connection successfully', data: call.direction});
        }
    });
};
exports.terminateCall = terminateCall;

// Providing the redirect new call facilities (callRefID: "CAe1644a7eed5088b159577c5802d8be38")
var redirectNewCall = function (req, res, clb) {
    var callRefID = req.query.callRefID;
    twilioApi.calls(callRefID).update({
        url: config.constant.TWILIO_CREDENTILAS.API_BASE_URL + '/phoneAgent/tw/ansUrl',
        method: "POST"
    }, function (err, call) {
        if (err) {
            res.json({status: 403, message: err, data: null})
        } else {
            res.json({status: 200, message: 'connection successfully', data: call.to});
        }
    });
};
exports.redirectNewCall = redirectNewCall;

// generate the XML file
var getCallTwiML = function (req, res, next) {
    var plivoBaseUrl = req.protocol + '://' + req.get('host');
    //var plivoBaseUrl = 'https://jubin.localtunnel.me';

    var twiML = new twilio.TwimlResponse();

    console.log('XML reg body', req.body)

    /****************Demo START************/
//    twiML.dial('+918055255475')
//    twiML.say('Yo maaannn, Twilio, leave a message maan!');
//    var recordParams = {'action': plivoBaseUrl + '/phoneAgent/tw/receiveRecordingDetails_voiceMail_Twilio/', 'playBeep': 'true', 'finishOnKey': "*"};
//    twiML.record(recordParams);
//    twiML.hangup();
//
//    var xml = twiML.toString();
//    console.log(xml);
//    next(xml);
//
//    return false;
    /****************Demo END************/


    var currentTime = moment().format("HHmm");
    var currentDay = moment().format("ddd");

    if (req.body.To !== req.body.From) {
        req.body.phone = req.body.To;
        campaignCtrl.campaignDetailsForCallHistory(req, res, function (err, response, associatedIvrs, ringToNumId) {
            var campaignData = response;

            if (err) {
                console.log(err);
                //nahi mila
                twiML.hangup();
                var xml = twiML.toString(); // Generate XML String
                console.log(xml);// Print to console
                next(xml);
            } else if (campaignData && campaignData.nonPsxPhone) {

                userModel.count({'webphone_details.plivo_sip_username': req.body.CallerName}, function (err, userCount) {
                    if (err) {
                        twiML.hangup();
                    } else if (userCount) {
                        var params = {'callerId': req.body.From, 'method': 'GET'};
                        twiML.dial(params, function (dialElement) {
                            dialElement.number(req.body.To)
                        })
                    } else {
                        twiML.say('No Campaign is attached with this number');
                        twiML.hangup();
                    }

                    var xml = twiML.toString(); // Generate XML String
                    console.log(xml);// Print to console
                    next(xml);
                })
            } else {
                console.log('youff', campaignData);
                console.log('currentDay', currentDay)
                console.log('currentTime', currentTime)

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

                    if (campaignData && campaignData.offer_id && campaignData.offer_id.compose_message && campaignData.offer_id.compose_message.afterHOO_message && campaignData.offer_id.compose_message.afterHOO_message_prompt) {
                        promptModel.findOne({'_id': campaignData.offer_id.compose_message.afterHOO_message_prompt, 'isdeleted': false}, function (err, promptData) {
                            if (promptData && promptData.type == 'text') {
                                var voice = promptData.voice == 'male' ? 'MAN' : 'WOMAN';
                                var speakParams = {voice: voice, loop: promptData.repeat};
                                twiML.say(promptData.text, speakParams);
                            } else if (promptData && promptData.type == 'audio') {
                                twiML.play(plivoBaseUrl + promptData.file_path, {loop: promptData.repeat});
                            } else {
                                twiML.say('You have called after hours of operation, Please leave a message after the beep and press star to end your voice message');
                            }
                        });
                    } else {
                        twiML.say('You have called after hours of operation, Please leave a message after the beep and press star to end your voice message');
                    }

                    var recordParams = {'action': plivoBaseUrl + '/phoneAgent/tw/receiveRecordingDetails_voiceMail_Twilio/', 'playBeep': 'true', 'finishOnKey': "*"};
                    twiML.record(recordParams);
                    twiML.hangup();

                    var xml = twiML.toString(); // Generate XML String
                    console.log(xml);// Print to console
                    next(xml);

                } else {
                    //neeche wala code yahan aayega abhi

                    console.log('hmm, normal flow :|');


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
                            twiML.say('Maximum limit of this campaign has been reached for today. Please call tomorrow');

                            //hangup call
                            twiML.hangup();

                            // Generate XML String
                            var xml = twiML.toString();
                            console.log(xml);// Print to console
                            next(xml);
                        } else {
                            //call Success

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
                                if (isToSip.match(/client:(.*?)@/)) {
                                    forAreaCode = req.body.CLID; //Doubtful
                                }

                                var areaCode = forAreaCode.substring(2, 5);

                                zipcode.findOne({'AreaCode': areaCode}, function (err, foundCode) {
                                    var stateName = (foundCode && foundCode.StateName) ? foundCode.StateName : '';
                                    var geoCond = {$or: [{geo: false}, {geo: true, $or: [{'geo_schema.area_code': areaCode}, {'geo_schema.state.name_long': stateName}]}]}

                                    var currentTime = moment().format("HHmm");
                                    var currentDay = moment().format("ddd");

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
                                                        console.log('1st No IVR message');
                                                        twiML.say('No IVR is Set for this number');

                                                        //hangup call
                                                        twiML.hangup();

                                                        // Generate XML String
                                                        var xml = twiML.toString();
                                                        console.log(xml);// Print to console
                                                        next(xml);
                                                    }

                                                    var neededIvrData = false;
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
                                                                                    var voice = failedIvrData.condition_fail_prompt_id.voice == 'male' ? 'man' : 'woman';
                                                                                    var speakParams = {voice: voice, loop: repeat};
                                                                                    twiML.say(failedIvrData.condition_fail_prompt_id.text, speakParams);
                                                                                } else if (failedIvrData.condition_fail_prompt_id.type == 'audio') {
                                                                                    twiML.play(plivoBaseUrl + failedIvrData.condition_fail_prompt_id.file_path, {loop: repeat});
                                                                                } else {
                                                                                    twiML.say('No Message Set');
                                                                                }
                                                                            } else {
                                                                                console.log('2nd No IVR message');
                                                                                twiML.say('No IVR is Set for this number');
                                                                            }

                                                                            //hangup call
                                                                            twiML.hangup();

                                                                            // Generate XML String
                                                                            var xml = twiML.toString();
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
        twiML.reject();

        // Generate XML String
        var xml = twiML.toString();

        // Print to console
        console.log(xml);
        return next(xml);
    }

}
exports.getCallTwiML = getCallTwiML;

//similar to hangup url in plivo
var statusUrl = function (req, res, clb) {
    console.log('statusUrl -> ', req.body);
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
};
exports.statusUrl = statusUrl;



var ivr_menu = function (req, res, ivrData, next) {
    //plivoBaseUrl = 'https://jubin.localtunnel.me';
    var plivoBaseUrl = req.protocol + '://' + req.get('host');

    var twiML = new twilio.TwimlResponse();


    var prevSessionID = req.query.prevSessionID;
    //var prevSessionID = req.body.prevSessionID;

    var pressedDigit = req.body.Digits;
    console.log('body', req.body)
    console.log('req.sessionID', req.sessionID)

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

            switchFunc(req, res, twiML, pressedAct, function (twiML) {
                // Generate XML String
                var xml = twiML.toString();

                // Print to console
                console.log(xml);
                return next(xml);
            });
        } else {
            req.session['ivrData'] = ivrData;

            params = {'numDigits': 1, 'action': plivoBaseUrl + '/phoneAgent/tw/ivr_menu/?CLID=' + req.body.From + '&prevSessionID=' + thisSessionID, 'method': 'POST', 'timeout': '50'};

            var repeat = ivrData.inital_prompt_id.repeat || 1;

            if (ivrData.inital_prompt_id && ivrData.inital_prompt_id.type == 'text') {
                var voice = ivrData.inital_prompt_id.voice == 'male' ? 'man' : 'woman';
                var speakParams = {voice: voice, loop: repeat};
                twiML.gather(params, function (gatherElement) {
                    gatherElement.say(ivrData.inital_prompt_id.text, speakParams);
                });
            } else if (ivrData.inital_prompt_id && ivrData.inital_prompt_id.type == 'audio') {
                twiML.gather(params, function (gatherElement) {
                    gatherElement.play(plivoBaseUrl + ivrData.inital_prompt_id.file_path, {loop: repeat});
                });
            } else {
                twiML.gather(params, function (gatherElement) {
                    gatherElement.say('No Message Set');
                });
            }
            var xml = twiML.toString();
            console.log(xml);
            next(xml);
        }

        //saveCallDetail(req, res);
        console.log(512);

    } else {
        twiML.hangup();
        var xml = twiML.toString();
        console.log(xml);
        next(xml);
    }

}
module.exports.ivr_menu = ivr_menu;


var switchFunc = function (req, res, twiML, schema, next) {
    console.log('check', schema);
    if (schema && schema.pressed_action) {
        switch (schema.pressed_action) {
            case "dial":
            case "reps":
                var dialSchema = (schema.pressed_action == 'dial') ? schema.dial_schema : schema.allrepsbusy_schema;
                dialFunc(req, res, twiML, dialSchema, function (twiML) {
                    next(twiML);
                });
                break;
            case "prompt":
                promtFunc(req, res, twiML, schema.prompt_schema[0], function (twiML) {
                    next(twiML);
                });
                break;
            case "queue":
                queueFunc(req, res, twiML, schema.sendToQueue_schema[0], function (twiML) {
                    next(twiML);
                });
                break;
            case "extension":
                extFunc(req, res, twiML, schema.ring_schema[0], function (twiML) {
                    next(twiML);
                });
                break;
            case "dnc":
                //hangup call
                twiML.hangup();
                next(twiML);
                break;
            case "multidial":
                multidialFunc(req, res, twiML, schema.multi_dial_schema, function (twiML) {
                    next(twiML);
                });
                break;
            default:
                //hangup call
                twiML.hangup();
                next(twiML);
        }
    } else {
        next(twiML);
    }
}

var dialFunc = function (req, res, twiML, initDialSchema, next) {
    console.log(initDialSchema);
    var checkIsNext = true;
    initDialSchema.forEach(function (dialSchema, index) {
        //Direct Dial Section (START)
        if (dialSchema.dial_to && checkIsNext) {
            var params = {'callerId': req.body.From, 'method': 'GET', timeout: dialSchema.wait_time ? dialSchema.wait_time : 30};
            twiML.dial(params, function (dialElement) {
                dialElement.number('+1' + dialSchema.dial_to)
            });
            //Direct Dial Section (END)
        }

        checkIsNext = dialSchema.is_next_dial;

        if (initDialSchema.length == index + 1) {
            next(twiML);
        }
    });
}

var multidialFunc = function (req, res, twiML, initDialSchema, next) {
    console.log(initDialSchema);

    var params = {'callerId': req.body.From, 'method': 'GET'};
    twiML.dial(params, function (dialElement) {
        initDialSchema.forEach(function (dialSchema, index) {
            if (dialSchema.dial_to) {
                dialElement.addNumber('+1' + dialSchema.dial_to);
            }
        });
    });

    next(twiML);
}

var promtFunc = function (req, res, twiML, initPromptSchema, next) {
    var plivoBaseUrl = req.protocol + '://' + req.get('host');
    //var initPromptSchema = pressedAct.prompt_schema[0];
    var repeat = initPromptSchema.prompt_id.repeat || 1;

    if (initPromptSchema.prompt_id.type == 'text') {
        var voice = initPromptSchema.prompt_id.voice == 'male' ? 'man' : 'woman';
        var speakParams = {voice: voice, loop: repeat};
        twiML.say(initPromptSchema.prompt_id.text, speakParams);
    } else if (initPromptSchema.prompt_id.type == 'audio') {
        twiML.play(plivoBaseUrl + initPromptSchema.prompt_id.file_path, {loop: repeat});
    } else {
        twiML.say('No Message Set');
    }

    switchFunc(req, res, twiML, initPromptSchema, function (twiML) {
        next(twiML);
    });
}

var extFunc = function (req, res, twiML, initRingSchema, next) {
    var plivoBaseUrl = req.protocol + '://' + req.get('host');

    if (initRingSchema.phone_agent_id.call_forward && initRingSchema.phone_agent_id.call_forward.status && initRingSchema.phone_agent_id.call_forward.phone) {
        var params = {'callerId': req.body.From, 'method': 'GET'};
        twiML.dial(params, function (dialElement) {
            dialElement.number('+1' + initRingSchema.phone_agent_id.call_forward.phone);
        });
    } else {
        var paSIP = initRingSchema.phone_agent_id.webphone_details.tw_webphone_name;
        //var sipHeaders = 'X-PH-Calluuid=' + req.body.CallUUID.replace(/\-/g, '') + ',X-PH-Calledphoneno=' + req.body.To.replace('@phone.plivo.com', '').replace('sip:', '');
        var params = {'callerId': req.body.From, 'method': 'GET', timeout: initRingSchema.wait_time ? initRingSchema.wait_time : 30};//, 'sipHeaders': sipHeaders};

        twiML.dial(params, function (dialElement) {
            dialElement.client(paSIP);
        });
    }

    if (!initRingSchema.leave_message) {
        switchFunc(req, res, twiML, initRingSchema, function (twiML) {
            next(twiML);
        });
    } else if (initRingSchema.leave_message == true) {
        //leave msg code
        twiML.say('Please leave a message after the beep and press star to end your voice message');
        var recordParams = {'action': plivoBaseUrl + '/phoneAgent/tw/receiveRecordingDetails_voiceMail_Twilio/', 'playBeep': 'true', 'finishOnKey': "*"};
        twiML.record(recordParams);
        twiML.hangup();
        next(twiML);
    }
}

var queueFunc = function (req, res, twiML, initQueueSchema, next) {
    if (initQueueSchema.queue_id.associated_agents.length) {
        var agentsArr = [];

        //var sipHeaders = 'X-PH-Calluuid=' + req.body.CallUUID.replace(/\-/g, '') + ',X-PH-Calledphoneno=' + req.body.To.replace('@phone.plivo.com', '').replace('sip:', '');
        var params = {'callerId': req.body.From, 'method': 'GET'};//, 'sipHeaders': sipHeaders};
        initQueueSchema.queue_id.associated_agents.forEach(function (agent, index) {
            agentsArr.push(agent.agent_id);
            if (initQueueSchema.queue_id.associated_agents.length == index + 1) {
                userModel.find({_id: {$in: agentsArr}}, function (err, paUserData) {
                    if (err || isEmptyObject(paUserData)) {
                        twiML.hangup();
                        next(twiML);
                    } else {
                        twiML.dial(params, function (dialElement) {
                            paUserData.forEach(function (paUser, innerIndex) {

                                if (paUser.call_forward && paUser.call_forward.status && paUser.call_forward.phone) {
                                    dialElement.number('+1' + paUser.call_forward.phone);
                                } else {
                                    var paSIP = paUser.webphone_details.tw_webphone_name;
                                    dialElement.client(paSIP);
                                }

                                if (paUserData.length == innerIndex + 1) {
                                    console.log('check 2', initQueueSchema);
                                    switchFunc(req, res, twiML, initQueueSchema, function (twiML) {
                                        next(twiML);
                                    });
                                }
                            });
                        });
                    }
                });
            }
        });
    } else {
        twiML.hangup();
        next(twiML);
    }
}




/* @function :receiveRecordingDetails_voiceMail_Twilio
 * Creator : Jubin
 * @created  : 23042016
 * @modified :
 * @purpose  : Receive recordings from plivo and save to Db
 */

var receiveRecordingDetails_voiceMail_Twilio = function (req, res, next) {

    console.log('req.body', req.body)

    saveRecordingDetails_voiceMail(req, res, function (err, response) {
        var twiML = new twilio.TwimlResponse();

        twiML.say('We will get in touch with you soon');
        twiML.hangup();

        var xml = twiML.toString();
        console.log(xml);

        next(xml);
    })

}
module.exports.receiveRecordingDetails_voiceMail_Twilio = receiveRecordingDetails_voiceMail_Twilio;






var transferWebPhoneCall_twilio = function (req, res, next) {
    var plivoBaseUrl = req.protocol + '://' + req.get('host');
    //var plivoBaseUrl = 'https://jubin.localtunnel.me';

    var CallSid = req.body.CallSid;

    if (CallSid && req.body.option) {

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
                                    transferToPhone = paData.webphone_details.tw_webphone_name;
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

                userModel.findOne({_id: req.user.parent_id._id})
                        .populate('parent_id')
                        .exec(function (err, advccData) {
                            if (err || isEmptyObject(advccData)) {
                                console.log('user modal Err', err);
                                return res.json({code: config.constant.CODES.Error, message: config.constant.MESSAGES.Error, resp: 'user Err'});
                            } else {
                                var webPhoneDetails = (advccData.parent_id && advccData.parent_id.webphone_details) ? advccData.parent_id.webphone_details : {};

                                var twilioApi = new twilio(webPhoneDetails.username, webPhoneDetails.password);

                                twilioApi.calls(CallSid).get(function (err, call) {
                                    twilioApi.calls(call.parent_call_sid).update({
                                        method: "POST",
                                        url: plivoBaseUrl + '/phoneAgent/tw/transfer_call_twilio?option=' + option + '&transferTo=' + switchResult.phone
                                    }, function (err, call) {
                                        if (err) {
                                            console.log('Oops! Something went wrong.');
                                            console.log('err:', err);
                                        } else {
                                            console.log('Successfully made transfer request.');
                                            console.log('call:', call);
                                        }
                                        return res.json({code: config.constant.CODES.OK, message: config.constant.MESSAGES.Success, resp: response});
                                    });
                                });
                            }
                        });
            }
        });
    } else {
        console.log('else condition');
        return res.json({code: config.constant.CODES.BadRequest, message: config.constant.MESSAGES.invalid, resp: 'CallSid Empty'});
    }
}
module.exports.transferWebPhoneCall_twilio = transferWebPhoneCall_twilio;

exports.transfer_call_twilio = function (req, res, next) {
    var twiML = new twilio.TwimlResponse();

    var params = {'method': 'GET'};
    var transferTo = req.body.transferTo;

    switch (req.body.option.toString()) {
        case 'phone':
            console.log('this is phone')
            twiML.dial(params, function (dialElement) {
                dialElement.number('+1' + transferTo)
            });
            break;
        case 'extension':
            console.log('this is ext')
            var paSIP = transferTo;
            twiML.dial(params, function (dialElement) {
                dialElement.client(paSIP);
            });
            break;
        case 'queue':
            console.log('this is queue')
            queuesModel.findOne({_id: transferTo})
                    .populate('associated_agents.agent_id')
                    .exec(function (err, queueData) {
                        transferToQueueFunc(req, res, twiML, queueData, function (twiML) {
                            var xml = twiML.toString(); // Generate XML String
                            console.log(xml); // Print to console
                            return next(xml);
                        });
                    });
            break;
        default:
            twiML.hangup();
    }

    if (req.query.option != 'queue') {
        var xml = twiML.toString(); // Generate XML String
        console.log(xml); // Print to console
        return next(xml);
    }
};

var transferToQueueFunc = function (req, res, twiML, queueData, next) {
    console.log('this is queu func')
    var associatedAgentLength = queueData.associated_agents.length;
    if (associatedAgentLength) {
        var params = {'method': 'GET'};
        twiML.dial(params, function (dialElement) {
            queueData.associated_agents.forEach(function (paUser) {
                if (paUser.agent_id.call_forward && paUser.agent_id.call_forward.status && paUser.agent_id.call_forward.phone) {
                    dialElement.number('+1' + paUser.agent_id.call_forward.phone);
                } else {
                    var paSIP = paUser.agent_id.webphone_details.plivo_sip_username;
                    dialElement.client(paSIP);
                }
            });
        });
        next(twiML);
    } else {
        twiML.hangup();
        next(twiML);
    }
}


















// generate the response of the Event on call processing
var getCallEvent = function (req, res, clb) {
    var caller_no = req.body.To;
    var fromNumber = req.body.From;
    var callStatus = req.body.callStatus;
    var callSid = req.body.CallSid;
    console.log({'caller': caller_no, 'called': fromNumber, 'status': callStatus, 'sid': callSid});
    res.json({'caller': caller_no, 'called': fromNumber, 'status': callStatus, 'sid': callSid});
};
exports.getCallEvent = getCallEvent;


var fallbackUrl = function (req, res, clb) {
    console.log('fallBack -> ', req.body);
};
exports.fallbackUrl = fallbackUrl;







/*  @function : outboundCampaignCallTwilio
 *  @created  : 31032016
 *  @modified :
 *  @purpose  : Call Outbound Campaign users
 */
var outboundCampaignCallTwilio = function (req, res, contactsData, data, webPhoneDetails, next) {
    var plivoBaseUrl = req.protocol + '://' + req.get('host');
    //var plivoBaseUrl = 'https://jubin.localtunnel.me';

    var twilioApi = new twilio(webPhoneDetails.username, webPhoneDetails.password);

    console.log('data', data)


    var sipHeader = 'preRecordedMsg=' + data.pre_record_message
            + '&preRecordedMsgPromptID=' + data.pre_record_prompt
            + '&preRecordedMsg_amd=' + data.pre_record_message_amd
            + '&preRecordedMsgPromptID_amd=' + data.pre_record_prompt_amd
            + '&whisperMsg=' + data.whisper_message
            + '&whisperMsgPromptID=' + data.whisper_prompt
            + '&phoneNumber=' + data.phone_no;

    console.log('sipHeader', sipHeader)


    contactsData.forEach(function (contact, index) {

        var params = {
            from: '+1' + data.phone_no, //'+14804189690',
            to: '+1' + contact.phone_no, //'+918055255475',
            url: plivoBaseUrl + '/phoneAgent/tw/outboundCampaignCall_TwiML?' + sipHeader,
            ifMachine: 'Continue' //'Hangup'
        };

        twilioApi.calls.create(params, function (err, response) {
            if (err) {
                console.log('Oops! Something went wrong.');
                console.log('Status:', err);
                console.log('Response:', response);
            } else {
                console.log('Successfully made call request.');
                console.log('Response:', response);
            }
        });

        if (index + 1 == contactsData.length) {
            return next({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.Success});
        }

    });
}
exports.outboundCampaignCallTwilio = outboundCampaignCallTwilio;



/*  @function : outboundCampaignCallPlivo
 *  @created  : 31032016
 *  @modified :
 *  @purpose  : Call Outbound Campaign users
 */
var outboundCampaignCall_TwiML = function (req, res, next) {

    console.log('req.body', req.body);
    console.log('req.query', req.query);

    var plivoBaseUrl = req.protocol + '://' + req.get('host');
    //var plivoBaseUrl = 'https://jubin.localtunnel.me';

    var twiML = new twilio.TwimlResponse();

    if (req.body.To !== req.body.From) {

        if (req.body.answeredBy == 'machine' || req.body.AnsweredBy == 'machine') {
            console.log('twilio Machine Detected')

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
                    twiML.say('Machine Detected');
                } else {
                    if (promptResult.preRecordedAmd) {
                        if (promptResult.preRecordedAmd.type == 'text') {
                            var voice = promptResult.preRecordedAmd.voice == 'male' ? 'man' : 'woman';
                            var speakParams = {voice: voice};
                            twiML.say(promptResult.preRecordedAmd.text, speakParams);
                        } else if (promptResult.preRecordedAmd.type == 'audio') {
                            twiML.play(plivoBaseUrl + promptResult.preRecordedAmd.file_path);
                        } else {
                            twiML.say('No Message Set');
                        }
                    } else {
                        twiML.say('Machine Detected');
                    }
                }

                twiML.hangup();
                var xml = twiML.toString(); // Generate XML String
                console.log(xml);// Print to console
                next(xml);
            });

        } else {

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
                    //nahi mila
                    twiML.hangup();
                } else {
                    var gatherParams = {'numDigits': 1, 'action': plivoBaseUrl + '/phoneAgent/tw/outboundCampaignCallTwilio_optOut', 'method': 'POST'};
                    twiML.gather(gatherParams, function (gatherElement) {
                        if (promptResult.preRecorded) {
                            if (promptResult.preRecorded.type == 'text') {
                                var voice = promptResult.preRecorded.voice == 'male' ? 'man' : 'woman';
                                var speakParams = {voice: voice};
                                gatherElement.say(promptResult.preRecorded.text, speakParams);
                            } else if (promptResult.preRecorded.type == 'audio') {
                                gatherElement.play(plivoBaseUrl + promptResult.preRecorded.file_path);
                            } else {
                                gatherElement.say('No Message Set');
                            }
                        } else {
                            gatherElement.say('Press 1 to Opt Out from calling list');
                        }
                    });

                    var params = {'method': 'GET'};

                    twiML.dial(params, function (dialElement) {

                        var numberParams = {}
                        if (req.query['whisperMsg'] == 'true') {
                            numberParams = {url: plivoBaseUrl + '/phoneAgent/tw/whisperMsg_TwiML/' + req.query['whisperMsgPromptID']};
                        }

                        dialElement.number('+1' + req.query['phoneNumber'], numberParams)
                    })
                }

                //nahi mila
                var xml = twiML.toString(); // Generate XML String
                console.log(xml);// Print to console
                next(xml);
            });
        }

    } else {
        //nahi mila
        twiML.hangup();
        var xml = twiML.toString(); // Generate XML String
        console.log(xml);// Print to console
        next(xml);
    }
}
exports.outboundCampaignCall_TwiML = outboundCampaignCall_TwiML;


/*  @function : outboundCampaignCallTwilio_optOut
 *  @created  : 05042016
 *  @modified :
 *  @purpose  : Respose from twilio when user press any digit
 */
var outboundCampaignCallTwilio_optOut = function (req, res) {
    console.log('body', req.body)

    var twiML = new twilio.TwimlResponse();

    if (req.body.Digits == 1) {
        var contactNumber = req.body.To;
        if (contactNumber.charAt(0) == '+') {
            contactNumber = contactNumber.substring(2);
        } else if (contactNumber.charAt(0) == '1') {
            contactNumber = contactNumber.substring(1);
        }

        contactModel.update({'phone_no': contactNumber}, {$set: {'optout_call': true}}, function (err, count) {
            if (err) {
                twiML.say('Error Occured while opting out');
            } else {
                twiML.say('You have successfully opted out');
            }
        })

    } else {
        twiML.say('Sorry, You Entered a wrong Input');
        twiML.hangup();
    }

    var xml = twiML.toString(); // Generate XML String
    console.log(xml);// Print to console
    next(xml);

}
exports.outboundCampaignCallTwilio_optOut = outboundCampaignCallTwilio_optOut;



/*  @function : outboundCampaignCallPlivo
 *  @created  : 31032016
 *  @modified :
 *  @purpose  : Call Outbound Campaign users
 */
var whisperMsg_TwiML = function (req, res, next) {
    console.log('req.body', req.body);
    console.log('req.query', req.query);
    console.log('req.params', req.params);

    var plivoBaseUrl = req.protocol + '://' + req.get('host');
    //var plivoBaseUrl = 'https://jubin.localtunnel.me';

    var twiML = new twilio.TwimlResponse();

    var promptID = req.params.promptID;
    promptModel.findOne({'_id': promptID, 'isdeleted': false}, function (err, promptData) {
        if (promptData && promptData.type == 'text') {
            var voice = promptData.voice == 'male' ? 'man' : 'woman';
            var speakParams = {voice: voice};
            twiML.say(promptData.text, speakParams);
        } else if (promptData && promptData.type == 'audio') {
            twiML.play(plivoBaseUrl + promptData.file_path);
        } else {
            twiML.say('No Message Set');
        }

        var xml = twiML.toString(); // Generate XML String
        console.log(xml);// Print to console
        next(xml);
    });
}
exports.whisperMsg_TwiML = whisperMsg_TwiML;