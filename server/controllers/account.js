/*Controller for dealing with  accounts managment*/
var config = require('../../config/constant.js'); // constants
var User = require('../models/user.js');
var Account = require('../models/accounts');
var Invoice = require('../models/invoice');
var phantom = require('phantom');
var moment = require('moment');
var _ = require("underscore");
var mailCtrl = require('../controllers/send_mail');
var sendgrid = require('sendgrid')(config.constant.SEND_GRID.username, config.constant.SEND_GRID.password);

/*var amazonSes = require('node-ses')
 , client = amazonSes.createClient({
 key: config.constant.AMAZON_AWS.key,
 secret: config.constant.AMAZON_AWS.secret
 });*/

var isEmptyObject = function (obj) {
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
}


/* @function : acccountReceivable
 *  @author  : B2
 *  @created  : 20102015
 *  @modified :
 *  @purpose  : To get list of account receivables as per user id
 */

var acccountReceivable = function (req, res, callback) {

    if (req.user.role_id.code == 'ADMIN') {
        Account.find().populate('owedToID', {password: 0, onboarded: 0, status: 0, created: 0, modified: 0, uid: 0, token: 0}).populate('pay_fromID', {password: 0, onboarded: 0, status: 0, created: 0, modified: 0, uid: 0, token: 0}).exec(function (err, response) {
            if (err) {
                console.log(err)
                callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
            } else {
                callback({'code': config.constant.CODES.OK, 'data': response, "message": config.constant.MESSAGES.Success});
            }
        });
    } else {
        Account.find({'owedToID': req.user._id}).populate('owedToID', {password: 0, onboarded: 0, status: 0, created: 0, modified: 0, uid: 0, token: 0}).populate('pay_fromID', {password: 0, onboarded: 0, status: 0, created: 0, modified: 0, uid: 0, token: 0}).exec(function (err, response) {
            if (err) {
                console.log(err)
                callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
            } else {
                callback({'code': config.constant.CODES.OK, 'data': response, "message": config.constant.MESSAGES.Success});
            }
        });
    }

}
exports.acccountReceivable = acccountReceivable;

/* @function : acccountPayable
 *  @author  : B2
 *  @created  : 20102015
 *  @modified :
 *  @purpose  : To get list of account payable as per user id
 */

var acccountPayable = function (req, res, callback) {

    Account.find({'pay_fromID': req.user._id}).populate('owedToID', {password: 0, onboarded: 0, status: 0, created: 0, modified: 0, uid: 0, token: 0}).populate('pay_fromID', {password: 0, onboarded: 0, status: 0, created: 0, modified: 0, uid: 0, token: 0}).exec(function (err, response) {
        if (err) {
            console.log(err)
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
        } else {
            callback({'code': config.constant.CODES.OK, 'data': response, "message": config.constant.MESSAGES.Success});
        }
    });

}
exports.acccountPayable = acccountPayable;


/* @function : paymentHistory
 *  @author  : B2
 *  @created  : 24122015
 *  @modified :
 *  @purpose  : To get payment history
 */
var paymentHistory = function (req, res, callback) {

    Account.find({$or: [{'pay_fromID': req.user._id}, {'owedToID': req.user._id}], 'payment_status': true}).populate('owedToID', {password: 0, onboarded: 0, status: 0, created: 0, modified: 0, uid: 0, token: 0}).populate('pay_fromID', {password: 0, onboarded: 0, status: 0, created: 0, modified: 0, uid: 0, token: 0}).exec(function (err, response) {
        if (err) {
            console.log(err)
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
        } else {
            callback({'code': config.constant.CODES.OK, 'data': response, "message": config.constant.MESSAGES.Success});
        }
    });

}
exports.paymentHistory = paymentHistory;


/* @function : markAsPaid
 *  @author  : B2
 *  @created  : 20102015
 *  @modified :
 *  @purpose  : To change paid staus in acccount payable data
 */

var markAsPaid = function (req, res, callback) {

    Account.findOne({_id: req.body.id}).exec(function (err, response) {
        if (err) {
            console.log(err)
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
        } else {
            var cond = {};
            // console.log(response)
            if (response.payment_status == '' || !response.payment_status) {
                callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.paymentPending});
            } else {
                if (response.pay_fromID == req.user._id && response.ack_saas == true) {
                    cond = {paid_buyer: true};
                    Account.update({_id: req.body.id}, {$set: cond}, function (err, data) {
                        if (err)
                        {
                            console.log(err);
                        }
                        else
                        {

                            acccountPayable(req, res, function (response) {
                                callback({'code': config.constant.CODES.OK, "data": response.data, "message": config.constant.MESSAGES.statusSuccess});
                            });

                        }
                    });
                } else if (response.owedToID == req.user._id && response.paid_buyer == true) {
                    cond = {paid_seller: true};
                    Account.update({_id: req.body.id}, {$set: cond}, function (err, data) {
                        if (err)
                        {
                            console.log(err)
                            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                        }
                        else
                        {
                            acccountReceivable(req, res, function (response) {
                                callback({'code': config.constant.CODES.OK, "data": response.data, "message": config.constant.MESSAGES.statusSuccess});
                            });
                        }
                    });
                } else if (req.user.role_id.code == 'ADMIN') {
                    cond = {ack_saas: true};
                    Account.update({_id: req.body.id}, {$set: cond}, function (err, data) {
                        if (err)
                        {
                            console.log(err)
                            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                        }
                        else
                        {
                            acccountReceivable(req, res, function (response) {
                                callback({'code': config.constant.CODES.OK, "data": response.data, "message": config.constant.MESSAGES.statusSuccess});
                            });
                        }
                    });
                } else {
                    if (req.user.role_id.code == 'LB' || req.user.role_id.code == 'ADVCC') {
                        acccountPayable(req, res, function (response) {
                            callback({'code': config.constant.CODES.notFound, "data": response.data, "message": config.constant.MESSAGES.paymentPending});
                        });
                    } else {
                        acccountReceivable(req, res, function (response) {
                            callback({'code': config.constant.CODES.notFound, "data": response.data, "message": config.constant.MESSAGES.paymentPending});
                        });
                    }
                }
            }


        }
    });

}
exports.markAsPaid = markAsPaid;


/* @function : makePayment
 *  @author  : B2
 *  @created  : 23112015
 *  @modified :
 *  @purpose  : makePayment for invoice
 */

