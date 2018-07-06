var config = require('../../config/constant.js'); // constants
var Users = require('../models/user.js');
var routingDB = require('../models/routing_db.js');
var callModel = require('../models/callHistories');
var async = require('async');
var _ = require('underscore');
var mongoose = require('mongoose'); // Added to convert string to ObjectId

/* @function    : isEmptyObject
 *  @Creator    : smartData
 *  @created    : 28092015
 */

var isEmptyObject = function (obj) {
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
}

/* @function    : getCallHistoryCategories
 *  @Creator    : smartData
 *  @created    : 05102015
 *  @purpose    :To get all Categories from callhistory
 */
exports.getCallHistoryCategories = function (req, res, callback) {
    var user_id = req.user._id;
    //callModel.find({ $and:[{'campaignData.offer_id.user_id':user_id},{'isdeleted': {'$ne':true}}, {'campaignData.offer_id.vertical_category_details.category_name': {'$ne':null}} ]},{'campaignData.offer_id.vertical_category_details.category_name':1},function (err, foundData) {
    callModel.find({$and: [{'isdeleted': {'$ne': true}}, {'campaignData.offer_id.vertical_category_details.category_name': {'$ne': null}}]}, {'campaignData.offer_id.vertical_category_details.category_name': 1}, function (err, foundData) {
        if (err) {
            console.log(err);
        } else {
            var catData_groups = _.groupBy(foundData, function (value) {
                return value.campaignData.offer_id.vertical_category_details.category_name;
            });
            var catData = [];
            Object.keys(catData_groups).forEach(function (key) {
                if (key && key != 'undefined') {
                    catData.push({Category: key})
                }
            });
            return callback(catData);
        }
    });
};

/* @function    : callHistoryByDate
 *  @created    : 15092015
 *  @modified   :
 *  @purpose    : list call History By Date
 */
var callHistoryByDate = function (req, res, callback) {
    // Date function data
    var user_id = mongoose.Types.ObjectId(req.user._id); // converted User id from String to ObjectId
    var FromDate = req.body.FromDate;
    var ToDate = req.body.ToDate;
    var FromToDate = {'$gte': FromDate, '$lte': ToDate};
    var cond = {'isdeleted': {'$ne': true}, created: FromToDate};

    //Conditions to check the User specific Records
    switch (req.user.role_id.code) {
        case 'LB':
            //cond['campaignData.offer_id.user_id'] = user_id;
            cond['$or'] = [
                {'campaignData.offer_id.user_id': user_id},
                {'campaignData.created_by': user_id}
            ];
            break;
        case 'LG':
            cond['campaignData.created_by'] = user_id;
//            cond['$or'] = [
//                {'campaignData.offer_id.user_id':user_id},
//                {'campaignData.created_by':user_id}
//            ];
            break;
        case 'LGN':
            cond['campaignData.offer_id.parent_lgn'] = user_id;
            break;
        case 'ADVCC':
            cond['$or'] = [
                {'campaignData.offer_id.user_id': user_id},
                {'campaignData.created_by': user_id}
            ];
            break;
    }

    if (req.body.categoryName) {
        var CatName = req.body.categoryName;
        cond['campaignData.offer_id.vertical_category_details.category_name'] = CatName;
    }

    console.log('cond', cond)

    callModel.find(cond, function (err, foundData) {
        if (err) {
            console.log('err', err);
        } else {

            console.log('foundData', foundData)

            //used to get category data with unique count for graph Start
            var catDataGroups = _.groupBy(foundData, function (catValue) {
                if (catValue.campaignData) {
                    if (catValue.campaignData.offer_id) {
                        var valCat = catValue.campaignData.offer_id.vertical_category_details;
                        if (valCat) {
                            return catValue.campaignData.offer_id.vertical_category_details.category_name;
                        }
                    }
                }
            });
            var catDataByDate = [];
            Object.keys(catDataGroups).forEach(function (key) {
                if (key && key != 'undefined') {
                    catDataByDate.push({Category: key, count: catDataGroups[key].length})
                }
            });
            //used to get category data with unique count for graph End
            callback({code: 200, callListData: foundData, CategoryGraphData: catDataByDate});
        }
    });
};

exports.callHistoryByDate = callHistoryByDate;


/* @function    : getSAASDashboardData
 *  @Creator    : smartData
 *  @created    : 27102015
 *  @purpose    : To get DashboardData for SAAS/ADMIN Dashboard
 */
