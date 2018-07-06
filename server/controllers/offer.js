/*Controller for creation of offers in LB section*/
var config = require('../../config/constant.js'); // constants
var fs = require('fs');
var formidable = require('formidable');
var Offer = require('../models/offer');
var OfferTemplate = require('../models/offer_template'); //To deal with offer_template collection data
var State = require('../models/state'); //To deal with state collection data
var user_profile = require('../models/user_profile'); //To deal with user_profile collection data
var _ = require("underscore");
/* @function : isEmptyObject
 *  @modified :
 *  @purpose  : To check empty data or not
 */
var isEmptyObject = function (obj) {
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
}


/* @function : saveCatVertInfo
 *  @author  : B2
 *  @created  : 14092015
 *  @modified :
 *  @purpose  : To store the vertical contract details
 */
var saveCatVertInfo = function (req, res, callback) {
    Offer.findOne({'_id': req.body.current_offer_id}, function (err, data) {
        if (err) {
            console.log(err);
            callback({'code': config.constant.CODES.notFound})
        } else {
            if (isEmptyObject(data)) {
                new Offer({
                    'user_id': req.user._id,
                    'parent_lgn': req.user.parent_id._id,
                    'vertical_category_details': req.body.vertical_category_details, // should be for LGN role id if admin create otherwise req.use.role_id._id
                    'created': new Date(),
                    'modified': new Date()
                }).save(function (err, data) {
                    if (err) {
                        if (err && err.code == 11000)
                            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.alreadyExist})
                        else
                            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                    } else {
                        callback({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.saveSuccess, data: {offer_id: data._id}});
                    }
                });
            } else {
                Offer.update({_id: data._id}, {$set: {
                        'vertical_category_details': req.body.vertical_category_details,
                        'modified': new Date()
                    }}, function (err, data) {
                    if (err) {
                        console.log(err)
                        callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                    } else {
                        callback({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.updateSuccess, data: {offer_id: req.body.current_offer_id}});
                    }
                });
            }
        }
    })
}
exports.saveCatVertInfo = saveCatVertInfo;
/* @function : submitpayPerCallInfo
 *  @author  : B2
 *  @created  : 14092015
 *  @modified :
 *  @purpose  : To store the pay per call details
 */
var submitpayPerCallInfo = function (req, res, callback) {
    Offer.findOne({'_id': req.body.current_offer_id}, function (err, data) {
        if (err) {
            console.log(err);
            callback({'code': config.constant.CODES.notFound})
        } else {
            if (isEmptyObject(data)) {
                new Offer({
                    'user_id': req.body.user_id,
                    'pay_per_call': req.body.pay_per_call, // should be for LGN role id if admin create otherwise req.use.role_id._id
                    'created': new Date(),
                    'modified': new Date()
                }).save(function (err, data) {
                    if (err) {
                        console.log(err);
                        callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                    } else {
                        callback({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.saveSuccess, data: {offer_id: data._id}});
                    }
                });
            } else {
                Offer.update({_id: data._id}, {$set: {
                        'pay_per_call': req.body.pay_per_call,
                        'modified': new Date()
                    }}, function (err, data) {
                    if (err) {
                        console.log(err)
                        callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                    } else {
                        callback({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.updateSuccess});
                    }
                });
            }
        }
    })
}
exports.submitpayPerCallInfo = submitpayPerCallInfo;
/* @function : saveWebAffiliateInfo
 *  @author  : 
 *  @created  : 19022016
 *  @modified :
 *  @purpose  : To store the pay per call details
 */
