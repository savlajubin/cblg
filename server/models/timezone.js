/* Area code schema to determins the state based on the areacode */

var mongoose = require('mongoose');

var DBSchema = new mongoose.Schema({
    value: {type: Number},
    name: {type: String},
});

module.exports = mongoose.model('timezone', DBSchema);
