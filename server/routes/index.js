var express = require('express');
var router = express.Router();
var _ = require("underscore");
var moment = require('moment');
var queuesModel = require('../models/queues.js');
var randtoken = require('rand-token');

//var plivo = require('plivo-node');
var plivo = require('plivo');
var twilio = require('twilio');
var config = require('../../config/constant.js');

var messageModel = require('../models/message_history');

var plivoApi = plivo.RestAPI({
//    authId: config.constant.PLIVO_CREDENTILAS.authId, //Client from constant file
//    authToken: config.constant.PLIVO_CREDENTILAS.authToken  //Client

    authId: 'MAOGY2ZDQ0MDEWMTK1ZM', //smartData Test Account
    authToken: 'NDk4ODk3NTA5NDQ5MGZmN2RjMWQ0MDZjMzgwMjhh' //smartData Test Account
});

var accountSid = 'AC30ea915f45a5b377afe709dba1b9ad49';
var authToken = '570a49181b435d09806dc91e8245b539';
var twilioApi = new twilio(accountSid, authToken);

var Agenda = require('agenda');
var agenda = new Agenda({db: {address: 'localhost:27017/db_callbasedleadgen'}});


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

/* GET home page. */
router.get('/', function (req, res, next) {
    console.log(req.user);

    var callModel = require('../models/module');

    callModel({module_name:'1133',testFun:moment().add('days',1).format('YYYY-MM-DD 00:00:00')}).save(function(err, data){
        console.log(err,data)
    })

    console.log(123456)

//    for (var i = 0; i < 500; i++) {
//        xyzFunc(i, function (resp) {
//            console.log('CALLBACK-' + resp);
//        })
//        setTimeout(function (x) {
//            console.log('loop-' + i);
//        }, i)
//
//    }


    console.log('baad wala hai ye');




    var x;
    var y = [];
    console.log(Date.now());
    console.log(222, req.protocol);
    console.log(1111, req.get("host"));
    console.log('isArray - X -> ', Array.isArray(x));
    console.log('isArray - Y -> ', Array.isArray(y));
    res.json({'r':req.user})
    //res.render('index', {title: 'Express'});
});

var xyzFunc = function (i, next) {
    setTimeout(function (x) {
        next(i);
    }, (500 - i))
}

//function randomString(len, charSet) {
//    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
//    var randomString = '';
//    for (var i = 0; i < len; i++) {
//    	var randomPoz = Math.floor(Math.random() * charSet.length);
//    	randomString += charSet.substring(randomPoz,randomPoz+1);
//    }
//    return randomString;
//}

