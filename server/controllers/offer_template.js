var config = require('../../config/constant.js'); // constants
var OfferTemplate= require('../models/offer_template');
var Offer = require('../models/offer');
var State = require('../models/state');
var fs = require('fs');
var formidable = require('formidable');


var isEmptyObject = function (obj) {
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
}

/* @function : saveCatVertInfo
 *  @author  : B2
 *  @created  : 14092015
 *  @modified :
 *  @purpose  : To store the vertical contract details
 */
var saveCatVertInfo = function (req, res, callback) {
	OfferTemplate.findOne({'_id': req.body.current_offer_id}, function (err, data) {
            if (err)
            {
                console.log(err);
                callback({'code': config.constant.CODES.notFound})
            }
            else{

                if (isEmptyObject(data)){
                    new OfferTemplate({
		                'user_id':req.body.user_id || req.user._id,
		                'vertical_category_details':req.body.vertical_category_details,// should be for LGN role id if admin create otherwise req.use.role_id._id
		                'created': new Date (),
		                'modified': new Date ()
		            }).save( function(err,data) {
		                    if(err)
		                    {
		                        if(err && err.code == 11000)
                                    callback({'code':config.constant.CODES.notFound,"message":config.constant.MESSAGES.alreadyExist})
                                else
                                  callback({'code':config.constant.CODES.notFound,"message":config.constant.MESSAGES.Error})
		                    }
		                    else
		                    {
		                    callback({'code':config.constant.CODES.OK,"message":config.constant.MESSAGES.saveSuccess,data: {offer_id : data._id}});
		                    }
		            });
                }
                else {
                     OfferTemplate.update({_id: data._id}, {$set: {
                            'vertical_category_details': req.body.vertical_category_details,
                            'modified': new Date()
                        }}, function (err, data) {
                        if (err)
                        {
                            console.log(err)
                            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                        }
                        else
                        {
                            callback({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.updateSuccess,data: {offer_id : req.body.current_offer_id}});
                        }
                    });
                }

            }
        })
}
exports.saveCatVertInfo = saveCatVertInfo;

/* @function : submitpayPerCallInfo
 *  @author  : B2
 *  @created  : 14092015
 *  @modified :
 *  @purpose  : To store the pay per call details
 */
var submitpayPerCallInfo = function (req, res, callback) {
	OfferTemplate.findOne({'_id': req.body.current_offer_id}, function (err, data) {
            if (err)
            {
                console.log(err);
                callback({'code': config.constant.CODES.notFound})
            }
            else{

                if (isEmptyObject(data)){
                    new OfferTemplate({
		                'user_id':req.body.user_id || req.user._id,
		                'pay_per_call':req.body.pay_per_call,// should be for LGN role id if admin create otherwise req.use.role_id._id
		                'created': new Date (),
		                'modified': new Date ()
		            }).save( function(err,data) {
		                    if(err)
		                    {
		                        console.log(err);
		                        callback({'code':config.constant.CODES.notFound,"message":config.constant.MESSAGES.Error})
		                    }
		                    else
		                    {
		                    callback({'code':config.constant.CODES.OK,"message":config.constant.MESSAGES.saveSuccess,data: {offer_id : data._id}});
		                    }
		            });
                }
                else {
                      OfferTemplate.update({_id: data._id}, {$set: {
                            'pay_per_call': req.body.pay_per_call,
                            'modified': new Date()
                        }}, function (err, data) {
                        if (err)
                        {
                            console.log(err)
                            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                        }
                        else
                        {
                            callback({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.updateSuccess});
                        }
                    });
                }

            }
        })
}
exports.submitpayPerCallInfo = submitpayPerCallInfo;

/* @function : savestateRestrictInfo
 *  @author  : B2
 *  @created  : 14092015
 *  @modified :
 *  @purpose  : To store the vertical contract details
 */
