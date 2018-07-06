var webAffiliate = require('../controllers/webAffiliate.js'); // included controller for event calendar operations
var express = require('express');
var router = express.Router();

router.get('/getWebLeadsCampaignDetails', function(req, res, next) {
    webAffiliate.getWebLeadsCampaignDetails(req,res,function(response){
        res.json(response);
    });
});

module.exports = router;