var saveWebAffiliateInfo = function (req, res, callback) {
    Offer.findOne({'_id': req.body.current_offer_id}, function (err, data) {
        if (err) {
            console.log(err);
            callback({'code': config.constant.CODES.notFound})
        } else {

            /* Web Affiliate */
            var webAffiliateData = {};
            webAffiliateData = req.body.webAffiliateformData;
            webAffiliateData['token'] = req.body.token;
            _.each(req.body.webAffiliateScript, function (scriptItem) {
                scriptItem['optionsArr'] = scriptItem['options'];
                delete scriptItem.options;
            });
            webAffiliateData['scriptData'] = req.body.webAffiliateScript;
            /* Web Affiliate Ends */

            if (isEmptyObject(data)) {
                new Offer({
                    'user_id': req.body.user_id,
                    'web_affiliate': webAffiliateData, // should be for LGN role id if admin create otherwise req.use.role_id._id
                    'created': new Date(),
                    'modified': new Date()
                }).save(function (err, data) {
                    if (err) {
                        console.log(err);
                        callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                    } else {
                        callback({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.saveSuccess, data: {offer_id: data._id}});
                    }
                });
            } else {
                Offer.update({_id: data._id}, {$set: {
                        'web_affiliate': webAffiliateData,
                        'modified': new Date()
                    }}, function (err, data) {
                    if (err) {
                        console.log(err)
                        callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                    } else {
                        callback({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.updateSuccess});
                    }
                });
            }
        }
    })
}
exports.saveWebAffiliateInfo = saveWebAffiliateInfo;
/* @function : savestateRestrictInfo
 *  @author  : B2
 *  @created  : 14092015
 *  @modified :
 *  @purpose  : To store the vertical contract details
 */
var savestateRestrictInfo = function (req, res, callback) {
    Offer.findOne({'_id': req.body.current_offer_id}, function (err, data) {
        if (err) {
            console.log(err);
            callback({'code': config.constant.CODES.notFound})
        } else {
            if (isEmptyObject(data)) {
                new Offer({
                    'user_id': req.body.user_id,
                    'state_restricted': req.body.state_restricted, // should be for LGN role id if admin create otherwise req.use.role_id._id
                    'created': new Date(),
                    'modified': new Date()
                }).save(function (err, data) {
                    if (err) {
                        console.log(err);
                        callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                    } else {
                        callback({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.saveSuccess, data: {offer_id: data._id}});
                    }
                });
            } else {
                Offer.update({_id: data._id}, {$set: {
                        'state_restricted': req.body.state_restricted,
                        'modified': new Date()
                    }}, function (err, data) {
                    if (err) {
                        console.log(err)
                        callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                    } else {
                        callback({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.updateSuccess});
                    }
                });
            }
        }
    })
}
exports.savestateRestrictInfo = savestateRestrictInfo;
/* @function : saveDurationInfo
 *  @author  : B2
 *  @created  : 15092015
 *  @modified :
 *  @purpose  : To store the duration tab details
 */
var saveDurationInfo = function (req, res, callback) {
    Offer.findOne({'_id': req.body.current_offer_id}, function (err, data) {
        if (err) {
            console.log(err);
            callback({'code': config.constant.CODES.notFound})
        } else {
            if (isEmptyObject(data)) {
                new Offer({
                    'user_id': req.user._id,
                    'duration': req.body.duration, // should be for LGN role id if admin create otherwise req.use.role_id._id
                    'created': new Date(),
                    'modified': new Date()
                }).save(function (err, data) {
                    if (err) {
                        console.log(err);
                        callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                    } else {
                        callback({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.saveSuccess, data: {offer_id: data._id}});
                    }
                });
            } else {
                Offer.update({_id: data._id}, {$set: {
                        'duration': req.body.duration,
                        'modified': new Date()
                    }}, function (err, data) {
                    if (err) {
                        console.log(err)
                        callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                    } else {
                        callback({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.updateSuccess});
                    }
                });
            }
        }
    })
}
exports.saveDurationInfo = saveDurationInfo;
/* @function : saveDailyCapInfo
 *  @author  : B2
 *  @created  : 15092015
 *  @modified :
 *  @purpose  : To store the daily cap tab details
 */
