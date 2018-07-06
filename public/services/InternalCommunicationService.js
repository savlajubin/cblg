// public/js/services/InternalCommunicationService.js
angular.module('InternalCommunicationService', [])

        /**************************************  Internal Communication Management Services Section   **************************************/
        /*@factory  :Internal Communication
         * Creator   : Somesh Singh
         * @created  : 20 July 2015
         * @purpose  : Internal Communication Services provider (SendMessage,ListMessage)
         */

        .factory('InternalCommunication', ['$resource', function ($resource) {
                return {
                    ListMessage: function () {
                        return $resource('/api_communication/ListMessage') //send the post request to the server for listing all message of logged in user
                    },
                    SendMessage: function () {
                        return $resource('/api_communication/SendMessage'); //send the post request to the server for send message
                    },
                    findByIDMessage: function () {
                        return $resource('/api_communication/findMessageById/:id'); // send the get request to the server for specific message details.
                    }
                }
            }]);