/* GET home page. */
router.get('/dummyMustu', function (req, res, next) {

    var aaaa = [{'sy': 'sdf'}, {'aa': 'bbb'}];

    aaaa.forEach(function (item) {
        console.log('sdfasdf', [item]);
    });


//    var webPhoneDetails = {
//        "app_id": "AP828bd2907a7f43398a86d21472bbb877",
//        "provider": "twilio",
//        "username": "AC30ea915f45a5b377afe709dba1b9ad49",
//        "password": "570a49181b435d09806dc91e8245b539"
//    }
//    var twilioApi = new twilio(webPhoneDetails.username, webPhoneDetails.password);
//    var params = {
//        to: to,
//        from: src,
//        body: message,
//    }
//    console.log('params twilio', params);
//    twilioApi.messages.create(params, function (err, message) {
//        if (err) {
//            console.log(err);
//            callback({'code': config.constant.CODES.notFound, "provider": 'twilio', 'response': message, "message": config.constant.MESSAGES.Error});
//        } else {
//            callback({'code': config.constant.CODES.OK, "provider": 'twilio', "response": message, "params": params, "message": config.constant.MESSAGES.Success});
//        }
//    });

//    var randomValue = 'qwerty12';
//    console.log('name ', randomValue);
//    agenda.define(randomValue, function (job, done) {
//        console.log(job);
//    });
//    var data = '48 14 * * *';
//    agenda.every(data, randomValue, {'data': 'test'});
//    console.log(data);
//    res.json({'code': 200});
//    console.log('sdfasd');
//    var shorturl = require('shorturl');
//    console.log(req.body);
//    shorturl(req.body.url, function (result) {
//        console.log(result);
//        res.json({1: result});
//    });
//    messageModel.aggregate(
//            [
//                //{$project: {_id: 1, created: true}},
//                {$match: {isdeleted: false}},
//                {$group: {_id: '$list_id'}}
//            ], function (err, result) {
//        if (err) {
//            res.json(err);
//        } else {
//            res.json({"result": result});
//        }
//    });
//    console.log(req.body);
//    var d = new Date(new Date().getFullYear(), req.body.month - 1, req.body.date, req.body.hours, req.body.minutes);
//    console.log(d);
//    return false;
//    var plivoApi = plivo.RestAPI({
//        authId: 'MAOGRINTE5YTM5Y2U5NM', //Client from constant file
//        authToken: 'YmY0NDQ1MDAxYmIwNTZjY2RhNDI0NmM5MWY3NjRm'  //Client
//
////        authId: 'MAOGY2ZDQ0MDEWMTK1ZM', //smartData Test Account
////        authToken: 'NDk4ODk3NTA5NDQ5MGZmN2RjMWQ0MDZjMzgwMjhh' //smartData Test Account
//    });
//    var params = {
//        'src': '13342595659', // Sender's phone number with country code
//        'dst': '14804189690', // Receiver's phone Number with country code
//        'text': 'test msg'
//    };
//    console.log('params', params);
//    var response = {
//        api_id: 'e7390c9e-d60c-11e5-9e6e-22000af883f5',
//        message: 'message(s) queued',
//        message_uuid: ['85ed1a8a-da74-471d-9656-50e48c712886']
//    };
//    var status = 202;
    // Prints the complete response
//    plivoApi.send_message(params, function (status, response) {
//        console.log('Status: ', status);
//        console.log('API Response:\n', response);
////        console.log('Message UUID:\n', response['message_uuid']);
////        console.log('Api ID:\n', response['api_id']);
//        if (status == 202) {
//            res.json({'code': 200, "response": response, "params": params, "message": 200});
//        } else {
//            res.json({'code': 400, "message": 400});
//        }
//    });
})
router.get('/dummyBhawna', function (req, res, next) {
    res.json({1: randtoken.generate(50)})

//    var callerDetailModel = require('../models/callerDetail');
//
//    callerDetailModel.findOne({_id: '56d57cefb63ad0ce2a0f2581'}, function (err, data) {
//        if (err) {
//            callback({'code': 500, "message": "Error!"});
//        } else {
//            var webLeadInfo = data.webLeadDetails.webLeadInfo;
//            var webLeadData = {};
//
//            _.each(webLeadInfo, function (lead, key) {
//                if (webLeadData[key.split('_pqry_')[0]] && lead) {
//                    webLeadData[key.split('_pqry_')[0]] = lead + ',' + webLeadData[key.split('_pqry_')[0]];
//                } else if (lead) {
//                    webLeadData[key.split('_pqry_')[0]] = lead;
//                }
//            })
//            res.json({d: data, y: webLeadData});
//        }
//    });
});

router.get('/dummy', function (req, res, next) {
//    var zip = require('../models/zipcode.js');
//    var state = require('../models/state.js');
//
//    state.find({}, function (err, stateData) {
//        stateData.forEach(function (stateSingle, index) {
//            zip.update(
//                    {'State': stateSingle.name_short},
//            {$set: {"StateName": stateSingle.name_long}},
//            {'multi': true, 'upsert': true},
//            function (err, count) {
//                if (err) {
//                    console.log(err);
//                } else {
//                    console.log(count);
//                }
//            });
//        });
//    });
//
//    queuesModel.findOne({_id: "56694793287f20c5216d5fc8"})
//            .populate('associated_agents.agent_id')
//            .exec(function (err, queueData) {
//                res.json({'q': queueData})
//            });

    console.log(1)
    var twiML = new twilio.TwimlResponse();
    console.log(2)
    // var sipHeaders = 'X-PH-Calluuid=' + req.body.CallUUID.replace(/\-/g, '') + ',X-PH-Calledphoneno=' + req.body.To.replace('@phone.plivo.com', '').replace('sip:', '');
    var params = {'callerId': '+1278934', 'method': 'GET'};//, 'sipHeaders': sipHeaders};
    console.log(3)
    twiML.dial(params, function (dialEle) {
        console.log(4)

        dialEle.number('+11234567890');
        console.log(5)
        dialEle.number('+16665554445');


        var paSIP = 'jubin';
        dialEle.client(paSIP);
        console.log(6)
        dialEle.client('kokoko');
    });

    twiML.dial(params, function (dialEle) {
        dialEle.number('+11234567890');
    })


    var params = {'callerId': req.body.CLID, 'method': 'GET'};


    var initDialSchema = [1, 1, 1, 1, 1, 1, 1, 1, 1];

    initDialSchema.forEach(function (dialSchema, index) {
        twiML.dial(params, function (dialElement) {
            dialElement.number('+121212');

//            if (initDialSchema.length == index + 1) {
//                next(twiML);
//            }
        });

    });

    console.log(twiML.toString());
    console.log(7)
    res.set('Content-Type', 'text/xml');
    res.send(twiML.toString());
});


