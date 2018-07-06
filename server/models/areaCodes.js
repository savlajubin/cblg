/* Area code schema to determins the state based on the areacode */

var mongoose = require('mongoose');

var DBSchema = new mongoose.Schema({
    AreaCode: {type: String},
    State: {type: String}
});

module.exports = mongoose.model('areaCode', DBSchema);
