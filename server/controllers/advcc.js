var config = require('../../config/constant.js'); // constants
var queues_model = require('../models/queues.js');
var callerDetail = require('../models/callerDetail.js');
var users_model = require('../models/user.js');
var user_profile_model = require('../models/user_profile.js');
var agentScriptModel = require('../models/agentScripts.js');
var inboundTrunkModel = require('../models/inbound_trunk.js');
var attrbutionModel = require('../models/attribution_campaign.js');
var mediaModel = require('../models/media_creation.js');
var document = require('../models/documents.js');
var callerDetails = require('../models/callerDetail.js');
var mail = require('../controllers/send_mail.js');
var formidable = require('formidable');
var fs = require('fs');
var _ = require('underscore');
var csv = require("fast-csv");
// load up the crypt lib
var bCrypt = require('bcrypt-nodejs');
var async = require('async');
var randtoken = require('rand-token');
//var plivo = require('plivo-node');
var plivo = require('plivo');
var mongoose = require('mongoose'); //Added to convert string to ObjectId


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

/* @function : addQueue
 *  @created  : 17092015
 *  @modified :
 *  @purpose  : Create Queue in the system for ADVCC
 */
var addQueue = function (req, res, done) {

    var agent_array = req.body.associated_agents;
    var newQueue = new queues_model();
    newQueue.associated_agents = [];
    newQueue.queue_name = req.body.queue_name;
    newQueue.created_by = req.user._id;
    for (var i = 0; i < agent_array.length; i++) {
        newQueue.associated_agents.push({'agent_id': agent_array[i]});
    }


    if (newQueue.associated_agents.length == agent_array.length) {
// save the Queue
        newQueue.save(function (err) {
            if (err) {
                console.log("Server Error (Creating Queue) : " + err);
                return done({"code": config.constant.CODES.Unauthorized, "message": config.constant.MESSAGES.Error});
            }
            return done({"code": config.constant.CODES.OK, "data": newQueue, "message": config.constant.MESSAGES.saveSuccess});
        });
    }

}
module.exports.addQueue = addQueue;


/* @function : editQueue
 *  @created  : 11072015
 *  @modified :
 *  @purpose  : edit queue in the system for Advcc
 */
var editQueue = function (req, res, callback) {
    var agent_array = req.body.associated_agents;
    var newQueue = {};
    newQueue['associated_agents'] = [];
    newQueue['queue_name'] = req.body.queue_name;
    for (var i = 0; i < agent_array.length; i++) {
        newQueue.associated_agents.push({'agent_id': agent_array[i]});
        if (newQueue.associated_agents.length == agent_array.length) {

            queues_model.update({_id: req.body._id}, {$set: newQueue}, function (err) {
                if (err) {
                    console.log("System Error (editQueue) : " + err);
                    callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
                } else {

                    callback({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.updateSuccess});
                }
            });
        }
    }

}
module.exports.editQueue = editQueue;


/* @function : listQueue
 *  @created  : 17092015
 *  @modified :
 *  @purpose  : list all QUeues in the system for ADVCC
 */
var listQueue = function (req, res, finalCallback) {
    queues_model.find({created_by: req.user._id}).populate('associated_agents.agent_id').exec(function (err, queueData) {
        if (err) {
            console.log("System Error (listQueue) : " + err);
            finalCallback({'code': config.constant.CODES.notFound, "data": null, "message": config.constant.MESSAGES.Error});
        } else {
            if (isEmptyObject(queueData)) {
                finalCallback({'code': config.constant.CODES.notFound, "data": queueData, "message": config.constant.MESSAGES.notFound});
            } else {
                finalCallback({'code': config.constant.CODES.OK, "data": queueData, "message": config.constant.MESSAGES.Success});
            }
        }

    });
}
module.exports.listQueue = listQueue;


/* @function : deleteQueue
 *  @created  : 11072015
 *  @modified :
 *  @purpose  : delete the Queue data from the system Advcc
 */
var findByQueueID = function (req, res) {
    var queue_id = req.params.queueId;
    queues_model.findOne({'_id': queue_id}, function (err, data) {
        res.json({'code': config.constant.CODES.OK, "data": data, "message": config.constant.MESSAGES.Success});
    });
}
module.exports.findByQueueID = findByQueueID;


/* @function : deleteQueue
 *  @created  : 11072015
 *  @modified :
 *  @purpose  : delete the Queue data from the system Advcc
 */
