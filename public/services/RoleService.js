// public/js/services/RoleService.js
angular.module('RoleService', [])

        /**************************************  Role Management Services Section   **************************************/
        /*@factory  : Role
         * Creator   : Somesh Singh
         * @created  : 09 July 2015
         * @purpose  : Role Services provider (addRole, editRole, listRole password etc...)
         */

        .factory('Role', ['$resource', function ($resource) {
                return {
                    addRole: function () {
                        return $resource('/api_setup/addRole') //send the post request to the server for add role
                    },
                    editRole: function () {
                        return $resource('/api_setup/editRole'); //send the post request to the server for edit
                    },
                    listRole: function () {
                        return $resource('/api_setup/listRole'); //send the post request to the server for listing the roles
                    },
                    statusRole: function () {
                        return $resource('/api_setup/statusRole'); //send the post request to the server for change the status
                    },
                    findByIDRole: function () {
                        return $resource('/api_setup/findRole/:id'); // send the post request to the server for user specific
                    },
                    deleteRole: function () {
                        return $resource('/api_setup/deleteRole'); // send the post request to delete the role
                    }
                }
            }]);
/**************************************  Role Management Services Section   **************************************/