var mongoose = require('mongoose');

var attrSchema = new mongoose.Schema({
    created_by: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}, //belongs to which User.
    name: {type: String},
    media_type: {type: String},
    media_week: {type: String},
    daypart: {type: String},
    times: {type: String},
    rate: {type: String},
    spots_ordered: {type: String},
    amount_spent: {type: String},
    amount_cleared: {type: String},
    min_gross_profit: {type: String},
    min_roas: {type: String},
    created: {type: Date, default: Date.now()},
    is_deleted: {type: Boolean, default: false},
    status: {type: Boolean, default: false}
});


module.exports = mongoose.model('AttributionCampaign', attrSchema);