var getSAASDashboardData = function (req, res) {

    var accessControl = {};

    async.parallel({
        top10moneymaker: function (callback) {
            callModel.aggregate(
                    [
                        {$project: {_id: 1, is_billable: 1, created: 1, 'campaignData.created_by': 1, 'campaignData.offer_id.vertical_category_details.category_name': 1, 'campaignData.offer_id.pay_per_call.lgamount': 1}},
                        {$match: {$or: [{is_billable: true}, {isdeleted: false}]}},
                        {$group: {_id: '$campaignData.created_by', "lgamountSum": {$sum: "$campaignData.offer_id.pay_per_call.lgamount"}, 'categories': {$addToSet: "$campaignData.offer_id.vertical_category_details.category_name"}}},
                        {$sort: {lgamountSum: -1}},
                        {$limit: 10}
                    ], function (err, result) {

                if (err) {
                    console.log(err);
                    callback(err);
                } else if (isEmptyObject(result)) {
                    callback(null, result);
                } else {
                    var userCallDetails = [];

                    _.forEach(result, function (callDetails, index) {
                        // var cat = callDetails.categories.toString();
                        var cat = callDetails.categories;
                        userCallDetails[index] = {
                            lgUid: callDetails._id,
                            lgamount: callDetails.lgamountSum,
                            category: cat
                        };
                        Users.findOne({'_id': callDetails._id}, {_id: 1, first_name: 1, last_name: 1, email: 1}).exec(function (err, users) {
                            if (err) {
                                console.log(err);
                                callback(err);
                            } else {
                                if (isEmptyObject(users) && index + 1 == result.length) {
                                    callback(null, userCallDetails);
                                } else {
                                    userCallDetails[index]['first_name'] = users.first_name;
                                    userCallDetails[index]['last_name'] = users.last_name;
                                    userCallDetails[index]['email'] = users.email;
                                    if (index + 1 == result.length) {
                                        //accessControl = userCallDetails;
                                        //callback(null, accessControl);
                                        callback(null, userCallDetails);
                                    }
                                }
                            }
                        });
                    });
                }
            });
        },
        top10buyers: function (callback) {
            callModel.aggregate(
                    [
                        {$project: {_id: 1, is_billable: 1, created: 1, 'campaignData.offer_id.user_id': 1, 'campaignData.offer_id.vertical_category_details.category_name': 1, 'campaignData.offer_id.pay_per_call.lbamount': 1}},
                        {$match: {$or: [{is_billable: true}, {isdeleted: false}]}},
                        {$group: {_id: '$campaignData.offer_id.user_id', "lbamountSum": {$sum: "$campaignData.offer_id.pay_per_call.lbamount"}, 'categories': {$addToSet: "$campaignData.offer_id.vertical_category_details.category_name"}}},
                        {$sort: {lbamountSum: -1}},
                        {$limit: 10}
                    ], function (err, result) {


                if (err) {
                    console.log(err);
                    callback(err);
                } else if (isEmptyObject(result)) {
                    callback(null, result);
                } else {
                    var userCallDetails = [];

                    _.forEach(result, function (callDetails, index) {
                        var cat = callDetails.categories;
                        userCallDetails[index] = {
                            lgUid: callDetails._id,
                            lbamount: callDetails.lbamountSum,
                            category: cat
                        };
                        Users.findOne({'_id': callDetails._id}, {_id: 1, first_name: 1, last_name: 1, email: 1}).exec(function (err, users) {
                            if (err) {
                                console.log(err);
                                callback(err);
                            } else {
                                if (isEmptyObject(users)) {
                                    if (index + 1 == result.length) {
                                        callback(null, userCallDetails);
                                    }
                                } else {
                                    userCallDetails[index]['first_name'] = users.first_name;
                                    userCallDetails[index]['last_name'] = users.last_name;
                                    userCallDetails[index]['email'] = users.email;
                                    if (index + 1 == result.length) {
                                        //accessControl = userCallDetails;
                                        //callback(null, accessControl);
                                        callback(null, userCallDetails);
                                    }
                                }
                            }
                        });
                    });
                }
            });
        },
        top10Networks: function (callback) {
            callModel.aggregate(
                    [
                        {$project: {_id: 1, is_billable: 1, created: 1, 'campaignData.offer_id.user_id': 1, 'campaignData.offer_id.vertical_category_details.category_name': 1, 'campaignData.offer_id.pay_per_call.lgnamount': 1}},
                        {$match: {$or: [{is_billable: true}, {isdeleted: false}]}},
                        {$group: {_id: '$campaignData.offer_id.user_id', "lgnamountSum": {$sum: "$campaignData.offer_id.pay_per_call.lgnamount"}, 'categories': {$addToSet: "$campaignData.offer_id.vertical_category_details.category_name"}}},
                        {$sort: {lgnamountSum: -1}},
                        {$limit: 10}
                    ], function (err, result) {


                if (err) {
                    console.log(err);
                    callback(err);
                } else if (isEmptyObject(result)) {
                    callback(null, result);
                } else {
                    var userCallDetails = [];

                    _.forEach(result, function (callDetails, index) {
                        var cat = callDetails.categories;
                        userCallDetails[index] = {
                            lgUid: callDetails._id,
                            lgnamount: callDetails.lgnamountSum,
                            category: cat
                        };
                        Users.findOne({'_id': callDetails._id}, {_id: 1, first_name: 1, last_name: 1, email: 1}).exec(function (err, users) {
                            if (err) {
                                console.log(err);
                                callback(err);
                            } else {
                                if (isEmptyObject(users)) {
                                    if (index + 1 == result.length) {
                                        callback(null, userCallDetails);
                                    }
                                } else {
                                    userCallDetails[index]['first_name'] = users.first_name;
                                    userCallDetails[index]['last_name'] = users.last_name;
                                    userCallDetails[index]['email'] = users.email;
                                    if (index + 1 == result.length) {
                                        //accessControl = userCallDetails;
                                        //callback(null, accessControl);
                                        callback(null, userCallDetails);
                                    }
                                }
                            }
                        });
                    });
                }
            });
        },
        top10Categories: function (callback) {
            callModel.aggregate(
                    [
                        {$project: {_id: 1, is_billable: 1, created: 1, 'campaignData.offer_id.user_id': 1, 'campaignData.offer_id.vertical_category_details.category_name': 1, 'campaignData.offer_id.pay_per_call.lgamount': 1}},
                        {$match: {$or: [{is_billable: true}, {isdeleted: false}]}},
                        {$group: {_id: '$campaignData.offer_id.vertical_category_details.category_name', "lgCatAmountSum": {$sum: "$campaignData.offer_id.pay_per_call.lgamount"}}},
                        {$sort: {lgCatAmountSum: -1}},
                        {$limit: 10}
                    ], function (err, result) {


                if (err) {
                    console.log(err);
                    callback(err);
                } else if (isEmptyObject(result)) {
                    callback(null, result);
                } else {
                    var userCallDetails = [];

                    _.forEach(result, function (callDetails, index) {
                        userCallDetails[index] = {
                            category: callDetails._id,
                            lgCatAmountSum: callDetails.lgCatAmountSum,
                        };
                        if (index + 1 == result.length) {
                            //accessControl = userCallDetails;
                            //callback(null, accessControl);
                            callback(null, userCallDetails);
                        }
                    });
                }
            });
        }
    }, function (err, result) {
        if (err) {
            console.log(err);
            res.json({"code": 401, 'msg': 'Error Occured'});
        } else {
            res.json({"code": 200, 'result': result});
        }
    });
};
module.exports.getSAASDashboardData = getSAASDashboardData;

