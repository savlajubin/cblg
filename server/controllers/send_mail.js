var config = require('../../config/constant.js'); // constants
var sendgrid = require('sendgrid')(config.constant.SEND_GRID.username, config.constant.SEND_GRID.password);
/*var amazonSes = require('node-ses')
 , client = amazonSes.createClient({
 key: config.constant.AMAZON_AWS.key,
 secret: config.constant.AMAZON_AWS.secret
 });*/

/* Amazon aws ses package */
var awsSDK = require('aws-sdk');
awsSDK.config.update({
    accessKeyId: config.constant.AMAZON_AWS.key,
    secretAccessKey: config.constant.AMAZON_AWS.secret,
    region: 'us-east-1'
});
var awsSES = new awsSDK.SES();

var Users = require('../models/user.js'); //To deal with user collection data
var users = require('../controllers/user.js'); //To access user controller function
var config = require('../../config/constant.js');
var randtoken = require('rand-token');
var smtpTransport = require('nodemailer-smtp-transport');
var nodemailer = require('nodemailer');

/* @function : registrationMail
 *  @created  : 10072015
 *  @modified :
 *  @purpose  : Sending the  Register mail to the customer
 */
var registrationMail = function (req, res, callback) {
    var token = randtoken.generate(16);
    var activationLink = config.constant.BASEURL + "#!/activate_account/" + token;

    /* Send Email through Amazon Aws SES */
    var to = [req.user.email];
    var subject = 'CallBasedLeadGeneration - Registration mail';
    var message = '<h1><img alt="" src="" /></h1><hr /><table align="center" style="height:150px; width:627px"><tbody><tr><td><h1>CallBasedLeadGeneration - Registration mail</h1><hr /><p><big>Hi ' + req.user.first_name + ',</big></p><p><big>You have been register successfully. Please <a href="' + activationLink + '" title="click here">click here</a> on the link for activation or copy and run the url : <strong>' + activationLink + '</strong></big></p><h3><code>Thanks,<br />CallBasedLeadGeneration Team</code></h3></td></tr></tbody></table>';

    sendEmail('jason36526@gmail.com', to, subject, message, function (response) {
        if (response.code == config.constant.CODES.notFound) {
            return console.error(err);
        } else if (response.code == config.constant.CODES.OK) {
            callback({'code': config.constant.CODES.OK, "message": "Saved successfully!"});
        }
    });

//    /* Send Email through Amazon Aws Ses */
//    client.sendEmail({
//        to: req.user.email,
//        from: 'jason36526@gmail.com',
//        subject: 'CallBasedLeadGeneration - Registration mail',
//        message: '<h1><img alt="" src="" /></h1><hr /><table align="center" style="height:150px; width:627px"><tbody><tr><td><h1>CallBasedLeadGeneration - Registration mail</h1><hr /><p><big>Hi ' + req.user.first_name + ',</big></p><p><big>You have been register successfully. Please <a href="' + activationLink + '" title="click here">click here</a> on the link for activation or copy and run the url : <strong>' + activationLink + '</strong></big></p><h3><code>Thanks,<br />CallBasedLeadGeneration Team</code></h3></td></tr></tbody></table>',
//        altText: 'html text'
//    }, function (err, data, res) {
//        if (err) {
//            return console.error(err);
//        } else {
//            console.log('data ', data);
//            callback(data);
//        }
//    });
}
exports.registrationMail = registrationMail;

/* @function : registrationToCustomEmail
 *  @created  : 13102015
 *  @modified :
 *  @purpose  : Sending the  Register mail to the customer to respective email id
 */
