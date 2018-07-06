var config = require('../../config/constant.js');
var users = require('../controllers/user.js'); // included controller for user operations
var vertical = require('../controllers/vertical.js'); // included controller for vertical operations
var whitelabel_ctrl = require('../controllers/whitelabel_settings.js'); // included controller for whitelable settings
var webAffiliate = require('../controllers/webAffiliate.js'); // included controller for whitelable settings
var express = require('express');
var router = express.Router();
var sendgrid = require('sendgrid')(config.constant.SEND_GRID.username, config.constant.SEND_GRID.password);
var userProfile_model = require('../models/user_profile.js');

/* @function : isEmptyObject
 *  @Creator  : shivansh
 *  @created  : 09072015
 */

var isEmptyObject = function (obj) {
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
}

// route middleware to make sure a user is logged in (shivansh)
function isAuthenticatedRequest(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();
    // if they aren't redirect them to the home page
    res.redirect('/');
}

//  For temporary code testing sendgrid implemenation
router.get('/sendgrid', function (req, res, next) {
    // TEXT BODY
    var text_body = "Hello,\n\nThis is a test message from SendGrid.    We have sent this to you because you requested a test message be sent from your account.\n\nThis is a link to google.com: http://www.google.com\nThis is a link to apple.com: http://www.apple.com\nThis is a link to sendgrid.com: http://www.sendgrid.com\n\nThank you for reading this test message.\n\nLove,\nYour friends at SendGrid";
    // HTML BODY
    var html_body = "<table style=\"border: solid 1px #000; background-color: #666; font-family: verdana, tahoma, sans-serif; color: #fff;\"> <tr> <td> <h2>Hello,Jason</h2> <p>This is a test message from SendGrid. I am testing the email functionality implementation also, verify that the email is in inbox or span?   We have sent this to you because you requested a test message be sent from your account.</p> <a href=\"http://www.google.com\" target=\"_blank\">This is a link to google.com</a> <p> <a href=\"http://www.apple.com\" target=\"_blank\">This is a link to apple.com</a> <p> <a href=\"http://www.sendgrid.com\" target=\"_blank\">This is a link to sendgrid.com</a> </p> <p>Thank you for reading this test message.</p> Love,<br/> Support team leadgen wins</p> <p> Shivansh </td> </tr> </table>";
    var email = new sendgrid.Email({
        to: 'jason@mjventures.net',
        from: 'supportpsx@leadgenwins.com ',
        subject: 'Implementation of sendgrid Testing',
        html: html_body
    });
    sendgrid.send(email, function (err, json) {
        if (err) {
            return console.error(err);
        }
        console.log(json);
    });

});

