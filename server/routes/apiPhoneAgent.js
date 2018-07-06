var express = require('express');
var router = express.Router();

var plivoCalls = require('../controllers/calls');
var twilioCalls = require('../controllers/twilioCalls');

/* GET home page */
router.get('/', function (req, res) {
    res.render('index', {title: 'Express'});
});

router.get('/livecalls', function (req, res) {
    plivoCalls.get_liveCalls(req, res);
});

router.use('/callMe', function (req, res) {
    plivoCalls.callMe(req, res, function (resp) {
        res.json({status: 200, resp: resp});
    });
});

router.use('/answer_url', function (req, res) {
    plivoCalls.answer_url(req, res, function (resp) {
        res.set('Content-Type', 'text/xml');
        res.send(resp);
    });
});

router.use('/answer_url2', function (req, res) {
    plivoCalls.answer_url2(req, res, function (resp) {
        res.set('Content-Type', 'text/xml');
        res.send(resp);
    });
});

router.use('/hangup_url', function (req, res) {
    plivoCalls.hangup_url(req, res, function (resp) {
        res.json({status: 200});
    });
});

router.post('/transferWebPhoneCall', plivoCalls.transferWebPhoneCall);

router.use('/transfer_call_plivo', function (req, res) {
    plivoCalls.transfer_call_plivo(req, res, function (resp) {
        res.set('Content-Type', 'text/xml');
        res.send(resp);
    });
});

router.use('/forwardCallToSip', function (req, res) {
    plivoCalls.forwardCallToSip(req, res, function (resp) {
        res.set('Content-Type', 'text/xml');
        res.send(resp);
    });
});

router.use('/receiveRecordingDetails', function (req, res) {
    plivoCalls.receiveRecordingDetails(req, res, function (resp) {
        res.send(resp);
    });
});

router.use('/receiveRecordingDetails_voiceMail_Plivo', function (req, res) {
    plivoCalls.receiveRecordingDetails_voiceMail_Plivo(req, res, function (resp) {
        res.set('Content-Type', 'text/xml');
        res.send(resp);
    });
});

router.use('/callHistory', function (req, res) {
    plivoCalls.callHistory(req, res, function (resp) {
        res.json({status: 200, resp: resp});
    });
});

router.use('/voice_callHistory', function (req, res) {
    plivoCalls.voice_callHistory(req, res, function (resp) {
        res.json({status: 200, resp: resp});
    });
});

router.use('/saveCallerDetails', function (req, res) {
    plivoCalls.saveCallerDetails(req, res, function (resp) {
        res.json(resp);
    });
});

//get list of caller leads
router.get('/listCallerLeads', function (req, res) {
    plivoCalls.listCallerLeads(req, res, function (callback) {
        res.json(callback);
    });
});

//get caller lead detail by id
router.post('/getCallerLeadByID', function (req, res) {
    plivoCalls.getCallerLeadByID(req, res, function (callback) {
        res.json(callback);
    });
});
//delete lead detail by id
router.post('/deleteLeadByID', function (req, res) {
    plivoCalls.deleteLeadByID(req, res, function (callback) {
        res.json(callback);
    });
});

router.use('/voice_mail_url', function (req, res) {
    plivoCalls.voice_mail(req, res, function (resp) {
        res.set('Content-Type', 'text/xml');
        res.send(resp);
    });
});

router.use('/upload_greeting', function (req, res) {
    plivoCalls.upload_greeting(req, res, function (resp) {
        res.set('Content-Type', 'text/xml');
        res.send(resp);
    });
});

router.use('/get_greeting_audio', function (req, res) {
    plivoCalls.get_greeting_audio(req, res, function (resp) {
        res.set('Content-Type', 'text/xml');
        res.send({status: 200, resp: resp});
    });
});

router.use('/delete_voiceMail', function (req, res) {
    plivoCalls.delete_voiceMail(req, res, function (resp) {
        res.set('Content-Type', 'text/xml');
        res.send(resp);
    });
});
router.post('/getCityFromZip', function (req, res) {
    plivoCalls.getCityFromZip(req, res, function (resp) {
        res.send(resp);
    });
});

router.use('/ivr_menu', function (req, res, next) {
    plivoCalls.ivr_menu(req, res, {}, function (resp) {
        res.set('Content-Type', 'text/xml');
        res.send(resp);
    });
});

router.use('/hoo_menu', function (req, res) {
    plivoCalls.hoo_menu(req, res, {}, function (resp) {
        res.set('Content-Type', 'text/xml');
        res.send(resp);
    });
});