router.get('/dummy2', function (req, res, next) {

    var x = 1;
    var y = '2';

    console.log(1, x);
    console.log(2, y);

    var du = '{"cookie":{"originalMaxAge":43200000,"expires":"2015-10-29T01:40:02.323Z","httpOnly":true,"path":"/"},"passport":{},"ivrData":{"inital_prompt_id":{},"prompt_msg":"This is first message, please press 2","ivr_name":"test","_id":"562f2be56adaea651b5518a4","pressed_operation":[{"pressed_option":"1","pressed_action":"dial","_id":"562f2be56adaea651b5518a9","sendToQueue_schema":[],"ring_schema":[],"allrepsbusy_schema":[],"prompt_schema":[],"dial_schema":[{"dial_to":"918055255475","_id":"562f2be56adaea651b5518ad","wait_time":"0","is_next_dial":false,"dial_priority":0},{"dial_to":"918149524302","_id":"562f2be56adaea651b5518ac","wait_time":"456","is_next_dial":true,"dial_priority":0},{"dial_to":"918055255475","_id":"562f2be56adaea651b5518ab","wait_time":"6456456","is_next_dial":true,"dial_priority":0},{"dial_to":"918149524302","_id":"562f2be56adaea651b5518aa","wait_time":"456456","is_next_dial":true,"dial_priority":0}]},{"pressed_option":"2","pressed_action":"prompt","_id":"562f2be56adaea651b5518a5","sendToQueue_schema":[],"ring_schema":[],"allrepsbusy_schema":[],"prompt_schema":[{"prompt_msg":"Hello, This is Me and Im very Happy","prompt_id":"1","pressed_action":"dial","_id":"562f2be56adaea651b5518a6","sendToQueue_schema":[],"ring_schema":[],"allrepsbusy_schema":[],"prompt_schema":[],"dial_schema":[{"dial_to":"456456456456456","_id":"562f2be56adaea651b5518a8","wait_time":"0","is_next_dial":false,"dial_priority":0},{"dial_to":"456456","_id":"562f2be56adaea651b5518a7","wait_time":"456456","is_next_dial":true,"dial_priority":0}]}],"dial_schema":[]}],"__v":0}}';
    var dummyJson_P = JSON.parse(du);
    var dummyJson = dummyJson_P.ivrData;

    var dummyJsonx = {
        "ivr_name": "test",
        "pressed_operation": [
            {
                "pressed_option": "1",
                "pressed_action": "dial",
                "sendToQueue_schema": [],
                "ring_schema": [],
                "allrepsbusy_schema": [],
                "prompt_schema": [],
                "dial_schema": [
                    {
                        "dial_to": "918055255475",
                        "wait_time": "0",
                        "is_next_dial": false,
                        "dial_priority": 0
                    },
                    {
                        "dial_to": "918149524302",
                        "wait_time": "456",
                        "is_next_dial": true,
                        "dial_priority": 0
                    },
                    {
                        "dial_to": "918055255475",
                        "wait_time": "6456456",
                        "is_next_dial": true,
                        "dial_priority": 0
                    },
                    {
                        "dial_to": "918149524302",
                        "wait_time": "456456",
                        "is_next_dial": true,
                        "dial_priority": 0
                    }
                ]
            },
            {
                "pressed_option": "2",
                "pressed_action": "prompt",
                "sendToQueue_schema": [],
                "ring_schema": [],
                "allrepsbusy_schema": [],
                "prompt_schema": [
                    {
                        "prompt_id": "1",
                        "pressed_action": "dial",
                        "sendToQueue_schema": [],
                        "ring_schema": [],
                        "allrepsbusy_schema": [],
                        "prompt_schema": [],
                        "dial_schema": [
                            {
                                "dial_to": "456456456456456",
                                "wait_time": "0",
                                "is_next_dial": false,
                                "dial_priority": 0
                            },
                            {
                                "dial_to": "456456",
                                "wait_time": "456456",
                                "is_next_dial": true,
                                "dial_priority": 0
                            }
                        ]
                    }
                ],
                "dial_schema": []
            }
        ]
    };

    var req_data = _.find(dummyJson.pressed_operation, function (d) {
        return d.pressed_option == y;
    });
    console.log(req_data);

});


