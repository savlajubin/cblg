var express = require('express');
var router = express.Router();
var campaigns = require('../controllers/campaign');   //To manage camapaign operations
/*=======================  Campaign management system =============================*/

// post request for add campaign
router.post('/addCampaign', function (req, res, next) {
    campaigns.addCampaign(req, res, function (response) {
        res.json(response);
    });
});

// post request for edit campaign
router.post('/editCampaign', function (req, res, next) {
    campaigns.editCampaign(req, res, function (response) {
        res.json(response);
    });
});

// post request for change status of campaign
router.post('/statusCampaign', function (req, res, next) {
    campaigns.statusCampaign(req, res, function (response) {
        res.json(response);
    });
});

// post request for find specific campaign
router.get('/findCampaign/:id', function (req, res, next) {
    campaigns.findCampaign(req, res, function (response) {
        res.json(response);
    });
});

// post request for find all campaign
router.get('/listCampaign', function (req, res, next) {
    campaigns.listCampaign(req, res, function (response) {
        res.json(response);
    });
});

// post request for find all campaign
router.post('/deleteCampaign', function (req, res, next) {
    campaigns.deleteCampaign(req, res, function (response) {
        res.json(response);
    });
});
// list of getRingToNumber
router.post('/getRingToNumber', function (req, res, next) {
    campaigns.getRingToNumber(req, res, function (response) {
        res.json(response);
    });
});

router.get('/getNewRingToNumber', campaigns.getNewRingToNumber);

// list of getRingToNumber
router.post('/campaignDetailsForNumber', function (req, res, next) {
    campaigns.campaignDetailsForNumber(req, res, function (response) {
        res.json(response);
    });
});

// list of getRingToNumber
router.post('/campaignDetailsForNumber_twilio', function (req, res, next) {
    campaigns.campaignDetailsForNumber_twilio(req, res, function (response) {
        res.json(response);
    });
});

//list campaign in admin
router.get('/listingCampaign', function (req, res, next) {
    campaigns.listingCampaign(req, res, function (response) {
        res.json(response);
    });
});


//list campaign in admin
router.get('/listCampaignForAdmin', function (req, res, next) {
    campaigns.listCampaignForAdmin(req, res, function (response) {
        res.json(response);
    });
});
module.exports = router;