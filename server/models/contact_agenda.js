var mongoose = require('mongoose');

var contactagendasSchema = new mongoose.Schema({
    contacts: [{type: mongoose.Schema.Types.ObjectId, ref: 'ContactList'}],   // Array of Contact list ids
    method: {type: String},       // If frequency is onetime then it will contain "now" OR "later", If frequency is recurring then it will contain "year", "month", "week", "day"
    frequency: {type: String},    // "onetime" OR "recurring"
    timezone: {type: String},
    agenda_name: {type: String},
    date: {type: Number},
    day: {type: Number},
    hours: {type: Number},
    minutes: {type: Number},
    month: {type: Number},
    mode: {type: String},
    message: {type: String},
    subject: {type: String},
    sms_header: {type: String},
    description: {type: String},
    pre_record_message : {type: Boolean, default: false}, // If mode is "Call"
    pre_record_prompt : {type: mongoose.Schema.Types.ObjectId, ref: 'Prompt'},  // If mode is "Call"                      
    pre_record_message_amd : {type: Boolean, default: false}, // If mode is "Call"
    pre_record_prompt_amd : {type: mongoose.Schema.Types.ObjectId, ref: 'Prompt'},  // If mode is "Call"                      
    whisper_message : {type: Boolean, default: false}, // If mode is "Call"
    whisper_prompt : {type: mongoose.Schema.Types.ObjectId, ref: 'Prompt'},  // If mode is "Call"                      
    phone_no : {type: String},  // If mode is "Call"                      
    status: {type: Boolean, default: true},
    user_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    offer_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Offer'},
    is_deleted: {type: Boolean, default: false},
    created: {type: Date, default: Date.now},
})
module.exports = mongoose.model('ContactAgenda', contactagendasSchema);
