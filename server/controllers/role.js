var config = require('../../config/constant.js'); // constants
var Role = require('../models/role'); //To deal with role collection data


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

/* @function : addRole
 *  @created  : 14072015
 *  @modified :
 *  @purpose  : Add role in the system
 */
var addRole = function (req, res, done) {
    var newRole = new Role();
    newRole.type = req.body.name;
    newRole.code = req.body.code;
    newRole.status = req.body.status;

    // check the role already exist
    findByRoleCode(req.body.code, function (response) {
        if (response.code == config.constant.CODES.notFound) {
            // save the role
            newRole.save(function (err) {
                if (err) {
                    console.log("Server Error (addRole) : " + err);
                    return done({"code": config.constant.CODES.Unauthorized, "data": false, "message": config.constant.MESSAGES.Error});
                }

                return done({"code": config.constant.CODES.OK, "data": newRole, "message": config.constant.MESSAGES.saveSuccess});
            });
        } else if (response.code == config.constant.CODES.OK) { // we already have the same role
            return done({"code": config.constant.CODES.PR, "data": newRole, "message": config.constant.MESSAGES.alreadyExist});
        } else { // any other problem
            return done(response);
        }
    });
}
module.exports.addRole = addRole;


/* @function : editRole
 *  @created  : 14072015
 *  @modified :
 *  @purpose  : edit role in the system
 */
var editRole = function (req, res, callback) {

    var updateData = {
        'type': req.body.name,
        'code': req.body.code,
        'status': req.body.status,
        'modified': Date.now()
    }
    var role_id = req.body._id;
    Role.update({_id: role_id}, {$set: updateData}, function (err) {
        if (err) {
            console.log("System Error (editRole) : " + err);
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
        } else {
            callback({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.updateSuccess});
        }
    });
}
module.exports.editRole = editRole;


/* @function : statusRole
 *  @created  : 14072015
 *  @modified :
 *  @purpose  : change status of role in the system  (true,false)
 */
var statusRole = function (req, res, callback) {

    var role_id = req.body.role_id;
    var updateData = {
        'status': (req.body.status == 'active') ? "deactive" : "active",
        'modified': Date.now()
    }

    Role.update({_id: role_id}, {$set: updateData}, function (err) {
        if (err) {
            console.log("System Error (Role Status) : " + err);
            callback({'code': config.constant.CODES.notFound, "data": "", "message": config.constant.MESSAGES.Error});
        } else {
            listRole(req, res, function (response) {
                callback({'code': config.constant.CODES.OK, "data": response.data, "message": config.constant.MESSAGES.statusSuccess});
            });
        }
    });
}
module.exports.statusRole = statusRole;

/* @function : findRole
 *  @created  : 14072015
 *  @modified :
 *  @purpose  : find role in the system
 */
var findRole = function (req, res, callback) {

    Role.findOne({'_id': req.params.id, 'isdeleted': false}).exec(function (err, role) {
        if (err) {
            console.log("System Error (findRole) : " + err);
            callback({'code': config.constant.CODES.notFound, "data": null, "message": config.constant.MESSAGES.Error});
        } else {
            if (isEmptyObject(role)) {
                callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.notFound});
            } else {
                callback({'code': config.constant.CODES.OK, "data": role, "message": config.constant.MESSAGES.Success});
            }
        }
    });
}
module.exports.findRole = findRole;

/* @function : findByRoleCode
 *  @created  : 14072015
 *  @modified :
 *  @purpose  : find role by code in the system
 */
var findByRoleCode = function (code, callback) {

    Role.findOne({'code': code, 'isdeleted': false}).exec(function (err, role) {
        if (err) {
            console.log("System Error (findRole) : " + err);
            return callback({'code': 403, "data": null, "message": config.constant.MESSAGES.Error});
        } else {
            if (isEmptyObject(role)) {
                return callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.notFound});
            } else {
                return callback({'code': config.constant.CODES.OK, "data": role, "message": config.constant.MESSAGES.Success});
            }
        }
    });
}

/* @function : listRole
 *  @created  : 14072015
 *  @modified :
 *  @purpose  : list roles in the system
 */
var listRole = function (req, res, callback) {
    Role.find({'isdeleted': false}, function (err, role) {
        if (err) {
            console.log("System Error (listRole) : " + err);
            callback({'code': config.constant.CODES.notFound, "data": null, "message": "Error"});
        } else {
            if (isEmptyObject(role)) {

                callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.notFound});
            } else {
                callback({'code': config.constant.CODES.OK, "data": role, "message": config.constant.MESSAGES.Success});
            }
        }
    });
}
module.exports.listRole = listRole;

/* @function : deleteRole
 *  @created  : 14072015
 *  @modified :
 *  @purpose  : delete the role from the system  (true,false)
 */
var deleteRole = function (req, res, callback) {
    var collection_roleArr = req.body.role_ids; //[{id:'559b72302b8723dfd1e94db3'}];
    var coll_length = collection_roleArr.length;
    collection_roleArr.forEach(function (role_id) {
        Role.update({_id: role_id.id}, {$set: {'isdeleted': true, 'modified': Date.now()}}, function (err) {
            if (err) {
                console.log("System Error (deleteRole) : " + err);
                callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
            } else {
                coll_length--;
                if (coll_length == 0) {
                    listRole(req, res, function (response) {
                        callback({'code': config.constant.CODES.OK, "data": response.data, "message": config.constant.MESSAGES.deleteSuccess});
                    });
                }
            }
        });
    });
}
module.exports.deleteRole = deleteRole;

/* @function : get_roleId
 *  @created  : 14102015
 *  @modified :
 *  @purpose  : return role id in the system to front end 
 */
var get_roleId = function (req, res, callback) {
    var modified_arr = {};
    Role.find({}, {'code': 1}, function (err, role) {
        if (err) {
            console.log("System Error (listRole) : " + err);
            callback({'code': config.constant.CODES.notFound, "data": null, "message": "Error"});
        } else {
            if (isEmptyObject(role)) {

                callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.notFound});
            } else {

                for (var k in role) {

                    modified_arr[role[k].code] = role[k]._id;
                }
            }
            callback({'code': config.constant.CODES.OK, "data": modified_arr, "message": config.constant.MESSAGES.Success});
        }
    });
}
module.exports.get_roleId = get_roleId;