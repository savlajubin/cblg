var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var contactSchema = new mongoose.Schema({
     created: {type: Date, default: Date.now()},
     user_id: {type: mongoose.Schema.ObjectId, ref: 'User'},
     list_name:{type: String},
     status:{type: Boolean, default: true},
     is_deleted:{type: Boolean, default: false}
});
module.exports = mongoose.model('ContactList', contactSchema);