router.get('/dummy3', function (req, res, next) {

    var params = {call_uuid: req.params.calluuid};

    plivoApi.get_live_call(params, function (status, response) {
        if (status >= 200 && status < 300) {
            console.log('Successfully made call request.');
            console.log('Response:', response);
        } else {
            console.log('Oops! Something went wrong.');
            console.log('Status:', status);
            console.log('Response:', response);
        }
        res.json({status: status, resp: response});
        //return next(response);
    });








    //var response = plivo.Response();

    // generates XML string.
    //console.log(response);
    /**
     * api.make_call accepts params and callback
     */

    // Keys and values to be used for params are the same as documented for our REST API.
    // So for using RestAPI.make_call, valid params can be checked
    // at https://www.plivo.com/docs/api/call/#outbound.
    var params = {};

    plivoApi.get_numbers(params, function (status, response) {
        if (status >= 200 && status < 300) {
            console.log('Successfully made call request.');
            console.log('Response:', response);
        } else {
            console.log('Oops! Something went wrong.');
            console.log('Status:', status);
            console.log('Response:', response);
        }
        //res.json({status: status, resp: response});
        //return next(response);
    });
});

router.get('/dummy6', function (req, res, next) {
    var plivoBaseUrl = 'https://jubin.localtunnel.me';


    var accountSid = 'AC30ea915f45a5b377afe709dba1b9ad49';
    var authToken = '570a49181b435d09806dc91e8245b539';
    var twilioApi = new twilio(accountSid, authToken);

    var twilioParams = {
        voiceEnabled: "true",
        smsEnabled: "true",
    };//{areaCode: "510"};

    twilioApi.availablePhoneNumbers("US").local.list(twilioParams, function (err, data) {
        res.json({'tw err:': err, 'data:': data});
//        for (var number in data.availablePhoneNumbers) {
//            client.incomingPhoneNumbers.create({
//                phoneNumber: number.phone_number
//            }, function (err, purchasedNumber) {
//                console.log(purchasedNumber.sid);
//            });
//        }
    });
    twilioApi.availablePhoneNumbers("US").tollFree.list(twilioParams, function (err, data) {
        //res.json({'tw err:': err, 'data:': data});
//        for (var number in data.availablePhoneNumbers) {
//            client.incomingPhoneNumbers.create({
//                phoneNumber: number.phone_number
//            }, function (err, purchasedNumber) {
//                console.log(purchasedNumber.sid);
//            });
//        }
    });

//    twilioApi.applications.create({
//        friendlyName: 'psx-' + Date.now(),
//        voiceUrl: plivoBaseUrl + '/phoneAgent/tw/ansUrl',
//        voiceMethod: "POST",
//        StatusCallback: plivoBaseUrl + '/phoneAgent/tw/hangup_url',
//        StatusCallbackMethod: "POST"
//                //VoiceFallbackUrl: plivoBaseUrl + '/phoneAgent/hangup_url',
//                //VoiceFallbackMethod: "POST"
//    }, function (err, app) {
//        console.log({'tw err:': err, 'tw app:': app});
//        //if (status >= 200 && status < 300) {
//        if (err.status) {
//            res.json({
//                'result': 500,
//                "message": 'Invalid Credentials Or Please check the plivo Account', //config.constant.MESSAGES.Error,
//                'twilioErr': err,
//                'twilioResponse': app
//            });
//        } else {
//            res.json({'tw err:': err, 'tw app:': app});
//        }
//    });


//    var params = {
//        country_iso: 'US'
//    };
//
//    plivoApi.search_phone_numbers(params, function (status, response) {
//        if (status >= 200 && status < 300) {
//            console.log('Successfully made call request.');
//            console.log('Response:', response);
//        } else {
//            console.log('Oops! Something went wrong.');
//            console.log('Status:', status);
//            console.log('Response:', response);
//        }
//        res.json({status: status, resp: response});
//    });
});


