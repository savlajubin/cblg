var mongoose = require('mongoose');

var statesSchema = new mongoose.Schema({
    name_long: {type: String},
    name_short: {type: String}
});

module.exports = mongoose.model('state', statesSchema);