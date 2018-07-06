var config = require('../../config/constant.js'); // constants
var user_profile = require('../models/user_profile.js');
var callerDetails = require('../models/callerDetail.js');
var contact_agenda = require('../models/contact_agenda.js');
var sendMail = require('../controllers/send_mail.js'); // included controller for sending mail operations
var contact = require('../controllers/contact.js'); // included controller for sending sms operations
var messageModel = require('../models/message_history');
var formidable = require('formidable');
var _ = require("underscore");
var mongoose = require('mongoose');

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

/* @function : getWebLeadsCampaignDetails
 *  @created  : 1802016
 *  @modified :
 *  @purpose  : Get Campaign details for wb leads
 */
var getWebLeadsCampaignDetails = function (req, res, next) {
    var webAffiliateUrlToken = req.params.web_affiliate_url_token;
    userProfileModel.find({'campaigns.web_affiliate_url_token': webAffiliateUrlToken, 'campaigns.isdeleted': false}, function (err, data) {
        if (err) {
            next({'code': config.constant.CODES.notFound, "data": null, "message": config.constant.MESSAGES.Error});
        } else {
            if (isEmptyObject(data)) {
                next({'code': config.constant.CODES.notFound, "data": data, "message": config.constant.MESSAGES.notFound});
            } else {
                next({'code': config.constant.CODES.OK, "data": data, "message": config.constant.MESSAGES.Success});
            }
        }

    });
}
module.exports.getWebLeadsCampaignDetails = getWebLeadsCampaignDetails;
/* @function : createWebLead
 *  @created  : 25022016
 *  @modified :
 *  @purpose  : To create web lead through html
 */
