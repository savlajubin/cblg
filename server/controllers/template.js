var config = require('../../config/constant.js'); // constants
var contactList = require('../models/contact_list');
var contactAgenda = require('../models/contact_agenda');
var contacts = require('../models/contact');
var emailTemplate = require('../models/email_template');
var messageModel = require('../models/message_history');
var Agenda = require('agenda');
var agenda = new Agenda({db: {address: 'localhost:27017/db_callbasedleadgen'}});
var mails = require('../controllers/send_mail.js'); // included controller for sending mail operations
var _ = require("underscore");
var mongoose = require("mongoose");
var plivo = require('plivo');
var moment = require('moment');
var formidable = require('formidable');
var csv = require("fast-csv");
var fs = require('fs');
var sendgrid = require('sendgrid')(config.constant.SEND_GRID.username, config.constant.SEND_GRID.password);

var isEmptyObject = function (obj) {
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
}

//Save Email Template
var saveEmailTemplate = function (req, res, callback) {
    //console.log(req.body);
var insertData1 = {
        'template_name': req.body.template_name,
        'template': req.body.template,
        'user_id': req.user._id,
        
    };
    console.log(insertData1)
    var emailTemplate1 = new emailTemplate(insertData1);
    emailTemplate1.save(function (err, response) {
            if (err) {
                console.log(err)
                callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
            } else {
                callback({'code': config.constant.CODES.OK, 'data': response, "message": config.constant.MESSAGES.Success});
            }
        });

}
exports.saveEmailTemplate = saveEmailTemplate;

//Template List

var templateList = function (req, res, callback) {
    console.log("backend templateList");
    
    emailTemplate.find({'is_deleted': false}, function (err, response) {
        if (err) {
            console.log(err)
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
        } else {
            //console.log(response);
            callback({'code': config.constant.CODES.OK,'data': response,  "message": config.constant.MESSAGES.Success});
        }
    });
}
exports.templateList = templateList;

// change Template Status
var changetemplatestatus = function (req, res, callback) {
console.log("inside status");
    
    var field_ids = req.body._id;
    var status = req.body.status;
    emailTemplate.update({_id: field_ids}, {$set: {'status': status}}, function (err,data) {
        if (err) {
            //console.log("System Error (updateStatus) : " + err);
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
        } else {
            //console.log("Updated  (updateStatus) : " + err);
             
                callback({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.statusSuccess});
            
        }
    });
}
exports.changetemplatestatus = changetemplatestatus;
//delete Template list

exports.deleteTemplateList = function (req, res, next) {
    var id = req.params.id;
    console.log(id);
    emailTemplate.findOneAndUpdate({'_id': id}, {is_deleted: true}, {upsert: true}, function (err, doc) {
        if (err) {
            res.send({code: '401', message: "error deleting Template List"});
        }
        res.send({code: '200', message: "Template List deleted Successfully"});
    });
}
//view Template

var findTemplate = function (req, res, callback) {
    var user_id = req.params.id;
    emailTemplate.find({'_id': user_id},function (err, users) {
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
module.exports.findTemplate = findTemplate;

// Edit Template
exports.editEmailTemplate = function (req, res, next) {
    console.log(req.body);
    var query = {'_id': req.body.user_id};
  
    emailTemplate.findOneAndUpdate(query, {'template_name':req.body.template_name, 'template':req.body.template}, {upsert: true}, function (err, doc) {
        if (err) {
            res.send({code: '401', message: "error Editing emailTemplate"});
        }
        res.send({code: '200', message: "E-emailTemplate edited Successfully"});
    });
}
//Get Template
var template_Info = function (req, res, callback) {
    
    var user_id = req.params.id;
    //console.log(user_id);
    emailTemplate.find({'_id': user_id },function (err, users) {
        if (err) {
            //console.log("System Error (findUser) : " + err);
            callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.Error});
        } else {
            console.log(users);

                callback({'code': config.constant.CODES.OK, "data": users, "message": config.constant.MESSAGES.Success});
            
        }
    })
    }
    

module.exports.template_Info = template_Info;