// public/js/services/BasePriceService.js
angular.module('BasePriceService', [])

        /**************************************  BasePrice & SubBasePrice Management Services Section   **************************************/
        /*@factory  : BasePrice
         * Creator   : Somesh Singh
         * @created  : 15 July 2015
         * @purpose  : BasePrice Services provider (addBasePrice, editBasePrice, listBasePrice  etc...)
         */

        .factory('BasePrice', ['$resource', function ($resource) {
                return {
                    addBasePrice: function () {
                        return $resource('/api_setup/addBasePrice') //send the post request to the server for add base price
                    },
                    editBasePrice: function () {
                        return $resource('/api_setup/editBasePrice'); //send the post request to the server for edit
                    },
                    listBasePrice: function () {
                        return $resource('/api_setup/listBasePrice'); //send the post request to the server for listing the categories
                    },
                    statusBasePrice: function () {
                        return $resource('/api_setup/statusBasePrice'); //send the post request to the server for change the status
                    },
                    findByIDBasePrice: function () {
                        return $resource('/api_setup/findBasePrice/:id'); // send the post request to the server for user specific
                    },
                    deleteBasePrice: function () {
                        return $resource('/api_setup/deleteBasePrice'); // send the post request to delete the base price
                    }
                }
            }]);