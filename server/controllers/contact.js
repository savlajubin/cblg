/* Controller for dealing with  Contacts in ADVCC */
var config = require('../../config/constant.js'); // constants
var contactList = require('../models/contact_list');
var contactAgenda = require('../models/contact_agenda');
var contacts = require('../models/contact');
var emailTemplate = require('../models/email_template');
var messageModel = require('../models/message_history');
var userModel = require('../models/user');
var timezones = require('../models/timezone');
var ringToNumbersModel = require('../models/ringToNumber');
//var outboundCampaignCallPlivo = require('../controllers/calls').outboundCampaignCallPlivo;
var outboundCampaignCallPlivo = require('../controllers/calls');
var outboundCampaignCallTwilio = require('../controllers/twilioCalls');
var Agenda = require('agenda');
var agenda = new Agenda({db: {address: 'localhost:27017/db_callbasedleadgen'}});
var mails = require('../controllers/send_mail.js'); // included controller for sending mail operations
var _ = require("underscore");
var mongoose = require("mongoose");
var plivo = require('plivo');
var twilio = require('twilio');
var moment = require('moment');
var formidable = require('formidable');
var csv = require("fast-csv");
var fs = require('fs');
var sendgrid = require('sendgrid')(config.constant.SEND_GRID.username, config.constant.SEND_GRID.password);

/*var amazonSes = require('node-ses')
        , client = amazonSes.createClient({
            key: config.constant.AMAZON_AWS.key,
            secret: config.constant.AMAZON_AWS.secret
        });*/

var ringToNumber = require('../models/ringToNumber');
var agendaCtrl = require('../controllers/agenda');
var shorturl = require('shorturl');
var isEmptyObject = function (obj) {
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
}

/* @function : listContact
 *  @author  :
 *  @created  : 12022016
 *  @modified :
 *  @purpose  : To get list of all available contact lists
 */

var listContact = function (req, res, callback) {
    contactList.find({'user_id': req.user._id, 'is_deleted': false}, function (err, response) {
        if (err) {
            console.log(err)
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
        } else {
            var count = [];
            contacts.find({is_deleted: false}, function (err, contact) {
                if (err) {
                    console.log(err)
                    callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
                } else {
                    callback({'code': config.constant.CODES.OK, 'data': response, 'contacts': contact, "message": config.constant.MESSAGES.Success});
                }
            });
        }
    });
}
exports.listContact = listContact;
/* @function : saveContactList
 *  @author  :
 *  @created  : 12022016
 *  @modified :
 *  @purpose  : To save contact lists
 */

var saveContactList = function (req, res, callback) {
    req.body.user_id = req.user._id
    var list = new contactList(req.body);
    list.save(function (err, response) {
        if (err) {
            console.log(err)
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
        } else {
            callback({'code': config.constant.CODES.OK, 'data': response, "message": config.constant.MESSAGES.Success});
        }
    });
}
exports.saveContactList = saveContactList;
/* @function : saveContact
 *  @author  :
 *  @created  : 12022016
 *  @modified :
 *  @purpose  : To save contact lists
 */

var saveContact = function (req, res, callback) {
    var contact = new contacts(req.body);
    if (req.body._id) {
        var contactid = req.body._id;
        delete req.body._id;
        contacts.update({'_id': contactid}, {$set: req.body}, function (err, response) {
            if (err) {
                console.log(err)
                callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
            } else {
                callback({'code': config.constant.CODES.OK, 'data': response, "message": config.constant.MESSAGES.updateSuccess});
            }
        });
    } else {
        contact.save(function (err, response) {
            if (err) {
                console.log(err)
                callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
            } else {
                /*var email = new sendgrid.Email({
                 from: 'support@callbasedleadgeneration.com', // sender address
                 to: contact.email, // list of receivers
                 subject: "CBLG : Auto-Generated Email", // Subject line
                 html: '<h1><img alt="" src="" /></h1><hr /><table align="center" style="height:150px; width:627px"><tbody><tr><td><h1>CallBasedLeadGeneration</h1><hr /><p><big>Hi ' + contact.first_name + ',</big></p><p><big>Your Contact number and Email has been added in CBLG System for sms and email notifications.</big></p><h3><code>Thanks,<br />CallBasedLeadGeneration Team</code></h3></td></tr></tbody></table>'
                 });
                 sendgrid.send(email, function (err, json) {
                 if (err) {
                 callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
                 } else {
                 callback({'code': config.constant.CODES.OK, 'data': response, "message": config.constant.MESSAGES.Success});
                 }
                 });*/

                /* Send Email through Amazon Aws Ses */
                var to = [contact.email];
                var subject = 'CBLG : Auto-Generated Email';
                var message = '<h1><img alt="" src="" /></h1><hr /><table align="center" style="height:150px; width:627px"><tbody><tr><td><h1>CallBasedLeadGeneration</h1><hr /><p><big>Hi ' + contact.first_name + ',</big></p><p><big>Your Contact number and Email has been added in CBLG System for sms and email notifications.</big></p><h3><code>Thanks,<br />CallBasedLeadGeneration Team</code></h3></td></tr></tbody></table>';
                mails.sendEmail('jason36526@gmail.com', to, subject, message, function (response) {
                    if (response.code == config.constant.CODES.notFound) {
                        callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
                    } else if (response.code == config.constant.CODES.OK) {
                        callback({'code': config.constant.CODES.OK, 'data': response, "message": config.constant.MESSAGES.Success});
                    }
                });

                /*client.sendEmail({
                    to: contact.email,
                    from: 'jason36526@gmail.com',
                    subject: 'CBLG : Auto-Generated Email',
                    message: '<h1><img alt="" src="" /></h1><hr /><table align="center" style="height:150px; width:627px"><tbody><tr><td><h1>CallBasedLeadGeneration</h1><hr /><p><big>Hi ' + contact.first_name + ',</big></p><p><big>Your Contact number and Email has been added in CBLG System for sms and email notifications.</big></p><h3><code>Thanks,<br />CallBasedLeadGeneration Team</code></h3></td></tr></tbody></table>',
                    altText: 'html text'
                }, function (err, data, res) {
                    if (err) {
                        callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
                    } else {
                        callback({'code': config.constant.CODES.OK, 'data': response, "message": config.constant.MESSAGES.Success});
                    }
                });*/
            }
        });
    }
}
exports.saveContact = saveContact;
/* @function : deleteContactList
 *  @author  :
 *  @created  : 12022016
 *  @modified :
 *  @purpose  : To delete contact list
 */

var deleteContactList = function (req, res, callback) {
    contactList.update({_id: req.body.list_id}, {$set: {'is_deleted': true}}, function (err, response) {
        if (err) {
            console.log(err)
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
        } else {
            callback({'code': config.constant.CODES.OK, 'data': response, "message": config.constant.MESSAGES.deleteSuccess});
        }
    });
}
exports.deleteContactList = deleteContactList;
/* @function : getContacts
 *  @author  :
 *  @created  : 12022016
 *  @modified :
 *  @purpose  : To delete contact list
 */

var getContacts = function (req, res, callback) {
    contacts.find({list_id: req.body.list_id, is_deleted: false}, function (err, response) {
        if (err) {
            console.log(err)
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
        } else {
            callback({'code': config.constant.CODES.OK, 'data': response, "message": config.constant.MESSAGES.deleteSuccess});
        }
    });
}
exports.getContacts = getContacts;
/* @function : getContactInfo
 *  @author  :
 *  @created  : 12022016
 *  @modified :
 *  @purpose  : To delete contact list
 */

var getContactInfo = function (req, res, callback) {
    contacts.findOne({_id: req.body.contact_id}, function (err, response) {
        if (err) {
            console.log(err)
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
        } else {
            callback({'code': config.constant.CODES.OK, 'data': response, "message": config.constant.MESSAGES.deleteSuccess});
        }
    });
}
exports.getContactInfo = getContactInfo;
/* @function : deleteContact
 *  @author  :
 *  @created  : 12022016
 *  @modified :
 *  @purpose  : To delete contact list
 */

