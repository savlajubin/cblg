/* Area code schema to determins the state based on the areacode */

var mongoose = require('mongoose');

var DBSchema = new mongoose.Schema({
    lgn_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    invited_by: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    role: {type: String},
    role_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Role'},
    email: {type: String},
    isdeleted: {type: Boolean, default: false}, // delete status
    created: {type: Date, default: Date.now()}, //created Date
    modified: {type: Date, default: Date.now()} //modified Date
});

module.exports = mongoose.model('Invite', DBSchema);