var deleteQueue = function (req, res, callback) {
    queues_model.remove({"_id": req.body.queue_id}, function (err) {
        if (err) {
            console.log("System Error (deleteFaq) : " + err);
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
        } else {
            listQueue(req, res, function (response) {
                callback({'code': config.constant.CODES.OK, "data": response.data, "message": config.constant.MESSAGES.deleteSuccess});
            });
        }
    });
}
module.exports.deleteQueue = deleteQueue;


/* @function : listQueue
 *  @created  : 17092015
 *  @modified :
 *  @purpose  : list all QUeues in the system for ADVCC
 */
var listPhoneAgent = function (req, res) {
    var advcc_id = req.user._id; //'55f955421db5b5359a505f98'; // role
    users_model.find({'status': {'$ne': 'delete'}, 'parent_id': advcc_id})
            .populate({path: 'role_id', match: {code: 'PA'}})
            .populate('calendarScript.script_id', 'script_name')
            .where('role_id')
            .ne(null)
            .exec(function (err, PAData) {
                if (err) {
                    console.log("System Error (listPA) : " + err);
                    res.json({'code': config.constant.CODES.notFound, "data": null, "message": config.constant.MESSAGES.Error});
                } else {
                    if (isEmptyObject(PAData)) {
                        res.json({'code': config.constant.CODES.notFound, "data": PAData, "message": config.constant.MESSAGES.notFound});
                    } else {
                        var count = 0;
                        var agentsData = [];
                        async.parallel({
                            one: function (callback) {
                                PAData.forEach(function (PA, index) {
                                    agentsData[index] = {'_id': PA._id, 'first_name': PA.first_name, 'last_name': PA.last_name, 'extension': PA.extension, 'calendarScript': PA.calendarScript};
                                    queues_model.find({'associated_agents.agent_id': PA._id}, function (err, queueData) {
                                        // queues_model.find({}, function (err, queueData) {
                                        if (err) {
                                            console.log("System Error (listQueue) : " + err);
                                            callback(err);
                                        } else {
                                            agentsData[index]['associated_queues'] = queueData;
                                            count++;
                                            if (count == PAData.length) {
                                                callback(null, agentsData);
                                            }
                                        }
                                    });
                                });
                            }
                        },
                        function (err, results) {
                            console.log(results);
                            //count++;
                            //if (count == PAData.length) {
                            if (err) {
                                res.json({'code': config.constant.CODES.Unauthorized, "message": config.constant.MESSAGES.Error});
                            } else {
                                res.json({'code': config.constant.CODES.OK, "data": results.one, "message": config.constant.MESSAGES.Success});
                            }
                            //}
                        })

                    }
                }

            });
}
module.exports.listPhoneAgent = listPhoneAgent;


/* @function : listQueue
 *  @created  : 17092015
 *  @modified :
 *  @purpose  : list all QUeues in the system for ADVCC
 */
var listPA = function (req, res, callback) {
    var advcc_id = req.user._id; //role

    // only need to apply condition for created_by:req.user._id
    users_model.find({'status': {'$ne': 'delete'}, 'parent_id': advcc_id})
            .populate({path: 'role_id', match: {code: 'PA'}})
            .where('role_id')
            .ne(null)
            .exec(function (err, PAData) {
                if (err) {
                    console.log("System Error (listPA) : " + err);
                    res.json({'code': config.constant.CODES.notFound, "data": null, "message": config.constant.MESSAGES.Error});
                } else {
                    if (isEmptyObject(PAData)) {
                        res.json({'code': config.constant.CODES.notFound, "data": PAData, "message": config.constant.MESSAGES.notFound});
                    } else {
                        res.json({'code': config.constant.CODES.OK, "data": PAData, "message": config.constant.MESSAGES.Success});
                    }
                }

            });
}
module.exports.listPA = listPA;


/* @function : listQueue
 *  @created  : 17092015
 *  @modified :
 *  @purpose  : list all QUeues in the system for ADVCC
 */
