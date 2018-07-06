var config = require('../../config/constant.js'); // constants
var formidable = require('formidable');
var fs = require('fs');
// load up the crypt lib
var bCrypt = require('bcrypt-nodejs');
var userModel = require('../models/user.js'); //To store user personal details
var user_profile = require('../models/user_profile.js'); //To store user profile details
var routingDB = require('../models/routing_db.js'); //To store db config
var mails = require('../controllers/send_mail.js'); // included controller for sending mail operations
var inviteModel = require('../models/invite');
var moment = require('moment');
var _ = require('underscore');
var plivo = require('plivo');
var twilio = require('twilio');
var esignModel = require('../models/esign.js');
var geoip = require('geoip-lite');
var network = require('network');
var randtoken = require('rand-token');
var ip = '';
var zip = require('../models/zipcode.js');

/* Amazon Aws SES */
var awsSDK = require('aws-sdk');
awsSDK.config.update({
    accessKeyId: config.constant.AMAZON_AWS.key,
    secretAccessKey: config.constant.AMAZON_AWS.secret,
    region: 'us-east-1'
});
var awsSES = new awsSDK.SES();

/* @function : isEmptyObject
 *  @Creator  :
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


/* @function : SaveContactInfo
 *  @created  : 09072015
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
    };
    userModel.update({_id: req.body._id}, {$set: insertData}, function (err) {
        if (err) {
            //console.log("System Error (SaveContactInfo) : " + err);
            res.json({'result': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
        } else {
            res.json({'result': config.constant.CODES.OK, "message": config.constant.MESSAGES.saveSuccess});
        }
    });
}
exports.SaveContactInfo = SaveContactInfo;
/* @function :SaveCompanyDetails
 * @created  : 10072015
 * @modified :
 * @purpose  : Save contact info of user
 */
var SaveCompanyDetails = function (req, res)
{
    var form = new formidable.IncomingForm();
    form.uploadDir = "./public/assets/images/companyLogo_contracts"; //set upload directory
    form.keepExtensions = true; //keep file extension
    form.parse(req, function (err, fields, files)
    {
        var insertData = {
            'bgcolor': fields.bgcolor,
            'fontcolor': fields.fontcolor
        };
        console.log(fields);
        fields.color_option = insertData;
        if (fields.enable_whitelabel == 'false') {
            user_profile.findOne({'user_id': fields.existing_user_id}, function (err, data) {
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
                                    'role_id': '559a6a1723405677c3d2d436', // for LGN role
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
                            } else if (isEmptyObject(checkDomain) || (checkDomain && checkDomain.user_id == fields.existing_user_id)) {
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
            user_profile.update({'user_id': fields.existing_user_id}, {$set: {'lgn_setup_details.enable_whitelabel': fields.enable_whitelabel}}, function (err, count) {
                if (err) {
                    res.json({'result': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                } else {
                    res.json({'result': config.constant.CODES.OK, "message": config.constant.MESSAGES.updateSuccess})
                }
            });
        }

    });
}

exports.SaveCompanyDetails = SaveCompanyDetails;
/* @function : saveToken
 *  @created  : 10072015
 *  @modified :
 *  @purpose  : storing the unique token for user activation
 */
var saveToken = function (req, res, token, callback) {
    var insertData = {
        'token': token,
        'status': "Pending"
    }
    var user_id = req.user._id;
    userModel.update({_id: user_id}, {$set: insertData}, function (err) {
        if (err) {
            //console.log("System Error (Token) : " + err);
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
        } else {
            callback({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.saveSuccess});
        }
    });
}
exports.saveToken = saveToken;
/* @function : activationLink
 *  @created  : 10072015
 *  @modified :
 *  @purpose  : user account activation functionality
 */
var activationLink = function (req, res) {
    var token = req.body.token;
    var password = req.body.password;
    // Destroy all the active sessions
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    req.logout();
    req.session.destroy();
    req.session = null;
    // Destroy active session END
    userModel.findOne({'token': token}, function (err, user) {
        if (err) {
            //console.log("System Error (activationLink) : " + err);
            res.json({'code': config.constant.CODES.notFound, "message": "Your token might be expire. Please contact administrator or support staff."});
        }

        if (isEmptyObject(user) || !isValidPassword(user, password)) {
            if (isEmptyObject(user)) {
                res.json({'code': config.constant.CODES.notFound, "message": "Unauthorized URL"}); // redirect back to login page
            } else {
                res.json({'code': config.constant.CODES.notFound, "message": "Invalid credentials.Please check your email or password."}); // redirect back to login page
            }

        } else {
            // updating the user status (A : active)
            userModel.update({_id: user._id}, {$set: {'status': "active", 'token': ""}}, function (err) {
                if (err) {
                    //console.log("System Error (updateStatus) : " + err);
                    res.json({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                } else {
                    //console.log("Updated  (updateStatus) : " + err);
                    res.json({'code': config.constant.CODES.OK, "data": null, "message": "Account activated successfully."});
                }
            });
        }
    });
}
exports.activationLink = activationLink;
/* @function : updateStatus
 *  @created  : 10072015
 *  @modified :
 *  @purpose  : Use for change the status of the user (A:active,P: pending & D: deactive)
 */
var updateStatus = function (req, res, callback) {

    req.params.id = req.body.rolecode; // role
    var field_ids = req.body.user_id;
    var status = req.body.status || null;
    userModel.update({_id: field_ids}, {$set: {'status': status, 'token': ""}}, function (err) {
        if (err) {
            //console.log("System Error (updateStatus) : " + err);
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
        } else {
            //console.log("Updated  (updateStatus) : " + err);
            if (typeof status != 'undefined') {
                listUserByRole(req, res, function (response) {
                    callback({'code': config.constant.CODES.OK, "data": response.data, "message": config.constant.MESSAGES.statusSuccess});
                });
            } else {
                callback({'code': config.constant.CODES.OK, "data": null, "message": config.constant.MESSAGES.statusSuccess});
            }
        }
    });
}
exports.updateStatus = updateStatus;
/* @function : deleteUser
 *  @created  : 15072015
 *  @modified :
 *  @purpose  : delete the role from the system  (true,false)
 */
var deleteUser = function (req, res, callback) {

    var collection_userArr = req.body.user_ids; //[{id:'559b72302b8723dfd1e94db3'}];
    var coll_length = collection_userArr.length;
    collection_userArr.forEach(function (user_id) {
        req.params.id = user_id.rolecode; // user role code
        userModel.update({_id: user_id.id}, {$set: {'status': 'delete', 'modified': Date.now()}}, function (err) {
            if (err) {
                //console.log("System Error (deleteUser) : " + err);
                callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
            } else {
                coll_length--;
                if (coll_length == 0) {
                    listUserByRole(req, res, function (response) {
                        callback({'code': config.constant.CODES.OK, "data": response.data, "message": config.constant.MESSAGES.deleteSuccess});
                    });
                }
            }
        });
    });
}
module.exports.deleteUser = deleteUser;
/* @function : findUser
 *  @created  : 15072015
 *  @modified :
 *  @purpose  : get the user from the system
 */
var findUser = function (req, res, callback) {
    var user_id = req.params.id;
    userModel.find({'_id': user_id, 'status': {'$ne': 'delete'}}).populate('role_id').exec(function (err, users) {
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
module.exports.findUser = findUser;

/* @function : userLisitingForOneTimeInvoice
 *  @created  : 07042016
 *  @modified :
 *  @purpose  : list user as per role in the system
 */
var userLisitingForOneTimeInvoice = function (req, res, callback) {


    var roleCode = req.params.roleCode;
    var conditions = {};
    var populateConditions = {};

    if (roleCode == 'LGN') {
        conditions = {'status': {'$ne': 'delete'}, '_id': {'$ne': req.user._id}, 'parent_id': req.user._id};
        populateConditions = {path: 'role_id', match: {"code": {$nin: ['LGN', 'PA']}}};
    } else if (roleCode == 'ADVCC' || roleCode == 'LB' || roleCode == 'LG') {
        conditions = {'status': {'$ne': 'delete'}, '_id': {'$ne': req.user._id}, '_id' : req.user.parent_id._id};
        populateConditions = {path: 'role_id', match: {"code": 'LGN'}};
    }

    //userModel.find({'status': {'$ne': 'delete'}}).populate({path: 'role_id', match: {"code": {$nin: ['LGN', 'PA']}}}).exec(function (err, users) {
    userModel.find(conditions).populate(populateConditions).exec(function (err, users) {
        if (err) {
            callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.Error});
        } else {
            if (!isEmptyObject(users)) {
                // use to filter the role based user
                users = users.filter(function (user) {
                    console.log('user', user);
                    if (user.role_id) {
                        return user.role_id.code !== 'ADMIN';
                    }
                });
            }

            if (isEmptyObject(users)) {
                callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.notFound});
            } else {
                callback({'code': config.constant.CODES.OK, "data": users, "message": config.constant.MESSAGES.Success});
            }
        }
    });
}
module.exports.userLisitingForOneTimeInvoice = userLisitingForOneTimeInvoice;

/* @function : listUserByRole
 *  @created  : 15072015
 *  @modified :
 *  @purpose  : list user as per role in the system
 */
var listUserByRole = function (req, res, callback) {
    if (!req.params.id) {
        list_lb_pa(req, res, callback);
    }

    var role_code = req.params.id; // role code
    //var curentUserRole = req.user.role_id.code; // login user role code
    if (role_code === 'ALL') { // for listing of all user
        listAllUser(req, res, callback);
    } else { // for specific role user
        /* if (curentUserRole == 'ADMIN') { // only admin
         //console.log()
         listUserForAdminByRole(role_code, callback);
         } else { // other users
         listUserForOtherByRole(req, role_code, callback);
         }*/
        switch (role_code) {
            case "LGN":
                listAll_LGN_User(req, res, callback);
                break;
            case "LB":
                listAll_LB_User(req, res, callback);
                break;
            case "LG":
                listAll_LG_User(req, res, callback);
                break;
            case "PA":
                listAll_PA_User(req, res, callback);
                break;
            case "ADVCC":
                listAll_ADVCC_User(req, res, callback);
                break;
        }
    }
}
module.exports.listUserByRole = listUserByRole;
/* @function : listAllUser
 *  @created  : 17072015
 *  @modified :
 *  @purpose  : list all user from the system
 */
var listAllUser = function (req, res, callback) {

    var role_code = req.params.id; // role

    userModel.find({'status': {'$ne': 'delete'}}).populate('role_id').exec(function (err, users) {
        if (err) {
            //console.log("System Error (listAllUser) : " + err);
            callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.Error});
        } else {
            if (!isEmptyObject(users)) {
                console.log('users', users);
                // use to filter the role based user
                users = users.filter(function (user) {
                    console.log('user', user);
                    if (user.role_id) {
                        return user.role_id.code !== 'ADMIN';
                    }
                });
            }

            if (isEmptyObject(users)) {
                callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.notFound});
            } else {
                callback({'code': config.constant.CODES.OK, "data": users, "message": config.constant.MESSAGES.Success});
            }
        }
    });
}
module.exports.listAllUser = listAllUser;
/* @function : listAll_LGN_User
 *  @created  : 16112015
 *  @modified :
 *  @purpose  : list all LGN user in the system
 */
var listAll_LGN_User = function (req, res, callback) {
    var role_code = req.params.id;
    userModel.find({'status': {'$ne': 'delete'}})
            .populate({path: 'role_id', match: {code: role_code}})
            .where('role_id')
            .ne(null)
            .exec(function (err, users) {
                if (err) {
                    //console.log("System Error (listUserForAdminByRole) : " + err);
                    callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.Error});
                } else {
                    // use to filter the role based user
                    users = users.filter(function (user) {
                        return user.role_id !== null;
                    });
                    if (isEmptyObject(users)) {
                        callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.notFound});
                    } else {
                        callback({'code': config.constant.CODES.OK, "data": users, "message": config.constant.MESSAGES.Success});
                    }
                }
            });
}
module.exports.listAll_LGN_User = listAll_LGN_User;
/* @function : listAll_LB_User
 *  @created  : 16112015
 *  @modified :
 *  @purpose  : list all LB user in the system
 */
