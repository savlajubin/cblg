var Accounting = require('../controllers/account.js');
var MyAccount = require('../controllers/lgUser.js');
var express = require('express');
var router = express.Router();
var phantom = require('phantom');

//To get acccount Receivable data
router.get('/acccountReceivable', function (req, res, next) {
    Accounting.acccountReceivable(req, res, function (response) {
        res.json(response);
    });
});

//To get acccount payable data
router.get('/acccountPayable', function (req, res, next) {
    Accounting.acccountPayable(req, res, function (response) {
        res.json(response);
    });
});

//To get acccount History data
router.get('/paymentHistory', function (req, res, next) {
    Accounting.paymentHistory(req, res, function (response) {
        res.json(response);
    });
});

//To change paid staus in acccount payable data
router.post('/markAsPaid', function (req, res, next) {
    Accounting.markAsPaid(req, res, function (response) {
        res.json(response);
    });
});

//To change paid staus in acccount payable data
router.post('/markAsPaidReceivable', function (req, res, next) {
    Accounting.markAsPaidReceivable(req, res, function (response) {
        res.json(response);
    });
});

//To change paid staus in acccount payable data
router.post('/makePayment', function (req, res, next) {
    Accounting.makePayment(req, res, function (response) {
        res.json(response);
    });
});

//tO GENERATE PDF for respective invoice
router.post('/pdfGeneration', function (req, res) {
    Accounting.pdfGeneration(req, res, function (response) {
        res.json(response);
    });

});

//Submit Invoice Details
router.post('/submitOneTimeInvoice', function (req, res) {
    Accounting.submitOneTimeInvoice(req, res, function (response) {
        res.json(response);
    });
});

//Send Invoice Mail
router.post('/sendOneTimeInvoice', function (req, res) {
    Accounting.sendOneTimeInvoice(req, res, function (response) {
        res.json(response);
    });
});

//Send Invoice Mail
router.get('/getInvoiceCount', function (req, res) {
    Accounting.getInvoiceCount(req, res, function (response) {
        res.json(response);
    });
});

/************Start Manage My account & Add payment type  section*************/

//get user credit card details  
router.get('/get_contactInfo', function (req, res) {
    MyAccount.get_contactInfo(req, res, function (response) {
        res.json(response);
    });
});
//caller Details
router.get('/get_callerInfo', function (req, res) {
    MyAccount.get_callerInfo(req, res, function (response) {
        res.json(response);
    });
});
// update user contact info  
router.post('/save_contact_details', function (req, res) {
    MyAccount.SaveContactInfo(req, res);
});

//get user login details  
router.get('/get_loginCredentials', function (req, res) {
    MyAccount.get_loginCredentials(req, res, function (response) {
        res.json(response);
    });
});

//post user login details  
router.post('/change_loginCredentials', function (req, res) {
    MyAccount.change_loginCredentials(req, res, function (response) {
        res.json(response);
    });
});

//get user company set up  details  
router.get('/get_lgnsetup', function (req, res) {
    MyAccount.get_lgnsetup(req, res, function (response) {
        res.json(response);
    });
});

//get user company set up  details  
router.post('/save_company_details', function (req, res) {
    MyAccount.save_company_details(req, res);
});

//get user contracts 
router.get('/get_contracts', function (req, res) {
    MyAccount.get_contracts(req, res, function (response) {
        res.json(response);
    });
});

//contract upload
router.post('/onboardFileUpload', function (req, res, next) {
    MyAccount.userContractUpload(req, function (response) {
        res.json(response);
    });
});

//delete contract for existing user
router.post('/deleteContracts', function (req, res) {
    MyAccount.deleteContracts(req, function (response) {
        res.json(response);
    });
});
//get user echeck details  
router.get('/get_echeckInfo', function (req, res) {
    MyAccount.get_echeckInfo(req, res, function (response) {
        res.json(response);
    });
});
// add/update user echeck details  
router.post('/add_echeckInfo', function (req, res) {
    MyAccount.add_echeckInfo(req, res);
});

//get user credit card details  
router.get('/get_cardDetails', function (req, res) {
    MyAccount.get_cardDetails(req, res, function (response) {
        res.json(response);
    });
});

// add/update user credit card details  
router.post('/add_creditCard', function (req, res) {
    MyAccount.add_creditCard(req, res);
});


// change user's credit card status (primary)  
router.post('/makeCard_primary', function (req, res) {
    MyAccount.makeCard_primary(req, res);
});

// remove user's credit card  
router.post('/remove_card', function (req, res) {
    MyAccount.remove_card(req, res);
});

//get user auto recharge details  
router.get('/get_autorecharge', function (req, res) {
    MyAccount.get_autorecharge(req, res, function (response) {
        res.json(response);
    });
});

// add/update user auto recharge details  
router.post('/add_autorechargeData', function (req, res) {
    MyAccount.add_autorechargeData(req, res);
});
/************End Manage My account of each section*************/

module.exports = router;