var findPAByID = function (req, res) {
    var advcc_id = req.params.advccId; //this is PA's _id

    users_model.findOne({'status': {'$ne': 'delete'}, '_id': advcc_id}).exec(function (err, PAData) {
        if (err) {
            console.log("System Error (listPA) : " + err);
            res.json({'code': config.constant.CODES.notFound, "data": null, "message": config.constant.MESSAGES.Error});
        } else {
            if (isEmptyObject(PAData)) {
                res.json({'code': config.constant.CODES.notFound, "data": PAData, "message": config.constant.MESSAGES.notFound});
            } else {
                var count = 0;
                var agentsData = [];
                async.parallel({
                    queue: function (callback) {
                        agentsData = {'_id': PAData._id, 'email': PAData.email, 'first_name': PAData.first_name, 'last_name': PAData.last_name, 'extension': PAData.extension, 'pa_my_campaign': PAData.pa_my_campaign, 'calendarScript': PAData.calendarScript};
                        queues_model.find({'associated_agents.agent_id': PAData._id}, function (err, queueData) {
                            if (err) {
                                console.log("System Error (listQueue) : " + err);
                                callback(err);
                            } else {
                                agentsData['queues'] = [];
                                if (isEmptyObject(queueData)) {
                                    callback(null, agentsData);
                                } else {
                                    queueData.forEach(function (queue, index) {
                                        agentsData['queues'][index] = queue._id;
                                        count++;
                                        if (count == queueData.length) {
                                            callback(null, agentsData);
                                        }
                                    });
                                }
                            }
                        });
                    },
                    campaign: function (callback) {
                        console.log(123, PAData.pa_my_campaign);
                        user_profile_model.find({'campaigns._id': {$in: PAData.pa_my_campaign}}, {user_id: 1, pa_my_campaign: 1, campaigns: 1}).exec(function (err, userProfile) {
                            console.log(786, userProfile)
                            var user = _.each(userProfile, function (Data) {
                                var responseData = _.filter(Data.campaigns, function (d) {
                                    return d.offer_id != null && (PAData.pa_my_campaign.indexOf(d._id.toString()) != -1);
                                });
                                if (responseData) {
                                    Data.campaigns = responseData;
                                }
                            });
                            callback(null, user);
                        });
                    }
                },
                function (err, results) {
                    if (err) {
                        console.log(err);
                        res.json({'code': config.constant.CODES.Unauthorized, "message": config.constant.MESSAGES.Error});
                    } else {
                        res.json({'code': config.constant.CODES.OK, "data": results.queue, campaignData: results.campaign, "message": config.constant.MESSAGES.Success});
                    }
                });
            }
        }
    });
}
module.exports.findPAByID = findPAByID;


/* @function : registerPA_fromADVCC
 *  @created  : 17092015
 *  @modified :
 *  @purpose  : Register PA User from the ADVCC section.
 */
var registerPA_fromADVCC = function (req, res) {
    var advcc_id = req.user._id;
    var advcc_parent_id = req.user.parent_id._id;
    var advcc_parent_provider = req.user.parent_id.webphone_details.provider;
    var advcc_parent_auth_id = req.user.parent_id.webphone_details.username;
    var advcc_parent_auth_token = req.user.parent_id.webphone_details.password;
    var advcc_parent_app_id = req.user.parent_id.webphone_details.app_id;
    if (advcc_parent_provider == 'plivo') {
        var tempPlivoApi = plivo.RestAPI({
            authId: advcc_parent_auth_id,
            authToken: advcc_parent_auth_token
        });
        var params = {
            'username': 'psx' + randtoken.generate(4) + Date.now(),
            'password': randtoken.generate(8),
            'alias': 'psx-' + Date.now(),
            'app_id': advcc_parent_app_id
        }
        tempPlivoApi.create_endpoint(params, function (status, response) {
            if (status >= 200 && status < 300) {
                req.body['webphone_details'] = {
                    plivo_sip_endpoint_id: response.endpoint_id,
                    plivo_sip_username: response.username,
                    plivo_sip_password: params.password,
                    provider: 'plivo'
                };
                savePAAfterSIP(req, res, function (resp) {
                    res.json(resp);
                });
            } else {
                console.log({'Status:': status, 'Response:': response});
                res.json({'result': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error, 'plivoStatus:': status, 'plivoResponse:': response});
            }
        });
    } else if (advcc_parent_provider == 'twilio') {
        req.body['webphone_details'] = {
            tw_webphone_name: 'psx' + randtoken.generate(4) + Date.now(),
            provider: 'twilio'
        };
        savePAAfterSIP(req, res, function (resp) {
            res.json(resp);
        });
    } else {
        savePAAfterSIP(req, res, function (resp) {
            res.json(resp);
        });
    }
}
exports.registerPA_fromADVCC = registerPA_fromADVCC;