var listAll_LB_User = function (req, res, callback) {
    var role_code = req.params.id;
    userModel.find({'status': {'$ne': 'delete'}}).populate({path: 'role_id', match: {code: role_code}}).populate('parent_id', 'first_name last_name').where('role_id').ne(null).exec(function (err, users) {
        if (err) {
            //console.log("System Error (listUserForAdminByRole) : " + err);
            callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.Error});
        } else {
            // use to filter the role based user
            users = users.filter(function (user) {
                return user.role_id !== null;
            });
            if (isEmptyObject(users)) {
                callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.notFound});
            } else {
                callback({'code': config.constant.CODES.OK, "data": users, "message": config.constant.MESSAGES.Success});
            }
        }
    });
}
module.exports.listAll_LB_User = listAll_LB_User;
/* @function : listAll_LG_User
 *  @created  : 16112015
 *  @modified :
 *  @purpose  : list all LG user in the system
 */
var listAll_LG_User = function (req, res, callback) {
    var role_code = req.params.id;
    userModel.find({'status': {'$ne': 'delete'}}).populate({path: 'role_id', match: {code: role_code}}).populate('parent_id', 'first_name last_name').where('role_id').ne(null).exec(function (err, users) {
        if (err) {
            //console.log("System Error (listUserForAdminByRole) : " + err);
            callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.Error});
        } else {
            // use to filter the role based user
            users = users.filter(function (user) {
                return user.role_id !== null;
            });
            if (isEmptyObject(users)) {
                callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.notFound});
            } else {
                callback({'code': config.constant.CODES.OK, "data": users, "message": config.constant.MESSAGES.Success});
            }
        }
    });
}
module.exports.listAll_LG_User = listAll_LG_User;
/* @function : listAll_LG_User
 *  @created  : 16112015
 *  @modified :
 *  @purpose  : list all PA user in the system
 */
var listAll_PA_User = function (req, res, callback) {
    var role_code = req.params.id;
    userModel.find({'status': {'$ne': 'delete'}}).populate({path: 'role_id', match: {code: role_code}}).populate('parent_id', 'first_name last_name').where('role_id').ne(null).exec(function (err, users) {
        if (err) {
            //console.log("System Error (listUserForAdminByRole) : " + err);
            callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.Error});
        } else {
            // use to filter the role based user
            users = users.filter(function (user) {
                return user.role_id !== null;
            });
            if (isEmptyObject(users)) {
                callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.notFound});
            } else {
                callback({'code': config.constant.CODES.OK, "data": users, "message": config.constant.MESSAGES.Success});
            }
        }
    });
}
module.exports.listAll_PA_User = listAll_PA_User;
/* @function : listAll_ADVCC_User
 *  @created  : 16112015
 *  @modified :
 *  @purpose  : list all ADVCC user in the system
 */
var listAll_ADVCC_User = function (req, res, callback) {
    var role_code = req.params.id;
    userModel.find({'status': {'$ne': 'delete'}}).populate({path: 'role_id', match: {code: role_code}}).populate('parent_id', 'first_name last_name').where('role_id').ne(null).exec(function (err, users) {
        if (err) {
            //console.log("System Error (listUserForAdminByRole) : " + err);
            callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.Error});
        } else {
            // use to filter the role based user
            users = users.filter(function (user) {
                return user.role_id !== null;
            });
            if (isEmptyObject(users)) {
                callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.notFound});
            } else {
                callback({'code': config.constant.CODES.OK, "data": users, "message": config.constant.MESSAGES.Success});
            }
        }
    });
}
module.exports.listAll_ADVCC_User = listAll_ADVCC_User;
/* @function : listUserForOtherByRole
 *  @created  : 22072015
 *  @modified :
 *  @purpose  : list all user to other from the system
 */

var listUserForOtherByRole = function (req, role_code, callback) {

    userModel.find({'parent_id': req.user._id, 'status': {'$ne': 'delete'}}).populate({path: 'role_id', match: {code: role_code}}).where('role_id').ne(null).exec(function (err, users) {
        if (err) {
            //console.log("System Error (listUserForOtherByRole) : " + err);
            callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.Error});
        } else {
            // use to filter the role based user
            users = users.filter(function (user) {
                return user.role_id !== null;
            });
            if (isEmptyObject(users)) {
                callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.notFound});
            } else {
                callback({'code': config.constant.CODES.OK, "data": users, "message": config.constant.MESSAGES.Success});
            }
        }
    });
}

/* @function : isValidPassword
 *  @created  : 10072015
 *  @modified :
 *  @purpose  : compare the crypt value
 */
var isValidPassword = function (user, password) {
    return bCrypt.compareSync(password, user.password);
}


/* @function : getUserProfile
 *  @created  : 16072015
 *  @modified :
 *  @purpose  : To find the user profile data of current logged user
 */
var getUserProfile = function (req, res, callback) {

    userModel.findOne({'_id': req.user._id}).exec(function (err, userdata) {
        if (err) {
            //console.log("System Error (getUserProfile) : " + err);
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
        } else {

            user_profile.findOne({'user_id': req.user._id}, {company_profile: 1}).exec(function (err, profiledata) {
                if (err) {
                    //console.log("System Error (getUserProfile) : " + err);
                    callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                } else {
                    var data = {
                        'userdata': userdata,
                        'profiledata': profiledata
                    };
                    callback({'code': config.constant.CODES.OK, "data": data, "message": config.constant.MESSAGES.Success});
                }
            });
        }
    });
}
exports.getUserProfile = getUserProfile;
/* @function : listUserByRole
 *  @created  : 15072015
 *  @modified :
 *  @purpose  : list user as per role in the system
 */

