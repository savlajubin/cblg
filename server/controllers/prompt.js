var config = require('../../config/constant.js'); // constants
var prompt_model = require('../models/prompt.js');
var formidable = require('formidable');


/* @function : addPrompt
 *  @created  : 09102015
 *  @modified :
 *  @purpose  : Saving the new prompt uploaded by user
 */
var addPrompt = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.uploadDir = "./public/assets/prompts"; //set upload directory
    form.keepExtensions = true; //keep file extension

    form.parse(req, function (err, fields, files) {
        fields.user_id = req.session.passport.user._id;
        fields.house_prompt = false;

        if(fields.type=='audio'){
            console.log(files);
            console.log(files.file.name);
            console.log(files.file.path);
            fields.file_name = files.file.name;
            fields.file_path = files.file.path.replace('public/', '/');
        }

        prompt_model(fields).save(function (err, prompt) {
            if (err) {
                return next({"code": config.constant.CODES.Error, "message": config.constant.MESSAGES.Error});
            }
            return next({"code": config.constant.CODES.OK, "data": prompt, "message": config.constant.MESSAGES.saveSuccess});
        });
    });
}
module.exports.addPrompt = addPrompt;


/* @function : listPrompt
 *  @created  : 09102015
 *  @modified :
 *  @purpose  : Listing all the prompts saved
 */
var listPrompt = function (req, res, next) {
    prompt_model.find({'isdeleted': false}, function (err, data) {
        if (err) {
            return next({"code": config.constant.CODES.Error, "message": config.constant.MESSAGES.Error});
        }
        return next({"code": config.constant.CODES.OK, "data": data});
    });
}
module.exports.listPrompt = listPrompt;


/* @function : deletePrompt
 *  @created  : 09102015
 *  @modified :
 *  @purpose  : Deletes a Prompt
 */
var deletePrompt = function (req, res, next) {
    prompt_model.where('_id',req.body.id).update({'isdeleted': true}, function (err, data) {
        if (err) {
            return next({"code": config.constant.CODES.Error, "message": config.constant.MESSAGES.Error});
        }
        return next({"code": config.constant.CODES.OK});
    });
}
module.exports.deletePrompt = deletePrompt;