var makePayment = function (req, res, callback) {
    console.log(req.body.invoice_number)
    var invoice_send_no = req.body.invoice_number;
    Account.update({_id: req.body.id}, {$set: req.body}, {$upsert: true}, function (err, data) {
        if (err)
        {
            console.log(err)
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
        }
        else
        {
            if (req.user.role_id.code == 'LB' || req.user.role_id.code == 'ADVCC') {
                /*var email = new sendgrid.Email({
                 from: 'support@callbasedleadgeneration.com', // sender address
                 to: 'abhi_test@yopmail.com', // list of receivers
                 subject: "CBL : Payment Received for " + invoice_send_no, // Subject line
                 html: '<h1><img alt="" src="" /></h1><hr /><table align="center" style="height:150px; width:627px"><tbody><tr><td><h1>CallBasedLeadGeneration - Payment</h1><hr /><p><big>Hi ,</big></p><p>You have been received payment successfully for ' + invoice_send_no + '</p><h3><code>Thanks,<br />CallBasedLeadGeneration Team</code></h3></td></tr></tbody></table>'
                 });
                 sendgrid.send(email, function (err, json) {
                 if (err) {
                 return console.error(err);
                 }
                 //To save token
                 });*/

                /* Send Email through Amazon Aws Ses */

                var to = ['abhi_test@yopmail.com'];
                var subject = "CBL : Payment Received for " + invoice_send_no;
                var message = '<h1><img alt="" src="" /></h1><hr /><table align="center" style="height:150px; width:627px"><tbody><tr><td><h1>CallBasedLeadGeneration - Payment</h1><hr /><p><big>Hi ,</big></p><p>You have been received payment successfully for ' + invoice_send_no + '</p><h3><code>Thanks,<br />CallBasedLeadGeneration Team</code></h3></td></tr></tbody></table>';
                mailCtrl.sendEmail('jason36526@gmail.com', to, subject, message, function (response) {
                    if (response.code == config.constant.CODES.notFound) {
                        return console.error(err);
                    } else if (response.code == config.constant.CODES.OK) {
                        console.log('data ', response);
                        //To save token
                    }
                });
//                client.sendEmail({
//                    to: 'abhi_test@yopmail.com',
//                    from: 'jason36526@gmail.com',
//                    subject: "CBL : Payment Received for " + invoice_send_no,
//                    message: '<h1><img alt="" src="" /></h1><hr /><table align="center" style="height:150px; width:627px"><tbody><tr><td><h1>CallBasedLeadGeneration - Payment</h1><hr /><p><big>Hi ,</big></p><p>You have been received payment successfully for ' + invoice_send_no + '</p><h3><code>Thanks,<br />CallBasedLeadGeneration Team</code></h3></td></tr></tbody></table>',
//                    altText: 'html text'
//                }, function (err, data, res) {
//                    if (err) {
//                        return console.error(err);
//                    } else {
//                        console.log('data ', data);
//                        //To save token
//                    }
//                });

                acccountPayable(req, res, function (response) {
                    callback({'code': config.constant.CODES.OK, "data": response.data, "message": config.constant.MESSAGES.paymentSuccess});
                });
            } else {
                acccountReceivable(req, res, function (response) {
                    callback({'code': config.constant.CODES.OK, "data": response.data, "message": config.constant.MESSAGES.paymentSuccess});
                });
            }
        }
    });
}
exports.makePayment = makePayment;


/* @function : pdfGeneration
 *  @author  : B2
 *  @created  : 25112015
 *  @modified :
 *  @purpose  : pdf generation for invoice
 */