router.get('/dummy4', function (req, res, next) {
    var iv = [{
            ivr_id: '568233cde2583a931bf1dbe9',
            priority: 2,
            _id: '5695def4fdc7e1150f12fc9e'
        }, {
            ivr_id: '5695de3dfdc7e1150f12fc87',
            priority: 0,
            _id: '5695def4fdc7e1150f12fc9d'
        }, {
            ivr_id: '5695de8dfdc7e1150f12fc92',
            priority: 1,
            _id: '5695def4fdc7e1150f12fc9c'
        }];


    var sortedIvrArr = _.map(_.sortBy(iv, 'priority'), function (data) {
        return data.ivr_id;
    });


    var ivrModel = require('../models/ivr');

    ivrModel.find({_id: {$in: sortedIvrArr}})
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

                var currentTime = req.query.time;//moment().format("HHmm");
                var currentDay = moment().format("ddd");

                console.log('currentTime', currentTime)

                var sortedIvrData = false;

                _.each(sortedIvrArr, function (data, index) {

                    var thisIvrData = _.find(ivrData, function (d) {
                        return d._id == data;
                    });

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

                    if (hooFilteredSchema && !sortedIvrData) {
                        sortedIvrData = thisIvrData;
                    }

                    if (sortedIvrArr.length == index + 1) {
                        //console.log(index, sortedIvrData)
                        res.json({x: sortedIvrArr, hooFilteredSchema: hooFilteredSchema, sortedIvrData: sortedIvrData, ivrData: ivrData});
                    }

                });

            });



});


