var config = require('../../config/constant.js'); // constants
var userModel = require('../models/user.js'); //To store user personal details
var calendarEvents = require('../models/calendarEvents.js');

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

/* @function : createEvent
 *  @created  : 04022016
 *  @modified :
 *  @purpose  : Create event
 */
var createEvent = function (req, next) {

    req.body.added_by = req.user._id;
    req.body.added_by_parent_id = req.user.parent_id._id;
    req.body.calendarScriptId = req.body.calendarScriptId;
    req.body.calendarScriptName = req.body.calendarScriptName;
    var eventData = new calendarEvents(req.body);
    eventData.save(function (err, data) {
        if (err) {
            next({'result': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error})
        } else {
            next({'result': config.constant.CODES.OK, "data": data, "message": config.constant.MESSAGES.saveSuccess});
        }
    });
}
module.exports.createEvent = createEvent;

/* @function : getCreatedEvents
 *  @created  : 05022016
 *  @modified :
 *  @purpose  : get all created events
 */
var getCreatedEvents = function (req, res, next) {
    //calendarEvents.find({added_by: req.user._id, 'is_deleted': false}, function (err, data) {
    calendarEvents.find({$or:[{added_by: req.user._id},{'isPrivate': false, 'added_by_parent_id': req.user.parent_id._id}], 'is_deleted': false}, function (err, data) {
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
module.exports.getCreatedEvents = getCreatedEvents;


/* @function : getEventScript
 *  @created  : 05022016
 *  @modified :
 *  @purpose  : get all created events
 */
var getEventScript = function (req, res, next) {
    var eventId = req.params.eventId;
    //calendarEvents.findOne({added_by: req.user._id, '_id':eventId , 'is_deleted': false},{'scriptData':1, 'appointment_status':1, 'isPrivate': 1}, function (err, data) {
    calendarEvents.findOne({'_id':eventId , 'is_deleted': false},{'scriptData':1, 'appointment_status':1, 'isPrivate': 1}, function (err, data) {
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
module.exports.getEventScript = getEventScript;


/*  @function : updateAppointmentStatus
 *  @created  : 05022016
 *  @modified :
 *  @purpose  : Update Appointment Status
 */
var updateAppointmentStatus = function (req, res, next) {

    calendarEvents.update({_id: req.body.eventId}, {$set: {'appointment_status': req.body.appointmentStatus}}, function (err, data) {
        if (err) {
            next({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error});
        } else {
            next({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.updateSuccess});
        }
    });
}
exports.updateAppointmentStatus = updateAppointmentStatus;



var getCalendarScript = function(req, res, next){
    
    userModel.findOne({_id: req.user._id}).populate('calendarScript.script_id').exec(function (err, scriptData) {
        if (err) {
            next({'code': config.constant.CODES.Error, "message": config.constant.MESSAGES.Error});
        } else {
            if (isEmptyObject(scriptData)) {
                next({'code': config.constant.CODES.notFound, "data": scriptData, "message": config.constant.MESSAGES.notFound});
            } else {                
                next({'code': config.constant.CODES.OK, "data": scriptData, "message": config.constant.MESSAGES.Success});
            }
        }
    });
}
exports.getCalendarScript = getCalendarScript;