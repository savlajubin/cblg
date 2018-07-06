var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var contactSchema = new mongoose.Schema({
    created: {type: Date, default: Date.now()},
    first_name: {type: String},
    last_name: {type: String},
    email: {type: String},
    phone_no: {type: String}, // to phone number for after hour CALLs
    list_id: {type: mongoose.Schema.ObjectId, ref: 'ContactList'},
    consent: {type: Boolean},
    last_attempt: {type: Date}, // required in after hour CALLs
    no_of_attempt: {type: Number, default: 0}, // required in after hour CALLs
    nextAttempt: {type: Date},
    base_url: {type: String}, // required in after hour CALLs
    offer_id: {type: mongoose.Schema.ObjectId, ref: 'Offer'},
    from_phone_no: {type: String}, // from phone number for after hour CALLs
    status: {type: Boolean, default: true},
    optout_sms: {type: Boolean, default: false},
    optout_email: {type: Boolean, default: false},
    optout_call: {type: Boolean, default: false},
    is_deleted: {type: Boolean, default: false}
});
module.exports = mongoose.model('Contact', contactSchema);
