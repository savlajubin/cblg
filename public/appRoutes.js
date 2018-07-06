/*globals angular */
var app = angular.module('appRoutes', [])
        .constant("CONSTANTS", {
            "BASE_URL": "http://localhost",
            "PORT": "3000",
            'CODES': {
                'OK': 200,
                'NoContent': 204,
                'BadRequest': 400,
                'Unauthorized': 401,
                'PR': 402,
                'Forbidden': 403,
                'notFound': 404,
                'Error': 500,
            },
            'ROLE_CODES': {
                'LGN': '559a6a1723405677c3d2d436',
                'LG': '559a6a2023405677c3d2d437',
                'ADVCC': '55de08dacbb875f85be7ddf3',
                'LB': '559a6a3423405677c3d2d439',
                'PA': '559a6a2a23405677c3d2d438',
            },
            'COMMISSION': {
                'default': 0,
                'wire': 15,
                'paypal': 0.03
            },
            'SWAL': {
                'deletetitle': 'Are you sure, you want to delete ?',
                'marktitle': 'Are you sure?',
                'deletetext': 'Please make sure you will not be able to recover these details further.',
                'marktext': 'Yes, Mark it as Paid!',
                'type': 'warning',
                'showCancelButton': true,
                'confirmButtonColor': '#3190e7',
                'deleteconfirmButtonText': 'Delete',
                'markconfirmButtonText': 'Delete',
                'closeOnConfirm': true,
                'statusChangeConfirmBoxTitle': 'Are you sure you want to change the status ?',
                'statusConfirmButtonText': 'Confirm',
                'statusConfirmtext': 'Please make sure you if you want to change the appointment status.',
                'sameAppointmentBoxTitle': 'Are you sure you want to continue ?',
                'sameAppointmentText': 'You already have an appointment on same date and time.',
                'passedAppointmentTitle': 'You cannot set appointment for the passed date.',
                'passedAppointmentText': 'Please make sure that you set the appointment for the upcoming dates',
                'passedAppointmentButtonText': 'OK',
                'alreadyCreatedAgreementTitle': 'You already have one active agreement present for this role',
                'alreadyCreatedAgreementText': 'Please make sure you deactive the already created agreement of same role.',
                'alreadyCreatedAgreementButtonText': 'OK'
            },
            'timezones': [
                {'name': 'America/New_York', 'text': 'Eastern Time Zone'},
                {'name': 'America/Chicago', 'text': 'Central Time Zone'},
                {'name': 'America/Boise', 'text': 'Mountain Time Zone'},
                {'name': 'America/Los_Angeles', 'text': 'Pacific Time Zone'}
            ],
            'countryList': [
                {"name": "USA", "code": "US", ticked: false},
                {"name": "Afghanistan", "code": "AF", ticked: false},
                {"name": "Aland Islands", "code": "AX", ticked: false},
                {"name": "Albania", "code": "AL", ticked: false},
                {"name": "Algeria", "code": "DZ", ticked: false},
                {"name": "American Samoa", "code": "AS", ticked: false},
                {"name": "AndorrA", "code": "AD", ticked: false},
                {"name": "Angola", "code": "AO", ticked: false},
                {"name": "Anguilla", "code": "AI", ticked: false},
                {"name": "Antarctica", "code": "AQ", ticked: false},
                {"name": "Antigua and Barbuda", "code": "AG", ticked: false},
                {"name": "Argentina", "code": "AR", ticked: false},
                {"name": "Armenia", "code": "AM", ticked: false},
                {"name": "Aruba", "code": "AW", ticked: false},
                {"name": "Australia", "code": "AU", ticked: false},
                {"name": "Austria", "code": "AT", ticked: false},
                {"name": "Azerbaijan", "code": "AZ", ticked: false},
                {"name": "Bahamas", "code": "BS", ticked: false},
                {"name": "Bahrain", "code": "BH", ticked: false},
                {"name": "Bangladesh", "code": "BD", ticked: false},
                {"name": "Barbados", "code": "BB", ticked: false},
                {"name": "Belarus", "code": "BY", ticked: false},
                {"name": "Belgium", "code": "BE", ticked: false},
                {"name": "Belize", "code": "BZ", ticked: false},
                {"name": "Benin", "code": "BJ", ticked: false},
                {"name": "Bermuda", "code": "BM", ticked: false},
                {"name": "Bhutan", "code": "BT", ticked: false},
                {"name": "Bolivia", "code": "BO", ticked: false},
                {"name": "Bosnia and Herzegovina", "code": "BA", ticked: false},
                {"name": "Botswana", "code": "BW", ticked: false},
                {"name": "Bouvet Island", "code": "BV", ticked: false},
                {"name": "Brazil", "code": "BR", ticked: false},
                {"name": "British Indian Ocean Territory", "code": "IO", ticked: false},
                {"name": "Brunei Darussalam", "code": "BN", ticked: false},
                {"name": "Bulgaria", "code": "BG", ticked: false},
                {"name": "Burkina Faso", "code": "BF", ticked: false},
                {"name": "Burundi", "code": "BI", ticked: false},
                {"name": "Cambodia", "code": "KH", ticked: false},
                {"name": "Cameroon", "code": "CM", ticked: false},
                {"name": "Canada", "code": "CA", ticked: false},
                {"name": "Cape Verde", "code": "CV", ticked: false},
                {"name": "Cayman Islands", "code": "KY", ticked: false},
                {"name": "Central African Republic", "code": "CF", ticked: false},
                {"name": "Chad", "code": "TD", ticked: false},
                {"name": "Chile", "code": "CL", ticked: false},
                {"name": "China", "code": "CN", ticked: false},
                {"name": "Christmas Island", "code": "CX", ticked: false},
                {"name": "Cocos (Keeling) Islands", "code": "CC", ticked: false},
                {"name": "Colombia", "code": "CO", ticked: false},
                {"name": "Comoros", "code": "KM", ticked: false},
                {"name": "Congo", "code": "CG", ticked: false},
                {"name": "Congo, The Democratic Republic of the", "code": "CD", ticked: false},
                {"name": "Cook Islands", "code": "CK", ticked: false},
                {"name": "Costa Rica", "code": "CR", ticked: false},
                {"name": "Cote D\"Ivoire", "code": "CI", ticked: false},
                {"name": "Croatia", "code": "HR", ticked: false},
                {"name": "Cuba", "code": "CU", ticked: false},
                {"name": "Cyprus", "code": "CY", ticked: false},
                {"name": "Czech Republic", "code": "CZ", ticked: false},
                {"name": "Denmark", "code": "DK", ticked: false},
                {"name": "Djibouti", "code": "DJ", ticked: false},
                {"name": "Dominica", "code": "DM", ticked: false},
                {"name": "Dominican Republic", "code": "DO", ticked: false},
                {"name": "Ecuador", "code": "EC", ticked: false},
                {"name": "Egypt", "code": "EG", ticked: false},
                {"name": "El Salvador", "code": "SV", ticked: false},
                {"name": "Equatorial Guinea", "code": "GQ", ticked: false},
                {"name": "Eritrea", "code": "ER", ticked: false},
                {"name": "Estonia", "code": "EE", ticked: false},
                {"name": "Ethiopia", "code": "ET", ticked: false},
                {"name": "Falkland Islands (Malvinas)", "code": "FK", ticked: false},
                {"name": "Faroe Islands", "code": "FO", ticked: false},
                {"name": "Fiji", "code": "FJ", ticked: false},
                {"name": "Finland", "code": "FI", ticked: false},
                {"name": "France", "code": "FR", ticked: false},
                {"name": "French Guiana", "code": "GF", ticked: false},
                {"name": "French Polynesia", "code": "PF", ticked: false},
                {"name": "French Southern Territories", "code": "TF", ticked: false},
                {"name": "Gabon", "code": "GA", ticked: false},
                {"name": "Gambia", "code": "GM", ticked: false},
                {"name": "Georgia", "code": "GE", ticked: false},
                {"name": "Germany", "code": "DE", ticked: false},
                {"name": "Ghana", "code": "GH", ticked: false},
                {"name": "Gibraltar", "code": "GI", ticked: false},
                {"name": "Greece", "code": "GR", ticked: false},
                {"name": "Greenland", "code": "GL", ticked: false},
                {"name": "Grenada", "code": "GD", ticked: false},
                {"name": "Guadeloupe", "code": "GP", ticked: false},
                {"name": "Guam", "code": "GU", ticked: false},
                {"name": "Guatemala", "code": "GT", ticked: false},
                {"name": "Guernsey", "code": "GG", ticked: false},
                {"name": "Guinea", "code": "GN", ticked: false},
                {"name": "Guinea-Bissau", "code": "GW", ticked: false},
                {"name": "Guyana", "code": "GY", ticked: false},
                {"name": "Haiti", "code": "HT", ticked: false},
                {"name": "Heard Island and Mcdonald Islands", "code": "HM", ticked: false},
                {"name": "Holy See (Vatican City State)", "code": "VA", ticked: false},
                {"name": "Honduras", "code": "HN", ticked: false},
                {"name": "Hong Kong", "code": "HK", ticked: false},
                {"name": "Hungary", "code": "HU", ticked: false},
                {"name": "Iceland", "code": "IS", ticked: false},
                {"name": "India", "code": "IN", ticked: false},
                {"name": "Indonesia", "code": "ID", ticked: false},
                {"name": "Iran, Islamic Republic Of", "code": "IR", ticked: false},
                {"name": "Iraq", "code": "IQ", ticked: false},
                {"name": "Ireland", "code": "IE", ticked: false},
                {"name": "Isle of Man", "code": "IM", ticked: false},
                {"name": "Israel", "code": "IL", ticked: false},
                {"name": "Italy", "code": "IT", ticked: false},
                {"name": "Jamaica", "code": "JM", ticked: false},
                {"name": "Japan", "code": "JP", ticked: false},
                {"name": "Jersey", "code": "JE", ticked: false},
                {"name": "Jordan", "code": "JO", ticked: false},
                {"name": "Kazakhstan", "code": "KZ", ticked: false},
                {"name": "Kenya", "code": "KE", ticked: false},
                {"name": "Kiribati", "code": "KI", ticked: false},
                {"name": "Korea, Democratic People\"S Republic of", "code": "KP", ticked: false},
                {"name": "Korea, Republic of", "code": "KR", ticked: false},
                {"name": "Kuwait", "code": "KW", ticked: false},
                {"name": "Kyrgyzstan", "code": "KG", ticked: false},
                {"name": "Lao People\"S Democratic Republic", "code": "LA", ticked: false},
                {"name": "Latvia", "code": "LV", ticked: false},
                {"name": "Lebanon", "code": "LB", ticked: false},
                {"name": "Lesotho", "code": "LS", ticked: false},
                {"name": "Liberia", "code": "LR", ticked: false},
                {"name": "Libyan Arab Jamahiriya", "code": "LY", ticked: false},
                {"name": "Liechtenstein", "code": "LI", ticked: false},
                {"name": "Lithuania", "code": "LT", ticked: false},
                {"name": "Luxembourg", "code": "LU", ticked: false},
                {"name": "Macao", "code": "MO", ticked: false},
                {"name": "Macedonia, The Former Yugoslav Republic of", "code": "MK", ticked: false},
                {"name": "Madagascar", "code": "MG", ticked: false},
                {"name": "Malawi", "code": "MW", ticked: false},
                {"name": "Malaysia", "code": "MY", ticked: false},
                {"name": "Maldives", "code": "MV", ticked: false},
                {"name": "Mali", "code": "ML", ticked: false},
                {"name": "Malta", "code": "MT", ticked: false},
                {"name": "Marshall Islands", "code": "MH", ticked: false},
                {"name": "Martinique", "code": "MQ", ticked: false},
                {"name": "Mauritania", "code": "MR", ticked: false},
                {"name": "Mauritius", "code": "MU", ticked: false},
                {"name": "Mayotte", "code": "YT", ticked: false},
                {"name": "Mexico", "code": "MX", ticked: false},
                {"name": "Micronesia, Federated States of", "code": "FM", ticked: false},
                {"name": "Moldova, Republic of", "code": "MD", ticked: false},
                {"name": "Monaco", "code": "MC", ticked: false},
                {"name": "Mongolia", "code": "MN", ticked: false},
                {"name": "Montserrat", "code": "MS", ticked: false},
                {"name": "Morocco", "code": "MA", ticked: false},
                {"name": "Mozambique", "code": "MZ", ticked: false},
                {"name": "Myanmar", "code": "MM", ticked: false},
                {"name": "Namibia", "code": "NA", ticked: false},
                {"name": "Nauru", "code": "NR", ticked: false},
                {"name": "Nepal", "code": "NP", ticked: false},
                {"name": "Netherlands", "code": "NL", ticked: false},
                {"name": "Netherlands Antilles", "code": "AN", ticked: false},
                {"name": "New Caledonia", "code": "NC", ticked: false},
                {"name": "New Zealand", "code": "NZ", ticked: false},
                {"name": "Nicaragua", "code": "NI", ticked: false},
                {"name": "Niger", "code": "NE", ticked: false},
                {"name": "Nigeria", "code": "NG", ticked: false},
                {"name": "Niue", "code": "NU", ticked: false},
                {"name": "Norfolk Island", "code": "NF", ticked: false},
                {"name": "Northern Mariana Islands", "code": "MP", ticked: false},
                {"name": "Norway", "code": "NO", ticked: false},
                {"name": "Oman", "code": "OM", ticked: false},
                {"name": "Pakistan", "code": "PK", ticked: false},
                {"name": "Palau", "code": "PW", ticked: false},
                {"name": "Palestinian Territory, Occupied", "code": "PS", ticked: false},
                {"name": "Panama", "code": "PA", ticked: false},
                {"name": "Papua New Guinea", "code": "PG", ticked: false},
                {"name": "Paraguay", "code": "PY", ticked: false},
                {"name": "Peru", "code": "PE", ticked: false},
                {"name": "Philippines", "code": "PH", ticked: false},
                {"name": "Pitcairn", "code": "PN", ticked: false},
                {"name": "Poland", "code": "PL", ticked: false},
                {"name": "Portugal", "code": "PT", ticked: false},
                {"name": "Puerto Rico", "code": "PR", ticked: false},
                {"name": "Qatar", "code": "QA", ticked: false},
                {"name": "Reunion", "code": "RE", ticked: false},
                {"name": "Romania", "code": "RO", ticked: false},
                {"name": "Russian Federation", "code": "RU", ticked: false},
                {"name": "RWANDA", "code": "RW", ticked: false},
                {"name": "Saint Helena", "code": "SH", ticked: false},
                {"name": "Saint Kitts and Nevis", "code": "KN", ticked: false},
                {"name": "Saint Lucia", "code": "LC", ticked: false},
                {"name": "Saint Pierre and Miquelon", "code": "PM", ticked: false},
                {"name": "Saint Vincent and the Grenadines", "code": "VC", ticked: false},
                {"name": "Samoa", "code": "WS", ticked: false},
                {"name": "San Marino", "code": "SM", ticked: false},
                {"name": "Sao Tome and Principe", "code": "ST", ticked: false},
                {"name": "Saudi Arabia", "code": "SA", ticked: false},
                {"name": "Senegal", "code": "SN", ticked: false},
                {"name": "Serbia and Montenegro", "code": "CS", ticked: false},
                {"name": "Seychelles", "code": "SC", ticked: false},
                {"name": "Sierra Leone", "code": "SL", ticked: false},
                {"name": "Singapore", "code": "SG", ticked: false},
                {"name": "Slovakia", "code": "SK", ticked: false},
                {"name": "Slovenia", "code": "SI", ticked: false},
                {"name": "Solomon Islands", "code": "SB", ticked: false},
                {"name": "Somalia", "code": "SO", ticked: false},
                {"name": "South Africa", "code": "ZA", ticked: false},
                {"name": "South Georgia and the South Sandwich Islands", "code": "GS", ticked: false},
                {"name": "Spain", "code": "ES", ticked: false},
                {"name": "Sri Lanka", "code": "LK", ticked: false},
                {"name": "Sudan", "code": "SD", ticked: false},
                {"name": "Suriname", "code": "SR", ticked: false},
                {"name": "Svalbard and Jan Mayen", "code": "SJ", ticked: false},
                {"name": "Swaziland", "code": "SZ", ticked: false},
                {"name": "Sweden", "code": "SE", ticked: false},
                {"name": "Switzerland", "code": "CH", ticked: false},
                {"name": "Syrian Arab Republic", "code": "SY", ticked: false},
                {"name": "Taiwan, Province of China", "code": "TW", ticked: false},
                {"name": "Tajikistan", "code": "TJ", ticked: false},
                {"name": "Tanzania, United Republic of", "code": "TZ", ticked: false},
                {"name": "Thailand", "code": "TH", ticked: false},
                {"name": "Timor-Leste", "code": "TL", ticked: false},
                {"name": "Togo", "code": "TG", ticked: false},
                {"name": "Tokelau", "code": "TK", ticked: false},
                {"name": "Tonga", "code": "TO", ticked: false},
                {"name": "Trinidad and Tobago", "code": "TT", ticked: false},
                {"name": "Tunisia", "code": "TN", ticked: false},
                {"name": "Turkey", "code": "TR", ticked: false},
                {"name": "Turkmenistan", "code": "TM", ticked: false},
                {"name": "Turks and Caicos Islands", "code": "TC", ticked: false},
                {"name": "Tuvalu", "code": "TV", ticked: false},
                {"name": "Uganda", "code": "UG", ticked: false},
                {"name": "Ukraine", "code": "UA", ticked: false},
                {"name": "United Arab Emirates", "code": "AE", ticked: false},
                {"name": "United Kingdom", "code": "GB", ticked: false},
                {"name": "United States Minor Outlying Islands", "code": "UM", ticked: false},
                {"name": "Uruguay", "code": "UY", ticked: false},
                {"name": "Uzbekistan", "code": "UZ", ticked: false},
                {"name": "Vanuatu", "code": "VU", ticked: false},
                {"name": "Venezuela", "code": "VE", ticked: false},
                {"name": "Vietnam", "code": "VN", ticked: false},
                {"name": "Virgin Islands, British", "code": "VG", ticked: false},
                {"name": "Virgin Islands, U.S.", "code": "VI", ticked: false},
                {"name": "Wallis and Futuna", "code": "WF", ticked: false},
                {"name": "Western Sahara", "code": "EH", ticked: false},
                {"name": "Yemen", "code": "YE", ticked: false},
                {"name": "Zambia", "code": "ZM", ticked: false},
                {"name": "Zimbabwe", "code": "ZW", ticked: false}
            ]
        })
        .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
                $routeProvider
                        .when('/admin/themeSettings', {templateUrl: '/views/lgns/headerfooterTheme.html', resolve: {isAuthenticated: doAuthenticate('ADMIN')}})
                        //=============================== For third party registration page =======================
                        .when('/register_buyer', {templateUrl: '/views/users/register_buyer.html', controller: 'ThirdPartyRegistrationCtrl', resolve: {isAuthenticated: iswhitelabeled}})
                        .when('/register_seller', {templateUrl: '/views/users/register_seller.html', controller: 'ThirdPartyRegistrationCtrl', resolve: {isAuthenticated: iswhitelabeled}})
                        .when('/register_lgn', {templateUrl: '/views/users/register_lgn.html', controller: 'ThirdPartyRegistrationCtrl'})
                        .when('/accept-invite/:inviteid', {templateUrl: '/views/users/invite-register.html', controller: 'ThirdPartyRegistrationCtrl'})
                        .when('/register_phoneagent', {templateUrl: '/views/users/register_phoneagent.html', controller: 'ThirdPartyRegistrationCtrl', resolve: {isAuthenticated: iswhitelabeled}})
                        .when('/optout/:mode/:contact_id', {templateUrl: '/views/advCC/optout.html', controller: 'OptoutCtrl'})
                        //==============================    Home/User section  ====================================
                        .when('/', {templateUrl: '/views/users/login.html', controller: 'AuthenticationsCtrl', resolve: {isAuthenticated: userTypeRedirection}})
                        .when('/login', {templateUrl: '/views/users/login.html', controller: 'AuthenticationsCtrl', resolve: {isAuthenticated: userTypeRedirection}})
                        .when('/register', {templateUrl: '/views/users/register.html', controller: 'AuthenticationsCtrl', resolve: {isAuthenticated: userTypeRedirection}})
                        .when('/activate_account/:token', {templateUrl: '/views/users/activate_account.html', controller: 'AuthenticationsCtrl'})
