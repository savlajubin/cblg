// public/js/services/UserService.js
angular.module('ContactService', [])

        /**************************************  User Management Services Section   **************************************/
        /*@factory  : Contact
         * Creator   : Mustafa Sunelwla
         * @created  : 12 Feb 2016
         * @purpose  : Contact Service provider
         */

        .factory('Contact', ['$resource', function ($resource) {
                return {
                    listContact: function () {
                        return $resource('/api_contact/listContact'); // //get the contact lists
                    },
                    cronList: function () {
                        return $resource('/api_contact/cronList'); // //get the cronList
                    },
                    saveContactList: function () {
                        return $resource('/api_contact/saveContactList'); // //save Contact List
                    },
                    saveContact: function () {
                        return $resource('/api_contact/saveContact'); // //save Contact into Contact List
                    },
                    deleteContactList: function () {
                        return $resource('/api_contact/deleteContactList'); // //delete Contact list
                    },
                    getContacts: function () {
                        return $resource('/api_contact/getContacts'); // //delete Contact list
                    },
                    getContactInfo: function () {
                        return $resource('/api_contact/getContactInfo'); // //get Contact Info
                    },
                    changestatus: function () {
                        return $resource('/api_contact/changestatus'); // //send the get request to logout the user
                    },
                    deleteContact: function () {
                        return $resource('/api_contact/deleteContact'); // //delete Contact
                    },
                    deleteCronList: function (id) {
                        return $resource('/api_contact/deleteCronList/' + id);
                    },
                    findByIDCron: function () {
                        return $resource('/api_contact/findCron/:id'); // //send the get request to logout the user
                    },
                    sendEmailToContacts: function () {
                        return $resource('/api_contact/sendEmailToContacts'); // //send Email To Contacts
                    },
                    sendSMSToContacts: function () {
                        return $resource('/api_contact/sendSMSToContacts'); // //send SMS To Contacts
                    },
                    getTimezones: function () {
                        return $resource('/api_contact/getTimezones'); // //get list of timezones
                    },
                    getTimezoneData: function () {
                        return $resource('/api_contact/getTimezoneData'); // //get timezone data
                    },
                    saveComposeMessage: function () {
                        return $resource('/api_contact/saveComposeMessage'); // //save the Send Message Data
                    },
                    getMessageCount: function () {
                        return $resource('/api_contact/getMessageCount'); // //save the Send Message Data
                    },
                    listMessageHistory: function () {
                        return $resource('/api_contact/listMessageHistory'); // //get the Message History
                    },
                    getMessageHistoryData: function () {
                        return $resource('/api_contact/getMessageHistoryData'); // //get the Message History Data
                    },
                    sendMessageEdit: function () {
                        return $resource('/api_contact/sendMessageEdit'); // //get the Message History Data
                    },
                    listPhoneNumber: function () {
                        return $resource('/api_contact/listPhoneNumber'); // //get the Message History Data
                    },
                    getAgendaDetails: function () {
                        return $resource('/api_contact/getAgendaDetails'); // //get the Agenda details
                    },
                    editComposeMessage: function () {
                        return $resource('/api_contact/editComposeMessage'); // //get the Agenda details
                    },
                    optout: function () {
                        return $resource('/api_contact/optout'); // //opt out contact from sms or email
                    }
                };
            }]);

/**************************************  User Management Services Section   **************************************/
