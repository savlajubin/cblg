//To Model Category related to vertical collection data

var mongoose = require('mongoose');

var categorySchema = mongoose.Schema({
	created_by:{type:mongoose.Schema.Types.ObjectId, ref:'User'}, // reference to users collection
	parent_id:{type:mongoose.Schema.Types.ObjectId, ref:'Category'}, // If 0 then main category otherwise subcategory.
	vertical_id:{type:mongoose.Schema.Types.ObjectId, ref:'Vertical'}, // reference of vertical collection
	category_name:{ type:String }, //category_name
	category_status: {type: Boolean}, //category_status true or false
	category_description:{type:String}, //short description of category
	isdeleted:{type:Boolean, default: false }, // delete status
	created:{type: Date, default : Date.now()}, //created Date
	modified:{type: Date, default : Date.now()} //modified Date
})

// create collections 
var category = mongoose.model('Category',categorySchema);

module.exports = category;