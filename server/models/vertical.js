/* @function :Vertical schema 
*  Creator : Shivansh 
*/

var mongoose = require('mongoose');

var verticalSchema = new mongoose.Schema({
	created_by:{type:mongoose.Schema.Types.ObjectId, ref:'User'}, // reference to users collection
	vertical_name:{ type:String, unique:true, require: true }, //vertical name
	vertical_status: {type: Boolean, require: true}, //vertical status true or false
	vertical_description:{type:String}, //short description of vertical
	isdeleted:{type:Boolean, default: false }, // delete status
	created:{type: Date, default : Date.now()}, //created Date
	modified:{type: Date, default : Date.now()} //modified Date

})

module.exports = mongoose.model('Vertical',verticalSchema);