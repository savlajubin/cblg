// public/js/services/CampaignService.js
angular.module('CampaignService', [])

        /**************************************  Campaign Management Services Section   **************************************/
        /*@factory  : Campaign
         * Creator   : Somesh Singh
         * @created  : 09 July 2015
         * @purpose  : Campaign Services provider (addCampaign, editCampaign, listCampaign password etc...)
         */

        .factory('Campaign', ['$resource', '$upload', function ($resource, $upload) {
                return {
                    addCampaign: function (details, callback) {
                        var data = details;
                        var file = details.image;
                        $upload.upload({
                            url: '/api_campaign/addCampaign', //upload.php script, node.js route, or servlet url
                            fields: data,
                            method: "POST",
                            file: file
                        }).success(function (response) {
                            callback(response);
                        }).error(function (response) {
                            callback(response);
                        });
                    },
                    editCampaign: function (details, callback) {
                        var data = details;
                        var file = details.image;
                        $upload.upload({
                            url: '/api_campaign/editCampaign', //upload.php script, node.js route, or servlet url
                            fields: data,
                            method: "POST",
                            file: file
                        }).success(function (response) {
                            callback(response);
                        }).error(function (response) {
                            callback(response);
                        });
                    },
                    editCampaignSec: function () {
                        return $resource('/api_campaign/editCampaign'); //send the post request to the server for update the campaign without image
                    },
                    listCampaign: function () {
                        return $resource('/api_campaign/listCampaign'); //send the post request to the server for listing the campaigns
                    },
                    statusCampaign: function () {
                        return $resource('/api_campaign/statusCampaign'); //send the post request to the server for change the status
                    },
                    findByIDCampaign: function () {
                        return $resource('/api_campaign/findCampaign/:id'); // send the post request to the server for user specific
                    },
                    deleteCampaign: function () {
                        return $resource('/api_campaign/deleteCampaign'); // send the post request to delete the campaign
                    },
                    getRingToNumber: function () {
                        return $resource('/api_campaign/getRingToNumber'); // send the post request to delete the campaign
                    },
                    getNewRingToNumber: function () {
                        return $resource('/api_campaign/getNewRingToNumber'); // send the post request to delete the campaign
                    },
                    getSetPlivoNumbers: function () {
                        return $resource('/phoneAgent/getSetPlivoNumbers'); // send the request
                    },
                    listingCampaign: function () {
                        return $resource('/api_campaign/listingCampaign'); //send the post request to the server for listing the campaigns
                    },
                    listCampaignForAdmin: function () {
                        return $resource('/api_campaign/listCampaignForAdmin'); //send the post request to the server for listing the campaigns
                    }
                }
            }]);
/**************************************  Campaign Management Services Section   **************************************/