var deleteContact = function (req, res, callback) {
    contacts.update({_id: req.body.contact_id}, {$set: {'is_deleted': true}}, function (err, response) {
        if (err) {
            console.log(err)
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
        } else {
            getContacts(req, res, function (response) {
                callback(response);
            });
        }
    });
}
exports.deleteContact = deleteContact;
/* @function : sendEmailToContacts
 *  @author  :
 *  @created  : 12022016
 *  @modified :
 *  @purpose  : To send email to contacts
 */

var sendEmailToContacts = function (req, res, callback) {
    if (req.body.method == 'now') {
        contacts.find({_id: {$in: req.body.contacts}}, function (err, response) {
            if (err) {
                console.log(err)
                callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
            } else {
                mails.sendMailToContacts(req, res, response, function () {
                    callback({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.Success});
                });
            }
        });
    } else {
        console.log(req.body);
        var str = moment(req.body.time).format("HH:mm");
        var res = str.split(":");
        console.log(res);
        var insertData = {
            'contacts': req.body.contacts,
            'method': req.body.method,
            'date': (req.body.date) ? req.body.date : '',
            'day': (req.body.day) ? req.body.day : '',
            'hours': res[0],
            'minutes': res[1],
            'mode': 'Email',
            'message': req.body.message,
            'subject': req.body.subject,
            'user_id': req.user._id,
            'is_deleted': false,
            'created': new Date()
        };
        console.log(insertData)
        var contactagenda = new contactAgenda(insertData);
        contactagenda.save(function (err, response) {
            if (err) {
                console.log(err)
                callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
            } else {
                if (insertData.method == "daily") {
                    console.log('4');
                    console.log(insertData.minutes + ' ' + insertData.hours + ' * * *');
                    var daily = insertData.minutes + ' ' + insertData.hours + ' * * *';
                    agenda.every(daily, 'daily', {'contacts': insertData.contacts, 'mode': insertData.mode, 'message': insertData.message, 'subject': insertData.subject});
                } else if (insertData.method == "weekly") {
                    var weekly = insertData.minutes + ' ' + insertData.hours + ' * * ' + insertData.day;
                    agenda.every(weekly, 'weekly', {'contacts': insertData.contacts, 'mode': insertData.mode, 'message': insertData.message, 'subject': insertData.subject});
                } else if (insertData.method == "monthly") {
                    var d = new Date();
                    var month = d.getMonth();
                    var monthly = insertData.minutes + ' ' + insertData.hours + ' ' + insertData.date + ' ' + month + ' *';
                    agenda.every(monthly, 'monthly', {'contacts': insertData.contacts, 'mode': insertData.mode, 'message': insertData.message, 'subject': insertData.subject});
                }
                agenda.start();
                callback({'code': config.constant.CODES.OK, 'data': response, "message": config.constant.MESSAGES.Success});
            }
        });
    }
}
exports.sendEmailToContacts = sendEmailToContacts;
/* @function : sendSMSToContacts
 *  @author  :
 *  @created  : 12022016
 *  @modified :
 *  @purpose  : To send SMS to contacts
 */

var sendSMSToContacts = function (req, res, callback) {
    if (req.body.method == 'now') {
        contacts.find({_id: {$in: req.body.contacts}}, function (err, response) {
            if (err) {
                console.log(err)
                callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
            } else {
                sendMultiSMS(req, res, response, function (data) {
                    if (data.code == config.constant.CODES.OK) {
                        saveMessageHistory(req, data, function () {
                            callback({'code': config.constant.CODES.OK, "response": data.response, "message": config.constant.MESSAGES.Success});
                        });
                    }
                });
            }
        });
    } else {
        console.log(req.body);
//        var str = req.body.time;
        var str = moment(req.body.time).format("HH:mm");
        var res = str.split(":");
        console.log(res);
        var insertData = {
            'contacts': req.body.contacts,
            'method': req.body.method,
            'date': (req.body.date) ? req.body.date : '',
            'day': (req.body.day) ? req.body.day : '',
            'hours': res[0],
            'minutes': res[1],
            'mode': 'sms',
            'message': req.body.message,
            'user_id': req.user._id,
            'is_deleted': false,
            'created': new Date()
        };
        console.log(insertData)
        var contactagenda = new contactAgenda(insertData);
        contactagenda.save(function (err, response) {
            if (err) {
                console.log(err)
                callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
            } else {
                if (insertData.method == "daily") {
                    console.log('4');
                    console.log(insertData.minutes + ' ' + insertData.hours + ' * * *');
                    var daily = insertData.minutes + ' ' + insertData.hours + ' * * *';
                    agenda.every(daily, 'daily', {'contacts': insertData.contacts, 'mode': insertData.mode, 'message': insertData.message, 'subject': insertData.subject});
                } else if (insertData.method == "weekly") {
                    var weekly = insertData.minutes + ' ' + insertData.hours + ' * * ' + insertData.day;
                    console.log(weekly);
                    agenda.every(weekly, 'weekly', {'contacts': insertData.contacts, 'mode': insertData.mode, 'message': insertData.message, 'subject': insertData.subject});
                } else if (insertData.method == "monthly") {
                    var d = new Date();
                    var month = d.getMonth();
                    var monthly = insertData.minutes + ' ' + insertData.hours + ' ' + insertData.date + ' ' + month + ' *';
                    console.log(monthly);
                    agenda.every(monthly, 'monthly', {'contacts': insertData.contacts, 'mode': insertData.mode, 'message': insertData.message, 'subject': insertData.subject});
                }
                agenda.start();
                callback({'code': config.constant.CODES.OK, 'data': response, "message": config.constant.MESSAGES.Success});
            }
        });
    }
}
exports.sendSMSToContacts = sendSMSToContacts;



var sendMultiSMS = function (message, smsheader, dest, user_id, callback) {
    userModel.findOne({_id: user_id}).populate('parent_id').exec(function (err, userData) {
        if (err) {
            callback();
        } else {
            console.log(userData);
            if (userData.parent_id.webphone_details.provider == 'plivo') {
                // Plivo message sending code
//                var plivoApi = plivo.RestAPI({
//                    authId: 'MAOGRINTE5YTM5Y2U5NM', //Client from constant file
//                    authToken: 'YmY0NDQ1MDAxYmIwNTZjY2RhNDI0NmM5MWY3NjRm'  //Client
//
////        authId: 'MAOGY2ZDQ0MDEWMTK1ZM', //smartData Test Account
////        authToken: 'NDk4ODk3NTA5NDQ5MGZmN2RjMWQ0MDZjMzgwMjhh' //smartData Test Account
//                });
                var plivoApi = plivo.RestAPI({authId: userData.parent_id.webphone_details.username, authToken: userData.parent_id.webphone_details.password});
                var src = smsheader;
                console.log('src', src);
                if (smsheader.charAt(0) == '+') {
                    src = smsheader.substring(1);
                }
                var params = {
                    'src': src, // Sender's phone number with country code
                    'dst': dest, // Receiver's phone Number with country code
                    'text': message
                };
                console.log('params plivo', params);
//                var response = {
//                    api_id: 'e7390c9e-d60c-11e5-9e6e-22000af883f5',
//                    message: 'message(s) queued',
//                    message_uuid: ['85ed1a8a-da74-471d-9656-50e48c712886']
//                };
//                var status = 202;
                // Prints the complete response
                plivoApi.send_message(params, function (status, response) {
                    if (status == 202) {
                        callback({'code': config.constant.CODES.OK, "provider": 'plivo', "response": response, "params": params, "message": config.constant.MESSAGES.Success});
                    } else {
                        callback({'code': config.constant.CODES.notFound, "provider": 'plivo', 'response': response, "message": config.constant.MESSAGES.Error});
                    }
                });
            } else {
                // Twilio message sending code
//                var webPhoneDetails = {
//                    "app_id": "AP828bd2907a7f43398a86d21472bbb877",
//                    "provider": "twilio",
//                    "username": "AC30ea915f45a5b377afe709dba1b9ad49",
//                    "password": "570a49181b435d09806dc91e8245b539"
//                }

                var src = smsheader;
                if (smsheader.charAt(0) != '+') {
                    src = '+' + src;
                }
                var to = dest;
                if (dest.charAt(0) != '+') {
                    to = '+' + to;
                }
                var twilioApi = new twilio(userData.parent_id.webphone_details.username, userData.parent_id.webphone_details.password);
                var params = {
                    to: to,
                    from: src,
                    body: message,
                }
                console.log('params twilio', params);
                twilioApi.messages.create(params, function (err, message) {
                    if (err) {
                        console.log(err);
                        callback({'code': config.constant.CODES.notFound, "provider": 'twilio', 'response': message, "message": config.constant.MESSAGES.Error});
                    } else {
                        callback({'code': config.constant.CODES.OK, "provider": 'twilio', "response": message, "params": params, "message": config.constant.MESSAGES.Success});
                    }
                });
            }
        }
    });
}

