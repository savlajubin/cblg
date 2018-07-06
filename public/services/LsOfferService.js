angular.module('LsOfferService', [])

        /*@factory  : OfferTemplate
         * Creator   : B2
         * @created  : 14092015
         * @purpose  :
         */

        .factory('LsOffer', ['$resource', function ($resource) {
                return {
                    listAlloffersByLB: function () {
                        return $resource('/api_offer/listAlloffersByLB') //send the post request to get all offers
                    },
                    listAllAcceptedoffers: function () {
                        return $resource('/api_offer/listAllAcceptedoffers') //send the post request to save  vertivcal/category data
                    },
                    acceptanceRequestOffer: function () {
                        return $resource('/api_offer/acceptanceRequestOffer') //send the post request to offer acceptance
                    },
                    listApprovedOfferLS: function () {
                        return $resource('/api_offer/listApprovedOfferLS') //send the post request to offer acceptance
                    },
                    list_currentCampaigns: function () {
                        return $resource('/api_offer/list_currentCampaigns') //send the post request to offer acceptance
                    },
                    listPhoneNumber: function () {
                        return $resource('/api_offer/listPhoneNumber'); //send the post request to the server for listing the categories
                    },
                    addPhoneNumber: function () {
                        return $resource('/api_offer/addPhoneNumber'); //send the post request to the server for listing the categories
                    },
                    deletePhoneNumber: function () {
                        return $resource('/api_offer/deletePhoneNumber'); //send the post request to the server for listing the categories
                    },
                    findByIDPhoneNumber: function () {
                        return $resource('/api_offer/findPhoneNumber/:id'); // send the post request to the server for user specific
                    },
                    sendInvite: function () {
                        return $resource('/api_offer/sendInvite'); // send the post request to the server for sending invitation
                    }

                }
            }]);
