// public/js/services/OfferService.js
angular.module('OfferService', [])

        /**************************************  Offer Management Services Section   **************************************/
        /*@factory  : Offer
         * Creator   : Smartdata(B2)
         * @created  : 17092015
         * @purpose  : Offer Services provider
         */

        .factory('Offer', ['$resource', function ($resource) {
                return {
                    saveCatVertInfo: function () {
                        return $resource('/api_offer/saveCatVertInfo_lb') //send the post request to save  vertivcal/category data
                    },
                    savepayPerCallInfo: function () {
                        return $resource('/api_offer/savepayPerCallInfo_lb') //send the post request to save pay per call data
                    },
                    savestateRestrictInfo: function () {
                        return $resource('/api_offer/savestateRestrictInfo_lb') //send the post request to save restricted states
                    },
                    saveDurationInfo: function () {
                        return $resource('/api_offer/saveDurationInfo_lb') //send the post request to save duration tab info
                    },
                    saveDailyCapInfo: function () {
                        return $resource('/api_offer/saveDailyCapInfo_lb') //send the post request to save duration tab info
                    },
                    listOfferTemplate: function () {
                        return $resource('/api_offer/listOfferTemplate_lb')
                    },
                    listOriginalOfferTemplate: function () {
                        return $resource('/api_offer/listOriginalOfferTemplate_lb')
                    },
                    getlistOfferTemplateByID: function () {
                        return $resource('/api_offer/getlistOfferTemplateByID_lb')
                    },
                    deleteOfferTemplateByID: function () {
                        return $resource('/api_offer/deleteOfferTemplateByID_lb')  //get data to delete offer template
                    },
                    statusOfferTemplateByID: function () {
                        return $resource('/api_offer/statusOfferTemplate_lb')  //get data to change staus of offer template
                    },
                    getStatesList: function () {
                        return $resource('/api_offer/getStatesList')
                    },
                    listActiveSellersForOffer: function () {
                        return $resource('/api_offer/listActiveSellersForOffer')
                    },
                    getOffferDetailsByID: function () {
                        return $resource('/api_offer/getOffferDetailsByID')
                    },
                    list_currentCampaignsLB: function () {
                        return $resource('/api_offer/list_currentCampaignsLB') //send the post request to offer acceptance
                    },
                    getLBOffersByCreated: function () {
                        return $resource('/api_offer/getLBOffersByCreated') //search LB Offers by created date
                    },
                    saveMediaRestrictData: function () {
                        return $resource('/api_offer/saveMediaRestrictData') //save media Restricted in Offer
                    },
                    saveWebAffiliateInfo: function () {
                        return $resource('/api_offer/saveWebAffiliateInfo'); //save Web Affiliate in Offer
                    },
                    saveOfferHOO: function () {
                        return $resource('/api_offer/saveOfferHOO'); //save Web Affiliate in Offer
                    },
                    get_HOOdata: function () {
                        return $resource('/api_offer/get_HOOdata'); //get HOO data
                    },
                    saveComposeMessage: function () {
                        return $resource('/api_offer/saveComposeMessage'); //save Compose Message
                    }
                }
            }]);
/**************************************  Offer Management Services Section   **************************************/