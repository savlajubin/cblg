var express = require('express');
var router = express.Router();
var bCrypt = require('bcrypt-nodejs');
var Users = require('../models/user.js');   //To access user data

//To upadate/change password of a user
router.post('/updatePassword',function(req,res) { 
    var password = req.body.currentpassword;
    var new_pass = createHash(req.body.password);
     Users.findOne({'_id': req.body.user_id,'email' : req.body.loginemail}, function (err, founduser) {
         if (err) {
            res.json({'code': 404, "message": "Your token might be expire.Please go to previous tab & save your details again."});
        }
        if (isEmptyObject(founduser)) {
           res.json({'code': 404, "message": "Incorrect Username / Password.Please go to previous tab & save your details again."});
            
        } else if (!isValidPassword(founduser, password)){
            res.json({'code': 404, "message": "Incorrect Username / Password.Please go to previous tab & save your details again."});
        }

        else {
            // updating the user status (A : active)
            insertData = {password : new_pass }
            Users.update({_id: req.body.user_id}, {$set: insertData}, function (err) {
                if (err) {
                    console.log("System Error (SaveContactInfo) : " + err);
                    res.json({'code': 404, "message": "Error"})
                } else {
                    res.json({'code': 200, "message": "Password updated successfully!"});
                }
            });
        }
    });
 });

//encrypted password match
var isValidPassword = function(user, password){
    return bCrypt.compareSync(password, user.password);
}  

// Generates hashed value using bCrypt
var createHash = function(password){
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}
var isEmptyObject = function (obj) {
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
}


//To change the login credentials
router.post('/changeLoginCredentials',function(req,res) { 

    var new_pass = createHash(req.body.password);

     Users.findOne({'_id': req.body.user_id,'email' : req.body.loginemail}, function (err, founduser) {
        if (err) {
            res.json({'code': 404, "message": "Error occurs while updating credentials.Please try again."});
        }
        if (isEmptyObject(founduser)) {
           res.json({'code': 404, "message": "Incorrect Username / Password.Please go to previous tab & save your details again."});
            
        }
        else {
            // updating the user status (A : active)
            insertData = {password : new_pass }
            Users.update({_id: req.body.user_id}, {$set: insertData}, function (err) {
                if (err) {
                    console.log("System Error (SaveContactInfo) : " + err);
                    res.json({'code': 404, "message": "Error occurs while updating credentials.Please try again."})
                } else {
                    res.json({'code': 200, "message": "Password updated successfully!"});
                }
            });
        }
    });
 });


module.exports = router;

