/* Schema For user_profile Table */

var mongoose = require('mongoose');

//Prompt Schema for 2nd Iteration
var PromptInnerSchema = new mongoose.Schema({
    'prompt_id': {type: mongoose.Schema.Types.ObjectId, ref: 'Prompt'}, // determine when this Prompt will apply to IVR
});

//Queue Schema for 2nd Iteration
var QueueInnerSchema = new mongoose.Schema({
    'queue_id': {type: mongoose.Schema.Types.ObjectId, ref: 'queues'}, // determine when this Prompt will apply to IVR
});

//Ring Schema for 2nd Iteration
var RingInnerSchema = new mongoose.Schema({
    'phone_agent_id': {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, // determine when this Prompt will apply to IVR
});

//State Schema
var stateSchema = new mongoose.Schema({
    'name_long': {type: String}
});

//Day Schema
var daySchema = new mongoose.Schema({
    'name': {type: String}
});

//sub Schema for Dial options of IVR
var DialSchema = new mongoose.Schema({
    'dial_priority': {type: Number, default: 0}, // determine when this dial will apply to IVR
    'dial_to': {type: String},
    'is_next_dial': {type: Boolean, default: false},
    'wait_time': {type: Number, default: 0},
});

//sub Schema for Dial options of IVR
var MultiDialSchema = new mongoose.Schema({
    'dial_to': {type: String}
});
//sub Schema for Prompts options of IVR
var PromptSchema = new mongoose.Schema({
    'prompt_id': {type: mongoose.Schema.Types.ObjectId, ref: 'Prompt'}, // determine when this Prompt will apply to IVR
    'pressed_action': {type: String}, // Dial, Hangup
    'dial_schema': [DialSchema],
    'multi_dial_schema': [MultiDialSchema],
    'prompt_schema': [PromptInnerSchema],
    'allrepsbusy_schema': [DialSchema],
    'ring_schema': [RingInnerSchema],
    'sendToQueue_schema': [QueueInnerSchema]
});

//sub Schema for ring extension options of IVR
var RingSchema = new mongoose.Schema({
    'phone_agent_id': {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, // determine when this Prompt will apply to IVR
    'pressed_action': {type: String}, // Dial, Hangup
    'is_next_action': {type: Boolean, default:false},
    'wait_time': {type: Number, default:30},
    'leave_message': {type: Boolean, default:false},
    'dial_schema': [DialSchema],
    'multi_dial_schema': [MultiDialSchema],
    'prompt_schema': [PromptInnerSchema],
    'allrepsbusy_schema': [DialSchema],
    'ring_schema': [RingInnerSchema],
    'sendToQueue_schema': [QueueInnerSchema]
});

//sub Schema for send to queue options of IVR
var SendToQueueSchema = new mongoose.Schema({
    'queue_id': {type: mongoose.Schema.Types.ObjectId, ref: 'queues'}, // determine when this Prompt will apply to IVR
    'pressed_action': {type: String}, // Dial, Hangup
    'is_next_action': {type: Boolean, default:false},
    'wait_time': {type: Number, default:30},
    'dial_schema': [DialSchema],
    'multi_dial_schema': [MultiDialSchema],
    'prompt_schema': [PromptInnerSchema],
    'allrepsbusy_schema': [DialSchema],
    'ring_schema': [RingInnerSchema],
    'sendToQueue_schema': [QueueInnerSchema]
});
//sub Schema for send to queue options of IVR
var IVRSchema = new mongoose.Schema({
    'pressed_option': {type: String}, // Dial, Hangup
    'pressed_action': {type: String}, // Dial, Hangup
    'dial_schema': [DialSchema],
    'multi_dial_schema': [MultiDialSchema],
    'prompt_schema': [PromptSchema],
    'allrepsbusy_schema': [DialSchema],
    'ring_schema': [RingSchema],
    'sendToQueue_schema': [SendToQueueSchema]
});

//sub Schema for Geographic
var GeoSchema = new mongoose.Schema({
    area_code: {type: String},
    state: [stateSchema]
});

//sub Schema for HOO
var HOOSchema = new mongoose.Schema({
    call_range_start: {type: Number},
    call_range_end: {type: Number},
    round_time: {type: Boolean, default: false}, // it will be true when time is saved as 10pm to 4am and false if 4am to 10pm.
    days: [daySchema]
});

//Main Schema - userProfile
var IVRSchema = new mongoose.Schema({
    created_by: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}, //IVR belongs to which User.
    inital_prompt_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Prompt', required: true}, // Associated initial prompts to IVR
    ivr_schema: [IVRSchema],
    geo: {type: Boolean, default: false}, //Geo Status On or Off
    geo_schema: [GeoSchema],
    hoo: {type: Boolean, default: false}, //HOO Status On or Off
    hoo_schema: [HOOSchema],
    cc: {type: Boolean, default: false}, //Concurrent Call Status On or Off
    no_of_calls: {type: Number},
    ivr_name: {type: String},
    condition_fail_prompt_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Prompt', required: true},
//    phone_no: {type: mongoose.Schema.Types.ObjectId, ref: 'ringToNumber'}, // Moved to Ring to number schema.
    created: {type: Date, default: Date.now()},
    is_deleted: {type: Boolean, default: false},
    ivr_status: {type: Boolean, default: false}

});

module.exports = mongoose.model('ivr', IVRSchema);