var list_lb_pa = function (req, res, callback) {

    var lb_id = req.user._id; // role

    userModel.find({'status': {'$ne': 'delete'}, 'parent_id': lb_id}).populate({path: 'role_id', match: {code: 'PA'}}).where('role_id').ne(null).exec(function (err, users) {
        if (err) {
            //console.log("System Error (listUserByRole) : " + err);
            callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.Error});
        } else {
            // use to filter the role based user
            users = users.filter(function (user) {
                return user.role_id !== null;
            });
            if (isEmptyObject(users)) {
                callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.notFound});
            } else {
                callback({'code': config.constant.CODES.OK, "data": users, "message": config.constant.MESSAGES.Success});
            }
        }
    });
}
exports.list_lb_pa = list_lb_pa;
/* @function : listPhoneNo
 *  @created  : 24072015
 *  @modified :
 *  @purpose  : To find the phones numbers
 */
var listPhoneNo = function (req, res, callback) {
    user_profile.find({'user_id': req.user._id, 'status': {'$ne': 'delete'}}).populate('phone_numbers').exec(function (err, users_profile) {
        if (err) {
            //console.log("System Error (listPhoneNo) : " + err);
            callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.Error});
        } else {

            if (isEmptyObject(users_profile)) {
                callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.notFound});
            } else {
                callback({'code': config.constant.CODES.OK, "data": users_profile[0].phone_numbers, "message": config.constant.MESSAGES.Success});
            }
        }
    });
}
exports.listPhoneNo = listPhoneNo;
/* @function :add_creditCard
 * @created  : 24082015
 * @modified :
 * @purpose  : add credit card details of user
 */