router.get('/dummy5', function (req, res, next) {
    var async = require('async');
    var zipcode = require('../models/zipcode');
    var ivrModel = require('../models/ivr');
    var hooModel = require('../models/hor');
    var geoModel = require('../models/geographic');
    //var callModel = require('../models/callHistories');
    var concurrentCallModel = require('../models/concurrent_call');

    var phoneRef = '564afc323c82b6d233bf238a';

    async.parallel({
        ivr: function (callback) {
            ivrModel.findOne({phone_no: phoneRef, ivr_status: true})
                    .populate('inital_prompt_id')

                    //for populating prompt
                    .populate('pressed_operation.prompt_schema.prompt_id')
                    .populate('pressed_operation.prompt_schema.prompt_schema.prompt_id')
                    .populate('pressed_operation.ring_schema.prompt_schema.prompt_id')
                    .populate('pressed_operation.sendToQueue_schema.prompt_schema.prompt_id')

                    //for populating phoneAgent (for extension)
                    .populate('pressed_operation.ring_schema.phone_agent_id')
                    .populate('pressed_operation.ring_schema.ring_schema.phone_agent_id')
                    .populate('pressed_operation.prompt_schema.ring_schema.phone_agent_id')
                    .populate('pressed_operation.sendToQueue_schema.ring_schema.phone_agent_id')

                    //for populating queue
                    .populate('pressed_operation.sendToQueue_schema.queue_id')
                    .populate('pressed_operation.ring_schema.sendToQueue_schema.queue_id')
                    .populate('pressed_operation.prompt_schema.sendToQueue_schema.queue_id')
                    .populate('pressed_operation.sendToQueue_schema.sendToQueue_schema.queue_id')

                    .exec(function (err, ivrData) {
                        callback(err, ivrData);
                    });
        },
        hoo: function (callback) {
            var currentTime = moment(Date.now()).format("HHmm");
            //hooModel.findOne({phone_no: phoneRef, hor_status: true})
            hooModel.findOne({phone_no: phoneRef, hor_status: true, 'operationAfterBH.call_range_start': {$lte: currentTime}, 'operationAfterBH.call_range_end': {$gte: currentTime}})
                    //for populating prompt
                    .populate('operationAfterBH.prompt_schema.prompt_id')
                    .populate('operationAfterBH.prompt_schema.prompt_schema.prompt_id')
                    .populate('operationAfterBH.ring_schema.prompt_schema.prompt_id')
                    .populate('operationAfterBH.sendToQueue_schema.prompt_schema.prompt_id')

                    //for populating phoneAgent (for extension)
                    .populate('operationAfterBH.ring_schema.phone_agent_id')
                    .populate('operationAfterBH.ring_schema.ring_schema.phone_agent_id')
                    .populate('operationAfterBH.prompt_schema.ring_schema.phone_agent_id')
                    .populate('operationAfterBH.sendToQueue_schema.ring_schema.phone_agent_id')

                    //for populating queue
                    .populate('operationAfterBH.sendToQueue_schema.queue_id')
                    .populate('operationAfterBH.ring_schema.sendToQueue_schema.queue_id')
                    .populate('operationAfterBH.prompt_schema.sendToQueue_schema.queue_id')
                    .populate('operationAfterBH.sendToQueue_schema.sendToQueue_schema.queue_id')

                    .exec(function (err, ivrData) {
                        if (isEmptyObject(ivrData)) {
                            callback(err, ivrData);
                        } else {
                            var hooFilteredSchema = _.find(ivrData.operationAfterBH, function (d) {
                                return d.call_range_start <= currentTime && d.call_range_end >= currentTime;
                            });
                            callback(err, hooFilteredSchema);
                        }
                    });
        },
        geo: function (callback) {
            var areaCode = 205;
            zipcode.findOne({'AreaCode': areaCode}, function (err, foundCode) {
                var stateName = (foundCode && foundCode.StateName) ? foundCode.StateName : '';
                geoModel.findOne({phone_no: phoneRef, geo_status: true, $or: [{'operations.area_code': areaCode}, {'operations.state': stateName}]})
                        //for populating prompt
                        .populate('operations.prompt_schema.prompt_id')
                        .populate('operations.prompt_schema.prompt_schema.prompt_id')
                        .populate('operations.ring_schema.prompt_schema.prompt_id')
                        .populate('operations.sendToQueue_schema.prompt_schema.prompt_id')

                        //for populating phoneAgent (for extension)
                        .populate('operations.ring_schema.phone_agent_id')
                        .populate('operations.ring_schema.ring_schema.phone_agent_id')
                        .populate('operations.prompt_schema.ring_schema.phone_agent_id')
                        .populate('operations.sendToQueue_schema.ring_schema.phone_agent_id')

                        //for populating queue
                        .populate('operations.sendToQueue_schema.queue_id')
                        .populate('operations.ring_schema.sendToQueue_schema.queue_id')
                        .populate('operations.prompt_schema.sendToQueue_schema.queue_id')
                        .populate('operations.sendToQueue_schema.sendToQueue_schema.queue_id')

                        .exec(function (err, ivrData) {
                            if (isEmptyObject(ivrData)) {
                                callback(err, ivrData);
                            } else {
                                var geoFilteredSchema = _.find(ivrData.operations, function (d) {
                                    return d.area_code == areaCode || d.state == stateName;
                                });
                                callback(err, geoFilteredSchema);
                            }
                        });
            });
        },
        concurrent: function (callback) {
            concurrentCallModel.findOne({phone_no: phoneRef, ivr_status: true, no_of_calls: {$lt: 10}})
                    //for populating prompt
                    .populate('pressed_operation.prompt_schema.prompt_id')
                    .populate('pressed_operation.prompt_schema.prompt_schema.prompt_id')
                    .populate('pressed_operation.ring_schema.prompt_schema.prompt_id')
                    .populate('pressed_operation.sendToQueue_schema.prompt_schema.prompt_id')

                    //for populating phoneAgent (for extension)
                    .populate('pressed_operation.ring_schema.phone_agent_id')
                    .populate('pressed_operation.ring_schema.ring_schema.phone_agent_id')
                    .populate('pressed_operation.prompt_schema.ring_schema.phone_agent_id')
                    .populate('pressed_operation.sendToQueue_schema.ring_schema.phone_agent_id')

                    //for populating queue
                    .populate('pressed_operation.sendToQueue_schema.queue_id')
                    .populate('pressed_operation.ring_schema.sendToQueue_schema.queue_id')
                    .populate('pressed_operation.prompt_schema.sendToQueue_schema.queue_id')
                    .populate('pressed_operation.sendToQueue_schema.sendToQueue_schema.queue_id')

                    .exec(function (err, ivrData) {
                        callback(err, ivrData);
                    });
        }
    },
    function (err, result) {
//        var callTo = '13305202763';
//        callModel.count({To: callTo, EndTime: {$exists: false}}, function (err, callCount) {
//            res.json({e: result, w: callCount});
//        });


        var priorityArr = ['geo', 'hoo', 'concurrent', 'ivr'];

        if (!isEmptyObject(result[priorityArr[0]])) {
            menuSelector(req, res, priorityArr[0], result[priorityArr[0]], function (xml) {
                res.json({x: xml});
            });
        } else if (!isEmptyObject(result[priorityArr[1]])) {
            menuSelector(req, res, priorityArr[1], result[priorityArr[1]], function (xml) {
                res.json({x: xml});
            });
        } else if (!isEmptyObject(result[priorityArr[2]])) {
            menuSelector(req, res, priorityArr[2], result[priorityArr[2]], function (xml) {
                res.json({x: xml});
            });
        } else if (!isEmptyObject(result[priorityArr[3]])) {
            menuSelector(req, res, priorityArr[3], result[priorityArr[3]], function (xml) {
                res.json({x: xml});
            });
        } else {
            //Direct Dial Section (START)
            var params = {'callerId': req.body.CLID, 'method': 'GET'};
            var isToSip = req.body.To;
            if (isToSip.match(/sip:(.*?)@/)) {
                r.addDial(params).addUser(req.body.To);
            } else {
                r.addDial(params).addNumber(req.body.To);
            }
            //Direct Dial Section (END)

            // Generate XML String
            var xml = r.toXML();
            console.log(xml);// Print to console
            res.json({x: xml});
        }
    });

});

