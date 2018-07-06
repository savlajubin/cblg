var config = require('../../config/constant.js'); // constants
var IVR = require('../models/ivr.js'); // to manupulate ivr operations
var LsOffer = require('../controllers/LsOffer');
var InboundTrunk = require('../models/inbound_trunk');
var async = require('async');
var plivo = require('plivo');
var twilio = require('twilio');
var campaignCtrl = require('../controllers/campaign.js');
var ringToNumber = require('../models/ringToNumber');
var _ = require("underscore");

/* @function : isEmptyObject
 *  @Creator  :
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

/* @function : submitIVRdata
 *  @created  : 29102015
 *  @modified :
 *  @purpose  : Save ivr data of user
 */
var submitIVRdata = function (req, res, callback) {
    req.body.created_by = req.user._id;
    if (req.body._id) {
        var ivrid = req.body._id;
        delete req.body._id;
        IVR.update({_id: ivrid}, {$set: req.body}, function (err, data) {
            if (err) {
                console.log("error", err);
                callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
            } else {
                callback({'code': config.constant.CODES.OK, data: data, "message": config.constant.MESSAGES.updateSuccess});
            }
        })
    } else {
        new IVR(req.body).save(function (err, data) {
            if (err) {
                console.log("error", err);
                callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
            } else {
                callback({'code': config.constant.CODES.OK, data: data, "message": config.constant.MESSAGES.saveSuccess});
            }
        });
    }
};
exports.submitIVRdata = submitIVRdata;

/* @function : listIvr
 *  @created  : 29102015
 *  @modified :
 *  @purpose  : list all ivr of user
 */
var listIvr = function (req, res, callback) {
    IVR.find({created_by: req.user._id, is_deleted: {'$ne': true}}, function (err, ivrs) {
        if (err) {
            console.log("ivr error", err);
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
        } else {
            InboundTrunk.find({created_by: req.user._id, is_deleted: {'$ne': true}}, function (err, ibs) {

                var ivrIds = [];
                _.each(ivrs, function (ivrData) {
                    ivrIds.push(ivrData._id);
                });

                ringToNumber.find({'ivr_associated.ivr_id': {$in: ivrIds}}, function (err, ringToNumberData) {
                    if (err) {
                        console.log("ib error", err);
                        callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                    } else {
                        callback({'code': config.constant.CODES.OK, ivrs: ivrs, ibs: ibs, ringToNumberData: ringToNumberData, "message": config.constant.MESSAGES.Success});
                    }
                })


            }).populate('ring_to_number_id');
        }
    });

};
exports.listIvr = listIvr;

/* @function : getIvrById
 *  @created  : 29102015
 *  @modified :
 *  @purpose  : Get ivr details by id
 */
var getIvrById = function (req, res, callback) {
    var model = req.body.type;
    if (model == 'IVR') {
        IVR.findOne({_id: req.body.id, is_deleted: {'$ne': true}}, function (err, data) {
            if (err) {
                console.log("error", err);
                callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
            } else {
                callback({'code': config.constant.CODES.OK, data: data, "message": config.constant.MESSAGES.Success});
            }
        });
    } else if (model == 'Inbound Trunk') {
        InboundTrunk.findOne({_id: req.body.id, is_deleted: {'$ne': true}}, function (err, data) {
            if (err) {
                console.log("error", err);
                callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
            } else {
                callback({'code': config.constant.CODES.OK, data: data, "message": config.constant.MESSAGES.Success});
            }
        });
    }

};
exports.getIvrById = getIvrById;

/* @function : deleteIvr
 *  @created  : 29102015
 *  @modified :
 *  @purpose  : delete ivr of user
 */
var deleteIvr = function (req, res, callback) {
    var model = req.body.type;
    if (model == 'IVR') {
        IVR.update({'_id': req.body.id}, {$set: {"is_deleted": true}}, function (err, data) {
            if (err) {
                console.log("error", err);
                callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
            } else {
                listIvr(req, res, function (response) {
                    callback({'code': config.constant.CODES.OK, ivrs: response.ivrs, ibs: response.ibs, "message": "Deleted successfully."});
                });
            }
        });
    } else if (model == 'Inbound Trunk') {
        InboundTrunk.update({'_id': req.body.id}, {$set: {"is_deleted": true}}, function (err, data) {
            if (err) {
                console.log("error", err);
                callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
            } else {
                listIvr(req, res, function (response) {
                    callback({'code': config.constant.CODES.OK, ivrs: response.ivrs, ibs: response.ibs, "message": "Deleted successfully."});
                });
            }
        });
    }
};
exports.deleteIvr = deleteIvr;

/* @function : changeIvrStatus
 *  @created  : 29102015
 *  @modified :
 *  @purpose  : change ivr  status of user
 */
