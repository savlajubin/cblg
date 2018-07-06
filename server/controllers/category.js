var config = require('../../config/constant.js'); // constants
var Category = require('../models/category'); //To deal with category collection data
var OfferTemplate = require('../models/offer_template');

/* @function : isEmptyObject 
 *  @Creator  : shivansh
 *  @created  : 09072015
 */

var isEmptyObject = function (obj) {
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
}

/* @function : addCategory 
 *  @created  : 09072015
 *  @modified : 
 *  @purpose  : Add category in the system 
 */
var addCategory = function (req, res, done) {
    var newCategory = new Category();
    newCategory.category_name = req.body.name;
    newCategory.category_description = req.body.description;
    newCategory.category_status = req.body.status;
    newCategory.vertical_id = req.body.vertical_id;
    newCategory.parent_id = req.body.parent_id || null;
    newCategory.created_by = req.user._id;//"559fd9da1c723c4a41c60cb1";   // logged in user id // TO DO (req.user._id)

    // save the category
    newCategory.save(function (err) {
        if (err) {
            console.log("System Error (addCategory) " + err);
            return done({"code": config.constant.CODES.Unauthorized, "data": false, "message": config.constant.MESSAGES.Error});
        }
        return done({"code": config.constant.CODES.OK, "data": newCategory, "message": config.constant.MESSAGES.saveSuccess});
    });
}

module.exports.addCategory = addCategory;


/* @function : editCategory 
 *  @created  : 11072015
 *  @modified : 
 *  @purpose  : edit module in the system
 */
var editCategory = function (req, res, callback) {

    var updateData = {
        'category_name': req.body.name,
        'category_description': req.body.description,
        'category_status': req.body.status,
        'vertical_id': req.body.vertical_id,
        'parent_id': req.body.parent_id || null,
        'modified': Date.now()
    }
    var category_id = req.body._id;
    Category.update({_id: category_id}, {$set: updateData}, function (err) {
        if (err) {
            console.log("System Error (editCategory) : " + err);
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
        } else {
            callback({'code': config.constant.CODES.OK, "message": config.constant.MESSAGES.updateSuccess});
        }
    });
}

module.exports.editCategory = editCategory;


/* @function : statusCategory 
 *  @created  : 11072015
 *  @modified : 
 *  @purpose  : change status of module in the system  (true,false)
 */
var statusCategory = function (req, res, callback) {

    var category_id = req.body.category_id;
    var updateData = {
        'category_status': (req.body.status) ? 'false' : 'true',
        'modified': Date.now()
    }

    Category.update({_id: category_id}, {$set: updateData}, function (err) {
        if (err) {
            console.log("System Error (Category Status) : " + err);
            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
        } else {
            listCategory(req, res, function (response) {
                callback({'code': config.constant.CODES.OK, "data": response.data, "message": config.constant.MESSAGES.statusSuccess});
            });
        }
    });
}

module.exports.statusCategory = statusCategory;


/* @function : findCategory 
 *  @created  : 11072015
 *  @modified : 
 *  @purpose  : find category in the system
 */
var findCategory = function (req, res, callback) {
    Category.findOne({'_id': req.params.id, 'isdeleted': false}).populate('parent_id').populate('vertical_id').exec(function (err, category) {
        if (err) {
            console.log("System Error (findCategory) : " + err);
            callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.Error});
        } else {
            if (isEmptyObject(category)) {
                callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.notFound});
            } else {
                callback({'code': config.constant.CODES.OK, "data": category, "message": config.constant.MESSAGES.Success});
            }
        }
    });
}

module.exports.findCategory = findCategory;

/* @function : findCategoryByVertical 
 *  @created  : 11072015
 *  @modified : 
 *  @purpose  : find category in the system
 */
var findCategoryByVertical = function (req, res, callback) {
    Category.find({'vertical_id': req.params.id, 'isdeleted': false, 'parent_id': null}).exec(function (err, category) {
        if (err) {
            console.log("System Error (findCategoryByVertical) : " + err);
            callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.Error});
        } else {
            if (isEmptyObject(category)) {
                callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.notFound});
            } else {
                callback({'code': config.constant.CODES.OK, "data": category, "message": config.constant.MESSAGES.Success});
            }
        }
    });
}

module.exports.findCategoryByVertical = findCategoryByVertical;


/* @function : listCategory 
 *  @created  : 11072015
 *  @modified : 
 *  @purpose  : list category in the system (admin)
 */
var listCategory = function (req, res, callback) {
    Category.find({'isdeleted': false, 'parent_id': null}).populate('vertical_id').exec(function (err, category) {
        if (err) {
            console.log("System Error (listCategory) : " + err);
            callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.Error});
        } else {

            if (isEmptyObject(category)) {
                callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.notFound});
            } else {
                callback({'code': config.constant.CODES.OK, "data": category, "message": config.constant.MESSAGES.Success});
            }
        }
    });
}

module.exports.listCategory = listCategory;

/* @function : listCategoryByUser 
 *  @created  : 11072015
 *  @modified : 
 *  @purpose  : list category as per user in the system
 */
var listCategoryByUser = function (req, res, callback) {

    var user_id = '559fd9da1c723c4a41c60cb1'; // TODO req.params.id

    Category.find({'isdeleted': false, 'created_by': user_id, 'parent_id': null}).populate('vertical_id').exec(function (err, category) {
        if (err) {
            console.log("System Error (listCategory) : " + err);
            callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.Error});
        } else {
            if (isEmptyObject(category)) {
                callback({'code': config.constant.CODES.notFound, "data": '', "message": config.constant.MESSAGES.notFound});
            } else {
                callback({'code': config.constant.CODES.OK, "data": category, "message": config.constant.MESSAGES.Success});
            }
        }
    });
}

module.exports.listCategoryByUser = listCategoryByUser;

/* @function : deleteCategory 
 *  @created  : 11072015
 *  @modified : 
 *  @purpose  : delete the category from the system  (true,false)
 */

var deleteCategory = function (req, res, callback) {
    var collection_categoryArr = req.body.category_ids; //[{id:'559b72302b8723dfd1e94db3'}]; 
    var coll_length = collection_categoryArr.length;
    OfferTemplate.find({"vertical_category_details.category_id": collection_categoryArr[0].id, "is_deleted": false}, function (err, response) {
        if (err) {
            console.log("error:" + err);
            callback({'code': config.constant.CODES.notFound, "data": null, "message": config.constant.MESSAGES.Error});
        } else {
            if (isEmptyObject(response)) {
                collection_categoryArr.forEach(function (category_id) {
                    Category.update({_id: category_id.id}, {$set: {'isdeleted': true, 'modified': Date.now()}}, function (err) {
                        if (err) {
                            console.log("System Error (deleteCategory) : " + err);
                            callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error});
                        } else {
                            coll_length--;
                            if (coll_length == 0) {
                                listCategory(req, res, function (response) {
                                    callback({'code': config.constant.CODES.OK, "data": response.data, "message": config.constant.MESSAGES.deleteSuccess});
                                });
                            }
                        }
                    });
                });
            } else {
                callback({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.categoryAlreadyExist});
            }
        }
    });
}
module.exports.deleteCategory = deleteCategory;
