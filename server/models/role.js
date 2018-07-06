/*Schema for User's role managment*/
var mongoose = require('mongoose');

var roleModuleSchema = new mongoose.Schema({
    module_id : {type:mongoose.Schema.Types.ObjectId, ref:'Module'}, //refer to module collection
    read : {type:Boolean ,default : false},
    write : {type:Boolean ,default : false},
    execute : {type:Boolean ,default : false}
});

var rolesSchema = new mongoose.Schema({
	type:{type:String }, 
	code: {type: String},
	status: {type: String},
//	module_access : [roleModuleSchema],
	users:{type:mongoose.Schema.ObjectId, ref:'User'},  //refer to user collection 
	isdeleted:{type:Boolean, default: false },
	created:{type: Date, default : Date.now()}, //created Date
	modified:{type: Date, default : Date.now()} //modified Date
});

module.exports = mongoose.model('Role',rolesSchema);