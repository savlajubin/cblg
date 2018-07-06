/* Schema For email_templates Table */

var mongoose = require('mongoose');

var emailTemplateSchema = new mongoose.Schema({
    template_name: {type: String},
    template: {type: String},
    status: {type: Boolean, default: "true"},
    is_deleted:{type: Boolean, default: false },
    user_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, //User Who created this entry
    created: {type: "Date", default: Date.now()},
   
});

module.exports = mongoose.model('emailTemplate', emailTemplateSchema);