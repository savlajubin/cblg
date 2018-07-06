/*R&D section*/
var config = require('../../config/constant.js');
var Agenda = require('agenda');
var callModel = require('../models/callHistories'); //To access call history data
var contactAgendaModel = require('../models/contact_agenda'); //To access agenda of contacts
var contactsModel = require('../models/contact');
var messageModel = require('../models/message_history');
var offerModel = require('../models/offer');
var contactCtrl = require('../controllers/contact');
var mailCtrl = require('../controllers/send_mail');
var Account = require('../models/accounts'); //To access call history data
var userModel = require('../models/user'); //To access call history data
var contactListModel = require('../models/contact_list');
var plivoCallCtrl = require('../controllers/calls');
var twilioCallCtrl = require('../controllers/twilioCalls');
var agenda = new Agenda({db: {address: 'localhost:27017/db_callbasedleadgen'}});
var smtpTransport = require('nodemailer-smtp-transport');
var nodemailer = require('nodemailer');
var _ = require('underscore');
var sendgrid = require('sendgrid')(config.constant.SEND_GRID.username, config.constant.SEND_GRID.password);

/*var amazonSes = require('node-ses')
 , client = amazonSes.createClient({
 key: config.constant.AMAZON_AWS.key,
 secret: config.constant.AMAZON_AWS.secret
 });*/

var plivo = require('plivo');
var moment = require('moment');
var shorturl = require('shorturl');
//var ObjectID = require('mongodb').ObjectID;

var Users = require('../models/user.js');
var mongoose = require('mongoose'); //Added to convert string to ObjectId

agenda.define('Process all payable calls', function (job, done) {
    getPaymentData();
    done();
});
agenda.every('1 day', 'Process all payable calls', {time: new Date(), to: 'orparttj@yopmail.com'});
/*-------------New ---------------------*/
agenda.define('After Hours', function (job, done) {
    console.log('After Hours Cron Running----------');
    afterHoursCall2(function (data) {
        console.log('final ', data);
    });
    done();
});
agenda.every('1 minute', 'After Hours', {time: new Date()});
agenda.start();
/* @function    : afterHoursCall
 *  @Creator    : smartData
 *  @created    : 12042016
 *  @purpose    : To call the numbers present in after hours list
 */



var afterHoursCall = function () {
    contactListModel.find({'list_name': 'After Hours List'}, function (err, listData) {
        if (err) {
            console.log('Error 1 ', err);
        } else {
            console.log('listData ', listData);
            var listIdArr = [];
            var userIdArr = [];
            var temp = {};
            listData.forEach(function (item, i) {
                listIdArr.push(item._id);
                userIdArr.push(item.user_id);
                temp[item.user_id] = item._id;
                if (i + 1 == listData.length) {
                    console.log('userIdArr ', userIdArr);
                    userModel.find({'_id': {$in: userIdArr}})
                            .populate('parent_id')
                            .exec(function (err, usersData) {
                                if (err) {
                                    console.log('Error 2 ', err);
                                } else {
                                    console.log('listIdArr ', listIdArr);
                                    contactsModel.aggregate(
                                            [
                                                // {$project: {_id: 1, first_name: 1, created: 1}},
                                                //{$project: {'_id': 1, 'phone_no': 1, 'from_phone_no': 1}},
                                                {$match: {list_id: {$in: listIdArr}}},
                                                //{$group: {_id: '$list_id', phone_no: {'$push': '$$ROOT'}, from_phone_no: {'$push': '$from_phone_no'}}}
                                                {$group: {_id: "$list_id", phone_no: {$push: "$ROOT"}}}
                                            ], function (err, contactsData) {
//                                    contactsModel.find({'list_id': {$in: listIdArr}, 'no_of_attempt': {$lte: 8}}, function (err, contactsData) {
                                        if (err) {
                                            console.log('Error 3 ', err);
                                        } else {

                                            console.log('contactsData ', contactsData);
//                                            usersData.forEach(function (singleUserData) {
//
//                                                var thisContactData = _.find(contactsData, function (contact) {
//                                                    return contact.list_id == temp[singleUserData._id]
//                                                })
//
//                                                var agendaData = {'phone_no': thisContactData.from_phone_no};
//                                                if (singleUserData.parent_id.webphone_details.provider == 'plivo') {
//                                                    plivoCallCtrl.outboundCampaignCallPlivo('', '', thisContactData, agendaData, singleUserData.parent_id.webphone_details, function (callRes) {
//                                                        callback(callRes);
//                                                    });
//                                                } else if (singleUserData.parent_id.webphone_details.provider == 'twilio') {
//                                                    twilioCallCtrl.outboundCampaignCallTwilio('', '', thisContactData, agendaData, singleUserData.parent_id.webphone_details, function (callRes) {
//                                                        callback(callRes);
//                                                    });
//                                                } else {
//                                                    callback({'code': config.constant.CODES.notFound, "message": 'No information of Plivo or Twilio Present in Parent LGN'})
//                                                }
//                                            });
                                        }
                                    });
                                }
                            });
                }
            });
        }
    });
};

//afterHoursCall();


/* @function    : afterHoursCall2
 *  @Creator    : smartData
 *  @created    : 12042016
 *  @purpose    : To call the numbers present in after hours list
 */
var afterHoursCall2 = function (callback) {
    contactListModel.find({'list_name': 'After Hours List'}, function (err, listData) {
        if (err) {
            console.log('Error 1 ', err);
        } else {
            //console.log('listData ', listData);
            listData.forEach(function (item, i) {
                userModel.findOne({'_id': item.user_id})
                        .populate('parent_id')
                        .exec(function (err, usersData) {
                            if (err) {
                                console.log('Error 2 ', err);
                            } else {
                                contactsModel.find({'list_id': item._id, 'is_deleted': false, 'optout_call': false, 'no_of_attempt': {$lte: 8}, 'nextAttempt': {$lte: moment().format('MM-DD-YYYY 00:00:00')}}, function (err, contactsData) {
                                    if (err) {
                                        console.log('Error 3 ', err);
                                    } else {
                                        // console.log('contactsData ', contactsData);
                                        contactsData.forEach(function (singleContact, index) {
                                            offerModel.findOne({'_id': singleContact.offer_id, 'is_deleted': false})
                                                    //.populate('compose_message.pre_record_prompt')
                                                    //.populate('compose_message.pre_record_prompt_amd')
                                                    //.populate('compose_message.whisper_prompt')
                                                    .exec(function (err, offerData) {
                                                        if (err) {
                                                            console.log('Error 4 ', err);
                                                        } else {
                                                            //   console.log('offerData ', offerData);
//                                                    var contactsArr = [];
//                                                    contactsArr.push(singleContact);

                                                            var currentTime = moment().format("HHmm");
                                                            var currentDay = moment().format("ddd");
                                                            var offerHOO = _.find(offerData.hoo_schema, function (d) {
                                                                var isDayCorrect = _.countBy(d.days, function (dayName) {
                                                                    return dayName.name == currentDay;
                                                                })['true'];
                                                                var notRoundTime = !d.round_time && d.call_range_start <= currentTime && d.call_range_end >= currentTime;
                                                                var roundTime = d.round_time && (d.call_range_start <= currentTime || d.call_range_end >= currentTime);
                                                                return (roundTime || notRoundTime) && isDayCorrect; //true if HOO & false if afterHOO
                                                            });

                                                            console.log(moment().add("days", 1).toString());
                                                            var nextAttemptDate = moment().add("days", 1).format('MM-DD-YYYY 00:00:00');
                                                            if (offerHOO && usersData.parent_id.webphone_details.provider == 'plivo') {
                                                                plivoCallCtrl.outboundCampaignCallPlivo({}, {}, [singleContact], offerData.compose_message, usersData.parent_id.webphone_details, function (callRes) {
                                                                    console.log('PLivo ', callRes);
                                                                    if (callRes.code == config.constant.CODES.OK) {
                                                                        var no_of_attemptUpdated = singleContact.no_of_attempt + 1;
                                                                        contactsModel.update({'_id': singleContact._id}, {$set: {'nextAttempt': nextAttemptDate, 'no_of_attempt': no_of_attemptUpdated}}, function (err, count) {
                                                                            if (err) {
                                                                                console.log('Error 5 ', err);
                                                                            } else {
                                                                                console.log('plivo count update ', count);
                                                                            }
                                                                        });
                                                                    } else {
                                                                        console.log('plivo call not made');
                                                                    }

                                                                });
                                                            } else if (offerHOO && usersData.parent_id.webphone_details.provider == 'twilio') {
                                                                twilioCallCtrl.outboundCampaignCallTwilio({}, {}, [singleContact], offerData.compose_message, usersData.parent_id.webphone_details, function (callRes) {
                                                                    console.log('twilio ', callRes);
                                                                    if (callRes.code == config.constant.CODES.OK) {
                                                                        var no_of_attemptUpdated = singleContact.no_of_attempt + 1;
                                                                        contactsModel.update({'_id': singleContact._id}, {$set: {'nextAttempt': nextAttemptDate, 'no_of_attempt': no_of_attemptUpdated}}, function (err, count) {
                                                                            if (err) {
                                                                                console.log('Error 6 ', err);
                                                                            } else {
                                                                                console.log('twilio count update ', count);
                                                                            }
                                                                        });
                                                                    } else {
                                                                        console.log('twilio call not made');
                                                                    }
                                                                });
                                                            } else {
                                                                console.log('else me gaya bhaii')
                                                                console.log('No information of Plivo or Twilio Present in Parent LGN or After Hoo');
//                                                                callback({'code': config.constant.CODES.notFound, "message": 'No information of Plivo or Twilio Present in Parent LGN'})
                                                            }
                                                        }
                                                    });
                                        });

                                    }
                                });
                            }
                        });
            });
        }
    });
};



