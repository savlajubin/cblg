/* Area code schema to determins the state based on the areacode */

var mongoose = require('mongoose');

var DBSchema = new mongoose.Schema({
    user_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    name: {type: String},
    house_prompt: {type: Boolean},
    type: {type: String}, //text="Text to Speech" and audio="Audio File"
    text: {type: String}, // Required if type=text
    voice: {type: String}, //will consist 'male' or 'female' Required if type=text
    repeat: {type: Number}, // Required if type=text and type=audio
    file_name: {type: String}, // Required type=audio
    file_path: {type: String}, // Required type=audio
    isdeleted: {type: Boolean, default: false}, // delete status
    created: {type: Date, default: Date.now()}, //created Date
    modified: {type: Date, default: Date.now()} //modified Date
});

module.exports = mongoose.model('Prompt', DBSchema);
