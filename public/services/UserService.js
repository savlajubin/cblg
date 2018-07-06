// public/js/services/UserService.js
angular.module('UserService', [])

        /**************************************  User Management Services Section   **************************************/
        /*@factory  : User
         * Creator   : Somesh Singh
         * @created  : 09 July 2015
         * @purpose  : User Services provider (signIn, signUp, forgotton password etc...)
         */

        .factory('User', ['$resource', function ($resource) {
                return {
                    signIn: function () {
                        return $resource('/api_user/signIn') //send the post request to the server for sign in
                    },
                    signUp: function () {
                        return $resource('/api_user/signUp'); //send the post request to the server for sign up
                    },
                    saveUserInfo: function () {
                        return $resource('/api_user/saveUserInfo'); //send the post request to the server for sign up
                    },
                    signUpLGN: function () {
                        return $resource('/api_user/register_lgn'); //send the post request to the server for sign up LGN user
                    },
                    forgot_password: function () {
                        return $resource('/api_user/forgot_password'); //send the post request to the server for change password
                    },
                    changePassword: function () {
                        return $resource('/api_user/changePassword'); //send the post request to the server for reset password
                    },
                    activate_account: function () {
                        return $resource('/api_user/activationLink'); //send the post request to the server for reset password
                    },
                    reset_password: function () {
                        return $resource('/api_user/reset_password'); //send the post request to the server for reset password
                    },
                    getuser_profile: function () {
                        return $resource('/getuser_profile'); //send the post request to the server for reset password
                    },
                    isAuth: function () {
                        return $resource('/api_user/isUserAuthenticate'); // //send the post request to the server for checking the active session off user
                    },
                    logout: function () {
                        return $resource('/api_user/logout'); // //send the get request to logout the user
                    },
                    listUser: function () {
                        return $resource('/api_user/listUser/:id'); // //send the get request to logout the user
                    },
                    awsEmailVerification: function () {
                        return $resource('/api_user/awsEmailVerification'); // aws email verification
                    },
                    checkAwsEmailStatus: function () {
                        return $resource('/api_user/checkAwsEmailStatus/:emailAddress');
                    },
                    userLisitingForOneTimeInvoice: function (roleCode) {
                        return $resource('/api_user/userLisitingForOneTimeInvoice/' + roleCode.roleCode); // //send the get request to get the list of users for SAAS invoice
                    },
                    statusUser: function () {
                        return $resource('/api_user/updateStatus/'); // //send the get request to logout the user
                    },
                    deleteUser: function () {
                        return $resource('/api_user/deleteUser/'); // //send the get request to logout the user
                    },
                    findByIDUser: function () {
                        return $resource('/api_user/findUser/:id'); // //send the get request to logout the user
                    },
                    list_lb_pa: function () {
                        return $resource('/api_user/list_lb_pa'); // //send the get request to logout the user
                    },
                    listPhoneNo: function () {
                        return $resource('/api_user/listPhoneNo'); // //send the get request to get all phones
                    },
                    addPhone: function () {
                        return $resource('/api_user/createPhoneNo'); // //send the get request to get all phones
                    },
                    get_cardDetails: function () {
                        return $resource('/get_cardDetails/:id'); //send the post request to the server for reset password
                    },
                    get_contactInfo: function () {
                        return $resource('/get_contactInfo/:id'); //send the post request to the server for reset password
                    },
                    populate_bankDetails: function () {
                        return $resource('/populate_bankDetails/:routingno'); //send the get request to the server for populate bank details
                    },
                    get_loginCredentials: function () {
                        return $resource('/get_loginCredentials/:id'); //send the post req to get user login credentials
                    },
                    get_echeckInfo: function () {
                        return $resource('/get_echeckInfo/:id'); //send the post req to get user echeck info.
                    },
                    get_supports: function () {
                        return $resource('/get_supports/:id'); //send the post req to get user it supports info.
                    },
                    getOutboundSupport: function () {
                        return $resource('/getOutboundSupport/:id'); //send the post req to get user it supports info.
                    },
                    get_lgnsetup: function () {
                        return $resource('/get_lgnsetup/:id'); //send the post req to get user company set up info.
                    },
                    get_contracts: function () {
                        return $resource('/get_contracts/:id'); //send the post req to get user company set up info.
                    },
                    deleteContracts: function () {
                        return $resource('/deleteContracts/'); //send the post req to get user company set up info.
                    },
                    get_autorecharge: function () {
                        return $resource('/get_autorecharge/:id'); //send the get request to the server for auto recharge data
                    },
                    get_Lbsettings: function () {
                        return $resource('/get_Lbsettings/:id'); //Get user's media agency info.
                    },
                    get_RegApproval: function () {
                        return $resource('/get_RegApproval/:id'); //Get user's registration approval Info.
                    },
                    get_phoneAgentInfo: function () {
                        return $resource('/get_phoneAgentInfo/:id'); //Get user's registration approval Info.
                    },
                    save_phoneAgentInfo: function () {
                        return $resource('/save_phoneAgentInfo'); //Get user's registration approval Info.
                    },
                    get_CRMOptions: function () {
                        return $resource('/get_CRMOptions/:id'); //Get user's CRM settings Info.
                    },
                    generate_html: function () {
                        return $resource('/generate_html/:id'); //return white label unique url to user for registration
                    },
                    whitelable_signup: function () {
                        return $resource('/api_user/whitelable_signup'); //register user through the third party website.
                    },
                    whitelable_signin: function () {
                        return $resource('/api_user/whitelable_signin'); //register user through the third party website.
                    },
                    listUserDropDown: function () {
                        return $resource('/api_user/listUserDropDown/:id'); // //send the get request to find the user for drop down
                    },
                    save_webphoneDetails: function () {
                        return $resource('/save_webphoneDetails');
                    },
                    get_webphoneDetails: function () {
                        return $resource('/get_webphoneDetails/:id');
                    },
                    findLGByIDUser: function () {
                        return $resource('/api_user/findLGByIDUser'); // //send the get request to logout the user
                    },
                    listPAForCallRouting: function () {
                        return $resource('/api_user/listPAForCallRouting'); // get list of all PA's of respective LGN or ADVCC
                    },
                    iswhitelabeled: function () {
                        return $resource('/iswhitelabeled'); // //send the post request to the server for checking the active session off user
                    },
                    searchByCreated: function () {
                        return $resource('/api_user/searchByCreated'); // //send the post request to the server for checking the active session off user
                    },
                    inviteSignUp: function () {
                        return $resource('/api_user/inviteSignUp'); // //registration of invited User
                    },
                    getInviteInfo: function (id) {
                        return $resource('/api_user/getInviteInfo/' + id); // //send the get request to find the user for drop down
                    },
                    verifyADVCC: function () {
                        return $resource('/api_user/verifyADVCC'); // //send the get request to find the user for drop down
                    },
                    changeOutboundSupport: function () {
                        return $resource('/api_user/changeOutboundSupport'); // //Change the outbound support access of LGN
                    },
                    changeTestCampignStatus: function () {
                        return $resource('/api_offer/status_currentCampaignsLB'); // //Change the outbound support access of LGN
                    },
                    esignlist: function () {
                        return $resource('/api_advcc/getesign/:role');
                    },
                    /*@factory  : User
                     * Creator   : Omprakash Kapgate
                     * @created  : 29-01-2016
                     * @purpose  : User Services provider (Managing E-sign from admin section)
                     */
                    addesign: function (body, role) {
                        return $resource('/api_advcc/saveesign', {body: "@body", role: "@role"}, {update: {method: 'post'}});
                    },
                    editesign: function (id, role, body) {
                        return $resource('/api_advcc/editesign', {id: "@id", role: "@role", body: "@body"}, {update: {method: 'post'}});
                    },
                    deleteesign: function (id) {
                        return $resource('/api_advcc/deleteesign/' + id);
                    },
                    statusEsign: function (id, status) {
                        return $resource('/api_advcc/statusesign', {id: "@id", status: "@status"}, {save: {method: 'post'}});
                    },
                    checktermsandcontions: function (role) {
                        return $resource('/api_advcc/checktermsandcontions/' + role);
                    },
                    acceptterms: function (value, id, e_signature) {
                        return $resource('/api_advcc/acceptterms', {value: "@value", id: "@id", e_signature: "e_signature"}, {save: {method: 'post'}});
                    },
                    checktermsandcontionsLB: function (role) {
                        return $resource('/api_advcc/checktermsandcontions/' + role);
                    },
                    accepttermsLB: function (value, id, e_signature) {
                        return $resource('/api_advcc/acceptterms', {value: "@value", id: "@id", e_signature: "e_signature"}, {save: {method: 'post'}});
                    }
                }
            }])

        .factory('PAUser', ['$resource', function ($resource) {
                return {
                    getPlivoDetails: function () {
                        return $resource('/phoneAgent/getPlivoDetails')
                    },
                    saveCallerDetails: function () {
                        return $resource('/phoneAgent/saveCallerDetails'); //send the post request to the server for sign up
                    },
                    getCallForwardDetails: function () {
                        return $resource('/phoneAgent/getCallForwardDetails'); //send the post request to the server for sign up
                    },
                    saveCallForwardDetails: function () {
                        return $resource('/phoneAgent/saveCallForwardDetails'); //send the post request to the server for sign up
                    },
                    campaignDetailsForNumber: function () {
                        return $resource('/api_campaign/campaignDetailsForNumber'); //send the post request to the server for sign up
                    },
                    campaignDetailsForNumber_twilio: function () {
                        return $resource('/api_campaign/campaignDetailsForNumber_twilio'); //send the post request to the server for sign up
                    },
                    transferWebPhoneCall: function () {
                        return $resource('/phoneAgent/transferWebPhoneCall'); //send the post request to the server for sign up
                    },
                    transferWebPhoneCall_twilio: function () {
                        return $resource('/phoneAgent/transferWebPhoneCall_twilio'); //send the post request to the server for sign up
                    },
                    getTwilioDetail: function () {
                        return $resource('/phoneAgent/getTwilioDetail'); //send the post request to the server for sign up
                    }
                }
            }]);

/**************************************  User Management Services Section   **************************************/