exports.sendMultiSMS = sendMultiSMS;



var saveMessageHistory = function (data, callback) {
    data.forEach(function (obj, k) {
        new messageModel(obj).save(function (err) {
            if (err)
                console.log('Save err', k, err);
            if (k + 1 == data.length) {
                callback({'code': config.constant.CODES.OK});
            }
        });
    });
}

exports.saveMessageHistory = saveMessageHistory;



var importContactsCSV = function (req, res, callback) {
    var form = new formidable.IncomingForm();
    form.uploadDir = "./public/assets/images/documents"; //set upload directory
    form.keepExtensions = true; //keep file extension
    form.parse(req, function (err, fields, files) {
        console.log('fields', fields);
        console.log('files', files);
        if (err) {
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
        } else {
            if (files.file.type == 'text/csv') {

                var row = 0;
                csv.fromPath(files.file.path)
                        .on("data", function (data) {
                            console.log('row', row);
                            console.log('data', data);
                            //return false;
                            if (row && (data[4] == 'yes' || data[4] == 'Yes')) {
                                var saveData = {
                                    first_name: data[0],
                                    last_name: data[1],
                                    email: data[2],
                                    phone_no: data[3],
                                    list_id: fields.list_id,
                                    consent: true
                                };
                                console.log('savedata', saveData);
                                contacts(saveData).save(function (err, saveData) {
                                    if (err) {
                                        console.log(err);
                                        callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
                                    } else {
                                        /*var email = new sendgrid.Email({
                                         from: 'support@callbasedleadgeneration.com', // sender address
                                         to: saveData.email, // list of receivers
                                         subject: "CBLG : Auto-Generated Email", // Subject line
                                         html: '<h1><img alt="" src="" /></h1><hr /><table align="center" style="height:150px; width:627px"><tbody><tr><td><h1>CallBasedLeadGeneration</h1><hr /><p><big>Hi ' + saveData.first_name + ',</big></p><p><big>Your Contact number and Email has been added in CBLG System for sms and email notifications.</big></p><h3><code>Thanks,<br />CallBasedLeadGeneration Team</code></h3></td></tr></tbody></table>'
                                         });
                                         sendgrid.send(email, function (err, json) {
                                         if (err) {
                                         console.error(err);
                                         } else {
                                         console.log('saveData', saveData);
                                         }
                                         });*/

                                        /* Send Email through Amazon Aws Ses */
                                        client.sendEmail({
                                            to: saveData.email,
                                            from: 'jason36526@gmail.com',
                                            subject: 'CBLG : Auto-Generated Email',
                                            message: '<h1><img alt="" src="" /></h1><hr /><table align="center" style="height:150px; width:627px"><tbody><tr><td><h1>CallBasedLeadGeneration</h1><hr /><p><big>Hi ' + saveData.first_name + ',</big></p><p><big>Your Contact number and Email has been added in CBLG System for sms and email notifications.</big></p><h3><code>Thanks,<br />CallBasedLeadGeneration Team</code></h3></td></tr></tbody></table>',
                                            altText: 'html text'
                                        }, function (err, data, res) {
                                            if (err) {
                                                console.error(err);
                                            } else {
                                                console.log('saveData', saveData);
                                            }
                                        });
                                    }

                                });
                            }
                            row++;
                        })
                        .on("end", function () {
                            fs.unlink(files.file.path, function (err) {
                                callback({status: config.constant.CODES.OK, message: 'Contacts Successfully Imported'});
                            });
                        });
            }
            else {
                console.log("inside error");
                callback({status: config.constant.CODES.notFound, message: 'Error, File did\'t uploaded or invalid format. Only CSV is allowed'});
            }
        }
    });
}
exports.importContactsCSV = importContactsCSV;



//cron list
var cronList = function (req, res, callback) {
    console.log("backend CronList");
    contactAgenda.find({'is_deleted': false}, function (err, response) {
        if (err) {
            console.log(err)
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
        } else {
            //console.log(response);
            callback({'code': config.constant.CODES.OK, 'data': response, "message": config.constant.MESSAGES.Success});
        }
    });
}
exports.cronList = cronList;



// delete cron
exports.deleteCronList = function (req, res, next) {
    var id = req.params.id;
    console.log(id);
    contactAgenda.findOneAndUpdate({'_id': id}, {is_deleted: true}, {upsert: true}, function (err, doc) {
        if (err) {
            res.send({code: '401', message: "error deleting Crone"});
        }
        res.send({code: '200', message: "Crone deleted Successfully"});
    });
}

//view cron
var findCron = function (req, res, callback) {
    var user_id = req.params.id;
    contactAgenda.find({'_id': user_id}, function (err, users) {
        if (err) {
            //console.log("System Error (findUser) : " + err);
            callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.Error});
        } else {
            if (isEmptyObject(users)) {
                callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.notFound});
            } else {

                callback({'code': config.constant.CODES.OK, "data": users, "message": config.constant.MESSAGES.Success});
            }
        }
    });
}
module.exports.findCron = findCron;
//change Status
var changestatus = function (req, res, callback) {


    var field_ids = req.body._id;
    var status = req.body.status;
    contactAgenda.update({_id: field_ids}, {$set: {'status': status}}, function (err, data) {
        if (err) {
            //console.log("System Error (updateStatus) : " + err);
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
        } else {
            //console.log("Updated  (updateStatus) : " + err);

            callback({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.statusSuccess});
        }
    });
}
exports.changestatus = changestatus;
/* @function : getTimezones
 *  @author  :
 *  @created  : 02032016
 *  @modified :
 *  @purpose  : To get list if timezones
 */
var getTimezones = function (req, res, callback) {
    timezones.find({}, function (err, data) {
        if (err) {
            //console.log("System Error (updateStatus) : " + err);
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
        } else {
            callback({'code': config.constant.CODES.OK, "data": data, "message": config.constant.MESSAGES.Success});
        }
    });
}
exports.getTimezones = getTimezones;
/* @function : getTimezoneData
 *  @author  :
 *  @created  : 02032016
 *  @modified :
 *  @purpose  : To get timezone data by id
 */
var getTimezoneData = function (req, res, callback) {
    timezones.findOne({'_id': req.body.timezone_id}, function (err, data) {
        if (err) {
            //console.log("System Error (updateStatus) : " + err);
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
        } else {
            callback({'code': config.constant.CODES.OK, "data": data, "message": config.constant.MESSAGES.Success});
        }
    });
}
exports.getTimezoneData = getTimezoneData;
/* @function : getMessageCount
 *  @author  :
 *  @created  : 03032016
 *  @modified :
 *  @purpose  : To get message count
 */
var getMessageCount = function (req, res, callback) {
    contacts.count({'list_id': {$in: req.body.contactListIds}, 'is_deleted': false}, function (err, count) {
        if (err) {
            //console.log("System Error (updateStatus) : " + err);
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
        } else {
            callback({'code': config.constant.CODES.OK, "count": count, "message": config.constant.MESSAGES.Success});
        }
    });
}
exports.getMessageCount = getMessageCount;


/* @function : saveComposeMessage
 *  @author  :
 *  @created  : 02032016
 *  @modified :
 *  @purpose  : To get timezone data by id
 */
