angular.module('IvrService', [])
        .factory('Ivr', ['$resource', function ($resource) {
                return {
                    submitIVRdata: function () {
                        return $resource('/api_ivr/submitIVRdata');//send the post request to the server for submit form data
                    },
                    listIvr: function () {
                        return $resource('/api_ivr/listIvr');//send the get request to list all ivr's
                    },
                    getIvrById: function () {
                        return $resource('/api_ivr/getIvrById');//get ivr details by id
                    },
                    deleteIvr: function () {
                        return $resource('/api_ivr/deleteIvr'); // to delete ivr
                    },
                    changeIvrStatus: function () {
                        return $resource('/api_ivr/changeIvrStatus');  //change ivr status
                    },
                    assignPhnoToIvr: function () {
                        return $resource('/api_ivr/assignPhnoToIvr');
                    },
                    submitInboundTrunk: function () {
                        return $resource('/api_ivr/submitInboundTrunk');
                    }
                }
            }]);
