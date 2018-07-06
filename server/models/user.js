/*To Deal with user's personal data*/

var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
//Amazingly short non-sequential url-friendly unique id generator.
var shortid = require('shortid');

var calScriptSchema = new mongoose.Schema({
    script_id: {type: mongoose.Schema.ObjectId, ref: 'agentScript'}
});

var userSchema = new mongoose.Schema({
    role_id: {type: mongoose.Schema.ObjectId, ref: 'Role'}, // reference to roles collection define type of user
    parent_id: {type: mongoose.Schema.ObjectId, ref: 'User'}, // If 0 then no sub user otherwise sub users of parent_id.
    email: {type: String, required: true, trim: true}, //registered user unique email
    password: {type: String, required: true, trim: true},
    first_name: {type: String, trim: true},
    last_name: {type: String, trim: true},
    company_name: {type: String, trim: true},
    uid: {type: String, unique: true, default: shortid.generate}, // unique ID generation by default.
    addressLine1: {type: String, trim: true},
    addressLine2: {type: String, trim: true},
    city: {type: String, trim: true},
    state: {type: String, trim: true},
    zip: {type: String, trim: true},
    time_zone: {type: String, trim: true},
    country: {type: String, trim: true},
    token: {type: String},
    webApi_token: {type: String},
    password_reset_token: {type: String},
    status: {type: String, default: "Pending"}, //{A : "active", D : "deactive", P : "partial active"}
    verified: {type: String, default: false},
    created: {type: Date, default: Date.now()}, //created Date
    modified: {type: Date}, //modified Date
    extension: {type: String},
    phone_no: {type: String},
    phone_agent: {type: String}, //phone agent LB or ADVCC
    onboarded: {type: Boolean, default: false}, // decide user is onborded or not.
    outbound_support: {type: Boolean, default: false},
    registration_approval: {type: String}, // used to find new user approval method (automatic/manual) to access the app.
    webphone_details: {
        provider: {type: String}, //plivo OR twilio
        username: {type: String}, //AUTH ID - For plivo, Account SID - For Twilio
        password: {type: String}, //Auth Token
        app_id: {type: String, default: 0}, // For LGN (plivo/Twilio)
        tw_webphone_name: {type: String}, //For PA (Twilio)
        plivo_sip_endpoint_id: {type: String}, //For PA (plivo)
        plivo_sip_username: {type: String}, //For PA (plivo)
        plivo_sip_password: {type: String} // For PA (plivo)
    },
    call_forward: {//Only For PA
        phone: {type: String, trim: true},
        status: {type: Boolean, default: false}
    },
    pa_my_campaign: [],
    calendarScript: [calScriptSchema],
    aws_verified_email: {type: String},
    aws_verified_email_status: {type: Boolean, default: false},
    next_payment_date: {type: Date}
});

userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);