var pdfGeneration = function (req, res, callback) {

    var BaseUrl = req.protocol + '://' + req.get('host');

    console.log('request', req.body);

    var fromAddr = req.body.from_address + ',<br>' + req.body.from_city + ',<br>' + req.body.from_country;
    var toAddr = req.body.to_address + ',<br>' + req.body.to_city + ',<br>' + req.body.to_country;

    var invoice = {
        "from_name": req.body.from_name ? req.body.from_name : '',
        "from_address": fromAddr,
        "to_name": req.body.to_name ? req.body.to_name : '',
        "to_address": toAddr,
        "heading": 'INVOICE',
        "invoice_number": req.body.invoice_number ? req.body.invoice_number : '',
        "invoice_date": req.body.invoice_date ? req.body.invoice_date : '',
        "payment_due_date": req.body.payment_due_date ? req.body.payment_due_date : '',
        "notes": req.body.notes ? req.body.notes : 0
    }
    var fileName = 'invoice_';
    //var htmlForPdf = '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css"><style>.from {font-weight:bold; color:#000000; margin-left: 12px; font-size:14px;}.details {text-align:left;}.container { border: 1px solid;}.vat{width:100% !important;}.name {border: medium none;border-radius: 0px;box-shadow: none;height:30px;margin-top: 3px;}.name2 {border: medium none;border-radius: 0px;box-shadow: none;height:30px;margin-top:3px;}.name:focus {border-color: none;box-shadow: none;}.name2:focus {border-color: none;box-shadow: none;}input::-webkit-input-placeholder {color: #000000 !important;}input:-moz-placeholder { /* Firefox 18- */color: #000000 !important;}input::-moz-placeholder { /* Firefox 19+ */color: #000000 !important;}input:-ms-input-placeholder {color: #000000 !important;}.invoice {text-transform:uppercase; font-size:3em; color:#000000; margin-bottom: 189px; margin-top:0px;padding-left:30px; float:Right;}.invoice-text{float:right;}.space {margin-right:10px;}.item-row {background-color:rgb(66, 139, 202) !important;}.item {width: 35%;}.item-border {background-color: rgb(66, 139, 202);color: white !important;}.invoice-form {float:right;}.invoice-bottom {margin-bottom:0px !important;}.invoice-align {text-align:end;}.action{ opacity: 0.4; }.action:hover{ opacity: 1; color:rgb(66, 139, 202); }/* Different color for placehlder and to hide input boxes background */.form-control::-webkit-input-placeholder{color: #FFFFFF !important;}.form-control:-moz-placeholder {color: #FFFFFF !important;}.form-control::-moz-placeholder {color: #FFFFFF !important;}.form-control:-ms-input-placeholder {color: #FFFFFF !important;}textarea.form-control { border: none;}.form-control[disabled], .form-control[readonly], fieldset[disabled] .form-control {background-color: white;opacity: 1;}</style><div > <div class="row"> <div class="col-lg-12"> <hr> <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6"> <h4 class="from"> From</h4> <form role="form"> <div class="form-group"> <input disabled type="text" class="form-control name" id="" placeholder="Name" value="' + invoice.from_name + '"> <input disabled type="text" class="form-control name" id="" placeholder="Address" value="' + invoice.from_address + '"> <input disabled type="text" class="form-control name" id="" placeholder="City, State, Zip" value="' + invoice.from_city + '"> <input disabled type="text" class="form-control name" id="" placeholder="Country" value="' + invoice.from_country + '"> </div> <div class="clearfix"></div> <h4 class="from">To</h4> <form role="form"> <div class="form-group details"> <input disabled type="text" class="form-control name" id="" placeholder="Name" value="' + invoice.to_name + '"> <input disabled type="text" class="form-control name" id="" placeholder="Address" value="' + invoice.to_address + '"> <input disabled type="text" class="form-control name" id="" placeholder="City, State, Zip" value="' + invoice.to_city + '"> <input disabled type="text" class="form-control name" id="" placeholder="Country" value="' + invoice.to_country + '"> </div> </form> </div> <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6"> <h1 class="invoice">Invoice </h1> <div class="clearfix"></div> <form class="form-horizontal invoice-form" role="form"> <div class="form-group invoice-bottom"> <label style="float:left" class="control-label invoice-align" for="pwd">Invoice #</label> <div style="float:right;"> <input disabled type="text" class="form-control name2 invoice-align" id="" placeholder="INV-0001" value="' + invoice.invoice_number + '"> </div> </div> <div class="form-group invoice-bottom"> <label style="float:left" class="control-label invoice-align" for="pwd">Invoice Date</label> <div class="" style="float:right;"> <input disabled type="text" class="form-control name2 invoice-align" id="" placeholder="Oct 10, 2015" value="' + invoice.invoice_date + '"> </div> </div> <div class="form-group invoice-bottom"> <label style="float:left" class="control-label invoice-align" for="pwd">Due Date</label> <div class="" style="float:right;"> <input disabled type="text" class="form-control name2 invoice-align" id="" placeholder="Nov 26, 2015" value="' + invoice.payment_due_date + '"> </div> </div> </form> </div> <div class="clearfix"></div> <div class="table-responsive"> <table class="table table-bordered vat "> <thead style="background-color :rgb(66, 139, 202) !important"> <tr class="item-border" style="color :rgb(66, 139, 202) !important"> <th>Item</th> <th>Description</th> <th>Lead/Call Price</th> <th>Quantity</th> <th>Amount</th> </tr> </thead> <tbody> <tr class="item-row"> <td class="item"><input disabled type="text" class="form-control name" id="" placeholder="Item name/description" value="' + invoice.item + '"></td> <td><p style="text-align:justify">' + invoice.description + '</p></td> <td><input disabled type="text" class="form-control name" id="" placeholder="0.00" value="' + invoice.unit_price + '"></td> <td><input disabled type="text" class="form-control name" id="" placeholder="0.00" value="' + invoice.qty + '"></td> <td><input disabled type="text" class="form-control name" id="" placeholder="0.00" value="' + (invoice.unit_price * invoice.qty) + '"></td> </tr> </tbody> </table> </div> <div class="clearfix"></div> <div class="row"> <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6"> <div class="form-group"> <span><b>Note:</b></span> <p style="text-align:justify">' + invoice.notes + '</p> </div> </div> <div class="col-lg-3 col-md-3 col-sm-3 col-xs-3"> </div> <div class="col-lg-2 col-md-2 col-sm-2 col-xs-2 margin3"> <p><strong>Subtotal </strong> </p> <p><strong>Amount Paid</strong> </p> <p><strong>Balance Due</strong></p> <p><strong>Total</strong></p> </div> <div class="col-lg-1 col-md-1 col-sm-1 col-xs-1 margin3"> <p>$' + (invoice.unit_price * invoice.qty) + '</p> <p>$0</p> <p>$' + (invoice.unit_price * invoice.qty) + '</p> <p>$' + (invoice.unit_price * invoice.qty) + '</p> </div> </div> </div> </div> </div> </div>';

    //var htmlForPdf = '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css"><style>.from {font-weight:bold; color:#000000; margin-left: 12px; font-size:14px;}.details {text-align:left;}.container { border: 1px solid;}.vat{width:100% !important;}.name {border: medium none;border-radius: 0px;box-shadow: none;height:30px;margin-top: 3px;}.name2 {border: medium none;border-radius: 0px;box-shadow: none;height:30px;margin-top:3px;}.name:focus {border-color: none;box-shadow: none;}.name2:focus {border-color: none;box-shadow: none;}input::-webkit-input-placeholder {color: #000000 !important;}input:-moz-placeholder { /* Firefox 18- */color: #000000 !important;}input::-moz-placeholder { /* Firefox 19+ */color: #000000 !important;}input:-ms-input-placeholder {color: #000000 !important;}.invoice {text-transform:uppercase; font-size:3em; color:#000000; margin-bottom: 189px; margin-top:0px;padding-left:30px; float:Right;}.invoice-text{float:right;}.space {margin-right:10px;}.item-row {background-color:rgb(66, 139, 202) !important;}.item {width: 35%;}.item-border {background-color: rgb(66, 139, 202);color: white !important;}.invoice-form {float:right;}.invoice-bottom {margin-bottom:0px !important;}.invoice-align {text-align:end;}.action{ opacity: 0.4; }.action:hover{ opacity: 1; color:rgb(66, 139, 202); }/* Different color for placehlder and to hide input boxes background */.form-control::-webkit-input-placeholder{color: #FFFFFF !important;}.form-control:-moz-placeholder {color: #FFFFFF !important;}.form-control::-moz-placeholder {color: #FFFFFF !important;}.form-control:-ms-input-placeholder {color: #FFFFFF !important;}textarea.form-control { border: none;}.form-control[disabled], .form-control[readonly], fieldset[disabled] .form-control {background-color: white;opacity: 1;}</style>';
    var htmlForPdf = '<link rel="stylesheet" href="' + BaseUrl + '/assets/css/bootstrap.css"><link rel="stylesheet" href="' + BaseUrl + '/assets/css/AdminLTE.css">';
    htmlForPdf += '<style type="text/css"> .from {font-weight:bold; color:#000000; margin-left: 12px; font-size:14px;} .details {text-align:left;} .container { border: 1px solid;} .vat{width:100% !important;} .name { border: medium none; border-radius: 0px; box-shadow: none; height:30px; margin-top: 3px; } .name2 { border: medium none; border-radius: 0px; box-shadow: none; height:30px; margin-top:3px; } .name:focus {border-color: none;box-shadow: none;} .name2:focus {border-color: none;box-shadow: none;} .invoice {text-transform:uppercase; font-size:3em; color:#000000; margin-bottom: 189px; margin-top:0px;padding-left:30px; float:Right;} .invoice-text{float:right;} .space {margin-right:10px;} .item-row {background-color: #FFFFFD !important;} .item {width: 35%;} .item-border {background-color: rgb(66, 139, 202);color: white !important;} .invoice-form {float:right;} .invoice-bottom {margin-bottom:0px !important;} .invoice-align {text-align:end;} .action{ opacity: 0.4; } .action:hover{ opacity: 1; color:rgb(66, 139, 202); } .margin3{ margin-top: 3% } .borderGry { background-color: #eee; } td input.form-control[readonly=""] { background-color: #ffee99; } /*media css start*/ @media screen and (max-width:767px) { .invoice { margin-bottom: 30px; margin-top: 0px; float: left; font-size: 1.5em; } .name { text-align: center; } .from { text-align: center; } .invoice-align { text-align: center; } .invoice { text-align: center; float: none; } .vat { margin-left: 0px; } .total-text { line-height: 15px; margin-right: 80px; } .invoice-form { margin-bottom: 20px; float: initial; } } @media screen and (max-width:380px) { .invoice { margin-bottom: 30px; margin-top: 0px; float: left; font-size: 1.3em; padding-left: 0; text-align: left; } .name { text-align: left; } .from { text-align: left; } .invoice-align { text-align: left; } .vat { margin-left: 0px; } .total-text { line-height: 15px; margin-right: 80px; } .invoice-form { margin-bottom: 20px; } .table-form .form-control {width:inherit;} .name { white-space: inherit; width: 200px !important; } } /*media css end*/@media print {.invoice-col{width:33.33% !important;}*{font-size:14px !important; font-family: "Myriad Set Pro","Helvetica Neue","Helvetica","Arial","sans-serif" !important;}} </style>';
//    htmlForPdf += '<form print-section id="invoice_form" name="invoice_form" action="" method="post" enctype="multipart/form-data" style="padding:0;"> <table print-table="people" id="main_table_wrapper"> <tr> <td> <!-- TB 1 --> <table style="width:100%; margin-left:0px;"> <tr> <td style="text-align:left;padding-top:15px;"> <!-- TB 2 --> <table > <tr print-remove> <td style="height:10px;"></td> </tr> <tr> <td colspan=100 width="100%" class="td-1"> <!-- TB 3 --> <table border=0 cellpadding=0 cellspacing=0 width="100%" class="table-1"> <tr> <td> <table border=0 cellpadding=0 cellspacing=0 style="width:100%;"> <tr style="vertical-align:bottom;"> <td style="padding:0px; margin:0px;"><font style="font-size:18px;font-family:verdana;color:#3c3c3c;">From</font></td> <td style="padding:0px; margin:0px;text-align:right;"> <font style="font-size:28px;font-weight:bold; letter-spacing:5px; font-family:arial;color:#808080;"> <span id="invoiceHeadlineNoLogo" style="position:relative; z-index:100; margin-bottom:-14px;"> <b>' + invoice.heading + '</b> </span> </font> </td> </tr> </table> </td> </tr> <tr> <td><!-- TB 4 --><table border=0 cellspacing=0 cellpadding=0 style="width:100%;"> <tr> <td rowspan=2 style="vertical-align:top;"><!-- TB 5 --> <table border=0 cellpadding=0 cellspacing=0 style="margin-top:5px;"> <tr style="height:25px;"> <td ng-show="invoice.from_name"> ' + invoice.from_name + ', </td> </tr> <tr> <td style="height:5px;"></td> </tr> <tr> <td ng-show="invoice.from_address">' + invoice.from_address + ',</td> </tr> <tr> <td style="padding:0px; margin:0px;padding-top:25px;padding-bottom:5px;"><font style="font-size:18px;font-family:verdana;color:#3c3c3c;">To</font></td> </tr> <tr style="height:25px;"> <td ng-show="invoice.to_name"> ' + invoice.to_name + ', </td> </tr> <tr> <td style="height:5px;"></td> </tr> <tr > <td ng-show="invoice.to_address">' + invoice.to_address + '</td> </tr> <!-- TB 5 --> </table></td> <td style="border:0px solid red; padding-right:0px; width:495px; text-align:right;vertical-align:top;"></td> </tr> <tr> <td style="vertical-align:bottom;"><!-- TB 5 --> <table border=0 cellpadding=0 cellspacing=0 style="width:100%; height:100%; vertical-align:bottom;border:1px solid white;"> <tr> <td style="width:155px;"></td> <td></td> <td></td> </tr> <tr> <td colspan=3><div id="invoiceHeadlineWhenLogo" style="display:none; float:right; vertical-align:top;margin-top:5px;margin-bottom:20px;text-align:right;letter-spacing:3px;font-size:22px;color:#3c3c3c;font-weight:normal;font-family:arial;"> <br> <input id="invoice_heading_copy" style="text-align:right; padding-top:3px; padding-bottom:3px; padding-right:8px; width:200px; font-weight:normal; letter-spacing:3px; font-family:arial;font-size:22px;color:#3c3c3c;" class="invoiceForm_fromNameTD" type=text value="INVOICE"> </div></td> </tr> <tr style="height:25px; float:right;"> <td></td> <td style="width:146px; padding-right:8px;text-align:right;font-weight:bold;font-family:verdana;font-size:13px;color:#3c3c3c;"> Invoice # : </td> <td >' + invoice.invoice_number + ' <span ng-if="!invoice.invoice_number"> </span></td> </tr> <tr> <td style="height:5px;"></td> </tr> <tr id="po_numberBlankTR" style="display:none;"> <td style="height:5px;"></td> </tr> <tr style="height:25px; float:right;"> <td></td> <td style="padding-right:8px;text-align:right;font-weight:bold;font-family:verdana;font-size:13px;color:#3c3c3c;"> Invoice Date : </td> <td > ' + invoice.invoice_date + ' </td> </tr> <tr> <td style="height:5px;"></td> </tr> <tr style="height:25px; float:right;"> <td></td> <td style="padding-right:8px;text-align:right;font-weight:bold;font-family:verdana;font-size:13px;color:#3c3c3c;"> Due Date : </td> <td > ' + invoice.payment_due_date + ' </td> </tr> <!-- TB 5 --> </table></td> </tr> <!-- TB 4 --> </table></td> </tr> <tr> <td colspan=100 style="width:100%;vertical-align:top;padding-top:35px;"><!-- TB 4 --> <table id="dataTable" border=1 cellpadding=0 cellspacing=0 width="100%" style="vertical-align:top;"><tbody ng-init="amount=[1,2,3,4]"> <tr id="topRow" style="background-color:#54A0E7;height:30px;"> <th style="color:#FFFFFD;font-family:arial;font-size:14px;font-weight:400;padding-left:8px;text-align:left;">Item</th> <th style="color:#FFFFFD;font-family:arial;font-size:14px;font-weight:400;padding-left:5px;text-align:left;">Description</th> <th style="color:#FFFFFD;font-family:arial;font-size:14px;font-weight:400;padding-left:0px;text-align:right;padding-right:4px;">Lead/Call Price</th> <th style="color:#FFFFFD;font-family:arial;font-size:14px;font-weight:400;padding-left:0px;text-align:right;padding-right:4px;">Quantity</th> <th style="color:#FFFFFD;font-family:arial;font-size:14px;font-weight:400;padding-left:0px;text-align:right;padding-right:10px;">Amount</th> </tr>';
    htmlForPdf += '<div class="panel"><div class="panel-heading"><h3 class="text-center">Invoice</h3></div><div class="panel-body pad0"><div> <div class="row invoice-info"> <div class="col-sm-4 invoice-col"> <h4 class="from"> From</h4> <div class="form-group"> <span class="form-control name">' + invoice.from_name + '</span> <span class="form-control name">' + invoice.from_address + '</span> </div> <div class="clearfix"></div> </div> <!-- /.col --> <div class="col-sm-4 invoice-col"> <h4 class="from">To</h4> <div class="form-group details"> <span class="form-control name">' + invoice.to_name + '</span> <span class="form-control name">' + invoice.to_address + '</span> </div> </div> <!-- /.col --> <div class="col-sm-4 invoice-col"> <div class="clearfix"></div> <b>Invoice </b><span class="form-control name2">' + invoice.invoice_number + '</span> <b>Payment Due:</b> <span class="form-control name2">' + invoice.invoice_date + '</span> <b>Due Date: </b><br><span class="form-control name2">' + invoice.payment_due_date + '</span> </div> <!-- /.col --> </div> <div class="row"> <div class="col-xs-12 table-responsive"> <table class="table table-striped"> <thead > <tr class="item-border"> <th>Item</th> <th>Description</th> <th>Lead/Call Price</th> <th>Quantity</th> <th>Amount</th> </tr> </thead> <tbody>';

    var newTotalAmount = 0;
    _.each(req.body.record, function (singleInvoiceData, index) {

        singleInvoiceData.amount = singleInvoiceData.unit_price * singleInvoiceData.qty;
        /* Calculate Total Amount generating pdf through invoice listing */
        if (!req.body.totalAmount) {
            newTotalAmount = newTotalAmount + singleInvoiceData.amount;
        }

        htmlForPdf += '<tr class="item-row">'
                + '<td>' + singleInvoiceData.item + '</td>'
                + '<td>' + singleInvoiceData.description + '</td>'
                + '<td>' + singleInvoiceData.unit_price + '</td>'
                + '<td>' + singleInvoiceData.qty + '</td>'
                + '<td>' + singleInvoiceData.amount + '</td>'
                + '</tr>';
//
//            htmlForPdf += '<tr class="invoiceHeadRow">'
//            + '<td class="invoiceItem">' + singleInvoiceData.item + '</td> '
//            + '<td class="invoiceDescription">' + singleInvoiceData.description + '</td>'
//            + '<td class="invoicePriceOrQty" >' + singleInvoiceData.unit_price + '</td>'
//            + '<td class="invoicePriceOrQty">' + singleInvoiceData.qty + '</td>'
//            + '<td class="invoiceAmount">' + singleInvoiceData.amount + '</td>'
//    + '</tr>';
    }
    );
    var totalAmount = req.body.totalAmount ? req.body.totalAmount : newTotalAmount;

//htmlForPdf += '</tbody> </table></td> </tr> <tr> </tr> <tr> <td>&nbsp;</td> </tr> <tr> <td>&nbsp;</td> </tr> <tr> <td><!-- TB 4 --> <table border=0 cellpadding=0 cellspacing=0 style="width:100%;"> <tr> <td style="vertical-align:top;"><!-- TB 5 --> <table cellspacing=0 cellpadding=0> <tr> <td style="padding-left:2px; font-family:verdana; font-size:13px; color:#3c3c3c; font-weight:bold;"> Invoice Notes </td> </tr> <tr> <td style="padding-top:3px;">' + invoice.notes + '</td> </tr> <!-- TB 5 --> </table></td> <td style="vertical-align:top;"><!-- TB 5 --> <table id="table_sums" style="float:right" border=0 cellpadding=0 cellspacing=0> <tr> <td>&nbsp;</td> </tr> <tr> <td style="width:15px; border-top:2px solid #eaedee;">&nbsp;</td> <td style="width:200px; border-top:2px solid #eaedee;font-family:verdana; font-size:13px; color:#3c3c3c; font-weight:bold;padding-top:6px;padding-bottom:3px; float:right;"> Subtotal </td> <td style="text-align:right;padding-right:4px;border-right:1px solid white;border-top:2px solid #eaedee;border-left:1px solid white;padding-top:6px;padding-bottom:3px;"> <!-- <input style="border:0px solid white;text-align:right; width:100px; padding-right:5px; font-weight:normal; font-family:verdana;font-size:13px;color:#3c3c3c;" readonly type=text id="sum_subtotal" name="sum_subtotal" value="0.00"> --> ' + totalAmount + ' </td> </tr> <tr id="sum_blankSubtotalTR" style="height:3px;display:none;"> <td></td> </tr> <tr id="sum_blankAfterDiscountOrTaxTR" style="height:7px;"> <td></td> </tr> <tr> <td style="width:15px; border-top:2px solid #eaedee;">&nbsp;</td> <td style="border-top:2px solid #eaedee;font-family:verdana; font-size:13px; color:#3c3c3c; font-weight:bold;padding-top:7px;"> Total </td> <td style="padding-top:7px; text-align:right;padding-right:4px;border-right:1px solid white;border-top:2px solid #eaedee;border-left:1px solid white;">' + totalAmount + ' </td> </tr> <!-- amount paid --> <tr> <td style="width:15px; border-top:0px solid #eaedee;">&nbsp;</td> <td style="border-top:0px solid #eaedee;font-family:verdana; font-size:13px; color:#3c3c3c; font-weight:bold;"> Amount Paid </td> <td style="padding-bottom:7px;text-align:right;padding-right:4px;border-right:1px solid white;border-top:0px solid #eaedee;border-left:1px solid white;"> ' + 0 + ' </td> </tr> <!-- balance due --> <tr style="background-color:#FBFF9E;"> <td style="background-color:#FBFF9E;width:15px; border-top:2px solid #eaedee;">&nbsp;</td> <td style="background-color:#FBFF9E;width:200px; border-top:2px solid #eaedee;font-family:verdana; font-size:13px; color:#3c3c3c; font-weight:bold;padding-top:7px;padding-bottom:7px;"> Balance Due&nbsp;<span id="currency_code_output" style="font-family:verdana; font-size:13px; color:#3c3c3c; font-weight:normal;"></span> </td> <td style="background-color:#FBFF9E;text-align:right;padding-right:4px;border-right:1px solid white;border-top:2px solid #eaedee;border-left:1px solid #FBFF9E;"> $' + totalAmount + ' </td> </tr> <!-- TB 5 --> </table></td> </tr> <tr> <td>&nbsp;</td> </tr> <!-- TB 4 --> </table></td> </tr> <!-- TB 3 --> </table> </td> </tr> <!-- TB 2 --> </table> </td> </tr> <!-- TB 1 --> </table> <!-- end main table wrapper --> </td> </tr> </table></form>'
    htmlForPdf += '</tbody> </table> </div> </div> <div class="row"> <!-- accepted payments column --> <div class="col-xs-6"> <div class="form-group"> <span>Invoice Notes: </span> <span >' + invoice.notes + '</span> </div> </div> <!-- /.col --> <div class="col-xs-6"> <p class="lead">Amount</p> <div class="table-responsive"> <table class="table"> <tr> <th style="width:50%">Subtotal:</th> <td> ' + totalAmount + ' </td> </tr> <tr> <th>Total:</th> <td> ' + totalAmount + ' </td> </tr> <tr> <th>Amount Paid:</th> <td> 0 </td> </tr> <tr> <th>Balance Due:</th> <td> $' + totalAmount + ' </td> </tr> </table> </div> </div> </div></div></div></div>'

    var fs = require('fs');
    fs.writeFile('yeLe.html', htmlForPdf, function (err) {
        if (err) {
            console.log('bad');
        } else {
            console.log('cool');
        }
    });

    phantom.create(function (ph) {
        ph.createPage(function (page) {
            page.set('paperSize', {
                format: 'A4',
                orientation: 'portrait',
                margin: '0.7cm'
            }, function (err) {
                page.set('content', htmlForPdf, function (status) {
                    setTimeout(function () {
                        var filePath = '/assets/pdfFiles/' + fileName + '.pdf';
                        page.render('public' + filePath, function (error) {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log("Pdf Created")
                                page.close();
                                ph.exit();
                                callback({"code": 200, 'pdfUrl': filePath, message: 'Pdf Created.'});
                            }
                        });
                    }, 100);
                }
                );
            });
        });
    });
}
exports.pdfGeneration = pdfGeneration;

