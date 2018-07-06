var users = require('../controllers/user.js'); // included controller for user operations
var advcc = require('../controllers/advcc.js'); // included controller for user operations
var Advcc_ctrl = require('../controllers/advcc.js'); // included controller for queue operations
var express = require('express');
var router = express.Router();

// post request for add Queue
router.post('/addqueue', function (req, res, next) {
    Advcc_ctrl.addQueue(req, res, function (response) {
        res.json(response);
    });
});
// post request for edit Queue
router.post('/editQueue', function (req, res, next) {
    Advcc_ctrl.editQueue(req, res, function (response) {
        res.json(response);
    });
});

// post request for find all Queue
router.get('/listQueue', function (req, res, next) {
    Advcc_ctrl.listQueue(req, res, function (response) {
        res.json(response);
    });
});

// post request to delete specific queue details
router.post('/deleteQueue', function (req, res, next) {
    Advcc_ctrl.deleteQueue(req, res, function (response) {
        res.json(response);
    });
});

// post request for PA registration from advcc
router.post('/register_pa', function (req, res, next) {
    Advcc_ctrl.registerPA_fromADVCC(req, res, function (response) {
        res.json(response);
    });
});

// post request for PA registration from advcc
router.post('/edit_pa', Advcc_ctrl.editPA_fromADVCC);

// post request for find all Queue
router.get('/listPA', Advcc_ctrl.listPA);
router.get('/listPhoneAgent', Advcc_ctrl.listPhoneAgent);
router.get('/findPAByID/:advccId', Advcc_ctrl.findPAByID);
router.get('/findByQueueID/:queueId', Advcc_ctrl.findByQueueID);

router.get('/listCalendarScript', Advcc_ctrl.listCalendarScript);
router.get('/listAgentScript', Advcc_ctrl.listAgentScript);
router.get('/getAgentScript/:scriptId', Advcc_ctrl.getAgentScript);
router.post('/deleteAgentScript', Advcc_ctrl.deleteAgentScript);
router.post('/saveAgentScript', Advcc_ctrl.saveAgentScript);

/*----------------------Attribution Campaign APIs----------------------*/
router.post('/saveAttributionCampaign', Advcc_ctrl.saveAttributionCampaign);
router.get('/getAttributionCampaignList', Advcc_ctrl.getAttributionCampaignList);
router.post('/getAttributionCampaignData', Advcc_ctrl.getAttributionCampaignData);
router.post('/deleteAttributionCampaign', Advcc_ctrl.deleteAttributionCampaign);

// Created by Omprakash
router.post('/saveesign', users.esign);
router.get('/getesign/:role', users.esignfind);
router.post('/editesign', users.editesign);
router.get('/deleteesign/:id', users.deleteesign);
router.post('/statusesign', users.statusesign);
router.get('/checktermsandcontions/:role', users.checktermsandcontions);
router.post('/acceptterms', users.acceptterms);

//abhishek
router.post('/importClientCSV', advcc.importClientCSV);

/********* ADVCC Document Upload *********/
//Document upload
router.post('/advccPaDocumentUpload', function (req, res, next) {
    Advcc_ctrl.advccPaDocumentUpload(req, function (response) {
        res.json(response);
    });
});

//delete document
router.post('/deleteDocuments', function (req, res) {
    Advcc_ctrl.deleteDocuments(req, function (response) {
        res.json(response);
    });
});

//save document data
router.post('/saveDocumentData', function (req, res) {
    Advcc_ctrl.saveDocumentData(req, function (response) {
        res.json(response);
    });
});

router.get('/listAllDocuments/:lead_id', function (req, res, next) {
    Advcc_ctrl.listAllDocuments(req, res, function (response) {
        res.json(response);
    });
});

router.get('/listAllfileUploaded/:documentId', function (req, res, next) {
    Advcc_ctrl.listAllfileUploaded(req, res, function (response) {
        console.log('IN Routes', response);
        res.json(response);
    });
});

router.get('/getLeadList', function (req, res, next) {
    Advcc_ctrl.getLeadList(req, res, function (response) {
        res.json(response);
    });
});

//delete full document
router.post('/deleteFullDocument', function (req, res) {
    Advcc_ctrl.deleteFullDocument(req, function (response) {
        res.json(response);
    });
});

/****/

/*------------------------Media Creation---------------------------------*/
router.post('/saveMediaRequest', Advcc_ctrl.saveMediaRequest);
router.get('/getMediaList', Advcc_ctrl.getMediaList);



module.exports = router;


