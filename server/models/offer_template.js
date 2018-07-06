//Main Schema - offerTemplate
var mongoose = require('mongoose');
var offerTemplateSchema = new mongoose.Schema({
    user_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}, //user profile belongs to which User
    vertical_category_details: {
        'vertical_id': {type: mongoose.Schema.Types.ObjectId, ref: 'Vertical', required: true},
        'category_id': {type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true},
        'title': {type: String, unique: true},
        'description': {type: String}
    },
    pay_per_call: {
        'lbamount': {type: Number},
        'lgamount': {type: Number},
        'lgnamount': {type: Number},
    },
    state_restricted: [],
    duration: {
        'billable_callsecs': {type: String},
        'duration_activity': {type: String},
        'gross_unique': {type: String}
    },
    daily_caps: {
        'is_reduce_rate': {type: Boolean, default: false},
        'reduced_rate': {type: Number},
        'setting_option': {type: Boolean, default: false},
        'value': {type: String},
        'extra_field': {type: String},
        'call_cap':{type:Number}
    },
    active_status: {type: Boolean, default: false},
    process_status: {type: Boolean, default: false},
    is_deleted: {type: Boolean, default: false},
    created: {type: "Date", default: Date.now()},
    modified: {type: "Date", default: Date.now()}
});

module.exports = mongoose.model('offerTemplate', offerTemplateSchema);