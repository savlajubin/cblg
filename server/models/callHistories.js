/* Call history schema that stores all the details of a call coming to the system */
var mongoose = require('mongoose');

var DBSchema = new mongoose.Schema({
    Provider: {type: String}, // plivo or twilio
    Attend_by: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},

    /******* plivo (START) ******/
    TotalCost: {type: Number},
    Direction: {type: String},
    HangupCause: {type: String},
    From: {type: String},
    State: {type: String},
    StateName: {type: String},
    Duration: {type: Number}, //plivo for Callduration / Twilio for BillDuration
    CallerName: {type: String},
    DialMusic: {type: String},
    BillDuration: {type: Number},
    BillRate: {type: Number},
    To: {type: String},
    CLID: {type: String},
    AnswerTime: {type: 'Date'},
    StartTime: {type: 'Date'},
    EndTime: {type: 'Date'},
    CallUUID: {type: String},
    'SIP-H-To': {type: String},
    CallStatus: {type: String},
    Event: {type: String},
    /****** plivo (END) *******/

    /****** twilio (START) *******/
    Called: {type: String},
    ToState: {type: String},
    CallerCountry: {type: String},
    //Direction: {type: String}, // same in plivo
    CallerState: {type: String},
    ToZip: {type: String},
    CallSid: {type: String},
    //To: {type: String}, // same in plivo
    CallerZip: {type: String},
    ToCountry: {type: String},
    CalledZip: {type: String},
    CalledCity: {type: String},
    //CallStatus: {type: String}, // same in plivo
    //From: {type: String}, // same in plivo
    //AccountSid: {type: String}, // No USE
    CalledCountry: {type: String},
    CallerCity: {type: String},
    //ApplicationSid: {type: String}, // No USE
    Caller: {type: String},
    FromCountry: {type: String},
    ToCity: {type: String},
    FromCity: {type: String},
    CalledState: {type: String},
    FromZip: {type: String},
    FromState: {type: String},
    Timestamp: {type: Date},
    CallbackSource: {type: String},
    SequenceNumber: {type: Number},
    CallDuration: {type: Number},
    /****** twilio (END) *******/

    Recording: {
        RecordingSid: {type: String}, //Twilio
        RecordingUrl: {type: String}, //Twilio
        RecordingID: {type: String},
        RecordUrl: {type: String},
        RecordingDuration: {type: Number}, //plivo & Twilio both
        RecordingDurationMs: {type: Number},
        RecordingStartMs: {type: String},
        RecordingEndMs: {type: String},
        CallUUID: {type: String},
        Event: {type: String},
        type: {type: String}
    },

    campaignData: {type: mongoose.Schema.Types.Mixed},
    callerDetailId: {type: mongoose.Schema.Types.ObjectId, ref: 'callerDetail'},
    created: {type: 'Date', default: Date.now()},
    is_lgn_aproved: {type: Boolean, default: true},
    disaproved_note: {type: String},
    is_billable: {type: Boolean},
    is_paid: {type: Boolean},
    Note: {type: String},
    isdeleted: {type: Boolean, default: false}
});

module.exports = mongoose.model('callHistory', DBSchema);