var add_creditCard = function (req, res)
{
    user_profile.findOne({'user_id': req.body.user_id}, function (err, data) {
        if (err)
        {
            //console.log(err);
            res.json({'result': config.constant.CODES.notFound})
        }
        else
        {
            if (isEmptyObject(data)) {
                new user_profile({
                    'user_id': req.body.user_id,
                    //'role_id': req.user.role_id._id, // should be for LGN role id if admin create otherwise req.use.role_id._id
                    'credit_card_details': [req.body],
                    'created': new Date(),
                    'modified': new Date()
                }).save(function (err, data) {

                    if (err)
                    {
                        //console.log(err);
                        res.json({'result': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                    }
                    else
                    {
                        res.json({'result': config.constant.CODES.OK, "message": config.constant.MESSAGES.saveSuccess})
                    }
                });
            }
            else {
                //console.log(req.body)
                user_profile.findOne({'user_id': req.body.user_id, 'credit_card_details.card_no': req.body.card_no}, function (err, checkCredit) {
                    if (isEmptyObject(checkCredit)) {
                        data.credit_card_details.push(req.body);
                        data.save(function (err) {
                            if (err)
                            {
                                //console.log(err)
                                res.json({'result': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                            }
                            else
                            {
                                res.json({'result': config.constant.CODES.OK, "message": config.constant.MESSAGES.updateSuccess});
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
/* @function : get_cardDetails
 *  @created  : 25082015
 *  @modified :
 *  @purpose  : To find the user credit card data of current logged user
 */
var get_cardDetails = function (req, res, callback) {

    user_profile.findOne({'user_id': req.params.userid}, {credit_card_details: 1}).exec(function (err, carddata) {
        if (err) {
            //console.log("System Error (carddata) : " + err);
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
        } else {
            callback({'code': config.constant.CODES.OK, "data": carddata, "message": config.constant.MESSAGES.Success});
        }
    });
}
exports.get_cardDetails = get_cardDetails;
/* @function :add_rechargeData
 * @created  : 08092015
 * @modified :
 * @purpose  : add auto recharge details of user
 */
var add_rechargeData = function (req, res)
{
    user_profile.findOne({'user_id': req.body.user_id}, function (err, data) {
        if (err)
        {
            //console.log(err);
            res.json({'result': config.constant.CODES.notFound})
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
                    'user_id': req.body.user_id,
                    //'role_id': req.user.role_id._id, // should be for LGN role id if admin create otherwise req.use.role_id._id
                    'auto_recharge_details': insertData,
                    'created': new Date(),
                    'modified': new Date()
                }).save(function (err, data) {

                    if (err)
                    {
                        //console.log(err);
                        res.json({'result': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                    }
                    else
                    {
                        res.json({'result': config.constant.CODES.OK, "message": config.constant.MESSAGES.saveSuccess})
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
                        res.json({'result': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                    }
                    else
                    {
                        res.json({'result': config.constant.CODES.OK, "message": config.constant.MESSAGES.updateSuccess});
                    }
                });
            }
        }
    })

}

exports.add_rechargeData = add_rechargeData;
/* @function : get_autorecharge
 *  @created  : 08092015
 *  @modified :
 *  @purpose  : To find the user credit card data of current logged user
 */
var get_autorecharge = function (req, res, callback) {

    user_profile.findOne({'user_id': req.params.userid}, {auto_recharge_details: 1, credit_card_details: 1, echeckInfo: 1}).exec(function (err, rechargedata) {
        if (err) {
            //console.log("System Error (rechargedata) : " + err);
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
        } else {
            callback({'code': config.constant.CODES.OK, "data": rechargedata, "message": config.constant.MESSAGES.Success});
        }
    });
}
exports.get_autorecharge = get_autorecharge;
/* @function : get_contactInfo
 *  @created  : 25082015
 *  @modified :
 *  @purpose  : To find the user contact info data of current logged user
 */
var get_contactInfo = function (req, res, callback) {

    userModel.findOne({'_id': req.params.userid}, {first_name: 1, last_name: 1, email: 1, addressLine1: 1, addressLine2: 1, phone_no: 1, city: 1, state: 1, zip: 1, country: 1, company_name: 1}).exec(function (err, contactData) {
        if (err) {
            //console.log("System Error (contactData) : " + err);
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
        } else {
            callback({'code': config.constant.CODES.OK, "data": contactData, "message": config.constant.MESSAGES.Success});
        }
    });
}
exports.get_contactInfo = get_contactInfo;
/* @function : populate_bankDetails
 *  @created  : 25072015
 *  @modified :
 *  @purpose  : populate bank details from routing no.
 */
var populate_bankDetails = function (req, res, callback) {
    routingDB.findOne({'routing_no': req.params.routingno}).exec(function (err, Bankdetails) {
        if (err) {
            //console.log("System Error (populate_bankDetails) : " + err);
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
        } else {
            if (isEmptyObject(Bankdetails)) {
                callback({'code': config.constant.CODES.notFound, "data": Bankdetails, "message": config.constant.MESSAGES.notFound});
            } else {
                callback({'code': config.constant.CODES.OK, "data": Bankdetails, "message": config.constant.MESSAGES.Success});
            }
        }
    });
}
exports.populate_bankDetails = populate_bankDetails;
/* @function :add_echeckInfo
 * @created  : 25082015
 * @modified :
 * @purpose  : add credit card details of user
 */
var add_echeckInfo = function (req, res)
{
    user_profile.findOne({'user_id': req.body.user_id}, function (err, data) {
        if (err)
        {
            console.log(err);
            res.json({'result': config.constant.CODES.notFound})
        }
        else
        {
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
                    'user_id': req.body.user_id,
                    //'role_id': req.user.role_id._id, // should be for LGN role id if admin create otherwise req.use.role_id._id
                    'echeckInfo': insertdata,
                    'created': new Date(),
                    'modified': new Date()
                }).save(function (err, data) {

                    if (err)
                    {
                        console.log(err);
                        res.json({'result': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                    }
                    else
                    {
                        res.json({'result': config.constant.CODES.OK, "message": config.constant.MESSAGES.saveSuccess})
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
                        console.log(err)
                        res.json({'result': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                    }
                    else
                    {
                        res.json({'result': config.constant.CODES.OK, "message": config.constant.MESSAGES.updateSuccess});
                    }
                });
            }

        }
    })

}

exports.add_echeckInfo = add_echeckInfo;
/* @function :userContractUpload
 * @created  : 25082015
 * @modified :
 * @purpose  : uploads and saves users contract file
 */
exports.userContractUpload = function (req, next) {

    var form = new formidable.IncomingForm();
    form.uploadDir = "./public/assets/images/contracts"; //set upload directory
    form.keepExtensions = true; //keep file extension
    form.parse(req, function (err, fields, files)
    {
        var user_id = fields.existing_user_id;
        var item = {file_name: files.file.name, path: files.file.path}
        user_profile.findOne({'user_id': user_id}, function (err, data) {
            if (err)
            {
                //console.log(err);
                next({'result': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
            }
            else
            {
                if (isEmptyObject(data)) {

                    new user_profile({
                        'user_id': user_id,
                        //'role_id': req.user.role_id._id || null, // should be for LGN role id if admin create otherwise req.use.role_id._id
                        'contracts': [item],
                        'created': new Date(),
                        'modified': new Date()
                    }).save(function (err, data) {

                        if (err)
                        {
                            //console.log(err);
                            next({'result': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                        }
                        else
                        {
                            user_profile.findOne({'user_id': user_id}, function (err, data) {
                                if (err)
                                {
                                    //console.log(err);
                                    next({'result': config.constant.CODES.notFound})
                                }
                                else
                                    next({'result': config.constant.CODES.OK, "data": data, "message": config.constant.MESSAGES.uploadSuccess})
                            });
                        }
                    });
                }
                else {
                    user_profile.update({'user_id': user_id}, {$push: {contracts: item}}, function (err, data) {
                        if (err)
                        {
                            //console.log(err);
                            next({'result': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                        }
                        else {
                            user_profile.findOne({'user_id': user_id}, function (err, data) {
                                if (err)
                                {
                                    //console.log(err);
                                    next({'result': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                                }
                                else
                                    next({'result': config.constant.CODES.OK, "data": data, "message": config.constant.MESSAGES.uploadSuccess})
                            });
                        }
                    });
                }

            }
        })

    });
};
/* @function : deleteContracts
 *  @created  : 01092015
 *  @modified :
 *  @purpose  : To find the user company set up data of current logged user
 */
var deleteContracts = function (req, callback) {

    var filepath = req.body.filepath;
    user_profile.update({'user_id': req.body.user_ids}, {$pull: {contracts: {_id: req.body.contract_id}}}, function (err) {
        if (err) {
            //console.log("System Error (deleteUser) : " + err);
            callback({'result': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
        } else {
            user_profile.findOne({'user_id': req.body.user_ids}, function (err, data) {
                if (err)
                {
                    //console.log(err);
                    callback({'result': config.constant.CODES.notFound})
                }
                else {

                    fs.unlink(filepath, function (err) {
                        //console.log('File deleted');

                    });
                    callback({'result': config.constant.CODES.OK, "data": data, "message": config.constant.MESSAGES.deleteSuccess})
                }
            });
        }
    });
}
exports.deleteContracts = deleteContracts;
/* @function : get_loginCredentials
 *  @created  : 28082015
 *  @modified :
 *  @purpose  : To find the user login data of current logged user
 */
var get_loginCredentials = function (req, res, callback) {

    userModel.findOne({'_id': req.params.userid}, {email: 1, password: 1}).exec(function (err, loginData) {
        if (err) {
            //console.log("System Error (loginData) : " + err);
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
        } else {
            callback({'code': config.constant.CODES.OK, "data": loginData, "message": config.constant.MESSAGES.Success});
        }
    });
}
exports.get_loginCredentials = get_loginCredentials;
/* @function : get_echeckInfo
 *  @created  : 28082015
 *  @modified :
 *  @purpose  : To find the user echeck data of current logged user
 */
var get_echeckInfo = function (req, res, callback) {

    user_profile.findOne({'user_id': req.params.userid}, {echeckInfo: 1}).exec(function (err, echeckData) {
        if (err) {
            //console.log("System Error (echeckData) : " + err);
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
        } else {
            callback({'code': config.constant.CODES.OK, "data": echeckData, "message": "User data found succesfully"});
        }
    });
}
exports.get_echeckInfo = get_echeckInfo;
/* @function : get_supports
 *  @created  : 28082015
 *  @modified :
 *  @purpose  : To find the user login data of current logged user
 */
var get_supports = function (req, res, callback) {

    user_profile.findOne({'user_id': req.params.userid}, {It_supportSettings: 1}).exec(function (err, supportData) {
        if (err) {
            //console.log("System Error (supportData) : " + err);
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
        } else {
            callback({'code': config.constant.CODES.OK, "data": supportData, "message": "User data found succesfully"});
        }
    });
}
exports.get_supports = get_supports;
/* @function : getOutboundSupport
 *  @created  : 28082015
 *  @modified :
 *  @purpose  : To find the Outbound Support data of current logged user
 */
var getOutboundSupport = function (req, res, callback) {

    userModel.findOne({'_id': req.params.userid}, {outbound_support: 1}).exec(function (err, supportData) {
        if (err) {
            //console.log("System Error (supportData) : " + err);
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
        } else {
            callback({'code': config.constant.CODES.OK, "data": supportData, "message": "User data found succesfully"});
        }
    });
}
exports.getOutboundSupport = getOutboundSupport;
/* @function : get_lgnsetup
 *  @created  : 28082015
 *  @modified :
 *  @purpose  : To find the user company set up data of current logged user
 */
var get_lgnsetup = function (req, res, callback) {

    user_profile.findOne({'user_id': req.params.userid}, {lgn_setup_details: 1}).exec(function (err, setupData) {
        if (err) {
            //console.log("System Error (setupData) : " + err);
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
        } else {
            callback({'code': config.constant.CODES.OK, "data": setupData, "message": "User data found succesfully"});
        }
    });
}
exports.get_lgnsetup = get_lgnsetup;
/* @function : get_contracts
 *  @created  : 01092015
 *  @modified :
 *  @purpose  : To find the user company set up data of current logged user
 */
var get_contracts = function (req, res, callback) {
    user_profile.findOne({'user_id': req.params.userid}, {contracts: 1}).exec(function (err, setupData) {
        if (err) {
            //console.log("System Error (setupData) : " + err);
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
        } else {
            callback({'code': config.constant.CODES.OK, "data": setupData, "message": "Contracts found successfully"});
        }
    });
}
exports.get_contracts = get_contracts;
/* @function : registerLgn
 *  @created  : 28082015
 *  @modified :
 *  @purpose  : Register LGN User
 */
var registerLgn = function (req, res) {

    var userToken = randtoken.generate(50);

    // find a user whose email is the same as the forms email
    // we are checking to see if the user trying to login already exists
    userModel.findOne({'email': req.body.email, parent_id: req.body.parent_id}, function (err, user) {
        // if there are any errors, return the error
        if (err) {
            //console.log("System Error (register) : " + err);
            res.json({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
        }


        // check to see if theres already a user with that email
        if (user) {
            res.json({'code': config.constant.CODES.notFound, "message": "Email already exist"});
        } else {
            // if there is no user with that email
            // create the user
            var newUser = new userModel();
            // set the user's local credentials
            newUser.role_id = req.body.role_id;
            newUser.parent_id = req.body.parent_id || null;
            newUser.email = req.body.email;
            newUser.password = createHash(req.body.password);
            newUser.first_name = req.body.first_name;
            newUser.last_name = req.body.last_name;
            //newUser.extension = req.body.extension ? req.body.extension : '';
            newUser.phone_no = req.body.phone_no ? req.body.phone_no : '';
            newUser.webApi_token = userToken;
            // save the user
            newUser.save(function (err, saveddata) {
                if (err) {
                    if (err.code == '11000')
                        res.json({'code': config.constant.CODES.notFound, "message": "Email already exist", errMsg: err});
                    else
                        res.json({'code': config.constant.CODES.notFound, "message": "Error!"});
                }

                mails.registrationToCustomEmail(req, res, function (data) {
                    res.json({'code': config.constant.CODES.OK, 'data': saveddata, "message": "You have been register successfully, Please check you mail and activate your account."});
                })

            });
        }

    });
}
exports.registerLgn = registerLgn;
/* @function :add_supportData
 * @created  : 24082015
 * @modified :
 * @purpose  : add credit card details of user
 */
var add_supportData = function (req, res)
{
    console.log(req.body);
    user_profile.findOne({user_id: req.body.user_id}, function (err, data) {
        if (err)
        {
            //console.log(err);
            console.log('here');
            res.json({'result': config.constant.CODES.notFound})
        }
        else
        {
            //console.log(data);
            if (isEmptyObject(data)) {
                new user_profile({
                    'user_id': req.body.user_id,
                    'role_id': req.user.role_id._id, // should be for LGN role id if admin create otherwise req.use.role_id._id
                    'It_supportSettings': req.body,
                    'created': new Date(),
                    'modified': new Date()
                }).save(function (err, data) {

                    if (err)
                    {
                        //console.log(err);
                        console.log('here1');
                        res.json({'result': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                    }
                    else
                    {
                        res.json({'result': config.constant.CODES.OK, "message": config.constant.MESSAGES.saveSuccess})
                    }
                });
            }
            else {
                user_profile.update({_id: data._id}, {$set: {
                        'It_supportSettings': req.body,
                        'modified': new Date()
                    }}, function (err, data) {
                    if (err)
                    {
                        //console.log(err)
                        console.log('here2');
                        res.json({'result': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                    }
                    else
                    {
                        res.json({'result': config.constant.CODES.OK, "message": config.constant.MESSAGES.updateSuccess});
                    }
                });
            }
        }
    })

}
exports.add_supportData = add_supportData;


/* @function :add_outboundSupport
 * @created  : 25012016
 * @modified :
 * @purpose  : add outbound support data of user
 */
var add_outboundSupport = function (req, res) {
    userModel.update({'_id': req.body.user_id}, {$set: {
            'outbound_support': req.body.outbound_support,
            'modified': new Date()
        }}, function (err, data) {
        if (err)
        {
            //console.log(err)
            res.json({'result': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
        }
        else
        {
            res.json({'result': config.constant.CODES.OK, "message": config.constant.MESSAGES.updateSuccess});
        }
    });
}


exports.add_outboundSupport = add_outboundSupport;
/* @function : makeCard_primary
 *  @created  : 07092015
 *  @modified :
 *  @purpose  : make credit card primary
 */
var makeCard_primary = function (req, res) {

    user_profile.findOne({'user_id': req.body.user_id}, function (err, numAffected) {
        if (err) {
            //console.log(err)
            res.json({'result': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
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
                    user_profile.update({'user_id': req.body.user_id, 'credit_card_details._id': req.body._id},
                    {$set: {"credit_card_details.$": partialUpdate}},
                    function (err, numAffected) {
                        if (err) {
                            //console.log(err)
                            res.json({'result': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                        } else {
                            res.json({'result': config.constant.CODES.OK, "message": "status changed to primary."})
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

    user_profile.update({'user_id': req.body.user_id}, {$pull: {credit_card_details: {_id: req.body.card_id}}}, function (err) {
        if (err) {
            //console.log("System Error (deleteUser) : " + err);
            res.json({'result': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
        } else {
            res.json({'result': config.constant.CODES.OK, "message": config.constant.MESSAGES.deleteSuccess})
        }
    });
}
exports.remove_card = remove_card;
/* @function : get_Lbsettings
 *  @created  : 09092015
 *  @modified :
 *  @purpose  : To find the data (media agency,call payments, automated marketing,call recording, registration approval tabs)of current logged user
 */
var get_Lbsettings = function (req, res, callback) {

    user_profile.findOne({'user_id': req.params.userid}, {lb_settings: 1}).exec(function (err, rechargedata) {
        if (err) {
            //console.log("System Error (rechargedata) : " + err);
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
        } else {
            callback({'code': config.constant.CODES.OK, "data": rechargedata, "message": config.constant.MESSAGES.Success});
        }
    });
}
exports.get_Lbsettings = get_Lbsettings;
/* @function :save_lbsettings
 * @created  : 09092015
 * @modified :
 * @purpose  : add auto recharge details of user
 */
var save_lbsettings = function (req, res)
{
    user_profile.findOne({'user_id': req.body.user_id}, function (err, data) {
        if (err)
        {
            //console.log(err);
            res.json({'result': config.constant.CODES.notFound})
        }
        else
        {
            if (isEmptyObject(data)) {
                new user_profile({
                    'user_id': req.body.user_id,
                    'role_id': req.user.role_id._id, // should be for LGN role id if admin create otherwise req.use.role_id._id
                    'lb_settings': req.body,
                    'created': new Date(),
                    'modified': new Date()
                }).save(function (err, data) {

                    if (err)
                    {
                        //console.log(err);
                        res.json({'result': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                    }
                    else
                    {
                        res.json({'result': config.constant.CODES.OK, "message": config.constant.MESSAGES.saveSuccess})
                    }
                });
            }
            else {
                user_profile.update({_id: data._id}, {$set: {
                        'lb_settings': req.body,
                        'modified': new Date()
                    }}, function (err, data) {
                    if (err)
                    {
                        //console.log(err)
                        res.json({'result': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                    }
                    else
                    {
                        res.json({'result': config.constant.CODES.OK, "message": config.constant.MESSAGES.updateSuccess});
                    }
                });
            }
        }
    })

}

exports.save_lbsettings = save_lbsettings;
/* @function : getCallerDetail
 *  @created  : 09092015
 *  @modified :
 *  @purpose  : getCallerDetail
 */
var callModel = require('../models/callHistories');
var areaCodeModel = require('../models/areaCodes');
var zipcode = require('../models/zipcode');
var ringNumbers = require('../models/ringToNumber');
var getCallerDetail = function (req, res, callback) {
    console.log(req.body);

    var areacode = parseInt(req.body.phone_no.substring(1, 4));
//    zipcode.findOne({'AreaCode': areacode}, function (err, foundData) {
//        if (err)
//            //console.log(err);
//        else {
//            if (foundData) {
    ringNumbers.findOne({'phone_no': req.body.phone_no})
            .populate('created_by')
            .populate('zipcode')
            .exec(function (err, foundData) {
                if (err) {
                    console.log(err);
                }
                else {
                    if (foundData == null) {
                        zip.findOne({'AreaCode': req.body.areacode}, function (err, data) {
                            if (err) {
                                console.log(err);
                            }
                            else {

                                res.jsonp({code: config.constant.CODES.OK, message: config.constant.MESSAGES.notFound, latitude: data.Latitude, longitude: data.Longitude});
                            }
                        });


                    }
                    else if (foundData) {

                        user_profile.findOne({$or: [{'campaigns.ringToNumbers.local': foundData._id}, {'campaigns.ringToNumbers.tollfree': foundData._id}, {'campaigns.ringToNumbers.vanity': foundData._id}]}, {'campaigns': 1})
                                .populate('campaigns.offer_id')
                                .exec(function (err, udata) {
                                    if (err) {
                                        //console.log(err);
                                    } else {
                                        //console.log(udata);
                                        if (udata) {
                                            callback({code: config.constant.CODES.OK, userData: req.user, zipcodeData: foundData, campaignData: udata});
                                        } else {
                                            callback({code: config.constant.CODES.OK, message: config.constant.MESSAGES.notFound, userData: '', zipcodeData: foundData, mapData: areacode});
                                        }
                                    }
                                });
                    } else {
                        callback({code: config.constant.CODES.notFound, message: config.constant.MESSAGES.notFound});
                    }
                }

            });
//            } else {
//                callback({code: config.constant.CODES.notFound, data: foundData});
//            }
//        }
//
//    });

}
exports.getCallerDetail = getCallerDetail;
var zipCodeDetail = function (req, res, callback) {

    zipcode.findOne({'_id': req.body.id}, function (err, foundData) {
        if (err) {
            //console.log(err);
            callback({code: config.constant.CODES.notFound, data: err});
        }
        else {
            if (foundData) {
                callback({code: config.constant.CODES.OK, data: foundData});
            } else {
                callback({code: config.constant.CODES.notFound, data: foundData});
            }
        }

    });
}
exports.zipCodeDetail = zipCodeDetail;
/* @function :submit_onboardingLB
 * @created  : 10092015
 * @modified :
 * @purpose  : submit registration method of user & onboard LB
 */
var submit_onboardingLB = function (req, res)
{
    userModel.findOne({'_id': req.body.user_id}, function (err, data) {
        if (err)
        {
            //console.log(err);
            res.json({'result': config.constant.CODES.notFound})
        }
        else
        {
            var insertData = {
                'registration_approval': req.body.registration_approval ? req.body.registration_approval : 'automatic',
                'onboarded': true
            };
            if (isEmptyObject(data)) {
                res.json({'result': config.constant.CODES.notFound, "message": "Error:occurs while onboarding user.Please go to previous tab & try again."})
            }
            else {
                userModel.update({_id: data._id}, {$set: insertData}, function (err, data) {
                    if (err)
                    {
                        //console.log(err)
                        res.json({'result': config.constant.CODES.notFound, "message": "Error:occurs while onboarding user.Please go to previous tab & try again."})
                    }
                    else
                    {
                        res.json({'result': config.constant.CODES.OK, "message": "User Onboarded sucessfully"});
                    }
                });
            }
        }
    })

}

exports.submit_onboardingLB = submit_onboardingLB;
/* @function : get_phoneAgentInfo
 *  @created  : 19102015
 *  @modified :
 *  @purpose  : To find the data (phone agent tabs data)
 */
var get_phoneAgentInfo = function (req, res, callback) {

    userModel.findOne({'_id': req.params.userid}, {phone_agent: 1}).exec(function (err, approvalData) {
        if (err) {
            //console.log("System Error (approvalData) : " + err);
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
        } else {
            callback({'code': config.constant.CODES.OK, "data": approvalData, "message": "Phone agent data found successfully"});
        }
    });
}
exports.get_phoneAgentInfo = get_phoneAgentInfo;
/* @function : save_phoneAgentInfo
 *  @created  : 19102015
 *  @modified :
 *  @purpose  : To save the data (phone agent tabs data)
 */
var save_phoneAgentInfo = function (req, res, callback) {
    if (req.body.phone_agent == 'LB') {
        userModel.update({'_id': req.body.id}, {$set: {phone_agent: req.body.phone_agent, role_id: '559a6a3423405677c3d2d439'}}, {upsert: true}).exec(function (err, approvalData) {
            if (err) {
                //console.log("System Error (approvalData) : " + err);
                callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
            } else {
                callback({'code': config.constant.CODES.OK, "data": approvalData, "message": config.constant.MESSAGES.saveSuccess});
            }
        });
    } else {
        userModel.update({_id: req.body.id}, {$set: {phone_agent: req.body.phone_agent, role_id: '55de08dacbb875f85be7ddf3'}}, {upsert: true}, function (err, data) {
            if (err)
            {
                //console.log(err)
                res.json({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
            }
            else
            {
                res.json({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.saveSuccess});
            }
        });
    }
}
exports.save_phoneAgentInfo = save_phoneAgentInfo;
/* @function : get_RegApproval
 *  @created  : 10092015
 *  @modified :
 *  @purpose  : To find the data (registration approval tabs)
 */
var get_RegApproval = function (req, res, callback) {

    userModel.findOne({'_id': req.params.userid}, {registration_approval: 1}).exec(function (err, approvalData) {
        if (err) {
            //console.log("System Error (approvalData) : " + err);
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
        } else {
            if (approvalData.registration_approval == 'automatic') {
                approvalData.registration_approval = 0;
            } else {
                approvalData.registration_approval = 1;
            }
            callback({'code': config.constant.CODES.OK, "data": approvalData, "message": config.constant.MESSAGES.Success});
        }
    });
}
exports.get_RegApproval = get_RegApproval;
/* @function : get_CRMOptions
 *  @created  : 11092015
 *  @modified :
 *  @purpose  : To find the data (CRM Options tabs)
 */
var get_CRMOptions = function (req, res, callback) {
    user_profile.findOne({'user_id': req.params.userid}, {crm_options: 1}).exec(function (err, crmData) {
        if (err) {
            //console.log("System Error (crmData) : " + err);
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
        } else {
            callback({'code': config.constant.CODES.OK, "data": crmData, "message": config.constant.MESSAGES.Success});
        }
    });
}
exports.get_CRMOptions = get_CRMOptions;
/* @function : generate_html
 *  @created  : 11092015
 *  @modified :
 *  @purpose  : To find the data (CRM Options tabs)
 */
var generate_html = function (req, res, callback) {

    userModel.findOne({'_id': req.params.userid}, {uid: 1}).exec(function (err, userdata) {
        if (err) {
            //console.log("System Error (generateHTML) : " + err);
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
        } else {
            callback({'code': config.constant.CODES.OK, "data": userdata, "message": config.constant.MESSAGES.Success});
        }
    });
}
exports.generate_html = generate_html;
/* @function :SaveCRMInfo
 * @created  : 25082015
 * @modified :
 * @purpose  : add credit card details of user
 */
var SaveCRMInfo = function (req, res)
{

    user_profile.findOne({'user_id': req.body.user_id}, function (err, data) {
        if (err)
        {
            //console.log(err);
            res.json({'result': config.constant.CODES.notFound})
        }
        else
        {
            if (isEmptyObject(data)) {
                new user_profile({
                    'user_id': req.body.user_id,
                    'role_id': req.user.role_id._id, // should be for LGN role id if admin create otherwise req.use.role_id._id
                    'crm_options': req.body.crm_options,
                    'created': new Date(),
                    'modified': new Date()
                }).save(function (err, data) {

                    if (err)
                    {
                        //console.log(err);
                        res.json({'result': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                    }
                    else
                    {
                        res.json({'result': config.constant.CODES.OK, "message": config.constant.MESSAGES.saveSuccess})
                    }
                });
            }
            else {
                user_profile.update({_id: data._id}, {$set: {
                        'crm_options': req.body.crm_options,
                        'modified': new Date()
                    }}, function (err, data) {
                    if (err)
                    {
                        //console.log(err)
                        res.json({'result': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                    }
                    else
                    {
                        res.json({'result': config.constant.CODES.OK, "message": config.constant.MESSAGES.updateSuccess});
                    }
                });
            }

        }
    })

}

exports.SaveCRMInfo = SaveCRMInfo;
/* @function : saveUserInfo
 *  @created  : 12102015
 *  @modified :
 *  @purpose  :To save user data
 */
var saveUserInfo = function (req, res, callback) {
    var userid = req.body._id;
    delete req.body._id;
    userModel.update({_id: userid}, {$set: req.body}, function (err, data) {
        if (err)
        {
            //console.log(err)
            res.json({'result': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
        }
        else
        {
            //console.log(data)
            res.json({'result': config.constant.CODES.OK, "message": config.constant.MESSAGES.updateSuccess});
        }
    });
}
exports.saveUserInfo = saveUserInfo;
/* @function :forgotpassword
 * @created  : 13102015
 * @modified :
 * @purpose  : send the reset password link to user
 */

var forgotpassword = function (req, res) {
    var Email = req.body.user_email;
    userModel.findOne({email: Email, status: 'active'}, function (err, userData) {
        if (err)
        {
            //console.log(err);
            res.json({code: '500', 'error': err});
        } else
        {

            if (!userData) {
                res.json({'code': 401, 'message': "This email is not exist!"});
            }
            else {
                mails.reset_passwordEmail(req, res, function (data) {
                    res.json({'code': config.constant.CODES.OK, "message": "Password reset link has been sent to your email.Please check your email for instructions."});
                })
            }
        }

    })
}

exports.forgotpassword = forgotpassword;
/* @function :reset_password
 * @created  : 13102015
 * @modified :
 * @purpose  : create user new password from the reset link
 */

var reset_password = function (req, res) {

    userModel.findOne({password_reset_token: req.body.token}, function (err, data) {
        if (err) {
            //console.log(err);
        }
        else {

            if (isEmptyObject(data)) {
                res.json({'code': config.constant.CODES.notFound, 'message': 'Your token seems to be expired please generate again from forgot password section'});
                //console.log("Your token seems to be expired, Please generate again from forgot password section");
            } else {
                var new_password = createHash(req.body.password);
                userModel.update({_id: data._id}, {$set: {password: new_password, password_reset_token: ''}}, {upsert: false}, function (err, updateddata) {

                    if (err) {
                        //console.log(err);
                    } else {
                        res.json({'code': config.constant.CODES.OK, 'message': config.constant.MESSAGES.updateSuccess});
                    }
                })
            }

        }
    })
}
exports.reset_password = reset_password;
/* @function : GetUserforDropdown
 *  @created  : 14102015
 *  @modified :
 *  @purpose  : list user as per role in the system
 */
var GetUserforDropdown = function (req, res, callback) {
    var role_code = req.params.id; // role code
    console.log(role_code)
    listUserByRoleDD(req, role_code, callback);
}
module.exports.GetUserforDropdown = GetUserforDropdown;
/* @function : listUserForOtherByRole
 *  @created  : 14102015
 *  @modified :
 *  @purpose  : list all user to other from the system for drop own list
 */

var listUserByRoleDD = function (req, role_code, callback) {
    var cond = (role_code == 'LB') ? {'parent_id': req.user._id, 'status': {'$ne': 'delete'}} : {'status': {'$ne': 'delete'}};
    var role_cond = (role_code == 'LB') ? {'$in': ['LB', 'ADVCC']} : {'$in': ['LGN']};
    userModel.find(cond, {'first_name': 1, 'last_name': 1, 'role_id': 1}).populate({path: 'role_id', match: {code: role_cond}}).where('role_id').ne(null).exec(function (err, users) {
        if (err) {
            //console.log("System Error (listUserForOtherByRole) : " + err);
            callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.Error});
        } else {
            // use to filter the role based user
            users = users.filter(function (user) {
                return user.role_id !== null;
            });
            if (isEmptyObject(users)) {
                callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.notFound});
            } else {
                callback({'code': config.constant.CODES.OK, "data": users, "message": config.constant.MESSAGES.Success});
            }
        }
    });
}

/* @function : get_webphoneDetails
 *  @created  : 23102015
 *  @modified :
 *  @purpose  : To get plivo details
 */
var get_webphoneDetails = function (req, res, callback) {

    userModel.findOne({'_id': req.params.id}, {webphone_details: 1}).exec(function (err, userdata) {
        if (err) {
            //console.log("System Error (getUserProfile) : " + err);
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
        } else {
            callback({'code': config.constant.CODES.OK, "data": userdata, "message": config.constant.MESSAGES.Success});
        }
    });
}
exports.get_webphoneDetails = get_webphoneDetails;
/* @function : save_webphoneDetails
 *  @created  : 23102015
 *  @modified :
 *  @purpose  : To save plivo details
 */
var save_webphoneDetails = function (req, res, callback) {
    var plivoBaseUrl = req.protocol + '://' + req.get('host');

    userModel.findOne({'_id': req.body.user_id}, function (err, data) {
        if (err) {
            //console.log(err);
            res.json({'result': config.constant.CODES.notFound});
        } else {
            if ((req.body.webphoneDetails.provider == 'plivo') && (isEmptyObject(data) || (data && data.webphone_details && data.webphone_details.username != req.body.webphoneDetails.username) || (data && data.webphone_details && !data.webphone_details.app_id))) {
                var tempPlivoApi = plivo.RestAPI({
                    authId: req.body.webphoneDetails.username, //Client from constant file
                    authToken: req.body.webphoneDetails.password  //Client
                });
                var params = {
                    'app_name': 'psx-' + Date.now(),
                    'answer_url': plivoBaseUrl + '/phoneAgent/answer_url2/?DialMusic=real&CLID=14154847489',
                    'hangup_url': plivoBaseUrl + '/phoneAgent/hangup_url',
                    'message_url': plivoBaseUrl + '/api_contact/message_reply_url'
                }

                tempPlivoApi.create_application(params, function (status, response) {
                    if (status >= 200 && status < 300) {
                        req.body.webphoneDetails['app_id'] = response.app_id;
                        saveUserOnWebphoneChange(req, res, data, function (resp) {
                            res.json(resp);
                        });
                    } else {
                        //console.log({'Status:': status, 'Response:': response});
                        res.json({
                            'result': config.constant.CODES.Error,
                            "message": 'Invalid Credentials Or Please check the plivo Account', //config.constant.MESSAGES.Error,
                            'plivoStatus': status,
                            'plivoResponse': response
                        });
                    }
                });
            } else if ((req.body.webphoneDetails.provider == 'twilio') && (isEmptyObject(data) || (data && data.webphone_details && data.webphone_details.username != req.body.webphoneDetails.username))) {

                var accountSid = req.body.webphoneDetails.username;
                var authToken = req.body.webphoneDetails.password;
                var twilioApi = new twilio(accountSid, authToken);

                twilioApi.applications.create({
                    friendlyName: 'psx-' + Date.now(),
                    voiceUrl: plivoBaseUrl + '/phoneAgent/tw/ansUrl',
                    voiceMethod: "POST",
                    smsUrl: plivoBaseUrl + '/api_contact/message_reply_url',
                    smsMethod: "POST",
                    StatusCallback: plivoBaseUrl + '/phoneAgent/tw/hangup_url',
                    StatusCallbackMethod: "POST"
                            //VoiceFallbackUrl: plivoBaseUrl + '/phoneAgent/hangup_url',
                            //VoiceFallbackMethod: "POST"
                }, function (err, app) {
                    console.log({'tw err:': err, 'tw app:': app});
                    //if (status >= 200 && status < 300) {
                    if (err) {
                        res.json({
                            'result': config.constant.CODES.Error,
                            "message": 'Invalid Credentials Or Please check the plivo Account', //config.constant.MESSAGES.Error,
                            'twilioErr': err,
                            'twilioResponse': app
                        });
                    } else {
                        req.body.webphoneDetails['app_id'] = app.sid;
                        saveUserOnWebphoneChange(req, res, data, function (resp) {
                            res.json(resp);
                        });
                    }
                });
            } else {
                saveUserOnWebphoneChange(req, res, data, function (resp) {
                    res.json(resp);
                });
            }
        }
    })
}
exports.save_webphoneDetails = save_webphoneDetails;


var saveUserOnWebphoneChange = function (req, res, data, next) {
    if (isEmptyObject(data)) {
        new userModel({
            'user_id': req.body.user_id,
            'role_id': req.user.role_id._id, // should be for LGN role id if admin create otherwise req.use.role_id._id
            'webphone_details': req.body.webphoneDetails,
            'created': new Date(),
            'modified': new Date()
        }).save(function (err, userData) {
            if (err) {
                //console.log(err);
                next({'result': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
            } else {
                next({'result': config.constant.CODES.OK, "message": config.constant.MESSAGES.saveSuccess})
            }
        });
    } else {
        userModel.update({_id: data._id}, {$set: {
                'webphone_details': req.body.webphoneDetails,
                'modified': new Date()
            }}, function (err, userData) {
            if (err) {
                //console.log(err);
                next({'result': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
            } else {
                next({'result': config.constant.CODES.OK, "message": config.constant.MESSAGES.updateSuccess});
            }
        });
    }
}


// Generates hashed value for password using bCrypt
var createHash = function (password) {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

/* @function : findLGUser
 *  @created  : 23102015
 *  @modified :
 *  @purpose  : get the user from the system
 */
var findLGByIDUser = function (req, res, callback) {
    var user_id = req.body.id;
    var lgDetails = [];
    var countLGArray = _.countBy(user_id, _.identity);
    userModel.find({'_id': {'$in': user_id}}, {_id: 1, first_name: 1, last_name: 1, token: 1}).exec(function (err, users) {
        if (err) {
            //console.log("System Error (findUser) : " + err);
            callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.Error});
        } else {
            if (isEmptyObject(users)) {
                callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.notFound});
            } else {
                var newData = _.forEach(users, function (user) {
                    return user.token = countLGArray[user._id];
                });
                callback({'code': config.constant.CODES.OK, "data": newData, "message": config.constant.MESSAGES.Success});
            }
        }
    });
}
module.exports.findLGByIDUser = findLGByIDUser;


/* @function : listPAForCallRouting
 *  @created  : 23102015
 *  @modified :
 *  @purpose  : get list of all PA's of respective LGN or ADVCC
 */
var listPAForCallRouting = function (req, res, callback) {
    userModel.find({'parent_id': req.user._id, 'status': {$ne: 'delete'}}, {_id: 1, first_name: 1, last_name: 1, token: 1}).populate({path: 'role_id', match: {code: 'PA'}}).exec(function (err, users) {
        if (err) {
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
module.exports.listPAForCallRouting = listPAForCallRouting;
/* @function : setNextPaymentDate
 *  @created  : 05112015
 *  @modified :
 *  @purpose  : set next payment date for respective user LB/ADVCC
 */
var setNextPaymentDate = function (req, res, callback) {

    user_profile.findOne({'user_id': req.user._id}, {lb_settings: 1}).exec(function (err, lbdata) {
        if (err) {
            callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.Error});
        } else {
            //console.log(lbdata.lb_settings.pay_for_calls)
            if (isEmptyObject(lbdata)) {
                callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.notFound});
            } else {
                var date;
                switch (lbdata.lb_settings.pay_for_calls) {
                    case 'weekly':
                        date = moment().day(8);
                        //console.log(date, 'asdfasdf')
                        break;
                    case 'biweekly':
                        date = moment().day(15);
                        //console.log(date, 'asdfasdf')
                        break;
                    case 'monthly':
                        var curr_month = moment().month();
                        date = moment().clone().startOf('month').month(curr_month);
                        //console.log(date, 'asdfasdf')
                        break;
                    default:
                        var date = '';
                        //console.log(date, 'asdfasdf2222')
                        break;
                }

                userModel.update({_id: req.user._id}, {$set: {
                        'next_payment_date': date._d,
                        'modified': new Date()
                    }}, {$upsert: 1}, function (err, data) {
                    if (err)
                    {
                        //console.log(err)
                        callback({'result': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                    }
                    else
                    {
                        callback({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.updateSuccess});
                    }
                });
            }
        }
    });
}
module.exports.setNextPaymentDate = setNextPaymentDate;
/* @function : searchByCreated
 *  @created  : 24112015
 *  @modified :
 *  @purpose  : search user by created date
 */
var searchByCreated = function (req, res, callback) {
    console.log('body', req.body);
    userModel.find({$and: [{'created': {$gte: new Date(req.body.FromDate)}}, {'created': {$lte: new Date(req.body.ToDate)}}, {'role_id': {$ne: null}}]})
            .populate({path: 'role_id', match: {code: req.body.role}})
            .exec(function (err, users) {
                if (err) {
                    callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.Error});
                } else {

                    // use to filter the role based user
                    users = users.filter(function (user) {
                        return user.role_id !== null;
                    });
                    console.log('users', users);
                    if (isEmptyObject(users)) {
                        callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.notFound});
                    } else {
                        callback({'code': config.constant.CODES.OK, "data": users, "message": config.constant.MESSAGES.Success});
                    }
                }
            });
}
module.exports.searchByCreated = searchByCreated;
/* @function : inviteSignUp
 *  @created  : 21012016
 *  @modified :
 *  @purpose  : registration of invited User
 */
var inviteSignUp = function (req, res, callback) {
    console.log('body', req.body);
    req.body.password = bCrypt.hashSync(req.body.password, bCrypt.genSaltSync(10), null);
    var user = new userModel(req.body);
    user.save(function (err, data) {
        if (err) {
            callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.notFound});
        } else {
            mails.registrationToCustomEmail(req, res, function (response) {
                if (response.code == 200) {
                    callback({'code': 200, "message": 'You have been register successfully, Please check you mail and activate your account.'});
                } else {
                    callback({'code': 404, 'data': 'null', "message": "Mail not sent, Please contact to the administrator for activation of account."});
                }
            });
        }

    });
}
module.exports.inviteSignUp = inviteSignUp;
/* @function : getInviteInfo
 *  @created  : 21012016
 *  @modified :
 *  @purpose  : get Invitation info
 */
var getInviteInfo = function (req, res, callback) {

    inviteModel.findOne({'_id': req.params.id}, function (err, data) {
        if (err) {
            callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.notFound});
        } else {
            callback({'code': config.constant.CODES.OK, "data": data, "message": config.constant.MESSAGES.Success});
        }

    });
}
module.exports.getInviteInfo = getInviteInfo;
/* @function : verifyADVCC
 *  @created  : 22012016
 *  @modified :
 *  @purpose  : Used for changing ADVCC verify status
 */
var verifyADVCC = function (req, res, callback) {

    req.params.id = req.body.rolecode; // role
    var field_ids = req.body.user_id;
    var verified = req.body.verified;
    userModel.update({_id: field_ids}, {$set: {'verified': verified}}, function (err) {
        if (err) {
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
        } else {
            listUserByRole(req, res, function (response) {
                callback({'code': config.constant.CODES.OK, "data": response.data, "message": config.constant.MESSAGES.statusSuccess});
            });
        }
    });
}
exports.verifyADVCC = verifyADVCC;
/* @function : changeOutboundSupport
 *  @created  : 22012016
 *  @modified :
 *  @purpose  : Used for changing ADVCC verify status
 */
var changeOutboundSupport = function (req, res, callback) {

    req.params.id = req.body.rolecode; // role
    var field_ids = req.body.user_id;
    var outbound_support = req.body.outbound_support;
    userModel.update({_id: field_ids}, {$set: {'outbound_support': outbound_support}}, function (err) {
        if (err) {
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
        } else {
            listUserByRole(req, res, function (response) {
                callback({'code': config.constant.CODES.OK, "data": response.data, "message": config.constant.MESSAGES.statusSuccess});
            });
        }
    });
}
exports.changeOutboundSupport = changeOutboundSupport;
/* @functions : esign,esignfind,editesign,checktermsandcontions,deleteesign,statusesign
 *  @created  : 29-01-2016
 *  @modified :
 *  @purpose  : Used for managing E-signs
 *  @author   : OMprakash Kapgate
 */
exports.esign = function (req, res, next) {
    console.log(req.body);
    var esign = new esignModel(req.body)

    esign.save(function (err, data) {
        if (err) {
            res.send({code: '401', message: "error adding esign"});
        }
        res.send({code: '200', message: "E-sign added Successfully"});
    });
}

exports.esignfind = function (req, res, next) {

    var conditions = {};
    if (req.params.role == 'ADMIN') {
        conditions = {'role': 'LGN', is_deleted: false};
    } else if (req.params.role == 'LGN') {
        conditions = {$or: [{role: 'LG'}, {'role': 'LB'}, {'role': 'ADVCC'}], 'is_deleted': false};
    }

    esignModel.find(conditions, function (err, data) {
        if (err) {
            console.error('ERROR!');
        }
        res.send({"data": data});
    });
}

exports.editesign = function (req, res, next) {
    var query = {'_id': req.body.id};
    newdata = req.body;
    esignModel.findOneAndUpdate(query, newdata, {upsert: true}, function (err, doc) {
        if (err) {
            res.send({code: '401', message: "error Editing esign"});
        }
        res.send({code: '200', message: "E-sign edited Successfully"});
    });
}

exports.deleteesign = function (req, res, next) {
    var id = req.params.id;
    esignModel.findOneAndUpdate({'_id': id}, {is_deleted: true}, {upsert: true}, function (err, doc) {
        if (err) {
            res.send({code: '401', message: "error deleting esign"});
        }
        res.send({code: '200', message: "E-sign deleted Successfully"});
    });
}

exports.statusesign = function (req, res, next) {
    var id = req.body.id;
    esignModel.findOneAndUpdate({'_id': id}, {status: req.body.status}, {upsert: true}, function (err, doc) {
        if (err) {
            res.send({code: '401', message: "error updating status"});
        }
        res.send({code: '200', data: doc, message: "E-sign status updated Successfully"});
    });
}

exports.checktermsandcontions = function (req, res, next) {
    esignModel.find({role: req.params.role}, function (err, data) {
        if (err) {
            res.send({"data": "No terms and conditions found"});
        }
        res.send({"data": data});
    });
}


/* @function : getGeoLocation * @purpose : get GeoLocation * return : client data */
var getGeoLocation = function (req, res, next) {
    var geoData;
    if (req.get('host') == 'localhost:3000' || req.get('host') == 'localhost:8000') {
        network.get_public_ip(function (err, ip) {
            console.log('local', ip)
            var ips = ip;
            var response = geoip.lookup(ips);
            if (response) {
                geoData = response;
                geoData.ip = ip;
            } else {
                geoData = {ip: null};
            }
            next(geoData);
        });
    } else {
        var ips = req.header('x-forwarded-for') || req.connection.remoteAddress;
        console.log('remote', ips)
        var response = geoip.lookup(ips);
        if (response) {
            geoData = response;
            geoData.ip = ips;
        } else {
            geoData = {ip: null};
        }
        next(geoData);
    }
}
exports.getGeoLocation = getGeoLocation;

exports.acceptterms = function (req, res, next) {
    getGeoLocation(req, res, function (data1) {
        var ip = data1.ip;
        user_profile.findOneAndUpdate({'user_id': req.body.id}, {taccept: req.body.value, ip_address: ip, e_signature: req.body.e_signature}, {upsert: true}, function (err, doc) {
            if (err) {
                console.log('err, doc', err, doc)
                res.json({code: '401', message: "Error updating terms"});
            } else {
                console.log('err, doc', err, doc)
                res.json({code: '200', data: doc, message: "Accepted the terms and Conditions"});
            }
        })
    });
}

/* @function : awsEmailVerification
 *  @author  :
 *  @created  : 19042016
 *  @modified :
 *  @purpose  : To Verify Email For Amazon AWS SES
 */
var awsEmailVerification = function (req, res, callback) {

    console.log('req.user', req.user);

    userModel.findOne({'_id': req.user._id}, function (err, userData) {
        if (err) {
            callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.notFound});
        } else {
            if (userData.aws_verified_email_status) {
                var alreadyVerifiedEmail = userData.aws_verified_email;
            }
            console.log('alreadyVerifiedEmail', alreadyVerifiedEmail);
            if (alreadyVerifiedEmail) {
                if ((alreadyVerifiedEmail == req.body.emailAddress) && userData.aws_verified_email_status) {
                    callback({code: '200', message: "Email is already verified"});
                } else {
                    var params = {
                        Identity: alreadyVerifiedEmail /* required */
                    };
                    awsSES.deleteIdentity(params, function (err, data) {
                        if (err) {
                            console.log('err1', err, err.stack); // an error occurred
                            callback({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error});
                        } else {

                            var params2 = {
                                EmailAddress: req.body.emailAddress /* required */
                            };

                            awsSES.verifyEmailIdentity(params2, function (err1, data1) {
                                if (err1) {
                                    console.log('err2', err1, err1.stack); // an error occurred
                                    callback({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error});
                                }
                                else {
                                    console.log('data1', data1);           // successful response
                                    var statusData = {"verifiedStatus": false};
                                    userModel.update({_id: req.user._id}, {$set: {aws_verified_email: req.body.emailAddress, aws_verified_email_status: false}}, function (err2) {
                                        if (err2) {
                                            callback({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error})
                                        } else {

                                            req.user.aws_verified_email = req.body.emailAddress;
                                            req.user.aws_verified_email_status = false;

                                            callback({'code': config.constant.CODES.OK, "data": statusData, "message": config.constant.MESSAGES.Success});
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            } else {
                var params = {
                    EmailAddress: req.body.emailAddress /* required */
                };

                awsSES.verifyEmailIdentity(params, function (err, data) {
                    if (err) {
                        console.log('err', err, err.stack); // an error occurred
                        callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
                    }
                    else {
                        console.log('data', data);           // successful response
                        var statusData = {"verifiedStatus": false};
                        userModel.update({_id: req.user._id}, {$set: {aws_verified_email: req.body.emailAddress, aws_verified_email_status: false}}, function (err) {
                            if (err) {
                                callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                            } else {

                                req.user.aws_verified_email = req.body.emailAddress;
                                req.user.aws_verified_email_status = false;

                                callback({'code': config.constant.CODES.OK, "data": statusData, "message": config.constant.MESSAGES.Success});
                            }
                        });
                    }
                });
            }
        }
    });
}
exports.awsEmailVerification = awsEmailVerification;


/* @function : checkAwsEmailStatus
 *  @author  :
 *  @created  : 21042016
 *  @modified :
 *  @purpose  : To Check Email Status For Amazon AWS SES
 */
var checkAwsEmailStatus = function (req, res, callback) {

    console.log('request', req.params);
    var emailAddress = req.params.emailAddress;

    var params = {
        Identities: [
            emailAddress
        ]
    };
    awsSES.getIdentityVerificationAttributes(params, function (err, data) {
        if (err) {
            console.log(err, err.stack); // an error occurred
        }
        else {
            //Success
            console.log('data', data);

            if (data.VerificationAttributes[emailAddress]) {
                console.log('IF');
                var emailVerificationStatus = data.VerificationAttributes[emailAddress].VerificationStatus;

                if (emailVerificationStatus == 'Success') {
                    console.log('Success');
                    var statusData = {"verifiedStatus": true};
                    userModel.update({aws_verified_email: emailAddress}, {$set: {aws_verified_email_status: true}}, {multi: true, upsert: true}, function (err1, data1) {
                        if (err1) {
                            callback({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error});
                        } else {
                            callback({'code': config.constant.CODES.OK, "data": statusData, "message": config.constant.MESSAGES.Success});
                        }
                    });
                } else {
                    console.log('Failure');
                    var statusData = {"verifiedStatus": false};
                    userModel.update({aws_verified_email: emailAddress}, {$set: {aws_verified_email_status: false}}, {multi: true, upsert: true}, function (err1, data) {
                        if (err1) {
                            callback({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error});
                        } else {
                            callback({'code': config.constant.CODES.OK, "data": statusData, "message": config.constant.MESSAGES.Success});
                        }
                    });
                }
            } else {
                console.log('Else');
                var statusData = {"verifiedStatus": false};
                userModel.update({aws_verified_email: emailAddress}, {$set: {aws_verified_email_status: false}}, {multi: true, upsert: true}, function (err1, data) {
                    if (err1) {
                        callback({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error});
                    } else {
                        callback({'code': config.constant.CODES.OK, "data": statusData, "message": config.constant.MESSAGES.Success});
                    }
                });
            }
        }
    });

}
exports.checkAwsEmailStatus = checkAwsEmailStatus;