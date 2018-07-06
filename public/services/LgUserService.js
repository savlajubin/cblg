// public/js/services/UserService.js
angular.module('LgUserService', [])

        /**************************************  User Management Services Section   **************************************/
        /*@factory  : LgUserService
         * @created  : 09 Sept 2015
         * @purpose  :
         */

        .factory('LgUser', ['$resource', function ($resource) {
                return {
                    listUser: function () {
                        return $resource('/api_lguser/listUser'); // //send the get request to logout the user
                    },
                    statusUser: function () {
                        return $resource('/api_lguser/updateStatus/'); // //send the get request to logout the user
                    },
                    updateUser: function () {
                        return $resource('/api_lguser/updateUserData/'); // //send the get request to logout the user
                    },
                    callHistory: function () {
                        return $resource('/phoneAgent/callHistory');  //retrieve call logs
                    },
                    callHistoryByDate: function () {
                        return $resource('/api_lguser/callHistoryByDate');  //retrieve call logs
                    },
                    deleteUser: function () {
                        return $resource('/api_lguser/deleteUser/'); // //send the get request to logout the user
                    },
                    saveNoteForCall: function () {
                        return $resource('/api_lguser/saveNoteForCall');  //retrieve call logs
                    },
                    SaveOrignalCaller: function () {
                        return $resource('/api_lguser/SaveOrignalCaller');  //SaveOrignalCaller
                    },
                    addDisaproveNote: function () {
                        return $resource('/api_lguser/addDisaproveNote');  //retrieve call logs
                    },
                    get_contactInfo: function () {
                        return $resource('/api_account/get_contactInfo'); //send the get request
                    },
                    get_callerInfo: function () {
                        return $resource('/api_account/get_callerInfo'); //send the get request
                    },
                    get_loginCredentials: function () {
                        return $resource('/api_account/get_loginCredentials'); //send the post req to get user login credentials
                    },
                    get_lgnsetup: function () {
                        return $resource('/api_account/get_lgnsetup'); //send the post req to get user company set up info.
                    },
                    get_contracts: function () {
                        return $resource('/api_account/get_contracts'); //send the post req to get user company set up info.
                    },
                    get_echeckInfo: function () {
                        return $resource('/api_account/get_echeckInfo'); //send the post req to get user echeck info.
                    },
                    get_cardDetails: function () {
                        return $resource('/api_account/get_cardDetails'); //send the post request to the server for reset password
                    },
                    get_autorecharge: function () {
                        return $resource('/api_account/get_autorecharge'); //send the get request to the server for auto recharge data
                    },
                }
            }]);

/**************************************  User Management Services Section   **************************************/