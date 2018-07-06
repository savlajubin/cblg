/*Controller for dealing with  offers in LS section*/
var config = require('../../config/constant.js'); // constants
var Offer = require('../models/offer');
var user_profile = require('../models/user_profile');
var ringToNumber = require('../models/ringToNumber');
var callModel = require('../models/callHistories');
var inviteModel = require('../models/invite');
var mails = require('../controllers/send_mail.js'); // included controller for sending mail operations
var _ = require("underscore");
var mongoose = require("mongoose");
var plivo = require('plivo');
var twilio = require('twilio');


var isEmptyObject = function (obj) {
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
}

/* @function : listAlloffersByLB
 *  @author  : B2
 *  @created  : 18092015
 *  @modified :
 *  @purpose  : To get list of all availabel offers
 */

var listAlloffersByLB = function (req, res, callback) {

    var conditions = {};
    if (req.user.role_id.code == 'ADVCC' || req.user.role_id.code == 'LB') {
        conditions = {'active_status': true, 'user_id': req.user._id, 'parent_lgn': req.user.parent_id._id, 'is_deleted': {'$ne': 'true'}};
    } else {
        conditions = {'active_status': true, 'parent_lgn': req.user.parent_id._id, 'is_deleted': {'$ne': 'true'}};
        //conditions = {'active_status': true, 'user_id' : req.user._id, 'is_deleted': {'$ne': 'true'}};
    }

    Offer.find(conditions).populate('user_id').exec(function (err, response) {
        if (err) {
            console.log(err)
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
        } else {
//            console.log('response',response);
//            var dataSet = [];
//            response.forEach(function (result) {
//                if (req.user && req.user.parent_id && result.user_id && result.user_id.parent_id == '' + req.user.parent_id._id) {
//                    dataSet.push(result);
//                }
//            })
//            callback({'code': config.constant.CODES.OK, 'data': dataSet, "message": config.constant.MESSAGES.Success});
            callback({'code': config.constant.CODES.OK, 'data': response, "message": config.constant.MESSAGES.Success});
        }
    });
}
exports.listAlloffersByLB = listAlloffersByLB;


/*  @function : acceptanceRequestOffer
 *  @author   : B2
 *  @created  : 18092015
 *  @modified :
 *  @purpose  : request to availabel offers
 */

var acceptanceRequestOffer = function (req, res, callback) {
    offerRequest.findOne({'offer_id': req.body.offer_id, 'send_from': req.user._id, 'is_deleted': false}, function (err, data) {
        if (err) {
            console.log(err);
            callback({'code': config.constant.CODES.notFound});
        } else {
            req.body.send_from = req.user._id;
            if (isEmptyObject(data)) {
                offerRequest(req.body).save(function (err, data) {
                    if (err) {
                        console.log(err);
                        callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
                    } else {
                        callback({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.requestSuccess});
                    }
                });
            } else {
                callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.alreadyRequested});
            }
        }
    });
}
exports.acceptanceRequestOffer = acceptanceRequestOffer;



/* @function : listApprovedOfferLS
 *  @author  : B2
 *  @created  : 18092015
 *  @modified :
 *  @purpose  :List approved offer request
 */

var listApprovedOfferLS = function (req, res, callback) {

    offerRequest.find({'send_from': req.user._id, acceptance: true, is_deleted: false}).populate('offer_id').exec(function (err, response) {
        if (err) {
            console.log(err)
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
        } else {
            callback({'code': config.constant.CODES.OK, 'data': response, "message": config.constant.MESSAGES.Success});
        }
    });

}
exports.listApprovedOfferLS = listApprovedOfferLS;


/* @function : list_currentCampaigns
 *  @author  : B2
 *  @created  : 22092015
 *  @modified :
 *  @purpose  :List current campaigns
 */

var list_currentCampaigns = function (req, res, callback) {

    var cond;
    if (req.user.role_id.code != 'LG') {
        cond = {'user_id': req.user._id};
    } else {
        cond = {'user_id': req.user._id};
    }

    user_profile.find(cond, {user_id: 1, campaigns: 1})
            .populate('user_id')
            .populate('campaigns.offer_id')
            .populate('campaigns.ringToNumbers.tollfree')
            .populate('campaigns.ringToNumbers.local')
            .populate('campaigns.ringToNumbers.vanity')
            .exec(function (err, response) {
                if (err) {
                    console.log(err)
                    callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
                } else {
                    console.log(response)
                    callback({'code': config.constant.CODES.OK, 'data': response, "message": config.constant.MESSAGES.Success});
                }
            });

}
exports.list_currentCampaigns = list_currentCampaigns;


