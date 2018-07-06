/*To deal with zipcode (with all adddress details)*/
var mongoose = require('mongoose');

var zipCodeSchema = new mongoose.Schema({
    ZipCode: {type: String},
    City: {type: String},
    State: {type: String},
    StateName: {type: String},
    County: {type: String},
    AreaCode: {type: Number},
    CityType: {type: String},
    CityAliasAbbreviation: {type: String},
    CityAliasName: {type: String},
    Latitude: {type: String},
    Longitude: {type: String},
    TimeZone: {type: Number},
    Elevation: {type: Number},
    CountyFIPS: {type: Number},
    DayLightSaving: {type: String},
    PreferredLastLineKey: {type: String},
    ClassificationCode: {type: String},
    MultiCounty: {type: String},
    StateFIPS: {type: Number},
    CityStateKey: {type: String},
    CityAliasCode: {type: String},
    PrimaryRecord: {type: String},
    CityMixedCase: {type: String},
    CityAliasMixedCase: {type: String},
    StateANSI: {type: Number},
    CountyANSI: {type: String},
    FacilityCode: {type: String},
    CityDeliveryIndicator: {type: String},
    CarrierRouteRateSortation: {type: String},
    FinanceNumber: {type: Number},
    UniqueZIPName: {type: String}
});

module.exports = mongoose.model('zipCode', zipCodeSchema);