var savestateRestrictInfo = function (req, res, callback) {
	OfferTemplate.findOne({'_id': req.body.current_offer_id}, function (err, data) {
            if (err)
            {
                console.log(err);
                callback({'code': config.constant.CODES.notFound})
            }
            else{

                if (isEmptyObject(data)){
                    new OfferTemplate({
		                'user_id':req.body.user_id || req.user._id,
		                'state_restricted':req.body.state_restricted,// should be for LGN role id if admin create otherwise req.use.role_id._id
		                'created': new Date (),
		                'modified': new Date ()
		            }).save( function(err,data) {
		                    if(err)
		                    {
		                        console.log(err);
		                        callback({'code':config.constant.CODES.notFound,"message":config.constant.MESSAGES.Error})
		                    }
		                    else
		                    {
		                    callback({'code':config.constant.CODES.OK,"message":config.constant.MESSAGES.saveSuccess,data: {offer_id : data._id}});
		                    }
		            });
                }
                else {
                      OfferTemplate.update({_id: data._id}, {$set: {
                            'state_restricted': req.body.state_restricted,
                            'modified': new Date()
                        }}, function (err, data) {
                        if (err)
                        {
                            console.log(err)
                            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                        }
                        else
                        {
                            callback({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.updateSuccess});
                        }
                    });
                }

            }
        })

}
exports.savestateRestrictInfo = savestateRestrictInfo;

/* @function : saveDurationInfo
 *  @author  : B2
 *  @created  : 15092015
 *  @modified :
 *  @purpose  : To store the duration tab details
 */
var saveDurationInfo = function (req, res, callback) {
	OfferTemplate.findOne({'_id': req.body.current_offer_id}, function (err, data) {
            if (err)
            {
                console.log(err);
                callback({'code': config.constant.CODES.notFound})
            }
            else{

                if (isEmptyObject(data)){
                    new OfferTemplate({
		                'user_id':req.body.user_id || req.user._id,
		                'duration':req.body.duration,// should be for LGN role id if admin create otherwise req.use.role_id._id
		                'created': new Date (),
		                'modified': new Date ()
		            }).save( function(err,data) {
		                    if(err)
		                    {
		                        console.log(err);
		                        callback({'code':config.constant.CODES.notFound,"message":config.constant.MESSAGES.Error})
		                    }
		                    else
		                    {
		                    callback({'code':config.constant.CODES.OK,"message":config.constant.MESSAGES.saveSuccess,data: {offer_id : data._id}});
		                    }
		            });
                }
                else {
                      OfferTemplate.update({_id: data._id}, {$set: {
                            'duration': req.body.duration,
                            'modified': new Date()
                        }}, function (err, data) {
                        if (err)
                        {
                            console.log(err)
                            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                        }
                        else
                        {
                            callback({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.updateSuccess});
                        }
                    });
                }

            }
        })

}
exports.saveDurationInfo = saveDurationInfo;


/* @function : saveDailyCapInfo
 *  @author  : B2
 *  @created  : 15092015
 *  @modified :
 *  @purpose  : To store the daily cap tab details
 */
var saveDailyCapInfo = function (req, res, callback) {
    var form = new formidable.IncomingForm();
    form.uploadDir = "./public/assets/greeting_audio";       //set upload directory
    form.keepExtensions = true;     //keep file extension
    form.parse(req, function (err, fields, files)
    {
        var insertData = fields;
        if(!isEmptyObject(files)){
            console.log('U here')
            insertData.value = files.file.path;
        }

    OfferTemplate.findOne({'_id': fields.current_offer_id}, function (err, data) {
            if (err)
            {
                console.log(err);
                callback({'code': config.constant.CODES.notFound})
            }
            else{

                if (isEmptyObject(data)){
                    new OfferTemplate({
                        'user_id':req.body.user_id || req.user._id,
                        'daily_caps':insertData,// should be for LGN role id if admin create otherwise req.use.role_id._id
                        'created': new Date (),
                        'modified': new Date ()
                    }).save( function(err,data) {
                            if(err)
                            {
                                console.log(err);
                                callback({'code':config.constant.CODES.notFound,"message":config.constant.MESSAGES.Error})
                            }
                            else
                            {
                            callback({'code':config.constant.CODES.OK,"message":config.constant.MESSAGES.saveSuccess,data: {offer_id : data._id}});
                            }
                    });
                }
                else {

                    if(data && data.daily_caps && data.daily_caps.value && data.daily_caps.value != insertData.value)
                         fs.unlink(data.daily_caps.value, function (err) {
                                console.log('File deleted');

                            });
                      OfferTemplate.update({_id: data._id}, {$set: {
                            'daily_caps': insertData,
                            'process_status' : insertData.process_status || false,
                            'modified': new Date()
                        }}, function (err, data) {
                        if (err)
                        {
                            console.log(err)
                            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
                        }
                        else
                        {
                            callback({'code': config.constant.CODES.OK,"data" : insertData.value, "message": config.constant.MESSAGES.updateSuccess});
                        }
                    });
                }

            }
        })

    });


}
exports.saveDailyCapInfo = saveDailyCapInfo;