var saveComposeMessage = function (req, res, callback) {
    console.log('server', req.body);
    if (req.body.time) {
        delete req.body.time;
    }
    if (req.body.mixeddate) {
        delete req.body.mixeddate;
    }
    req.body.message = (req.body.mode == 'SMS' && req.body.message) ? req.body.append + req.body.message : req.body.message;
    req.body.user_id = req.user._id;
    if (req.body.frequency == 'weblead' || (req.body.frequency == 'onetime' && req.body.method == 'now')) {
        var obj = new contactAgenda(req.body);
    } else {
        var data = req.body;
        var time = {'month': data.month, 'date': data.date, 'hours': data.hours, 'minutes': data.minutes};
        data.finalTime = new Date(data.finalTime);
        data.hours = moment(data.finalTime).format('HH');
        data.minutes = moment(data.finalTime).format('mm');
        data.date = moment(data.finalTime).format('DD');
        data.month = moment(data.finalTime).format('MM');
        var obj = new contactAgenda(data);
        console.log('data', data);
    }
    console.log('obj', obj);
    obj.save(function (err, data) {
        if (err) {
            console.log('Error 1 : ', err);
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
        } else {
            console.log('data ', data);
            if (data.frequency == 'onetime' && data.method == 'now') {
                console.log('data.mode.toUpperCase() ', data.mode.toUpperCase());
                if (data.mode.toUpperCase() == 'SMS') {
                    // send SMS
                    contacts.find({'is_deleted': false, 'optout_sms': false, 'list_id': {$in: data.contacts}}, function (err, contactsData) {
                        if (err) {
                            console.log('Error 2 : ', err);
                            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
                        } else {
                            console.log('contactsData ', contactsData);
                            if (contactsData.length) {
                                var dest = '';
                                var contact_ids = [];
                                data.message += ' -to opt out please reply "STOP" to same number.';
                                contactsData.forEach(function (item, i) {
                                    contact_ids.push(item._id);
                                    if (item.phone_no.charAt(0) == '1') {
                                        var ph_no = item.phone_no;
                                    } else {
                                        var ph_no = '1' + item.phone_no;
                                    }
                                    // optout link generattion code
//                                    var baseUrl;
//                                    if (req.get('host') == 'localhost:8000') {
////                                        baseUrl = req.protocol + '://' + req.get('host') + ':' + req.get('port');
//                                        baseUrl = 'https://jubin.localtunnel.me';
//                                    } else {
//                                        baseUrl = req.protocol + '://' + req.get('host');
//                                    }
//                                    var optoutLink = baseUrl + "/#!/optout/SMS/" + item._id;
//                                    console.log('optoutLink :', optoutLink);
//                                    shorturl(optoutLink.trim(), function (result) {
//                                    console.log(result);

                                    sendMultiSMS(data.message, data.sms_header, ph_no, req.user._id, function (response) {
                                        var msgsaveObj = [];
                                        msgsaveObj.push({
                                            'user_id': req.user._id,
                                            'contact_id': item._id,
                                            'from': (response.provider == 'plivo') ? response.params.src : response.params.from,
                                            'to': (response.provider == 'plivo') ? response.params.dst : response.params.to,
                                            'mode': 'SMS',
                                            'description': req.body.description,
                                            'status': (response.code == config.constant.CODES.OK) ? 'Sent' : 'Failed',
                                            'sent_time': new Date(),
                                            'list_id': item.list_id,
                                            'agenda_id': data._id,
                                            'timezone': (req.body.timezone) ? req.body.timezone : '',
                                            'message_uuid': (response.provider == 'plivo') ? response.response.message_uuid[0] : response.response.sid,
                                            'api_id': (response.provider == 'plivo') ? response.response.api_id : response.response.account_sid,
                                            'text': data.message,
                                        });
                                        if (i + 1 == contactsData.length) {
                                            saveMessageHistory(msgsaveObj, function (historyRes) {
                                                if (historyRes.code == config.constant.CODES.OK) {
                                                    callback({'code': config.constant.CODES.OK, "data": data, "message": 'Sent Successfully'});
                                                } else {
                                                    console.log('Error 3 : ');
                                                    callback({'code': config.constant.CODES.notFound, "message": 'Message Sending Failed'})
                                                }
                                            });
                                        }
                                    });
//                                    });
                                });
                            } else {
                                callback({'code': config.constant.CODES.notFound, "message": 'No Contacts found'})
                            }
                        }
                    });
                } else if (data.mode.toUpperCase() == 'EMAIL') {
                    // send mail
                    console.log('EMAIL');
                    contacts.find({'is_deleted': false, 'optout_email': false, 'list_id': {$in: data.contacts}}, function (err, contactsData) {
                        if (err) {
                            console.log('Error 4 : ', err);
                            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
                        } else {
                            console.log('contactsData ', contactsData);
                            if (contactsData.length) {
                                contactsData.forEach(function (item, i) {
                                    var baseUrl;
                                    console.log('req.get(host)', req.get('host'));
                                    if (req.get('host') == 'localhost:8000') {
                                        console.log('if');
                                        baseUrl = 'https://jubin.localtunnel.me';
                                    } else {
                                        console.log('else');
                                        baseUrl = req.protocol + '://' + req.get('host');
                                    }
                                    var optoutLink = baseUrl + "/#!/optout/EMAIL/" + item._id;
                                    console.log('optoutLink :', optoutLink);
                                    shorturl(optoutLink.trim(), function (result) {
                                        console.log('result :', result);
                                        var message = data.message + ' -to unsubscribe <a href="' + result + '">Click Here</a>';
                                        var emails = [{'email': item.email}];
                                        mails.sendMailToContacts(message, data.subject, emails, function (resp) {
                                            var msgsaveObj = [];
                                            console.log('resp ', resp);
                                            msgsaveObj.push({
                                                'user_id': req.user._id,
                                                'contact_id': item._id,
                                                'from': 'support@callbasedleadgeneration.com',
                                                'to': item.email,
                                                'mode': 'EMAIL',
                                                'description': req.body.description,
                                                'status': (resp.code == config.constant.CODES.OK) ? 'Sent' : 'Failed',
                                                'sent_time': new Date(),
                                                'list_id': item.list_id,
                                                'agenda_id': data._id,
                                                'timezone': (req.body.timezone) ? req.body.timezone : '',
                                                'text': data.message,
                                            });
                                            console.log('i ', i);
                                            console.log('contactsData.length ', contactsData.length);
                                            console.log('i + 1 == contactsData.length ', i + 1 == contactsData.length);
                                            if (i + 1 == contactsData.length) {
                                                console.log('msgsaveObj ', msgsaveObj);
                                                saveMessageHistory(msgsaveObj, function (historyRes) {
                                                    console.log('historyRes ', historyRes);
                                                    if (historyRes.code == config.constant.CODES.OK) {
                                                        callback({'code': config.constant.CODES.OK, "data": data, "message": 'Sent Successfully'});
                                                    } else {
                                                        console.log('Error 3 : ');
                                                        callback({'code': config.constant.CODES.notFound, "message": 'Email Sending Failed'})
                                                    }
                                                });
                                            }
                                        });
                                    });
                                });
                            } else {
                                callback({'code': config.constant.CODES.notFound, "message": 'No Contacts found'})
                            }
                        }
                    });
                } else {
                    // Call
                    console.log('CALL');
                    contacts.find({'is_deleted': false, 'optout_call': false, 'list_id': {$in: data.contacts}}, function (err, contactsData) {
                        if (err) {
                            console.log('Error 5 : ', err);
                            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
                        } else {
                            console.log('contactsData ', contactsData);
                            if (contactsData.length) {
                                userModel.findOne({_id: req.user._id}).populate('parent_id').exec(function (err, userData) {
                                    if (err) {
                                        console.log('Error 6 : ', err);
                                        callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
                                    } else {
                                        console.log(userData);
                                        if (userData.parent_id.webphone_details.provider == 'plivo') {
                                            outboundCampaignCallPlivo.outboundCampaignCallPlivo(req, res, contactsData, data, userData.parent_id.webphone_details, function (callRes) {
                                                callback(callRes);
                                            });

                                        } else if (userData.parent_id.webphone_details.provider == 'twilio') {
                                            outboundCampaignCallTwilio.outboundCampaignCallTwilio(req, res, contactsData, data, userData.parent_id.webphone_details, function (callRes) {
                                                callback(callRes);
                                            });

                                        } else {
                                            callback({'code': config.constant.CODES.notFound, "message": 'No information of Plivo or Twilio Present in Parent LGN'})
                                        }
                                    }
                                });

                            } else {
                                callback({'code': config.constant.CODES.notFound, "message": 'No Contacts found'})
                            }
                        }
                    });


                }
            } else if (data.frequency == 'weblead') {
                callback({'code': config.constant.CODES.OK, "data": data, "message": config.constant.MESSAGES.Success});
            } else {
                // set agenda
                contacts.find({'is_deleted': false, 'list_id': {$in: data.contacts}}, function (err, contactsData) {
                    if (err) {
                        console.log('Error 7 : ', err);
                        callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
                    } else {
                        if (contactsData) {
                            if (data.frequency == 'onetime' && data.method == 'later') {
                                var cronString = data.minutes + ' ' + data.hours + ' ' + data.date + ' ' + (parseInt(data.month) - 1) + ' *';
                                console.log(cronString);
                            } else if (data.frequency == 'recurring' && data.method == 'yearly') {
                                var cronString = data.minutes + ' ' + data.hours + ' ' + data.date + ' ' + (parseInt(data.month) - 1) + ' *';
                                console.log(cronString);
                            } else if (data.frequency == 'recurring' && data.method == 'monthly') {
                                var cronString = data.minutes + ' ' + data.hours + ' ' + data.date + ' ' + ' * *';
                                console.log(cronString);
                            } else if (data.frequency == 'recurring' && data.method == 'weekly') {
                                var cronString = data.minutes + ' ' + data.hours + ' * * ' + data.day;
                                console.log(cronString);
                            } else if (data.frequency == 'recurring' && data.method == 'daily') {
                                var cronString = data.minutes + ' ' + data.hours + ' * * *';
                                console.log(cronString);
                            }


                            var contact_ids = [];
                            contactsData.forEach(function (item, i) {
                                contact_ids.push(item._id);
                                if (i + 1 == contactsData.length) {
                                    console.log('Agenda');
                                    randomString(5, function (agendaName) {
                                        console.log('agendaName : ', agendaName);
                                        contactAgenda.update({'_id': data._id}, {$set: {'agenda_name': agendaName}}, function (err, updated) {
                                            if (err) {
                                                console.log('Update Error : ', err);
                                            } else {
                                                agenda.define(agendaName, function (job, done) {
                                                    console.log('Cron Running----------', new Date());
                                                    console.log('Job----------', job);
                                                    console.log('job.attrs.data', job.attrs.data);
                                                    if (job.attrs.data.mode.toUpperCase() == 'SMS') {
                                                        console.log('SMS');
                                                        agendaCtrl.sendSMS(req, job.attrs.data, function (data) {
                                                            console.log(data);
                                                        });
                                                    } else if (job.attrs.data.mode.toUpperCase() == 'CALL') {
                                                        console.log('CALL');
                                                        agendaCtrl.outboundCall(req, res, job.attrs.data, function (data) {
                                                            console.log(data);
                                                        });
                                                    } else {
                                                        console.log('Email');
                                                        agendaCtrl.sendEmail(req, job.attrs.data, function (data) {
                                                            console.log(data);
                                                        });
                                                    }
                                                    done();
                                                });
                                                agenda.every(cronString, agendaName, {'agenda_id': data._id, 'user_id': req.user._id, 'contacts': contact_ids, 'description': data.description, 'mode': data.mode, 'sms_header': data.sms_header, 'message': data.message, 'subject': data.subject, 'month': time.month, 'date': time.date, 'hours': time.hours, 'minutes': time.minutes, 'timezone': data.timezone});
                                                agenda.start();
                                                callback({'code': config.constant.CODES.OK, "data": data, "message": 'Success'});
                                            }
                                        });
                                    });
                                }
                            });
                        }
                    }
                });
            }
            //callback({'code': config.constant.CODES.OK, "data": data, "message": config.constant.MESSAGES.Success});
        }
    });
}
exports.saveComposeMessage = saveComposeMessage;


