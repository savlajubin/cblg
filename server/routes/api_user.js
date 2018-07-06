var users = require('../controllers/user.js'); // included controller for user operations
var mails = require('../controllers/send_mail.js'); // included controller for whitelabel settings operations
var config = require('../../config/constant.js');
var calls = require('../controllers/calls');// included controller for call operations
var Role = require('../controllers/role.js');// included controller for role operations
var express = require('express');
var router = express.Router();

/* @function : isEmptyObject
 *  @Creator  : shivansh
 *  @created  : 12082015
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

module.exports = function (passport) {


    /**************************************  User Routing Section   **************************************/

    // Provided the sign in facilities to user using passport
    router.post('/signIn', passport.authenticate('local-login', {
        successRedirect: '/api_user/signinSuccess', // IF success then create signinSuccess request
        failureRedirect: '/api_user/signinFailure', // If not then create signinFailure request
        failureFlash: true
    }));

    // Handling the signinSuccess request and return the response
    router.get('/signinSuccess', function (req, res) {
        calls.get_greeting_audio(req, res, function (resp) {
            if (isEmptyObject(resp)) {
                config.constant.USER_AUDIO = "";
            } else {
                config.constant.USER_AUDIO = resp.greeting_audio;
            }

            res.set('Content-Type', 'text/xml');
            res.json({'code': 200, 'data': req.user, "message": req.session.flash.loginmessage[0]});
        });
    });

    // Handling the signinFailure request and return the response
    router.get('/signinFailure', function (req, res) {
        res.json({'code': 401, 'data': 'null', "message": req.session.flash.loginmessage[0]});
    });


    // Provided the sign up facilities to user using passport
    router.post('/signUp', passport.authenticate('local-signup', {
        successRedirect: '/api_user/signupSuccess', // IF success then create signup Success request
        failureRedirect: '/api_user/signupFailure', // If not then create signup Failure request
        failureFlash: true
    }));

    // Handling the signupSuccess request and return the response
    router.get('/signupSuccess', function (req, res) {
        if (req && req.user && req.user.email) {
            req.body = req.user;
        }
        mails.registrationToCustomEmail(req, res, function (response) {
            if (response.code == 200) {
                res.json({'code': 200, "message": 'You have been register successfully, Please check you mail and activate your account.'});
            } else {
                res.json({'code': 404, 'data': 'null', "message": "Mail not sent, Please contact to the administrator for activation of account."});
            }
        });
    });

    // Handling the signupFailure request and return the response
    router.get('/signupFailure', function (req, res) {
        res.json({'code': 401, 'data': 'null', "message": req.session.flash.signupmessage[0]});
    });

    // Handling the signupFailure request and return the response
    router.post('/activationLink', function (req, res) {
        users.activationLink(req, res);
    });

    // Handling the request for checking the user session
    router.get('/isUserAuthenticate', function (req, res, next) {
        if (req.isAuthenticated()) { 
            var auth_data = {
                _id: req.user._id,
                email: req.user.email,
                first_name: req.user.first_name,
                last_name: req.user.last_name,
                address: req.user.addressLine1,
                city: req.user.city,
                state: req.user.state,
                zip: req.user.zip,
                country: req.user.country,
                company_name: req.user.company_name,
                verified: (req.user.verified) ? req.user.verified : 'false',
                parent_id: (req.user && req.user.parent_id && req.user.parent_id._id) ? req.user.parent_id._id : '',
                webphone_details: (req.user && req.user.webphone_details) ? req.user.webphone_details : '',
                webApi_token: req.user.webApi_token,
                aws_verified_email: req.user.aws_verified_email,
                aws_verified_email_status: req.user.aws_verified_email_status,
                role_id: {
                    _id: req.user.role_id._id,
                    code: req.user.role_id.code,
                }
            }
            res.json({code: '200', message: 'User available', data: auth_data});
        } else {
            res.json({code: '401', message: 'Your session has been expired, Please login again !!!', data: null});
        }
    });

    // Provide the logout facilities for the user
    router.get('/logout', function (req, res) {
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        req.logout();
        req.session.destroy();
        req.session = null;
        res.redirect('/');
    });

    // Handling the registartion request and return the response to create LGN
    router.post('/register_lgn', function (req, res) {
        users.registerLgn(req, res);

    });

    // Handling the user's forgot password  request & send reset password link
    router.post('/forgot_password', function (req, res) {
        users.forgotpassword(req, res);
    });

    // Handling functionality to reset the user password
    router.post('/reset_password', function (req, res) {
        users.reset_password(req, res);
    });

    // Provided the sign up facilities to user using third party platform
    router.post('/whitelable_signup', passport.authenticate('whitelabel-signup', {
        successRedirect: '/api_user/signupSuccess', // IF success then create signup Success request
        failureRedirect: '/api_user/signupFailure', // If not then create signup Failure request
        failureFlash: true
    }));

    // post request for find all roles
    router.get('/get_roleId', function (req, res, next) {
        Role.get_roleId(req, res, function (response) {
            res.json(response);
        });
    });

    // Provided the white label sign in facilities to user using passport
    router.post('/whitelable_signin', passport.authenticate('white-label-login', {
        successRedirect: '/api_user/signinSuccess', // IF success then create signinSuccess request
        failureRedirect: '/api_user/signinFailure', // If not then create signinFailure request
        failureFlash: true
    }));

