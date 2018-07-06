// config/passport.js
// load all the things we need
var LocalStrategy = require('passport-local').Strategy;
var BasicStrategy = require('passport-http').BasicStrategy;

// load up the user model
var User = require('../server/models/user');
var userProfile = require('../server/models/user_profile');
var Role = require('../server/models/role');
// load up the crypt lib
var bCrypt = require('bcrypt-nodejs');
var mails = require('../server/controllers/send_mail.js'); // included controller for sending mail operations
// expose this function to our app using module.exports
module.exports = function (passport) {
// used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user);
    });
    // used to deserialize the user for the session
    passport.deserializeUser(function (userDetails, done) {
        done(null, userDetails);
    });
    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'
    passport.use('local-signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function (req, email, password, done) {
        req.flash('signupmessage', "");
        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function () {

            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            User.findOne({'email': req.body.email}, function (err, user) {
                // if there are any errors, return the error
                if (err) {
                    console.log("System Error (register) : " + err);
                    return done(err);
                }


                // check to see if theres already a user with that email
                if (user) {
                    return done(null, false, req.flash('signupmessage', 'That email is already taken.'));
                } else {

                    // if there is no user with that email
                    // create the user
                    var newUser = new User();
                    // set the user's local credentials
                    newUser.role_id = req.body.role_id;
                    newUser.parent_id = req.body.parent_id;
                    newUser.email = req.body.email;
                    newUser.password = createHash(req.body.password);
                    newUser.first_name = req.body.fname;
                    newUser.last_name = req.body.lname;
                    newUser.extension = req.body.extension ? req.body.extension : '';
                    // newUser.addressLine1 = req.body.add1;
                    // newUser.addressLine2 = req.body.add2;
                    // newUser.city = req.body.city;
                    // newUser.state = req.body.state;
                    // newUser.zip = req.body.zip;


                    // save the user
                    newUser.save(function (err) {
                        if (err)
                            throw err;
                        return done(null, newUser, req.flash('signupmessage', 'You have been register successfully, Please check you mail and activate your account.'));
                    });
                }

            });
        });
    }));
    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function (req, username, password, done) { // callback with email and password from our form
        req.flash('loginmessage', "");
        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({'email': username}).populate('role_id').populate('parent_id').exec(function (err, userDetails) {
            // In case of any error, return using the done method
            if (err) {
                return done(err, false, req.flash('loginmessage', 'Internal server error has been occured, Please contact to your administator'));
            }
            // Username does not exist, log the error and redirect back
            if (!userDetails || !isValidPassword(userDetails, password)) {
                return done(null, false, req.flash('loginmessage', 'Username & Password are not Valid'));
            }
            // User verification is at here (IF Active then allow other wise reject)
            if (userDetails.status == "Pending") {
                return done(null, false, req.flash('loginmessage', 'You have not active your account yet. Please check your mail inbox and activate it.')); // redirect back to login page
            }
            // User verification is at here (IF deActive then reject)
            else if (userDetails.status == "deactive") {
                return done(null, false, req.flash('loginmessage', 'Your account is temporary blocked, Please contact administrator.')); // redirect back to login page
            }
            else if (userDetails.status == "active") {

                //Remember Me
                if (req.body.remember_me) {
                    req.session.cookie.maxAge = 365 * 24 * 60 * 60 * 1000;
                } else {
                    req.session.cookie.expires = false;
                }

                return done(null, userDetails, req.flash('loginmessage', 'Login successfully'));
            } else if (!isValidPassword(userDetails, password)) { // User exists but wrong password, log the error
                return done(null, false, req.flash('loginmessage', 'Password are not Valid.')); // redirect back to login page
            }
            // User and password both match, return user from done method
            // which will be treated like success
            // req.session.userDetails = userDetails;
            //return done(null, userDetails, req.flash('loginmessage' , 'Login successfully'));
        });
    }));
    passport.use('white-label-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function (req, username, password, done) { // callback with email and password from our form
        req.flash('loginmessage', "");
        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        userProfile.findOne({$or: [
                {'lgn_setup_details.domain_url': req.headers.host},
                {'lgn_setup_details.domain_url': req.protocol + '://' + req.get('host')}
            ]}).exec(function (err, SubdomainData) {
            if (err) {
                return done(err, false, req.flash('loginmessage', 'Internal server error has been occured, Please contact to your administator'));
            } else {
                User.findOne({'email': username}).populate('role_id').populate('parent_id').exec(function (err, userDetails) {
                    // In case of any error, return using the done method
                    if (err) {
                        return done(err, false, req.flash('loginmessage', 'Internal server error has been occured, Please contact to your administator'));
                    }

                    // Username does not exist, log the error and redirect back
                    if (!userDetails || !isValidPassword(userDetails, password)) {
                        return done(null, false, req.flash('loginmessage', 'Username & Password are not Valid'));
                    } else {
                        if (userDetails.parent_id == null) {
                            return done(null, false, req.flash('loginmessage', 'Cannot Login'));
                        } else if (userDetails.parent_id._id.toString() != SubdomainData.user_id.toString()) {
                            return done(null, false, req.flash('loginmessage', 'Cannot Login'));
                        } else {
                            // User verification is at here (IF Active then allow other wise reject)
                            if (userDetails.status == "Pending") {
                                return done(null, false, req.flash('loginmessage', 'You have not active your account yet. Please check your mail inbox and activate it.')); // redirect back to login page
                            }
                            // User verification is at here (IF deActive then reject)
                            if (userDetails.status == "deactive") {
                                return done(null, false, req.flash('loginmessage', 'Your account is temporary blocked, Please contact administrator.')); // redirect back to login page
                            }
                            if (userDetails.status == "active") {
                                return done(null, userDetails, req.flash('loginmessage', 'Login successfully'));
                            } else if (!isValidPassword(userDetails, password)) { // User exists but wrong password, log the error
                                return done(null, false, req.flash('loginmessage', 'Username & Password are not Valid.')); // redirect back to login page
                            }
                        }

                    }
                });
            }
        });
    }));


    // compare the crypt value
    var isValidPassword = function (user, password) {
        if (user) {
            return bCrypt.compareSync(password, user.password);
        } else {
            return false;
        }
    }

    // Generates hashed value using bCrypt
    var createHash = function (password) {
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    }

    // Third party white label signup
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'
    passport.use('whitelabel-signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function (req, email, password, done) {
        req.flash('signupmessage', "");
        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function () {
            var domains = req.headers.host.split('.'); // split subdomain from url
            // Check if the subdomain is valid or not and find the parent id as well.
            userProfile.findOne({'lgn_setup_details.domain_url': req.headers.host}).exec(function (err, userData) {
                if (err) {
                    console.log("System Error (userData not found) : " + err);
                    return done(null, false, req.flash('signupmessage', "Error:while performing DB operation"));
                } else {

                    if (isEmptyObject(userData)) {

                        return done(null, false, req.flash('signupmessage', "Warning: You are trying form invalid domain url.Please contact super admin."));
                    } else {
                        console.log('userData', userData)
                        // everything is ok now submit user's details to DB
                        Role.findOne({'code': req.body.rolecode}, function (err, roleData) {
                            // if there are any errors, return the error
                            if (err) {
                                console.log("System Error (rolecode) : " + err);
                                return done(err);
                            }


                            // if there is no user with that email
                            // create the user
                            var newUser = new User();
                            // set the user's local credentials
                            newUser.role_id = roleData._id; // fetch from roles schema
                            newUser.parent_id = userData.user_id; // fetch from first find query from user schema
                            newUser.email = req.body.email;
                            newUser.password = createHash(req.body.password);
                            newUser.first_name = req.body.first_name;
                            newUser.last_name = req.body.last_name;
                            newUser.extension = req.body.extension ? req.body.extension : '';
                            // console.log(newUser); return false;

                            // save the user
                            newUser.save(function (err) {
                                if (err) {
                                    if (err.code == '11000')
                                        return done(null, false, req.flash('signupmessage', 'Email already exist.'));
                                    else
                                        return done(null, false, req.flash('signupmessage', 'Error!!'));
                                }
                                return done(null, newUser, req.flash('signupmessage', 'You have been register successfully, Please check you mail and activate your account.'));
                            });
                        });
                        // end of find user uid query 'else' statement
                    }

                }
            });
        });
    }));

    // Third party basic authentication
    // 15022016

    var users = [{username: 'bhawna', password: 'bhawna'}];

    /* Passport Basic Authentication Strategy */
    passport.use('basic', new BasicStrategy({},
            function (username, password, done) {

                findByUsername(username, function (err, user) {
                    if (err) {
                        return done(err);
                    }
                    if (!user) {
                        return done(null, false);
                    }
                    if (user.password != password) {
                        return done(null, false);
                    }
                    return done(null, user);
                });
            }
    ));

    function findByUsername(username, fn) {

        for (var i = 0, len = users.length; i < len; i++) {
            var user = users[i];

            if (user.username === username) {
                return fn(null, user);
            }
        }

        return fn(null, null);
    }

    /* @function : isEmptyObject
     *  @Creator  : shivansh
     *  @created  : 15092015
     */

    var isEmptyObject = function (obj) {
        for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                return false;
            }
        }
        return true;
    }

};
