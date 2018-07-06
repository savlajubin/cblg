var config = require('../../config/constant.js'); // constants
var userProfile_model = require('../models/user_profile.js');

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

/* @function : whitelabelsettings
 *  @created  : 19092015
 *  @modified :
 *  @purpose  : To find the user company set up data based on white label requests
 */
var whitelabelsettings = function (req, res) {
    userProfile_model.findOne({'lgn_setup_details.domain_url': req.headers.host}, {lgn_setup_details: 1}).exec(function (err, setupData) {
        if (err) {
            console.log("System Error (setupData) : " + err);
            res.json({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
        } else {
            console.log("setupData details found");
            res.json({'code': config.constant.CODES.OK, "data": setupData, "message": config.constant.MESSAGES.Success});
        }
    });

}
exports.whitelabelsettings = whitelabelsettings;

/* @function : send_whitelabel_request
 *  @created  : 21092015
 *  @modified :
 *  @purpose  : Send the request to admin for setup whitelabel
 */
var send_whitelabel_request = function (req, res) {


}
exports.send_whitelabel_request = send_whitelabel_request;

/* @function : iswhitelabeled
 *  @created  : 09112015
 *  @modified :
 *  @purpose  : To get detatis wheather current website is whitelabeled or not?
 */
var iswhitelabeled = function (req, res) {
    var domains = req.headers.host.split('.');
    userProfile_model.count({'lgn_setup_details.domain_url': req.headers.host}).exec(function (err, setupData) {
        if (err) {
            console.log("System Error (setupData) : " + err);
            res.json({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
        } else {
            if (setupData)
                res.json({'code': config.constant.CODES.OK, "data": setupData, "message": config.constant.MESSAGES.Success});
            else
                res.json({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.notFound});
        }
    });

}
exports.iswhitelabeled = iswhitelabeled;