//====================  user management section  =======================================

    // get request for user listing
    router.get('/listUser/:id', isAuthenticatedRequest, function (req, res, next) {
        users.listUserByRole(req, res, function (response) {
            res.json(response);
        });
    });
    
    // Amazon aws email verification
    router.post('/awsEmailVerification', isAuthenticatedRequest, function (req, res, next) {
        console.log('IN Routes');
        users.awsEmailVerification(req, res, function (response) {
            res.json(response);
        });
    });
    
    //Amazon aws check email status
    router.get('/checkAwsEmailStatus/:emailAddress', isAuthenticatedRequest, function(req, res, next){
       console.log('In Routes');
       console.log('requestssss', req.params);
       users.checkAwsEmailStatus(req, res, function(response){
           res.json(response);
       });
    });
    
    // get request for user listing for SAAS invoice
    router.get('/userLisitingForOneTimeInvoice/:roleCode', isAuthenticatedRequest, function (req, res, next) {
        console.log('Routes');
        console.log('request', req.params);
        users.userLisitingForOneTimeInvoice(req, res, function (response) {
            console.log(res);
            res.json(response);
        });
    });

    // get request for user listing for drop down
    router.get('/listUserDropDown/:id', isAuthenticatedRequest, function (req, res, next) {
        users.GetUserforDropdown(req, res, function (response) {
            res.json(response);
        });
    });

    // get request for user listing
    router.get('/list_lb_pa', isAuthenticatedRequest, function (req, res, next) {
        users.list_lb_pa(req, res, function (response) {
            res.json(response);
        });
    });

    // post request for change verification status of ADVCC
    router.post('/verifyADVCC', isAuthenticatedRequest, function (req, res, next) {
        users.verifyADVCC(req, res, function (response) {
            res.json(response);
        });
    });

    // post request for change status of user
    router.post('/updateStatus', isAuthenticatedRequest, function (req, res, next) {
        users.updateStatus(req, res, function (response) {
            res.json(response);
        });
    });

    // post request for delete all user
    router.post('/deleteUser', isAuthenticatedRequest, function (req, res, next) {
        users.deleteUser(req, res, function (response) {
            res.json(response);
        });
    });


    // get request for find specific category
    router.get('/findUser/:id', isAuthenticatedRequest, function (req, res, next) {
        users.findUser(req, res, function (response) {
            res.json(response);
        });
    });

    // get request for find phone number
    router.get('/listPhoneNo', isAuthenticatedRequest, function (req, res, next) {
        users.listPhoneNo(req, res, function (response) {
            res.json(response);
        });
    });
    //change user info
    router.post('/saveUserInfo', isAuthenticatedRequest, function (req, res, next) {
        users.saveUserInfo(req, res, function (response) {
            res.json(response);
        });
    });
    // get request for find specific user details
    router.post('/findLGByIDUser', isAuthenticatedRequest, function (req, res, next) {
        users.findLGByIDUser(req, res, function (response) {
            res.json(response);
        });
    });

    // get request for find specific user details
    router.get('/listPAForCallRouting', function (req, res, next) {
        users.listPAForCallRouting(req, res, function (response) {
            res.json(response);
        });
    });

    // search user by created date
    router.post('/searchByCreated', function (req, res, next) {
        users.searchByCreated(req, res, function (response) {
            res.json(response);
        });
    });

    // registration of invited User
    router.post('/inviteSignUp', function (req, res, next) {
        users.inviteSignUp(req, res, function (response) {
            res.json(response);
        });
    });

    // registration of invited User
    router.get('/getInviteInfo/:id', function (req, res, next) {
        users.getInviteInfo(req, res, function (response) {
            res.json(response);
        });
    });


    // Change the outbound support access of LGN
    router.post('/changeOutboundSupport', isAuthenticatedRequest, function (req, res, next) {
        users.changeOutboundSupport(req, res, function (response) {
            res.json(response);
        });
    });
    return router;
};

// module.exports = router;