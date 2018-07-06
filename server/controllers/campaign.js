var config = require('../../config/constant.js'); // constants
//var Campaign = require('../models/campaign'); //To deal with campaign collection data
//var Phone = require('../models/user_profile').Phone; //To access user profile phone object
var user_profile = require('../models/user_profile'); //To deal with user profile collection data
var userModel = require('../models/user');
var ringToNumber = require('../models/ringToNumber'); //To deal with phone number_request collection data
var _ = require("underscore");
var moment = require("moment");
var callModel = require('../models/callHistories');
var async = require('async');
var plivo = require('plivo');
var twilio = require('twilio');
var zipcode = require('../models/zipcode');
var inboundTrunkModel = require('../models/inbound_trunk');

/* @function : isEmptyObject
 *  @Creator  : shivansh
 *  @created  : 09072015
 */

var isEmptyObject = function (obj) {
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
}

/*  @function : addCampaign
 *  @created  : 23072015
 *  @modified :
 *  @purpose  : Add campaign in the system
 */
var addCampaign = function (req, res, next) {


    var webPhoneDetails = (req.user.role_id.code == 'LGN') ? req.user.webphone_details : req.user.parent_id.webphone_details;
//    var webPhoneDetails = {
//        "app_id": "30041966820983067",
//        "provider": "plivo",
//        "username": "MAOGRINTE5YTM5Y2U5NM",
//        "password": "YmY0NDQ1MDAxYmIwNTZjY2RhNDI0NmM5MWY3NjRm"
//    }
//    var webPhoneDetails = {
//        "app_id": "AP828bd2907a7f43398a86d21472bbb877",
//        "provider": "twilio",
//        "username": "AC30ea915f45a5b377afe709dba1b9ad49",
//        "password": "570a49181b435d09806dc91e8245b539"
//    }

    if (webPhoneDetails && webPhoneDetails.provider == 'plivo') {
        var plivoApi = plivo.RestAPI({
            authId: webPhoneDetails.username,
            authToken: webPhoneDetails.password
        });
    } else if (webPhoneDetails && webPhoneDetails.provider == 'twilio') {
        var twilioApi = new twilio(webPhoneDetails.username, webPhoneDetails.password);
    }

    // create the campaign

    var insertData = req.body;
    console.log(insertData);
    //var postData = req.body;
    user_profile.findOne({'user_id': req.user._id}, function (err, data) {
        if (err) {
            console.log(err);
            next({'result': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
        } else {
            async.parallel({
                fixed: function (callback) {
                    if (webPhoneDetails && webPhoneDetails.provider == 'plivo' && req.body.ringToNumbers && req.body.ringToNumbers.local && req.body.ringToNumbers.local.fromPlivo) {
                        var params = {
                            number: req.body.ringToNumbers.local.phone_no,
                            app_id: webPhoneDetails.app_id
                        };
                        plivoApi.buy_phone_number(params, function (status, response) {
                            //status = 200;
                            if (status >= 200 && status < 300) {
                                saveToRingToNumber(req, res, req.body.ringToNumbers.local, function (err, result) {
                                    callback(err, result);
                                })
                            } else {
                                console.log('Oops! Something went wrong.');
                                console.log('Status:', status);
                                console.log('Response:', response);
                                callback(true, null);
                            }
                        });
                    } else if (webPhoneDetails && webPhoneDetails.provider == 'twilio' && req.body.ringToNumbers && req.body.ringToNumbers.local && req.body.ringToNumbers.local.fromTwilio) {
                        twilioApi.incomingPhoneNumbers.create({
                            phoneNumber: req.body.ringToNumbers.local.phone_no,
                            voiceApplicationSid: webPhoneDetails.app_id
                        }, function (err, purchasedNumber) {
                            //var err = null;
                            //purchasedNumber = {sid: 'dummy'}
                            if (err) {
                                console.log('Oops! Something went wrong.');
                                console.log('Status:', err);
                                console.log('Response:', purchasedNumber);
                                callback(true, null);
                            } else {
                                //console.log(purchasedNumber.sid);
                                req.body.ringToNumbers.local['tw_number_sid'] = purchasedNumber.sid;
                                saveToRingToNumber(req, res, req.body.ringToNumbers.local, function (err, result) {
                                    callback(err, result);
                                })
                            }
                        });
                    } else {
                        callback(null, null);
                    }
                },
                tollfree: function (callback) {
                    if (webPhoneDetails && webPhoneDetails.provider == 'plivo' && req.body.ringToNumbers && req.body.ringToNumbers.tollfree && req.body.ringToNumbers.tollfree.fromPlivo) {
                        var params = {
                            number: req.body.ringToNumbers.tollfree.phone_no,
                            app_id: webPhoneDetails.app_id
                        };
                        plivoApi.buy_phone_number(params, function (status, response) {
                            //status = 200;
                            if (status >= 200 && status < 300) {
                                saveToRingToNumber(req, res, req.body.ringToNumbers.tollfree, function (err, result) {
                                    callback(err, result);
                                })
                            } else {
                                console.log('Oops! Something went wrong.');
                                console.log('Status:', status);
                                console.log('Response:', response);
                                callback(true, null);
                            }
                        });
                    } else if (webPhoneDetails && webPhoneDetails.provider == 'twilio' && req.body.ringToNumbers && req.body.ringToNumbers.tollfree && req.body.ringToNumbers.tollfree.fromTwilio) {
                        twilioApi.incomingPhoneNumbers.create({
                            phoneNumber: req.body.ringToNumbers.tollfree.phone_no,
                            voiceApplicationSid: webPhoneDetails.app_id
                        }, function (err, purchasedNumber) {
                            //var err = null;
                            //purchasedNumber = {sid: 'dummy'}
                            if (err) {
                                console.log('Oops! Something went wrong.');
                                console.log('Status:', err);
                                console.log('Response:', purchasedNumber);
                                //console.log(purchasedNumber.sid);
                                callback(true, null);
                            } else {
                                req.body.ringToNumbers.tollfree['tw_number_sid'] = purchasedNumber.sid;
                                saveToRingToNumber(req, res, req.body.ringToNumbers.tollfree, function (err, result) {
                                    callback(err, result);
                                })
                            }
                        });
                    } else {
                        callback(null, null);
                    }
                }
            },
            function (err, result) {

                if (err) {
                    next({'result': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error})
                } else {
                    insertData.created_by = req.user._id;
                    insertData.parent_lgn = req.user.parent_id._id;

                    /* Web Affiliate */
//                    var webAffiliateData = {token: insertData.web_affiliate_token};
//
//                    _.each(insertData.web_affiliate_script, function (scriptItem) {
//                        scriptItem['optionsArr'] = scriptItem['options'];
//                        delete scriptItem.options;
//                    });
//                    webAffiliateData['scriptData'] = insertData.web_affiliate_script;
//                    insertData.web_affiliate = webAffiliateData;
                    /* Web Affiliate Ends */

                    console.log(11, req.body.ringToNumbers)
                    console.log(12, result)

                    var isT = !isEmptyObject(req.body.ringToNumbers.tollfree);
                    var isL = !isEmptyObject(req.body.ringToNumbers.local);
                    var isV = !isEmptyObject(req.body.ringToNumbers.vanity);

                    var saveRingToNumbers = {};
                    if (isT) {
                        saveRingToNumbers['tollfree'] = !isEmptyObject(result.tollfree) ? result.tollfree._id : req.body.ringToNumbers.tollfree._id;
                    }
                    if (isL) {
                        saveRingToNumbers['local'] = !isEmptyObject(result.fixed) ? result.fixed._id : req.body.ringToNumbers.local._id;
                    }
                    if (isV) {
                        saveRingToNumbers['vanity'] = req.body.ringToNumbers.vanity;
                    }
                    insertData.ringToNumbers = saveRingToNumbers;

                    if (isEmptyObject(data)) {

                        new user_profile({
                            'user_id': req.user._id,
                            'role_id': req.user.role_id._id || null, // should be for LGN role id if admin create otherwise req.use.role_id._id
                            'campaigns': [insertData],
                            'created': new Date(),
                            'modified': new Date()
                        }).save(function (err, data) {
                            if (err) {
                                console.log(err);
                                next({'result': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                            } else {
                                user_profile.findOne({'user_id': req.user._id}, function (err, data) {
                                    if (err) {
                                        console.log(err);
                                        next({'result': config.constant.CODES.notFound})
                                    } else {
                                        next({'result': config.constant.CODES.OK, "data": data, "message": config.constant.MESSAGES.uploadSuccess});
                                    }
                                });
                            }
                        });
                    } else {
                        user_profile.update({'user_id': req.user._id}, {$push: {campaigns: insertData}}, function (err, data) {
                            if (err) {
                                console.log(err);
                                next({'result': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                            } else {
                                user_profile.findOne({'user_id': req.user._id}, function (err, data) {
                                    if (err) {
                                        console.log(err);
                                        next({'result': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
                                    } else {
                                        next({'result': config.constant.CODES.OK, "data": data, "message": config.constant.MESSAGES.uploadSuccess});
                                    }
                                });
                            }
                        });
                    }
                }
            });
        }
    });
}
module.exports.addCampaign = addCampaign;

var saveToRingToNumber = function (req, res, numberData, next) {
    var createdById = (req.user.role_id.code == 'LGN') ? req.user._id : req.user.parent_id._id;
    var assignedTo = req.user._id;

    var forAreaCode = numberData.phone_no;

    var areaCode = forAreaCode.substring(1, 4);

    if (forAreaCode.charAt(0) == '+') {
        areaCode = forAreaCode.substring(2, 5);
    }

    zipcode.findOne({'AreaCode': areaCode}, function (err, foundCode) {

        var thisArr = {
            created_by: createdById,
            assigned_to: assignedTo,
            phone_no: numberData.phone_no,
            tw_number_sid: numberData.fromTwilio ? numberData.tw_number_sid : null,
            provider_type: numberData.type, //or data.type (yet to decide)
            provider: numberData.fromPlivo ? 'plivo' : (numberData.fromTwilio ? 'twilio' : null)
        }

        if (err || isEmptyObject(foundCode)) {
            console.log('err', err);
        } else {
            thisArr['zipcode'] = foundCode._id;
        }

        ringToNumber.count({
            phone_no: numberData.phone_no,
            is_deleted: false
        }, function (error, dataCount) {
            if (error) {
                console.log(error);
            }

            if (!dataCount) {
                //insert
                ringToNumber(thisArr).save(function (err, savedNo) {
                    if (err) {
                        next(err, {status: 500});
                    } else {
                        next(null, {status: 200, _id: savedNo._id});
                    }
                });

            } else {
                //do nothing
                next(null, {status: 200});
            }
        });
    });
}
module.exports.saveToRingToNumber = saveToRingToNumber;

/* @function : listingCampaign
 *  @created  : 23072015
 *  @modified :
 *  @purpose  : list campaigns in the admin login
 */

var listingCampaign = function (req, res, callback) {
    user_profile.find({'campaigns.isdeleted': false}).populate('campaigns.offer_id').exec(function (err, campaign) {
        if (err) {
            console.log("System Error (listingCampaign) : " + err);
            callback({'code': config.constant.CODES.notFound, "data": null, "message": config.constant.MESSAGES.Error});
        } else {
            if (isEmptyObject(campaign)) {
                callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.notFound});
            } else {
                console.log(campaign);
                callback({'code': config.constant.CODES.OK, "data": campaign, "message": config.constant.MESSAGES.Success});
            }
        }
    });
}
module.exports.listingCampaign = listingCampaign;


/* @function : getRingToNumber
 *  @created  : 24092015
 *  @modified :
 *  @purpose  :
 */
/*
 var getRingToNumber = function (req, res, callback) {
 var webPhoneDetails = (req.user.role_id.code == 'LGN') ? req.user.webphone_details : req.user.parent_id.webphone_details;
 //    var webPhoneDetails = {
 //        "app_id": "30041966820983067",
 //        "provider": "plivo",
 //        "username": "MAOGRINTE5YTM5Y2U5NM",
 //        "password": "YmY0NDQ1MDAxYmIwNTZjY2RhNDI0NmM5MWY3NjRm"
 //    }
 
 var plivoApi = plivo.RestAPI({
 authId: webPhoneDetails.username,
 authToken: webPhoneDetails.password
 });
 
 var params = {
 country_iso: 'US',
 type: 'fixed',
 limit: 9
 };
 
 var newFixedNumbers = [];
 var newTollfreeNumbers = [];
 
 async.parallel({
 fixed: function (callback) {
 plivoApi.search_phone_numbers(params, function (status, response) {
 if (status >= 200 && status < 300) {
 console.log('Successfully made call request.');
 //console.log('Response:', response);
 response.objects.forEach(function (plivoNumber, index) {
 newFixedNumbers[index] = {
 _id: plivoNumber.number,
 type: (plivoNumber.type == 'fixed') ? 'local' : plivoNumber.type,
 phone_no: plivoNumber.number,
 region: plivoNumber.region,
 monthly_rental_rate: plivoNumber.monthly_rental_rate,
 sms_enabled: plivoNumber.sms_enabled,
 sms_rate: plivoNumber.sms_rate,
 voice_enabled: plivoNumber.voice_enabled,
 voice_rate: plivoNumber.voice_rate,
 fromPlivo: true
 };
 if (index + 1 == response.objects.length) {
 callback(null, newFixedNumbers);
 }
 });
 } else {
 console.log('Oops! Something went wrong.');
 console.log('Status:', status);
 console.log('Response:', response);
 callback(true, newFixedNumbers);
 }
 });
 },
 tollfree: function (callback) {
 params['type'] = 'tollfree';
 plivoApi.search_phone_numbers(params, function (status, response) {
 if (status >= 200 && status < 300) {
 console.log('Successfully made call request.');
 //console.log('Response:', response);
 response.objects.forEach(function (plivoNumber, index) {
 newTollfreeNumbers[index] = {
 _id: plivoNumber.number,
 type: (plivoNumber.type == 'fixed') ? 'local' : plivoNumber.type,
 phone_no: plivoNumber.number,
 region: plivoNumber.region,
 monthly_rental_rate: plivoNumber.monthly_rental_rate,
 sms_enabled: plivoNumber.sms_enabled,
 sms_rate: plivoNumber.sms_rate,
 voice_enabled: plivoNumber.voice_enabled,
 voice_rate: plivoNumber.voice_rate,
 fromPlivo: true
 };
 if (index + 1 == response.objects.length) {
 callback(null, newTollfreeNumbers);
 }
 });
 } else {
 console.log('Oops! Something went wrong.');
 console.log('Status:', status);
 console.log('Response:', response);
 callback(true, newFixedNumbers);
 }
 });
 }
 },
 function (err, result) {
 //console.log(455, result)
 var resData = {};
 ringToNumber.find({'assigned_to': {$nin: [req.user._id]}, 'created_by': req.user.parent_id._id, 'is_deleted': false}).populate('zipcode').exec(function (err, campaign) {
 if (err) {
 console.log(err);
 resData['local'] = result.fixed;
 resData['tollfree'] = result.tollfree;
 callback({'code': config.constant.CODES.notFound, "err": err, data: resData, "message": config.constant.MESSAGES.Error});
 } else {
 if (!isEmptyObject(campaign)) {
 resData = _.groupBy(campaign, function (Data) {
 return Data.provider_type;
 })
 console.log(123, resData);
 
 if (!resData.local) {
 resData['local'] = [];
 }
 resData['local'] = _.union(resData['local'], result.fixed);
 
 if (!resData.tollfree) {
 resData['tollfree'] = [];
 }
 resData['tollfree'] = _.union(resData['tollfree'], result.tollfree);
 
 callback({'code': config.constant.CODES.OK, "data": resData, "message": config.constant.MESSAGES.notFound});
 } else {
 resData['local'] = result.fixed;
 resData['tollfree'] = result.tollfree;
 callback({'code': config.constant.CODES.notFound, "data": resData, "message": config.constant.MESSAGES.Success});
 }
 }
 });
 })
 }
 module.exports.getRingToNumber = getRingToNumber;
 */


/* @function : getRingToNumber
 *  @created  : 24092015
 *  @modified :
 *  @purpose  :
 */
var getRingToNumber = function (req, res, callback) {

    var webPhoneDetails = (req.user.role_id.code == 'LGN') ? req.user.webphone_details : req.user.parent_id.webphone_details;
//    var webPhoneDetails = {
//        "app_id": "30041966820983067",
//        "provider": "plivo",
//        "username": "MAOGRINTE5YTM5Y2U5NM",
//        "password": "YmY0NDQ1MDAxYmIwNTZjY2RhNDI0NmM5MWY3NjRm"
//    }
//    var webPhoneDetails = {
//        "app_id": "AP828bd2907a7f43398a86d21472bbb877",
//        "provider": "twilio",
//        "username": "AC30ea915f45a5b377afe709dba1b9ad49",
//        "password": "570a49181b435d09806dc91e8245b539"
//    }

    switch (webPhoneDetails.provider) {
        case 'plivo':
            var plivoApi = plivo.RestAPI({
                authId: webPhoneDetails.username,
                authToken: webPhoneDetails.password
            });

            var params = {
                country_iso: 'US',
                type: 'fixed',
                limit: 9
            };
            break;
        case 'twilio':
            var twilioApi = new twilio(webPhoneDetails.username, webPhoneDetails.password);

            var twilioParams = {
                voiceEnabled: "true",
                smsEnabled: "true",
            };
            break;
    }

    var newFixedNumbers = [];
    var newTollfreeNumbers = [];

    async.parallel({
        fixed: function (callback) {
            switch (webPhoneDetails.provider) {
                case 'plivo':
                    plivoApi.search_phone_numbers(params, function (status, response) {
                        if (status >= 200 && status < 300) {
                            console.log('Successfully made call request.');
                            //console.log('Response:', response);
                            response.objects.forEach(function (plivoNumber, index) {
                                newFixedNumbers[index] = {
                                    _id: plivoNumber.number,
                                    type: (plivoNumber.type == 'fixed') ? 'local' : plivoNumber.type,
                                    phone_no: plivoNumber.number,
                                    region: plivoNumber.region,
                                    monthly_rental_rate: plivoNumber.monthly_rental_rate,
                                    sms_enabled: plivoNumber.sms_enabled,
                                    sms_rate: plivoNumber.sms_rate,
                                    voice_enabled: plivoNumber.voice_enabled,
                                    voice_rate: plivoNumber.voice_rate,
                                    fromPlivo: true
                                };
                                if (index + 1 == response.objects.length) {
                                    callback(null, newFixedNumbers);
                                }
                            });
                        } else {
                            console.log('Oops! Something went wrong.');
                            console.log('Status:', status);
                            console.log('Response:', response);
                            callback(true, newFixedNumbers);
                        }
                    });
                    break;
                case 'twilio':
                    twilioApi.availablePhoneNumbers("US").local.list(twilioParams, function (err, response) {
                        if (err) {
                            console.log('Oops! Something went wrong.');
                            console.log('Status:', err);
                            console.log('Response:', response);
                            callback(true, newFixedNumbers);
                        } else {
                            console.log('Successfully made call request.');
                            //console.log('Response:', response);
                            response.availablePhoneNumbers.forEach(function (twilioNumber, index) {
                                if (index < 9) {
                                    newFixedNumbers[index] = {
                                        _id: twilioNumber.phone_number,
                                        type: 'local',
                                        phone_no: twilioNumber.phone_number,
                                        region: twilioNumber.region,
                                        capabilities: twilioNumber.capabilities,
                                        //monthly_rental_rate: twilioNumber.monthly_rental_rate,
                                        //sms_enabled: twilioNumber.sms_enabled,
                                        //sms_rate: twilioNumber.sms_rate,
                                        //voice_enabled: twilioNumber.voice_enabled,
                                        //voice_rate: twilioNumber.voice_rate,
                                        fromTwilio: true
                                    };
                                }
                                if (index + 1 == response.availablePhoneNumbers.length) {
                                    callback(null, newFixedNumbers);
                                }
                            });
                        }
                    });
                    break;
                default:
                    callback(null, []);
                    break;
            }
        },
        tollfree: function (callback) {
            switch (webPhoneDetails.provider) {
                case 'plivo':
                    params['type'] = 'tollfree';
                    plivoApi.search_phone_numbers(params, function (status, response) {
                        if (status >= 200 && status < 300) {
                            console.log('Successfully made call request.');
                            //console.log('Response:', response);
                            response.objects.forEach(function (plivoNumber, index) {
                                newTollfreeNumbers[index] = {
                                    _id: plivoNumber.number,
                                    type: (plivoNumber.type == 'fixed') ? 'local' : plivoNumber.type,
                                    phone_no: plivoNumber.number,
                                    region: plivoNumber.region,
                                    monthly_rental_rate: plivoNumber.monthly_rental_rate,
                                    sms_enabled: plivoNumber.sms_enabled,
                                    sms_rate: plivoNumber.sms_rate,
                                    voice_enabled: plivoNumber.voice_enabled,
                                    voice_rate: plivoNumber.voice_rate,
                                    fromPlivo: true
                                };
                                if (index + 1 == response.objects.length) {
                                    callback(null, newTollfreeNumbers);
                                }
                            });
                        } else {
                            console.log('Oops! Something went wrong.');
                            console.log('Status:', status);
                            console.log('Response:', response);
                            callback(true, newTollfreeNumbers);
                        }
                    });
                    break;
                case 'twilio':
                    twilioApi.availablePhoneNumbers("US").tollFree.list(twilioParams, function (err, response) {
                        if (err) {
                            console.log('Oops! Something went wrong.');
                            console.log('Status:', err);
                            console.log('Response:', response);
                            callback(true, newTollfreeNumbers);
                        } else {
                            console.log('Successfully made call request.');
                            //console.log('Response:', response);
                            response.availablePhoneNumbers.forEach(function (twilioNumber, index) {
                                if (index < 9) {
                                    newTollfreeNumbers[index] = {
                                        _id: twilioNumber.phone_number,
                                        type: 'tollfree',
                                        phone_no: twilioNumber.phone_number,
                                        region: twilioNumber.region,
                                        capabilities: twilioNumber.capabilities,
                                        //monthly_rental_rate: twilioNumber.monthly_rental_rate,
                                        //sms_enabled: twilioNumber.sms_enabled,
                                        //sms_rate: twilioNumber.sms_rate,
                                        //voice_enabled: twilioNumber.voice_enabled,
                                        //voice_rate: twilioNumber.voice_rate,
                                        fromTwilio: true
                                    };
                                }
                                if (index + 1 == response.availablePhoneNumbers.length) {
                                    callback(null, newTollfreeNumbers);
                                }
                            });
                        }
                    });
                    break;
                default:
                    callback(null, []);
                    break;
            }
        }
    },
    function (err, result) {
        var resData = {};
        ringToNumber.find({'assigned_to': {$nin: [req.user._id]}, 'created_by': req.user.parent_id._id, 'is_deleted': false}).populate('zipcode').exec(function (err, campaign) {
            if (err) {
                console.log(err);
                resData['local'] = result.fixed;
                resData['tollfree'] = result.tollfree;
                callback({'code': config.constant.CODES.notFound, "err": err, data: resData, "message": config.constant.MESSAGES.Error});
            } else {
                if (!isEmptyObject(campaign)) {
                    resData = _.groupBy(campaign, function (Data) {
                        return Data.provider_type;
                    })

                    resData['local'] = result.fixed;
                    resData['tollfree'] = result.tollfree;

                    callback({'code': config.constant.CODES.OK, "data": resData, "message": config.constant.MESSAGES.notFound});
                } else {
                    resData['local'] = result.fixed;
                    resData['tollfree'] = result.tollfree;
                    callback({'code': config.constant.CODES.notFound, "data": resData, "message": config.constant.MESSAGES.Success});
                }
            }
        });
    })
}
module.exports.getRingToNumber = getRingToNumber;


/* @function : getNewRingToNumber
 *  @created  : 24092015
 *  @modified :
 *  @purpose  :
 */
var getNewRingToNumber = function (req, res) {

    var areaCode = req.query.areaCode;

    var webPhoneDetails = (req.user.role_id.code == 'LGN') ? req.user.webphone_details : req.user.parent_id.webphone_details;
//    var webPhoneDetails = {
//        "app_id": "30041966820983067",
//        "provider": "plivo",
//        "username": "MAOGRINTE5YTM5Y2U5NM",
//        "password": "YmY0NDQ1MDAxYmIwNTZjY2RhNDI0NmM5MWY3NjRm"
//    }
//    var webPhoneDetails = {
//        "app_id": "AP828bd2907a7f43398a86d21472bbb877",
//        "provider": "twilio",
//        "username": "AC30ea915f45a5b377afe709dba1b9ad49",
//        "password": "570a49181b435d09806dc91e8245b539"
//    }

    var newFixedNumbers = [];

    switch (webPhoneDetails.provider) {
        case 'plivo':
            var plivoApi = plivo.RestAPI({
                authId: webPhoneDetails.username,
                authToken: webPhoneDetails.password
            });

            var params = {
                country_iso: 'US',
                type: 'fixed',
                limit: 9
            };


            if (areaCode) {
                params['pattern'] = areaCode;
            }

            plivoApi.search_phone_numbers(params, function (status, response) {
                if (status >= 200 && status < 300) {
                    console.log('Successfully made call request.');
                    //console.log('Response:', response);
                    response.objects.forEach(function (plivoNumber, index) {
                        newFixedNumbers[index] = {
                            _id: plivoNumber.number,
                            type: (plivoNumber.type == 'fixed') ? 'local' : plivoNumber.type,
                            phone_no: plivoNumber.number,
                            region: plivoNumber.region,
                            monthly_rental_rate: plivoNumber.monthly_rental_rate,
                            sms_enabled: plivoNumber.sms_enabled,
                            sms_rate: plivoNumber.sms_rate,
                            voice_enabled: plivoNumber.voice_enabled,
                            voice_rate: plivoNumber.voice_rate,
                            fromPlivo: true
                        };
                        if (index + 1 == response.objects.length) {
                            res.json({code: config.constant.CODES.OK, data: newFixedNumbers});
                        }
                    });

                    if (isEmptyObject(response.objects)) {
                        res.json({code: config.constant.CODES.notFound, message: config.constant.MESSAGES.Error, plivoResponse: response});
                    }
                } else {
                    console.log('Oops! Something went wrong.');
                    console.log('Status:', status);
                    console.log('Response:', response);
                    res.json({code: config.constant.CODES.Error, message: config.constant.MESSAGES.Error, plivoResponse: response});
                }
            });
            break;
        case 'twilio':
            var twilioApi = new twilio(webPhoneDetails.username, webPhoneDetails.password);

            var twilioParams = {
                voiceEnabled: "true",
                smsEnabled: "true",
            };

            if (areaCode) {
                twilioParams['areaCode'] = areaCode;
            }

            twilioApi.availablePhoneNumbers("US").local.list(twilioParams, function (err, response) {
                if (err) {
                    console.log('Oops! Something went wrong.');
                    console.log('Status:', err);
                    console.log('Response:', response);
                    res.json({code: config.constant.CODES.Error, message: config.constant.MESSAGES.Error, plivoResponse: response});
                } else {
                    console.log('Successfully made call request.');
                    //console.log('Response:', response);
                    response.availablePhoneNumbers.forEach(function (twilioNumber, index) {
                        if (index < 9) {
                            newFixedNumbers[index] = {
                                _id: twilioNumber.phone_number,
                                type: 'local',
                                phone_no: twilioNumber.phone_number,
                                region: twilioNumber.region,
                                capabilities: twilioNumber.capabilities,
                                //monthly_rental_rate: twilioNumber.monthly_rental_rate,
                                //sms_enabled: twilioNumber.sms_enabled,
                                //sms_rate: twilioNumber.sms_rate,
                                //voice_enabled: twilioNumber.voice_enabled,
                                //voice_rate: twilioNumber.voice_rate,
                                fromTwilio: true
                            };
                        }
                        if (index + 1 == response.availablePhoneNumbers.length) {
                            res.json({code: config.constant.CODES.OK, data: newFixedNumbers});
                        }
                    });

                    if (isEmptyObject(response.availablePhoneNumbers)) {
                        res.json({code: config.constant.CODES.notFound, message: config.constant.MESSAGES.Error, plivoResponse: response});
                    }
                }
            });
            break;
    }
}
module.exports.getNewRingToNumber = getNewRingToNumber;


/* @function : campaignDetailsForNumber
 *  @created  : 24092015
 *  @modified :
 *  @purpose  :
 */
//var campaignDetailsForNumber = function (req, res, callback) {
//    ringToNumber.findOne({'phone_no': req.body.phone, 'is_deleted': false}).populate('zipcode').exec(function (err, phonedata) {
//        if (err) {
//            callback({'code': config.constant.CODES.notFound, "data": null, "message": config.constant.MESSAGES.Error});
//        } else {
//
//            if (isEmptyObject(phonedata)) {
//                callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.notFound});
//            } else {
//
//                var ph_no = phonedata._id.toString();
//                var type = phonedata.provider_type;
//
//                user_profile.find({$or: [{'campaigns.ringToNumbers.vanity': ph_no}, {'campaigns.ringToNumbers.tollfree': ph_no}, {'campaigns.ringToNumbers.local': ph_no}]}).populate('user_id').populate('campaigns.offer_id').exec(function (err, users) {
//                    if (err) {
//                        callback({'code': config.constant.CODES.notFound, "data": null, "message": config.constant.MESSAGES.Error});
//                    } else {
//
//                        users.forEach(function (user) {
//                            var data = _.find(user.campaigns, function (d) {
//                                return d.ringToNumbers[type] == ph_no;
//                            });
//                            if (data) {
//                                user.campaigns = data;
//                            }
//                        })
//
//                        if (!isEmptyObject(users)) {
//                            callback({'code': config.constant.CODES.OK, "data": users, "message": config.constant.MESSAGES.Success});
//                        } else {
//                            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.notFound});
//                        }
//                    }
//                });
//            }
//        }
//    });
//
//}
//module.exports.campaignDetailsForNumber = campaignDetailsForNumber;


/* @function : campaignDetailsForNumber
 *  @created  : 24092015
 *  @modified :
 *  @purpose  :
 */
var campaignDetailsForNumber = function (req, res, callback) {
    console.log('req.body.phone', req.body.phone);
    console.log('callFromNumber', req.body.callFromNumber);

    var forAreaCode = req.body.callFromNumber.replace('+', '');
    var areaCode = forAreaCode.toString().substring(1, 4);

    zipcode.findOne({'AreaCode': areaCode}, function (err, callerZipData) {
        console.log('callerZipData', callerZipData);

        ringToNumber.findOne({'phone_no': req.body.phone, 'is_deleted': false})
                .populate('zipcode')
                .exec(function (err, phonedata) {
                    if (err) {
                        console.log('ringToNumErr', err)
                        //callback(err, {});
                        callback({});
                    } else {

                        if (isEmptyObject(phonedata)) {
                            console.log('emptyPhData', err)
                            //callback(null, {'errMsg': "Phone Data not found"});
                            callback({'errMsg': "Phone Data not found"});
                        } else {

                            console.log('phonedata', phonedata);

                            var ph_no = phonedata._id.toString();
                            var type = phonedata.provider_type;

                            user_profile.find({$or: [{'campaigns.ringToNumbers.vanity': ph_no}, {'campaigns.ringToNumbers.tollfree': ph_no}, {'campaigns.ringToNumbers.local': ph_no}]}).populate('user_id').populate('campaigns.offer_id').exec(function (err, users) {
                                if (err) {
                                    console.log('userProfileErr', err)
                                    //callback(err, {});
                                    callback({});
                                } else {
                                    users.forEach(function (user) {
                                        var data = _.find(user.campaigns, function (d) {
                                            return d.ringToNumbers[type] == ph_no;
                                        });
                                        if (data) {
                                            user.campaigns = data;
                                        }
                                    });

                                    console.log('camp user', users);

                                    var campaignData = {};
                                    if (!isEmptyObject(users)) {
                                        campaignData = users[0].campaigns[0];
                                    } else {
                                        //Campaign Data not found
                                    }

                                    var ringToNumId = ph_no;

                                    var inboundCond = {};
                                    if (campaignData.offer_id) {//for Inbound Trunk attached to an offer
                                        var offerId = campaignData.offer_id._id;
                                        inboundCond = {offer_id: offerId, status: true};
                                    } else if (ringToNumId) { //for Inbound Trunk attached to a number
                                        inboundCond = {ring_to_number_id: ringToNumId, status: true};
                                    }

                                    console.log('inboundCond', inboundCond);

                                    inboundTrunkModel.findOne(inboundCond)
                                            .populate('agent_script')
                                            .exec(function (err, inboundData) {
                                                console.log('inboundData', inboundData)
                                                if (err) {
                                                    console.log('inbound Err', err);
                                                    callback({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error});
                                                } else if (!isEmptyObject(inboundData)) {
                                                    callback({'code': config.constant.CODES.OK, zipData: callerZipData, campaignData: campaignData, inboundData: inboundData.agent_script, "message": config.constant.MESSAGES.Success});
                                                } else {
                                                    callback({'code': config.constant.CODES.OK, zipData: callerZipData, "message": config.constant.MESSAGES.notFound});
                                                }
                                            });
                                }
                            });
                        }
                    }
                });
    });
}
module.exports.campaignDetailsForNumber = campaignDetailsForNumber;

var campaignDetailsForNumber_twilio = function (req, res, callback) {

    userModel.findOne({_id: req.user.parent_id._id})
            .populate('parent_id')
            .exec(function (err, advccData) {
                if (err || isEmptyObject(advccData)) {
                    console.log('user modal Err', err);
                    return callback({code: config.constant.CODES.Error, message: config.constant.MESSAGES.Error, resp: 'user Err'});
                } else {
                    var webPhoneDetails = (advccData.parent_id && advccData.parent_id.webphone_details) ? advccData.parent_id.webphone_details : {};
//                    var webPhoneDetails = {
//                        "app_id": "AP828bd2907a7f43398a86d21472bbb877",
//                        "provider": "twilio",
//                        "username": "AC30ea915f45a5b377afe709dba1b9ad49",
//                        "password": "570a49181b435d09806dc91e8245b539"
//                    }

                    var twilioApi = new twilio(webPhoneDetails.username, webPhoneDetails.password);

                    var CallSid = req.body.CallSid;
                    twilioApi.calls(CallSid).get(function (err, call) {
                        console.log(call.forwarded_from);
                        console.log(call.parent_call_sid);

                        req.body['phone'] = call.forwarded_from;  //for campaign
                        req.body['callFromNumber'] = req.body.callFromNumber; //for lat long

                        campaignDetailsForNumber(req, res, function (response) {
                            callback(response);
                        })

                    });
                }
            });
}
module.exports.campaignDetailsForNumber_twilio = campaignDetailsForNumber_twilio;


/* @function : campaignDetailsForCallHistory (No Routes For This)
 *  @created  : 24092015
 *  @modified :
 *  @purpose  :
 */
var campaignDetailsForCallHistory = function (req, res, callback) {
    ringToNumber.findOne({'phone_no': req.body.phone, 'is_deleted': false}).exec(function (err, phonedata) {
        if (err) {
            callback(err, {});
        } else {

            if (isEmptyObject(phonedata)) {
                callback(null, {'errMsg': "Phone Data not found", nonPsxPhone: true});
            } else {

                var ph_no = phonedata._id.toString();
                var type = phonedata.provider_type;

                console.log('phonedata', phonedata);

                user_profile.find({$or: [{'campaigns.ringToNumbers.vanity': ph_no}, {'campaigns.ringToNumbers.tollfree': ph_no}, {'campaigns.ringToNumbers.local': ph_no}]})
                        .populate('user_id')
                        .populate('campaigns.offer_id')
                        .exec(function (err, users) {
                            if (err) {
                                callback(err, {});
                            } else {
                                users.forEach(function (user) {
                                    var data = _.find(user.campaigns, function (d) {
                                        return d.ringToNumbers[type] == ph_no;
                                    });
                                    if (data) {
                                        user.campaigns = data;
                                    }
                                });

                                console.log('camp user', users);

                                if (!isEmptyObject(users)) {
                                    callback(null, users[0].campaigns[0], phonedata.ivr_associated);
                                } else {
                                    callback(null, {'errMsg': "Campaign Data not found"}, phonedata.ivr_associated, ph_no); //sending ph_no only for ADVCC inbound trunk tracking
                                }
                            }
                        });
            }
        }
    });

}
module.exports.campaignDetailsForCallHistory = campaignDetailsForCallHistory;

/* @function : listCampaignForAdmin
 *  @created  : 23072015
 *  @modified :
 *  @purpose  : list campaigns in the admin login
 */

var listCampaignForAdmin = function (req, res, callback) {
    var curDate = moment().toISOString();
    var ToDate = moment().subtract(30, 'day').toISOString();
    callModel.find({
        'isdeleted': false,
        'StartTime': {'$lte': curDate, '$gte': ToDate}
    },
    {campaignData: 1})
            .exec(function (err, campaign) {
                if (err) {
                    console.log("System Error (listingCampaign) : " + err);
                    callback({'code': config.constant.CODES.notFound, "data": null, "message": config.constant.MESSAGES.Error});
                } else {
                    if (isEmptyObject(campaign)) {
                        callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.notFound});
                    } else {
                        var catData_groups = _.groupBy(campaign, function (value) {
                            return value.campaignData.campaign_name;
                        });
                        callback({'code': config.constant.CODES.OK, "data": catData_groups, "message": config.constant.MESSAGES.Success});
                    }
                }
            });
}
module.exports.listCampaignForAdmin = listCampaignForAdmin;


var findCampaign = function (req, res, callback) {

    var campaignId = req.params.id;
    user_profile.find({'campaigns._id': campaignId}, {'campaigns.$': 1}).populate('user_id').populate('campaigns.offer_id').exec(function (err, users) {
        if (err) {
            callback({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error});
        } else {
            if (isEmptyObject(users)) {
                callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.notFound});
            } else {
                callback({'code': config.constant.CODES.OK, "data": users[0].campaigns[0], "message": config.constant.MESSAGES.Success});
            }
        }
    });

}
module.exports.findCampaign = findCampaign;