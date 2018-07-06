var prompt = require('../controllers/prompt.js'); // included controller for user operations
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

// post request for add Prompt
router.post('/addprompt', isAuthenticatedRequest, function (req, res, next) {
    prompt.addPrompt(req, res, function (response) {
        res.json(response);
    });
});
// post request for find all Prompts
router.get('/listprompt', isAuthenticatedRequest, function (req, res, next) {
    prompt.listPrompt(req, res, function (response) {
        res.json(response);
    });
});

// post request for delete Prompt
router.post('/deletePrompt', isAuthenticatedRequest, function (req, res, next) {
    prompt.deletePrompt(req, res, function (response) {
        res.json(response);
    });
});

module.exports = router;


