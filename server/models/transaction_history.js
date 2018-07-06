/*Transcation schema that hold all transactions details */

var mongoose = require('mongoose');

var TransactionSchema = new mongoose.Schema({
	payer_id:{type:mongoose.Schema.Types.ObjectId, ref:'User'}, // reference to users collection
	payee_id:{type:mongoose.Schema.Types.ObjectId, ref:'User'}, //  reference to users collection
	transaction_id:{type:String,required: true,unique: true,trim:true}, // unique id return by  thrid party to track transaction
	transaction_amount:{type:String,required: true,trim:true},
	transaction_date:{type:Date,trim:true},
	transaction_method_id:{type:mongoose.Schema.Types.ObjectId, ref:'PaymentMethod'}, reference to PaymentMethod collection
	created:{type: Date}, //created Date
	modified:{type: Date} //modified Date

})

module.exports = mongoose.model('Transaction',TransactionSchema);