var lgUser = require('../controllers/lgUser.js'); // included controller for user operations
var express = require('express');
var router = express.Router();
 // route middleware to make sure a user is logged in (shivansh)
function isAuthenticatedRequest(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

// listUser
router.post('/listUser', isAuthenticatedRequest,function(req, res, next) {
    lgUser.listUser(req,res,function(response){
        res.json(response);
    });
});

//post request to update user data
router.post('/updateUserData',isAuthenticatedRequest, function(req, res, next) {
    lgUser.updateUserData(req,res,function(response){
    	res.json(response);
    });
});

// post request for change status of user
router.post('/updateStatus',isAuthenticatedRequest, function(req, res, next) {
    lgUser.updateStatus(req,res,function(response){
    	res.json(response);
    });
});

// post request for change status of user
router.post('/callHistoryByDate',isAuthenticatedRequest, function(req, res, next) {
    lgUser.callHistoryByDate(req,res,function(response){
    	res.json(response);
    });
});

// save or change note for call history
router.post('/saveNoteForCall', isAuthenticatedRequest,function(req, res, next) {
    lgUser.saveNoteForCall(req,res,function(response){
    	res.json(response);
    });
});

// save originalcaller
router.post('/SaveOrignalCaller', isAuthenticatedRequest,function(req, res, next) {
    lgUser.SaveOrignalCaller(req,res,function(response){
    	res.json(response);
    });
});

// save or change note for call history
router.post('/addDisaproveNote', isAuthenticatedRequest,function(req, res, next) {
    lgUser.addDisaproveNote(req,res,function(response){
        res.json(response);
    });
});

// post request for delete all user
    router.post('/deleteUser', isAuthenticatedRequest,function(req, res, next) {
        lgUser.deleteUser(req,res,function(response){
            res.json(response);
        });
    });

 module.exports = router;