var randomString = function (len, callback) {
    var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var randomString = '';
    for (var i = 0; i < len; i++) {
        var randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz, randomPoz + 1);
    }
    callback(randomString);
}

/* @function : editComposeMessage
 *  @author  :
 *  @created  : 02032016
 *  @modified :
 *  @purpose  : To get timezone data by id
 */
var editComposeMessage = function (req, res, callback) {
    console.log('server', req.body);
    if (req.body.time) {
        delete req.body.time;
    }
    console.log(1);
    if (req.body.mixeddate) {
        delete req.body.mixeddate;
    }
    console.log(2);
    req.body.message = (req.body.mode == 'SMS' && req.body.message) ? req.body.append + req.body.message : req.body.message;
    console.log(3);
    req.body.user_id = req.user._id;
    console.log(4);
    var data = req.body;
    if (req.body.frequency == 'weblead' || (req.body.frequency == 'onetime' && req.body.method == 'now')) {
        // var obj = new contactAgenda(req.body);
        console.log(5);
    } else {
        var time = {'month': data.month, 'date': data.date, 'hours': data.hours, 'minutes': data.minutes};
        data.finalTime = new Date(data.finalTime);
        data.hours = moment(data.finalTime).format('HH');
        data.minutes = moment(data.finalTime).format('mm');
        data.date = moment(data.finalTime).format('DD');
        data.month = moment(data.finalTime).format('MM');
        console.log(6);
    }
    console.log(7);
    var agenda_id = data._id.toString();
    delete data._id;
    console.log('req.body._id', req.body._id);
    console.log('agenda_id', agenda_id);
    console.log('data', data);
    contactAgenda.update({_id: agenda_id}, {$set: data}, function (err, count) {
        if (err) {
            console.log('Error 1 : ', err);
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
        } else {
            console.log('Updated : ', count);
            contactAgenda.findOne({_id: agenda_id}, function (err, data) {
                if (err) {
                    console.log('Error 2 : ', err);
                    callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                } else {
                    console.log('data', data);
                    if (data.frequency == 'onetime' && data.method == 'now') {
                        if (data.mode.toUpperCase() == 'SMS') {
                            // send SMS
                            contacts.find({'is_deleted': false, 'list_id': {$in: data.contacts}}, function (err, contactsData) {
                                if (err) {
                                    console.log('Error 2 : ', err);
                                    callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
                                } else {
                                    console.log('contactsData ', contactsData);
                                    if (contactsData.length) {
                                        var dest = '';
                                        var contact_ids = [];
                                        contactsData.forEach(function (item, i) {
                                            contact_ids.push(item._id);
                                            if (item.phone_no.charAt(0) == '1') {
                                                var ph_no = item.phone_no;
                                            } else {
                                                var ph_no = '1' + item.phone_no;
                                            }
                                            // optout link generattion code
//                                            var baseUrl;
//                                            if (req.get('host') == 'localhost:8000') {
////                                        baseUrl = req.protocol + '://' + req.get('host') + ':' + req.get('port');
//                                                baseUrl = 'https://jubin.localtunnel.me';
//                                            } else {
//                                                baseUrl = req.protocol + '://' + req.get('host');
//                                            }
//                                            var optoutLink = baseUrl + "/#!/optout/SMS/" + item._id;
//                                            console.log('optoutLink :', optoutLink);
//                                            shorturl(optoutLink.trim(), function (result) {
//                                                console.log(result);
                                            data.message += ' -to opt out please reply "STOP" to same number.';
                                            sendMultiSMS(data.message, data.sms_header, ph_no, req.user._id, function (response) {
                                                var msgsaveObj = [];
                                                msgsaveObj.push({
                                                    'user_id': req.user._id,
                                                    'contact_id': item._id,
                                                    'from': (response.provider == 'plivo') ? response.params.src : response.params.from,
                                                    'to': (response.provider == 'plivo') ? response.params.dst : response.params.to,
                                                    'mode': 'SMS',
                                                    'description': req.body.description,
                                                    'status': (response.code == config.constant.CODES.OK) ? 'Sent' : 'Failed',
                                                    'sent_time': new Date(),
                                                    'list_id': item.list_id,
                                                    'agenda_id': data._id,
                                                    'timezone': (req.body.timezone) ? req.body.timezone : '',
                                                    'message_uuid': (response.provider == 'plivo') ? response.response.message_uuid[0] : response.response.sid,
                                                    'api_id': (response.provider == 'plivo') ? response.response.api_id : response.response.account_sid,
                                                    'text': data.message,
                                                });
                                                if (i + 1 == contactsData.length) {
                                                    saveMessageHistory(msgsaveObj, function (historyRes) {
                                                        if (historyRes.code == config.constant.CODES.OK) {
                                                            callback({'code': config.constant.CODES.OK, "data": data, "message": 'Sent Successfully'});
                                                        } else {
                                                            console.log('Error 3 : ');
                                                            callback({'code': config.constant.CODES.notFound, "message": 'Message Sending Failed'})
                                                        }
                                                    });
                                                }
                                            });
//                                            });
                                        });
                                    } else {
                                        callback({'code': config.constant.CODES.notFound, "message": 'No Contacts found'})
                                    }

                                }
                            });
                        } else if (data.mode.toUpperCase() == 'EMAIL') {
                            // send mail
                            contacts.find({'is_deleted': false, 'list_id': {$in: data.contacts}}, function (err, contactsData) {
                                if (err) {
                                    console.log('Error 4 : ', err);
                                    callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
                                } else {
                                    console.log('contactsData ', contactsData);
                                    if (contactsData.length) {
                                        contactsData.forEach(function (item, i) {
                                            var baseUrl;
                                            console.log('req.get(host)', req.get('host'));
                                            if (req.get('host') == 'localhost:8000') {
                                                console.log('if');
                                                baseUrl = 'https://jubin.localtunnel.me';
                                            } else {
                                                console.log('else');
                                                baseUrl = req.protocol + '://' + req.get('host');
                                            }
                                            var optoutLink = baseUrl + "/#!/optout/EMAIL/" + item._id;
                                            console.log('optoutLink :', optoutLink);
                                            shorturl(optoutLink.trim(), function (result) {
                                                console.log('result :', result);
                                                data.message += ' -to unsubscribe <a href="' + result + '">Click Here</a>';
                                                var emails = [{'email': item.email}];
                                                mails.sendMailToContacts(data.message, data.subject, emails, function (resp) {
                                                    var msgsaveObj = [];
                                                    console.log('resp ', resp);
                                                    msgsaveObj.push({
                                                        'user_id': req.user._id,
                                                        'contact_id': item._id,
                                                        'from': 'support@callbasedleadgeneration.com',
                                                        'to': item.email,
                                                        'mode': 'EMAIL',
                                                        'description': req.body.description,
                                                        'status': (resp.code == config.constant.CODES.OK) ? 'Sent' : 'Failed',
                                                        'sent_time': new Date(),
                                                        'list_id': item.list_id,
                                                        'agenda_id': data._id,
                                                        'timezone': (req.body.timezone) ? req.body.timezone : '',
                                                        'text': data.message,
                                                    });
                                                    console.log('i ', i);
                                                    console.log('contactsData.length ', contactsData.length);
                                                    console.log('i + 1 == contactsData.length ', i + 1 == contactsData.length);
                                                    if (i + 1 == contactsData.length) {
                                                        console.log('msgsaveObj ', msgsaveObj);
                                                        saveMessageHistory(msgsaveObj, function (historyRes) {
                                                            console.log('historyRes ', historyRes);
                                                            if (historyRes.code == config.constant.CODES.OK) {
                                                                callback({'code': config.constant.CODES.OK, "data": data, "message": 'Sent Successfully'});
                                                            } else {
                                                                console.log('Error 3 : ');
                                                                callback({'code': config.constant.CODES.notFound, "message": 'Email Sending Failed'})
                                                            }
                                                        });
                                                    }
                                                });
                                            });
                                        });
                                    } else {
                                        callback({'code': config.constant.CODES.notFound, "message": 'No Contacts found'})
                                    }
                                }
                            });
                        } else {
                            // Call
                            console.log('CALL');
                            contacts.find({'is_deleted': false, 'optout_call': false, 'list_id': {$in: data.contacts}}, function (err, contactsData) {
                                if (err) {
                                    console.log('Error 5 : ', err);
                                    callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
                                } else {
                                    console.log('contactsData ', contactsData);
                                    if (contactsData.length) {
                                        userModel.findOne({_id: req.user._id}).populate('parent_id').exec(function (err, userData) {
                                            if (err) {
                                                console.log('Error 6 : ', err);
                                                callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
                                            } else {
                                                console.log(userData);
                                                if (userData.parent_id.webphone_details.provider == 'plivo') {
                                                    outboundCampaignCallPlivo(req, res, contactsData, data, userData.parent_id.webphone_details, function (callRes) {
                                                        callback(callRes);
                                                    });

                                                } else if (userData.parent_id.webphone_details.provider == 'twilio') {
                                                    outboundCampaignCallTwilio(req, res, contactsData, data, userData.parent_id.webphone_details, function (callRes) {
                                                        callback(callRes);
                                                    });

                                                } else {
                                                    callback({'code': config.constant.CODES.notFound, "message": 'No information of Plivo or Twilio Present in Parent LGN'})
                                                }
                                            }
                                        });

                                    } else {
                                        callback({'code': config.constant.CODES.notFound, "message": 'No Contacts found'})
                                    }
                                }
                            });
                        }
                    } else if (data.frequency == 'weblead') {
                        callback({'code': config.constant.CODES.OK, "data": data, "message": 'Success'});
                    } else {
                        // set agenda
                        contacts.find({'is_deleted': false, 'list_id': {$in: data.contacts}}, function (err, contactsData) {
                            if (err) {
                                console.log('Error 7 : ', err);
                                callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
                            } else {
                                if (contactsData) {
                                    if (data.frequency == 'onetime' && data.method == 'later') {
                                        var cronString = data.minutes + ' ' + data.hours + ' ' + data.date + ' ' + (parseInt(data.month) - 1) + ' *';
                                        console.log(cronString);
                                    } else if (data.frequency == 'recurring' && data.method == 'yearly') {
                                        var cronString = data.minutes + ' ' + data.hours + ' ' + data.date + ' ' + (parseInt(data.month) - 1) + ' *';
                                        console.log(cronString);
                                    } else if (data.frequency == 'recurring' && data.method == 'monthly') {
                                        var cronString = data.minutes + ' ' + data.hours + ' ' + data.date + ' ' + ' * *';
                                        console.log(cronString);
                                    } else if (data.frequency == 'recurring' && data.method == 'weekly') {
                                        var cronString = data.minutes + ' ' + data.hours + ' * * ' + data.day;
                                        console.log(cronString);
                                    } else if (data.frequency == 'recurring' && data.method == 'daily') {
                                        var cronString = data.minutes + ' ' + data.hours + ' * * *';
                                        console.log(cronString);
                                    }


                                    var contact_ids = [];
                                    contactsData.forEach(function (item, i) {
                                        contact_ids.push(item._id);
                                        if (i + 1 == contactsData.length) {
                                            console.log('Agenda');
                                            randomString(5, function (agendaName) {
                                                console.log('agendaName : ', agendaName);
                                                agenda.cancel({name: data.agenda_name}, function (err, numRemoved) {
                                                    console.log('numRemoved : ', numRemoved);
                                                    contactAgenda.update({'_id': data._id}, {$set: {'agenda_name': agendaName}}, function (err, updated) {
                                                        if (err) {
                                                            console.log('Update Error : ', err);
                                                        } else {
                                                            agenda.define(agendaName, function (job, done) {
                                                                console.log('Cron Running----------', new Date());
                                                                console.log('Job----------', job);
                                                                console.log('job.attrs.data', job.attrs.data);
                                                                if (job.attrs.data.mode.toUpperCase() == 'SMS') {
                                                                    console.log('SMS');
                                                                    agendaCtrl.sendSMS(job.attrs.data, function (data) {
                                                                        console.log(data);
                                                                    });
                                                                } else if (job.attrs.data.mode.toUpperCase() == 'CALL') {
                                                                    console.log('CALL');
                                                                    agendaCtrl.outboundCall(req, res, job.attrs.data, function (data) {
                                                                        console.log(data);
                                                                    });
                                                                } else {
                                                                    console.log('Email');
                                                                    agendaCtrl.sendEmail(job.attrs.data, function (data) {
                                                                        console.log(data);
                                                                    });
                                                                }
                                                                done();
                                                            });
                                                            agenda.every(cronString, agendaName, {'agenda_id': data._id, 'user_id': req.user._id, 'contacts': contact_ids, 'description': data.description, 'mode': data.mode, 'sms_header': data.sms_header, 'message': data.message, 'subject': data.subject, 'month': time.month, 'date': time.date, 'hours': time.hours, 'minutes': time.minutes, 'timezone': data.timezone}, {timezone: 'America/New_York'});
                                                            agenda.start();
                                                            callback({'code': config.constant.CODES.OK, "data": data, "message": 'Success'});
                                                        }
                                                    });
                                                });
                                            });
                                        }
                                    });
                                }
                            }
                        });
                    }
                    //callback({'code': config.constant.CODES.OK, "data": data, "message": config.constant.MESSAGES.Success});
                }
            });
        }
    });
}
exports.editComposeMessage = editComposeMessage;
/* @function : listMessageHistory
 *  @author  :
 *  @created  : 09032016
 *  @modified :
 *  @purpose  : To get message history
 */
