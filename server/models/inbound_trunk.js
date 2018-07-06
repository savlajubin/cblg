var mongoose = require('mongoose');

//sub Schema for IVR Asscociated
var ivrSchema = new mongoose.Schema({
    ivr_id: {type: mongoose.Schema.Types.ObjectId, ref: 'ivr'},
    priority: {type: Number}  // starts from 0 i.e 0 is highiest priority
});

var TrunkSchema = new mongoose.Schema({
    created_by: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}, //belongs to which User.
    trunk_name: {type: String},
    association: {type: String}, //phone OR offer
    ring_to_number_id: {type: mongoose.Schema.Types.ObjectId, ref: 'ringToNumber'}, //associated RingToNumber
    offer_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Offer'}, //associated offer
    agent_script: {type: mongoose.Schema.Types.ObjectId, ref: 'agentScript'}, //associated offer
    ivr_id: [ivrSchema],
    created: {type: Date, default: Date.now()},
    is_deleted: {type: Boolean, default: false},
    status: {type: Boolean, default: false}
});


module.exports = mongoose.model('inbound_trunk', TrunkSchema);