var saveDailyCapInfo = function (req, res, callback) {

    var form = new formidable.IncomingForm();
    form.uploadDir = "./public/assets/greeting_audio"; //set upload directory
    form.keepExtensions = true; //keep file extension
    var insertData = req.body;
    form.parse(req, function (err, fields, files) {
        var insertData = fields;
        if (!isEmptyObject(files)) {
            console.log('U here')
            insertData.value = files.file.path;
        }
    });
    Offer.findOne({'_id': req.body.current_offer_id}, function (err, data) {
        if (err) {
            console.log(err);
            callback({'code': config.constant.CODES.notFound})
        } else {

            if (isEmptyObject(data)) {
                new OfferTemplate({
                    'user_id': req.user._id,
                    'daily_caps': req.body.daily_caps, // should be for LGN role id if admin create otherwise req.use.role_id._id
                    'created': new Date(),
                    'modified': new Date()
                }).save(function (err, data) {
                    if (err) {
                        console.log(err);
                        callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                    } else {
                        callback({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.saveSuccess, data: {offer_id: data._id}});
                    }
                });
            }
            else {
                if (data && data.daily_caps && data.daily_caps.value && data.daily_caps.value != insertData.value)
                    fs.unlink(data.daily_caps.value, function (err) {
                        console.log('File deleted');
                    });
                console.log(req.body.daily_caps);
                console.log(data._id);
                console.log(req.body.daily_caps.call_cap);
                Offer.update({_id: data._id}, {$set: {
                        'daily_caps': req.body.daily_caps,
                        'process_status': data.process_status || true,
                        'active_status': true,
                        'modified': new Date()
                    }}, function (err, data) {
                    if (err) {
                        console.log(err)
                        callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                    } else {
                        callback({'code': config.constant.CODES.OK, "data": data.value, "message": config.constant.MESSAGES.updateSuccess});
                    }
                });
            }
        }
    })
    // });
}
exports.saveDailyCapInfo = saveDailyCapInfo;
/* @function : listOfferTemplate
 *  @author  : B2
 *  @created  : 15092015
 *  @modified :
 *  @purpose  : To retrieves all offer templates
 */

var listOfferTemplate = function (req, res, callback) {
    Offer.find({'is_deleted': {'$ne': 'true'}, user_id: req.user._id}).populate('user_id').exec(function (err, response) {
        if (err) {
            console.log(err)
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
        } else {
            callback({'code': config.constant.CODES.OK, 'data': response, "message": config.constant.MESSAGES.Success});
        }
    });
}
exports.listOfferTemplate = listOfferTemplate;
/* @function : listOriginalOfferTemplate
 *  @author  : B2
 *  @created  : 15092015
 *  @modified :
 *  @purpose  : To retrieves all offer templates
 */

var listOriginalOfferTemplate = function (req, res, callback) {
    OfferTemplate.find({'active_status': true, 'is_deleted': {'$ne': 'true'}}).populate('vertical_category_details.vertical_id').populate('vertical_category_details.category_id').exec(function (err, response) {
        if (err) {
            console.log(err)
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
        } else {
            callback({'code': config.constant.CODES.OK, 'data': response, "message": config.constant.MESSAGES.Success});
        }
    });
}
exports.listOriginalOfferTemplate = listOriginalOfferTemplate;
/* @function : getlistOfferTemplateByID
 *  @author  : B2
 *  @created  : 16092015
 *  @modified :
 *  @purpose  : To get details of offer template by ID
 */

var getlistOfferTemplateByID = function (req, res, callback) {
    Offer.findOne({'_id': req.body._id, 'is_deleted': {'$ne': 'true'}}).populate('vertical_category_details.vertical_id').populate('vertical_category_details.category_id').exec(function (err, response) {
        if (err) {
            console.log(err)
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
        } else {
            callback({'code': config.constant.CODES.OK, 'data': response, "message": config.constant.MESSAGES.Success});
        }
    });
}
exports.getlistOfferTemplateByID = getlistOfferTemplateByID;
/* @function : statusOfferTemplate
 *  @author  : B2
 *  @created  : 16092015
 *  @modified :
 *  @purpose  : To get details of offer template by ID
 */

var statusOfferTemplate = function (req, res, callback) {
    Offer.update({'_id': req.body._id, 'user_id': req.user._id}, {$set: {'active_status': !req.body.active_status}}, function (err, response) {
        if (err) {
            console.log(err)
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
        } else {
            listOfferTemplate(req, res, function (response) {
                callback({'code': config.constant.CODES.OK, "data": response.data, "message": config.constant.MESSAGES.statusSuccess});
            });
        }
    });
}
exports.statusOfferTemplate = statusOfferTemplate;
/* @function : deleteOfferTemplateByID
 *  @author  : B2
 *  @created  : 16092015
 *  @modified :
 *  @purpose  : To get details of offer template by ID
 */

