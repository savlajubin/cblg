var config = require('../../config/constant.js'); // constants
var Users = require('../models/user.js');  //To deal with user collection data
var user_profile = require('../models/user_profile.js');
var callModel = require('../models/callHistories.js');  //To deal with callHistories collection data
var formidable = require('formidable');
var fs = require('fs');
var moment = require("moment");

/* @function : isEmptyObject
 *  @created  : 07092015
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

/* @function : listUser
 *  @created  : 07092015
 *  @modified :
 *  @purpose  : Listing User
 */
var listUser = function (req, res, callback) {

    var role_code = req.body.rolecode || req.params.id;
    console.log('asdf', req.body)
    Users.find({'parent_id': req.user._id, 'status': {'$ne': 'delete'}}).populate({path: 'role_id', match: {code: role_code}}).where('role_id').ne(null).exec(function (err, users) {
        if (err) {
            callback({'code': 404, "data": '', "message": "Error"});
        } else {
            // use to filter the role based user
            users = users.filter(function (user) {
                return user.role_id !== null;
            });
            if (isEmptyObject(users)) {
                callback({'code': 404, "data": '', "message": "User not found"});
            } else {
                callback({'code': 200, "data": users, "message": "User found successfully"});
            }
        }
    });
}
exports.listUser = listUser;

/* @function : updateUserData
 *  @created  : 07092015
 *  @modified :
 *  @purpose  : Use for change user  data
 */
var updateUserData = function (req, res, callback) {
    var role_code = req.body.rolecode;
    var field_ids = req.body._id;
    delete req.body._id;
    Users.update({_id: field_ids}, {$set: req.body}, function (err) {
        if (err) {
            //console.log("System Error (updateUserData) : " + err);
            callback({'code': 404, "message": "Error"})
        } else {
            req.body.rolecode = role_code;
            listUser(req, res, function (response) {
                callback({'code': 200, "data": response.data, "message": "Updated successfully."});
            });
        }
    });
}
exports.updateUserData = updateUserData;

/* @function : updateStatus
 *  @created  : 07092015
 *  @modified :
 *  @purpose  : Use for change the status of the user
 */
var updateStatus = function (req, res, callback) {

    var role_code = req.body.rolecode; // role
    var field_ids = req.body.user_id;
    var status = req.body.status || null;

    Users.update({_id: field_ids}, {$set: {'status': status, 'token': ""}}, function (err) {
        if (err) {
            //console.log("System Error (updateStatus) : " + err);
            callback({'code': 404, "message": "Error"})
        } else {

            if (typeof status != 'undefined') {
                req.body.rolecode = role_code;
                listUser(req, res, callback);
                //     ,function (response) {
                //     callback({'code': 200, "data": response.data, "message": "Status changed successfully."});
                // });
            } else {
                callback({'code': 200, "data": null, "message": "Status not changed "});
            }
        }
    });
}
exports.updateStatus = updateStatus;

/* @function : saveNoteForCall
 *  @created  : 08092015
 *  @modified :
 *  @purpose  : saving note for call History
 */


var saveNoteForCall = function (req, res, callback) {
    callModel.update({'_id': req.body._id}, {'Note': req.body.note}, {upsert: true}, function (err, foundData) {
        if (err) {
            //console.log(err);
            callback({'code': 404, "message": "Error"})
        }
        else {
            callback({'code': 200, "message": "Success"})
        }
    });

};
exports.saveNoteForCall = saveNoteForCall;

/* @function : SaveOriginalCaller
 *  @created  : 08092015
 *  @modified :
 *  @purpose  : saving note for call History
 */


