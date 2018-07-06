var mongoose = require('mongoose');


var agentScriptSchema = new mongoose.Schema({
    component: {type: String},
    editable: {type: Boolean},
    index: {type: Number},
    label: {type: String},
    description: {type: String},
    placeholder: {type: String},
    optionsArr: [],
    required: {type: Boolean},
    validation: {type: String}, // /.*/,
    firstNameLabel: {type: String},
    lastNameLabel: {type: String},
    addressOneLabel: {type: String},
    addressTwoLabel: {type: String},
    cityLabel: {type: String},
    stateLabel: {type: String},
    zipCodeLabel: {type: String}
});

var agentFaqSchema = new mongoose.Schema({
    que: {type: String},
    ans: {type: String}
});


var agentScriptSchema = new mongoose.Schema({
    script_name: {type: String, default: 'Unnamed Script'},
    created_by: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}, // reference of user's table to identified who created this queue and will accessable for only them
    scriptData: [agentScriptSchema],
    faqData: [agentFaqSchema],
    script_type: {type: String, default: 'agent_script'}, //possible values: agent_script, calendar_script
    status: {type: Boolean, default: true},
    is_deleted: {type: Boolean, default: false}
});

module.exports = mongoose.model('agentScript', agentScriptSchema);