/* @function : listOfferTemplate
 *  @author  : B2
 *  @created  : 15092015
 *  @modified :
 *  @purpose  : To retrieves all offer templates
 */

var listOfferTemplate = function (req, res, callback) {
	OfferTemplate.find({'is_deleted': {'$ne': 'true'}}).populate('vertical_category_details.vertical_id').populate('vertical_category_details.category_id').exec(function (err, response) {
           if (err){
                console.log(err)
                callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
			}else{
			    callback({'code': config.constant.CODES.OK,'data' : response, "message": config.constant.MESSAGES.Success});
            }
    });


}
exports.listOfferTemplate = listOfferTemplate;

/* @function : getlistOfferTemplateByID
 *  @author  : B2
 *  @created  : 16092015
 *  @modified :
 *  @purpose  : To get details of offer template by ID
 */

var getlistOfferTemplateByID = function (req, res, callback) {

	OfferTemplate.findOne({'_id' : req.body._id,'is_deleted': {'$ne': 'true'}},function (err, response) {
           if (err){
                console.log(err)
                callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
			}else{
			    callback({'code': config.constant.CODES.OK,'data' : response, "message": config.constant.MESSAGES.Success});
            }
    });

}
exports.getlistOfferTemplateByID = getlistOfferTemplateByID;


/* @function : getlistOfferTemplateByID
 *  @author  : B2
 *  @created  : 16092015
 *  @modified :
 *  @purpose  : To get details of offer template by ID
 */

var getlistOfferTemplateByIDWhole = function (req, res, callback) {

    OfferTemplate.findOne({'_id' : req.body._id,'is_deleted': {'$ne': 'true'}}).populate('vertical_category_details.vertical_id').populate('vertical_category_details.category_id').exec(function (err, response) {
           if (err){
                console.log(err)
                callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
            }else{
                callback({'code': config.constant.CODES.OK,'data' : response, "message": config.constant.MESSAGES.Success});
            }
    });

}
exports.getlistOfferTemplateByIDWhole = getlistOfferTemplateByIDWhole;

/* @function : statusOfferTemplate
 *  @author  : B2
 *  @created  : 16092015
 *  @modified :
 *  @purpose  : To get details of offer template by ID
 */

var statusOfferTemplate = function (req, res, callback) {

	OfferTemplate.update({'_id' : req.body._id},{$set : {'active_status' : !req.body.active_status}},function (err, response) {
           if (err){
                console.log(err)
                callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
			}else{
				listOfferTemplate(req, res, function (response) {
                    callback({'code': config.constant.CODES.OK, "data": response.data, "message": config.constant.MESSAGES.statusSuccess});
                });
            }
    });

}
exports.statusOfferTemplate = statusOfferTemplate;


/* @function : deleteOfferTemplateByID
 *  @author  : B2
 *  @created  : 16092015
 *  @modified :
 *  @purpose  : To get details of offer template by ID
 */

var deleteOfferTemplateByID = function (req, res, callback) {

	OfferTemplate.update({'_id' : req.body._id},{$set : {'is_deleted' : true}},function (err, response) {
           if (err){
                console.log(err)
                callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
			}else{

			   listOfferTemplate(req, res, function (response) {
                    callback({'code': config.constant.CODES.OK, "data": response.data, "message": config.constant.MESSAGES.deleteSuccess});
                });

            }
    });

}
exports.deleteOfferTemplateByID = deleteOfferTemplateByID;