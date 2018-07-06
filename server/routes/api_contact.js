var Contact = require('../controllers/contact.js');
var express = require('express');
var router = express.Router();
//var phantom =require('phantom');

//To get Contact List
router.get('/listContact', function (req, res, next) {
    Contact.listContact(req, res, function (response) {
        res.json(response);
    });
});

// TO get cron List
router.get('/cronList', function (req, res, next) {
    Contact.cronList(req, res, function (response) {
        res.json(response);
    });
});

//To save Contact List
router.post('/saveContactList', function (req, res, next) {
    Contact.saveContactList(req, res, function (response) {
        res.json(response);
    });
});

//To save Contact into Contact List
router.post('/saveContact', function (req, res, next) {
    Contact.saveContact(req, res, function (response) {
        res.json(response);
    });
});

//To save Contact into Contact List
router.post('/deleteContactList', function (req, res, next) {
    Contact.deleteContactList(req, res, function (response) {
        res.json(response);
    });
});

//To get Contacts of particular Contact List
router.post('/getContacts', function (req, res, next) {
    Contact.getContacts(req, res, function (response) {
        res.json(response);
    });
});

//To get Info of a Contact
router.post('/getContactInfo', function (req, res, next) {
    Contact.getContactInfo(req, res, function (response) {
        res.json(response);
    });
});

//To delete Contact
router.post('/deleteContact', function (req, res, next) {
    Contact.deleteContact(req, res, function (response) {
        res.json(response);
    });
});

//To send email to contacts
router.post('/sendEmailToContacts', function (req, res, next) {
    //console.log(req.body);
    Contact.sendEmailToContacts(req, res, function (response) {
        res.json(response);
    });
});

//To send email to contacts
router.post('/sendSMSToContacts', function (req, res, next) {
    //console.log(req.body);
    Contact.sendSMSToContacts(req, res, function (response) {
        res.json(response);
    });
});

//To send email to contacts
router.post('/importContactsCSV', function (req, res, next) {
    Contact.importContactsCSV(req, res, function (response) {
        res.json(response);
    });
});
router.get('/deleteCronList/:id', Contact.deleteCronList);

router.get('/findCron/:id', function (req, res, next) {
    Contact.findCron(req, res, function (response) {
        res.json(response);
    });
});

// post request for change status of user
router.post('/changestatus', function (req, res, next) {
    Contact.changestatus(req, res, function (response) {
        res.json(response);
    });
});

// to get all timezones from db
router.get('/getTimezones', function (req, res, next) {
    Contact.getTimezones(req, res, function (response) {
        res.json(response);
    });
});

// to get timezone data
router.post('/getTimezoneData', function (req, res, next) {
    Contact.getTimezoneData(req, res, function (response) {
        res.json(response);
    });
});

// to get timezone data
router.post('/editComposeMessage', function (req, res, next) {
    Contact.editComposeMessage(req, res, function (response) {
        res.json(response);
    });
});

// to get timezone data
router.post('/saveComposeMessage', function (req, res, next) {
    Contact.saveComposeMessage(req, res, function (response) {
        res.json(response);
    });
});


// to get timezone data
router.post('/getMessageCount', function (req, res, next) {
    Contact.getMessageCount(req, res, function (response) {
        res.json(response);
    });
});

// to get Message History
router.get('/listMessageHistory', function (req, res, next) {
    Contact.listMessageHistory(req, res, function (response) {
        res.json(response);
    });
});

// to get Message History Data
router.post('/getMessageHistoryData', function (req, res, next) {
    Contact.getMessageHistoryData(req, res, function (response) {
        res.json(response);
    });
});

// to get Message History Data
router.post('/sendMessageEdit', function (req, res, next) {
    console.log('route',req.body);
    Contact.sendMessageEdit(req, res, function (response) {
        res.json(response);
    });
});

// to get list of phone number
router.get('/listPhoneNumber', function (req, res, next) {
    console.log('route',req.body);
    Contact.listPhoneNumber(req, res, function (response) {
        res.json(response);
    });
});

// to get agenda details by id
router.post('/getAgendaDetails', function (req, res, next) {
    Contact.getAgendaDetails(req, res, function (response) {
        res.json(response);
    });
});

// to opt out contact from sms or email
router.post('/optout', function (req, res, next) {
    Contact.optout(req, res, function (response) {
        res.json(response);
    });
});



router.post('/message_reply_url', function (req, res, next) {
//    console.log('message_reply_url');
//    console.log(req.body);
//    
    Contact.message_reply_url(req, res, function (response) {
        console.log('response ', response);
        res.json(response);
    });
});

module.exports = router;