var deleteOfferTemplateByID = function (req, res, callback) {
    user_profile.find({'campaigns.offer_id': req.body._id}).count().exec(function (err, response) {
        if (response == 0) {
            Offer.update({'_id': req.body._id, 'user_id': req.user._id}, {$set: {'is_deleted': true}}, function (err, response) {
                if (err) {
                    console.log(err)
                    callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
                } else {
                    listOfferTemplate(req, res, function (response) {
                        callback({'code': config.constant.CODES.OK, "data": response.data, "message": config.constant.MESSAGES.deleteSuccess});
                    });
                }
            });
        } else {
            callback({'code': config.constant.CODES.notFound, "message": "Error : Campaigns exist fot this offer."});
        }
    })
}
exports.deleteOfferTemplateByID = deleteOfferTemplateByID;
/* @function : getStatesList
 *  @author  : B2
 *  @created  : 16092015
 *  @modified :
 *  @purpose  : To get details of offer template by ID
 */

var getStatesList = function (req, res, callback) {
    State.find({}, function (err, response) {
        if (err) {
            console.log(err)
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
        } else {
            callback({'code': config.constant.CODES.OK, 'data': response, "message": config.constant.MESSAGES.Success});
        }
    });
}
exports.getStatesList = getStatesList;
/* @function : listActiveSellersForOffer
 *  @author  : B2
 *  @created  : 18092015
 *  @modified :
 *  @purpose  :To list offer used by respective seller
 */

var listActiveSellersForOffer = function (req, res, callback) {
    user_profile.find({'campaigns.offer_id': req.body.offer_id}, {'user_id': 1}).populate('user_id').exec(function (err, result) {
        if (err) {
            console.log(err)
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
        } else {
            var dataSet = [];
            result.forEach(function (record) {
                var name = record.user_id.first_name + " " + record.user_id.last_name;
                dataSet.push(name);
            })
            callback({'code': config.constant.CODES.OK, 'data': dataSet, "message": config.constant.MESSAGES.Success});
        }
    });
}
exports.listActiveSellersForOffer = listActiveSellersForOffer;
/* @function : getOffferDetailsByID
 *  @author  : B2
 *  @created  : 18092015
 *  @modified :
 *  @purpose  :To get offer details byh id
 */

var getOffferDetailsByID = function (req, res, callback) {
    Offer.findOne({'_id': req.body._id, 'is_deleted': {'$ne': 'true'}}).exec(function (err, response) {
        if (err) {
            console.log(err)
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
        } else {
            callback({'code': config.constant.CODES.OK, 'data': response, "message": config.constant.MESSAGES.Success});
        }
    });
}
exports.getOffferDetailsByID = getOffferDetailsByID;
/* @function : checkUnique
 *  @author  : B2
 *  @created  : 30092015
 *  @modified :
 *  @purpose  :To check unique title or not
 */

var checkUnique = function (req, res, callback) {
    if (!req.body.offerid) {
        Offer.find({'vertical_category_details.title': req.body.title, 'is_deleted': {'$ne': 'true'}}).populate('user_id').exec(function (err, response) {
            if (err) {
                console.log(err)
                callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
            } else {
                var response = _.each(response, function (Data) {
                    return Data.user_id.parent_id == req.user.parent_id;
                });
                if (response.length == 0) {
                    callback({'code': config.constant.CODES.OK, 'data': response, "message": config.constant.MESSAGES.valid});
                } else {
                    callback({'code': config.constant.CODES.notFound, 'data': response, "message": config.constant.MESSAGES.invalid});
                }
            }
        });
    } else {
        Offer.find({'vertical_category_details.title': req.body.title, '_id': {'$ne': req.body.offerid}, 'is_deleted': {'$ne': 'true'}}).populate('user_id').exec(function (err, response) {
            if (err) {
                console.log(err)
                callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
            } else {
                var response = _.each(response, function (Data) {
                    return Data.user_id.parent_id == req.user.parent_id;
                });
                if (response.length == 0) {
                    callback({'code': config.constant.CODES.OK, 'data': response, "message": config.constant.MESSAGES.valid});
                } else {
                    callback({'code': config.constant.CODES.notFound, 'data': response, "message": config.constant.MESSAGES.invalid});
                }
            }
        });
    }
}
exports.checkUnique = checkUnique;
/* @function : list_currentCampaignsLB
 *  @author  : B2
 *  @created  : 03112015
 *  @modified :
 *  @purpose  :List current campaigns for respective LB/Advcc
 */