//                        .when('/admin/myaccount', {templateUrl: '/views/users/my_account.html', controller: 'OnboardLBCtrl', resolve: {isAuthenticated: doAuthenticate('ADMIN')}})
                        .when('/admin/myaccount', {templateUrl: '/views/users/my_account.html', controller: 'LgUserCtrl', resolve: {isAuthenticated: doAuthenticate('ADMIN')}})
                        .when('/forgot_password', {templateUrl: '/views/users/forgot_password.html', controller: 'AuthenticationsCtrl'})
                        .when('/reset_password/:token', {templateUrl: '/views/users/reset_password.html', controller: 'AuthenticationsCtrl'})
                        //============================   admin section  ===========================================
                        .when('/admin/agreements', {templateUrl: '/views/admins/esign.html', controller: 'esignctrl', resolve: {isAuthenticated: doAuthenticate('ADMIN')}})
                        .when('/admin/dashboard', {templateUrl: '/views/admins/dashboard.html', controller: 'SAASReportsCtrl', resolve: {isAuthenticated: doAuthenticate('ADMIN')}})
                        .when('/admin/role', {templateUrl: '/views/admins/role.html', controller: 'RolesCtrl', resolve: {isAuthenticated: doAuthenticate('ADMIN')}})
                        .when('/admin/category', {templateUrl: '/views/admins/category.html', controller: 'CategoriesCtrl', resolve: {isAuthenticated: doAuthenticate('ADMIN')}})
                        .when('/admin/vertical', {templateUrl: '/views/admins/vertical.html', controller: 'VerticalsCtrl', resolve: {isAuthenticated: doAuthenticate('ADMIN')}})
                        .when('/admin/userLGN', {templateUrl: '/views/admins/userLGN.html', controller: 'UsersCtrl', resolve: {isAuthenticated: doAuthenticate('ADMIN')}})
                        .when('/admin/userLB', {templateUrl: '/views/admins/userLB.html', controller: 'UsersCtrl', resolve: {isAuthenticated: doAuthenticate('ADMIN')}})
                        .when('/admin/userLS', {templateUrl: '/views/admins/userLS.html', controller: 'UsersCtrl', resolve: {isAuthenticated: doAuthenticate('ADMIN')}})
                        .when('/admin/userPA', {templateUrl: '/views/admins/userPA.html', controller: 'UsersCtrl', resolve: {isAuthenticated: doAuthenticate('ADMIN')}})
                        .when('/admin/userADVCC', {templateUrl: '/views/admins/userADVCC.html', controller: 'UsersCtrl', resolve: {isAuthenticated: doAuthenticate('ADMIN')}})
                        .when('/admin/editUser/:userid', {templateUrl: '/views/admins/editUser.html', controller: 'UsersCtrl', resolve: {isAuthenticated: doAuthenticate('ADMIN')}})
                        .when('/admin/viewUser/:userid', {templateUrl: '/views/admins/viewUser.html', controller: 'UsersCtrl', resolve: {isAuthenticated: doAuthenticate('ADMIN')}})
                        //.when('/admin/campaign', {templateUrl: '/views/admins/campaign.html', controller: 'CampaignsCtrl', resolve: {isAuthenticated: doAuthenticate('ADMIN')}})  //Not in use
                        .when('/admin/onboard-an-LGN', {templateUrl: '/views/admins/onboard-an-LGN.html', controller: 'OnboardLgnCtrl', resolve: {isAuthenticated: doAuthenticate('ADMIN')}})
                        // .when('/admin/onboard-an-LB', {templateUrl: '/views/admins/onboard-an-LB.html', controller:'OnboardLBCtrl', resolve : {isAuthenticated : doAuthenticate('ADMIN')}})
                        .when('/admin/onboard-an-advertiser', {templateUrl: '/views/admins/onboard-an-advertiser.html', controller: 'TabsCtrl', resolve: {isAuthenticated: doAuthenticate('ADMIN')}})
                        .when('/admin/create-a-campaign', {templateUrl: '/views/admins/create-a-campaign.html', controller: 'TabsCtrl', resolve: {isAuthenticated: doAuthenticate('ADMIN')}})
                        .when('/admin/original-offer', {templateUrl: '/views/admins/original-offer.html', controller: 'OfferTemplateCtrl', resolve: {isAuthenticated: doAuthenticate('ADMIN')}})
                        .when('/admin/original-offer/:offerid', {templateUrl: '/views/admins/original-offer.html', controller: 'OfferTemplateCtrl', resolve: {isAuthenticated: doAuthenticate('ADMIN')}})
                        .when('/admin/list-offer-template', {templateUrl: '/views/admins/list-offer.html', controller: 'OfferTemplateCtrl', resolve: {isAuthenticated: doAuthenticate('ADMIN')}})
                        .when('/admin/view-offer-template/:offerid', {templateUrl: '/views/admins/view-offer.html', controller: 'OfferTemplateCtrl', resolve: {isAuthenticated: doAuthenticate('ADMIN')}})
                        .when('/admin/invoice', {templateUrl: '/views/admins/invoice.html', controller: 'InvoiceCtrl', resolve: {isAuthenticated: doAuthenticate('ADMIN')}})
                        .when('/admin/plugin', {templateUrl: '/views/admins/plugin.html', controller: 'externalCntr', resolve: {isAuthenticated: doAuthenticate('ADMIN')}})
                        .when('/admin/list-caller-leads', {templateUrl: '/views/pa/listCallerLeads.html', controller: 'LeadManageCtrl', resolve: {isAuthenticated: doAuthenticate('ADMIN')}})
                        .when('/admin/campaign', {templateUrl: '/views/admins/list-campaign.html', controller: 'CampaignCtrl', resolve: {isAuthenticated: doAuthenticate('ADMIN')}})
                        //============================ Accounting ADMIN ====================================================
                        .when('/admin/add-payment-type', {templateUrl: '/views/accounting/addPaymentType.html', controller: 'LgUserCtrl', resolve: {isAuthenticated: doAuthenticate('ADMIN')}})
                        .when('/admin/accounts-payable', {templateUrl: '/views/accounting/accountsPayable.html', controller: 'AccountingCtrl', resolve: {isAuthenticated: doAuthenticate('ADMIN')}})
                        .when('/admin/accounts-receivable', {templateUrl: '/views/accounting/accountsReceivableSaaS.html', controller: 'AccountingCtrl', resolve: {isAuthenticated: doAuthenticate('ADMIN')}})
                        .when('/admin/payment-history', {templateUrl: '/views/accounting/paymentHistory.html', controller: 'AccountingCtrl', resolve: {isAuthenticated: doAuthenticate('ADMIN')}})
                        .when('/admin/send-one-time-invoice', {templateUrl: '/views/accounting/sendOneTimeInvoice.html', controller: 'AccountingCtrl', resolve: {isAuthenticated: doAuthenticate('ADMIN')}})
                        .when('/admin/invoice-template', {templateUrl: '/views/accounting/invoiceTemplate.html', controller: 'AccountingCtrl', resolve: {isAuthenticated: doAuthenticate('ADMIN')}})
                        .when('/admin/invoice-details/:invoiceid', {templateUrl: '/views/accounting/invoiceDetail.html', controller: 'InvoiceCtrl', resolve: {isAuthenticated: doAuthenticate('ADMIN')}})
                        .when('/admin/media-creation/list', {templateUrl: '/views/admins/listMediaCreation.html', controller: 'MediaCreationCtrl', resolve: {isAuthenticated: doAuthenticate('ADMIN')}})
                        //===================================   LGN section  ===========================================
                        .when('/lgn/dashboard', {templateUrl: '/views/lgns/dashboard.html', controller: 'LgnReportsCtrl', resolve: {isAuthenticated: doAuthenticate('LGN')}})
                        .when('/lgn/userLB', {templateUrl: '/views/lgns/userLB.html', controller: 'LgUserCtrl', resolve: {isAuthenticated: doAuthenticate('LGN')}})
                        .when('/lgn/userLG', {templateUrl: '/views/lgns/userLS.html', controller: 'LgUserCtrl', resolve: {isAuthenticated: doAuthenticate('LGN')}})
                        //.when('/lgn/user/:code', {templateUrl: '/views/lgns/user.html', controller: 'LgUserCtrl', resolve: {isAuthenticated: doAuthenticate('LGN')}})
                        .when('/lgn/vertical', {templateUrl: '/views/lgns/vertical.html', controller: 'VerticalsCtrl', resolve: {isAuthenticated: doAuthenticate('LGN')}})
                        .when('/lgn/offer', {templateUrl: '/views/lgns/offer.html', controller: 'OffersCtrl', resolve: {isAuthenticated: doAuthenticate('LGN')}})
                        .when('/lgn/myaccount', {templateUrl: '/views/lgns/my_account.html', controller: 'LgUserCtrl', resolve: {isAuthenticated: doAuthenticate('LGN')}})
                        .when('/lgn/addfunds', {templateUrl: '/views/lgns/addfund.html', controller: 'LgUserCtrl', resolve: {isAuthenticated: doAuthenticate('LGN')}})
                        .when('/lgn/onboard-an-LB', {templateUrl: '/views/lgns/onboard-an-LB.html', controller: 'OnboardLBCtrl', resolve: {isAuthenticated: doAuthenticate('LGN')}})
                        .when('/lgn/on_board/:id', {templateUrl: '/views/lgns/on_boarduser.html', controller: 'OnboardLBCtrl', resolve: {isAuthenticated: doAuthenticate('LGN')}})
                        .when('/lgn/call-gen-all-calls', {templateUrl: '/views/lgns/callHistory.html', controller: 'callHistoryCtrl', resolve: {isAuthenticated: doAuthenticate('LGN')}})
                        .when('/lgn/phone-numbers', {templateUrl: '/views/advCC/phone-numbers.html', controller: 'LsOfferCtrl', resolve: {isAuthenticated: doAuthenticate('LGN')}})
                        .when('/lgn/assign-ivr/:phoneid', {templateUrl: '/views/advCC/assignIVR.html', controller: 'LsOfferCtrl', resolve: {isAuthenticated: doAuthenticate('LGN')}})
                        .when('/lgn/edit-phone-numbers/:phoneid', {templateUrl: '/views/lg/addPhonenumber.html', controller: 'LsOfferCtrl', resolve: {isAuthenticated: doAuthenticate('LGN')}})
                        .when('/lgn/view-phone-numbers/:phoneid', {templateUrl: '/views/lg/viewPhonenumber.html', controller: 'LsOfferCtrl', resolve: {isAuthenticated: doAuthenticate('LGN')}})
                        .when('/lgn/list-caller-leads', {templateUrl: '/views/pa/listCallerLeads.html', controller: 'LeadManageCtrl', resolve: {isAuthenticated: doAuthenticate('LGN')}})
                        .when('/lgn/call-routing-prompts', {templateUrl: '/views/lg/prompts.html', controller: 'PromptsCtrl', resolve: {isAuthenticated: doAuthenticate('LGN')}})
                        .when('/lgn/call-routing-ivr', {templateUrl: '/views/lg/newIvr.html', controller: 'IVRCtrl', resolve: {isAuthenticated: doAuthenticate('LGN')}})
                        .when('/lgn/call-routing-ivr/edit/:id', {templateUrl: '/views/lg/newIvr.html', controller: 'IVREditCtrl', resolve: {isAuthenticated: doAuthenticate('LGN')}})
                        .when('/lgn/hours-of-operation', {templateUrl: '/views/lg/hoursOfOperation.html', controller: 'OperationCtrl', resolve: {isAuthenticated: doAuthenticate('LGN')}})
                        .when('/lgn/hours-of-operation/edit/:id', {templateUrl: '/views/lg/hoursOfOperation.html', controller: 'OperationEditCtrl', resolve: {isAuthenticated: doAuthenticate('LGN')}})
                        .when('/lgn/call-routing-geographic', {templateUrl: '/views/lg/geographic.html', controller: 'GeographicCtrl', resolve: {isAuthenticated: doAuthenticate('LGN')}})