// get the very first index page handeller route
router.get('/', function (req, res, next) {
    console.log("/* hit with api_static routes #{" + req.url + "} from #{" + req.headers.host + "}");
//    var domains = req.headers.host.split('.');
//    console.log(domains);
// req.protocol + '://' + req.get('host');;

    userProfile_model.find({$or: [
            {'lgn_setup_details.domain_url': req.headers.host},
            {'lgn_setup_details.domain_url': req.protocol + '://' + req.get('host')}
        ]}).exec(function (err, SubdomainData) {
        if (err) {
            console.log("System Error (SubdomainData) : " + err);
            res.json({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
        } else {
            console.log(SubdomainData);

            var dontCheckOn = [
//                'localhost:3000',
//                'localhost:8000',
//                'dev.psx.io:3000',
//                'dev.psx.io',
//                'psx.io:3000',
//                'psx.io',
//                'jubin.localtunnel.me',
//                '172.10.99.153:8000',
//                '172.10.99.153:3000'
            ];

            if (isEmptyObject(SubdomainData) && dontCheckOn.indexOf(req.headers.host) == -1) {
                //res.render('unauthorized_access', {title: '503', message: 'Service Unavailable'});
                console.log('123 marketing page')
                res.render('marketingSite/index', {title: 'Marketing', message: ''});
            } else {
                console.log('indexPage')
                res.render('index', {title: 'Home'});
            }
        }
    });
});

// get the very first index page handeller route
router.get('/app', function (req, res, next) {
    console.log("/* hit with api_static routes #{" + req.url + "} from #{" + req.headers.host + "}");
//    var domains = req.headers.host.split('.');
//    console.log(domains);
// req.protocol + '://' + req.get('host');;

    userProfile_model.find({$or: [
            {'lgn_setup_details.domain_url': req.headers.host},
            {'lgn_setup_details.domain_url': req.protocol + '://' + req.get('host')}
        ]}).exec(function (err, SubdomainData) {
        if (err) {
            console.log("System Error (SubdomainData) : " + err);
            res.json({'code': config.constant.CODES.notFound, "message": config.constant.MESSAGES.Error})
        } else {
            console.log(SubdomainData);

            var dontCheckOn = [
                'localhost:3000',
                'localhost:8000',
                'dev.psx.io:3000',
                'dev.psx.io',
                'psx.io:3000',
                'psx.io',
                'jubin.localtunnel.me',
                '172.10.99.153:8000',
                '172.10.99.153:3000'
            ];

            if (isEmptyObject(SubdomainData) && dontCheckOn.indexOf(req.headers.host) == -1) {
                res.render('unauthorized_access', {title: '503', message: 'Service Unavailable'});
            } else {
                res.render('index', {title: 'Home'});
            }
        }
    });
});

// update user contact info
router.post('/user_profile/save_contact_details', isAuthenticatedRequest, function (req, res) {
    users.SaveContactInfo(req, res);
});

// update user company details
router.post('/user_profile/save_company_details', isAuthenticatedRequest, function (req, res) {
    users.SaveCompanyDetails(req, res);
});

// update user company details
router.get('/getuser_profile', function (req, res) {
    users.getUserProfile(req, res, function (response) {
        res.json(response);
    });
});

//get user credit card details
router.get('/get_cardDetails/:userid', isAuthenticatedRequest, function (req, res) {
    users.get_cardDetails(req, res, function (response) {
        res.json(response);
    });
});

//get user credit card details
router.get('/get_contactInfo/:userid', isAuthenticatedRequest, function (req, res) {
    users.get_contactInfo(req, res, function (response) {
        res.json(response);
    });
});

// add/update user credit card details
router.post('/user_profile/add_creditCard', isAuthenticatedRequest, function (req, res) {
    users.add_creditCard(req, res);
});


//contract upload
router.post('/onboardFileUpload', isAuthenticatedRequest, isAuthenticatedRequest, function (req, res, next) {
    users.userContractUpload(req, function (response) {
        res.json(response);
    });
});

//delete contract for existing user
router.post('/deleteContracts', isAuthenticatedRequest, function (req, res) {
    users.deleteContracts(req, function (response) {
        res.json(response);
    });
});

// Onboard LGN routes

// get request for populate bank details
router.get('/populate_bankDetails/:routingno', isAuthenticatedRequest, function (req, res, next) {
    users.populate_bankDetails(req, res, function (response) {
        res.json(response);
    });
});

// add/update user echeck details
router.post('/user_profile/add_echeckInfo', isAuthenticatedRequest, function (req, res) {
    users.add_echeckInfo(req, res);
});

//get user login details
router.get('/get_loginCredentials/:userid', isAuthenticatedRequest, function (req, res) {
    users.get_loginCredentials(req, res, function (response) {
        res.json(response);
    });
});
//get user echeck details
router.get('/get_echeckInfo/:userid', isAuthenticatedRequest, function (req, res) {
    users.get_echeckInfo(req, res, function (response) {
        res.json(response);
    });
});

//get user IT supports details
router.get('/get_supports/:userid', isAuthenticatedRequest, function (req, res) {
    users.get_supports(req, res, function (response) {
        res.json(response);
    });
});

//get user OutBound supports details
router.get('/getOutboundSupport/:userid', isAuthenticatedRequest, function (req, res) {
    users.getOutboundSupport(req, res, function (response) {
        res.json(response);
    });
});

//get user company set up  details
router.get('/get_lgnsetup/:userid', isAuthenticatedRequest, function (req, res) {
    users.get_lgnsetup(req, res, function (response) {
        res.json(response);
    });
});

//get user contracts
router.get('/get_contracts/:userid', isAuthenticatedRequest, function (req, res) {
    users.get_contracts(req, res, function (response) {
        res.json(response);
    });
});

// add/update user it supports request details
router.post('/user_profile/add_supportData', function (req, res) {
    console.log('route');
    users.add_supportData(req, res);
});

// add/update user outbound supports request details
router.post('/user_profile/add_outboundSupport', isAuthenticatedRequest, function (req, res) {
    users.add_outboundSupport(req, res);
});


/*third party lgn registration*/

router.get('/plugins/:userid', isAuthenticatedRequest, function (req, res, next) {
    console.log(req.params.id);

    users.get_contactInfo(req, res, function (response) {
        console.log(response);
        var lgn_id = {id: req.params.userid, user: response.data.first_name + " " + response.data.last_name};
        var html = '<!DOCTYPE html><html ng-app="thirdPartyRegistrationApp" ng-controller="thirdPartyRegistrationCtrl" ng-init="getuserdata();"><head><script src= "../assets/js/angular.min.js"></script><div ng-include="' + "'../views/elements/head.html'" + '"></div></head><body><div ng-include="' + "'../views/users/thirdparty_lgnRegiatration.html'" + '"></div> </body></html><script>var app = angular.module("thirdPartyRegistrationApp", []);app.controller("thirdPartyRegistrationCtrl", function($scope,$http) { $scope.getuserdata= function (){ $scope.id = \"' + lgn_id.id + '\";$scope.userdata = \"' + lgn_id.user + '\"; }; $scope.register11=function(registartion_data){registartion_data.role_id ="559a6a1723405677c3d2d436"; registartion_data.parent_id=$scope.id;$http.post("/thirdPartyLGNRegister",registartion_data).success(function(err,data){console.log(data);});}});</script>';
        res.send(html);
    });

});


router.post('/thirdPartyLGNRegister', function (req, res) {
    console.log(req.body);

    users.registerLgn(req, res);
});

// change user's credit card status (primary)
router.post('/user_profile/makeCard_primary', isAuthenticatedRequest, function (req, res) {
    users.makeCard_primary(req, res);
});

// remove user's credit card
router.post('/user_profile/remove_card', isAuthenticatedRequest, function (req, res) {
    users.remove_card(req, res);
});

//get user auto recharge details
router.get('/get_autorecharge/:userid', isAuthenticatedRequest, function (req, res) {
    users.get_autorecharge(req, res, function (response) {
        res.json(response);
    });
});

//get user's data(media agency,call payments, automated marketing,call recording, registration approval tabs)
router.get('/get_Lbsettings/:userid', isAuthenticatedRequest, function (req, res) {
    users.get_Lbsettings(req, res, function (response) {
        res.json(response);
    });
});
// add/update user auto recharge details
router.post('/user_profile/add_rechargeData', isAuthenticatedRequest, function (req, res) {
    users.add_rechargeData(req, res);
});
// add/update user LB settings details
router.post('/user_profile/save_lbsettings', isAuthenticatedRequest, function (req, res) {
    users.save_lbsettings(req, res);
});

// get caller's phone data to show on google map.
router.post('/getCallerDetail', function (req, res, next) {
    users.getCallerDetail(req, res, function (resp) {
        res.json(resp);
    });
});

router.post('/zipCodeDetail', function (req, res, next) {
    users.zipCodeDetail(req, res, function (resp) {
        res.json(resp);
    });
});
// submit onboarding LB & save registration approval method
router.post('/user_profile/submit_onboardingLB', isAuthenticatedRequest, function (req, res) {
    users.submit_onboardingLB(req, res);
});

//get user's data(phone agent tabs)
router.get('/get_phoneAgentInfo/:userid', isAuthenticatedRequest, function (req, res) {
    users.get_phoneAgentInfo(req, res, function (response) {
        res.json(response);
    });
});

//save user's data(phone agent tabs)
router.post('/save_phoneAgentInfo', isAuthenticatedRequest, function (req, res) {
    users.save_phoneAgentInfo(req, res, function (response) {
        res.json(response);
    });
});

//get user's data(registration approval tabs)
router.get('/get_RegApproval/:userid', isAuthenticatedRequest, function (req, res) {
    users.get_RegApproval(req, res, function (response) {
        res.json(response);
    });
});

//get user's data(crm options tabs)
router.get('/get_CRMOptions/:userid', isAuthenticatedRequest, function (req, res) {
    users.get_CRMOptions(req, res, function (response) {
        res.json(response);
    });
});
//get user's data(crm options tabs)
router.get('/get_webphoneDetails/:id', isAuthenticatedRequest, function (req, res) {
    users.get_webphoneDetails(req, res, function (response) {
        res.json(response);
    });
});
//get user's data(crm options tabs)
router.post('/save_webphoneDetails', isAuthenticatedRequest, function (req, res) {
    users.save_webphoneDetails(req, res, function (response) {
        res.json(response);
    });
});

//store user's data(crm options tabs)
router.post('/user_profile/save_crm_details', isAuthenticatedRequest, function (req, res) {
    users.SaveCRMInfo(req, res);
});

//get user's unique url for registration
router.get('/generate_html/:userid', isAuthenticatedRequest, function (req, res) {

    users.generate_html(req, res, function (response) {
        res.json(response);
    });

});

//get user's whitelabel settings
router.get('/iswhitelabeled', function (req, res) {
    //here I have to check the host url & based on that we need to fetch the settings. req.host()
    whitelabel_ctrl.iswhitelabeled(req, res);
});

//get user's whitelabel settings
router.get('/whitelabelsettings', function (req, res) {
    //here I have to check the host url & based on that we need to fetch the settings. req.host()
    whitelabel_ctrl.whitelabelsettings(req, res);
});

//get user's whitelabel settings
router.get('/send_whitelabel_request', function (req, res) {
    //here I have to check the host url & based on that we need to fetch the settings. req.host()
    whitelabel_ctrl.send_whitelabel_request(req, res);
});

//set  next payment date for respective user LB
router.get('/setNextPaymentDate', function (req, res, callback) {
    users.setNextPaymentDate(req, res, function (response) {
        res.json(response);
    });
});

/* Web Affilaite Data with campaign id*/
router.post('/webAffiliateProgram/:campaignId', function(req, res, next) {
    webAffiliate.createWebLead(req,res, function(response){
        res.json(response);
    });
});

/* Web Affilaite Data without campaign id (Invalid Request) */
router.post('/webAffiliateProgram', function(req, res, next) {
    webAffiliate.createWebLead(req,res, function(response){
        res.json(response);
    });
});

module.exports = router;