var list_currentCampaignsLB = function (req, res, callback) {
    //console.log(req.user);

    Offer.find({'user_id': req.user._id, 'is_deleted': {'$ne': 'true'}}, {_id: 1}).exec(function (err, resp) {
        if (err) {
            console.log(err)
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
        } else {
            var offers = [];
            //console.log('offers',resp)
            _.each(resp, function (Data) {
                offers.push(Data._id.toString())
            });
            //console.log(offers);
            user_profile.find({'campaigns.offer_id': {$in: offers}}, {user_id: 1, campaigns: 1}).populate('user_id').populate('campaigns.offer_id').populate('campaigns.ringToNumbers.tollfree').populate('campaigns.ringToNumbers.local').populate('campaigns.ringToNumbers.vanity').exec(function (err, users) {
                if (err) {
                    console.log(err)
                    callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
                } else {
                    //console.log('user',users)
                    var user = _.each(users, function (Data) {
                        var responseData = _.filter(Data.campaigns, function (d) {
                            return d.offer_id != null && (offers.indexOf(d.offer_id._id.toString()) != -1);
                        });
                        if (responseData) {
                            Data.campaigns = responseData;
                            //console.log('asdfasdf', responseData)
                        }
                    });
                    callback({'code': config.constant.CODES.OK, 'data': user, "message": config.constant.MESSAGES.Success});
                }
            });
        }
    });
}
exports.list_currentCampaignsLB = list_currentCampaignsLB;
//status change for campaigns
var status_currentCampaignsLB = function (req, res, callback) {
    user_profile.findOne({'user_id': req.body.user_id}, function (err, data) {
        if (err) {
            console.log(err);
            res.jsonp({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
        } else {
            console.log('data', data);
            if (data) {
                var campaigns = _.each(data.campaigns, function (item) {
                    if (item._id == req.body.campaign_id) {
                        item.test_purpose = req.body.test_purpose;
                    }
                    return item;
                });
                console.log('campaigns', campaigns);
                user_profile.update({'user_id': req.body.user_id}, {$set: {'campaigns': campaigns}}, function (err, count) {
                    if (err) {
                        console.log(err);
                        res.jsonp({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
                    } else {
                        res.jsonp({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.Success});
                    }
                });
            }
        }
    });
}
exports.status_currentCampaignsLB = status_currentCampaignsLB;
/* @function : getLBOffersByCreated
 *  @author  : B2
 *  @created  : 25112015
 *  @modified :
 *  @purpose  :List Offers by Created date
 */

var getLBOffersByCreated = function (req, res, callback) {
    Offer.find({'user_id': req.user._id, 'is_deleted': {'$ne': 'true'}, 'created': {$gte: req.body.FromDate}, 'created':{$lte: req.body.ToDate}}).exec(function (err, offers) {
        if (err) {
            callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.Error});
        } else {
            if (isEmptyObject(offers)) {
                callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.notFound});
            } else {
                callback({'code': config.constant.CODES.OK, "data": offers, "message": config.constant.MESSAGES.Success});
            }
        }
    });
}
exports.getLBOffersByCreated = getLBOffersByCreated;
var listCampaignsForPAReg = function (req, res, callback) {

    Offer.find({'user_id': req.user._id, 'is_deleted': {'$ne': 'true'}}, {_id: 1}).exec(function (err, response) {
        if (err) {
            console.log(err)
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
        } else {
            var offers = [];
            //console.log('offers', response)
            var response = _.each(response, function (Data) {
                offers.push(Data._id)
            });
            user_profile.find({'campaigns.offer_id': {$in: offers}}, {user_id: 1, campaigns: 1}).populate('campaigns.ringToNumbers.tollfree').populate('campaigns.ringToNumbers.local').populate('campaigns.ringToNumbers.vanity').exec(function (err, users) {
                if (err) {
                    console.log(err)
                    callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
                } else {
                    //console.log('user', users)
                    var user = _.each(users, function (Data) {
                        var responseData = _.find(Data.campaigns, function (d) {
                            return d.offer_id != null;
                        });
                        if (responseData) {
                            Data.campaigns = responseData;
                            //console.log('asdfasdf', responseData)
                        }
                    });
                    callback({'code': config.constant.CODES.OK, 'data': user, "message": config.constant.MESSAGES.Success});
                }
            });
        }
    });
}
exports.listCampaignsForPAReg = listCampaignsForPAReg;
/* @function : saveMediaRestrictData
 *  @created  : 29012016
 *  @modified :
 *  @purpose  : To save media restricted for offer
 */
