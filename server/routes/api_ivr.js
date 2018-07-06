var ivr = require('../controllers/ivr.js');
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

//To save ivr-config data
router.post('/submitIVRdata', isAuthenticatedRequest, function(req, res, next) {
    ivr.submitIVRdata(req,res,function(response){
    	res.json(response);
    });
});

//list all ivr of user
router.get('/listIvr', isAuthenticatedRequest, function(req, res, next) {
    ivr.listIvr(req,res,function(response){
    	res.json(response);
    });
});

//get ivr details by id
router.post('/getIvrById', isAuthenticatedRequest, function(req, res, next) {
    ivr.getIvrById(req,res,function(response){
        res.json(response);
    });
});

//delete ivr
router.post('/deleteIvr', isAuthenticatedRequest, function(req, res, next) {
    ivr.deleteIvr(req,res,function(response){
    	res.json(response);
    });
});


router.post('/changeIvrStatus', isAuthenticatedRequest, function(req, res, next) {
    ivr.changeIvrStatus(req,res,function(response){
    	res.json(response);
    });
});

//To assign Phone number To Ivr
router.post('/assignPhnoToIvr', isAuthenticatedRequest, function(req, res, next) {
    ivr.assignPhnoToIvr(req,res,function(response){
        res.json(response);
    });
});

//ADVCC save Inbound Trunk
router.post('/submitInboundTrunk', isAuthenticatedRequest, function(req, res, next) {
    ivr.submitInboundTrunk(req,res,function(response){
        res.json(response);
    });
});
 module.exports = router;