var listMessageHistory = function (req, res, callback) {
    contactAgenda.find({'user_id': req.user._id, 'is_deleted': false}).populate('contacts').exec(function (err, data) {
        if (err) {
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
        } else {
            callback({'code': config.constant.CODES.OK, "data": data, "message": config.constant.MESSAGES.Success});
        }
    });
//    messageModel.find({isdeleted: false, user_id: req.user._id})
//            .populate('list_id')
//            .exec(function (err, data) {
//                if (err) {
//                    callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
//                } else {
//                    var arr = [];
//                    for (var i = 0; i < data.length; i++) {
//                        if (i == 0) {
//                            arr.push({
//                                '_id': data[i]._id,
//                                'from': data[i].from,
//                                'mode': data[i].mode,
//                                'status': data[i].status,
//                                'to': (data[i].list_id) ? data[i].list_id.list_name : '',
//                                'description': data[i].description,
//                                'timezone': data[i].timezone,
//                                'created': new Date(data[i].sent_time)
//                            });
//                        } else {
//                            if (data[i].list_id && data[i - 1].list_id && data[i].description == data[i - 1].description && data[i].list_id._id == data[i - 1].list_id._id && new Date(data[i].created).toString() == new Date(data[i - 1].created).toString()) {
//                                // same record
//                            } else {
//                                arr.push({
//                                    '_id': data[i]._id,
//                                    'from': data[i].from,
//                                    'mode': data[i].mode,
//                                    'status': data[i].status,
//                                    'to': (data[i].list_id) ? data[i].list_id.list_name : '',
//                                    'description': data[i].description,
//                                    'timezone': data[i].timezone,
//                                    'created': new Date(data[i].sent_time)
//                                });
//                            }
//                        }
//
//                        if (i + 1 == data.length) {
//                            //res.json(arr);
//                            callback({'code': config.constant.CODES.OK, "data": arr, "message": config.constant.MESSAGES.Success});
//                        }
//                    }
//                }
//            });

}

