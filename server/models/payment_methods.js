/*Schema for Payment method managment(Currently not in used)*/
var mongoose = require('mongoose');

var paymentMethodSchema = new mongoose.Schema({
	name:{type:String }, 
	description:{ type:String },
	status: {type: String},
	created:{type: Date}

})

module.exports = mongoose.model('PaymentMethod',paymentMethodSchema);