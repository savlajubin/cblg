// public/js/services/UserService.js
angular.module('ADVCCService', [])

        /**************************************  User Management Services Section   **************************************/
        /*@factory  : User
         * Creator   : Somesh Singh
         * @created  : 09 July 2015
         * @purpose  : User Services provider (signIn, signUp, forgotton password etc...)
         */

        .factory('ADVCC', ['$resource', function ($resource) {
                return {
                    listQueue: function () {
                        return $resource('/api_advcc/listQueue'); // //send the get request to logout the user
                    },
                    addQueue: function () {
                        return $resource('/api_advcc/addqueue'); // //send the get request to logout the user
                    },
                    editQueue: function () {
                        return $resource('/api_advcc/editQueue'); // //send the get request to logout the user
                    },
                    deleteQueue: function () {
                        return $resource('/api_advcc/deleteQueue'); // //send the get request to logout the user
                    },
                    findByQueueID: function () {
                        return $resource('/api_advcc/findByQueueID/:queueId'); // //send the get request to logout the user
                    },
                    listPA: function () {
                        return $resource('/api_advcc/listPA'); // //send the get request to logout the user
                    },
                    listPhoneAgent: function () {
                        return $resource('/api_advcc/listPhoneAgent'); // //send the get request to logout the user
                    },
                    registerPA: function () {
                        return $resource('/api_advcc/register_pa'); // //send the get request to logout the user
                    },
                    editPA: function () {
                        return $resource('/api_advcc/edit_pa'); // //send the get request to logout the user
                    },
                    findPAByID: function () {
                        return $resource('/api_advcc/findPAByID/:advccId'); // //send the get request to logout the user
                    },
                    listCalendarScript: function () {
                        return $resource('/api_advcc/listCalendarScript'); // //send the get request to logout the user
                    },
                    listAgentScript: function () {
                        return $resource('/api_advcc/listAgentScript'); // //send the get request to logout the user
                    },
                    getAgentScript: function () {
                        return $resource('/api_advcc/getAgentScript/:scriptId'); // //send the get request to logout the user
                    },
                    saveAgentScript: function () {
                        return $resource('/api_advcc/saveAgentScript'); // //send the get request to logout the user
                    },
                    deleteAgentScript: function () {
                        return $resource('/api_advcc/deleteAgentScript'); // //send the get request to logout the user
                    },
                    saveAttributionCampaign: function () {
                        return $resource('/api_advcc/saveAttributionCampaign'); // //save Attribution Campaign
                    },
                    getAttributionCampaignList: function () {
                        return $resource('/api_advcc/getAttributionCampaignList'); // //get Attribution Campaigns List
                    },
                    getAttributionCampaignData: function () {
                        return $resource('/api_advcc/getAttributionCampaignData'); // //get Attribution Campaigns data by id
                    },
                    deleteAttributionCampaign: function () {
                        return $resource('/api_advcc/deleteAttributionCampaign'); // //get Attribution Campaigns data by id
                    },
                    saveMediaRequest: function () {
                        return $resource('/api_advcc/saveMediaRequest'); // //save Media Request Form
                    },
                    getMediaList: function () {
                        return $resource('/api_advcc/getMediaList'); // //get Media Request Form List
                    },
                    deleteDocuments: function () {
                        return $resource('/api_advcc/deleteDocuments/'); //send the post req to get user company set up info.
                    },
                    saveDocumentData: function () {
                        return $resource('/api_advcc/saveDocumentData/'); //send the post req to get user company set up info.
                    },
                    listAllDocuments: function () {
                        return $resource('/api_advcc/listAllDocuments/:lead_id'); // //send the get request to logout the user
                    },
                    listAllfileUploaded: function () {
                        return $resource('/api_advcc/listAllfileUploaded/:documentId'); // //send the get request to logout the user
                    },
                    getLeadList: function () {
                        return $resource('/api_advcc/getLeadList'); // //send the get request to logout the user
                    },
                    deleteFullDocument: function () {
                        return $resource('/api_advcc/deleteFullDocument'); // //send the get request to logout the user
                    }
                };
            }]);

/**************************************  User Management Services Section   **************************************/