router.get('/dummy7', function (req, res, next) {
    var plivoBaseUrl = req.protocol + '://' + req.get('host');
    var plivoBaseUrl = 'https://jubin.localtunnel.me';

    console.log(plivoBaseUrl)

//    var plivoApi = plivo.RestAPI({
//        authId: webPhoneDetails.username,
//        authToken: webPhoneDetails.password
//    });

//    var params = {
//        from: '+16052045121',
//        to: '+918055255475',
//        answer_url: plivoBaseUrl + '/phoneAgent/outboundCampaignCall_PlivoXML',
//        sip_headers: 'X-PH-Calluuid=yoyo,X-PH-Calledphoneno=woohoo'
//    };
//
//    plivoApi.make_call(params, function (status, response) {
//        if (status >= 200 && status < 300) {
//            console.log('Successfully made call request.');
//            console.log('Response:', response);
//        } else {
//            console.log('Oops! Something went wrong.');
//            console.log('Status:', status);
//            console.log('Response:', response);
//        }
//        res.json({1: 1})
//        //return next(response);
//    });

    var params = {
        from: '+14804189690',
        to: '+13342035112', //'+918055255475',
        url: plivoBaseUrl + '/phoneAgent/tw/outboundCampaignCall_TwiML?Calluuid=yoyo&Calledphoneno=woohoo'
    };

    twilioApi.calls.create(params, function (status, response) {
        if (status >= 200 && status < 300) {
            console.log('Successfully made call request.');
            console.log('Response:', response);
        } else {
            console.log('Oops! Something went wrong.');
            console.log('Status:', status);
            console.log('Response:', response);
        }
    });

})

var testFun = function (req, res, next) {
    next(null, 'wow')
}


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
        default:
            ivr_menu(req, res, ivrData, function (xml) {
                next(xml);
            });
            break;
    }
}

var ivr_menu = function (req, res, resul, next) {
    next(111);
}

var hoo_menu = function (req, res, hooData, next) {
    next(hooData);
}

var concurrent_menu = function (req, res, resul, next) {
    next(333);
}

var geo_menu = function (req, res, geoData, next) {

    console.log('>>', geoData);

    next(444);
}