/* @function : listPhoneNumber
 *  @author  : B3
 *  @created  : 23092015
 *  @modified :
 *  @purpose  :List Phone Number request
 */
var listPhoneNumber = function (req, res, callback) {
    var createdById = (req.user.role_id.code == 'LGN') ? req.user._id : req.user.parent_id._id;
    //var assignedTo = req.user._id;//(req.user.role_id.code == 'LGN') ? req.user._id : req.user.parent_id._id;
    var assignedTo = (req.user.role_id.code == 'LGN') ? {} : {'assigned_to': req.user._id};

    ringToNumber.find({$and: [assignedTo, {'created_by': createdById, 'is_deleted': false}]}).populate('ivr_associated.ivr_id').exec(function (err, phoneNumbers) {
        if (err) {
            console.log(err);
            callback({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error});
        } else {

            var phoneNumberIds = [];
            _.each(phoneNumbers, function (Data) {
                phoneNumberIds.push(Data._id);
            });
            console.log(1122, phoneNumberIds);
            callModel.aggregate(
                    [
                        {$project: {_id: 1, is_billable: 1, created: 1, 'campaignData.created_by': 1, 'campaignData.offer_id.vertical_category_details.category_name': 1, 'campaignData.offer_id.pay_per_call.lgamount': 1}},
                        //{$match: {$or: [{is_billable: true}, {isdeleted: false}]}},
                        {$match: {$or: [
                                    {'campaignData.ringToNumbers.local': {$in: phoneNumberIds}},
                                    {'campaignData.ringToNumbers.vanity': {$in: phoneNumberIds}},
                                    {'campaignData.ringToNumbers.tollfree': {$in: phoneNumberIds}}
                                ]
                            }
                        },
                        //{$group: {_id: '$campaignData.ringToNumbers.local'}}//, "lgamountSum": {$sum: "$campaignData.offer_id.pay_per_call.lgamount"}}},
                        //{$sort: {lgamountSum: -1}},
                        //{$limit: 10}
                    ], function (err, result) {
                console.log('call', result);
            });

            callback({'code': config.constant.CODES.OK, 'data': phoneNumbers, "message": config.constant.MESSAGES.Success});
        }
    });
}
exports.listPhoneNumber = listPhoneNumber;

/* @function : listPhoneNumber
 *  @author  : B3
 *  @created  : 23092015
 *  @modified :
 *  @purpose  :List Phone Number request
 */
var addPhoneNumber = function (req, res, callback) {
    req.body.created_by = req.user._id;
    ringToNumber.findOne({'_id': req.body._id}, function (err, data) {
        if (err)
        {
            console.log(err);
            callback({'code': config.constant.CODES.notFound})
        }
        else {

            if (isEmptyObject(data)) {
                new ringToNumber(
                        req.body
                        ).save(function (err, data) {
                    if (err)
                    {
                        console.log(err);
                        callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                    }
                    else
                    {
                        callback({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.requestSuccess});
                    }
                });
            }
            else {
                console.log('Heloo')
                delete req.body._id;
                req.body.modified = new Date();
                ringToNumber.update({_id: data._id}, {$set: req.body}, function (err, data) {
                    if (err)
                    {
                        console.log(err)
                        callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                    }
                    else
                    {

                        callback({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.updateSuccess, data: {offer_id: req.body.current_offer_id}});

                    }
                });
            }

        }
    })

}
exports.addPhoneNumber = addPhoneNumber;


/* @function : deletePhoneNumber
 *  @created  : 24092015
 *  @modified :
 *  @purpose  : delete the Phone Number from the system (true,false)
 */
