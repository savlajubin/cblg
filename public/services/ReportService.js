// public/js/services/UserService.js
angular.module('ReportService', [])

        /**************************************  User Management Services Section   **************************************/
        /*@factory  : LgUserService
         * @created  : 09 Sept 2015
         * @purpose  :
         */

        .factory('Report', ['$resource', function ($resource) {
                return {
//                callHistory:function(){
//                   	return $resource('/api_reports/callHistoryReport');  //retrieve call logs
//                },
                    onGoingCalls: function () {
                        return $resource('/api_reports/onGoingCalls');  //retrieve calls list those are in progress
                    },
                    callHistoryByDate: function () {
                        return $resource('/api_reports/callHistoryByDate');  //retrieve call logs
                    },
                    getCallHistoryCategories: function () {
                        return $resource('/api_reports/getCallHistoryCategories');  //retrieve call logs
                    },
                    getSAASDashboardData: function () {
                        return $resource('/api_reports/getSAASDashboardData');  //retrieve Data for SAAS/ADMIN
                    },
                    getLGTop5Categories: function () {
                        return $resource('/api_reports/getLGTop5Categories');  // get LG Top 5 Categories
                    }
                }
            }]);

/**************************************  User Management Services Section   **************************************/