/* @function    : onGoingCalls
 *  @Creator    : B2
 *  @created    : 02121015
 *  @purpose    :To retrieve calls list those are in progress
 */
exports.onGoingCalls = function (req, res, callback) {
    callModel.findOne({'EndTime': {$exists: false}}, function (err, foundData) {
        if (err) {
            callback({'code': 404, "message": "Error"});
        } else {
            callback({'code': 200, "data": foundData, "message": "Calls found successfully"});
        }
    });
};

/* @function    : getLGTop5Categories
 *  @Creator    : B2
 *  @created    : 02121015
 *  @purpose    :To retrieve LG Top 5 Categories
 */
exports.getLGTop5Categories = function (req, res, callback) {
    callModel.aggregate(
            [
                {$project: {_id: 1, is_billable: 1, created: 1, 'campaignData.offer_id.user_id': 1, 'campaignData.offer_id.vertical_category_details.category_name': 1, 'campaignData.offer_id.pay_per_call.lgamount': 1}},
                {$match: {'campaignData.created_by': req.user._id, $or: [{is_billable: true}, {isdeleted: false}]}},
                {$group: {_id: '$campaignData.offer_id.vertical_category_details.category_name', "lgCatAmountSum": {$sum: "$campaignData.offer_id.pay_per_call.lgamount"}}},
                {$sort: {lgCatAmountSum: -1}},
                {$limit: 5}
            ], function (err, result) {


        if (err) {
            console.log(err);
            callback({'code': config.constant.CODES.notFound, "message": "Error"});
        } else if (isEmptyObject(result)) {
            callback({'code': config.constant.CODES.OK, "data": result, "message": "Error1"});
        } else {
            var userCallDetails = [];

            _.forEach(result, function (callDetails, index) {
                userCallDetails[index] = {
                    category: callDetails._id,
                    lgCatAmountSum: callDetails.lgCatAmountSum,
                };
                if (index + 1 == result.length) {
                    callback({'code': config.constant.CODES.OK, "data": userCallDetails, "message": "Error2"});
                }
            });
        }
    });
};