var deletePhoneNumber = function (req, res, callback) {

    var webPhoneDetails = (req.user.role_id.code == 'LGN') ? req.user.webphone_details : req.user.parent_id.webphone_details;
//    var webPhoneDetails = {
//        "app_id": "30041966820983067",
//        "provider": "plivo",
//        "username": "MAOGRINTE5YTM5Y2U5NM",
//        "password": "YmY0NDQ1MDAxYmIwNTZjY2RhNDI0NmM5MWY3NjRm"
//    }

    if (webPhoneDetails && webPhoneDetails.provider == 'plivo') {
        var plivoApi = plivo.RestAPI({
            authId: webPhoneDetails.username,
            authToken: webPhoneDetails.password
        });
    } else if (webPhoneDetails && webPhoneDetails.provider == 'twilio') {
        var twilioApi = new twilio(webPhoneDetails.username, webPhoneDetails.password);
    }

    var params = {};

    var collection_phoneNumberArr = req.body._id; //[{id:'559b72302b8723dfd1e94db3'}];
    var coll_length = collection_phoneNumberArr.length;


    collection_phoneNumberArr.forEach(function (phones) {

        if (webPhoneDetails && webPhoneDetails.provider == 'plivo' && phones.numberProvider == 'plivo') {
            params = {number: phones.phoneNumber};
            plivoApi.unrent_number(params, function (status, response) {
                if (status >= 200 && status < 300) {
                    console.log('Successfully made call request.');
                    ringToNumber.update({_id: phones.id}, {$set: {'is_deleted': true, 'modified': Date.now()}}, function (err) {
                        if (err) {
                            callback({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error, dbErr: err, plivoResponse: response});
                        } else {
                            coll_length--;
                            if (coll_length == 0) {
                                listPhoneNumber(req, res, function (response) {
                                    callback({'code': config.constant.CODES.OK, "data": response.data, "message": config.constant.MESSAGES.deleteSuccess});
                                });
                            }
                        }
                    });
                } else {
                    callback({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error, plivoResponse: response});
                }
            });
        } else if (webPhoneDetails && webPhoneDetails.provider == 'twilio' && phones.numberProvider == 'twilio') {

            ringToNumber.findOne({_id: phones.id}, function (err, phoneDataFromDb) {
                if (err) {
                    callback({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error, dbErr: err, plivoResponse: response});
                } else {
                    var tw_number_sid = phoneDataFromDb.tw_number_sid;

                    twilioApi.incomingPhoneNumbers(tw_number_sid).delete(function (err, response) {
                        if (err) {
                            callback({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error, twilioResponse: response});
                        } else {
                            console.log('Successfully made call request.');
                            ringToNumber.update({_id: phones.id}, {$set: {'is_deleted': true, 'modified': Date.now()}}, function (err) {
                                if (err) {
                                    callback({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error, dbErr: err, plivoResponse: response});
                                } else {
                                    coll_length--;
                                    if (coll_length == 0) {
                                        listPhoneNumber(req, res, function (response) {
                                            callback({'code': config.constant.CODES.OK, "data": response.data, "message": config.constant.MESSAGES.deleteSuccess});
                                        });
                                    }
                                }
                            });
                        }
                    });
                }
            });
        } else {
            ringToNumber.update({_id: phones.id}, {$set: {'is_deleted': true, 'modified': Date.now()}}, function (err) {
                if (err) {
                    callback({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error, dbErr: err, plivoResponse: response});
                } else {
                    coll_length--;
                    if (coll_length == 0) {
                        listPhoneNumber(req, res, function (response) {
                            callback({'code': config.constant.CODES.OK, "data": response.data, "message": 'Number Deleted, but please delete the number from ' + phones.numberProvider + ' also'});
                        });
                    }
                }
            });
        }

    });
}
module.exports.deletePhoneNumber = deletePhoneNumber;


/* @function : findPhoneNumber
 *  @created  : 24092015
 *  @modified :
 *  @purpose  : find Phone Number in the system
 */
var findPhoneNumber = function (req, res, callback) {
    ringToNumber.findOne({'_id': req.params.id, 'is_deleted': false, 'created_by': req.user._id}).exec(function (err, phones) {
        if (err) {
            callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.Error});
        } else {
            if (isEmptyObject(phones)) {
                callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.Error});
            } else {
                callback({'code': config.constant.CODES.OK, "data": phones, "message": config.constant.MESSAGES.Success});
            }
        }
    });
}
module.exports.findPhoneNumber = findPhoneNumber;

/* @function : sendInvite
 *  @created  : 21012016
 *  @modified :
 *  @purpose  : Send invitation mail
 */
var sendInvite = function (req, res, callback) {
    console.log(req.body);
    req.body.parent_id = req.user.parent_id._id;
    var invite = {};
    invite.lgn_id = req.user.parent_id._id;
    invite.invited_by = req.user._id;
    invite.role = req.body.role;
    invite.role_id = req.body.role_id;
    invite.email = req.body.email;
    invite = new inviteModel(invite);
    invite.save(function (err, data) {
        if (err) {
            callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.Error});
        } else {
            mails.sendInviteMail(req, res, data, function (response) {
                callback(response);
            });
        }
    });

}
module.exports.sendInvite = sendInvite;