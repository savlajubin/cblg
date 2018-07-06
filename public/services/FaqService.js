// public/js/services/FaqService.js
angular.module('FaqService', [])

        /**************************************  Faq Management Services Section   **************************************/
        /*@factory  : Faq
         * Creator   : Somesh Singh
         * @created  : 09 July 2015
         * @purpose  : Faq Services provider (addFaq, editFaq, listFaq password etc...)
         */

        .factory('Faq', ['$resource', function ($resource) {
                return {
                    addFaq: function () {
                        return $resource('/addFaq') //send the post request to the server for add faq
                    },
                    editFaq: function () {
                        return $resource('/editFaq'); //send the post request to the server for edit
                    },
                    listFaq: function () {
                        return $resource('/listFaq'); //send the post request to the server for listing the faqs
                    },
                    statusFaq: function () {
                        return $resource('/statusFaq'); //send the post request to the server for change the status
                    },
                    findByIDFaq: function () {
                        return $resource('/findFaq/:id'); // send the post request to the server for user specific
                    },
                    deleteFaq: function () {
                        return $resource('/deleteFaq'); // send the post request to delete the faq
                    }
                }
            }]);
/**************************************  Faq Management Services Section   **************************************/