var saveMediaRestrictData = function (req, res, callback) {
    Offer.findOne({'_id': req.body.current_offer_id}, function (err, data) {
        if (err) {
            console.log(err);
            callback({'code': config.constant.CODES.notFound})
        } else {
            if (isEmptyObject(data)) {
                new Offer({
                    'user_id': req.body.user_id,
                    'media_restricted': req.body.media_restricted, // should be for LGN role id if admin create otherwise req.use.role_id._id
                    'created': new Date(),
                    'modified': new Date()
                }).save(function (err, data) {
                    if (err) {
                        console.log(err);
                        callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                    } else {
                        callback({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.saveSuccess, data: {offer_id: data._id}});
                    }
                });
            } else {
                Offer.update({_id: data._id}, {$set: {
                        'media_restricted': req.body.media_restricted,
                        'modified': new Date()
                    }}, function (err, data) {
                    if (err) {
                        console.log(err)
                        callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                    } else {
                        callback({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.updateSuccess});
                    }
                });
            }
        }
    })
}
exports.saveMediaRestrictData = saveMediaRestrictData;
/* @function : saveOfferHOO
 *  @created  : 15042016
 *  @modified :
 *  @purpose  : To save Offer HOO
 */
var saveOfferHOO = function (req, res, callback) {
    Offer.findOne({'_id': req.body.current_offer_id}, function (err, data) {
        if (err) {
            console.log(err);
            callback({'code': config.constant.CODES.notFound})
        } else {
            if (isEmptyObject(data)) {
                new Offer({
                    'user_id': req.body.user_id,
                    'hoo_schema': req.body.hoo_data,
                    'timezone': req.body.timezone,
                    'compose_message': req.body.compose_message_data,
                    'marketing_automation': req.body.marketing_automation,
                    'created': new Date(),
                    'modified': new Date()
                }).save(function (err, data) {
                    if (err) {
                        console.log(err);
                        callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                    } else {
                        callback({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.saveSuccess, data: {offer_id: data._id}});
                    }
                });
            } else {
                Offer.update({_id: data._id}, {$set: {
                        'hoo_schema': req.body.hoo_data,
                        'timezone': req.body.timezone,
                        'compose_message': req.body.compose_message_data,
                        'marketing_automation': req.body.marketing_automation,
                        'modified': new Date()
                    }}, function (err, data) {
                    if (err) {
                        console.log(err)
                        callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                    } else {
                        callback({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.updateSuccess});
                    }
                });
            }
        }
    })
}
exports.saveOfferHOO = saveOfferHOO;
/* @function : get_HOOdata
 *  @created  : 15042016
 *  @modified :
 *  @purpose  : To save Offer HOO
 */
var get_HOOdata = function (req, res, callback) {
    Offer.findOne({'_id': req.body.current_offer_id}, function (err, data) {
        if (err) {
            console.log(err);
            callback({'code': config.constant.CODES.notFound})
        } else {

            callback({'code': config.constant.CODES.OK, "data": data, "message": config.constant.MESSAGES.saveSuccess});
        }
    });
}
exports.get_HOOdata = get_HOOdata;


/* @function : saveComposeMessage
 *  @created  : 19042016
 *  @modified :
 *  @purpose  : To save Compose Message of offer
 */
var saveComposeMessage = function (req, res, callback) {
    Offer.findOne({'_id': req.body.current_offer_id}, function (err, data) {
        if (err) {
            console.log(err);
            callback({'code': config.constant.CODES.notFound})
        } else {
            if (isEmptyObject(data)) {
                new Offer({
                    'user_id': req.body.user_id,
                    'compose_message': req.body.compose_message_data,
                    'created': new Date(),
                    'modified': new Date()
                }).save(function (err, data) {
                    if (err) {
                        console.log(err);
                        callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                    } else {
                        callback({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.saveSuccess, data: {offer_id: data._id}});
                    }
                });
            } else {
                Offer.update({_id: data._id}, {$set: {
                        'compose_message': req.body.compose_message_data,
                        'modified': new Date()
                    }}, function (err, data) {
                    if (err) {
                        console.log(err)
                        callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                    } else {
                        callback({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.saveSuccess});
                    }
                });
            }
        }
    })
}
exports.saveComposeMessage = saveComposeMessage;