//                        .when('/lgn/call-routing-campaigns', {templateUrl: '/views/lg/routingCampaigns.html', controller: 'RoutingCampaignCtrl', resolve: {isAuthenticated: doAuthenticate('LGN')}})
                        .when('/lgn/call-routing-concurrent-calls', {templateUrl: '/views/lg/concurrentCalls.html', controller: 'ConcurrentCallsCtrl', resolve: {isAuthenticated: doAuthenticate('LGN')}})
                        .when('/lgn/manage-call-routing', {templateUrl: '/views/lg/manageCallRouting.html', controller: 'ManageCallRoutingCtrl', resolve: {isAuthenticated: doAuthenticate('LGN')}})
                        .when('/lgn/new_lead_seller', {templateUrl: '/views/lg/register_seller.html', controller: 'OnboardLBCtrl', resolve: {isAuthenticated: doAuthenticate('LGN')}})
                        .when('/lgn/call-routing-geographic/edit/:id', {templateUrl: '/views/lg/geographic.html', controller: 'GeographicEditCtrl', resolve: {isAuthenticated: doAuthenticate('LGN')}})
                        .when('/lgn/call-routing-concurrent-calls/edit/:id', {templateUrl: '/views/lg/concurrentCalls.html', controller: 'ConcurrentCallsEditCtrl', resolve: {isAuthenticated: doAuthenticate('LGN')}})
                        .when('/lgn/approve-pay-calls', {templateUrl: '/views/lgns/approve-pay-calls.html', controller: 'callHistoryCtrl', resolve: {isAuthenticated: doAuthenticate('LGN')}})


                        .when('/lgn/crm-setup', {templateUrl: '/views/underConstruction.html', resolve: {isAuthenticated: doAuthenticate('LGN')}})
                        .when('/lgn/view-leads', {templateUrl: '/views/underConstruction.html', resolve: {isAuthenticated: doAuthenticate('LGN')}})
                        .when('/lgn/turn-off-crm', {templateUrl: '/views/underConstruction.html', resolve: {isAuthenticated: doAuthenticate('LGN')}})
                        //============================ Accounting LGN ====================================================
                        .when('/lgn/add-payment-type', {templateUrl: '/views/accounting/addPaymentType.html', controller: 'LgUserCtrl', resolve: {isAuthenticated: doAuthenticate('LGN')}})
                        .when('/lgn/accounts-payable', {templateUrl: '/views/accounting/accountsPayable.html', controller: 'AccountingCtrl', resolve: {isAuthenticated: doAuthenticate('LGN')}})
                        .when('/lgn/accounts-receivable', {templateUrl: '/views/accounting/accountsReceivable.html', controller: 'AccountingCtrl', resolve: {isAuthenticated: doAuthenticate('LGN')}})
                        .when('/lgn/payment-history', {templateUrl: '/views/accounting/paymentHistory.html', controller: 'AccountingCtrl', resolve: {isAuthenticated: doAuthenticate('LGN')}})
                        .when('/lgn/send-one-time-invoice', {templateUrl: '/views/accounting/sendOneTimeInvoice.html', controller: 'AccountingCtrl', resolve: {isAuthenticated: doAuthenticate('LGN')}})
                        .when('/lgn/invoice-template', {templateUrl: '/views/accounting/invoiceTemplate.html', controller: 'AccountingCtrl', resolve: {isAuthenticated: doAuthenticate('LGN')}})
                        .when('/lgn/invoice-details/:invoiceid', {templateUrl: '/views/accounting/invoiceDetail.html', controller: 'InvoiceCtrl', resolve: {isAuthenticated: doAuthenticate('LGN')}})
                        //.when('/lgn/onboard-an-LGN', {templateUrl: '/views/lgns/onboard-an-LB.html', controller: 'TabsCtrl', resolve: {isAuthenticated: doAuthenticate('LGN')}})
                        .when('/lgn/agreements', {templateUrl: '/views/admins/esign.html', controller: 'esignctrl', resolve: {isAuthenticated: doAuthenticate('LGN')}})

                        .when('/lgn/listDocument/:leadId', {templateUrl: '/views/advCC/listDocuments.html', controller: 'ADVCCDocUploadCtrl', resolve: {isAuthenticated: doAuthenticate('LGN')}})
                        //============================   Lead Buyer section  ==============================================
                        .when('/lb/dashboard', {templateUrl: '/views/lb/dashboard.html', controller: 'LbReportsCtrl', resolve: {isAuthenticated: doAuthenticate('LB')}})
                        .when('/lb/phone-agents', {templateUrl: '/views/lb/user.html', controller: 'UsersCtrl', resolve: {isAuthenticated: doAuthenticate('LB')}})
                        .when('/lb/offer', {templateUrl: '/views/lb/offer.html', controller: 'OffersCtrl', resolve: {isAuthenticated: doAuthenticate('LB')}})
                        .when('/lb/LB-create-campaign-form', {templateUrl: '/views/lb/LB-create-campaign-form.html', resolve: {isAuthenticated: doAuthenticate('LB')}})
                        .when('/lb/LB-create-campaign', {templateUrl: '/views/lb/LB-create-campaign.html', resolve: {isAuthenticated: doAuthenticate('LB')}})
                        .when('/lb/LB-view-IVR', {templateUrl: '/views/lb/LB-view-IVR.html', resolve: {isAuthenticated: doAuthenticate('LB')}})
                        .when('/lb/LB-create-IVR', {templateUrl: '/views/lb/LB-create-IVR.html', resolve: {isAuthenticated: doAuthenticate('LB')}})
                        .when('/lb/LB-manage-pa', {templateUrl: '/views/lb/LB-manage-pa.html', resolve: {isAuthenticated: doAuthenticate('LB')}})
                        .when('/lb/pa-queues', {templateUrl: '/views/lb/pa-IVR.html', resolve: {isAuthenticated: doAuthenticate('LB')}})
                        .when('/lb/pa-IRV', {templateUrl: '/views/lb/pa-IVR.html', resolve: {isAuthenticated: doAuthenticate('LB')}})
                        .when('/lb/myaccount', {templateUrl: '/views/lb/my_account.html', controller: 'LgUserCtrl', resolve: {isAuthenticated: doAuthenticate('LB')}})
                        .when('/lb/addfunds', {templateUrl: '/views/lgns/addfund.html', controller: 'LgUserCtrl', resolve: {isAuthenticated: doAuthenticate('LB')}})
                        .when('/lb/phone-numbers', {templateUrl: '/views/advCC/phone-numbers.html', controller: 'LsOfferCtrl', resolve: {isAuthenticated: doAuthenticate('LB')}})
                        .when('/lb/assign-ivr/:phoneid', {templateUrl: '/views/advCC/assignIVR.html', controller: 'LsOfferCtrl', resolve: {isAuthenticated: doAuthenticate('LB')}})
                        .when('/lb/edit-phone-numbers/:phoneid', {templateUrl: '/views/lg/addPhonenumber.html', controller: 'LsOfferCtrl', resolve: {isAuthenticated: doAuthenticate('LB')}})
                        .when('/lb/view-phone-numbers/:phoneid', {templateUrl: '/views/lg/viewPhonenumber.html', controller: 'LsOfferCtrl', resolve: {isAuthenticated: doAuthenticate('LB')}})
                        .when('/lb/create-an-offer', {templateUrl: '/views/lb/create-offer.html', controller: 'LbOfferCtrl', resolve: {isAuthenticated: doAuthenticate('LB')}})
                        .when('/lb/new-offer/:offerid', {templateUrl: '/views/lb/original-offer.html', controller: 'LbOfferCtrl', resolve: {isAuthenticated: doAuthenticate('LB')}})
                        .when('/lb/view-offer/:offerid', {templateUrl: '/views/lb/view-offer.html', controller: 'LbOfferCtrl', resolve: {isAuthenticated: doAuthenticate('LB')}})
                        .when('/lb/edit-offer/:editOfferid', {templateUrl: '/views/lb/original-offer.html', controller: 'LbOfferCtrl', resolve: {isAuthenticated: doAuthenticate('LB')}})
                        .when('/lb/list-offers', {templateUrl: '/views/lb/list-offer.html', controller: 'LbOfferCtrl', resolve: {isAuthenticated: doAuthenticate('LB')}})
                        .when('/lb/call-routing-prompts', {templateUrl: '/views/lg/prompts.html', controller: 'PromptsCtrl', resolve: {isAuthenticated: doAuthenticate('LB')}})
                        .when('/lb/call-routing-ivr', {templateUrl: '/views/lg/newIvr.html', controller: 'IVRCtrl', resolve: {isAuthenticated: doAuthenticate('LB')}})
                        .when('/lb/call-routing-ivr/edit/:id', {templateUrl: '/views/lg/newIvr.html', controller: 'IVREditCtrl', resolve: {isAuthenticated: doAuthenticate('LB')}})
                        .when('/lb/hours-of-operation', {templateUrl: '/views/lg/hoursOfOperation.html', controller: 'OperationCtrl', resolve: {isAuthenticated: doAuthenticate('LB')}})
                        .when('/lb/hours-of-operation/edit/:id', {templateUrl: '/views/lg/hoursOfOperation.html', controller: 'OperationEditCtrl', resolve: {isAuthenticated: doAuthenticate('LB')}})
                        .when('/lb/call-routing-geographic', {templateUrl: '/views/lg/geographic.html', controller: 'GeographicCtrl', resolve: {isAuthenticated: doAuthenticate('LB')}})