var registrationToCustomEmail = function (req, res, callback) {
    var token = randtoken.generate(16);
    if (req.get('host') == 'localhost') {
        var baseUrl = req.protocol + '://' + req.get('host') + ':' + req.get('port');
    } else {
        var baseUrl = req.protocol + '://' + req.get('host');
    }
    var activationLink = baseUrl + "/#!/activate_account/" + token;

    /* Send Email through Amazon Aws SES */
    var to = [req.body.email];
    var subject = 'CallBasedLeadGeneration - Registration mail';
    var message = '<h1><img alt="" src="" /></h1><hr /><table align="center" style="height:150px; width:627px"><tbody><tr><td><h1>CallBasedLeadGeneration - Registration mail</h1><hr /><p><big>Hi ' + req.body.first_name + ',</big></p><p><big>You have been register successfully. Please <a href="' + activationLink + '" title="click here">click here</a> on the link for activation or copy and run the url : <strong>' + activationLink + '</strong></big></p><h3><code>Thanks,<br />CallBasedLeadGeneration Team</code></h3></td></tr></tbody></table>';

    sendEmail('jason36526@gmail.com', req.body.email, subject, message, function (response) {
        if (response.code == config.constant.CODES.notFound) {
            return console.error(err);
        } else if (response.code == config.constant.CODES.OK) {
            //To save token
            Users.update({email: req.body.email}, {$set: {token: token}}, function (err) {
                if (err) {
                    callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                } else {
                    callback({'code': config.constant.CODES.OK, "message": "Saved successfully!"});
                }
            });
        }
    });

//    /* Send Email through Amazon Aws Ses */
//    client.sendEmail({
//        to: req.body.email,
//        from: 'jason36526@gmail.com',
//        subject: 'CallBasedLeadGeneration - Registration mail',
//        message: '<h1><img alt="" src="" /></h1><hr /><table align="center" style="height:150px; width:627px"><tbody><tr><td><h1>CallBasedLeadGeneration - Registration mail</h1><hr /><p><big>Hi ' + req.body.first_name + ',</big></p><p><big>You have been register successfully. Please <a href="' + activationLink + '" title="click here">click here</a> on the link for activation or copy and run the url : <strong>' + activationLink + '</strong></big></p><h3><code>Thanks,<br />CallBasedLeadGeneration Team</code></h3></td></tr></tbody></table>',
//        altText: 'html text'
//    }, function (err, data, res) {
//        if (err) {
//            return console.error(err);
//        } else {
//            console.log('data ', data);
//
//            //To save token
//            Users.update({email: req.body.email}, {$set: {token: token}}, function (err) {
//                if (err) {
//                    callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
//                } else {
//                    callback({'code': config.constant.CODES.OK, "message": "Saved successfully!"});
//                }
//            });
//        }
//    });
}
exports.registrationToCustomEmail = registrationToCustomEmail;

/* @function : reset_passwordEmail
 *  @created  : 13102015
 *  @modified :
 *  @purpose  : Sending the  Register mail to the customer to respective email id
 */
var reset_passwordEmail = function (req, res, callback) {
    var token = randtoken.generate(16);
    if (req.get('host') == 'localhost') {
        var baseUrl = req.protocol + '://' + req.get('host') + ':' + req.get('port');
    } else {
        var baseUrl = req.protocol + '://' + req.get('host');
    }
    var activationLink = baseUrl + "/#!/reset_password/" + token;
    console.log(baseUrl)
    console.log(activationLink)

    var to = [req.body.user_email];
    var subject = 'CallBasedLeadGeneration - Reset password link';
    var message = '<h1><img alt="" src="" /></h1><hr /><table align="center" style="height:150px; width:627px"><tbody><tr><td><h1>CallBasedLeadGeneration - Reset Password Link</h1><hr /><p><big>Hello,</big></p><p><big>Someone tried to reset your password. Please <a href="' + activationLink + '" title="click here">click here</a> on the link for reset your password or copy and run the url : <strong>' + activationLink + '</strong></big></p><h3><code>Thanks,<br />CallBasedLeadGeneration Team</code></h3></td></tr></tbody></table>';

    sendEmail('jason36526@gmail.com', to, subject, message, function (response) {

        if (response.code == config.constant.CODES.notFound) {
            return console.error(err);
        } else if (response.code == config.constant.CODES.OK) {
            Users.update({email: req.body.user_email}, {$set: {password_reset_token: token}}, function (err) {
                if (err) {
                    callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                } else {
                    callback({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.passwordReset});
                }
            });
        }
    });

    /* Send Email through Amazon Aws Ses */
//    client.sendEmail({
//        to: req.body.user_email,
//        from: 'jason36526@gmail.com',
//        subject: 'CallBasedLeadGeneration - Reset password link',
//        message: '<h1><img alt="" src="" /></h1><hr /><table align="center" style="height:150px; width:627px"><tbody><tr><td><h1>CallBasedLeadGeneration - Reset Password Link</h1><hr /><p><big>Hello,</big></p><p><big>Someone tried to reset your password. Please <a href="' + activationLink + '" title="click here">click here</a> on the link for reset your password or copy and run the url : <strong>' + activationLink + '</strong></big></p><h3><code>Thanks,<br />CallBasedLeadGeneration Team</code></h3></td></tr></tbody></table>',
//        altText: 'html text'
//    }, function (err, data, res) {
//        if (err) {
//            return console.error(err);
//        } else {
//            console.log('data ', data);
//            Users.update({email: req.body.user_email}, {$set: {password_reset_token: token}}, function (err) {
//                if (err) {
//                    callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
//                } else {
//                    callback({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.passwordReset});
//                }
//            });
//            callback(data);
//        }
//    });
}
exports.reset_passwordEmail = reset_passwordEmail;

