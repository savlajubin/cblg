/* Schema For documents Table */

var mongoose = require('mongoose');


//sub Schema for file details
var fileSchema = new mongoose.Schema({
    file_name: {type: String},
    path: {type: String}
});

//Main Schema - documents
var documentsSchema = new mongoose.Schema({
    user_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, //document belongs to which User
    'name': {type: String},
    'description': {type: String},
    'lead_id': {type: mongoose.Schema.ObjectId, ref: 'callerDetail'},
    files: [fileSchema],
    created: {type: "Date", default: Date.now()},
    modified: {type: "Date", default: Date.now()},
    is_deleted: {type: Boolean, default: false}
});

module.exports = mongoose.model('Document', documentsSchema);