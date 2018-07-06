var config = require('../../config/constant');
var randtoken = require('rand-token');
var bCrypt = require('bcrypt-nodejs');
var User = require('../models/user.js');
var callModel = require('../models/callHistories');
var user_profile = require('../models/user_profile.js');
var callerDetails = require('../models/callerDetail.js');
var sendMail = require('../controllers/send_mail.js'); // included controller for sending mail operations
var contact = require('../controllers/contact.js'); // included controller for sending sms operations
var contact_agenda = require('../models/contact_agenda.js');
var messageModel = require('../models/message_history');
var mongoose = require('mongoose'); // Added to convert string to ObjectId
var CryptoJS = require('crypto-js');
var _ = require('underscore');
var jwt = require('jsonwebtoken');

/* @function : isEmptyObject
 *  @Creator  :
 *  @created  : 15022016
 */

var isEmptyObject = function (obj) {
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
}


/* @function : login
 *  @created  : 15022016
 *  @modified :
 *  @purpose  : App Login Api
 */
var login = function (req, next) {

    var tokenString = req.headers['email'] + '' + req.headers['timestamp'];

    var generatedToken = jwt.sign({tokenString: tokenString}, config.constant.RESTFUL_API.SecretKey);
    console.log('generatedToken', generatedToken);

    /* Currently using default HMAC SHA256 encryption method */
    jwt.verify(req.headers['token'], config.constant.RESTFUL_API.SecretKey, function (err, decoded) {

        if (err) {
            next({'result': config.constant.CODES.Error, 'message': config.constant.MESSAGES.Error});
        } else {
            /* Token Based Authentication */
            if (decoded.tokenString == tokenString) {

                User.findOne({'email': req.headers['email']}).populate('role_id').populate('parent_id').exec(function (err, userData) {

                    if (err) {
                        next({'result': config.constant.CODES.notFound, 'message': config.constant.MESSAGES.Error});
                    } else {
                        if (isEmptyObject(userData)) {
                            next({'result': config.constant.CODES.notFound, 'message': config.constant.MESSAGES.notFound});
                        } else {
                            if (isValidPassword(userData, req.headers['password'])) {
                                var userDetails = {
                                    user_id: userData._id,
                                    parent_id: userData.parent_id._id,
                                    role_id: {
                                        _id: userData.role_id._id,
                                        code: userData.role_id.code
                                    }
                                };
                                next({'result': config.constant.CODES.OK, 'userData': userDetails, 'message': config.constant.MESSAGES.Success});
                            } else {
                                next({'result': config.constant.CODES.notFound, 'message': config.constant.MESSAGES.notFound});
                            }
                        }
                    }
                });
            } else {
                next({'result': config.constant.CODES.Error, 'message': config.constant.MESSAGES.unAuthorizeAccess});
            }
        }
    });
}
module.exports.login = login;


/* @function    : callHistoryByDate
 *  @created    : 15092015
 *  @modified   :
 *  @purpose    : list call History By Date
 */