/* @function    : isEmptyObject
 *  @Creator    : smartData
 *  @created    : 22022016
 */

var setAgenda = function () {
    console.log('1');
    contactAgendaModel.find({'is_deleted': false}, function (err, data) {
        if (err) {
            console.log('Error');
        } else {
            console.log('2', data);
            if (data) {
                data.forEach(function (item) {
                    console.log('3', item);
                    if (item.method == "daily") {
                        console.log('4');
                        console.log(item.minutes + ' ' + item.hours + ' * * *');
                        var daily = item.minutes + ' ' + item.hours + ' * * *';
                        agenda.every(daily, 'daily', {'contacts': item.contacts, 'mode': item.mode, 'message': item.message, 'subject': item.subject});
                    } else if (item.method == "weekly") {
                        agenda.every(item.minutes + ' ' + item.hours + ' * * ' + item.day, 'weekly', {'contacts': item.contacts, 'mode': item.mode, 'message': item.message, 'subject': item.subject});
                    } else if (item.method == "monthly") {
                        var d = new Date();
                        var month = d.getMonth();
                        agenda.every(item.minutes + ' ' + item.hours + ' ' + item.date + ' ' + month + ' *', 'monthly', {'contacts': item.contacts, 'mode': item.mode, 'message': item.message, 'subject': item.subject});
                    }
                });
            }
            agenda.start();
        }
    });
}
//setAgenda();

/* @function    : isEmptyObject
 *  @Creator    : smartData
 *  @created    : 28092015
 */

var isEmptyObject = function (obj) {
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
}

