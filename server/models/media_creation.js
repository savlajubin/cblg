var mongoose = require('mongoose');

var attrSchema = new mongoose.Schema({
    created_by: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}, //belongs to which User.
    name: {type: String},
    media_type: {type: String},
    email: {type: String},
    phone_no: {type: String},
    created: {type: Date, default: Date.now()},
    is_deleted: {type: Boolean, default: false},
    status: {type: Boolean, default: false}
});


module.exports = mongoose.model('MediaCreation', attrSchema);