//                        .when('/lb/call-routing-campaigns', {templateUrl: '/views/lg/routingCampaigns.html', controller: 'RoutingCampaignCtrl', resolve: {isAuthenticated: doAuthenticate('LB')}})
                        .when('/lb/call-routing-concurrent-calls', {templateUrl: '/views/lg/concurrentCalls.html', controller: 'ConcurrentCallsCtrl', resolve: {isAuthenticated: doAuthenticate('LB')}})
                        .when('/lb/manage-call-routing', {templateUrl: '/views/lg/manageCallRouting.html', controller: 'ManageCallRoutingCtrl', resolve: {isAuthenticated: doAuthenticate('LB')}})
                        .when('/lb/active-campaigns', {templateUrl: '/views/lb/current-campaigns.html', controller: 'LbOfferCtrl', resolve: {isAuthenticated: doAuthenticate('LB')}})
                        .when('/lb/call-routing-geographic/edit/:id', {templateUrl: '/views/lg/geographic.html', controller: 'GeographicEditCtrl', resolve: {isAuthenticated: doAuthenticate('LB')}})
                        .when('/lb/call-routing-concurrent-calls/edit/:id', {templateUrl: '/views/lg/concurrentCalls.html', controller: 'ConcurrentCallsEditCtrl', resolve: {isAuthenticated: doAuthenticate('LB')}})
                        //============================ Accounting LB ====================================================
                        .when('/lb/add-payment-type', {templateUrl: '/views/accounting/addPaymentType_LB.html', controller: 'LgUserCtrl', resolve: {isAuthenticated: doAuthenticate('LB')}})
                        .when('/lb/accounts-payable', {templateUrl: '/views/accounting/accountsPayable.html', controller: 'AccountingCtrl', resolve: {isAuthenticated: doAuthenticate('LB')}})
                        .when('/lb/accounts-receivable', {templateUrl: '/views/accounting/accountsReceivable.html', controller: 'AccountingCtrl', resolve: {isAuthenticated: doAuthenticate('LB')}})
                        .when('/lb/payment-history', {templateUrl: '/views/accounting/paymentHistory.html', controller: 'AccountingCtrl', resolve: {isAuthenticated: doAuthenticate('LB')}})
                        .when('/lb/send-one-time-invoice', {templateUrl: '/views/accounting/sendOneTimeInvoice.html', controller: 'AccountingCtrl', resolve: {isAuthenticated: doAuthenticate('LB')}})
                        .when('/lb/invoice-template', {templateUrl: '/views/accounting/invoiceTemplate.html', controller: 'AccountingCtrl', resolve: {isAuthenticated: doAuthenticate('LB')}})
                        .when('/lb/invoice-details/:invoiceid', {templateUrl: '/views/accounting/invoiceDetail.html', controller: 'InvoiceCtrl', resolve: {isAuthenticated: doAuthenticate('LB')}})
                        .when('/lb/make-payment/:invoiceid', {templateUrl: '/views/accounting/makePayment.html', controller: 'InvoiceCtrl', resolve: {isAuthenticated: doAuthenticate('LB')}})
                        .when('/lb/LG-create-campaign-form/:offerid', {templateUrl: '/views/lg/LG-create-campaign-form.html', controller: 'CampaignCtrl', resolve: {isAuthenticated: doAuthenticate('LB')}})
                        .when('/lb/LG-create-campaign', {templateUrl: '/views/lg/LG-create-campaign.html', controller: 'LsOfferCtrl', resolve: {isAuthenticated: doAuthenticate('LB')}})
                        .when('/lb/send-invite/:code', {templateUrl: '/views/lg/send-invite.html', controller: 'sendInviteCtrl', resolve: {isAuthenticated: doAuthenticate('LB')}})

                        .when('/lb/list-caller-leads', {templateUrl: '/views/pa/listCallerLeads.html', controller: 'LeadManageCtrl', resolve: {isAuthenticated: doAuthenticate('LB')}})
                        .when('/lb/listDocument/:leadId', {templateUrl: '/views/advCC/listDocuments.html', controller: 'ADVCCDocUploadCtrl', resolve: {isAuthenticated: doAuthenticate('LB')}})
                        //============================   Lead Generator (Sellers) section  ===========================================
                        .when('/lg/dashboard', {templateUrl: '/views/lg/dashboard.html', controller: 'LgReportsCtrl', resolve: {isAuthenticated: doAuthenticate('LG')}})
                        .when('/lg/offer', {templateUrl: '/views/lg/offer.html', controller: 'OffersCtrl', resolve: {isAuthenticated: doAuthenticate}})
                        .when('/lg/LG-create-campaign-form/:offerid', {templateUrl: '/views/lg/LG-create-campaign-form.html', controller: 'CampaignCtrl', resolve: {isAuthenticated: doAuthenticate('LG')}})
                        .when('/lg/LG-create-campaign', {templateUrl: '/views/lg/LG-create-campaign.html', controller: 'LsOfferCtrl', resolve: {isAuthenticated: doAuthenticate('LG')}})
                        .when('/lg/LG-view-IVR', {templateUrl: '/views/lg/LG-view-IVR.html', resolve: {isAuthenticated: doAuthenticate('LG')}})
                        .when('/lg/LG-create-IVR', {templateUrl: '/views/lg/LG-create-IVR.html', resolve: {isAuthenticated: doAuthenticate('LG')}})
                        .when('/lg/myaccount', {templateUrl: '/views/lg/my_account.html', controller: 'LgUserCtrl', resolve: {isAuthenticated: doAuthenticate('LG')}})
                        .when('/lg/lead-sellers-calls', {templateUrl: '/views/lg/callHistory.html', controller: 'LgUserCtrl', resolve: {isAuthenticated: doAuthenticate('LG')}})
                        .when('/lg/phone-numbers', {templateUrl: '/views/advCC/phone-numbers.html', controller: 'LsOfferCtrl', resolve: {isAuthenticated: doAuthenticate('LG')}})
                        .when('/lg/add-phone-numbers', {templateUrl: '/views/lg/addPhonenumber.html', controller: 'LsOfferCtrl', resolve: {isAuthenticated: doAuthenticate('LG')}})
                        .when('/lg/edit-phone-numbers/:phoneid', {templateUrl: '/views/lg/addPhonenumber.html', controller: 'LsOfferCtrl', resolve: {isAuthenticated: doAuthenticate('LG')}})
                        .when('/lg/view-phone-numbers/:phoneid', {templateUrl: '/views/lg/viewPhonenumber.html', controller: 'LsOfferCtrl', resolve: {isAuthenticated: doAuthenticate('LG')}})
                        .when('/lg/view-all-offer', {templateUrl: '/views/lg/list-offer.html', controller: 'LsOfferCtrl', resolve: {isAuthenticated: doAuthenticate('LG')}})
                        .when('/lg/current-campaigns', {templateUrl: '/views/lg/current-campaigns.html', controller: 'LsOfferCtrl', resolve: {isAuthenticated: doAuthenticate('LG')}})

                        .when('/lg/call-routing-prompts', {templateUrl: '/views/lg/prompts.html', controller: 'PromptsCtrl', resolve: {isAuthenticated: doAuthenticate('LG')}})
                        .when('/lg/call-routing-ivr', {templateUrl: '/views/lg/newIvr.html', controller: 'IVRCtrl', resolve: {isAuthenticated: doAuthenticate('LG')}})
                        .when('/lg/call-routing-ivr/edit/:id', {templateUrl: '/views/lg/newIvr.html', controller: 'IVREditCtrl', resolve: {isAuthenticated: doAuthenticate('LG')}})
                        .when('/lg/hours-of-operation', {templateUrl: '/views/lg/hoursOfOperation.html', controller: 'OperationCtrl', resolve: {isAuthenticated: doAuthenticate('LG')}})
                        .when('/lg/hours-of-operation/edit/:id', {templateUrl: '/views/lg/hoursOfOperation.html', controller: 'OperationEditCtrl', resolve: {isAuthenticated: doAuthenticate('LG')}})
                        .when('/lg/call-routing-geographic', {templateUrl: '/views/lg/geographic.html', controller: 'GeographicCtrl', resolve: {isAuthenticated: doAuthenticate('LG')}})
