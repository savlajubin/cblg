angular.module('LeadManageService', [])

        /*@factory  : LeadManage
         * Creator   : B2
         * @created  : 14092015
         * @purpose  : Lead management
         */

        .factory('LeadManage', ['$resource', function ($resource) {
                return {
                    saveCallerDetails: function () {
                        return $resource('/phoneAgent/saveCallerDetails')
                    },
                    listCallerLeads: function () {
                        return $resource('/phoneAgent/listCallerLeads')
                    },
                    getCallerLeadByID: function () {
                        return $resource('/phoneAgent/getCallerLeadByID')
                    },
                    deleteLeadByID: function () {
                        return $resource('/phoneAgent/deleteLeadByID')
                    },
                    getCampaignLeadByDate: function () {
                        return $resource('/phoneAgent/getCampaignLeadByDate')
                    }
                }
            }]);