var createWebLead = function (req, res, callback) {

    if (req.params.campaignId) { /* Now campaignId refers to webToken */

        /* To get campaign details and check if the campaign is associated with the provided token */
        user_profile.find({'campaigns.web_affiliate_url_token': req.params.campaignId}, {'campaigns.$': 1}).populate('user_id').populate('campaigns.offer_id').exec(function (err, users) {

            if (err) {
                callback({'status': config.constant.CODES.Error, 'message': 'Some error has been occured. Please try again later.'});
            } else {
                if (isEmptyObject(users)) {
                    callback({'status': config.constant.CODES.notFound, 'message': 'No campaign has been associated with this script yet!'});
                } else {

                    /* Loop to search if email field exists or not */
                    var reqBodyLength = Object.keys(req.body).length;
                    var reqBodyCounter = 0;
                    var emailFound = false;
                    _.find(req.body, function (value, key) {

                        reqBodyCounter++;
                        if (key.indexOf('_pqry_email_pqry_') > -1) {
                            emailFound = true;
                            var emailId = value;
                            if (emailId) {
                                //callerDetails.findOne({'webLeadDetails.email': emailId, 'webLeadDetails.campaignData._id': mongoose.Types.ObjectId(req.params.campaignId), 'is_deleted': false}, function (err, data) {
                                callerDetails.findOne({'webLeadDetails.email': emailId, 'webLeadDetails.campaignData.web_affiliate_url_token': req.params.campaignId, 'is_deleted': false}, function (err, data) {
                                    if (err) {
                                        callback({'status': config.constant.CODES.Error, 'message': 'Some error has been occured. Please try again later.'});
                                    } else {
                                        if (isEmptyObject(data)) {
                                            /* To get campaign details by id */

                                            //user_profile.find({'campaigns._id': mongoose.Types.ObjectId(req.params.campaignId)}, {'campaigns.$': 1}).populate('user_id').populate('campaigns.offer_id').exec(function (err, users) {
                                            //if (err) {
                                            //callback({'status': 500, 'message': 'Some error has been occured. Please try again later.'});
                                            //} else {
                                            console.log('campaignData', users[0].campaigns[0]);
                                            var scriptData = users[0].campaigns[0].offer_id.web_affiliate.scriptData;
                                            var bodyLength = Object.keys(req.body).length;
                                            var loopCounter = 0;
                                            /* To validate the html data if the original provided script is manipulated */
                                            var validationFlg = false;
                                            var scriptNotExistsCounter = 0;
                                            var isPhoneNumber = false;
                                            var phone = {'number': ''};
                                            _.find(req.body, function (value, key) {

                                                var ifScriptDataExists = false;
                                                var labelArr = key.split("_pqry_");                                                

                                                /* Check is phone number present to send SMS */
                                                if (labelArr[1] == 'phonenumber') {
                                                    isPhoneNumber = true;
                                                    phone.number = value;
                                                }

                                                /* Validated the html input fileds with the script created at the time of offer creation */
                                                scriptData.forEach(function (scriptItem) {
                                                    if ((labelArr[0] == scriptItem.label) && (labelArr[2] == scriptItem.index)) {
                                                        if ((scriptItem.required == true) && value == '') {
                                                            validationFlg = true;
                                                        }
                                                        ifScriptDataExists = true;
                                                    }
                                                });
                                                if (!ifScriptDataExists) {
                                                    scriptNotExistsCounter++;
                                                }

                                                loopCounter++;
                                                if ((bodyLength == loopCounter) && ifScriptDataExists && (scriptNotExistsCounter == 0) && !validationFlg) {

                                                    var webLead = {};
                                                    webLead.isWebLead = 'true';
                                                    webLead.webLeadDetails = {email: emailId, parent_lgn: users[0].campaigns[0].parent_lgn, webLeadInfo: req.body, campaignData: users[0].campaigns[0]};
                                                    var webLeadData = new callerDetails(webLead);
                                                    webLeadData.save(function (err, data) {
                                                        if (err) {
                                                            callback({'status': config.constant.CODES.Error, 'message': 'Some error has been occured. Please try again later.'});
                                                        } else {

                                                            contact_agenda.findOne({offer_id: users[0].campaigns[0].offer_id._id, 'is_deleted': false})
                                                                    .sort({created: -1})
                                                                    .exec(function (err, agendaDetails) {

                                                                        if (err) {
                                                                            //callback({'status': 500, 'message': 'Some error has been occured. Please try again later.'});
                                                                            callback({'status': config.constant.CODES.OK, 'message': 'Congratulations! You have been added as a lead for this campaign.', 'redirectUrl': users[0].campaigns[0].web_affiliate_redirect_url});
                                                                        } else {

                                                                            if (isEmptyObject(agendaDetails)) {
                                                                                callback({'status': config.constant.CODES.OK, 'message': 'Congratulations! You have been added as a lead for this campaign.', 'redirectUrl': users[0].campaigns[0].web_affiliate_redirect_url});
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
                                                                                                    /*if (err) {
                                                                                                     callback({'result': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error})
                                                                                                     } else {*/
                                                                                                    callback({'status': config.constant.CODES.OK, 'message': 'Congratulations! You have been added as a lead for this campaign.', 'redirectUrl': users[0].campaigns[0].web_affiliate_redirect_url});
                                                                                                    //}
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
                                                                                                    /*if (err) {
                                                                                                     callback({'result': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error})
                                                                                                     } else {*/
                                                                                                    callback({'status': config.constant.CODES.OK, 'message': 'Congratulations! You have been added as a lead for this campaign.', 'redirectUrl': users[0].campaigns[0].web_affiliate_redirect_url});
                                                                                                    //}
                                                                                                });
                                                                                            }
                                                                                        });
                                                                                    } else {
                                                                                        callback({'status': config.constant.CODES.OK, 'message': 'Congratulations! You have been added as a lead for this campaign.', 'redirectUrl': users[0].campaigns[0].web_affiliate_redirect_url});
                                                                                    }
                                                                                } else if (agendaDetails.mode == 'Email') { //Send email on successfull lead creation

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
                                                                                            /*if (err) {
                                                                                             callback({'result': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error})
                                                                                             } else {*/
                                                                                            callback({'status': config.constant.CODES.OK, 'message': 'Congratulations! You have been added as a lead for this campaign.', 'redirectUrl': users[0].campaigns[0].web_affiliate_redirect_url});
                                                                                            //}
                                                                                        });
                                                                                    });
                                                                                }
                                                                            }
                                                                        }
                                                                    });
                                                        }
                                                    });
                                                } else if ((bodyLength == loopCounter) && scriptNotExistsCounter > 0) {
                                                    callback({'status': config.constant.CODES.BadRequest, "message": 'Script validation failed. Someone might has changed the original script.'});
                                                } else if ((bodyLength == loopCounter) && validationFlg) {
                                                    callback({'status': config.constant.CODES.BadRequest, 'message': 'Mandatory information is not provided. Please fill the mandatory data.'});
                                                }
                                            });
                                            //}
                                            //});
                                        } else {
                                            callback({'status': 200, "message": 'You are already a lead for this campaign.'});
                                        }
                                    }
                                });
                            } else {
                                callback({'status': config.constant.CODES.BadRequest, "message": 'Email address is mandatory for creating a lead. Please provide your email address.'});
                            }
                        }
                    });
                    if (reqBodyLength == reqBodyCounter && !emailFound) {
                        console.log('Else');
                        callback({'status': config.constant.CODES.BadRequest, "message": 'We did not receive a mandatory email field from your script. Please provide email address. '});
                    }
                }
            }
        });
    } else {
        callback({'status': config.constant.CODES.BadRequest, "message": 'We did not receive a valid script request. Please try with a valid script.'});
    }
}
module.exports.createWebLead = createWebLead;