/*To Deal with user's personal data*/

var mongoose = require('mongoose');

var invoiceSchema = new mongoose.Schema({
	name:{type:String,trim:true},
	created:{type: Date,default : Date.now},
	user_id:{type:mongoose.Schema.ObjectId, ref:'User'}	
})

module.exports = mongoose.model('Invoice',invoiceSchema);