// Holds the details of the caller while filling form when calls will come

/* @model : callerDetail
 * @Creator   : Smartdata
 * @Creator   : 06/10/2015 - B2
 * @purpose  : To save caller details
 */
var mongoose = require('mongoose');

var scriptSchema = new mongoose.Schema({
    id: {type: Number},
    label: {type: String},
    value: {type: String},
    object: {type: mongoose.Schema.Types.Mixed}
});

var callerSchema = new mongoose.Schema({
    callUUID: {type: String},
    CallSid: {type: String},
    CLID: {type: String},
    scriptData: [scriptSchema],
    lead_status: {type: String},
    phone_no: {type: String},
    added_by: {type: mongoose.Schema.ObjectId, ref: 'User'},
    parent_id: {type: mongoose.Schema.ObjectId, ref: 'User'}, //corresponding ADVCC
    parent_lgn: {type: mongoose.Schema.ObjectId, ref: 'User'},
    email : {type: String},
    webLeadDetails:{
        email : {type: String},
        parent_lgn : {type: mongoose.Schema.ObjectId, ref: 'User'},
        webLeadInfo : {type: mongoose.Schema.Types.Mixed},
        campaignData: {type: mongoose.Schema.Types.Mixed}
    },
    isWebLead : {type: Boolean, default: false},
    is_deleted: {type: Boolean, default: false},
    created: {type: "Date", default: Date.now()},
    modified: {type: "Date", default: Date.now()}
});

module.exports = mongoose.model('callerDetail', callerSchema);