var getPaymentData = function () {
    callModel.find({$and: [{'isdeleted': false}, {'is_billable': true}]}, {'From': 1, 'To': 1, 'campaignData': 1}, function (err, foundData) {
        if (err) {
            console.log('Error : Call Histories Data Not found to execute Agenda');
        } else {
            foundData.forEach(function (result, foundDataValue) {
                if (err) {
                    console.log('Error : Call Histories Data Not found to execute forEach');
                } else {
                    var lbTotalAmount, lgpayableAmount, lgnpayableAmount;
                    if (result.campaignData && result.campaignData.offer_id) {
                        if (result.campaignData.offer_id.pay_per_call && result.campaignData.offer_id.pay_per_call.lbamount && result.campaignData.offer_id.pay_per_call.lgamount && result.campaignData.offer_id.pay_per_call.lgnamount) {
                            lbTotalAmount = result.campaignData.offer_id.pay_per_call.lbamount;
                            lgpayableAmount = result.campaignData.offer_id.pay_per_call.lgamount;
                            lgnpayableAmount = result.campaignData.offer_id.pay_per_call.lgnamount;
                        }
                        var idArray = [];
                        idArray.push(result.campaignData.created_by);
                        idArray.push(result.campaignData.parent_lgn);
                        Users.findOne({'_id': result.campaignData.offer_id.user_id}, {first_name: 1, last_name: 1, role_id: 1, email: 1, addressLine1: 1, city: 1, state: 1, country: 1, zipcode: 1}).populate('role_id', {code: 1}).exec(function (err, lb_advccUser) {
                            if (err) {
                                console.log('Error : AccountPayers User details not found');
                                //callback(err);
                            } else if (isEmptyObject(lb_advccUser)) {
                                console.log('Empty Data');
                            } else {
                                var lb_advccUserAddr = lb_advccUser.addressLine1 + ',' + lb_advccUser.city + ',<br>' + lb_advccUser.state + ',' + lb_advccUser.country + '-' + lb_advccUser.zipcode;
                                Users.find({'_id': {$in: idArray}}, {first_name: 1, last_name: 1, role_id: 1, email: 1, addressLine1: 1, city: 1, state: 1, country: 1, zipcode: 1}).populate('role_id', {code: 1}).exec(function (err, users) {
                                    if (err) {
                                        //callback(err);
                                        console.log('Error : AccountReceivers User details not found');
                                    } else {
                                        users.forEach(function (result2, usersValue) {
                                            var result2Addr = result2.addressLine1 + ',' + result2.city + ',<br>' + result2.state + ',' + result2.country + '-' + result2.zipcode;
                                            var accountEntry = {
                                                invoice_no: 'PSX_' + mongoose.Types.ObjectId(), //new ObjectID(),
                                                amount: result2.role_id.code == 'LGN' ? lgnpayableAmount : lgpayableAmount,
                                                owedTo: result2.first_name + ' ' + result2.last_name,
                                                owedToID: result2._id,
                                                userType: result2.role_id.code,
                                                callHistoriesID: result._id,
                                                item: result.campaignData.offer_id.vertical_category_details.category_name,
                                                description: result.campaignData.offer_id.vertical_category_details.title,
                                                payerType: lb_advccUser.role_id.code,
                                                pay_from: lb_advccUser.first_name + ' ' + lb_advccUser.last_name,
                                                pay_fromID: lb_advccUser._id
                                            }
                                            new Account(accountEntry).save(function (err, data) {
                                                if (err) {
                                                    if (foundData.length == foundDataValue + 1 && users.length == usersValue + 1) {
                                                        //callback(err);
                                                        console.log('Error : Agenda Execution Done, Data saved with Errors');
                                                    }
                                                } else {
                                                    var dataCreated = moment(data.created).format("DD/MM/YYYY");
                                                    var dataDueDate = moment(data.dueDate).format("DD/MM/YYYY");
                                                    var invoice = {
                                                        "from_name": data.pay_from,
                                                        "from_address": lb_advccUserAddr,
                                                        "to_name": data.owedTo,
                                                        "to_address": result2Addr,
                                                        "heading": '',
                                                        "invoice_number": data.invoice_no,
                                                        "invoice_date": dataCreated,
                                                        "payment_due_date": dataDueDate,
                                                        "unit_price": data.amount,
                                                        "description": data.description,
                                                        "item": data.item,
                                                        "qty": 1,
                                                    }

                                                    /*var transporter = nodemailer.createTransport({
                                                     service  :   'Gmail',
                                                     auth :  {
                                                     user: "testrth1@gmail.com",//"testrth1@gmail.com",//sendMailData.username,
                                                     pass: "smartdata",//sendMailData.password
                                                     }
                                                     });
                                                     var mailOptions     = {
                                                     from: 'support@callbasedleadgeneration.com', // sender address
                                                     // from : 'testrnodemailerth1@gmail.com',
                                                     to: [result2.email,lb_advccUser.email], // list of receivers
                                                     subject: "CallBasedLeadGeneration - Invoice mail", // Subject line
                                                     html :'<form print-section id="invoice_form" name="invoice_form" action="" method="post" enctype="multipart/form-data" style="padding:0;"> <table print-table="people" id="main_table_wrapper"> <tr> <td> <!-- TB 1 --> <table style="width:100%; margin-left:0px;"> <tr> <td style="text-align:left;padding-top:15px;"> <!-- TB 2 --> <table > <tr print-remove> <td style="height:10px;"></td> </tr> <tr> <td colspan=100 width="100%" class="td-1"> <!-- TB 3 --> <table border=0 cellpadding=0 cellspacing=0 width="100%" class="table-1"> <tr> <td> <table border=0 cellpadding=0 cellspacing=0 style="width:100%;"> <tr style="vertical-align:bottom;"> <td style="padding:0px; margin:0px;"><font style="font-size:18px;font-family:verdana;color:#3c3c3c;">From</font></td> <td style="padding:0px; margin:0px;text-align:right;"> <font style="font-size:28px;font-weight:bold; letter-spacing:5px; font-family:arial;color:#808080;"> <span id="invoiceHeadlineNoLogo" style="position:relative; z-index:100; margin-bottom:-14px;"> <b>'+invoice.heading+'</b> </span> </font> </td> </tr> </table> </td> </tr> <tr> <td><!-- TB 4 --> <table border=0 cellspacing=0 cellpadding=0 style="width:100%;"> <tr> <td rowspan=2 style="vertical-align:top;"><!-- TB 5 --> <table border=0 cellpadding=0 cellspacing=0 style="margin-top:5px;"> <tr style="height:25px;"> <td ng-show="invoice.from_name"> '+invoice.from_name+', </td> </tr> <tr> <td style="height:5px;"></td> </tr> <tr> <td ng-show="invoice.from_address">'+invoice.from_address+',</td> </tr> <tr> <td style="padding:0px; margin:0px;padding-top:25px;padding-bottom:5px;"><font style="font-size:18px;font-family:verdana;color:#3c3c3c;">To</font></td> </tr> <tr style="height:25px;"> <td ng-show="invoice.to_name"> '+invoice.to_name+', </td> </tr> <tr> <td style="height:5px;"></td> </tr> <tr > <td ng-show="invoice.to_address">'+invoice.to_address+'</td> </tr> <!-- TB 5 --> </table></td> <td style="border:0px solid red; padding-right:0px; width:495px; text-align:right;vertical-align:top;"></td> </tr> <tr> <td style="vertical-align:bottom;"><!-- TB 5 --> <table border=0 cellpadding=0 cellspacing=0 style="width:100%; height:100%; vertical-align:bottom;border:1px solid white;"> <tr> <td style="width:155px;"></td> <td></td> <td></td> </tr> <tr> <td colspan=3><div id="invoiceHeadlineWhenLogo" style="display:none; float:right; vertical-align:top;margin-top:5px;margin-bottom:20px;text-align:right;letter-spacing:3px;font-size:22px;color:#3c3c3c;font-weight:normal;font-family:arial;"> <br> <input id="invoice_heading_copy" style="text-align:right; padding-top:3px; padding-bottom:3px; padding-right:8px; width:200px; font-weight:normal; letter-spacing:3px; font-family:arial;font-size:22px;color:#3c3c3c;" class="invoiceForm_fromNameTD" type=text value="INVOICE"> </div></td> </tr> <tr style="height:25px;"> <td></td> <td style="width:146px; padding-right:8px;text-align:right;font-weight:bold;font-family:verdana;font-size:13px;color:#3c3c3c;"> Invoice # : </td> <td >'+invoice.invoice_number+' <span ng-if="!invoice.invoice_number"> </span></td> </tr> <tr> <td style="height:5px;"></td> </tr> <tr id="po_numberBlankTR" style="display:none;"> <td style="height:5px;"></td> </tr> <tr style="height:25px;"> <td></td> <td style="padding-right:8px;text-align:right;font-weight:bold;font-family:verdana;font-size:13px;color:#3c3c3c;"> Invoice Date : </td> <td > '+invoice.invoice_date+' </td> </tr> <tr> <td style="height:5px;"></td> </tr> <tr style="height:25px;"> <td></td> <td style="padding-right:8px;text-align:right;font-weight:bold;font-family:verdana;font-size:13px;color:#3c3c3c;"> Due Date : </td> <td > '+invoice.payment_due_date+' </td> </tr> <!-- TB 5 --> </table></td> </tr> <!-- TB 4 --> </table></td> </tr> <tr> <td colspan=100 style="width:100%;vertical-align:top;padding-top:35px;"><!-- TB 4 --> <table id="dataTable" border=1 cellpadding=0 cellspacing=0 width="100%" style="vertical-align:top;"> <tbody> <tr id="topRow" style="background-color:#54A0E7;height:30px;"> <th style="color:#FFFFFD;font-family:arial;font-size:14px;font-weight:400;padding-left:8px;text-align:left;">Item</th> <th style="color:#FFFFFD;font-family:arial;font-size:14px;font-weight:400;padding-left:5px;text-align:left;">Description</th> <th style="color:#FFFFFD;font-family:arial;font-size:14px;font-weight:400;padding-left:0px;text-align:right;padding-right:4px;">Lead/Call Price</th> <th style="color:#FFFFFD;font-family:arial;font-size:14px;font-weight:400;padding-left:0px;text-align:right;padding-right:4px;">Quantity</th> <th style="color:#FFFFFD;font-family:arial;font-size:14px;font-weight:400;padding-left:0px;text-align:right;padding-right:10px;">Amount</th> </tr> <tr class="invoiceHeadRow"> <td class="invoiceItem">'+(invoice.item) +'</td> <td class="invoiceDescription">'+(invoice.description) +'</td> <td class="invoicePriceOrQty">'+(invoice.unit_price) +'</td> <td class="invoicePriceOrQty">'+(invoice.qty) +'</td> <td class="invoiceAmount"> '+(invoice.unit_price*invoice.qty) +' </td> </tr> </tbody> </table></td> </tr> <tr> </tr> <tr> <td>&nbsp;</td> </tr> <tr> <td>&nbsp;</td> </tr> <tr> <td><!-- TB 4 --> <table border=0 cellpadding=0 cellspacing=0 style="width:100%;"> <tr> <td style="width:50%;vertical-align:top;"><!-- TB 5 --> <table cellspacing=0 cellpadding=0> <tr> <td style="padding-left:2px; font-family:verdana; font-size:13px; color:#3c3c3c; font-weight:bold;"> Invoice Notes </td> </tr> <tr> <td style="padding-top:3px;"> *Please Provide default invoice Note content </td> </tr> <!-- TB 5 --> </table></td> <td style="vertical-align:top;width:65%;float:right;"><!-- TB 5 --> <table id="table_sums" border=0 cellpadding=0 cellspacing=0> <tr> <td>&nbsp;</td> </tr> <tr> <td style="width:15px; border-top:2px solid #eaedee;">&nbsp;</td> <td style="width:200px; border-top:2px solid #eaedee;font-family:verdana; font-size:13px; color:#3c3c3c; font-weight:bold;padding-top:6px;padding-bottom:3px;"> Subtotal </td> <td style="text-align:right;padding-right:4px;border-right:1px solid white;border-top:2px solid #eaedee;border-left:1px solid white;padding-top:6px;padding-bottom:3px;"> <!-- <input style="border:0px solid white;text-align:right; width:100px; padding-right:5px; font-weight:normal; font-family:verdana;font-size:13px;color:#3c3c3c;" readonly type=text id="sum_subtotal" name="sum_subtotal" value="0.00"> --> '+(invoice.unit_price*invoice.qty )+' </td> </tr> <tr id="sum_blankSubtotalTR" style="height:3px;display:none;"> <td></td> </tr> <tr id="sum_blankAfterDiscountOrTaxTR" style="height:7px;"> <td></td> </tr> <tr> <td style="width:15px; border-top:2px solid #eaedee;">&nbsp;</td> <td style="border-top:2px solid #eaedee;font-family:verdana; font-size:13px; color:#3c3c3c; font-weight:bold;padding-top:7px;"> Total </td> <td style="padding-top:7px; text-align:right;padding-right:4px;border-right:1px solid white;border-top:2px solid #eaedee;border-left:1px solid white;"> '+(invoice.unit_price*invoice.qty) +' </td> </tr> <!-- amount paid --> <tr> <td style="width:15px; border-top:0px solid #eaedee;">&nbsp;</td> <td style="border-top:0px solid #eaedee;font-family:verdana; font-size:13px; color:#3c3c3c; font-weight:bold;"> Amount Paid </td> <td style="padding-bottom:7px;text-align:right;padding-right:4px;border-right:1px solid white;border-top:0px solid #eaedee;border-left:1px solid white;"> '+0+' </td> </tr> <!-- balance due --> <tr style="background-color:#FBFF9E;"> <td style="background-color:#FBFF9E;width:15px; border-top:2px solid #eaedee;">&nbsp;</td> <td style="background-color:#FBFF9E;width:200px; border-top:2px solid #eaedee;font-family:verdana; font-size:13px; color:#3c3c3c; font-weight:bold;padding-top:7px;padding-bottom:7px;"> Balance Due&nbsp;<span id="currency_code_output" style="font-family:verdana; font-size:13px; color:#3c3c3c; font-weight:normal;"></span> </td> <td style="background-color:#FBFF9E;text-align:right;padding-right:4px;border-right:1px solid white;border-top:2px solid #eaedee;border-left:1px solid #FBFF9E;"> $'+(invoice.unit_price*invoice.qty) +' </td> </tr> <!-- TB 5 --> </table></td> </tr> <tr> <td>&nbsp;</td> </tr> <!-- TB 4 --> </table></td> </tr> <!-- TB 3 --> </table> </td> </tr> <!-- TB 2 --> </table> </td> </tr> <!-- TB 1 --> </table> <!-- end main table wrapper --> </td> </tr> </table></form>'
                                                     };
                                                     transporter.sendMail(mailOptions, function(err, info){
                                                     if(err){
                                                     console.log("System Error : "+err);
                                                     callback({'code':config.constant.CODES.notFound})
                                                     }else{
                                                     console.log('Mail sent');
                                                     
                                                     }
                                                     })
                                                     */
                                                    /*var email = new sendgrid.Email({
                                                     from: 'support@callbasedleadgeneration.com', // sender address
                                                     to: [result2.email, lb_advccUser.email], // list of receivers
                                                     subject: "CBL : Auto-Generated Invoice for " + data.invoice_no, // Subject line
                                                     html: '<form print-section id="invoice_form" name="invoice_form" action="" method="post" enctype="multipart/form-data" style="padding:0;"> <table print-table="people" id="main_table_wrapper"> <tr> <td> <!-- TB 1 --> <table style="width:100%; margin-left:0px;"> <tr> <td style="text-align:left;padding-top:15px;"> <!-- TB 2 --> <table > <tr print-remove> <td style="height:10px;"></td> </tr> <tr> <td colspan=100 width="100%" class="td-1"> <!-- TB 3 --> <table border=0 cellpadding=0 cellspacing=0 width="100%" class="table-1"> <tr> <td> <table border=0 cellpadding=0 cellspacing=0 style="width:100%;"> <tr style="vertical-align:bottom;"> <td style="padding:0px; margin:0px;"><font style="font-size:18px;font-family:verdana;color:#3c3c3c;">From</font></td> <td style="padding:0px; margin:0px;text-align:right;"> <font style="font-size:28px;font-weight:bold; letter-spacing:5px; font-family:arial;color:#808080;"> <span id="invoiceHeadlineNoLogo" style="position:relative; z-index:100; margin-bottom:-14px;"> <b>' + invoice.heading + '</b> </span> </font> </td> </tr> </table> </td> </tr> <tr> <td><!-- TB 4 --> <table border=0 cellspacing=0 cellpadding=0 style="width:100%;"> <tr> <td rowspan=2 style="vertical-align:top;"><!-- TB 5 --> <table border=0 cellpadding=0 cellspacing=0 style="margin-top:5px;"> <tr style="height:25px;"> <td ng-show="invoice.from_name"> ' + invoice.from_name + ', </td> </tr> <tr> <td style="height:5px;"></td> </tr> <tr> <td ng-show="invoice.from_address">' + invoice.from_address + ',</td> </tr> <tr> <td style="padding:0px; margin:0px;padding-top:25px;padding-bottom:5px;"><font style="font-size:18px;font-family:verdana;color:#3c3c3c;">To</font></td> </tr> <tr style="height:25px;"> <td ng-show="invoice.to_name"> ' + invoice.to_name + ', </td> </tr> <tr> <td style="height:5px;"></td> </tr> <tr > <td ng-show="invoice.to_address">' + invoice.to_address + '</td> </tr> <!-- TB 5 --> </table></td> <td style="border:0px solid red; padding-right:0px; width:495px; text-align:right;vertical-align:top;"></td> </tr> <tr> <td style="vertical-align:bottom;"><!-- TB 5 --> <table border=0 cellpadding=0 cellspacing=0 style="width:100%; height:100%; vertical-align:bottom;border:1px solid white;"> <tr> <td style="width:155px;"></td> <td></td> <td></td> </tr> <tr> <td colspan=3><div id="invoiceHeadlineWhenLogo" style="display:none; float:right; vertical-align:top;margin-top:5px;margin-bottom:20px;text-align:right;letter-spacing:3px;font-size:22px;color:#3c3c3c;font-weight:normal;font-family:arial;"> <br> <input id="invoice_heading_copy" style="text-align:right; padding-top:3px; padding-bottom:3px; padding-right:8px; width:200px; font-weight:normal; letter-spacing:3px; font-family:arial;font-size:22px;color:#3c3c3c;" class="invoiceForm_fromNameTD" type=text value="INVOICE"> </div></td> </tr> <tr style="height:25px;"> <td></td> <td style="width:146px; padding-right:8px;text-align:right;font-weight:bold;font-family:verdana;font-size:13px;color:#3c3c3c;"> Invoice # : </td> <td >' + invoice.invoice_number + ' <span ng-if="!invoice.invoice_number"> </span></td> </tr> <tr> <td style="height:5px;"></td> </tr> <tr id="po_numberBlankTR" style="display:none;"> <td style="height:5px;"></td> </tr> <tr style="height:25px;"> <td></td> <td style="padding-right:8px;text-align:right;font-weight:bold;font-family:verdana;font-size:13px;color:#3c3c3c;"> Invoice Date : </td> <td > ' + invoice.invoice_date + ' </td> </tr> <tr> <td style="height:5px;"></td> </tr> <tr style="height:25px;"> <td></td> <td style="padding-right:8px;text-align:right;font-weight:bold;font-family:verdana;font-size:13px;color:#3c3c3c;"> Due Date : </td> <td > ' + invoice.payment_due_date + ' </td> </tr> <!-- TB 5 --> </table></td> </tr> <!-- TB 4 --> </table></td> </tr> <tr> <td colspan=100 style="width:100%;vertical-align:top;padding-top:35px;"><!-- TB 4 --> <table id="dataTable" border=1 cellpadding=0 cellspacing=0 width="100%" style="vertical-align:top;"> <tbody> <tr id="topRow" style="background-color:#54A0E7;height:30px;"> <th style="color:#FFFFFD;font-family:arial;font-size:14px;font-weight:400;padding-left:8px;text-align:left;">Item</th> <th style="color:#FFFFFD;font-family:arial;font-size:14px;font-weight:400;padding-left:5px;text-align:left;">Description</th> <th style="color:#FFFFFD;font-family:arial;font-size:14px;font-weight:400;padding-left:0px;text-align:right;padding-right:4px;">Lead/Call Price</th> <th style="color:#FFFFFD;font-family:arial;font-size:14px;font-weight:400;padding-left:0px;text-align:right;padding-right:4px;">Quantity</th> <th style="color:#FFFFFD;font-family:arial;font-size:14px;font-weight:400;padding-left:0px;text-align:right;padding-right:10px;">Amount</th> </tr> <tr class="invoiceHeadRow"> <td class="invoiceItem">' + (invoice.item) + '</td> <td class="invoiceDescription">' + (invoice.description) + '</td> <td class="invoicePriceOrQty">' + (invoice.unit_price) + '</td> <td class="invoicePriceOrQty">' + (invoice.qty) + '</td> <td class="invoiceAmount"> ' + (invoice.unit_price * invoice.qty) + ' </td> </tr> </tbody> </table></td> </tr> <tr> </tr> <tr> <td>&nbsp;</td> </tr> <tr> <td>&nbsp;</td> </tr> <tr> <td><!-- TB 4 --> <table border=0 cellpadding=0 cellspacing=0 style="width:100%;"> <tr> <td style="width:50%;vertical-align:top;"><!-- TB 5 --> <table cellspacing=0 cellpadding=0> <tr> <td style="padding-left:2px; font-family:verdana; font-size:13px; color:#3c3c3c; font-weight:bold;"> Invoice Notes </td> </tr> <tr> <td style="padding-top:3px;"> *Please Provide default invoice Note content </td> </tr> <!-- TB 5 --> </table></td> <td style="vertical-align:top;width:65%;float:right;"><!-- TB 5 --> <table id="table_sums" border=0 cellpadding=0 cellspacing=0> <tr> <td>&nbsp;</td> </tr> <tr> <td style="width:15px; border-top:2px solid #eaedee;">&nbsp;</td> <td style="width:200px; border-top:2px solid #eaedee;font-family:verdana; font-size:13px; color:#3c3c3c; font-weight:bold;padding-top:6px;padding-bottom:3px;"> Subtotal </td> <td style="text-align:right;padding-right:4px;border-right:1px solid white;border-top:2px solid #eaedee;border-left:1px solid white;padding-top:6px;padding-bottom:3px;"> <!-- <input style="border:0px solid white;text-align:right; width:100px; padding-right:5px; font-weight:normal; font-family:verdana;font-size:13px;color:#3c3c3c;" readonly type=text id="sum_subtotal" name="sum_subtotal" value="0.00"> --> ' + (invoice.unit_price * invoice.qty) + ' </td> </tr> <tr id="sum_blankSubtotalTR" style="height:3px;display:none;"> <td></td> </tr> <tr id="sum_blankAfterDiscountOrTaxTR" style="height:7px;"> <td></td> </tr> <tr> <td style="width:15px; border-top:2px solid #eaedee;">&nbsp;</td> <td style="border-top:2px solid #eaedee;font-family:verdana; font-size:13px; color:#3c3c3c; font-weight:bold;padding-top:7px;"> Total </td> <td style="padding-top:7px; text-align:right;padding-right:4px;border-right:1px solid white;border-top:2px solid #eaedee;border-left:1px solid white;"> ' + (invoice.unit_price * invoice.qty) + ' </td> </tr> <!-- amount paid --> <tr> <td style="width:15px; border-top:0px solid #eaedee;">&nbsp;</td> <td style="border-top:0px solid #eaedee;font-family:verdana; font-size:13px; color:#3c3c3c; font-weight:bold;"> Amount Paid </td> <td style="padding-bottom:7px;text-align:right;padding-right:4px;border-right:1px solid white;border-top:0px solid #eaedee;border-left:1px solid white;"> ' + 0 + ' </td> </tr> <!-- balance due --> <tr style="background-color:#FBFF9E;"> <td style="background-color:#FBFF9E;width:15px; border-top:2px solid #eaedee;">&nbsp;</td> <td style="background-color:#FBFF9E;width:200px; border-top:2px solid #eaedee;font-family:verdana; font-size:13px; color:#3c3c3c; font-weight:bold;padding-top:7px;padding-bottom:7px;"> Balance Due&nbsp;<span id="currency_code_output" style="font-family:verdana; font-size:13px; color:#3c3c3c; font-weight:normal;"></span> </td> <td style="background-color:#FBFF9E;text-align:right;padding-right:4px;border-right:1px solid white;border-top:2px solid #eaedee;border-left:1px solid #FBFF9E;"> $' + (invoice.unit_price * invoice.qty) + ' </td> </tr> <!-- TB 5 --> </table></td> </tr> <tr> <td>&nbsp;</td> </tr> <!-- TB 4 --> </table></td> </tr> <!-- TB 3 --> </table> </td> </tr> <!-- TB 2 --> </table> </td> </tr> <!-- TB 1 --> </table> <!-- end main table wrapper --> </td> </tr> </table></form>'
                                                     });
                                                     sendgrid.send(email, function (err, json) {
                                                     if (err) {
                                                     return console.error(err);
                                                     }
                                                     //To save token
                                                     });*/

                                                    /* Send Email through Amazon Aws Ses */
                                                    var to = [result2.email, lb_advccUser.email];
                                                    var subject = "PSX : Auto-Generated Invoice for " + data.invoice_no;
                                                    var message = '<form print-section id="invoice_form" name="invoice_form" action="" method="post" enctype="multipart/form-data" style="padding:0;"> <table print-table="people" id="main_table_wrapper"> <tr> <td> <!-- TB 1 --> <table style="width:100%; margin-left:0px;"> <tr> <td style="text-align:left;padding-top:15px;"> <!-- TB 2 --> <table > <tr print-remove> <td style="height:10px;"></td> </tr> <tr> <td colspan=100 width="100%" class="td-1"> <!-- TB 3 --> <table border=0 cellpadding=0 cellspacing=0 width="100%" class="table-1"> <tr> <td> <table border=0 cellpadding=0 cellspacing=0 style="width:100%;"> <tr style="vertical-align:bottom;"> <td style="padding:0px; margin:0px;"><font style="font-size:18px;font-family:verdana;color:#3c3c3c;">From</font></td> <td style="padding:0px; margin:0px;text-align:right;"> <font style="font-size:28px;font-weight:bold; letter-spacing:5px; font-family:arial;color:#808080;"> <span id="invoiceHeadlineNoLogo" style="position:relative; z-index:100; margin-bottom:-14px;"> <b>' + invoice.heading + '</b> </span> </font> </td> </tr> </table> </td> </tr> <tr> <td><!-- TB 4 --> <table border=0 cellspacing=0 cellpadding=0 style="width:100%;"> <tr> <td rowspan=2 style="vertical-align:top;"><!-- TB 5 --> <table border=0 cellpadding=0 cellspacing=0 style="margin-top:5px;"> <tr style="height:25px;"> <td ng-show="invoice.from_name"> ' + invoice.from_name + ', </td> </tr> <tr> <td style="height:5px;"></td> </tr> <tr> <td ng-show="invoice.from_address">' + invoice.from_address + ',</td> </tr> <tr> <td style="padding:0px; margin:0px;padding-top:25px;padding-bottom:5px;"><font style="font-size:18px;font-family:verdana;color:#3c3c3c;">To</font></td> </tr> <tr style="height:25px;"> <td ng-show="invoice.to_name"> ' + invoice.to_name + ', </td> </tr> <tr> <td style="height:5px;"></td> </tr> <tr > <td ng-show="invoice.to_address">' + invoice.to_address + '</td> </tr> <!-- TB 5 --> </table></td> <td style="border:0px solid red; padding-right:0px; width:495px; text-align:right;vertical-align:top;"></td> </tr> <tr> <td style="vertical-align:bottom;"><!-- TB 5 --> <table border=0 cellpadding=0 cellspacing=0 style="width:100%; height:100%; vertical-align:bottom;border:1px solid white;"> <tr> <td style="width:155px;"></td> <td></td> <td></td> </tr> <tr> <td colspan=3><div id="invoiceHeadlineWhenLogo" style="display:none; float:right; vertical-align:top;margin-top:5px;margin-bottom:20px;text-align:right;letter-spacing:3px;font-size:22px;color:#3c3c3c;font-weight:normal;font-family:arial;"> <br> <input id="invoice_heading_copy" style="text-align:right; padding-top:3px; padding-bottom:3px; padding-right:8px; width:200px; font-weight:normal; letter-spacing:3px; font-family:arial;font-size:22px;color:#3c3c3c;" class="invoiceForm_fromNameTD" type=text value="INVOICE"> </div></td> </tr> <tr style="height:25px;"> <td></td> <td style="width:146px; padding-right:8px;text-align:right;font-weight:bold;font-family:verdana;font-size:13px;color:#3c3c3c;"> Invoice # : </td> <td >' + invoice.invoice_number + ' <span ng-if="!invoice.invoice_number"> </span></td> </tr> <tr> <td style="height:5px;"></td> </tr> <tr id="po_numberBlankTR" style="display:none;"> <td style="height:5px;"></td> </tr> <tr style="height:25px;"> <td></td> <td style="padding-right:8px;text-align:right;font-weight:bold;font-family:verdana;font-size:13px;color:#3c3c3c;"> Invoice Date : </td> <td > ' + invoice.invoice_date + ' </td> </tr> <tr> <td style="height:5px;"></td> </tr> <tr style="height:25px;"> <td></td> <td style="padding-right:8px;text-align:right;font-weight:bold;font-family:verdana;font-size:13px;color:#3c3c3c;"> Due Date : </td> <td > ' + invoice.payment_due_date + ' </td> </tr> <!-- TB 5 --> </table></td> </tr> <!-- TB 4 --> </table></td> </tr> <tr> <td colspan=100 style="width:100%;vertical-align:top;padding-top:35px;"><!-- TB 4 --> <table id="dataTable" border=1 cellpadding=0 cellspacing=0 width="100%" style="vertical-align:top;"> <tbody> <tr id="topRow" style="background-color:#54A0E7;height:30px;"> <th style="color:#FFFFFD;font-family:arial;font-size:14px;font-weight:400;padding-left:8px;text-align:left;">Item</th> <th style="color:#FFFFFD;font-family:arial;font-size:14px;font-weight:400;padding-left:5px;text-align:left;">Description</th> <th style="color:#FFFFFD;font-family:arial;font-size:14px;font-weight:400;padding-left:0px;text-align:right;padding-right:4px;">Lead/Call Price</th> <th style="color:#FFFFFD;font-family:arial;font-size:14px;font-weight:400;padding-left:0px;text-align:right;padding-right:4px;">Quantity</th> <th style="color:#FFFFFD;font-family:arial;font-size:14px;font-weight:400;padding-left:0px;text-align:right;padding-right:10px;">Amount</th> </tr> <tr class="invoiceHeadRow"> <td class="invoiceItem">' + (invoice.item) + '</td> <td class="invoiceDescription">' + (invoice.description) + '</td> <td class="invoicePriceOrQty">' + (invoice.unit_price) + '</td> <td class="invoicePriceOrQty">' + (invoice.qty) + '</td> <td class="invoiceAmount"> ' + (invoice.unit_price * invoice.qty) + ' </td> </tr> </tbody> </table></td> </tr> <tr> </tr> <tr> <td>&nbsp;</td> </tr> <tr> <td>&nbsp;</td> </tr> <tr> <td><!-- TB 4 --> <table border=0 cellpadding=0 cellspacing=0 style="width:100%;"> <tr> <td style="width:50%;vertical-align:top;"><!-- TB 5 --> <table cellspacing=0 cellpadding=0> <tr> <td style="padding-left:2px; font-family:verdana; font-size:13px; color:#3c3c3c; font-weight:bold;"> Invoice Notes </td> </tr> <tr> <td style="padding-top:3px;"> *Please Provide default invoice Note content </td> </tr> <!-- TB 5 --> </table></td> <td style="vertical-align:top;width:65%;float:right;"><!-- TB 5 --> <table id="table_sums" border=0 cellpadding=0 cellspacing=0> <tr> <td>&nbsp;</td> </tr> <tr> <td style="width:15px; border-top:2px solid #eaedee;">&nbsp;</td> <td style="width:200px; border-top:2px solid #eaedee;font-family:verdana; font-size:13px; color:#3c3c3c; font-weight:bold;padding-top:6px;padding-bottom:3px;"> Subtotal </td> <td style="text-align:right;padding-right:4px;border-right:1px solid white;border-top:2px solid #eaedee;border-left:1px solid white;padding-top:6px;padding-bottom:3px;"> <!-- <input style="border:0px solid white;text-align:right; width:100px; padding-right:5px; font-weight:normal; font-family:verdana;font-size:13px;color:#3c3c3c;" readonly type=text id="sum_subtotal" name="sum_subtotal" value="0.00"> --> ' + (invoice.unit_price * invoice.qty) + ' </td> </tr> <tr id="sum_blankSubtotalTR" style="height:3px;display:none;"> <td></td> </tr> <tr id="sum_blankAfterDiscountOrTaxTR" style="height:7px;"> <td></td> </tr> <tr> <td style="width:15px; border-top:2px solid #eaedee;">&nbsp;</td> <td style="border-top:2px solid #eaedee;font-family:verdana; font-size:13px; color:#3c3c3c; font-weight:bold;padding-top:7px;"> Total </td> <td style="padding-top:7px; text-align:right;padding-right:4px;border-right:1px solid white;border-top:2px solid #eaedee;border-left:1px solid white;"> ' + (invoice.unit_price * invoice.qty) + ' </td> </tr> <!-- amount paid --> <tr> <td style="width:15px; border-top:0px solid #eaedee;">&nbsp;</td> <td style="border-top:0px solid #eaedee;font-family:verdana; font-size:13px; color:#3c3c3c; font-weight:bold;"> Amount Paid </td> <td style="padding-bottom:7px;text-align:right;padding-right:4px;border-right:1px solid white;border-top:0px solid #eaedee;border-left:1px solid white;"> ' + 0 + ' </td> </tr> <!-- balance due --> <tr style="background-color:#FBFF9E;"> <td style="background-color:#FBFF9E;width:15px; border-top:2px solid #eaedee;">&nbsp;</td> <td style="background-color:#FBFF9E;width:200px; border-top:2px solid #eaedee;font-family:verdana; font-size:13px; color:#3c3c3c; font-weight:bold;padding-top:7px;padding-bottom:7px;"> Balance Due&nbsp;<span id="currency_code_output" style="font-family:verdana; font-size:13px; color:#3c3c3c; font-weight:normal;"></span> </td> <td style="background-color:#FBFF9E;text-align:right;padding-right:4px;border-right:1px solid white;border-top:2px solid #eaedee;border-left:1px solid #FBFF9E;"> $' + (invoice.unit_price * invoice.qty) + ' </td> </tr> <!-- TB 5 --> </table></td> </tr> <tr> <td>&nbsp;</td> </tr> <!-- TB 4 --> </table></td> </tr> <!-- TB 3 --> </table> </td> </tr> <!-- TB 2 --> </table> </td> </tr> <!-- TB 1 --> </table> <!-- end main table wrapper --> </td> </tr> </table></form>';
                                                    mailCtrl.sendEmail('jason36526@gmail.com', to, subject, message, function (response) {
                                                        if (response.code == config.constant.CODES.notFound) {
                                                            return console.error(err);
                                                        } else if (response.code == config.constant.CODES.OK) {
                                                            console.log('data ', response);
                                                        }
                                                    });

                                                    /*client.sendEmail({
                                                     to: [result2.email, lb_advccUser.email],
                                                     from: 'jason36526@gmail.com',
                                                     subject: "PSX : Auto-Generated Invoice for " + data.invoice_no,
                                                     message: '<form print-section id="invoice_form" name="invoice_form" action="" method="post" enctype="multipart/form-data" style="padding:0;"> <table print-table="people" id="main_table_wrapper"> <tr> <td> <!-- TB 1 --> <table style="width:100%; margin-left:0px;"> <tr> <td style="text-align:left;padding-top:15px;"> <!-- TB 2 --> <table > <tr print-remove> <td style="height:10px;"></td> </tr> <tr> <td colspan=100 width="100%" class="td-1"> <!-- TB 3 --> <table border=0 cellpadding=0 cellspacing=0 width="100%" class="table-1"> <tr> <td> <table border=0 cellpadding=0 cellspacing=0 style="width:100%;"> <tr style="vertical-align:bottom;"> <td style="padding:0px; margin:0px;"><font style="font-size:18px;font-family:verdana;color:#3c3c3c;">From</font></td> <td style="padding:0px; margin:0px;text-align:right;"> <font style="font-size:28px;font-weight:bold; letter-spacing:5px; font-family:arial;color:#808080;"> <span id="invoiceHeadlineNoLogo" style="position:relative; z-index:100; margin-bottom:-14px;"> <b>' + invoice.heading + '</b> </span> </font> </td> </tr> </table> </td> </tr> <tr> <td><!-- TB 4 --> <table border=0 cellspacing=0 cellpadding=0 style="width:100%;"> <tr> <td rowspan=2 style="vertical-align:top;"><!-- TB 5 --> <table border=0 cellpadding=0 cellspacing=0 style="margin-top:5px;"> <tr style="height:25px;"> <td ng-show="invoice.from_name"> ' + invoice.from_name + ', </td> </tr> <tr> <td style="height:5px;"></td> </tr> <tr> <td ng-show="invoice.from_address">' + invoice.from_address + ',</td> </tr> <tr> <td style="padding:0px; margin:0px;padding-top:25px;padding-bottom:5px;"><font style="font-size:18px;font-family:verdana;color:#3c3c3c;">To</font></td> </tr> <tr style="height:25px;"> <td ng-show="invoice.to_name"> ' + invoice.to_name + ', </td> </tr> <tr> <td style="height:5px;"></td> </tr> <tr > <td ng-show="invoice.to_address">' + invoice.to_address + '</td> </tr> <!-- TB 5 --> </table></td> <td style="border:0px solid red; padding-right:0px; width:495px; text-align:right;vertical-align:top;"></td> </tr> <tr> <td style="vertical-align:bottom;"><!-- TB 5 --> <table border=0 cellpadding=0 cellspacing=0 style="width:100%; height:100%; vertical-align:bottom;border:1px solid white;"> <tr> <td style="width:155px;"></td> <td></td> <td></td> </tr> <tr> <td colspan=3><div id="invoiceHeadlineWhenLogo" style="display:none; float:right; vertical-align:top;margin-top:5px;margin-bottom:20px;text-align:right;letter-spacing:3px;font-size:22px;color:#3c3c3c;font-weight:normal;font-family:arial;"> <br> <input id="invoice_heading_copy" style="text-align:right; padding-top:3px; padding-bottom:3px; padding-right:8px; width:200px; font-weight:normal; letter-spacing:3px; font-family:arial;font-size:22px;color:#3c3c3c;" class="invoiceForm_fromNameTD" type=text value="INVOICE"> </div></td> </tr> <tr style="height:25px;"> <td></td> <td style="width:146px; padding-right:8px;text-align:right;font-weight:bold;font-family:verdana;font-size:13px;color:#3c3c3c;"> Invoice # : </td> <td >' + invoice.invoice_number + ' <span ng-if="!invoice.invoice_number"> </span></td> </tr> <tr> <td style="height:5px;"></td> </tr> <tr id="po_numberBlankTR" style="display:none;"> <td style="height:5px;"></td> </tr> <tr style="height:25px;"> <td></td> <td style="padding-right:8px;text-align:right;font-weight:bold;font-family:verdana;font-size:13px;color:#3c3c3c;"> Invoice Date : </td> <td > ' + invoice.invoice_date + ' </td> </tr> <tr> <td style="height:5px;"></td> </tr> <tr style="height:25px;"> <td></td> <td style="padding-right:8px;text-align:right;font-weight:bold;font-family:verdana;font-size:13px;color:#3c3c3c;"> Due Date : </td> <td > ' + invoice.payment_due_date + ' </td> </tr> <!-- TB 5 --> </table></td> </tr> <!-- TB 4 --> </table></td> </tr> <tr> <td colspan=100 style="width:100%;vertical-align:top;padding-top:35px;"><!-- TB 4 --> <table id="dataTable" border=1 cellpadding=0 cellspacing=0 width="100%" style="vertical-align:top;"> <tbody> <tr id="topRow" style="background-color:#54A0E7;height:30px;"> <th style="color:#FFFFFD;font-family:arial;font-size:14px;font-weight:400;padding-left:8px;text-align:left;">Item</th> <th style="color:#FFFFFD;font-family:arial;font-size:14px;font-weight:400;padding-left:5px;text-align:left;">Description</th> <th style="color:#FFFFFD;font-family:arial;font-size:14px;font-weight:400;padding-left:0px;text-align:right;padding-right:4px;">Lead/Call Price</th> <th style="color:#FFFFFD;font-family:arial;font-size:14px;font-weight:400;padding-left:0px;text-align:right;padding-right:4px;">Quantity</th> <th style="color:#FFFFFD;font-family:arial;font-size:14px;font-weight:400;padding-left:0px;text-align:right;padding-right:10px;">Amount</th> </tr> <tr class="invoiceHeadRow"> <td class="invoiceItem">' + (invoice.item) + '</td> <td class="invoiceDescription">' + (invoice.description) + '</td> <td class="invoicePriceOrQty">' + (invoice.unit_price) + '</td> <td class="invoicePriceOrQty">' + (invoice.qty) + '</td> <td class="invoiceAmount"> ' + (invoice.unit_price * invoice.qty) + ' </td> </tr> </tbody> </table></td> </tr> <tr> </tr> <tr> <td>&nbsp;</td> </tr> <tr> <td>&nbsp;</td> </tr> <tr> <td><!-- TB 4 --> <table border=0 cellpadding=0 cellspacing=0 style="width:100%;"> <tr> <td style="width:50%;vertical-align:top;"><!-- TB 5 --> <table cellspacing=0 cellpadding=0> <tr> <td style="padding-left:2px; font-family:verdana; font-size:13px; color:#3c3c3c; font-weight:bold;"> Invoice Notes </td> </tr> <tr> <td style="padding-top:3px;"> *Please Provide default invoice Note content </td> </tr> <!-- TB 5 --> </table></td> <td style="vertical-align:top;width:65%;float:right;"><!-- TB 5 --> <table id="table_sums" border=0 cellpadding=0 cellspacing=0> <tr> <td>&nbsp;</td> </tr> <tr> <td style="width:15px; border-top:2px solid #eaedee;">&nbsp;</td> <td style="width:200px; border-top:2px solid #eaedee;font-family:verdana; font-size:13px; color:#3c3c3c; font-weight:bold;padding-top:6px;padding-bottom:3px;"> Subtotal </td> <td style="text-align:right;padding-right:4px;border-right:1px solid white;border-top:2px solid #eaedee;border-left:1px solid white;padding-top:6px;padding-bottom:3px;"> <!-- <input style="border:0px solid white;text-align:right; width:100px; padding-right:5px; font-weight:normal; font-family:verdana;font-size:13px;color:#3c3c3c;" readonly type=text id="sum_subtotal" name="sum_subtotal" value="0.00"> --> ' + (invoice.unit_price * invoice.qty) + ' </td> </tr> <tr id="sum_blankSubtotalTR" style="height:3px;display:none;"> <td></td> </tr> <tr id="sum_blankAfterDiscountOrTaxTR" style="height:7px;"> <td></td> </tr> <tr> <td style="width:15px; border-top:2px solid #eaedee;">&nbsp;</td> <td style="border-top:2px solid #eaedee;font-family:verdana; font-size:13px; color:#3c3c3c; font-weight:bold;padding-top:7px;"> Total </td> <td style="padding-top:7px; text-align:right;padding-right:4px;border-right:1px solid white;border-top:2px solid #eaedee;border-left:1px solid white;"> ' + (invoice.unit_price * invoice.qty) + ' </td> </tr> <!-- amount paid --> <tr> <td style="width:15px; border-top:0px solid #eaedee;">&nbsp;</td> <td style="border-top:0px solid #eaedee;font-family:verdana; font-size:13px; color:#3c3c3c; font-weight:bold;"> Amount Paid </td> <td style="padding-bottom:7px;text-align:right;padding-right:4px;border-right:1px solid white;border-top:0px solid #eaedee;border-left:1px solid white;"> ' + 0 + ' </td> </tr> <!-- balance due --> <tr style="background-color:#FBFF9E;"> <td style="background-color:#FBFF9E;width:15px; border-top:2px solid #eaedee;">&nbsp;</td> <td style="background-color:#FBFF9E;width:200px; border-top:2px solid #eaedee;font-family:verdana; font-size:13px; color:#3c3c3c; font-weight:bold;padding-top:7px;padding-bottom:7px;"> Balance Due&nbsp;<span id="currency_code_output" style="font-family:verdana; font-size:13px; color:#3c3c3c; font-weight:normal;"></span> </td> <td style="background-color:#FBFF9E;text-align:right;padding-right:4px;border-right:1px solid white;border-top:2px solid #eaedee;border-left:1px solid #FBFF9E;"> $' + (invoice.unit_price * invoice.qty) + ' </td> </tr> <!-- TB 5 --> </table></td> </tr> <tr> <td>&nbsp;</td> </tr> <!-- TB 4 --> </table></td> </tr> <!-- TB 3 --> </table> </td> </tr> <!-- TB 2 --> </table> </td> </tr> <!-- TB 1 --> </table> <!-- end main table wrapper --> </td> </tr> </table></form>',
                                                     altText: 'html text'
                                                     }, function (err, data, res) {
                                                     if (err) {
                                                     return console.error(err);
                                                     } else {
                                                     console.log('data ', data);
                                                     }
                                                     });*/
                                                    if (foundData.length == foundDataValue + 1 && users.length == usersValue + 1) {
                                                        //callback({'status':200});
                                                        console.log('Success : Agenda Execution Done, Data successfully saved');
                                                    }

                                                }
                                            });
                                        })
                                    }
                                })
                            }
                        })
                    }
                }
            })
        }
    });
}



