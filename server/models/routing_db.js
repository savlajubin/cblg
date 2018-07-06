/*To Deal routing numbers added by user*/
var mongoose = require('mongoose');

var routing_numberSchema = new mongoose.Schema({
    routing_no: {type: Number},
    bank_name: {type: String},
    bank_address: {type: String},
    bank_city: {type: String},
    bank_state: {type: String},
    bank_zip: {type: Number},
    bank_phone: {type:Number }
});

module.exports = mongoose.model('routing_number', routing_numberSchema);
