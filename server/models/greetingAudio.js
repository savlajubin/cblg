// Schema for storing all the greeting audio of users
var mongoose = require('mongoose');

var greetingAudioSchema = new mongoose.Schema({
	greeting_audio:{type:String }, 
	user_id:{type:mongoose.Schema.ObjectId, ref:'User'},
	created:{type: Date, default : Date.now()}, //created Date
	modified:{type: Date, default : Date.now()} //modified Date
});

module.exports = mongoose.model('Greeting',greetingAudioSchema);