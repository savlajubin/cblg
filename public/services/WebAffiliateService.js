angular.module('WebAffiliateService', [])

        /**************************************  User Management Services Section   **************************************/

        .factory('WebAffiliate', ['$resource', function ($resource) {
                return {
                    getWebLeadsCampaignDetails: function () {
                        return $resource('/api_webAffiliate/getWebLeadsCampaignDetails/:web_affiliate_url_token');
                    }
                };
            }]);

/**************************************  User Management Services Section   **************************************/
