angular.module('OfferTemplateService', [])

        /*@factory  : OfferTemplate
         * Creator   : B2
         * @created  : 14092015
         * @purpose  : Offer Template Services provider
         */

        .factory('OfferTemplate', ['$resource', function ($resource) {
                return {
                    saveCatVertInfo: function () {
                        return $resource('/api_offer/saveCatVertInfo') //send the post request to save  vertivcal/category data
                    },
                    savepayPerCallInfo: function () {
                        return $resource('/api_offer/savepayPerCallInfo') //send the post request to save pay per call data
                    },
                    savestateRestrictInfo: function () {
                        return $resource('/api_offer/savestateRestrictInfo') //send the post request to save restricted states
                    },
                    saveDurationInfo: function () {
                        return $resource('/api_offer/saveDurationInfo') //send the post request to save duration tab info
                    },
                    saveDailyCapInfo: function () {
                        return $resource('/api_offer/saveDailyCapInfo') //send the post request to save duration tab info
                    },
                    saveDailyCapInfo1: function () {
                        return $resource('/api_offer/saveDailyCapInfo_lb') //send the post request to save duration tab info
                    },
                    listOfferTemplate: function () {
                        return $resource('/api_offer/listOfferTemplate')
                    },
                    getlistOfferTemplateByID: function () {
                        return $resource('/api_offer/getlistOfferTemplateByID')
                    },
                    getlistOfferTemplateByIDWhole: function () {
                        return $resource('/api_offer/getlistOfferTemplateByIDWhole')
                    },
                    deleteOfferTemplateByID: function () {
                        return $resource('/api_offer/deleteOfferTemplateByID')  //get data to delete offer template
                    },
                    statusOfferTemplateByID: function () {
                        return $resource('/api_offer/statusOfferTemplate')  //get data to change staus of offer template
                    },
                    getStatesList: function () {
                        return $resource('/api_offer/getStatesList')  //get data to change staus of offer template
                    },
                    listActiveSellersForOffer: function () {
                        return $resource('/api_offer/listActiveSellersForOffer')
                    }


                }
            }]);
