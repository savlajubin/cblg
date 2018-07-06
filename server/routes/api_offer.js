var express = require('express');
var router = express.Router();
var offers = require('../controllers/offer');  //To manage offers created by LB
var offerTemplate = require('../controllers/offer_template');  //To manage offer templated created by admin
var LsOffer = require('../controllers/LsOffer');  //To access offers created by lead buyer & to manage phone no for campaign

/*=======================  Offer management system =============================*/

// post request for add offer
router.post('/addOffer', function (req, res, next) {
    offers.addOffer(req, res, function (response) {
        res.json(response);
    });
});

// post request for edit offer
router.post('/editOffer', function (req, res, next) {
    offers.editOffer(req, res, function (response) {
        res.json(response);
    });
});

// post request for change status of offer
router.post('/statusOffer', function (req, res, next) {
    offers.statusOffer(req, res, function (response) {
        res.json(response);
    });
});

// post request for find specific offer
router.get('/findOffer/:id', function (req, res, next) {
    offers.findOffer(req, res, function (response) {
        res.json(response);
    });
});

// post request for find all offer
router.get('/listOffer', function (req, res, next) {
    offers.listOffer(req, res, function (response) {
        res.json(response);
    });
});

// post request for find all offer
router.post('/deleteOffer', function (req, res, next) {
    offers.deleteOffer(req, res, function (response) {
        res.json(response);
    });
});


/*======================= Start Offer management system =============================*/
//To save vertical/category data
router.post('/saveCatVertInfo_lb', function (req, res) {
    offers.saveCatVertInfo(req, res, function (response) {
        res.json(response);
    });
});

//To save pay per call data
router.post('/savepayPerCallInfo_lb', function (req, res) {
    offers.submitpayPerCallInfo(req, res, function (response) {
        res.json(response);
    });
});

//To save web affiliate data
router.post('/saveWebAffiliateInfo', function(req, res){
    console.log('Apirequest', req.body);
   offers.saveWebAffiliateInfo(req, res, function (response) {
       res.json(response);
   });
});

//To save pay per call data
router.post('/savestateRestrictInfo_lb', function (req, res) {
    offers.savestateRestrictInfo(req, res, function (response) {
        res.json(response);
    });
});

//To save all resp busy data
router.post('/saveRoutingSettingInfo_lb', function (req, res) {
    offers.saveRoutingSettingInfo(req, res, function (response) {
        res.json(response);
    });
});

//To save all resp busy data
router.post('/saveAllRepsBusyInfo_lb', function (req, res) {
    offers.saveAllRepsBusyInfo(req, res, function (response) {
        res.json(response);
    });
});

//To save all resp busy data
router.post('/saveDurationInfo_lb', function (req, res) {
    offers.saveDurationInfo(req, res, function (response) {
        res.json(response);
    });
});

//To save dailycap data
router.post('/saveDailyCapInfo_lb', function (req, res) {
    offers.saveDailyCapInfo(req, res, function (response) {
        res.json(response);
    });
});

//To list original offer template created by admin
router.get('/listOfferTemplate_lb', function (req, res) {
    offers.listOfferTemplate(req, res, function (response) {
        res.json(response);
    });
});

//To list offer template by existing user
router.get('/listOriginalOfferTemplate_lb', function (req, res) {
    offers.listOriginalOfferTemplate(req, res, function (response) {
        res.json(response);
    });
});

//To get details of offer template by ID
router.post('/getlistOfferTemplateByID_lb', function (req, res) {
    offers.getlistOfferTemplateByID(req, res, function (response) {
        res.json(response);
    });
});

//To  delete of offer template by ID
router.post('/deleteOfferTemplateByID_lb', function (req, res) {
    offers.deleteOfferTemplateByID(req, res, function (response) {
        res.json(response);
    });
});

//To change status of offer template by ID
router.post('/statusOfferTemplate_lb', function (req, res) {
    offers.statusOfferTemplate(req, res, function (response) {
        res.json(response);
    });
});

//To get state list
router.get('/getStatesList', function (req, res) {
    offers.getStatesList(req, res, function (response) {
        res.json(response);
    });
});

//To get  list of active sellers for respective offer
router.post('/listActiveSellersForOffer', function (req, res) {
    offers.listActiveSellersForOffer(req, res, function (response) {
        res.json(response);
    });
});

//To get offer details
router.post('/getOffferDetailsByID', function (req, res) {
    offers.getOffferDetailsByID(req, res, function (response) {
        res.json(response);
    });
});

//To check title unique or not
router.post('/checkUnique', function (req, res) {
    offers.checkUnique(req, res, function (response) {
        res.json(response);
    });
});

//To get state list
router.get('/list_currentCampaignsLB', function (req, res) {
    offers.list_currentCampaignsLB(req, res, function (response) {
        res.json(response);
    });
});
router.post('/status_currentCampaignsLB', function (req, res) {
    offers.status_currentCampaignsLB(req, res, function (response) {
        res.json(response);
    });
});

//To get offers basedon created date
router.post('/getLBOffersByCreated', function (req, res) {
    offers.getLBOffersByCreated(req, res, function (response) {
        res.json(response);
    });
});
/*======================= End Offer  management system =============================*/