var sendSMS = function (req, dataObj, callback) {

    contactsModel.find({'_id': {$in: dataObj.contacts}}, function (err, contactsData) {
        if (err) {
            console.log('Error');
        } else {
            if (contactsData.length) {
                var dest = '';
                dataObj.message += ' to opt out please reply "STOP" to same number.';
                contactsData.forEach(function (item, i) {
                    if (item.phone_no.charAt(0) == '1') {
                        var ph_no = item.phone_no;
                    } else {
                        var ph_no = '1' + item.phone_no;
                    }
                    // optout link generattion code
//                    var baseUrl;
//                    console.log('req.get(host)', req.get('host'));
//                    if (req.get('host') == 'localhost:8000') {
//                        console.log('if');
//                        baseUrl = 'https://jubin.localtunnel.me';
//                    } else {
//                        console.log('else');
//                        baseUrl = req.protocol + '://' + req.get('host');
//                    }
//                    var optoutLink = baseUrl + "/#!/optout/EMAIL/" + item._id;
//                    console.log('optoutLink :', optoutLink);
//                    shorturl(optoutLink.trim(), function (result) {
//                        console.log(result);


                    contactCtrl.sendMultiSMS(dataObj.message, dataObj.sms_header, dest, dataObj.user_id, function (response) {
                        var msgsaveObj = [];
                        msgsaveObj.push({
                            'user_id': dataObj.user_id,
                            'contact_id': item._id,
                            'from': (response.provider == 'plivo') ? response.params.src : response.params.from,
                            'to': (response.provider == 'plivo') ? response.params.dst : response.params.to,
                            'mode': 'SMS',
                            'description': dataObj.description,
                            'status': (response.code == config.constant.CODES.OK) ? 'Sent' : 'Failed',
                            'sent_time': new Date(),
                            'list_id': item.list_id,
                            'agenda_id': dataObj.agenda_id,
                            'timezone': (dataObj.timezone) ? dataObj.timezone : '',
                            'message_uuid': (response.provider == 'plivo') ? response.response.message_uuid[0] : response.response.sid,
                            'api_id': (response.provider == 'plivo') ? response.response.api_id : response.response.account_sid,
                            'text': dataObj.message,
                        });
                        if (i + 1 == contactsData.length) {
                            contactCtrl.saveMessageHistory(msgsaveObj, function (historyRes) {
                                if (historyRes.code == config.constant.CODES.OK) {
                                    callback({'code': config.constant.CODES.OK, "message": 'Sent Successfully'});
                                } else {
                                    console.log('Error 3 : ');
                                    callback({'code': config.constant.CODES.notFound, "message": 'Message Sending Failed'})
                                }
                            });
                        }
                    });
//                    });
                });
            } else {
                callback({'code': config.constant.CODES.notFound, "message": 'No Contacts found'})
            }

        }
    });
}
exports.sendSMS = sendSMS;
var sendEmail = function (req, dataObj, callback) {
    console.log('dataObj', dataObj);
    contactsModel.find({'_id': {$in: dataObj.contacts}}, function (err, contactsData) {
        if (err) {
            console.log('Error');
        } else {

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
                        var message = dataObj.message + ' -to unsubscribe <a href="' + result + '">Click Here</a>';
                        var emails = [{'email': item.email}];
                        mailCtrl.sendMailToContacts(message, dataObj.subject, emails, function (resp) {
                            var msgsaveObj = [];
                            console.log('resp ', resp);
                            msgsaveObj.push({
                                'user_id': dataObj.user_id,
                                'contact_id': item._id,
                                'from': 'support@callbasedleadgeneration.com',
                                'to': item.email,
                                'mode': 'EMAIL',
                                'description': dataObj.description,
                                'status': (resp.code == config.constant.CODES.OK) ? 'Sent' : 'Failed',
                                'sent_time': new Date(),
                                'list_id': item.list_id,
                                'agenda_id': dataObj.agenda_id,
                                'timezone': (dataObj.timezone) ? dataObj.timezone : '',
                                'text': dataObj.message,
                            });
                            console.log('i ', i);
                            console.log('contactsData.length ', contactsData.length);
                            console.log('i + 1 == contactsData.length ', i + 1 == contactsData.length);
                            if (i + 1 == contactsData.length) {
                                console.log('msgsaveObj ', msgsaveObj);
                                contactCtrl.saveMessageHistory(msgsaveObj, function (historyRes) {
                                    console.log('historyRes ', historyRes);
                                    if (historyRes.code == config.constant.CODES.OK) {
                                        callback({'code': config.constant.CODES.OK, "message": 'Sent Successfully'});
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
}
exports.sendEmail = sendEmail;
var outboundCall = function (req, res, dataObj, callback) {
    contactsModel.find({'_id': {$in: dataObj.contacts}, 'optout_call': false}, function (err, contactsData) {
        if (err) {
            console.log('Error 5 : ', err);
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
        } else {
            console.log('contactsData ', contactsData);
            if (contactsData.length) {
                userModel.findOne({_id: dataObj.user_id}).populate('parent_id').exec(function (err, userData) {
                    if (err) {
                        console.log('Error 6 : ', err);
                        callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
                    } else {
                        console.log('userData ', userData);
                        contactAgendaModel.findOne({_id: dataObj.agenda_id}, function (err, agendaData) {
                            if (err) {
                                console.log('Error 6 : ', err);
                                callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
                            } else {
                                console.log('agendaData ', agendaData);
                                console.log('userData.parent_id.webphone_details ', userData.parent_id.webphone_details);
                                if (userData.parent_id.webphone_details.provider == 'plivo') {
                                    plivoCallCtrl.outboundCampaignCallPlivo(req, res, contactsData, agendaData, userData.parent_id.webphone_details, function (callRes) {
                                        callback(callRes);
                                    });
                                } else if (userData.parent_id.webphone_details.provider == 'twilio') {
                                    twilioCallCtrl.outboundCampaignCallTwilio(req, res, contactsData, agendaData, userData.parent_id.webphone_details, function (callRes) {
                                        callback(callRes);
                                    });
                                } else {
                                    callback({'code': config.constant.CODES.notFound, "message": 'No information of Plivo or Twilio Present in Parent LGN'})
                                }
                            }
                        });
                    }
                });
            } else {
                callback({'code': config.constant.CODES.notFound, "message": 'No Contacts found'})
            }
        }
    });
}

exports.outboundCall = outboundCall;