exports.listMessageHistory = listMessageHistory;
/* @function : getMessageHistoryData
 *  @author  :
 *  @created  : 16032016
 *  @modified :
 *  @purpose  : To get message history
 */

var getMessageHistoryData = function (req, res, callback) {
    contactAgenda.findOne({_id: req.body.id})
            .populate('contacts')
            .exec(function (err, data) {
                if (err) {
                    callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
                } else {
                    messageModel.count({status: 'Sent', agenda_id: data._id}, function (err, successcount) {
                        if (err) {
                            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
                        } else {
                            console.log('success : ', successcount);
                            messageModel.count({status: 'Failed', agenda_id: data._id}, function (err, failedcount) {
                                if (err) {
                                    callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
                                } else {
                                    console.log('success : ', failedcount);
                                    callback({'code': config.constant.CODES.OK, "data": data, "success": successcount, "failed": failedcount, "message": config.constant.MESSAGES.Success});
                                }
                            });
                        }
                    });
                }
            });
}

exports.getMessageHistoryData = getMessageHistoryData;
/* @function : sendMessageEdit
 *  @author  :
 *  @created  : 16032016
 *  @modified :
 *  @purpose  : To send edited message
 */

var sendMessageEdit = function (req, res, callback) {
    var data = req.body;
    contacts.find({'is_deleted': false, 'list_id': data.list_id._id}, function (err, contactsData) {
        if (err) {
            console.log('Error 2 : ', err);
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
        } else {
            console.log('contactsData', contactsData);
            if (contactsData) {
                if (data.mode.toUpperCase() == 'SMS') {
                    var dest = '';
                    var contact_ids = [];
                    contactsData.forEach(function (item, i) {
                        contact_ids.push(item._id);
                        if (item.phone_no.charAt(0) == '1') {
                            var ph_no = item.phone_no;
                        } else {
                            var ph_no = '1' + item.phone_no;
                        }
                        dest += (i == 0) ? ph_no : '<' + ph_no;
                        if (i + 1 == contactsData.length) {
                            data.sms_header = data.sms_header.toString();
                            data.message = data.append + ' - ' + data.text;
                            console.log('data.sms_header', data.sms_header);
                            sendMultiSMS(data.message, data.sms_header, dest, req.user._id, function (response) {
                                if (response.code == config.constant.CODES.OK) {
                                    response.contact_ids = contact_ids;
                                    response.bodyData = data;
                                    response.req = req;
                                    response.req.time = {timezone: ''};
                                    saveMessageHistory(response, contactsData, function (historyRes) {
                                        if (historyRes.code == config.constant.CODES.OK) {
                                            callback({'code': config.constant.CODES.OK, "data": data, "message": 'Sent Successfully'});
                                        } else {
                                            console.log('Error 3 : ');
                                            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                                        }
                                    });
                                } else {
                                    callback({'code': config.constant.CODES.notFound, "message": 'Message Sending Failed'})
                                }
                            });
                        }
                    });
                } else {
                    // email
                    data.message = data.text;
                    mails.sendMailToContacts(data.message, data.subject, contactsData, function () {
                        var response = {};
                        response.emails = [];
                        contactsData.forEach(function (item, i) {
                            response.emails.push(item.email);
                            if (i + 1 == contactsData.length) {
                                response.message = req.body.message;
                                response.subject = req.body.subject;
                                response.req = req;
                                response.req.time = {timezone: ''};
                                saveMessageHistory(response, contactsData, function (historyRes) {
                                    if (historyRes.code == config.constant.CODES.OK) {
                                        callback({'code': config.constant.CODES.OK, "data": data, "message": 'Sent Successfully'});
                                    } else {
                                        console.log('Error 3 : ');
                                        callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                                    }
                                });
                            }
                        });
                    });
                }
            }

        }
    });
}

exports.sendMessageEdit = sendMessageEdit;
/* @function : listPhoneNumber
 *  @author  :
 *  @created  : 17032016
 *  @modified :
 *  @purpose  : To get list of phone numbers
 */

var listPhoneNumber = function (req, res, callback) {
    console.log(req.user);
    var createdById = (req.user.role_id.code == 'LGN') ? req.user._id : req.user.parent_id._id;
    var assignedTo = req.user._id; //(req.user.role_id.code == 'LGN') ? req.user._id : req.user.parent_id._id;
    ringToNumber.find({'assigned_to': assignedTo, 'created_by': createdById, 'is_deleted': false, 'provider': req.user.parent_id.webphone_details.provider}).populate('ivr_associated.ivr_id').exec(function (err, phoneNumbers) {
        if (err) {
            console.log(err);
            callback({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error});
        } else {
            callback({'code': config.constant.CODES.OK, 'data': phoneNumbers, "message": config.constant.MESSAGES.Success});
        }
    });
};
exports.listPhoneNumber = listPhoneNumber;
/* @function : getAgendaDetails
 *  @author  :
 *  @created  : 18032016
 *  @modified :
 *  @purpose  : To get Agenda Details by id
 */

