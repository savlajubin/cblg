//To Modeling Modules Collection data
var mongoose = require('mongoose');
var moduleAccessSchema = new mongoose.Schema({
    module_name: {type: String, required: true},
    description: {type: String},
    status: {type: Boolean},
    isdeleted: {type: Boolean, default: false},
    created: {type: Date, default: Date.now()}, //created Date
    modified: {type: Date, default: Date.now()}, //modified Date
    testFun: {type: Date}

})

module.exports = mongoose.model('Module', moduleAccessSchema);