var changeIvrStatus = function (req, res, callback) {
    var changedStatus = req.body.status;
    var changingtype = req.body.type;
    console.log(req.body, changedStatus, changingtype);
    //for updation of ivr status in ivr database
    if (req.body.type == 'IVR') {
        IVR.update({'_id': req.body.id}, {$set: {"ivr_status": changedStatus}}, function (err, data) {
            if (err) {
                console.log("error", err);
                callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
            } else {
                listIvr(req, res, function (response) {
                    callback({'code': config.constant.CODES.OK, "data": response.data, "message": config.constant.MESSAGES.statusSuccess});
                });
            }
        });
    }
    //for updation of cc_status in concurrent call database
    else if (req.body.type == 'Inbound Trunk') {
        InboundTrunk.update({'_id': req.body.id}, {$set: {"status": changedStatus}}, function (err, data) {
            if (err) {
                console.log("error", err);
                callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
            } else {
                listIvr(req, res, function (response) {
                    callback({'code': config.constant.CODES.OK, "data": response.data, "message": config.constant.MESSAGES.statusSuccess});
                });
            }
        });
    }
};
exports.changeIvrStatus = changeIvrStatus;


/* @function : assignPhnoToIvr
 *  @created  : 30102015
 *  @modified :
 *  @purpose  : Save concurrent_call data of user
 */
var assignPhnoToIvr = function (req, res, callback) {
    console.log('Controller');
    console.log(req.body);
    ringToNumber.update({_id: req.body.phone_id}, {$set: {ivr_associated: req.body.ivr}}, function (err, data) {
        if (err) {
            console.log("error", err);
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
        } else {
            callback({'code': config.constant.CODES.OK, data: data, "message": config.constant.MESSAGES.Success});
        }
    });
};
exports.assignPhnoToIvr = assignPhnoToIvr;

/* @function : submitInboundTrunk
 *  @created  : 18122015
 *  @modified :
 *  @purpose  : Save ADVCC Inbound Trunk
 */
var submitInboundTrunk = function (req, res, callback) {
    console.log('Controller');
    console.log(req.body);

    var webPhoneDetails = (req.user.role_id.code == 'LGN') ? req.user.webphone_details : req.user.parent_id.webphone_details;
    console.log('webPhoneDetails',webPhoneDetails);
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

console.log(1)

    var insertData = req.body;

console.log(2)
    async.parallel({
        fixed: function (callback) {
            console.log(3)
            if (webPhoneDetails && webPhoneDetails.provider == 'plivo' && req.body.association == 'phone' && req.body.phone_no && req.body.phone_no.fromPlivo) {
                console.log(4)
                var params = {
                    number: req.body.phone_no.phone_no,
                    app_id: webPhoneDetails.app_id
                };
                console.log(5)
                plivoApi.buy_phone_number(params, function (status, response) {
                    //var status = 200;
                    if (status >= 200 && status < 300) {
                        campaignCtrl.saveToRingToNumber(req, res, req.body.phone_no, function (err, result) {
                            callback(err, result);
                        });
                    } else {
                        console.log('Oops! Something went wrong.');
                        console.log('Status:', status);
                        console.log('Response:', response);
                        callback(true, null);
                    }
                });
            } else if (webPhoneDetails && webPhoneDetails.provider == 'twilio' && req.body.association == 'phone' && req.body.phone_no && req.body.phone_no.fromTwilio) {
                console.log(6)
                twilioApi.incomingPhoneNumbers.create({
                    phoneNumber: req.body.phone_no.phone_no,
                    voiceApplicationSid: webPhoneDetails.app_id,
                    smsApplicationSid: webPhoneDetails.app_id
                }, function (err, purchasedNumber) {
                    console.log(7)
                    //var err = null;
                    //purchasedNumber={sid:'dummy'}
                    if (err) {
                        console.log('Oops! Something went wrong.');
                        console.log('Status:', err);
                        console.log('Response:', purchasedNumber);
                        callback(true, null);
                    } else {
                        console.log(8)
                        console.log(purchasedNumber);
                        req.body.phone_no['tw_number_sid'] = purchasedNumber.sid;
                        campaignCtrl.saveToRingToNumber(req, res, req.body.phone_no, function (err, result) {
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
            console.log('asyncParallelErr', err);
            callback({'result': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error})
        } else {
            insertData.created_by = req.user._id;

            if (req.body.association == 'phone') {
                insertData.ring_to_number_id = !isEmptyObject(result.fixed) ? result.fixed._id : req.body.phone_no._id;
            }

            if (req.body._id) {
                var ibid = req.body._id;
                delete req.body._id;
                InboundTrunk.update({_id: ibid}, {$set: insertData}, function (err, data) {
                    if (err) {
                        console.log("error", err);
                        callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                    } else {
                        callback({'code': config.constant.CODES.OK, data: data, "message": config.constant.MESSAGES.updateSuccess});
                    }
                })
            } else {
                new InboundTrunk(insertData).save(function (err, data) {
                    if (err) {
                        console.log("error", err);
                        callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                    } else {
                        callback({'code': config.constant.CODES.OK, data: data, "message": config.constant.MESSAGES.saveSuccess});
                    }
                });
            }
        }
    })
};

exports.submitInboundTrunk = submitInboundTrunk;

