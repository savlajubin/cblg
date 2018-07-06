/*To deal with Offer Created by LB*/
var mongoose = require('mongoose');

//Day Schema
var daySchema = new mongoose.Schema({
    'name': {type: String}
});

//sub Schema for HOO
var HOOSchema = new mongoose.Schema({
    call_range_start: {type: Number},
    call_range_end: {type: Number},
    round_time: {type: Boolean, default: false}, // it will be true when time is saved as 10pm to 4am and false if 4am to 10pm.
    days: [daySchema]
});



var offerSchema = new mongoose.Schema({
    user_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}, //it belongs to creator id
    parent_lgn: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    vertical_category_details: {
        'vertical_name': {type: String},
        'category_name': {type: String},
        'title': {type: String, unique: true}, //offer title must be unique
        'description': {type: String}
    },
    pay_per_call: {
        'lbamount': {type: Number},
        'lgamount': {type: Number},
        'lgnamount': {type: Number}
    },
    web_affiliate: {
        'webAffiliateMode': {type: String, default: false},
        leadAmountType: {type: String},
//        webLeadAmount: {type: Number},
        lbamount: {type: Number},
        lgamount: {type: Number},
        lgnamount: {type: Number},
        token: {type: String},
        scriptData: {type: mongoose.Schema.Types.Mixed}
    },
    state_restricted: [],
    media_restricted: [],
    duration: {
        'billable_callsecs': {type: String},
        'duration_activity': {type: String},
        'gross_unique': {type: String},
    },
    daily_caps: {
        'is_reduce_rate': {type: Boolean, default: false},
        'reduced_rate': {type: Number},
        'setting_option': {type: Boolean, default: false},
        'value': {type: String},
        'extra_field': {type: String},
        'call_cap': {type: Number, default: 9999}
    },
    compose_message: {
        pre_record_message: {type: Boolean, default: false},
        pre_record_prompt: {type: mongoose.Schema.Types.ObjectId, ref: 'Prompt'},
        pre_record_message_amd: {type: Boolean, default: false},
        pre_record_prompt_amd: {type: mongoose.Schema.Types.ObjectId, ref: 'Prompt'},
        whisper_message: {type: Boolean, default: false},
        whisper_prompt: {type: mongoose.Schema.Types.ObjectId, ref: 'Prompt'},
        afterHOO_message: {type: Boolean, default: false},
        afterHOO_message_prompt: {type: mongoose.Schema.Types.ObjectId, ref: 'Prompt'},
        phone_agent: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        phone_no: {type: String},
        max_attempt: {type: Number, default: 8},
    },
    hoo_schema: [HOOSchema],
    timezone: {type: String},
    active_status: {type: Boolean, default: false},
    marketing_automation: {type: Boolean, default: false},
    process_status: {type: Boolean, default: false},
    is_deleted: {type: Boolean, default: false},
    created: {type: "Date", default: Date.now()},
    modified: {type: "Date", default: Date.now()}
})

module.exports = mongoose.model('Offer', offerSchema);