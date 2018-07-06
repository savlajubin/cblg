var mongoose = require('mongoose');

var AgentSchema = new mongoose.Schema({
    agent_id:{type: mongoose.Schema.Types.ObjectId, ref:'User', required: true}, // reference of user's table to identified associated PA's
});

var DBSchema = new mongoose.Schema({
    queue_name: {type: String},
    created_by:{type: mongoose.Schema.Types.ObjectId, ref:'User', required: true}, // reference of user's table to identified who created this queue and will accessable for only them
    associated_agents: [AgentSchema] // all the associated PA reference ids
});

module.exports = mongoose.model('queues', DBSchema);