router.get('/dummy10', function (req, res, next) {
    var zipcode = require('../models/zipcode');
    var ivrModel = require('../models/ivr');

    var phoneRef = "5669845dcc71951e544ec2dc";//'564afc323c82b6d233bf238a';;

    var areaCode = 205;
    zipcode.findOne({'AreaCode': areaCode}, function (err, foundCode) {
        var stateName = (foundCode && foundCode.StateName) ? foundCode.StateName : '';
        var geoCond = {$or: [{geo: false}, {geo: true, $or: [{'geo_schema.area_code': areaCode}, {'geo_schema.state.name_long': stateName}]}]}

        var currentTime = 1330;//moment(Date.now()).format("HHmm");
        var currentDay = 'Tue';//moment().format("ddd");
        //var hooCond = {$or: [{hoo: false}, {hoo: true, 'hoo_schema.days.name': currentDay, 'hoo_schema.call_range_start': {$lte: currentTime}, 'hoo_schema.call_range_end': {$gte: currentTime}}]};
        var hooCond = {$or: [{hoo: false}, {hoo: true, 'hoo_schema.days.name': currentDay, 'hoo_schema.call_range_start': {$lte: currentTime}, 'hoo_schema.call_range_end': {$gte: currentTime}}]};

        var conCond = {$or: [{cc: false}, {cc: true, no_of_calls: {$gt: 2}}]};

        var ivrCond = {phone_no: phoneRef, ivr_status: true};

        ivrModel.findOne({$and: [ivrCond, hooCond, geoCond, conCond, {is_deleted: false}]})
                .populate('inital_prompt_id')
                .populate('condition_fail_prompt_id')

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

                    if (ivrData && ivrData.hoo) {
                        var hooFilteredSchema = _.find(ivrData.hoo_schema, function (d) {
                            return d.call_range_start <= currentTime && d.call_range_end >= currentTime;
                        });
                    } else {
                        var hooFilteredSchema = true;
                    }

                    if (!isEmptyObject(ivrData) && hooFilteredSchema) {
                        ivr_menu(req, res, ivrData, function (xml) {
                            res.json({x: xml, ivrData: ivrData});
                        });
                    } else {

                        ivrModel.findOne(ivrCond)
                                .populate('condition_fail_prompt_id')
                                .exec(function (err, failedIvrData) {
                                    if (!isEmptyObject(failedIvrData)) {
                                        res.json({x: 'failed', ivrData: failedIvrData});
                                    } else {
                                        res.json({x: 'else'});
                                    }
                                });
                    }
                });
    });
});


router.get('/dummy11', function (req, res, next) {

    var webPhoneDetails = {
        "app_id": "AP828bd2907a7f43398a86d21472bbb877",
        "provider": "twilio",
        "username": "AC30ea915f45a5b377afe709dba1b9ad49",
        "password": "570a49181b435d09806dc91e8245b539"
    }

    var twilioApi = new twilio(webPhoneDetails.username, webPhoneDetails.password);

    twilioApi.calls(req.query.sid).get(function (err, call) {
        twilioApi.calls(call.parent_call_sid).update({
            method: "POST",
            url: "https://jubin.localtunnel.me/index/dummy12"
        }, function (err, call) {
            console.log(err, call);
            res.json({err: err, x: call})
        });
    });

//    twilioApi.calls('CAa37a6f2920194b564d3442ea33bc5245').get(function (err, call) {
//        console.log(call);
//        res.json({err: err, x: call})
//    });
});
module.exports = router;


router.post('/dummy12', function (req, res) {
    console.log('dum12', req.body)
    console.log('dum12', req.query)
    console.log('dum12', req.params)

    var twiML = new twilio.TwimlResponse();

//    var params = {'callerId': '+918149632541', 'method': 'GET'};
//    twiML.dial(params, function (dialElement) {
//        dialElement.number('+918055255475')
//    });
    twiML.say('bye mustu');
    var xml = twiML.toString(); // Generate XML String
    console.log(xml);// Print to console
    res.set('Content-Type', 'text/xml');
    res.send(xml);
});


router.get('/dummyTwilioSMS', function (req, res) {
    var webPhoneDetails = {
        "app_id": "AP828bd2907a7f43398a86d21472bbb877",
        "provider": "twilio",
        "username": "AC30ea915f45a5b377afe709dba1b9ad49",
        "password": "570a49181b435d09806dc91e8245b539"
    }

    var twilioApi = new twilio(webPhoneDetails.username, webPhoneDetails.password);

    twilioApi.messages.create({
        to: "918149524302",
        from: "+14804189690",
        body: "Test message twilio",
    }, function (err, message) {
        if (err)
            res.json({'Error': err, 'message': message});
        else
            res.json({'message': message, 'err': err});
    });
});
module.exports = router;


