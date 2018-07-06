0// Holds the details of the events created by PA

/* @model : calendarEvent
 * @Creator   : Smartdata
 * @Creator   : 04/02/2016
 * @purpose  : To save event details
 */
var mongoose = require('mongoose');

var scriptSchema = new mongoose.Schema({
    id: {type: Number},
    label: {type: String},
    value: {type: String},
    object: {type: mongoose.Schema.Types.Mixed}
});

var calendarSchema = new mongoose.Schema({
    calendarScriptId:{type: mongoose.Schema.ObjectId, ref: 'agentScript'},
    calendarScriptName: {type: String},
    eventName: {type: String},
    fromDate: {type: "Date"},
    endDate: {type: "Date"},
    isPrivate: {type: String},
    appointment_status: {type: String, default: 'Open'},
    scriptData: [scriptSchema],
    added_by: {type: mongoose.Schema.ObjectId, ref: 'User'},
    added_by_parent_id:{type: mongoose.Schema.ObjectId, ref: 'User'}, //advcc
    is_deleted: {type: Boolean, default: false},
    created: {type: "Date", default: Date.now()},
    modified: {type: "Date", default: Date.now()}
});

module.exports = mongoose.model('calendarSchema', calendarSchema);
