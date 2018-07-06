/* Schema For user_profile Table */

var mongoose = require('mongoose');


//sub Schema for credit card details
var creditCardDetailSchema = new mongoose.Schema({
    'card_no': {type: Number},
    'card_type': {type: String},
    'exp_month': {type: String},
    'exp_year': {type: String},
    'cvv': {type: String},
    'is_primary': {type: Boolean, default: false},
    'bal_Down': {type: String},
    'bal_Up': {type: String},
    'from_account': {type: String},
    'created': {type: "Date", default: Date.now()},
    'modified': {type: "Date", default: Date.now()}
});

var CampaignSchema = new mongoose.Schema({
    offer_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Offer'},
    advertising_method: {
        type: {type: String},
        value: {type: String},
    },
    ringToNumbers: {
        tollfree: {type: mongoose.Schema.Types.ObjectId, ref: 'ringToNumber'},
        local: {type: mongoose.Schema.Types.ObjectId, ref: 'ringToNumber'},
        vanity: {type: mongoose.Schema.Types.ObjectId, ref: 'ringToNumber'}
    },
    campaign_IVR: {
        choice: {type: String},
        nested_choice: {type: String},
        nested_choice_value: {type: String}
    },
    campaign_direction: {type: String},
    campaign_name: {type: String},
    media_week_from: {type: Date},
    media_week_to: {type: Date},
    days: [],
    time_range_from: {type:Number},
    time_range_to: {type:Number},
    rate: {type:String},
    spots_ordered: {type:String},
    amount_spent: {type:String},
    web_affiliate_url_token: {type: String},
    web_affiliate_redirect_url: {type: String},
    status: {type: Boolean, default: false},
    isdeleted: {type: Boolean, default: false},
    test_purpose: {type: Boolean, default: false},
    created_by: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, //it belongs to creator id
    parent_lgn: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    created: {type: Date, default: Date.now()}, //created Date
    modified: {type: Date, default: Date.now()} //modified Date
});

//sub Schema for contract details
var contractSchema = new mongoose.Schema({
    file_name: {type: String},
    path: {type: String}
});

//Main Schema - userProfile
var userProfileSchema = new mongoose.Schema({
    user_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, //user profile belongs to which User
    credit_card_details: [creditCardDetailSchema],
    campaigns: [CampaignSchema],
    auto_recharge_details: {
        'bal_Down': {type: String},
        'bal_Up': {type: String},
        'from_account': {type: String},
        'created': {type: "Date", default: Date.now()},
        'modified': {type: "Date", default: Date.now()}
    },
    echeckInfo: {
        'acc_no': {type: String},
        'routing_no': {type: Number},
        'bank_name': {type: String},
        'bank_phone': {type: Number},
        'bank_zip': {type: Number},
        'credit_agree': {type: Boolean, default: false},
        'created': {type: "Date", default: Date.now()},
        'modified': {type: "Date", default: Date.now()}
    },
    It_supportSettings: {
        'Is_handle_support': {type: Boolean, default: false},
        'expressPass_toIndia': {type: Boolean, default: false},
        'expressPass_toUSA': {type: Boolean, default: false},
        'created': {type: "Date", default: Date.now()},
        'modified': {type: "Date", default: Date.now()}
    },
    lgn_setup_details: {
        'company_name': {type: String},
        'logo': {type: String},
        'support_email': {type: String},
        'domain_url': {type: String},
        'owner_name': {type: String},
        'owner_email': {type: String},
        'owner_phone': {type: String},
        'footer_content': {type: String},
        'color_option': {'bgcolor': {type: String, default: '#000'}, 'fontcolor': {type: String, default: '#fff'}},
        'enable_whitelabel': {type: Boolean, default: false}
    },
    lb_settings: {
        'allow_inhouseMedia': {type: Boolean, default: true},
        'pay_for_calls': {type: String},
        'allow_automatedMarketing': {type: Boolean, default: false},
        'allow_callRecording': {type: Boolean, default: false}
    },
    crm_options: {
        'crm_choice': {type: String},
        'crm_nextChoice': {type: String},
        'email_url': {type: String},
        'password': {type: String},
        'api_key': {type: String}
    },
    //role_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true}, //belongs to which Role
    contracts: [contractSchema],
    ip_address: {type: String},
    e_signature: {type: String},
    created: {type: "Date", default: Date.now()},
    modified: {type: "Date", default: Date.now()},
    original_caller_connect: {type: Boolean, default: false},    
    taccept: {type: Boolean, default: false}
});

module.exports = mongoose.model('userProfile', userProfileSchema);
