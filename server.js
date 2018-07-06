var express = require('express');
var app = express();
var path = require('path');
var favicon = require('serve-favicon');

var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local');

var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var flash = require('connect-flash');

var cors = require('cors');
var forceSSL = require('express-force-ssl');
var compression = require('compression');

// load up Database connection
var configDB = require('./config/database.js');
// process.env.TMPDIR ='./server/.tmp';
// load up passport configuration
require('./config/passport')(passport); // pass passport for configuration


// loading main routes
var api_user = require('./server/routes/api_user')(passport); // load our routes and pass in our app and fully configured passport
var api_lguser = require('./server/routes/api_lguser'); // load our routes and pass in our app and fully configured passport
var api_admin = require('./server/routes/api_admin'); // for admin request
var api_static_content = require('./server/routes/api_static_content'); // sor static pages handling request
var phoneAgent = require('./server/routes/apiPhoneAgent'); // for phone agent section handling
var api_setup = require('./server/routes/api_setup'); // for initial setup request
var api_offer = require('./server/routes/api_offer'); // for offer request
var api_campaign = require('./server/routes/api_campaign'); // for campaign request
var api_advcc = require('./server/routes/api_advcc'); // for handling all advcc role requests
var api_reports = require('./server/routes/api_reports'); // for handling all advcc role requests
var api_prompt = require('./server/routes/api_prompt'); // for handling all prompt requests
var api_ivr = require('./server/routes/api_ivr'); // for handling all ivr requests
var api_account = require('./server/routes/api_account'); // for handling all account requests
var api_calendar = require('./server/routes/api_calendar'); // for handling all account requests
var api_contact = require('./server/routes/api_contact'); // for handling all contact requests
var api_template = require('./server/routes/api_template'); // for handling all Template requests
var api_webAffiliate = require('./server/routes/api_webAffiliate'); // for handling all contact requests
//var api_aws = require('./server/routes/api_aws'); // for handling aws requests
var index = require('./server/routes/index'); // for handling all prompt requests

var api_restApi = require('./server/webservices/api_restApi')(passport); //For restful Api's

require('./server/controllers/agenda'); // for cron job settings


// GZIP all assets
app.use(compression()); //Jubin PageLoad

// view engine setup
app.set('views', path.join(__dirname, 'public/views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.set('view cache', true); //Jubin PageLoad

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(cors());

console.log(123444,app.get('env'));

// start required for passport (1 hour time)
app.use(session({secret: 'smartData', cookie: {maxAge: 43200000}, resave: true, saveUninitialized: true, rolling: true}))
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components')));
// end require for passport

var BasicStrategy = require('passport-http').BasicStrategy;
/*passport implementation*/
// var AdminUser=[{username:'admin',password:'test'}];
//  passport.use('basic',new BasicStrategy(function(username,password,done){
//       console.log("message");
//       findByUsername(username,function(err,user){
//           if(err){
//               return done(err);
//           }
//            if(!user){
//             return done(null,false);
//           }
//            if(user.password!=password){
//             return done(null,false);
//           }
//             return done(null,user);
//      });
// }));
// function findByUsername(username,fn){
//   for(var i=0,len=AdminUser.length;i<len;i++){
//     var user=AdminUser[i];
//     if(user.username===username){
//       return fn(null,user);
//     }
//   }
//   return fn(null,null);
// }

/*passport implementation end*/

/*Configure the multer. for image uploading*/
// file upload status
var done = false;


//app.use(forceSSL);

app.use('/', api_static_content); // static pages internal routing
app.use('/phoneAgent', phoneAgent); // phone agent internal routing
app.use('/api_user', api_user); // user management internal routing
app.use('/api_lguser', api_lguser); // user management internal routing
app.use('/api_admin', api_admin); // admin management internal routing
app.use('/api_setup', api_setup); // inital setup management internal routing
app.use('/api_offer', api_offer); // offer management internal routing
app.use('/api_campaign', api_campaign); // campaign management internal routing
app.use('/api_advcc', api_advcc); // internal communication internal routing
app.use('/api_reports', api_reports); // Reports
app.use('/api_prompt', api_prompt); // Prompts
app.use('/api_ivr', api_ivr); // ivr
app.use('/api_account', api_account); // account
app.use('/api_calendar', api_calendar); // calendar
app.use('/api_contact', api_contact); // calendar
app.use('/api_template', api_template);
app.use('/api_webAffiliate', api_webAffiliate); // calendar
//app.use('/api_aws', api_aws); // calendar
app.use('/index', index); // index

app.use('/api_restApi',api_restApi); //restful api's

// catch 404 and forward to error handler
//app.use(function(req, res, next) {
//  var err = new Error('Not Found');
//  err.status = 404;
//  next(err);
//});

app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    res.render('errorServer', {title: '404', message: 'Page Not Found'});
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('errorServer', {
            title: '500',
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('errorServer', {
        title: '500',
        message: err.message,
        error: {}
    });
});


module.exports = app;
