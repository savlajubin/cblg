var calendar = require('../controllers/calendar.js'); // included controller for event calendar operations
var express = require('express');
var router = express.Router();

// post request to create event
router.post('/createEvent', function (req, res) {
    calendar.createEvent(req, function (response) {
        res.json(response);
    });
});

router.get('/getCreatedEvents', function(req, res, next) {
    calendar.getCreatedEvents(req,res,function(response){
        res.json(response);
    });
});

router.get('/getEventScript/:eventId', function(req, res, next) {
    calendar.getEventScript(req,res,function(response){
        res.json(response);
    });
});

router.post('/updateAppointmentStatus', function(req, res, next) {
    calendar.updateAppointmentStatus(req,res,function(response){
        res.json(response);
    });
});

router.get('/getCalendarScript', function(req, res, next) {
    calendar.getCalendarScript(req,res,function(response){
        res.json(response);
    });
});

module.exports = router;


