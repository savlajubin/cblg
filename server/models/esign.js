var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var esignSchema = new mongoose.Schema({
     created: {type: Date, default: Date.now()},
     role:{type: String},
     body:{type: String},
     status:{type: Boolean, default: false},
     is_deleted:{type: Boolean, default: false}
});
module.exports = mongoose.model('Esign', esignSchema);
