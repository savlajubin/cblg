/* Area code schema to determins the state based on the areacode */

var mongoose = require('mongoose');

var DBSchema = new mongoose.Schema({
    user_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    contact_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Contact'},
    api_id: {type: String},
    message_uuid: {type: String},
    from: {type: String},
    to: {type: String},
    text: {type: String},
    mode: {type: String},
    description: {type: String},
    status: {type: String},
    sent_time: {type: Date},
    timezone: {type: String},
    error_msg:{type:String}, 
    subject:{type:String}, 
    isWebLead:{type:Boolean, default:false},
    list_id: {type: mongoose.Schema.Types.ObjectId, ref: 'ContactList'},
    agenda_id: {type: mongoose.Schema.Types.ObjectId, ref: 'ContactAgenda'},
    isdeleted: {type: Boolean, default: false}, // delete status
    created: {type: Date, default: Date.now()}, //created Date
    modified: {type: Date, default: Date.now()} //modified Date
});

module.exports = mongoose.model('MessageHistory', DBSchema);