var callDataList = function (req, next) {

    var tokenString = req.headers['user_id'] + '' + req.headers['timestamp'];
    var generatedToken = jwt.sign({tokenString: tokenString}, config.constant.RESTFUL_API.SecretKey);

    console.log('generatedToken', generatedToken);

    jwt.verify(req.headers['token'], config.constant.RESTFUL_API.SecretKey, function (err, decoded) {

        if (err) {
            next({'result': config.constant.CODES.Error, 'message': config.constant.MESSAGES.Error});
        } else {
            /* Token Based Authentication */
            if (decoded.tokenString == tokenString) {

                // Date function data
                var user_id = mongoose.Types.ObjectId(req.headers['user_id']); // converted User id from String to ObjectId

//                var FromDate = new Date();
//                var FromDate = new Date(); // Today!
//                var ToDate = new Date();
//                ToDate.setDate(FromDate.getDate() - 7);

                var FromToDate = {'$gte': new Date(req.body.fromDate), '$lte': new Date(req.body.toDate)};

                console.log('FromDate', req.body.fromDate);
                console.log('toDate', req.body.toDate);
                console.log('FromToDate', FromToDate);


//                var FromToDate = {'$gte': FromDate, '$lte': ToDate};
                var cond = {'isdeleted': {'$ne': true}, created: FromToDate};

                //Conditions to check the User specific Records
                switch (req.body.role_code) {
                    case 'LB':
                        cond['campaignData.offer_id.user_id'] = user_id;
                        break;
                    case 'LG':
                        cond['campaignData.created_by'] = user_id;
                        break;
                    case 'LGN':
                        cond['campaignData.offer_id.parent_lgn'] = user_id;
                        break;
                    case 'ADVCC':
                        cond['campaignData.offer_id.user_id'] = user_id;
                        break;
                }

                /*if (req.headers['categoryName']) {
                 var CatName = req.headers['categoryName'];
                 cond['campaignData.offer_id.vertical_category_details.category_name'] = CatName;
                 }*/

                callModel.find(cond, function (err, foundData) {
                    if (err) {
                        next({'result': config.constant.CODES.Error, 'message': config.constant.MESSAGES.Error});
                    } else {
                        //used to get category data with unique count for graph Start
//                        var catDataGroups = _.groupBy(foundData, function (catValue) {
//                            if (catValue.campaignData) {
//                                if (catValue.campaignData.offer_id) {
//                                    var valCat = catValue.campaignData.offer_id.vertical_category_details;
//                                    if (valCat) {
//                                        return catValue.campaignData.offer_id.vertical_category_details.category_name;
//                                    }
//                                }
//                            }
//                        });
//                        var catDataByDate = [];
//                        Object.keys(catDataGroups).forEach(function (key) {
//                            if (key && key != 'undefined') {
//                                catDataByDate.push({Category: key, count: catDataGroups[key].length})
//                            }
//                        });
//                        //used to get category data with unique count for graph End
//                        callback({code: 200, callListData: foundData, CategoryGraphData: catDataByDate});

                        console.log('foundDataLength', foundData.length);
                        var callsTakenToday = foundData.length;
                        var averageTalkTime = 0;
                        var averageQueueWaitTime = 0;
                        var totalDuration = 0;

                        var callStartTime = 0;
                        var CallAnswerTime = 0;
                        var totalSeconds = 0;
                        var seconds = 0;

                        _.each(_.toArray(foundData), function (file, index) {
                            totalDuration = parseInt(totalDuration) + parseInt(file.Duration);
                            // Calculating time differnce between Call start time and Answer time Start
                            callStartTime = new Date(file.StartTime);
                            CallAnswerTime = new Date(file.AnswerTime);
                            if (callStartTime && callStartTime != null && CallAnswerTime && CallAnswerTime != null) {
                                var differenceTravel = CallAnswerTime.getTime() - callStartTime.getTime();
                                var seconds = Math.floor(differenceTravel / 1000);

                            } else {
                                var seconds = 0;
                            }
                            totalSeconds = Math.round(parseInt(totalSeconds) + parseInt(seconds));
                        });

                        averageTalkTime = Math.round(totalDuration / callsTakenToday);
                        averageQueueWaitTime = Math.round(totalSeconds / callsTakenToday);

                        var callDetails = {callsTakenToday: callsTakenToday, averageTalkTime: averageTalkTime, averageQueueWaitTime: averageQueueWaitTime, callsInQueue: 'We will get it later!!'};
                        next({code: 200, callListData: callDetails});
                    }
                });
            } else {
                next({'result': config.constant.CODES.Error, 'message': config.constant.MESSAGES.unAuthorizeAccess});
            }
        }
    });
};

exports.callDataList = callDataList;

/* @function : getWebLeadScriptData
 *  @created  : 15032016
 *  @modified :
 *  @purpose  : Get script data for api input
 */
var getWebLeadScriptData = function (req, next) {

    var campaign_id = req.body.campaign_token;

    user_profile.find({'campaigns._id': campaign_id}, {'campaigns.$': 1}).populate('user_id').populate('campaigns.offer_id').exec(function (err, users) {

        if (err) {
            console.log('err', err);
        } else {
            if (isEmptyObject(users)) {
                next({'result': config.constant.CODES.OK, 'message': "This campaign does not have any web lead associated with it."});
            } else {
                var scriptDetails = [];
                var scriptDataLength = users[0].campaigns[0].offer_id.web_affiliate.scriptData.length;

                _.each(users[0].campaigns[0].offer_id.web_affiliate.scriptData, function (scriptData, index) {
                    scriptDetails.push({"label": scriptData.label, "component": scriptData.component, "index": scriptData.index});

                    if (scriptDataLength == index + 1) {
                        next({'result': config.constant.CODES.OK, 'scriptDetails': scriptDetails, 'message': config.constant.MESSAGES.Success});
                    }
                });
            }
        }
    });
}
module.exports.getWebLeadScriptData = getWebLeadScriptData;