/* @function : submitOneTimeInvoice
 *  @author  : 
 *  @created  : 31032016
 *  @modified :
 *  @purpose  : send one time invoice
 */
var submitOneTimeInvoice = function (req, res, callback) {

    console.log('req', req.body);

    var invoiceDate = moment(req.body.invoice_date).format("MM/DD/YYYY");
    var dueDate = moment(req.body.payment_due_date).format("MM/DD/YYYY");

    var fromDetails = {
        'name': req.body.from_name,
        'address': req.body.from_address,
        'location': req.body.from_city,
        'country': req.body.from_country
    }

    var toDetails = {
        'name': req.body.to_name,
        'address': req.body.to_address,
        'location': req.body.to_city,
        'country': req.body.to_country
    }

    var sendOnetimeInvoiceDetails = {};
    var guestUserEmail = '';

    if (req.body.userType == 'outsider') {
        sendOnetimeInvoiceDetails['guestUser'] = true;
        guestUserEmail = req.body.to_email;
    }

    var invoiceDetails = {
        "multipleItemList": req.body.record, //itemDetailsArr,
        "fromDetails": fromDetails,
        "toDetails": toDetails,
        "notes": req.body.notes,
        "guestUserEmail": guestUserEmail
    }

    sendOnetimeInvoiceDetails['invoiceType'] = 'onetime';
    sendOnetimeInvoiceDetails['owedToID'] = req.user._id;
    sendOnetimeInvoiceDetails['userType'] = req.user.role_id.code;
    sendOnetimeInvoiceDetails['owedTo'] = req.user.first_name + " " + req.user.last_name;
    //sendOnetimeInvoiceDetails['invoice_no'] = req.body.invoice_number;
    sendOnetimeInvoiceDetails['amount'] = req.body.totalAmount;
    sendOnetimeInvoiceDetails['created'] = invoiceDate;
    sendOnetimeInvoiceDetails['dueDate'] = dueDate;
    sendOnetimeInvoiceDetails['oneTimeInvoiceDetails'] = invoiceDetails;

    var company_name = req.user.company_name ? req.user.company_name.substring(0, 3) : 'PSX';

    if (req.body.userId) { //existing user Id

        /* Get details of user for whom invoice is generated */
        User.findOne({'_id': req.body.userId, 'status': {'$ne': 'delete'}}).populate('role_id').exec(function (err, users) {
            if (err) {
                console.log('userFindErr', err)
            }

            if (!isEmptyObject(users)) {
                sendOnetimeInvoiceDetails['pay_fromID'] = req.body.userId;
                sendOnetimeInvoiceDetails['pay_from'] = users.first_name + " " + users.last_name;
                sendOnetimeInvoiceDetails['payerType'] = users.role_id.code;
            }

            var invoiceData = new Account(sendOnetimeInvoiceDetails);
            invoiceData.pre('save', function (next) {
                /* To Get number of invoices generated yet */
                Account.count({}, function (err, invoiceCount) {
                    if (err) {
                        next({'code': config.constant.CODES.Error, 'message': 'Some error has been occured. Please try again later.'});
                    } else {
                        var invoiceNumber = zeroPad(invoiceCount + 1, 4);
                        invoiceData['invoice_no'] = company_name.toUpperCase() + "_" + invoiceNumber;
                        next();
                    }
                });
            });
            invoiceData.save(function (err, data) {
                if (err) {
                    console.log('invoiceSaveErr', err)
                    callback({'code': config.constant.CODES.Error, 'message': 'Some error has been occured. Please try again later.'});
                } else {
                    console.log('Invoice created successfully!');
                    callback({'code': config.constant.CODES.OK, 'data': invoiceData, 'message': 'Invoice created successfully.'});
                }
            });
        });
    } else {
        var invoiceData = new Account(sendOnetimeInvoiceDetails);

        invoiceData.pre('save', function (next) {
            /* To Get number of invoices generated yet */
            Account.count({}, function (err, invoiceCount) {
                if (err) {
                    next({'code': config.constant.CODES.Error, 'message': 'Some error has been occured. Please try again later.'});
                } else {
                    var invoiceNumber = zeroPad(invoiceCount + 1, 4);
                    invoiceData['invoice_no'] = company_name.toUpperCase() + "_" + invoiceNumber;
                    next();
                }
            });
        });
        invoiceData.save(function (err, data) {
            if (err) {
                console.log('invoiceSaveErr2', err)
                callback({'code': config.constant.CODES.Error, 'message': 'Some error has been occured. Please try again later.'});
            } else {
                console.log('Invoice created successfully!');
                callback({'code': config.constant.CODES.OK, 'data': invoiceData, 'message': 'Invoice created successfully.'});
            }
        });
    }
}
exports.submitOneTimeInvoice = submitOneTimeInvoice;