var savePAAfterSIP = function (req, res, next) {
    // find a user whose email is the same as the forms email
    // we are checking to see if the user trying to login already exists
    users_model.findOne({'email': req.body.email}, function (err, user) {
        // if there are any errors, return the error
        if (err) {
            console.log("System Error (register) : " + err);
            next({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
        }

        // check to see if theres already a user with that email
        if (user) {
            next({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.alreadyExist});
        } else {
            // if there is no user with that email
            // create the user
            var newUser = new users_model();
            // set the user's local credentials
            newUser.role_id = '559a6a2a23405677c3d2d438';
            newUser.parent_id = req.user._id;
            newUser.email = req.body.email;
            newUser.password = createHash(req.body.password);
            newUser.first_name = req.body.first_name;
            newUser.last_name = req.body.last_name;
            newUser.extension = req.body.extension ? req.body.extension : '';
            newUser.phone_no = req.body.phone_no ? req.body.phone_no : '';
            newUser.pa_my_campaign = req.body.pa_my_campaign ? req.body.pa_my_campaign : '';
            newUser.calendarScript = req.body.calendarScript ? req.body.calendarScript : '';
            newUser.status = 'active';
            newUser.webphone_details = req.body.webphone_details ? req.body.webphone_details : {};
            // save the user
            newUser.save(function (err, saveddata) {
                if (err) {
                    console.log(err);
                    if (err.code == 11000) {
                        next({'code': config.constant.CODES.Unauthorized, "message": 'Extension Already Exists'});
                    } else {
                        next({'code': config.constant.CODES.Unauthorized, "message": config.constant.MESSAGES.Error});
                    }
                } else {
                    // now push newly created user id to the queue schema in associated agents  subschema.
                    console.log(1234, req.body)
                    req.body.queues = req.body.queues ? req.body.queues : [];
                    queues_model.find({'_id': {$in: req.body.queues}}, {associated_agents: 1}).exec(function (err, queueData) {
                        if (err) {
                            console.log("System Error (listQueue) : " + err);
                            next({'code': config.constant.CODES.notFound, "data": null, "message": config.constant.MESSAGES.Error});
                        } else {
                            var count = 0;
                            async.parallel({
                                one: function (secondcallback) {
                                    if (isEmptyObject(queueData)) {
                                        secondcallback(null, queueData);
                                    } else {
                                        // loop through each queue record
                                        queueData.forEach(function (Data, index) {
                                            Data.associated_agents.push({'agent_id': saveddata._id});
                                            Data.save(function (err) {
                                                if (++count == queueData.length) {
                                                    secondcallback(null, queueData);
                                                }
                                            });
                                        });
                                    }
                                }
                            },
                            function (err, results) {
                                next({'code': config.constant.CODES.OK, 'data': queueData, "message": config.constant.MESSAGES.registerSuccess});
                            });
                        }
                    });
                }
            });
        }
    });
}

/* @function : editPA_fromADVCC
 *  @created  : 24092015
 *  @modified :
 *  @purpose  : Edit phone agents from ADVCC section
 */
var editPA_fromADVCC = function (req, res) {
    queues_model.update({'associated_agents.agent_id': req.body._id},
    {$pull: {associated_agents: {'agent_id': req.body._id}}}, {multi: true},
    function (err, val) {
        if (err) {
            console.log('err', err);
        }

        // here update first PA data then queue model for associated agent id
        var insertData = {
            'first_name': req.body.first_name,
            'last_name': req.body.last_name,
            'extension': req.body.extension ? req.body.extension : '',
            'pa_my_campaign': req.body.pa_my_campaign ? req.body.pa_my_campaign : '',
            'calendarScript': req.body.calendarScript ? req.body.calendarScript : '',
            'modified': new Date()
        };
        users_model.update({_id: req.body._id}, {$set: insertData}, {upsert: true}, function (err) {
            if (err) {
                console.log("System Error (SaveContactInfo) : " + err);
                res.json({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
            } else {
                if (req.body.queues.length) {
                    // now push newly created user id to the queue schema in associated agents  subschema.
                    queues_model.find({'_id': {$in: req.body.queues}}, {associated_agents: 1}).exec(function (err, queueData) {
                        if (err) {
                            console.log("System Error (listQueue) : " + err);
                            res.json({'code': config.constant.CODES.notFound, "data": null, "message": config.constant.MESSAGES.Error});
                        } else {
                            if (queueData.length) {
                                queueData.forEach(function (Data, index) {
                                    Data.associated_agents.push({'agent_id': req.body._id});
                                    Data.save(function (err) {
                                    });
                                    if (index + 1 == queueData.length) {
                                        res.json({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.updateSuccess});
                                        //secondcallback(null, queueData);
                                    }
                                });
                            } else {
                                res.json({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.updateSuccess});
                            }
                        }
                    });
                } else {
                    res.json({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.updateSuccess});
                }
            }
        });
    });
}
exports.editPA_fromADVCC = editPA_fromADVCC;


/*  @function : saveAgentScript
 *  @created  : 25012016
 *  @modified :
 *  @purpose  : List Agent Script
 */
var listCalendarScript = function (req, res) {
    agentScriptModel.find({created_by: req.user._id, script_type: 'calendar_script', is_deleted: false}, function (err, scriptList) {
        console.log('scriptList', scriptList)
        if (err) {
            console.log('scriptList err', err);
            res.json({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error});
        } else {

            var scriptArr = _.map(scriptList, function (item) {
                return item._id;
            });

            users_model.find({"calendarScript.script_id": {$in: scriptArr}})
                    .select({first_name: 1, last_name: 1, 'calendarScript.script_id': 1})
                    .exec(function (err, PAList) {
                        if (err) {
                            console.log('ibList err', err);
                            res.json({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error});
                        } else {
                            res.json({'code': config.constant.CODES.OK, data: scriptList, PAList: PAList, "message": config.constant.MESSAGES.Success});
                        }
                    });
        }
    });
}
exports.listCalendarScript = listCalendarScript;


/*  @function : saveAgentScript
 *  @created  : 25012016
 *  @modified :
 *  @purpose  : List Agent Script
 */
var listAgentScript = function (req, res) {
    agentScriptModel.find({created_by: req.user._id, script_type: 'agent_script', is_deleted: false})
            .exec(function (err, scriptList) {
                console.log('scriptList', scriptList)
                if (err) {
                    console.log('scriptList err', err);
                    res.json({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error});
                } else {
                    var agentIdsArr = _.map(scriptList, function (item) {
                        return item._id;
                    });
                    console.log('agent_idsarr', agentIdsArr);
                    inboundTrunkModel.find({'agent_script': {$in: agentIdsArr}}, function (err, ibList) {
                        if (err) {
                            console.log('ibList err', err);
                            res.json({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error});
                        } else {
                            res.json({'code': config.constant.CODES.OK, data: scriptList, ib: ibList, "message": config.constant.MESSAGES.Success});
                        }
                    });
                }
            });
}
exports.listAgentScript = listAgentScript;


/*  @function : getAgentScript
 *  @created  : 22012016
 *  @modified :
 *  @purpose  : Get Agent Script By ID
 */
var getAgentScript = function (req, res) {

    var scriptId = req.params.scriptId;
    //    agentScriptModel.findOne({_id: scriptId, created_by: req.user._id, is_deleted: false})
    agentScriptModel.findOne({_id: scriptId, is_deleted: false})
            .exec(function (err, data) {
                console.log(data)
                if (err) {
                    console.log('err', err);
                    res.json({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error});
                } else {
                    res.json({'code': config.constant.CODES.OK, data: data});
                }
            });
}
exports.getAgentScript = getAgentScript;


/*  @function : deleteAgentScript
 *  @created  : 22012016
 *  @modified :
 *  @purpose  : Delete Agent Script By ID
 */
var deleteAgentScript = function (req, res) {

    var scriptId = req.body.script_id;
    agentScriptModel.update({_id: scriptId}, {$set: {is_deleted: true}}, function (err, data) {
        if (err) {
            console.log('err', err);
            res.json({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error});
        } else {
            res.json({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.deleteSuccess});
        }
    });
}
exports.deleteAgentScript = deleteAgentScript;


/*  @function : saveAgentScript
 *  @created  : 22012016
 *  @modified :
 *  @purpose  : Save Agent Script
 */
var saveAgentScript = function (req, res) {
    var saveData = req.body;
    saveData['created_by'] = req.user._id;
    saveData['script_name'] = (req.body.formData && req.body.formData.script_name) ? req.body.formData.script_name : 'Unnamed Script';
    saveData['script_type'] = (req.body.formData && req.body.formData.script_type) ? req.body.formData.script_type : 'agent_script';
    var scriptId = req.body.formData ? req.body.formData.script_id : undefined; //req.body.scriptId ? req.body.scriptId : undefined;

    _.each(saveData.scriptData, function (scriptItem) {
        scriptItem['optionsArr'] = scriptItem['options'];
        delete scriptItem.options;
    });

    delete saveData.formData;
    agentScriptModel.count({_id: scriptId}, function (err, count) {
        if (err) {
            console.log('countErr', err);
            res.json({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error});
        } else if (count) {
            agentScriptModel.update({_id: scriptId}, {$set: saveData}, {upsert: true}, function (err, data) {
                if (err) {
                    console.log('updateErr', err);
                    res.json({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error});
                } else {
                    res.json({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.updateSuccess});
                }
            });
        } else {
            agentScriptModel(saveData).save(function (err, data) {
                if (err) {
                    console.log('saveErr', err);
                    res.json({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error});
                } else {
                    res.json({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.saveSuccess});
                }
            });
        }
    });
}
exports.saveAgentScript = saveAgentScript;


/*  @function : saveAttributionCampaign
 *  @created  : 28012016
 *  @modified :
 *  @purpose  : Save Attribution Campaign
 */
var saveAttributionCampaign = function (req, res) {

    var attr_id = (req.body._id) ? req.body._id : '';
    delete req.body._id;
    if (attr_id) {
        attrbutionModel.update({_id: attr_id}, {$set: req.body}, function (err, count) {
            if (err) {
                console.log('err', err);
                res.json({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error});
            } else {
                res.json({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.updateSuccess});
            }
        });
    } else {
        req.body.created_by = req.user._id;
        var saveData = new attrbutionModel(req.body);
        saveData.save(function (err, count) {
            if (err) {
                console.log('err', err);
                res.json({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error});
            } else {
                res.json({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.saveSuccess});
            }
        });
    }

}
exports.saveAttributionCampaign = saveAttributionCampaign;


/*  @function : getAttributionCampaignList
 *  @created  : 28012016
 *  @modified :
 *  @purpose  : Get Attribution Campaign List
 */
var getAttributionCampaignList = function (req, res) {

    attrbutionModel.find({created_by: req.user._id, is_deleted: false}, function (err, data) {
        if (err) {
            console.log('err', err);
            res.json({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error});
        } else {
            res.json({'code': config.constant.CODES.OK, "data": data});
        }
    });
}
exports.getAttributionCampaignList = getAttributionCampaignList;


/*  @function : getAttributionCampaignData
 *  @created  : 28012016
 *  @modified :
 *  @purpose  : Get Attribution Campaign data
 */
var getAttributionCampaignData = function (req, res) {

    attrbutionModel.findOne({_id: req.body.id}, function (err, data) {
        if (err) {
            console.log('err', err);
            res.json({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error});
        } else {
            res.json({'code': config.constant.CODES.OK, "data": data});
        }
    });
}
exports.getAttributionCampaignData = getAttributionCampaignData;


/*  @function : deleteAttributionCampaign
 *  @created  : 28012016
 *  @modified :
 *  @purpose  : Delete Attribution Campaign
 */
var deleteAttributionCampaign = function (req, res) {

    attrbutionModel.update({_id: req.body.id}, {$set: {is_deleted: true}}, function (err, count) {
        if (err) {
            console.log('err', err);
            res.json({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error});
        } else {
//            res.json({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.deleteSuccess});
            getAttributionCampaignList(req, res);
        }
    });
}
exports.deleteAttributionCampaign = deleteAttributionCampaign;


/*************************** ADVCC Document Upload *********************************/
/* @function :advccPaDocumentUpload
 * @created  : 01022016
 * @modified :
 * @purpose  : uploads and saves advcc and pa's documents
 */
var advccPaDocumentUpload = function (req, next) {

    var form = new formidable.IncomingForm();
    form.uploadDir = "./public/assets/images/documents"; //set upload directory
    form.keepExtensions = true; //keep file extension
    form.parse(req, function (err, fields, files) {
        var fileLength = Object.keys(files).length;
        if (fields.documentId == '') {
            var itemArr = [];
            _.each(_.toArray(files), function (file, index) {
                itemArr.push({file_name: file.name, path: file.path});
                if (fileLength == index + 1) {
                    document({
                        'files': itemArr
                    }).save(function (err, data) {
                        if (err) {
                            next({'result': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error})
                        } else {
                            next({'result': config.constant.CODES.OK, "data": data, "message": config.constant.MESSAGES.uploadSuccess});
                        }
                    });
                }
            });
        } else {
            document.findOne({'_id': fields.documentId}, function (err, data) {
                if (err) {
                    next({'result': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error})
                }
                else {
                    var itemArr = data.files;
                    _.each(_.toArray(files), function (file, index) {
                        itemArr.push({file_name: file.name, path: file.path});
                        if (fileLength == index + 1) {
                            document.update({'_id': fields.documentId}, {$set: {files: itemArr}}, function (err, updateData) {
                                if (err) {
                                    next({'result': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error})
                                } else {
                                    data.files = itemArr;
                                    next({'result': config.constant.CODES.OK, "data": data, "message": config.constant.MESSAGES.uploadSuccess});
                                }
                            });
                        }
                    });
                }
            });
        }
    });
};
exports.advccPaDocumentUpload = advccPaDocumentUpload;


/* @function : deleteDocuments
 *  @created  : 02022016
 *  @modified :
 *  @purpose  : Delete uploaded documents of PA/ADVCC
 */
var deleteDocuments = function (req, callback) {
    var filepath = req.body.filepath;
    document.update({'_id': req.body.documentId}, {$pull: {files: {_id: req.body.fileDocumentId}}}, function (err) {
        if (err) {
            callback({'result': 404, "message": " Error"});
        } else {
            document.findOne({'_id': req.body.documentId}, {files: 1}, function (err, data) {
                if (err) {
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
exports.deleteDocuments = deleteDocuments;


/* @function :advccPaDocumentUpload
 * @created  : 01022016
 * @modified :
 * @purpose  : uploads and saves advcc and pa's documents
 */
var saveDocumentData = function (req, next) {

    if (req.body.documentId) {
        var saveData = req.body.formData;
        saveData['user_id'] = req.user._id;
        document.update({_id: req.body.documentId}, {$set: saveData}, {upsert: true}, function (err, data) {
            if (err) {
                next({'result': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error});
            } else {
                next({'result': config.constant.CODES.OK, "roleId": req.user.role_id.code, "message": config.constant.MESSAGES.saveSuccess});
            }
        });
    } else {
        next({'result': config.constant.CODES.Error, "message": 'Please upload any file first'});
    }
};
exports.saveDocumentData = saveDocumentData;


/* @function : listAllDocuments
 *  @created  : 02022016
 *  @modified :
 *  @purpose  : list all documents in the system for ADVCC/PA
 */
var listAllDocuments = function (req, res, next) {

    document.find({lead_id: req.params.lead_id, 'is_deleted': false}).populate('lead_id').exec(function (err, data) {
//    /document.find({user_id: req.user._id, 'is_deleted': false}, function (err, data) {
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
module.exports.listAllDocuments = listAllDocuments;


/* @function : listAllfileUploaded
 *  @created  : 02022016
 *  @modified :
 *  @purpose  : list all file documents in the system for ADVCC/PA
 */
var listAllfileUploaded = function (req, res, next) {

    var documentId = req.params.documentId;
//    document.findOne({'_id': documentId, 'user_id': req.user._id}, {files: 1}).exec(function (err, data) {
    document.findOne({'_id': documentId}, {files: 1}).exec(function (err, data) {
        console.log(data)
        if (err) {
            next({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error});
        } else {
            next({'code': config.constant.CODES.OK, data: data, "message": config.constant.MESSAGES.Success});
        }
    });
}
module.exports.listAllfileUploaded = listAllfileUploaded;


/* @function : getLeadList
 *  @created  : 01032016
 *  @modified :
 *  @purpose  : list all leads of ADVCC/PA
 */
var getLeadList = function (req, res, callback) {

    var user_id = req.user._id;
    var parent_id = req.user.parent_id._id;

    var conditions = {};
    if (req.user.role_id.code == 'PA') {
        users_model.findOne({'_id': parent_id}, function (err, userDetails) {
            if (err) {
                callback({'code': config.constant.CODES.notFound, "data": null, "message": config.constant.MESSAGES.Error});
            } else {
                var parent_lgn = userDetails.parent_id;
                conditions = {$or: [{'added_by': user_id}, {'webLeadDetails.parent_lgn': parent_lgn}], 'is_deleted': false};
            }
        });
    } else if (req.user.role_id.code == 'ADVCC') {
        conditions = {$or: [{'added_by': user_id}, {'webLeadDetails.parent_lgn': parent_id}], 'is_deleted': false};
    }

    /* Get Lead List */
    callerDetails.find(conditions, function (err, leadDetails) {
        if (err) {
            callback({'code': config.constant.CODES.notFound, "data": null, "message": config.constant.MESSAGES.Error});
        } else {
            var leadList = [];
            leadDetails.forEach(function (leadData) {
                if (leadData.isWebLead) {
                    leadList.push({_id: leadData._id, email: leadData.webLeadDetails.email});
                } else {
                    leadList.push({_id: leadData._id, email: leadData.email});
                }
            });
            callback({'code': config.constant.CODES.OK, "data": leadList, "message": config.constant.MESSAGES.Success});
        }
    });
}
module.exports.getLeadList = getLeadList;


/* @function : deleteFullDocument
 *  @created  : 03022016
 *  @modified :
 *  @purpose  : Delete full documents of PA/ADVCC
 */
var deleteFullDocument = function (req, callback) {
    document.update({'_id': req.body.documentId}, {$set: {'is_deleted': true}}, function (err) {
        if (err) {
            callback({'code': config.constant.CODES.notFound, "data": null, "message": config.constant.MESSAGES.Error});
        } else {
            document.find({user_id: req.user._id, 'is_deleted': false}, function (err, data) {
                if (err) {
                    callback({'code': config.constant.CODES.notFound, "data": null, "message": config.constant.MESSAGES.Error});
                }
                else {
                    callback({'code': config.constant.CODES.OK, "data": data, "message": config.constant.MESSAGES.Success});
                }
            });
        }
    });
}
exports.deleteFullDocument = deleteFullDocument;


/*  @function : saveMediaRequest
 *  @created  : 01022016
 *  @modified :
 *  @purpose  : Save Media Creation Request Form
 */
var saveMediaRequest = function (req, res) {
    req.body.created_by = req.user._id;
    var media = new mediaModel(req.body);
    media.save(function (err, data) {
        if (err) {
            console.log('err', err);
            res.json({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error});
        } else {
            mail.sendMediaRequestMail(req, res, function (response) {
                if (response.code == config.constant.CODES.OK) {
                    res.json({'code': config.constant.CODES.OK, "data": data, "message": config.constant.MESSAGES.saveSuccess});
                } else {
                    res.json({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error});
                }
            });
        }
    });
}
exports.saveMediaRequest = saveMediaRequest;


/*  @function : getMediaList
 *  @created  : 01022016
 *  @modified :
 *  @purpose  : Get Media Creation Request Form List
 */
var getMediaList = function (req, res) {
    mediaModel.find({is_deleted: false}, function (err, data) {
        if (err) {
            console.log('err', err);
            res.json({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error});
        } else {
            res.json({'code': config.constant.CODES.OK, "data": data, "message": config.constant.MESSAGES.saveSuccess});
        }
    });
}
exports.getMediaList = getMediaList;


// Generates hashed value for password using bCrypt
var createHash = function (password) {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}


//abhishek
var importClientCSV = function (req, res) {


    var form = new formidable.IncomingForm();
    console.log(form);
    form.uploadDir = "./public/assets/tmp/"; //set upload directory
    console.log("1");
    form.keepExtensions = true; //keep file extension
    console.log("2");
    form.parse(req, function (err, fields, files) {
        console.log('files', files);
        if (err) {
            console.log("inside error");
            console.log(err);
        } else {

            if (files.file.type == 'text/csv') {

//                csv.fromPath(files.file.path)
//                        .on("data", function (data) {
//                            console.log('new data',data);
//                        })
//                        .on("end", function () {
//                            console.log("done");
//                        });
                var row = 0;
                csv.fromPath(files.file.path)
                        .on("data", function (data) {
//                          callerDetail.find({email:data[0]},function(err,data){
//                              if(err) res.json({message:"Opps something happens"});
//                              if(data){
//                                  console.log({message:"User already exists"});
//                              }
//
//                          });
                            console.log('row', row);
                            if (row) {

                                saveData = {
                                    first_name: data[1],
                                    last_name: data[2],
                                    email: data[0],
                                    addressLine1: data[10],
                                    //addressLine2: data[10],
                                    city: data[11],
                                    state: data[12],
                                    zip: data[13],
                                    phoneno: data[7],
                                    added_by: req.user._id,
                                    parent_lgn: req.user.parent_id._id

                                };
                                callerDetail(saveData).save(function (err, saveData) {
                                    if (err) {
                                        console.log(err);
                                        //res.json({status: '401', message: 'Oops, something went wrong! (reason: save)'});
                                        //return false;
                                    }
                                    console.log('saveData', saveData);
                                });
                            }
                            row++;
                        })
                        .on("end", function () {
                            fs.unlink(files.file.path, function (err) {
                                if (err) {
                                    res.json({status: '200', message: 'Clients Successfully Imported (but error in temp file deletion)'});
                                } else {
                                    res.json({status: '200', message: 'Clients Successfully Imported'});
                                }
                            });
                        });
            }
            else {
                console.log("inside error");
                res.json({status: '401', message: 'Error, File did\'t uploaded or invalid format. Only CSV is allowed'});
            }

        }
    });
}
module.exports.importClientCSV = importClientCSV;