router.use('/geo_menu', function (req, res) {
    plivoCalls.geo_menu(req, res, {}, function (resp) {
        res.set('Content-Type', 'text/xml');
        res.send(resp);
    });
});

router.use('/concurrent_menu', function (req, res) {
    plivoCalls.concurrent_menu(req, res, {}, function (resp) {
        res.set('Content-Type', 'text/xml');
        res.send(resp);
    });
});

router.use('/outboundCampaignCall_PlivoMachineDetected', plivoCalls.outboundCampaignCall_PlivoMachineDetected);
router.use('/PlivoMachineDetected_transferCallURL_XML', function (req, res) {
    plivoCalls.PlivoMachineDetected_transferCallURL_XML(req, res, function (resp) {
        res.set('Content-Type', 'text/xml');
        res.send(resp);
    });
});

router.use('/outboundCampaignCallPlivo_optOut', function (req, res) {
    plivoCalls.outboundCampaignCallPlivo_optOut(req, res, function (resp) {
        res.set('Content-Type', 'text/xml');
        res.send(resp);
    });
});

router.use('/outboundCampaignCall_PlivoXML', function (req, res) {
    plivoCalls.outboundCampaignCall_PlivoXML(req, res, function (resp) {
        res.set('Content-Type', 'text/xml');
        res.send(resp);
    });
});

router.use('/whisperMsg_PlivoXML/:promptID', function (req, res) {
    plivoCalls.whisperMsg_PlivoXML(req, res, function (resp) {
        res.set('Content-Type', 'text/xml');
        res.send(resp);
    });
});

//get caller lead detail by id
router.post('/getCampaignLeadByDate', function (req, res) {
    plivoCalls.getCampaignLeadByDate(req, res, function (callback) {
        res.json(callback);
    });
});

router.get('/getSetPlivoNumbers', plivoCalls.getSetPlivoNumbers);

router.get('/getCallForwardDetails', plivoCalls.getCallForwardDetails);
router.post('/saveCallForwardDetails', plivoCalls.saveCallForwardDetails);


/************************************** Twilio (START) ***********************************/
router.get('/getTwilioDetail', twilioCalls.getTwilioDetail);

router.use('/tw/ansUrl', function (req, res) {
    twilioCalls.getCallTwiML(req, res, function (resp) {
        res.set('Content-Type', 'text/xml');
        res.send(resp);
    });
});

router.use('/tw/ivr_menu', function (req, res, next) {
    twilioCalls.ivr_menu(req, res, {}, function (resp) {
        res.set('Content-Type', 'text/xml');
        res.send(resp);
    });
});

router.use('/tw/receiveRecordingDetails_voiceMail_Twilio', function (req, res) {
    twilioCalls.receiveRecordingDetails_voiceMail_Twilio(req, res, function (resp) {
        res.set('Content-Type', 'text/xml');
        res.send(resp);
    });
});

router.use('/tw/fallbackUrl', twilioCalls.fallbackUrl);
router.use('/tw/statusUrl', twilioCalls.statusUrl);

router.post('/transferWebPhoneCall_twilio', twilioCalls.transferWebPhoneCall_twilio);
router.use('/tw/transfer_call', function (req, res) {
    twilioCalls.transfer_call_twilio(req, res, function (resp) {
        res.set('Content-Type', 'text/xml');
        res.send(resp);
    });
});

router.use('/tw/outboundCampaignCall_TwiML', function (req, res) {
    twilioCalls.outboundCampaignCall_TwiML(req, res, function (resp) {
        res.set('Content-Type', 'text/xml');
        res.send(resp);
    });
});

router.use('/tw/outboundCampaignCallTwilio_optOut', function (req, res) {
    twilioCalls.outboundCampaignCallTwilio_optOut(req, res, function (resp) {
        res.set('Content-Type', 'text/xml');
        res.send(resp);
    });
});

router.use('/tw/whisperMsg_TwiML/:promptID', function (req, res) {
    twilioCalls.whisperMsg_TwiML(req, res, function (resp) {
        res.set('Content-Type', 'text/xml');
        res.send(resp);
    });
});

router.get('/tw/outgoingCalls', twilioCalls.outgoingCalls);
router.get('/tw/incommingCalls', twilioCalls.incommingCalls);
router.get('/tw/muteCall', twilioCalls.muteCall);
router.get('/tw/terminateCall', twilioCalls.terminateCall);
router.get('/tw/redirectNewCall', twilioCalls.redirectNewCall);
router.get('/tw/getCallEvent', twilioCalls.getCallEvent);

module.exports = router;