/*======================= Start Offer Template management system =============================*/
//To save vertical/category data
router.post('/saveCatVertInfo', function (req, res) {
    offerTemplate.saveCatVertInfo(req, res, function (response) {
        res.json(response);
    });
});

//To save pay per call data
router.post('/savepayPerCallInfo', function (req, res) {
    offerTemplate.submitpayPerCallInfo(req, res, function (response) {
        res.json(response);
    });
});

//To save pay per call data
router.post('/savestateRestrictInfo', function (req, res) {
    offerTemplate.savestateRestrictInfo(req, res, function (response) {
        res.json(response);
    });
});

//To save all resp busy data
router.post('/saveRoutingSettingInfo', function (req, res) {
    offerTemplate.saveRoutingSettingInfo(req, res, function (response) {
        res.json(response);
    });
});

//To save all resp busy data
router.post('/saveAllRepsBusyInfo', function (req, res) {
    offerTemplate.saveAllRepsBusyInfo(req, res, function (response) {
        res.json(response);
    });
});

//To save all resp busy data
router.post('/saveDurationInfo', function (req, res) {
    offerTemplate.saveDurationInfo(req, res, function (response) {
        res.json(response);
    });
});

//To save dailycap data
router.post('/saveDailyCapInfo', function (req, res) {
    offerTemplate.saveDailyCapInfo(req, res, function (response) {
        res.json(response);
    });
});

//To list offer template
router.get('/listOfferTemplate', function (req, res) {
    offerTemplate.listOfferTemplate(req, res, function (response) {
        res.json(response);
    });
});

//To get details of offer template by ID
router.post('/getlistOfferTemplateByID', function (req, res) {
    offerTemplate.getlistOfferTemplateByID(req, res, function (response) {
        res.json(response);
    });
});

//To get details of offer template by ID
router.post('/getlistOfferTemplateByIDWhole', function (req, res) {
    offerTemplate.getlistOfferTemplateByIDWhole(req, res, function (response) {
        res.json(response);
    });
});

//To  delete of offer template by ID
router.post('/deleteOfferTemplateByID', function (req, res) {
    offerTemplate.deleteOfferTemplateByID(req, res, function (response) {
        res.json(response);
    });
});

//To change status of offer template by ID
router.post('/statusOfferTemplate', function (req, res) {
    offerTemplate.statusOfferTemplate(req, res, function (response) {
        res.json(response);
    });
});

/*======================= End Offer Template management system =============================*/


/*=======================Start  Offer management system in LS section =============================*/
//To get all list of offers created by thir parent LB
router.post('/listAlloffersByLB', function (req, res) {
    LsOffer.listAlloffersByLB(req, res, function (response) {
        res.json(response);
    });
});

//To post request for acceptance of an offer
router.post('/acceptanceRequestOffer', function (req, res) {
    LsOffer.acceptanceRequestOffer(req, res, function (response) {
        res.json(response);
    });
});

//To get all list of offers created by thir parent LB
router.post('/listApprovedOfferLS', function (req, res) {
    LsOffer.listApprovedOfferLS(req, res, function (response) {
        res.json(response);
    });
});
//To get all list of current Campaigns
router.post('/list_currentCampaigns', function (req, res) {
    LsOffer.list_currentCampaigns(req, res, function (response) {
        res.json(response);
    });
});
/*=======================End  Offer management system in LS section =============================*/
/*=======================Start  Phone Number management system in LS section =============================*/
//To get all list of phone numbers in LB
router.get('/listPhoneNumber', function (req, res) {
    LsOffer.listPhoneNumber(req, res, function (response) {
        res.json(response);
    });
});

//To add  phone numbers in LB
router.post('/addPhoneNumber', function (req, res) {
    LsOffer.addPhoneNumber(req, res, function (response) {
        res.json(response);
    });
});

//To Delete  phone numbers in LB
router.post('/deletePhoneNumber', function (req, res) {
    LsOffer.deletePhoneNumber(req, res, function (response) {
        res.json(response);
    });
});

// post request for find specific offer
router.get('/findPhoneNumber/:id', function (req, res, next) {
    LsOffer.findPhoneNumber(req, res, function (response) {
        res.json(response);
    });
});
/*=======================End  Phone Number management system in LS section =============================*/

//To send invitaion mail
router.post('/sendInvite', function (req, res) {
    LsOffer.sendInvite(req, res, function (response) {
        res.json(response);
    });
});

//To send invitaion mail
router.post('/saveMediaRestrictData', function (req, res) {
    offers.saveMediaRestrictData(req, res, function (response) {
        res.json(response);
    });
});

//To save Offer HOO
router.post('/saveOfferHOO', function (req, res) {
    offers.saveOfferHOO(req, res, function (response) {
        res.json(response);
    });
});

//To get Offer HOO
router.post('/get_HOOdata', function (req, res) {
    offers.get_HOOdata(req, res, function (response) {
        res.json(response);
    });
});

//To save Compose Message
router.post('/saveComposeMessage', function (req, res) {
    offers.saveComposeMessage(req, res, function (response) {
        res.json(response);
    });
});

module.exports = router;