var SaveOrignalCaller = function (req, res, callback) {
    
    user_profile.update({user_id: req.user._id}, {$set: {'original_caller_connect': req.body.original_user}}, function (err, foundData) {
        if (err) {
            res.json({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
        }
        else {
            console.log('foundData', foundData);
            res.json({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.Success});
        }
    });

};
exports.SaveOrignalCaller = SaveOrignalCaller;

/* @function : callHistoryByDate
 *  @created  : 08092015
 *  @modified :
 *  @purpose  : list call History By Date
 */

var callHistoryByDate = function (req, res, callback) {
    // Date function data
    var FromDate = req.body.FromDate;
    var ToDate = req.body.ToDate;
    var FromToDate = {'$gte': FromDate, '$lte': ToDate};
    callModel.find({isdeleted: {'$ne': true}, created: FromToDate}, function (err, foundData) {
        if (err) {
            console.log(err);
            callback({code: 500, message: 'Error'});
        } else {
            callback({code: 200, data: foundData});
        }
    });
};
exports.callHistoryByDate = callHistoryByDate;

/* @function : get_contactInfo
 *  @created  : 21102015
 *  @modified :
 *  @purpose  : To find the user contact info data of current logged user
 */
var get_contactInfo = function (req, res, callback) {

    Users.findOne({'_id': req.user._id}, {first_name: 1, last_name: 1, email: 1, addressLine1: 1, addressLine2: 1, phone_no: 1, city: 1, state: 1, zip: 1, country: 1, company_name: 1}).exec(function (err, contactData) {
        if (err) {
            //console.log("System Error (contactData) : " + err);
            callback({'code': 404, "message": "Error"})
        } else {
            callback({'code': 200, "data": contactData, "message": "User data found successfully"});
        }
    });

}
exports.get_contactInfo = get_contactInfo;

//get_callerInfo
var get_callerInfo = function (req, res, callback) {

    user_profile.findOne({'user_id': req.user._id}).exec(function (err, contactData) {
        console.log(contactData);
        if (err) {
            //console.log("System Error (contactData) : " + err);
            callback({'code': 404, "message": "Error"})
        } else {
            callback({'code': 200, "data": contactData, "message": "User data found successfully"});
        }
    });

}
exports.get_callerInfo = get_callerInfo;

/* @function : SaveContactInfo
 *  @created  : 21102015
 *  @modified :
 *  @purpose  : Save contact info of user
 */
var SaveContactInfo = function (req, res) {

    var insertData = {
        'first_name': req.body.first_name,
        'last_name': req.body.last_name,
        'addressLine1': req.body.addressLine1 ? req.body.addressLine1 : '',
        'addressLine2': req.body.addressLine2 ? req.body.addressLine2 : '',
        'city': req.body.city,
        'state': req.body.state,
        'zip': req.body.zip,
        'country': req.body.country,
        // 'time_zone': req.body.time_zone,
        'phone_no': req.body.phone_no,
        'company_name': req.body.company_name ? req.body.company_name : '',
        'modified': new Date()
    }

    Users.update({_id: req.body._id}, {$set: insertData}, function (err) {
        if (err) {
            //console.log("System Error (SaveContactInfo) : " + err);
            res.json({'result': 404, "message": "Error"})
        } else {
            res.json({'result': 200, "message": "Saved successfully!"});
        }
    });

}
exports.SaveContactInfo = SaveContactInfo;

/* @function : get_loginCredentials
 *  @created  : 21102015
 *  @modified :
 *  @purpose  : To find the user login data of current logged user
 */
var get_loginCredentials = function (req, res, callback) {

    Users.findOne({'_id': req.user._id}, {email: 1, password: 1}).exec(function (err, loginData) {
        if (err) {
            //console.log("System Error (loginData) : " + err);
            callback({'code': 404, "message": "Error"})
        } else {
            callback({'code': 200, "data": loginData, "message": "User data found successfully"});
        }
    });

}
exports.get_loginCredentials = get_loginCredentials;


/* @function : change_loginCredentials
 *  @created  : 21102015
 *  @modified :
 *  @purpose  : To find the user login data of current logged user
 */
var change_loginCredentials = function (req, res, callback) {
    var password = req.body.currentpassword;
    var new_pass = createHash(req.body.password);
    Users.findOne({'_id': req.user._id, 'email': req.body.loginemail}, function (err, founduser) {
        if (err) {
            res.json({'code': 404, "message": "Your token might be expire.Please go to previous tab & save your details again."});
        }
        if (isEmptyObject(founduser)) {
            res.json({'code': 404, "message": "Incorrect Username / Password.Please go to previous tab & save your details again."});

        } else if (!isValidPassword(founduser, password)) {
            res.json({'code': 404, "message": "Incorrect Username / Password.Please go to previous tab & save your details again."});
        }

        else {
            // updating the user status (A : active)
            insertData = {password: new_pass}
            Users.update({_id: req.user._id}, {$set: insertData}, function (err) {
                if (err) {
                    //console.log("System Error (SaveContactInfo) : " + err);
                    res.json({'code': 404, "message": "Error"})
                } else {
                    res.json({'code': 200, "message": "Password updated successfully!"});
                }
            });
        }
    });

}
exports.change_loginCredentials = change_loginCredentials;


/* @function : get_lgnsetup
 *  @created  : 21102015
 *  @modified :
 *  @purpose  : To find the user company set up data of current logged user
 */
var get_lgnsetup = function (req, res, callback) {

    user_profile.findOne({'user_id': req.user._id}, {lgn_setup_details: 1}).exec(function (err, setupData) {
        if (err) {
            //console.log("System Error (setupData) : " + err);
            callback({'code': 404, "message": "Error"})
        } else {
            callback({'code': 200, "data": setupData, "message": "User data found succesfully"});
        }
    });

}
exports.get_lgnsetup = get_lgnsetup;

/* @function : get_contracts
 *  @created  : 21102015
 *  @modified :
 *  @purpose  : To find the user company set up data of current logged user
 */
var get_contracts = function (req, res, callback) {

    user_profile.findOne({'user_id': req.user._id}, {contracts: 1}).exec(function (err, setupData) {
        if (err) {
            //console.log("System Error (setupData) : " + err);
            callback({'code': 404, "message": "Error"})
        } else {
            callback({'code': 200, "data": setupData, "message": "Contracts found successfully"});
        }
    });

}
exports.get_contracts = get_contracts;

/* @function :userContractUpload
 * @created  : 21102015
 * @modified :
 * @purpose  : uploads and saves users contract file
 */
var userContractUpload = function (req, next) {

    var form = new formidable.IncomingForm();
    form.uploadDir = "./public/assets/images/contracts";       //set upload directory
    form.keepExtensions = true;     //keep file extension
    form.parse(req, function (err, fields, files)
    {
        var user_id = req.user._id;

        var item = {file_name: files.file.name, path: files.file.path}
        user_profile.findOne({'user_id': user_id}, function (err, data) {
            if (err)
            {
                //console.log(err);
                next({'result': 404, "message": "Error"})
            }
            else
            {
                if (isEmptyObject(data)) {

                    new user_profile({
                        'user_id': user_id,
                        'role_id': req.user.role_id._id || null, // should be for LGN role id if admin create otherwise req.use.role_id._id
                        'contracts': [item],
                        'created': new Date(),
                        'modified': new Date()
                    }).save(function (err, data) {

                        if (err)
                        {
                            //console.log(err);
                            next({'result': 404, "message": "Error"})
                        }
                        else
                        {
                            user_profile.findOne({'user_id': user_id}, function (err, data) {
                                if (err)
                                {
                                    //console.log(err);
                                    next({'result': 404})
                                }
                                else
                                    next({'result': 200, "data": data, "message": "Uploaded sucessfully"})
                            });
                        }
                    });
                }
                else {
                    user_profile.update({'user_id': user_id}, {$push: {contracts: item}}, function (err, data) {
                        if (err)
                        {
                            //console.log(err);
                            next({'result': 404, "message": "Error"})
                        }
                        else {
                            user_profile.findOne({'user_id': user_id}, {contracts: 1}, function (err, data) {
                                if (err)
                                {
                                    //console.log(err);
                                    next({'result': 404, "message": "Error"})
                                }
                                else
                                    next({'result': 200, "data": data, "message": "Uploaded sucessfully"})
                            });
                        }
                    });
                }

            }
        })

    });

};
exports.userContractUpload = userContractUpload;
/* @function : deleteContracts
 *  @created  : 01092015
 *  @modified :
 *  @purpose  : To find the user company set up data of current logged user
 */
var deleteContracts = function (req, callback) {

    var filepath = req.body.filepath;
    user_profile.update({'user_id': req.user._id}, {$pull: {contracts: {_id: req.body.contract_id}}}, function (err) {
        if (err) {
            //console.log("System Error (deleteUser) : " + err);
            callback({'result': 404, "message": " Error"});
        } else {
            user_profile.findOne({'user_id': req.user._id}, {contracts: 1}, function (err, data) {
                if (err)
                {
                    //console.log(err);
                    callback({'result': 404})
                }
                else {

                    fs.unlink(filepath, function (err) {
                        //console.log('File not deleted');

                    });
                    callback({'result': 200, "data": data, "message": "Deleted sucessfully"})
                }
            });
        }
    });

}
exports.deleteContracts = deleteContracts;

/* @function : get_echeckInfo
 *  @created  : 28082015
 *  @modified :
 *  @purpose  : To find the user echeck data of current logged user
 */
var get_echeckInfo = function (req, res, callback) {

    user_profile.findOne({'user_id': req.user._id}, {echeckInfo: 1}).exec(function (err, echeckData) {
        if (err) {
            //console.log("System Error (echeckData) : " + err);
            callback({'code': 404, "message": "Error"})
        } else {
            callback({'code': 200, "data": echeckData, "message": "User data found succesfully"});
        }
    });

}
exports.get_echeckInfo = get_echeckInfo;

/* @function :add_echeckInfo
 * @created  : 25082015
 * @modified :
 * @purpose  : add credit card details of user
 */
var add_echeckInfo = function (req, res)
{
    //console.log(req.body)
    user_profile.findOne({'user_id': req.user._id}, function (err, data) {
        if (err)
        {
            //console.log(err);
            res.json({'result': 404})
        }
        else
        {
            //console.log(req.body)
            var insertdata = {
                'acc_no': req.body.acc_no ? req.body.acc_no : '',
                'routing_no': req.body.routing_no ? req.body.routing_no : '',
                'bank_name': req.body.bank_name ? req.body.bank_name : '',
                'bank_phone': req.body.bank_phone ? req.body.bank_phone : '',
                'bank_zip': req.body.bank_zip ? req.body.bank_zip : '',
                'credit_agree': req.body.credit_agree
            };
            if (isEmptyObject(data)) {
                new user_profile({
                    'user_id': req.user._id,
                    'role_id': req.user.role_id._id, // should be for LGN role id if admin create otherwise req.use.role_id._id
                    'echeckInfo': insertdata,
                    'created': new Date(),
                    'modified': new Date()
                }).save(function (err, data) {

                    if (err)
                    {
                        //console.log(err);
                        res.json({'result': 404, "message": "Error"})
                    }
                    else
                    {
                        res.json({'result': 200, "message": "Saved sucessfully"})
                    }
                });
            }
            else {
                user_profile.update({_id: data._id}, {$set: {
                        'echeckInfo': insertdata,
                        'modified': new Date()
                    }}, function (err, data) {
                    if (err)
                    {
                        //console.log(err)
                        res.json({'result': 404, "message": "Error"})
                    }
                    else
                    {
                        res.json({'result': 200, "message": "Updated sucessfully"});
                    }
                });
            }

        }
    })

}

exports.add_echeckInfo = add_echeckInfo;

/* @function : get_cardDetails
 *  @created  : 25082015
 *  @modified :
 *  @purpose  : To find the user credit card data of current logged user
 */
var get_cardDetails = function (req, res, callback) {
    //console.log(req.user)
    user_profile.findOne({'user_id': req.user._id}, {credit_card_details: 1}).exec(function (err, carddata) {
        if (err) {
            //console.log("System Error (carddata) : " + err);
            callback({'code': 404, "message": "Error"})
        } else {
            callback({'code': 200, "data": carddata, "message": "Credit card data found successfully"});
        }
    });

}
exports.get_cardDetails = get_cardDetails;

/* @function :add_creditCard
 * @created  : 24082015
 * @modified :
 * @purpose  : add credit card details of user
 */
var add_creditCard = function (req, res)
{
    user_profile.findOne({'user_id': req.user._id}, function (err, creditData) {
        if (err) {
            //console.log(err);
            res.json({'result': 404})
        } else {
            if (isEmptyObject(creditData)) {
                new user_profile({
                    'user_id': req.user._id,
                    'role_id': req.user.role_id._id, // should be for LGN role id if admin create otherwise req.use.role_id._id
                    'credit_card_details': [req.body]
                }).save(function (err, data) {
                    if (err) {
                        //console.log(err);
                        res.json({'result': 404, "message": "Error"})
                    } else {
                        res.json({'result': 200, "message": "Saved sucessfully"})
                    }
                });
            } else {
                user_profile.findOne({'user_id': req.user._id, 'credit_card_details.card_no': req.body.card_no}, function (err, checkCredit) {
                    if (isEmptyObject(checkCredit)) {
                        creditData.credit_card_details.push(req.body);
                        creditData.save(function (err) {
                            if (err) {
                                //console.log(err)
                                res.json({'result': 404, "message": "Error"})
                            } else {
                                res.json({'result': 200, "message": "Card Added sucessfully"});
                            }
                        });
                    } else {
                        res.json({'result': 404, "message": "Card Already exist"})
                    }
                })
            }

        }
    })

}

exports.add_creditCard = add_creditCard;
/* @function : makeCard_primary
 *  @created  : 07092015
 *  @modified :
 *  @purpose  : make credit card primary
 */
var makeCard_primary = function (req, res) {

    user_profile.findOne({'user_id': req.user._id}, function (err, numAffected) {
        if (err) {
            //console.log(err)
            res.json({'result': 404, "message": "Error"})
        } else {
            numAffected.credit_card_details.forEach(function (result) {
                if (err) {
                    //console.log(err);
                } else {
                    if (result._id != req.body._id) {
                        result.is_primary = 0;
                    }
                }
            })
            numAffected.save(function (err) {
                if (err) {
                    //console.log(err);
                } else {
                    var partialUpdate = {'_id': req.body._id, 'is_primary': !req.body.is_primary, 'card_no': req.body.card_no, 'exp_month': req.body.exp_month, 'exp_year': req.body.exp_year, 'cvv': req.body.cvv, 'created': req.body.created};
                    user_profile.update({'user_id': req.user._id, 'credit_card_details._id': req.body._id},
                    {$set: {"credit_card_details.$": partialUpdate}},
                    function (err, numAffected) {
                        if (err) {
                            //console.log(err)
                            res.json({'result': 404, "message": "Error"})
                        } else {
                            res.json({'result': 200, "message": "status changed to primary."})
                        }
                    });
                }
            })

        }
    });

}
exports.makeCard_primary = makeCard_primary;

/* @function : remove_card
 *  @created  : 08092015
 *  @modified :
 *  @purpose  : delete credit card primary
 */
var remove_card = function (req, res) {

    user_profile.update({'user_id': req.user._id}, {$pull: {credit_card_details: {_id: req.body.card_id}}}, function (err) {
        if (err) {
            //console.log("System Error (deleteUser) : " + err);
            res.json({'result': 404, "message": " Error"});
        } else {
            res.json({'result': 200, "message": "Deleted sucessfully"})
        }
    });

}
exports.remove_card = remove_card;

/* @function : get_autorecharge
 *  @created  : 08092015
 *  @modified :
 *  @purpose  : To find the user credit card data of current logged user
 */
var get_autorecharge = function (req, res, callback) {

    user_profile.findOne({'user_id': req.user._id}, {auto_recharge_details: 1, "credit_card_details.card_no": 1, "echeckInfo.acc_no": 1, "echeckInfo.credit_agree": 1}).exec(function (err, rechargedata) {
        if (err) {
            //console.log("System Error (rechargedata) : " + err);
            callback({'code': 404, "message": "Error"})
        } else {
            callback({'code': 200, "data": rechargedata, "message": "Auto recharge card data found successfully"});
        }
    });

}
exports.get_autorecharge = get_autorecharge;

/* @function :add_rechargeData
 * @created  : 08092015
 * @modified :
 * @purpose  : add auto recharge details of user
 */
var add_autorechargeData = function (req, res)
{
    user_profile.findOne({'user_id': req.user._id}, function (err, data) {
        if (err)
        {
            //console.log(err);
            res.json({'result': 404})
        }
        else
        {
            var insertData = {
                'bal_Down': req.body.bal_Down ? req.body.bal_Down : '',
                'bal_Up': req.body.bal_Up ? req.body.bal_Up : '',
                'from_account': req.body.from_account ? req.body.from_account : ''
            };
            if (isEmptyObject(data)) {
                new user_profile({
                    'user_id': req.user._id,
                    'role_id': req.user.role_id._id, // should be for LGN role id if admin create otherwise req.use.role_id._id
                    'auto_recharge_details': insertData,
                    'created': new Date(),
                    'modified': new Date()
                }).save(function (err, data) {

                    if (err)
                    {
                        //console.log(err);
                        res.json({'result': 404, "message": "Error"})
                    }
                    else
                    {
                        res.json({'result': 200, "message": "Saved sucessfully"})
                    }
                });
            }
            else {
                user_profile.update({_id: data._id}, {$set: {
                        'auto_recharge_details': insertData,
                        'modified': new Date()
                    }}, function (err, data) {
                    if (err)
                    {
                        //console.log(err)
                        res.json({'result': 404, "message": "Error"})
                    }
                    else
                    {
                        res.json({'result': 200, "message": "Updated sucessfully"});
                    }
                });
            }
        }
    })

}

exports.add_autorechargeData = add_autorechargeData;


/* @function :save_company_details
 * @created  : 08122015 a1&b2
 * @modified :
 * @purpose  : Save contact info of user
 */
var save_company_details = function (req, res)
{
    var form = new formidable.IncomingForm();

    form.uploadDir = "./public/assets/images/companyLogo_contracts";       //set upload directory
    form.keepExtensions = true;     //keep file extension
    form.parse(req, function (err, fields, files)
    {
//        if(fields && fields.bgcolor){
        var insertData = {
            'bgcolor': fields.bgcolor,
            'fontcolor': fields.fontcolor
        };
        console.log(00, fields);
        fields.color_option = insertData;
//        }
        console.log(11, fields);
        if (fields.enable_whitelabel == 'false') {
            user_profile.findOne({'user_id': req.user._id}, function (err, data) {
                if (err)
                {
                    //console.log(err);
                    res.json({'result': config.constant.CODES.notFound})
                }
                else
                {
                    if (isEmptyObject(data)) {
                        user_profile.findOne({'lgn_setup_details.domain_url': fields.domain_url}, function (err, checkDomain) {
                            if (err) {
                                res.json({'result': config.constant.CODES.notFound})
                            } else if (isEmptyObject(checkDomain)) {
                                fields.logo = files.file ? files.file.path : null;
                                new user_profile({
                                    'user_id': fields.existing_user_id,
                                    'lgn_setup_details': fields,
                                    'created': new Date(),
                                    'modified': new Date()
                                }).save(function (err, data) {
                                    if (err)
                                    {
                                        console.log(err);
                                        if (err && err.code == 11001)
                                            res.json({'result': config.constant.CODES.notFound, "message": config.constant.MESSAGES.domainAlreadyExist})
                                        else
                                            res.json({'result': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                                    }
                                    else
                                    {
                                        res.json({'result': config.constant.CODES.OK, "message": config.constant.MESSAGES.saveSuccess})
                                    }
                                });
                            } else {
                                res.json({'result': config.constant.CODES.notFound, "message": config.constant.MESSAGES.domainAlreadyExist})
                            }
                        });
                    }
                    else {

                        fields.logo = files.file ? files.file.path : data.lgn_setup_details.logo;
                        user_profile.findOne({'lgn_setup_details.domain_url': fields.domain_url}, function (err, checkDomain) {
                            if (err) {
                                res.json({'result': config.constant.CODES.notFound})
                            } else if (isEmptyObject(checkDomain) || (checkDomain && checkDomain.user_id == req.user._id)) {
                                user_profile.update({_id: data._id}, {$set: {
                                        'lgn_setup_details': fields,
                                        'modified': new Date()
                                    }}, function (err, data) {
                                    if (err)
                                    {
                                        if (err && err.code == 11001)
                                            res.json({'result': config.constant.CODES.notFound, "message": config.constant.MESSAGES.domainAlreadyExist})
                                        else
                                            res.json({'result': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                                    }
                                    else
                                    {
                                        res.json({'result': config.constant.CODES.OK, "message": config.constant.MESSAGES.updateSuccess});
                                    }
                                });
                            } else {
                                console.log('asdfasd')
                                res.json({'result': config.constant.CODES.notFound, "message": config.constant.MESSAGES.domainAlreadyExist})
                            }
                        });
                    }
                }
            })
        } else {
            user_profile.update({'user_id': req.user._id}, {$set: {'lgn_setup_details': fields}}, function (err, count) {
                if (err) {
                    res.json({'result': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                } else {
                    res.json({'result': config.constant.CODES.OK, "message": config.constant.MESSAGES.updateSuccess})
                }
            });
        }

    });

}

exports.save_company_details = save_company_details;

/* @function : addDisaproveNote
 *  @created  : 10122015
 *  @modified :
 *  @purpose  : saving note of disapprove for call History
 */


var addDisaproveNote = function (req, res, callback) {
    callModel.update({'_id': req.body.id}, {$set: req.body}, {upsert: true}, function (err, foundData) {
        if (err) {
            //console.log(err);
            callback({'code': 404, "message": "Error"})
        }
        else {
            req.body.ToDate = moment().toISOString();
            req.body.FromDate = moment().subtract(7, 'day').toISOString();
            callHistoryByDate(req, res, callback);
            //callback({'code': 200, "message": "Success"})
        }
    });

};
exports.addDisaproveNote = addDisaproveNote;

/* @function : deleteUser
 *  @created  : 11122015
 *  @modified :
 *  @purpose  : delete the user
 */
var deleteUser = function (req, res, callback) {

    var collection_userArr = req.body.user_ids; //[{id:'559b72302b8723dfd1e94db3'}];
    var coll_length = collection_userArr.length;
    collection_userArr.forEach(function (user_id) {
        req.params.id = user_id.rolecode; // user role code
        Users.update({_id: user_id.id}, {$set: {'status': 'delete', 'modified': Date.now()}}, function (err) {
            if (err) {
                //console.log("System Error (deleteUser) : " + err);
                callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
            } else {
                coll_length--;
                if (coll_length == 0) {
                    listUser(req, res, function (response) {
                        callback({'code': config.constant.CODES.OK, "data": response.data, "message": config.constant.MESSAGES.deleteSuccess});
                    });
                }
            }
        });
    });
}
module.exports.deleteUser = deleteUser;


//encrypted password match
var isValidPassword = function (user, password) {
    return bCrypt.compareSync(password, user.password);
}

// Generates hashed value using bCrypt
var createHash = function (password) {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}