/* @function : sendInviteMail
 *  @created  : 21012016
 *  @modified :
 *  @purpose  : Sending the  Invitation mail
 */
var sendInviteMail = function (req, res, data, callback) {
    if (req.get('host') == 'localhost') {
        var baseUrl = req.protocol + '://' + req.get('host') + ':' + req.get('port');
    } else {
        var baseUrl = req.protocol + '://' + req.get('host');
    }
    var activationLink = baseUrl + "#!/accept-invite/" + data._id;

    /* Send Email through Amazon Aws SES */
    var to = [req.body.email];
    var subject = 'CallBasedLeadGeneration - Invitation mail';
    var message = '<h1><img alt="" src="" /></h1><hr /><table align="center" style="height:150px; width:627px"><tbody><tr><td><h1>CallBasedLeadGeneration - Invitation mail</h1><hr /><p><big>Hi ' + req.body.email + ',</big></p><p><big>You have been invited to join LGN. Please <a href="' + activationLink + '" title="click here">click here</a> on the link to accept invitation or copy and run the url : <strong>' + activationLink + '</strong></big></p><h3><code>Thanks,<br />CallBasedLeadGeneration Team</code></h3></td></tr></tbody></table>';

    sendEmail('jason36526@gmail.com', to, subject, message, function (response) {
        if (response.code == config.constant.CODES.notFound) {
            return console.error(err);
        } else if (response.code == config.constant.CODES.OK) {
            callback({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.Success});
        }
    });


//    /* Send Email through Amazon Aws SES */
//    client.sendEmail({
//        to: req.body.email,
//        from: 'jason36526@gmail.com',
//        subject: 'CallBasedLeadGeneration - Invitation mail',
//        message: '<h1><img alt="" src="" /></h1><hr /><table align="center" style="height:150px; width:627px"><tbody><tr><td><h1>CallBasedLeadGeneration - Invitation mail</h1><hr /><p><big>Hi ' + req.body.email + ',</big></p><p><big>You have been invited to join LGN. Please <a href="' + activationLink + '" title="click here">click here</a> on the link to accept invitation or copy and run the url : <strong>' + activationLink + '</strong></big></p><h3><code>Thanks,<br />CallBasedLeadGeneration Team</code></h3></td></tr></tbody></table>',
//        altText: 'html text'
//    }, function (err, data, res) {
//        if (err) {
//            return console.error(err);
//        } else {
//            console.log('data ', data);
//            callback({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.Success});
//        }
//    });
}
exports.sendInviteMail = sendInviteMail;


/* @function : sendMediaRequestMail 
 *  @created  : 04022016
 *  @modified : 
 *  @purpose  : Sending Media Request Mail
 */
