var mongoose = require('mongoose');

var outBoundCampaignSchema = new mongoose.Schema({
    name: {type: String},
    afterHours: {type: Boolean, default: false},
    callAttempts: {type: Number, default: 0},
    lastAttempt: {type: Date},
    nextAttempt: {type: Date},
    phoneNumber: {type: String},
    hoo: [],
    created_by: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, //belongs to which User.
    created: {type: Date, default: Date.now()},
    is_deleted: {type: Boolean, default: false}
});


module.exports = mongoose.model('outBoundCampaign', outBoundCampaignSchema);