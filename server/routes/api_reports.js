var express = require('express');
var router = express.Router();
var reports = require('../controllers/reports');

// route middleware to make sure a user is logged in (shivansh)
function isAuthenticatedRequest(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();
    // if they aren't redirect them to the home page
    res.redirect('/');
}

    // post request to get call history data by date
    router.post('/callHistoryByDate', isAuthenticatedRequest, function (req, res, next) {
        reports.callHistoryByDate(req,res,function(response){
            res.json(response);
        });
    });

    // post request to get Categories
    router.post('/getCallHistoryCategories', isAuthenticatedRequest, function (req, res, callback) {
        reports.getCallHistoryCategories(req, res, function (resp) {
            res.json({status: 200, resp: resp});
        });
    });

    // post request to get DashboardData for SAAS/ADMIN
    router.post('/getSAASDashboardData', isAuthenticatedRequest, function (req, res) {
        reports.getSAASDashboardData(req, res);
    });
    

    // post request to get DashboardData for SAAS/ADMIN
    router.get('/getLGTop5Categories', isAuthenticatedRequest, function (req, res) {
        reports.getLGTop5Categories(req, res, function(response){
            res.json(response);
        });
    });

    // retrieve calls list those are in progress
    router.get('/onGoingCalls', isAuthenticatedRequest, function (req, res, next) {
        reports.onGoingCalls(req,res,function(response){
            res.json(response);
        });
    });

module.exports = router;