var sendMediaRequestMail = function (req, res, callback) {

    /* Send Email through Amazon Aws SES */

    var to = ['jason36526@gmail.com'];
    var from = 'jason36526@gmail.com';
    var subject = 'CallBasedLeadGeneration - Media Request';
    var message = '<h1><img alt="" src="" /></h1><hr /><table align="center" class="col-sm-10"><tbody><tr><td><h1>CallBasedLeadGeneration - Media Request</h1><hr /><p><big>Hi Jason,</big></p><p><big>There is a Media Request for the price of ' + req.body.media_type + ' from ' + req.body.name + '. <br> Email id : ' + req.body.email + ' <br> Phone no : ' + req.body.phone_no + ' </p><h3><code>Thanks,<br />CallBasedLeadGeneration Team</code></h3></td></tr></tbody></table>';

    sendEmail(from, to, subject, message, function (response) {

        if (response.code == config.constant.CODES.notFound) {
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
        } else if (response.code == config.constant.CODES.OK) {
            callback({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.Success});
        }
    });

//    client.sendEmail({
//        to: 'jason36526@gmail.com',
//        from: 'jason36526@gmail.com',
//        subject: 'CallBasedLeadGeneration - Media Request',
//        message: '<h1><img alt="" src="" /></h1><hr /><table align="center" class="col-sm-10"><tbody><tr><td><h1>CallBasedLeadGeneration - Media Request</h1><hr /><p><big>Hi Jason,</big></p><p><big>There is a Media Request for the price of ' + req.body.media_type + ' from ' + req.body.name + '. <br> Email id : ' + req.body.email + ' <br> Phone no : ' + req.body.phone_no + ' </p><h3><code>Thanks,<br />CallBasedLeadGeneration Team</code></h3></td></tr></tbody></table>',
//        altText: 'html text'
//    }, function (err, data, res) {
//        if (err) {
//            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
//        } else {
//            console.log('data ', data);
//            callback({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.Success});
//        }
//    });
}
exports.sendMediaRequestMail = sendMediaRequestMail;

/* @function : sendMailToContacts 
 *  @created  : 04022016
 *  @modified : 
 *  @purpose  : Sending Media Request Mail
 */
var sendMailToContacts = function (message, subject, contacts, callback) {
    console.log('contacts', contacts);
    var emailArr = [];
    contacts.forEach(function (item, i) {
        emailArr.puch(item.email);
        if (i + 1 == contacts.length) {
            sendEmail('jason36526@gmail.com', emailArr, subject, message, function (response) {
                if (response.code == config.constant.CODES.notFound) {
                    callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
                } else if (response.code == config.constant.CODES.OK) {
                    callback({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.Success});
                }
            });
        }

//        client.sendEmail({
//            to: item.email,
//            from: 'jason36526@gmail.com',
//            subject: subject,
//            message: message,
//            altText: 'html text'
//        }, function (err, data, res) {
//            if (i + 1 == contacts.length) {
//                if (err) {
//                    console.log('Error mail : ', err);
//                    callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
//                } else {
//                    console.log('data ', data);
//                    callback({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.Success});
//                }
//            }
//        });
    });
    //callback();
}
exports.sendMailToContacts = sendMailToContacts;


/* @function : sendMail 
 *  @created  : 15042016
 *  @modified : 
 *  @purpose  : Generalize function for sending mails
 */
function sendEmail(from, to, subject, message, callback) {
    awsSES.sendEmail({
        Destination: {//To
            ToAddresses: to
        }
        , Source: from //From
        , Message: {
            Subject: {
                Data: subject
            },
            Body: {
                Html: {
                    Data: message, /* required */
                }
            }
        }
    }, function (err, data) {
        if (err) {
            if (err.statusCode == 400) {
                Users.update({aws_verified_email: from}, {$set: {aws_verified_email_status: false}}, {multi: true, upsert: true}, function (err1, data) {
                    if (err1) {
                        callback({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error});
                    } else {
                        callback({'code': err.statusCode, "message": err.message});
                    }
                });
            } else {
                console.log('err 2', err);
                callback({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error});
            }
        } else {
            console.log('data ', data);
            callback({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.Success});
        }
    });
}
exports.sendEmail = sendEmail;