var getAgendaDetails = function (req, res, callback) {
    contactAgenda.findOne({'_id': req.body.id}).populate('contacts').exec(function (err, data) {
        if (err) {
            console.log(err);
            callback({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error});
        } else {
            callback({'code': config.constant.CODES.OK, 'data': data, "message": config.constant.MESSAGES.Success});
        }
    });
};
exports.getAgendaDetails = getAgendaDetails;


/* @function : optout
 *  @author  :
 *  @created  : 23032016
 *  @modified :
 *  @purpose  : To opt out contact from email
 */

var optout = function (req, res, callback) {
    var data;
    if (req.body.mode.toUpperCase() == 'SMS') {
        data = {'optout_sms': true};
    } else {
        data = {'optout_email': true};
    }
    contacts.update({'_id': req.body.contact_id}, {$set: data}, function (err, data) {
        if (err) {
            console.log(err);
            callback({'code': config.constant.CODES.Error, "message": 'Some Error Occurred, Please try again later or try refreshing page.'});
        } else {
            callback({'code': config.constant.CODES.OK, 'data': data, "message": 'You have successfully Opt out from ' + req.body.mode.toUpperCase()});
        }
    });
};
exports.optout = optout;


/* @function : message_reply_url
 *  @author  :
 *  @created  : 23032016
 *  @modified :
 *  @purpose  : To opt out contact from sms
 */

var message_reply_url = function (req, res, callback) {
    console.log('In Controller ', req.body);

    var replyObj = req.body;

    // Plivo Reply
//    var replyObj = {To: '14804189690',
//        From: '+918149524302',
//        TotalRate: '0',
//        Units: '1',
//        Text: 'stop',
//        TotalAmount: '0',
//        Type: 'sms',
//        MessageUUID: '052c094c-fa29-11e5-96a7-22000ae98567'};

    // Twilio Reply
//    var replyObj = {ToCountry: 'US',
//        ToState: 'AZ',
//        SmsMessageSid: 'SMbedfc225922fc8201660611763c14840',
//        NumMedia: '0',
//        ToCity: '',
//        FromZip: '36750',
//        SmsSid: 'SMbedfc225922fc8201660611763c14840',
//        FromState: 'AL',
//        SmsStatus: 'received',
//        FromCity: 'MAPLESVILLE',
//        Body: 'test msg',
//        FromCountry: 'US',
//        To: '+14804189690',
//        ToZip: '',
//        NumSegments: '1',
//        MessageSid: 'SMbedfc225922fc8201660611763c14840',
//        AccountSid: 'AC30ea915f45a5b377afe709dba1b9ad49',
//        From: '+13342595659',
//        ApiVersion: '2010-04-01'}

    var text = (replyObj.Text) ? replyObj.Text : replyObj.Body;
    var from = (replyObj.From.charAt(0) == '+') ? replyObj.From.substring(1) : replyObj.From;

    ringToNumbersModel.findOne({'phone_no': from}, function (err, fromnumberData) {
        if (err) {
            callback({'code': config.constant.CODES.Error, "message": 'Error'});
        } else {
            console.log('fromnumberData ', fromnumberData);
            if (!fromnumberData) {
                ringToNumbersModel.findOne({'phone_no': replyObj.To}, function (err, numberData) {
                    var contactNumber;
                    if (replyObj.From.charAt(0) == '1') {
                        contactNumber = replyObj.From.substring(1);
                    } else if (replyObj.From.charAt(0) == '+') {
                        contactNumber = replyObj.From.substring(2);
                    } else {
                        contactNumber = replyObj.From;
                    }
                    console.log('contactNumber ', contactNumber);
                    console.log('numberData ', numberData);
                    console.log('text.toUpperCase() ', text.toUpperCase());
                    if (text.toUpperCase() == 'STOP') {
                        contacts.update({'phone_no': contactNumber}, {$set: {'optout_sms': true}}, function (err, count) {
                            if (err) {
                                console.log(err);
                                var message = 'Some Error Occurred, Please try again later.';
                                sendMultiSMS(message, replyObj.To, replyObj.From, numberData.assigned_to, function (response) {

                                    if (response.code == config.constant.CODES.OK) {
                                        callback({'code': config.constant.CODES.Error, "message": 'Some Error Occurred, Please try again later or try refreshing page.'});
                                    } else {
                                        console.log('Error 2 : ');
                                        callback({'code': config.constant.CODES.Error, "message": 'Some Error Occurred, Please try again later or try refreshing page.'});
                                    }
                                });

                            } else {
                                var message = 'You have successfully Opt out from SMS';
                                sendMultiSMS(message, replyObj.To, replyObj.From, numberData.assigned_to, function (response) {

                                    if (response.code == config.constant.CODES.OK) {
                                        callback({'code': config.constant.CODES.OK, "message": 'You have successfully Opt out from SMS'});
                                    } else {
                                        console.log('Error 3 : ');
                                        callback({'code': config.constant.CODES.Error, "message": 'Some Error Occurred, Please try again later or try refreshing page.'});
                                    }
                                });
                            }
                        });
                    } else {
                        var message = 'Invalid Keyword try sending STOP.';
                        sendMultiSMS(message, replyObj.To, replyObj.From, numberData.assigned_to, function (response) {

                            if (response.code == config.constant.CODES.OK) {
                                callback({'code': config.constant.CODES.OK, "message": 'Success'});
                            } else {
                                console.log('Error 4 : ');
                                callback({'code': config.constant.CODES.Error, "message": 'Error sending Message'});
                            }
                        });
                    }
                });
            } else {
                console.log('Sender cannot be Plivo or twilio.');
                callback({'code': config.constant.CODES.Error, "message": 'Sender cannot be Plivo or twilio.'});
            }
        }
    });

};
exports.message_reply_url = message_reply_url;


/* @function : afterHours
 *  @author  :
 *  @created  : 12042016
 *  @modified :
 *  @purpose  : To opt out contact from sms
 */
var afterHours = function (req, res, campaignData, callback) {
    contactList.findOne({'user_id': campaignData.created_by, 'list_name': 'After Hours List'}, function (err, listData) {
        if (err) {
            callback({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error});
        } else {
            if (listData) {
                // add contact into after hours list
                var saveObj = {
                    phone_no: req.body.From,
                    from_phone_no: req.body.To,
                    list_id: listData._id,
                    base_url: req.protocol + '://' + req.get('host'),
                    offer_id: campaignData.offer_id,
                    nextAttempt: moment().format("MM-DD-YYYY 00:00:00")
                };
                new contacts(saveObj).save(function (err, contactData) {
                    if (err) {
                        callback({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error});
                    } else {
                        callback({'code': config.constant.CODES.OK, 'data': contactData, "message": config.constant.MESSAGES.Success});
                    }
                });
            } else {
                // create new list
                var saveObj = {
                    user_id: campaignData.created_by,
                    list_name: 'After Hours List',
                };
                new contactList(saveObj).save(function (err, listData) {
                    if (err) {
                        callback({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error});
                    } else {

                        // add contact into after hours list
                        var saveObj = {
                            phone_no: req.body.From,
                            from_phone_no: req.body.To,
                            list_id: listData._id,
                            base_url: req.protocol + '://' + req.get('host'),
                            offer_id: campaignData.offer_id,
                            nextAttempt: moment().format("MM-DD-YYYY 00:00:00")
                        };
                        new contacts(saveObj).save(function (err, contactData) {
                            if (err) {
                                callback({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error});
                            } else {
                                callback({'code': config.constant.CODES.OK, 'data': contactData, "message": config.constant.MESSAGES.Success});
                            }
                        });
                    }
                });
            }
        }
    });
};
exports.afterHours = afterHours;