//                        .when('/lb/call-routing-campaigns', {templateUrl: '/views/lg/routingCampaigns.html', controller: 'RoutingCampaignCtrl', resolve: {isAuthenticated: doAuthenticate('LB')}})
                        .when('/lg/call-routing-concurrent-calls', {templateUrl: '/views/lg/concurrentCalls.html', controller: 'ConcurrentCallsCtrl', resolve: {isAuthenticated: doAuthenticate('LG')}})
                        .when('/lg/manage-call-routing', {templateUrl: '/views/lg/manageCallRouting.html', controller: 'ManageCallRoutingCtrl', resolve: {isAuthenticated: doAuthenticate('LG')}})
                        .when('/lg/active-campaigns', {templateUrl: '/views/lb/current-campaigns.html', controller: 'LbOfferCtrl', resolve: {isAuthenticated: doAuthenticate('LG')}})
                        .when('/lg/call-routing-geographic/edit/:id', {templateUrl: '/views/lg/geographic.html', controller: 'GeographicEditCtrl', resolve: {isAuthenticated: doAuthenticate('LG')}})
                        .when('/lg/call-routing-concurrent-calls/edit/:id', {templateUrl: '/views/lg/concurrentCalls.html', controller: 'ConcurrentCallsEditCtrl', resolve: {isAuthenticated: doAuthenticate('LG')}})
                        //============================ Accounting LG ====================================================
                        .when('/lg/add-payment-type', {templateUrl: '/views/accounting/addPaymentType.html', controller: 'LgUserCtrl', resolve: {isAuthenticated: doAuthenticate('LG')}})
                        .when('/lg/accounts-payable', {templateUrl: '/views/accounting/accountsPayable.html', controller: 'AccountingCtrl', resolve: {isAuthenticated: doAuthenticate('LG')}})
                        .when('/lg/accounts-receivable', {templateUrl: '/views/accounting/accountsReceivable.html', controller: 'AccountingCtrl', resolve: {isAuthenticated: doAuthenticate('LG')}})
                        .when('/lg/payment-history', {templateUrl: '/views/accounting/paymentHistory.html', controller: 'AccountingCtrl', resolve: {isAuthenticated: doAuthenticate('LG')}})
                        .when('/lg/send-one-time-invoice', {templateUrl: '/views/accounting/sendOneTimeInvoice.html', controller: 'AccountingCtrl', resolve: {isAuthenticated: doAuthenticate('LG')}})
                        .when('/lg/invoice-template', {templateUrl: '/views/accounting/invoiceTemplate.html', controller: 'AccountingCtrl', resolve: {isAuthenticated: doAuthenticate('LG')}})
                        .when('/lg/invoice-details/:invoiceid', {templateUrl: '/views/accounting/invoiceDetail.html', controller: 'InvoiceCtrl', resolve: {isAuthenticated: doAuthenticate('LG')}})
                        .when('/lg/send-invite/:code', {templateUrl: '/views/lg/send-invite.html', controller: 'sendInviteCtrl', resolve: {isAuthenticated: doAuthenticate('LG')}})
                        .when('/lg/list-caller-leads', {templateUrl: '/views/pa/listCallerLeads.html', controller: 'LeadManageCtrl', resolve: {isAuthenticated: doAuthenticate('LG')}})
                        .when('/lg/listDocument/:leadId', {templateUrl: '/views/advCC/listDocuments.html', controller: 'ADVCCDocUploadCtrl', resolve: {isAuthenticated: doAuthenticate('LG')}})

                        //============================   Phone Agent section  ==============================================
                        .when('/pa/myaccount', {templateUrl: '/views/pa/my_account.html', controller: 'LgUserCtrl', resolve: {isAuthenticated: doAuthenticate('PA')}})
                        .when('/pa/dashboard', {templateUrl: '/views/pa/dashboard.html', controller: 'LeadManageCtrl', resolve: {isAuthenticated: doAuthenticate('PA')}})
                        .when('/pa/web-phone', {templateUrl: '/views/pa/webPhone.html', controller: 'LeadManageCtrl', resolve: {isAuthenticated: doAuthenticate('PA')}})
                        .when('/pa/call-history', {templateUrl: '/views/pa/callHistory.html', controller: 'callHistoryCtrl', resolve: {isAuthenticated: doAuthenticate('PA')}})
                        .when('/pa/check-messages', {templateUrl: '/views/pa/check-messages.html', controller: 'voice_mailHistoryCtrl', resolve: {isAuthenticated: doAuthenticate('PA')}})
                        .when('/pa/pa-voicemail-setup', {templateUrl: '/views/pa/voicemail.html', resolve: {isAuthenticated: doAuthenticate('PA')}})
                        .when('/pa/call-forwarding', {templateUrl: '/views/pa/callForwarding.html', controller: 'paCallForwardCtrl', resolve: {isAuthenticated: doAuthenticate('PA')}})
                        .when('/pa/web-phone-info', {templateUrl: '/views/pa/webPhoneInfo.html', resolve: {isAuthenticated: doAuthenticate('PA')}})
                        .when('/pa/camapign-details', {templateUrl: '/views/pa/camapignDetails.html', resolve: {isAuthenticated: doAuthenticate('PA')}})
                        .when('/pa/list-caller-leads', {templateUrl: '/views/pa/listCallerLeads.html', controller: 'LeadManageCtrl', resolve: {isAuthenticated: doAuthenticate('PA')}})
                        .when('/pa/caller-lead/:leadid', {templateUrl: '/views/pa/viewCallerLead.html', controller: 'LeadManageCtrl', resolve: {isAuthenticated: doAuthenticate('PA')}})
                        .when('/pa/edit-caller-lead/:leadid', {templateUrl: '/views/pa/editCallerLead.html', controller: 'LeadManageCtrl', resolve: {isAuthenticated: doAuthenticate('PA')}})

                        .when('/pa/upload-documents/:leadId', {templateUrl: '/views/advCC/upload-documents.html', controller: 'ADVCCDocUploadCtrl', resolve: {isAuthenticated: doAuthenticate('PA')}})
                        .when('/pa/listDocument/:leadId', {templateUrl: '/views/advCC/listDocuments.html', controller: 'ADVCCDocUploadCtrl', resolve: {isAuthenticated: doAuthenticate('PA')}})

                        .when('/pa/calendar', {templateUrl: '/views/pa/calendar.html', controller: 'CalendarCtrl', resolve: {isAuthenticated: doAuthenticate('PA')}})
                        
                
                         .when('/pa-external-number', {templateUrl: '/views/underConstruction.html', resolve: {isAuthenticated: doAuthenticate('PA')}})   
                         .when('/pa-queue', {templateUrl: '/views/underConstruction.html', resolve: {isAuthenticated: doAuthenticate('PA')}})   
                         .when('/pa-extension', {templateUrl: '/views/underConstruction.html', resolve: {isAuthenticated: doAuthenticate('PA')}})   
                
                        //============================ ADVCC ====================================================
                        .when('/advcc/dashboard', {templateUrl: '/views/advCC/dashboard.html', controller: 'ADVCCReportsCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/phone-numbers', {templateUrl: '/views/advCC/phone-numbers.html', controller: 'LsOfferCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/edit-phone-numbers/:phoneid', {templateUrl: '/views/lg/addPhonenumber.html', controller: 'LsOfferCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/view-phone-numbers/:phoneid', {templateUrl: '/views/lg/viewPhonenumber.html', controller: 'LsOfferCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/assign-ivr/:phoneid', {templateUrl: '/views/advCC/assignIVR.html', controller: 'LsOfferCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/phone-agents', {templateUrl: '/views/advCC/phoneAgents.html', controller: 'ADVCCPACtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/queues', {templateUrl: '/views/advCC/queues.html', controller: 'ADVCCQueueCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/call-routing-prompts', {templateUrl: '/views/lg/prompts.html', controller: 'PromptsCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/call-routing-ivr', {templateUrl: '/views/lg/newIvr.html', controller: 'IVRCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/call-routing-ivr/edit/:id', {templateUrl: '/views/lg/newIvr.html', controller: 'IVREditCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/hours-of-operation', {templateUrl: '/views/lg/hoursOfOperation.html', controller: 'OperationCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/hours-of-operation/edit/:id', {templateUrl: '/views/lg/hoursOfOperation.html', controller: 'OperationEditCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/call-routing-geographic', {templateUrl: '/views/lg/geographic.html', controller: 'GeographicCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/inbound-trunk', {templateUrl: '/views/advCC/inboundTrunk.html', controller: 'InboundTrunkCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/inbound-trunk/edit/:id', {templateUrl: '/views/advCC/inboundTrunk.html', controller: 'InboundTrunkEditCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
//                        .when('/advcc/call-routing-campaigns', {templateUrl: '/views/lg/routingCampaigns.html', controller: 'RoutingCampaignCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/call-routing-concurrent-calls', {templateUrl: '/views/lg/concurrentCalls.html', controller: 'ConcurrentCallsCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/manage-call-routing', {templateUrl: '/views/lg/manageCallRouting.html', controller: 'ManageCallRoutingCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/create-an-offer', {templateUrl: '/views/lb/create-offer.html', controller: 'LbOfferCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/new-offer/:offerid', {templateUrl: '/views/lb/original-offer.html', controller: 'LbOfferCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/view-offer/:offerid', {templateUrl: '/views/lb/view-offer.html', controller: 'LbOfferCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/edit-offer/:editOfferid', {templateUrl: '/views/lb/original-offer.html', controller: 'LbOfferCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/list-offers', {templateUrl: '/views/lb/list-offer.html', controller: 'LbOfferCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})

                        .when('/advcc/ADVCC-create-campaign', {templateUrl: '/views/lg/LG-create-campaign.html', controller: 'LsOfferCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/LG-create-campaign-form/:offerid', {templateUrl: '/views/lg/LG-create-campaign-form.html', controller: 'CampaignCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})

                        .when('/advcc/myaccount', {templateUrl: '/views/lb/my_account.html', controller: 'LgUserCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/addfunds', {templateUrl: '/views/lgns/addfund.html', controller: 'LgUserCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/active-campaigns', {templateUrl: '/views/lb/current-campaigns.html', controller: 'LbOfferCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/call-routing-geographic/edit/:id', {templateUrl: '/views/lg/geographic.html', controller: 'GeographicEditCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/call-routing-concurrent-calls/edit/:id', {templateUrl: '/views/lg/concurrentCalls.html', controller: 'ConcurrentCallsEditCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/list-agent-script', {templateUrl: '/views/advCC/listAgentScript.html', controller: 'agentScriptListCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/list-calendar-script', {templateUrl: '/views/advCC/listCalendarScript.html', controller: 'agentScriptListCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/agent-script/:scriptId?', {templateUrl: '/views/advCC/agentScriptBuilder.html', controller: 'agentScriptCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/calendar-script/:scriptId?', {templateUrl: '/views/advCC/calendarScriptBuilder.html', controller: 'calendarScriptCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/test/:scriptId?', {templateUrl: '/views/advCC/Test.html', controller: 'TestCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/list-caller-leads', {templateUrl: '/views/pa/listCallerLeads.html', controller: 'LeadManageCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/outboundCallCampaign', {templateUrl: '/views/advCC/outboundCampaign.html', controller: 'advccOutboundCallCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        //============================ Accounting ADVCC ====================================================

                        //.when('/advcc/upload-documents', {templateUrl: '/views/advCC/upload-documents.html', controller: 'ADVCCDocUploadCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/listDocument/:leadId', {templateUrl: '/views/advCC/listDocuments.html', controller: 'ADVCCDocUploadCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/tourdemo', {templateUrl: '/views/advCC/test.html', controller: 'TestCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        //============================ Accounting ADVCC ====================================================
                        .when('/advcc/add-payment-type', {templateUrl: '/views/accounting/addPaymentType_LB.html', controller: 'LgUserCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/accounts-payable', {templateUrl: '/views/accounting/accountsPayable.html', controller: 'AccountingCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/accounts-receivable', {templateUrl: '/views/accounting/accountsReceivable.html', controller: 'AccountingCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/payment-history', {templateUrl: '/views/accounting/paymentHistory.html', controller: 'AccountingCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/send-one-time-invoice', {templateUrl: '/views/accounting/sendOneTimeInvoice.html', controller: 'AccountingCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/invoice-template', {templateUrl: '/views/accounting/invoiceTemplate.html', controller: 'AccountingCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/invoice-details/:invoiceid', {templateUrl: '/views/accounting/invoiceDetail.html', controller: 'InvoiceCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/attribution-campaign/add', {templateUrl: '/views/advCC/addAttributionCampaign.html', controller: 'AttributionCampaignCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/attribution-campaign/edit/:attr_id', {templateUrl: '/views/advCC/addAttributionCampaign.html', controller: 'AttributionCampaignCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/attribution-campaign', {templateUrl: '/views/advCC/attributionCampaign.html', controller: 'AttributionCampaignCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/media-creation/request', {templateUrl: '/views/advCC/addMediaCreation.html', controller: 'MediaCreationCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        //============================ ADVCC Contacts ====================================================
                        .when('/advcc/importContact-IntoCrm', {templateUrl: '/views/advCC/importContact.html', controller: 'ImportContactCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/contacts', {templateUrl: '/views/advCC/contact.html', controller: 'ContactCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        //cron list
                        .when('/advcc/cronList', {templateUrl: '/views/advCC/cronList.html', controller: 'ContactCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        //cron view
                        .when('/advcc/viewcron/:userid', {templateUrl: '/views/advcc/viewcron.html', controller: 'ContactCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})

                        .when('/advcc/contacts/add-contact', {templateUrl: '/views/advCC/addContact.html', controller: 'ContactCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/contacts/add-contact/:listid', {templateUrl: '/views/advCC/addContact.html', controller: 'ContactCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/contacts/edit-contact/:contactid', {templateUrl: '/views/advCC/addContact.html', controller: 'ContactCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/contacts/view-contacts/:listid', {templateUrl: '/views/advCC/viewContact.html', controller: 'ContactCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/contacts/compose-message', {templateUrl: '/views/advCC/composeMessage.html', controller: 'ContactCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/contacts/compose-message/:agenda_id', {templateUrl: '/views/advCC/composeMessage.html', controller: 'ContactCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        .when('/advcc/contacts/message-history', {templateUrl: '/views/advCC/messageHistory.html', controller: 'ContactCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        //============================ ADVCC Templates ====================================================
                        //Emailtemplatelist
                        .when('/advcc/templateList', {templateUrl: '/views/advCC/templateList.html', controller: 'TemplateCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        //addEmailTemplate
                        .when('/advcc/templates/add', {templateUrl: '/views/advCC/addEmailTemplate.html', controller: 'TemplateCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        // Edit Template
                        .when('/advcc/templates/edit/:id', {templateUrl: '/views/advCC/addEmailTemplate.html', controller: 'TemplateCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        //view Template
                        .when('/advcc/viewTemplate/:userid', {templateUrl: '/views/advcc/viewTemplate.html', controller: 'TemplateCtrl', resolve: {isAuthenticated: doAuthenticate('ADVCC')}})
                        //============================ Common LGN-Admin ====================================================
                        .when('/my-inbox', {templateUrl: '/views/admins/internal_communication.html', controller: 'InternalCommunicationCtrl', resolve: {isAuthenticated: doAuthenticate}})
                        .when('/compose', {templateUrl: '/views/admins/compose_message.html', controller: 'InternalCommunicationCtrl', resolve: {isAuthenticated: doAuthenticate}})
                        //====================== Report A Bug Page =========================================================
                        .when('/pa/twilio-web-phone', {templateUrl: '/views/pa/twilioWebPhone.html', resolve: {isAuthenticated: doAuthenticate('PA')}})
                        .when('/support', {templateUrl: '/views/underConstruction.html', resolve: {isAuthenticated: doAuthenticate('ALL')}})
                        .when('/reference-table', {templateUrl: '/views/advCC/referentialTable.html', controller: 'ReferentialTableCtrl', resolve: {isAuthenticated: doAuthenticate('ALL')}})
                        .when('/report-a-bug', {templateUrl: '/views/report-a-bug.html', resolve: {isAuthenticated: doAuthenticate('ALL')}})
                        .when('/docs/createWebLead', {templateUrl: '/views/docs/webLeadAPI.html', resolve: {isAuthenticated: doAuthenticate('ALL')}})

                        .otherwise('/error', {templateUrl: '/views/error.html', controller: 'AuthenticationsCtrl', resolve: {isAuthenticated: doAuthenticate('ALL')}})
                        .otherwise({templateUrl: '/views/error.html', controller: 'AuthenticationsCtrl', resolve: {isAuthenticated: doAuthenticate('ALL')}});
                $locationProvider.html5Mode(false); // true for making hash invisible

            }])
        // .config(function($httpProvider){
        //             $httpProvider.interceptors.push(function ($q) {
        //                 return {
        //                     request: function (config) {
        //                         var authToken = 'admin' + ":" + 'test';
        //                         config.headers = config.headers || {};
        //                         if (authToken) {
        //                             config.headers.Authorization = 'Basic YWRtaW46dGVzdA=='//'basic ' + authToken;
        //                         }
        //                         return config || $q.when(config);
        //                     }
        //                 };
        //             });
        //             })
        .config(['$locationProvider', function ($locationProvider) {
                $locationProvider.hashPrefix('!');
            }
        ])
        .directive('match', function () {
            return {
                require: 'ngModel',
                restrict: 'A',
                scope: {
                    match: '='
                },
                link: function (scope, elem, attrs, ctrl) {
                    scope.$watch(function () {
                        var modelValue = ctrl.$modelValue || ctrl.$$invalidModelValue;
                        return (ctrl.$pristine && angular.isUndefined(modelValue)) || scope.match === modelValue;
                    }, function (currentValue) {
                        ctrl.$setValidity('match', currentValue);
                    });
                }
            };
        })

var doAuthenticate = function (tokenType) {
    return ["User", "$q", "$rootScope", "$location", "$filter", "$cookieStore", function (User, $q, $rootScope, $location, $filter, $cookieStore) {
            var deferred = $q.defer();
            User.isAuth().get(function (response) {
                $rootScope.currentDate = $filter('date')(new Date(), 'ddMMyyyy');
                if (response.code == '200') {

                    if (response.data.webphone_details && response.data.webphone_details.plivo_sip_username) {
                        console.log(123, response.data.webphone_details.plivo_sip_username);
                        console.log(768, response.data.webphone_details.plivo_sip_password);

                        pUser = response.data.webphone_details.plivo_sip_username;
                        pPass = response.data.webphone_details.plivo_sip_password;
                    } else {
                        pUser = 'fakeDontRemove';
                        pPass = 'fakeDontRemove';
                    }

                    /* Base URL for Rest Api's */
                    if ($location.host() == 'localhost') {
                        var baseUrl = $location.protocol() + "://" + $location.host() + ":" + $location.port();
                    } else {
                        var baseUrl = $location.protocol() + '://' + $location.host();
                    }

                    $rootScope.baseURL = baseUrl;
                    $rootScope.authenticatedUser = response.data;
                    $rootScope.currentRoleCode = $filter('lowercase')($rootScope.authenticatedUser.role_id.code);
                    $rootScope.userIdForApi = response.data._id;
                    $rootScope.webApiToken = response.data.webApi_token;
                    $rootScope.authenticated = true;
                    $rootScope.header = true;
                    if (response.data.role_id.code != tokenType && tokenType != 'ALL') {
                        $location.path('/error');
                        deferred.resolve(true);
                    } else
                        deferred.resolve(true);

                } else {
                    $cookieStore.put("url", $location.path());
                    $rootScope.authenticated = false;
                    $rootScope.header = false;
                    $rootScope.authenticatedUser = null;
                    $location.path('/login');
                    deferred.resolve(false);
                }
                return deferred.promise;
            })
        }];
};

var iswhitelabeled = function (User, $q, $rootScope, $location, $filter) {
    var deferred = $q.defer();
    User.iswhitelabeled().get(function (response) {
        if (response.code == '200') {
            $rootScope.whitelabelData = response.data;
            $rootScope.currentRoleCode = $filter('lowercase')($rootScope.authenticatedUser.role_id.code);
            $rootScope.iswhitelabeled = true;
            $rootScope.header = true;
            deferred.resolve(true);
        } else {
            $rootScope.iswhitelabeled = false;
            $rootScope.header = false;
            $location.path('/login');
            deferred.resolve(false);
        }
        return deferred.promise;
    })
};
function userTypeRedirection($rootScope, User, $location) {
    $rootScope.header = false;
    User.iswhitelabeled().get(function (response) {
        if (response.code == '200') {
            $rootScope.iswhitelabeled = true;
        } else {
            $rootScope.iswhitelabeled = false;
        }

        User.isAuth().get(function (response) {
            if (response.code == '200') {
                $rootScope.authenticatedUser = response.data;
                if ($rootScope.authenticatedUser) {
                    switch ($rootScope.authenticatedUser.role_id.code) {
                        case "ADMIN" :
                            $location.path("/admin/dashboard"); // admin section
                            break;
                        case "LGN" :
                            $location.path("/lgn/dashboard"); // lead generation network owner section
                            break;
                        case "LB" :
                            $location.path("/lb/dashboard"); // lead buyer section
                            break;
                        case "LG" :
                            $location.path("/lg/dashboard"); // lead generator section
                            break;
                        case "PA" :
                            // $location.path("/pa/web-phone"); // for phone agent section
                            $location.path("/pa/dashboard"); // for phone agent section
                            break;
                        case "ADVCC" :
                            $location.path("/advcc/phone-agents"); // for phone agent section
                            break;
                        default :
                            User.logout().get();
                            break;
                    }
                } else {
                    $location.path('/login');
                }
            }
        })
    });
}


app.filter("sanitize", ['$sce', function ($sce) {
        return function (htmlCode) {
            return $sce.trustAsHtml(htmlCode);
        };
    }]);

app.filter("trustUrl", ['$sce', function ($sce) {
        return function (recordingUrl) {
            return $sce.trustAsResourceUrl(recordingUrl);
        };
    }]);

app.filter('secondsToDateTime', [function () {
        return function (seconds) {
            return new Date(1970, 0, 1).setSeconds(seconds);
        };
    }]);

app.filter('encryptCampaignId', [function () {
        return function (campaignId) {
            console.log('campaignId', campaignId);
//            var encrypted = CryptoJS.AES.encrypt(campaignId, "campaignId").toString();
//            return encrypted;


            //var value = randomValueBase64(9);
//            var secretString = JSON.stringify('campaign_id');
//            var encrypted = CryptoJS.TripleDES.encrypt(secretString, campaignId);
//            return encrypted.toString();

            //56e67fa49a1180f718501967
//            var string = "U2FsdGVkX1+K45YTkkwhUw8pjzpOA1gY6xAOcRhv5rEs7gsWUNAHHntrYdt6Qrwd"
//            var decrypted = CryptoJS.AES.decrypt(string, "campaignId");
//            return CryptoJS.enc.Utf8.stringify(decrypted);


//            var str = JSON.stringify(campaignId);
//            return CryptoJS.SHA1(str).toString();

        };
    }]);


app.filter('restrictedStateTooltip', [function () {
        return function (PAArray) {
            var PAHTML = '';
            if (PAArray) {
                var count = PAArray.length;
                if (count) {
                    angular.forEach(PAArray, function (PA) {
                        if (--count) {
                            PAHTML += PA + '<br>';
                        } else {
                            PAHTML += PA;
                        }
                    });
                }
            }
            return PAHTML || 'N/A';//PAArray;
        };
    }]);

app.filter('totalAmt', [function () {
        return function (amtArray) {
            var totalAmt = 0;
            if (amtArray) {
                _.each(amtArray, function (amt) {
                    totalAmt += amt ? amt : 0;
                });
            }
            return totalAmt;
        };
    }]);

app.filter('associatedPATooltip', [function () {
        return function (PAArray) {
            var PAHTML = '';
            if (PAArray) {
                var count = PAArray.length;
                if (count) {
                    angular.forEach(PAArray, function (PA) {
                        if (--count) {
                            PAHTML += PA.agent_id.first_name + ' ' + PA.agent_id.last_name + '<br>';
                        } else {
                            PAHTML += PA.agent_id.first_name + ' ' + PA.agent_id.last_name;
                        }
                    });
                }
            }
            return PAHTML || 'N/A';//PAArray;
        };
    }]);

app.filter('listTooltip', [function () {
        return function (listArray) {
            var html = '';
            if (listArray) {
                var count = listArray.length;
                if (count) {
                    angular.forEach(listArray, function (list) {
                        if (--count) {
                            html += list.list_name + '<br>';
                        } else {
                            html += list.list_name;
                        }
                    });
                }
            }
            return html || 'N/A';//PAArray;
        };
    }]);

app.filter('associatedPACalendarTooltip', [function () {
        return function (PAArray) {
            var PAHTML = '';
            if (PAArray) {
                var count = PAArray.length;
                if (count) {
                    angular.forEach(PAArray, function (PA) {
                        if (--count) {
                            PAHTML += PA.first_name + ' ' + PA.last_name + '<br>';
                        } else {
                            PAHTML += PA.first_name + ' ' + PA.last_name;
                        }
                    });
                }
            }
            return PAHTML || 'N/A';//PAArray;
        };
    }]);

app.filter('associatedQueuesTooltip', [function () {
        return function (QueueArray) {
            var QueueHTML = '';
            if (QueueArray) {
                var count = QueueArray.length;
                if (count) {
                    angular.forEach(QueueArray, function (PA) {
                        if (--count) {
                            QueueHTML += PA.queue_name + '<br>';
                        } else {
                            QueueHTML += PA.queue_name;
                        }
                    });
                }
            }
            return QueueHTML || 'N/A';
        };
    }]);

app.filter('calendarScriptTooltip', [function () {
        return function (ScriptArray) {
            var HTML = '';
            if (ScriptArray) {
                var count = ScriptArray.length;
                if (count) {
                    angular.forEach(ScriptArray, function (script) {
                        if (--count) {
                            HTML += script.script_id.script_name + '<br>';
                        } else {
                            HTML += script.script_id.script_name;
                        }
                    });
                }
            }
            return HTML || 'N/A';
        };
    }]);

app.filter('ringToNumberTooltip', [function () {
        return function (ringToNumbers) {
            var ringToNumberHTML = '';
            if (ringToNumbers && ringToNumbers.local) {
                if (ringToNumberHTML) {
                    ringToNumberHTML += 'Local: ' + ringToNumbers.local.phone_no;
                } else {
                    ringToNumberHTML = 'Local: ' + ringToNumbers.local.phone_no;
                }
            }
            if (ringToNumbers && ringToNumbers.tollfree) {
                if (ringToNumberHTML) {
                    ringToNumberHTML += '<br>Tollfree: ' + ringToNumbers.tollfree.phone_no;
                } else {
                    ringToNumberHTML = 'Tollfree: ' + ringToNumbers.tollfree.phone_no;
                }
            }
            if (ringToNumbers && ringToNumbers.vanity) {
                if (ringToNumberHTML) {
                    ringToNumberHTML += '<br>Vanity: ' + ringToNumbers.vanity.phone_no;
                } else {
                    ringToNumberHTML = 'Vanity: ' + ringToNumbers.vanity.phone_no;
                }
            }
            return ringToNumberHTML || 'N/A';
        };
    }]);


app.filter('listLSTooltip', [function () {
        return function (PAArray) {
            var PAHTML = '';
            if (PAArray) {
                var count = PAArray.length;
                if (count) {
                    angular.forEach(PAArray, function (PA) {
                        if (--count) {
                            PAHTML += PA + '<br>';
                        } else {
                            PAHTML += PA;
                        }
                    });
                }
            }
            return PAHTML || 'N/A';//PAArray;
        };
    }]);

app.filter('phoneNumTooltip', [function () {
        return function (PhoneArray) {
            var PAHTML = '';
            if (PhoneArray) {
                var count = PhoneArray.length;
                if (count) {
                    angular.forEach(PhoneArray, function (phone) {
                        if (--count) {
                            PAHTML += phone.phone_no + '<br>';
                        } else {
                            PAHTML += phone.phone_no;
                        }
                    });
                }
            }
            return PAHTML || 'N/A';//PAArray;
        };
    }]);

app.filter('ivrTooltip', [function () {
        return function (ivrArray) {
            var PAHTML = '';
            if (ivrArray) {
                var count = ivrArray.length;
                if (count) {
                    angular.forEach(ivrArray, function (ivr) {
                        if (--count) {
                            PAHTML += ivr.ivr_id.ivr_name + '<br>';
                        } else {
                            PAHTML += ivr.ivr_id.ivr_name;
                        }
                    });
                }
            }
            return PAHTML || 'N/A';//PAArray;
        };
    }]);

app.directive('wcUnique', function ($http, $routeParams, $timeout) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
            scope.check = function () {
                if (!ngModel || !element.val())
                    return;
                var keyProperty = scope.$eval(attrs.wcUnique);
                var currentValue = element.val();
                var offerid = $routeParams.editOfferid || false;
                $http.post('/api_offer/checkUnique', {title: currentValue, offerid: offerid})
                        .then(function (unique) {
                            //Ensure value that being checked hasn't changed
                            //since the Ajax call was made
                            if (unique.data.code == 200) {
                                ngModel.$setValidity('catVert.title', true);


                            } else {
                                ngModel.$setValidity('catVert.title', false);

                            }
                        });
            }
            $timeout(function () {
                scope.check();
            }, 1000);
            element.bind('blur', function (e) {
                scope.check();
            });
        }
    }
});

app.directive('cblDirective', ['$filter', function ($filter) {
        return{
            // Original template:'<div ng-init="isdropdown = false;"></div><button id="MenuIcon" class="btn btn-default dropdown-toggle" data-toggle="dropdown" data-ng-click="isdropdown = !isdropdown; "> <span class="hidden-sm hidden-xs"> {{filter}}</span> <span class="caret"></span> </button> <div style="position:relative;" class="dropdown-menu gearboxFilter divFilter" ng-blur="isdropdown=false;" hide-on-mouse-up-elsewhere exclude-click="MenuIcon" data-ng-show="isdropdown"> <div class="div1Filter"> <table class="table filterTable"> <tr> <td class="borderTopNone"> <a href ng-click="Today();" >Today</a> </td> <td class="borderTopNone"> <a href ng-click="Yesterday();" >Yesterday</a> </td> <td class="borderTopNone"> <a href ng-click="Week()" >Last 7 Days</a> </td> </tr> <tr> <td class="borderTopNone"> <a href ng-click="LastMonth();" >Last Month</a> </td> <td class="borderTopNone"> <a href ng-click="ThisMonth();" >This Month</a> </td> <td class="borderTopNone"> <a href ng-click="TwoWeek()" >Last 14 Days</a> </td> </tr> </table></div> <div class="div2Filter" ng-click="manualDate()"><bs-datepicker ng-model="from" data-max-date="{{to}}" data-bs-show="true" data-trigger="manual"></bs-datepicker></div> <div class="div3Filter" ng-click="manualDate()"><bs-datepicker ng-model="to" data-min-date="{{from}}" data-bs-show="true" data-trigger="manual"></bs-datepicker></div> <div class="div4Filter"> {{from| date:"MMMM dd, yyyy"}} - {{to| date:"MMMM dd, yyyy"}}<button class="btn btn-default" ng-click="getFilteredHistory(); isdropdown = !isdropdown;" style="float:right">OK</button> <button class="btn btn-default" style="float:right" data-ng-click="isdropdown = !isdropdown;">Cancel</button>',
            template: '<button id="MenuIcon" class="btn btn-default dropdown-toggle" data-toggle="dropdown" data-ng-click="isdropdown = !isdropdown;"> <span class="hidden-sm hidden-xs"> {{filter}}</span> <span class="caret"></span> </button><div class="dropdown-menu gearboxFilter divFilter" ng-blur="isdropdown=false;" hide-on-mouse-up-elsewhere exclude-click="MenuIcon" data-ng-show="isdropdown"> <div class="div1Filter"> <table class="table filterTable"> <tr> <td class="borderTopNone"> <a href ng-click="Today();" >Today</a> </td> <td class="borderTopNone"> <a href ng-click="Yesterday();" >Yesterday</a> </td> <td class="borderTopNone"> <a href ng-click="Week()" >Last 7 Days</a> </td> </tr> <tr> <td class="borderTopNone"> <a href ng-click="LastMonth();" >Last Month</a> </td> <td class="borderTopNone"> <a href ng-click="ThisMonth();" >This Month</a> </td> <td class="borderTopNone"> <a href ng-click="TwoWeek()" >Last 14 Days</a> </td> </tr> </table></div> <div class="div2Filter" ng-click="manualDate()"><bs-datepicker ng-model="from" data-max-date="{{to}}" data-bs-show="true" data-trigger="manual"></bs-datepicker></div> <div class="div3Filter" ng-click="manualDate()"><bs-datepicker ng-model="to" data-min-date="{{from}}" data-bs-show="true" data-trigger="manual"></bs-datepicker></div> <div class="div4Filter"> {{from| date:"MMMM dd, yyyy"}} - {{to| date:"MMMM dd, yyyy"}} <button class="btn btn-default" ng-click="getFilteredHistory(); isdropdown = !isdropdown;" style="float:right">OK</button> <button class="btn btn-default" style="float:right" data-ng-click="isdropdown = !isdropdown;">Cancel</button> </div> </div>',
            link: function ($scope, element, attrs) {
                //Today data
                $scope.Today = function () {
                    var dFrom = new Date();
                    dFrom.setHours(0, 0, 0, 0);
                    var dTo = new Date();
                    dTo.setHours(23, 59, 59, 999);
                    $scope.from = dFrom;
                    $scope.to = dTo;
                    $scope.filter = 'Today';
                    var dateData = {FromDate: dFrom, ToDate: dTo};
                    $scope.getDataByDate(dateData, 0);
                }
                $scope.Yesterday = function () {
                    var date = new Date();
                    var dFrom = new Date(date.setDate(date.getDate() - 1));
                    dFrom.setHours(0, 0, 0, 0);
                    var date = new Date();
                    var dTo = new Date(date.setDate(date.getDate() - 1));
                    dTo.setHours(23, 59, 59, 999);
                    $scope.from = dFrom;
                    $scope.to = dTo;
                    $scope.filter = 'Yesterday';
                    var dateData = {FromDate: dFrom, ToDate: dTo};
                    $scope.getDataByDate(dateData, 0);
                }

                // Week Date
                $scope.Week = function () {
                    var date = new Date();
                    var dFrom = new Date(date.setDate(date.getDate() - 7));
                    dFrom.setHours(0, 0, 0, 0);
                    var dTo = new Date();
                    dTo.setHours(23, 59, 59, 999);
                    $scope.from = dFrom;
                    $scope.to = dTo;
                    $scope.filter = 'Last 7 days';
                    var dateData = {FromDate: dFrom, ToDate: dTo};

                    $scope.getDataByDate(dateData, 0);
                };

                if (attrs.showWeek == 'true') {
                    $scope.Week();
                }
                if (attrs.showToday == 'true') {
                    $scope.Today();
                }
                // This Month Date
                $scope.ThisMonth = function () {
                    var date = new Date();
                    var dFrom = new Date(date.getFullYear(), date.getMonth(), 1);
                    dFrom.setHours(0, 0, 0, 0);
                    var dTo = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                    dTo.setHours(23, 59, 59, 999);
                    var dateData = {FromDate: dFrom, ToDate: dTo};
                    $scope.from = dFrom;
                    $scope.to = dTo;
                    $scope.filter = 'This Month';
                    $scope.getDataByDate(dateData, 0);
                };
                // Last Month Date
                $scope.LastMonth = function () {
                    var date = new Date();
                    var dFrom = new Date(date.getFullYear(), date.getMonth() - 1, 1);
                    dFrom.setHours(0, 0, 0, 0);
                    var dTo = new Date(date.getFullYear(), date.getMonth(), 0);
                    dTo.setHours(23, 59, 59, 999);
                    var dateData = {FromDate: dFrom, ToDate: dTo};
                    $scope.from = dFrom;
                    $scope.to = dTo;
                    $scope.filter = 'Last Month';
                    $scope.getDataByDate(dateData, 0);
                };
                // Last 14 Days
                $scope.TwoWeek = function () {
                    var date = new Date();
                    var dFrom = new Date(date.setDate(date.getDate() - 14));
                    dFrom.setHours(0, 0, 0, 0);
                    var dTo = new Date();
                    dTo.setHours(23, 59, 59, 999);
                    $scope.from = dFrom;
                    $scope.to = dTo;
                    $scope.filter = 'Last 14 days';
                    var dateData = {FromDate: dFrom, ToDate: dTo};
                    $scope.getDataByDate(dateData, 0);
                }

                $scope.getFilteredHistory = function () {
                    var dFrom = new Date($scope.from);
                    var dTo = new Date($scope.to);
                    var dateData = {FromDate: dFrom, ToDate: dTo};
                    console.log(dateData);
                    console.log('In filterd history called for manual dates');
                    $scope.loading = true;
                    $scope.getDataByDate(dateData, 0);
                };
                $scope.manualDate = function () {
                    //console.log('here');

                    if ($scope.from) {
                        $scope.fromD = $filter('date')($scope.from, 'MMMM dd, yyyy');
                    } else {
                        $scope.fromD = $filter('date')($scope.to, 'MMMM dd, yyyy');
                    }
                    if ($scope.to) {
                        $scope.toD = $filter('date')($scope.to, 'MMMM dd, yyyy');
                    } else {
                        $scope.toD = $filter('date')($scope.from, 'MMMM dd, yyyy');
                    }

                    if ($scope.from && $scope.to) {
                        $scope.filter = $scope.fromD + ' - ' + $scope.toD;
                    }

                };
//                $scope.Week();
            }
        };
    }]);


app.filter('range', function () {
    return function (input, total) {
        total = parseInt(total);
        for (var i = 0; i < total; i++)
            input.push(i);
        return input;
    };
});

app.filter('showEsignText', function () {
    return function (input, scope) {
        console.log(input.substring(0, 10));
        return input.substring(0, 50);
    };
});

app.filter('smsCharCount', [function () {
        return function (smsMessage, scope) {
            scope.charCount = 0;
            scope.messageCount = 0;
            if (smsMessage) {
                scope.charCount = smsMessage.length;
                scope.messageCount = Math.ceil(smsMessage.length / 160);
            }

            if (scope.messageCount != 1 && scope.messageCount != 0) {
                return scope.charCount + '/' + scope.messageCount * 160 + ' (' + scope.messageCount + ')';
            } else {
                return scope.charCount + '/' + scope.messageCount * 160;
            }

        };
    }]);

app.directive('formatPhone', [
    function () {
        return {
            require: 'ngModel',
            restrict: 'A',
            link: function (scope, elem, attrs, ctrl, ngModel) {
                elem.on('keyup', function () {
                    var origVal = elem.val().replace(/[^\w\s]/gi, '');
                    if (origVal.length === 10) {
                        var str = origVal.replace(/(.{3})/g, "$1-");
                        var phone = str.slice(0, -2) + str.slice(-1);
                        jQuery("#phonenumber").val(phone);
                    }

                });
            }
        };
    }
]);


app.directive('hideOnMouseUpElsewhere', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {

            $(document).mouseup(function (e) {
                var container = $(element);

                if (!container.is(e.target) // if the target of the click isn't the container...
                        && container.has(e.target).length === 0 && scope.isdropdown // ... nor a descendant of the container
                        && !(e.target.id === attr.excludeClick)) // do not execute when clicked on this
                {
                    scope.isdropdown = false;
                    scope.$apply();
                }
            });
        }
    }
})

app.directive('colShowHide', function () {
    return{
        restrict: 'A',
        link: function (scope, element, attr) {
            /********* Column Show/Hide DropDown (START)**********/
            scope.isTHdropdown = false;
            scope.hideDropDown = function () {
                scope.isTHdropdown = false;
            };

            scope.toggleDropDown = function () {
                scope.isTHdropdown = !scope.isTHdropdown;
            };
            /********* Column Show/Hide DropDown (END)**********/

            /********* Column Show/Hide (START)**********/
            scope.showCol = [];
            for (var i = 0; i <= 20; i++) {
                scope.showCol[i] = true;
            }
            /********* Column Show/Hide (END)**********/

            /********* Column DropDown Hide (START)**********/
            $(document).mouseup(function (e) {
                var container = $(element);

                if (!container.is(e.target) // if the target of the click isn't the container...
                        && container.has(e.target).length === 0 && scope.isTHdropdown // ... nor a descendant of the container
                        && !(e.target.id === attr.excludeClick)) // do not execute when clicked on this
                {
                    scope.isTHdropdown = false;
                    scope.$apply();
                }
            });
            /********* Column DropDown Hide (END)**********/
        }
    };
});


app.directive('phoneInput', function ($filter, $browser) {
    return {
        require: 'ngModel',
        link: function ($scope, $element, $attrs, ngModelCtrl) {
            var listener = function () {
                var value = $element.val().replace(/[^0-9]/g, '');
                $element.val($filter('tel')(value, false));
            };

            // This runs when we update the text field
            ngModelCtrl.$parsers.push(function (viewValue) {
                return viewValue.replace(/[^0-9]/g, '').slice(0, 10);
            });

            // This runs when the model gets updated on the scope directly and keeps our view in sync
            ngModelCtrl.$render = function () {
                $element.val($filter('tel')(ngModelCtrl.$viewValue, false));
            };

            $element.bind('change', listener);
            $element.ready(listener);
            $element.bind('keydown', function (event) {
                var key = event.keyCode;
                // If the keys include the CTRL, SHIFT, ALT, or META keys, or the arrow keys, do nothing.
                // This lets us support copy and paste too
                if (key == 91 || (15 < key && key < 19) || (37 <= key && key <= 40)) {
                    return;
                }
                $browser.defer(listener); // Have to do this or changes don't get picked up properly
            });

            $element.bind('paste cut', function () {
                $browser.defer(listener);
            });
        }

    };
});

app.filter('tel', function () {
    return function (tel) {
        if (!tel) {
            return '';
        }

        var value = tel.toString().trim().replace(/^\+/, '');

        if (value.match(/[^0-9]/)) {
            return tel;
        }

        var country, city, number;

        switch (value.length) {
            case 1:
            case 2:
            case 3:
                city = value;
                break;

            default:
                city = value.slice(0, 3);
                number = value.slice(3);
        }

        if (number) {
            if (number.length > 3) {
                number = number.slice(0, 3) + '-' + number.slice(3, 7);
            }
            else {
                number = number;
            }

            return ("(" + city + ") " + number).trim();
        }
        else {
            return "(" + city;
        }

    };
});


app.directive('exportTable', [
    function () {
        var link = function ($scope, elm, attr) {
            $scope.$on('export-pdf', function (e, d) {
                console.log(elm)
                $('.print-pdf').tableExport({type: 'pdf', escape: false});
            });
            /*$scope.$on('export-excel', function(e, d){
             // elm.tableExport({type:'excel', escape:false});
             });*/
        }
        return {
            restrict: 'C',
            link: link
        }
    }
]);

app.directive('focusMe',
        ['$timeout',
            function ($timeout) {
                return {
                    link: {
                        pre: function preLink(scope, element, attr) {
                            // ...
                        },
                        post: function postLink(scope, element, attr) {
                            $timeout(function () {
                                element[0].focus();
                            }, 0);
                        }
                    }
                }
            }]);