/* @function : createWebLead
 *  @created  : 16032016
 *  @modified :
 *  @purpose  : Create web lead
 */
var createWebLead = function (req, callback) {

    var encryptedCampaignId = req.body.campaignToken;
    var encryptedUserId = req.body.userToken;
    var authToken = req.body.authToken;
    var webLeadData = req.body.webLeadDetails;

    var decryptedCampaignId = CryptoJS.AES.decrypt(encryptedCampaignId, "campaignTokenForWebLeadApi");
    var campaignId = CryptoJS.enc.Utf8.stringify(decryptedCampaignId);

    var decryptedUserId = CryptoJS.AES.decrypt(encryptedUserId, "userIdForWebLeadApi");
    var userId = CryptoJS.enc.Utf8.stringify(decryptedUserId);

    /* Authentication */
    User.findOne({'_id': userId}, function (err, userDetails) {
        if (err) {
            callback({'result': config.constant.CODES.Error, 'message': err.message});
        } else {
            if (isEmptyObject(userDetails)) {
                callback({'result': config.constant.CODES.notFound, 'message': 'Not such user exists'});
            } else {
                if (userDetails.status == 'active') {
                    if (authToken == userDetails.webApi_token) {

                        /* To check if campaign exists */
                        user_profile.find({'campaigns._id': campaignId}, {'campaigns.$': 1}).populate('user_id').populate('campaigns.offer_id').exec(function (err, users) {

                            if (err) {
                                callback({'result': config.constant.CODES.Error, 'message': err.message});
                            } else {
                                if (isEmptyObject(users)) {
                                    callback({'result': config.constant.CODES.notFound, 'message': "No such campaign exists."});
                                } else {

                                    /* Loop to search if email field exists or not */
                                    var reqBodyLength = webLeadData.length;
                                    var reqBodyCounter = 0;
                                    var emailFound = false;
                                    _.find(webLeadData, function (webLeadDetails) {
                                        reqBodyCounter++;

                                        if (webLeadDetails.component == 'email') {
                                            emailFound = true;
                                            var emailId = webLeadDetails.value;

                                            if (emailId) {
                                                callerDetails.findOne({'webLeadDetails.email': emailId, 'webLeadDetails.campaignData._id': mongoose.Types.ObjectId(campaignId), 'is_deleted': false}, function (err, data) {
                                                    if (err) {
                                                        callback({'status': config.constant.CODES.Error, 'message': 'Some error has been occured. Please try again later.'});
                                                    } else {
                                                        if (isEmptyObject(data)) {

                                                            var scriptData = users[0].campaigns[0].offer_id.web_affiliate.scriptData;
                                                            var validationFlg = false;
                                                            var scriptNotExistsCounter = 0;
                                                            var valueKeyNotExistsCounter = 0;
                                                            var isPhoneNumber = false;
                                                            var phone = {'number': ''};
                                                            var bodyLength = users[0].campaigns[0].offer_id.web_affiliate.scriptData.length;
                                                            var loopCounter = 0;
                                                            var webLeadInfo = {};

                                                            _.find(webLeadData, function (weblead) {
                                                                //console.log('weblead', weblead);

                                                                var ifScriptDataExists = false;

                                                                /* Check if value key parameter is present */
                                                                if (!('value' in weblead)) {
                                                                    valueKeyNotExistsCounter++;
                                                                }

                                                                /* Check is phone number present to send SMS */
                                                                if (webLeadDetails.component == 'phonenumber') {
                                                                    isPhoneNumber = true;
                                                                    phone.number = weblead.value;
                                                                }

                                                                /* Validated the html input fields with the script created at the time of offer creation */
                                                                scriptData.forEach(function (scriptItem) {
                                                                    if ((weblead.label == scriptItem.label) && (weblead.index == scriptItem.index)) {
                                                                        if ((scriptItem.required == true) && weblead.value == '') {
                                                                            validationFlg = true;
                                                                        }
                                                                        ifScriptDataExists = true;
                                                                        webLeadInfo[weblead.label + "_pqry_" + weblead.component + "_pqry_" + weblead.index] = weblead.value ? weblead.value : '';
                                                                    }
                                                                });

                                                                if (!ifScriptDataExists) {
                                                                    scriptNotExistsCounter++;
                                                                }
                                                                loopCounter++;

                                                                if ((bodyLength == loopCounter) && ifScriptDataExists && (scriptNotExistsCounter == 0) && (valueKeyNotExistsCounter == 0) && !validationFlg) {

                                                                    var webLead = {};
                                                                    webLead.isWebLead = 'true';
                                                                    webLead.webLeadDetails = {email: emailId, parent_lgn: users[0].campaigns[0].parent_lgn, webLeadInfo: webLeadInfo, campaignData: users[0].campaigns[0]};
                                                                    var webLeadData = new callerDetails(webLead);

                                                                    webLeadData.save(function (err, data) {
                                                                        if (err) {
                                                                            callback({'status': config.constant.CODES.Error, 'message': 'Some error has been occured. Please try again later.'});
                                                                        } else {
                                                                            /* Send sms/email to web lead */
                                                                            contact_agenda.findOne({offer_id: users[0].campaigns[0].offer_id._id, 'is_deleted': false})
                                                                                    .sort({created: -1})
                                                                                    .exec(function (err, agendaDetails) {
                                                                                        if (err) {
                                                                                            callback({'status': config.constant.CODES.OK, 'message': 'Lead has been added successfully!', 'redirectUrl': users[0].campaigns[0].web_affiliate_redirect_url});
                                                                                        } else {
                                                                                            if (isEmptyObject(agendaDetails)) {
                                                                                                callback({'status': config.constant.CODES.OK, 'message': 'Lead has been added successfully!', 'redirectUrl': users[0].campaigns[0].web_affiliate_redirect_url});
                                                                                            } else {
                                                                                                if (agendaDetails.mode == 'SMS') { //send SMS on successful lead creation

                                                                                                    if (isPhoneNumber && phone.number != '') {

                                                                                                        if (phone.number.charAt(0) == '1') {
                                                                                                            phone.number = phone.number;
                                                                                                        } else if (phone.number.charAt(0) == '+') {
                                                                                                            phone.number = phone.number.substring(1);
                                                                                                        } else {
                                                                                                            phone.number = '1' + phone.number;
                                                                                                        }

                                                                                                        contact.sendMultiSMS(agendaDetails.message, agendaDetails.sms_header, phone.number, users[0].campaigns[0].created_by, function (smsData) {
                                                                                                            if (smsData.code == config.constant.CODES.OK) {
                                                                                                                var smsHistory = {};
                                                                                                                smsHistory.from = agendaDetails.sms_header;
                                                                                                                smsHistory.to = phone.number;
                                                                                                                smsHistory.mode = 'SMS';
                                                                                                                smsHistory.description = agendaDetails.description;
                                                                                                                smsHistory.status = 'Sent';
                                                                                                                smsHistory.message_uuid = smsData.response.message_uuid;
                                                                                                                smsHistory.api_id = smsData.response.api_id;
                                                                                                                smsHistory.text = agendaDetails.message;
                                                                                                                smsHistory.isWebLead = true;
                                                                                                                var smsHistoryDetails = new messageModel(smsHistory);
                                                                                                                smsHistoryDetails.save(function (err, data) {
                                                                                                                    callback({'status': config.constant.CODES.OK, 'message': 'Lead has been added successfully!', 'redirectUrl': users[0].campaigns[0].web_affiliate_redirect_url});
                                                                                                                });
                                                                                                            } else {
                                                                                                                var smsHistory = {};
                                                                                                                smsHistory.from = agendaDetails.sms_header;
                                                                                                                smsHistory.to = phone.number;
                                                                                                                smsHistory.mode = 'SMS';
                                                                                                                smsHistory.description = agendaDetails.description;
                                                                                                                smsHistory.status = 'Failed';
                                                                                                                smsHistory.api_id = smsData.response.api_id;
                                                                                                                smsHistory.error_msg = smsData.response.error;
                                                                                                                smsHistory.text = agendaDetails.message;
                                                                                                                smsHistory.isWebLead = true;
                                                                                                                var smsHistoryDetails = new messageModel(smsHistory);
                                                                                                                smsHistoryDetails.save(function (err, data) {
                                                                                                                    callback({'status': config.constant.CODES.OK, 'message': 'Lead has been added successfully!', 'redirectUrl': users[0].campaigns[0].web_affiliate_redirect_url});
                                                                                                                });
                                                                                                            }
                                                                                                        });
                                                                                                    } else {
                                                                                                        callback({'status': config.constant.CODES.OK, 'message': 'Lead has been added successfully!', 'redirectUrl': users[0].campaigns[0].web_affiliate_redirect_url});
                                                                                                    }
                                                                                                } else if (agendaDetails.mode == 'Email') {
                                                                                                    var emailArr = [];
                                                                                                    emailArr.push({email: emailId});
                                                                                                    sendMail.sendMailToContacts(agendaDetails.message, agendaDetails.subject, emailArr, function () {
                                                                                                        var emailData = {};
                                                                                                        emailData.from = '';
                                                                                                        emailData.to = emailId;
                                                                                                        emailData.mode = 'Email';
                                                                                                        emailData.description = agendaDetails.description;
                                                                                                        emailData.status = 'Sent';
                                                                                                        emailData.text = agendaDetails.message;
                                                                                                        emailData.subject = agendaDetails.subject;
                                                                                                        emailData.isWebLead = true;
                                                                                                        var emailHistoryDetails = new messageModel(emailData);
                                                                                                        emailHistoryDetails.save(function (err, data) {
                                                                                                            callback({'status': config.constant.CODES.OK, 'message': 'Lead has been added successfully!', 'redirectUrl': users[0].campaigns[0].web_affiliate_redirect_url});
                                                                                                        });
                                                                                                    });
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    });
                                                                            //callback({'status': 200, 'message': 'Congratulations! You have been added as a lead for this campaign.', 'redirectUrl': users[0].campaigns[0].web_affiliate_redirect_url});
                                                                        }
                                                                    });
                                                                } else if ((bodyLength == loopCounter) && scriptNotExistsCounter > 0) {
                                                                    callback({'status': config.constant.CODES.BadRequest, "message": 'Script validation failed. Someone might has changed the original script.'});
                                                                } else if ((bodyLength == loopCounter) && valueKeyNotExistsCounter > 0) {
                                                                    callback({'status': config.constant.CODES.BadRequest, "message": 'Value parameter(s) are missing. Please provide proper request parameters for creating lead.'});
                                                                } else if ((bodyLength == loopCounter) && validationFlg) {
                                                                    callback({'status': config.constant.CODES.BadRequest, 'message': 'Mandatory information is not provided. Please fill the mandatory data.'});
                                                                }
                                                            });
                                                        } else {
                                                            callback({'status': 200, "message": 'You are already a lead for this campaign.'});
                                                        }
                                                    }
                                                });
                                            } else {
                                                callback({'status': config.constant.CODES.BadRequest, "message": 'Email address is mandatory for creating a lead. Please provide your email address.'});
                                            }
                                        }

                                        if (reqBodyLength == reqBodyCounter && !emailFound) {
                                            console.log('Else');
                                            callback({'status': config.constant.CODES.BadRequest, "message": 'We did not receive a mandatory email field from your script. Please provide email address. '});
                                        }
                                    });
                                }
                            }
                        });
                    } else {
                        callback({'result': config.constant.CODES.Unauthorized, 'message': 'Please provide valid auth token to access this api.'});
                    }
                } else {
                    callback({'result': config.constant.CODES.Forbidden, 'message': 'This user is not an active user. User should be active to access this api.'});
                }
            }
        }
    });
}
module.exports.createWebLead = createWebLead;


/* @function : webLead
 *  @created  : 11032016
 *  @modified :
 *  @purpose  : App Login Api
 */
var webLead = function (req, next) {

    console.log(req.body);

    console.log('phoneNumber', req.body.phonenumber);

    if (req.body.phonenumber) {
        console.log('IN');
    } else {
        console.log('Else');
    }
    _.find(req.body, function (value, key) {
        console.log(key, "----", value);
    });
}
module.exports.webLead = webLead;





// compare the crypt value
var isValidPassword = function (user, password) {
    return bCrypt.compareSync(password, user.password);
}
