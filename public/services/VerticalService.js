// public/js/services/VerticalService.js
angular.module('VerticalService', [])

        /**************************************  Role Management Services Section   **************************************/
        /*@factory  : Vertical
         * Creator   : Shivansh
         * @created  : 15 July 2015
         * @purpose  : Vertical Services provider (addRole, editRole, listRole password etc...)
         */

        .factory('Vertical', ['$resource', function ($resource) {
                return {
                    addVertical: function () {
                        return $resource('/api_setup/addVertical') //send the post request to the server for add Vertical
                    },
                    editVertical: function () {
                        return $resource('/api_setup/editVertical'); //send the post request to the server for edit
                    },
                    listVertical: function () {
                        return $resource('/api_setup/listVertical'); //send the post request to the server for listing the Verticals
                    },
                    statusVertical: function () {
                        return $resource('/api_setup/statusVertical'); //send the post request to the server for change the status
                    },
                    findByIDVertical: function () {
                        return $resource('/api_setup/findVertical/:id'); // send the post request to the server for user specific
                    },
                    deleteVertical: function () {
                        return $resource('/api_setup/deleteVertical'); // send the post request to delete the Vertical
                    }
                }
            }]);
/**************************************  Role Management Services Section   **************************************/