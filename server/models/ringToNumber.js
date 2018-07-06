var mongoose = require('mongoose');

//sub Schema for IVR Asscociated
var ivrSchema = new mongoose.Schema({
    ivr_id: {type: mongoose.Schema.Types.ObjectId, ref: 'ivr'},
    priority: {type: Number}  // starts from 0 i.e 0 is highiest priority
});

var ringToNumberSchema = new mongoose.Schema({
    created_by: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}, //User_id of user who purchased this number using parent LGN's credentials
    phone_no: {type: String},
    provider_type: {type: String},
    provider: {type: String}, //plivo OR twilio
    ivr_associated: [ivrSchema],
    zipcode: {type: mongoose.Schema.Types.ObjectId, ref: 'zipCode'},
    is_deleted: {type: Boolean, default: false},
    assigned_to: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    created: {type: "Date", default: Date.now()},
    modified: {type: "Date", default: Date.now()}
})

module.exports = mongoose.model('ringToNumber', ringToNumberSchema);