/* Get Invoice Number */
function zeroPad(num, places) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
}


/* @function : sendOneTimeInvoice
 *  @author  : 
 *  @created  : 31032016
 *  @modified :
 *  @purpose  : send one time invoice
 */
var sendOneTimeInvoice = function (req, res, callback) {

    console.log('request----', req.body);
    var BaseUrl = req.protocol + '://' + req.get('host');

    var invoiceDate = moment(req.body.invoiceDetails.invoice_date).format("MM/DD/YYYY");
    var dueDate = moment(req.body.invoiceDetails.payment_due_date).format("MM/DD/YYYY");

    var fromAddr = req.body.invoiceDetails.from_address + ',<br>' + req.body.invoiceDetails.from_city + ',<br>' + req.body.invoiceDetails.from_country;
    var toAddr = req.body.invoiceDetails.to_address + ',<br>' + req.body.invoiceDetails.to_city + ',<br>' + req.body.invoiceDetails.to_country;
    var invoice = {
        "from_name": req.body.invoiceDetails.from_name,
        "from_address": fromAddr,
        "to_name": req.body.invoiceDetails.to_name,
        "to_address": toAddr,
        "heading": 'INVOICE',
        "invoice_number": req.body.invoiceDetails.invoice_number,
        "invoice_date": invoiceDate,
        "payment_due_date": dueDate,
        "notes": req.body.invoiceDetails.notes ? req.body.invoiceDetails.notes : 'N/A'
    }

    //var htmlData = '<form print-section id="invoice_form" name="invoice_form" action="" method="post" enctype="multipart/form-data" style="padding:0;"> <table print-table="people" id="main_table_wrapper"> <tr> <td> <!-- TB 1 --> <table style="width:100%; margin-left:0px;"> <tr> <td style="text-align:left;padding-top:15px;"> <!-- TB 2 --> <table > <tr print-remove> <td style="height:10px;"></td> </tr> <tr> <td colspan=100 width="100%" class="td-1"> <!-- TB 3 --> <table border=0 cellpadding=0 cellspacing=0 width="100%" class="table-1"> <tr> <td> <table border=0 cellpadding=0 cellspacing=0 style="width:100%;"> <tr style="vertical-align:bottom;"> <td style="padding:0px; margin:0px;"><font style="font-size:18px;font-family:verdana;color:#3c3c3c;">From</font></td> <td style="padding:0px; margin:0px;text-align:right;"> <font style="font-size:28px;font-weight:bold; letter-spacing:5px; font-family:arial;color:#808080;"> <span id="invoiceHeadlineNoLogo" style="position:relative; z-index:100; margin-bottom:-14px;"> <b>' + invoice.heading + '</b> </span> </font> </td> </tr> </table> </td> </tr> <tr> <td><!-- TB 4 --><table border=0 cellspacing=0 cellpadding=0 style="width:100%;"> <tr> <td rowspan=2 style="vertical-align:top;"><!-- TB 5 --> <table border=0 cellpadding=0 cellspacing=0 style="margin-top:5px;"> <tr style="height:25px;"> <td ng-show="invoice.from_name"> ' + invoice.from_name + ', </td> </tr> <tr> <td style="height:5px;"></td> </tr> <tr> <td ng-show="invoice.from_address">' + invoice.from_address + ',</td> </tr> <tr> <td style="padding:0px; margin:0px;padding-top:25px;padding-bottom:5px;"><font style="font-size:18px;font-family:verdana;color:#3c3c3c;">To</font></td> </tr> <tr style="height:25px;"> <td ng-show="invoice.to_name"> ' + invoice.to_name + ', </td> </tr> <tr> <td style="height:5px;"></td> </tr> <tr > <td ng-show="invoice.to_address">' + invoice.to_address + '</td> </tr> <!-- TB 5 --> </table></td> <td style="border:0px solid red; padding-right:0px; width:495px; text-align:right;vertical-align:top;"></td> </tr> <tr> <td style="vertical-align:bottom;"><!-- TB 5 --> <table border=0 cellpadding=0 cellspacing=0 style="width:100%; height:100%; vertical-align:bottom;border:1px solid white;"> <tr> <td style="width:155px;"></td> <td></td> <td></td> </tr> <tr> <td colspan=3><div id="invoiceHeadlineWhenLogo" style="display:none; float:right; vertical-align:top;margin-top:5px;margin-bottom:20px;text-align:right;letter-spacing:3px;font-size:22px;color:#3c3c3c;font-weight:normal;font-family:arial;"> <br> <input id="invoice_heading_copy" style="text-align:right; padding-top:3px; padding-bottom:3px; padding-right:8px; width:200px; font-weight:normal; letter-spacing:3px; font-family:arial;font-size:22px;color:#3c3c3c;" class="invoiceForm_fromNameTD" type=text value="INVOICE"> </div></td> </tr> <tr style="height:25px;"> <td></td> <td style="width:146px; padding-right:8px;text-align:right;font-weight:bold;font-family:verdana;font-size:13px;color:#3c3c3c;float:right"> Invoice # : </td> <td >' + invoice.invoice_number + ' <span ng-if="!invoice.invoice_number"> </span></td> </tr> <tr> <td style="height:5px;"></td> </tr> <tr id="po_numberBlankTR" style="display:none;"> <td style="height:5px;"></td> </tr> <tr style="height:25px;"> <td></td> <td style="padding-right:8px;text-align:right;font-weight:bold;font-family:verdana;font-size:13px;color:#3c3c3c;"> Invoice Date : </td> <td > ' + invoice.invoice_date + ' </td> </tr> <tr> <td style="height:5px;"></td> </tr> <tr style="height:25px;"> <td></td> <td style="padding-right:8px;text-align:right;font-weight:bold;font-family:verdana;font-size:13px;color:#3c3c3c;"> Due Date : </td> <td > ' + invoice.payment_due_date + ' </td> </tr> <!-- TB 5 --> </table></td> </tr> <!-- TB 4 --> </table></td> </tr> <tr> <td colspan=100 style="width:100%;vertical-align:top;padding-top:35px;"><!-- TB 4 --> <table id="dataTable" border=1 cellpadding=0 cellspacing=0 width="100%" style="vertical-align:top;"><tbody ng-init="amount=[1,2,3,4]"> <tr id="topRow" style="background-color:#54A0E7;height:30px;"> <th style="color:#FFFFFD;font-family:arial;font-size:14px;font-weight:400;padding-left:8px;text-align:left;">Item</th> <th style="color:#FFFFFD;font-family:arial;font-size:14px;font-weight:400;padding-left:5px;text-align:left;">Description</th> <th style="color:#FFFFFD;font-family:arial;font-size:14px;font-weight:400;padding-left:0px;text-align:right;padding-right:4px;">Lead/Call Price</th> <th style="color:#FFFFFD;font-family:arial;font-size:14px;font-weight:400;padding-left:0px;text-align:right;padding-right:4px;">Quantity</th> <th style="color:#FFFFFD;font-family:arial;font-size:14px;font-weight:400;padding-left:0px;text-align:right;padding-right:10px;">Amount</th> </tr>';
    //var htmlData = '<form print-section id="invoice_form" name="invoice_form" action="" method="post" enctype="multipart/form-data" style="padding:0;"> <table print-table="people" id="main_table_wrapper"> <tr> <td> <!-- TB 1 --> <table style="width:100%; margin-left:0px;"> <tr> <td style="text-align:left;padding-top:15px;"> <!-- TB 2 --> <table > <tr print-remove> <td style="height:10px;"> </td> </tr> <tr> <td colspan=100 width="100%" class="td-1"> <!-- TB 3 --> <table border=0 cellpadding=0 cellspacing=0 width="100%" class="table-1"> <tr> <td> <table border=0 cellpadding=0 cellspacing=0 style="width:100%;"> <tr style="vertical-align:bottom;"> <td style="padding:0px; margin:0px;"><font style="font-size:18px;font-family:verdana;color:#3c3c3c;">From</font> </td> <td style="padding:0px; margin:0px;text-align:right;"> <font style="font-size:28px;font-weight:bold; letter-spacing:5px; font-family:arial;color:#808080;"> <span id="invoiceHeadlineNoLogo" style="position:relative; z-index:100; margin-bottom:-14px;"> <b>' + invoice.heading + '</b> </span> </font> </td> </tr> </table> </td> </tr> <tr> <td> <!-- TB 4 --> <table border=0 cellspacing=0 cellpadding=0 style="width:100%;"> <tr> <td rowspan=2 style="vertical-align:top;"> <!-- TB 5 --> <table border=0 cellpadding=0 cellspacing=0 style="margin-top:5px;"> <tr style="height:25px;"> <td ng-show="invoice.from_name"> ' + invoice.from_name + ', </td> </tr> <tr> <td style="height:5px;"> </td> </tr> <tr> <td ng-show="invoice.from_address">' + invoice.from_address + ', </td> </tr> <tr> <td style="padding:0px; margin:0px;padding-top:25px;padding-bottom:5px;"><font style="font-size:18px;font-family:verdana;color:#3c3c3c;">To</font> </td> </tr> <tr style="height:25px;"> <td ng-show="invoice.to_name"> ' + invoice.to_name + ', </td> </tr> <tr> <td style="height:5px;"> </td> </tr> <tr > <td ng-show="invoice.to_address">' + invoice.to_address + ' </td> </tr> <!-- TB 5 --> </table> </td> <td style="border:0px solid red; padding-right:0px; width:495px; text-align:right;vertical-align:top;"> </td> </tr> <tr> <td style="vertical-align:bottom;"> <!-- TB 5 --> <table border=0 cellpadding=0 cellspacing=0 style="height: 100%; vertical-align: bottom; border: 1px solid white; float: right; margin-bottom: 10px;"> <tr> <td style="width:146px; padding-right:8px;text-align:right;font-weight:bold;font-family:verdana;font-size:13px;color:#3c3c3c"> Invoice # : </td> <td >' + invoice.invoice_number + ' </td> </tr> <tr> <td style="padding-right:8px;text-align:right;font-weight:bold;font-family:verdana;font-size:13px;color:#3c3c3c;"> Invoice Date : </td> <td > ' + invoice.invoice_date + ' </td> </tr> <tr> <td style="padding-right:8px;text-align:right;font-weight:bold;font-family:verdana;font-size:13px;color:#3c3c3c;"> Due Date : </td> <td > ' + invoice.payment_due_date + ' </td> </tr> <!-- TB 5 --> </table> </td> </tr> <!-- TB 4 --> </table> </td> </tr> <tr> <td colspan=100 style="width:100%;vertical-align:top;padding-top:35px;"> <!-- TB 4 --> <table id="dataTable" border=1 cellpadding=0 cellspacing=0 width="100%" style="vertical-align:top;"><tbody ng-init="amount = [1, 2, 3, 4]"> <tr id="topRow" style="background-color:#54A0E7;height:30px;"> <th style="color:#FFFFFD;font-family:arial;font-size:14px;font-weight:400;padding-left:8px;text-align:left;">Item </th> <th style="color:#FFFFFD;font-family:arial;font-size:14px;font-weight:400;padding-left:5px;text-align:left;">Description </th> <th style="color:#FFFFFD;font-family:arial;font-size:14px;font-weight:400;padding-left:0px;text-align:right;padding-right:4px;">Lead/Call Price </th> <th style="color:#FFFFFD;font-family:arial;font-size:14px;font-weight:400;padding-left:0px;text-align:right;padding-right:4px;">Quantity </th> <th style="color:#FFFFFD;font-family:arial;font-size:14px;font-weight:400;padding-left:0px;text-align:right;padding-right:10px;">Amount </th> </tr>';

    var htmlData = '<link rel="stylesheet" href="' + BaseUrl + '/assets/css/bootstrap.css"><link rel="stylesheet" href="' + BaseUrl + '/assets/css/AdminLTE.css">';
    htmlData += '<style type="text/css"> .from {font-weight:bold; color:#000000; margin-left: 12px; font-size:14px;} .details {text-align:left;} .container { border: 1px solid;} .vat{width:100% !important;} .name { border: medium none; border-radius: 0px; box-shadow: none; height:30px; margin-top: 3px; } .name2 { border: medium none; border-radius: 0px; box-shadow: none; height:30px; margin-top:3px; } .name:focus {border-color: none;box-shadow: none;} .name2:focus {border-color: none;box-shadow: none;} .invoice {text-transform:uppercase; font-size:3em; color:#000000; margin-bottom: 189px; margin-top:0px;padding-left:30px; float:Right;} .invoice-text{float:right;} .space {margin-right:10px;} .item-row {background-color: #FFFFFD !important;} .item {width: 35%;} .item-border {background-color: rgb(66, 139, 202);color: white !important;} .invoice-form {float:right;} .invoice-bottom {margin-bottom:0px !important;} .invoice-align {text-align:end;} .action{ opacity: 0.4; } .action:hover{ opacity: 1; color:rgb(66, 139, 202); } .margin3{ margin-top: 3% } .borderGry { background-color: #eee; } td input.form-control[readonly=""] { background-color: #ffee99; } /*media css start*/ @media screen and (max-width:767px) { .invoice { margin-bottom: 30px; margin-top: 0px; float: left; font-size: 1.5em; } .name { text-align: center; } .from { text-align: center; } .invoice-align { text-align: center; } .invoice { text-align: center; float: none; } .vat { margin-left: 0px; } .total-text { line-height: 15px; margin-right: 80px; } .invoice-form { margin-bottom: 20px; float: initial; } } @media screen and (max-width:380px) { .invoice { margin-bottom: 30px; margin-top: 0px; float: left; font-size: 1.3em; padding-left: 0; text-align: left; } .name { text-align: left; } .from { text-align: left; } .invoice-align { text-align: left; } .vat { margin-left: 0px; } .total-text { line-height: 15px; margin-right: 80px; } .invoice-form { margin-bottom: 20px; } .table-form .form-control {width:inherit;} .name { white-space: inherit; width: 200px !important; } } /*media css end*/@media print {.invoice-col{width:33.33% !important;}*{font-size:14px !important; font-family: "Myriad Set Pro","Helvetica Neue","Helvetica","Arial","sans-serif" !important;}} </style>';
    htmlData += '<div style="background-color:#fff;border:1px solid transparent;border-radius:4px;box-shadow:0 1px 1px rgba(0,0,0,.05);margin-bottom:20px}"><div style="border-bottom:1px solid transparent;border-top-left-radius:3px;border-top-right-radius:3px;padding:10px 15px"><h3 style="text-align:center">Invoice</h3></div><div class="panel-body pad0"><div> <div class="row invoice-info"> <div style="width:33.3333%; float: left;min-height:1px;padding-left:15px;padding-right:15px;position:relative;box-sizing: border-box" class="invoice-col"> <h4 style="color:#000;font-size:14px;font-weight:700;margin-left:12px"> From</h4> <div style="margin-bottom: 15px; box-sizing: border-box;"> <span style="border:none;border-radius:0;box-shadow:none;height:30px;margin-top:3px;  background-color:#fff;background-image:none;color:#555;display:block;font-size:14px;line-height:1.42857;padding:6px 12px;transition:border-color .15s ease-in-out 0s,box-shadow .15s ease-in-out 0s;width:100%">' + invoice.from_name + '</span> <span style="border:none;border-radius:0;box-shadow:none;height:30px;margin-top:3px;  background-color:#fff;background-image:none;color:#555;display:block;font-size:14px;line-height:1.42857;padding:6px 12px;transition:border-color .15s ease-in-out 0s,box-shadow .15s ease-in-out 0s;width:100%">' + invoice.from_address + '</span> </div> <div style="clear: both;"></div> </div> <!-- /.col --> <div style="width:33.3333%; float: left;min-height:1px;padding-left:15px;padding-right:15px;position:relative;box-sizing: border-box" class="invoice-col"> <h4 style="color:#000;font-size:14px;font-weight:700;margin-left:12px">To</h4> <div style="background-color:#fff;background-image:none;color:#555;display:block;font-size:14px;line-height:1.42857;padding:6px 12px;transition:border-color .15s ease-in-out 0s,box-shadow .15s ease-in-out 0s;width:100%;  text-align: left;"> <span style="background-color:#fff;background-image:none;color:#555;display:block;font-size:14px;line-height:1.42857;padding:6px 12px;transition:border-color .15s ease-in-out 0s,box-shadow .15s ease-in-out 0s;width:100%;  border:none;border-radius:0;box-shadow:none;height:30px;margin-top:3px">' + invoice.to_name + '</span> <span style="background-color:#fff;background-image:none;color:#555;display:block;font-size:14px;line-height:1.42857;padding:6px 12px;transition:border-color .15s ease-in-out 0s,box-shadow .15s ease-in-out 0s;width:100%;  border:none;border-radius:0;box-shadow:none;height:30px;margin-top:3px">' + invoice.to_address + '</span> </div> </div> <!-- /.col --> <div style="width:33.3333%; float: left;min-height:1px;padding-left:15px;padding-right:15px;position:relative;box-sizing: border-box" class="invoice-col"> <div style="clear: both"></div> <b>Invoice </b><span style="background-color:#fff;background-image:none;color:#555;display:block;font-size:14px;line-height:1.42857;padding:6px 12px;transition:border-color .15s ease-in-out 0s,box-shadow .15s ease-in-out 0s;width:100%;  border:none;border-radius:0;box-shadow:none;height:30px;margin-top:3px">' + invoice.invoice_number + '</span> <b>Payment Due:</b> <span style="background-color:#fff;background-image:none;color:#555;display:block;font-size:14px;line-height:1.42857;padding:6px 12px;transition:border-color .15s ease-in-out 0s,box-shadow .15s ease-in-out 0s;width:100%;  border:none;border-radius:0;box-shadow:none;height:30px;margin-top:3px"' + invoice.invoice_date + '</span> <b>Due Date: </b><br><span style="background-color:#fff;background-image:none;color:#555;display:block;font-size:14px;line-height:1.42857;padding:6px 12px;transition:border-color .15s ease-in-out 0s,box-shadow .15s ease-in-out 0s;width:100%;  border:none;border-radius:0;box-shadow:none;height:30px;margin-top:3px">' + invoice.payment_due_date + '</span> </div> <!-- /.col --> </div> <div class="row"> <div style="width:100%; float: left;padding-left: 15px;padding-right: 15px;position: relative; min-height:.01%;overflow-x:auto"> <table style="margin-bottom:20px;max-width:100%;width:100%; background-color: transparent; border-collapse: collapse;border-spacing: 0;"> <thead > <tr style="background-color:#428bca;color:#fff!important"> <th>Item</th> <th>Description</th> <th>Lead/Call Price</th> <th>Quantity</th> <th>Amount</th> </tr> </thead> <tbody>';

    var newTotalAmount = 0;
    _.each(req.body.invoiceDetails.record, function (singleInvoiceData, index) {

        singleInvoiceData.amount = singleInvoiceData.unit_price * singleInvoiceData.qty;

        /* Calculate Total Amount generating pdf through invoice listing */
        if (!req.body.invoiceDetails.totalAmount) {
            newTotalAmount = newTotalAmount + singleInvoiceData.amount;
        }

        htmlData += '<tr class="item-row">'
                + '<td>' + singleInvoiceData.item + '</td>'
                + '<td>' + singleInvoiceData.description + '</td>'
                + '<td>' + singleInvoiceData.unit_price + '</td>'
                + '<td>' + singleInvoiceData.qty + '</td>'
                + '<td>' + singleInvoiceData.amount + '</td>'
                + '</tr>';
    });

    var totalAmount = req.body.invoiceDetails.totalAmount ? req.body.invoiceDetails.totalAmount : newTotalAmount;
    htmlData += '</tbody> </table> </div> </div> <div class="row"> <!-- accepted payments column --> <div style="width:50%; float: left; min-height:1px;padding-left:15px;padding-right:15px;position:relative"> <div style="margin-bottom: 15px; box-sizing: border-box;"> <span>Invoice Notes: </span> <span >' + invoice.notes + '</span> </div> </div> <!-- /.col --> <div style="width:50%; float: left; min-height:1px;padding-left:15px;padding-right:15px;position:relative"> <p style="font-size:21px; font-size:16px;font-weight:300;line-height:1.4;margin-bottom:20px">Amount</p> <div style="min-height:.01%;overflow-x:auto"> <table style="margin-bottom:20px;max-width:100%;width:100%; background-color: transparent; border-collapse: collapse;border-spacing: 0;"> <tr> <th style="width:50%">Subtotal:</th> <td> ' + totalAmount + ' </td> </tr> <tr> <th>Total:</th> <td> ' + totalAmount + ' </td> </tr> <tr> <th>Amount Paid:</th> <td> 0 </td> </tr> <tr> <th>Balance Due:</th> <td> $' + totalAmount + ' </td> </tr> </table> </div> </div> </div></div></div></div>'

    /* Send Email through Amazon Aws Ses */
    var to = [req.body.toEmailId];
    var subject = "PSX : One Time Invoice for " + req.body.invoiceDetails.invoice_number;
    var message = htmlData;

    mailCtrl.sendEmail(req.body.formEmailId, to, subject, message, function (response) {
        if (response.code == config.constant.CODES.BadRequest) {
            callback({'code': config.constant.CODES.Error, 'message': response.message});
        } else if (response.code == config.constant.CODES.OK) {
            callback({'code': config.constant.CODES.OK, 'message': 'Invoice sent successfully!'});
        }
    });

    /*client.sendEmail({
     to: req.body.toEmailId,
     //to: [req.body.toEmailId, 'emp_advcc@yopmail.com'],
     from: 'jason36526@gmail.com',
     subject: "PSX : One Time Invoice for " + req.body.invoiceDetails.invoice_number,
     message: htmlData, 
     altText: 'html text'
     }, function (err, data, res) {
     if (err) {
     callback({'code': config.constant.CODES.Error, 'message': 'Some error has been occured. Please try again later.'});
     } else {
     callback({'code': config.constant.CODES.OK, 'message': 'Invoice sent successfully!'});
     }
     });*/
}
exports.sendOneTimeInvoice = sendOneTimeInvoice;