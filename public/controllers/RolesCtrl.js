angular.module('RoleModule', ['LoggerService'])

        /**************************************   Manage Roles Section   **************************************/
        /*@function : RolesCtrl
         * @created  : 14 July 2015
         * @purpose  : Role management (add role, edit role, forgotton password etc...)
         */
        .controller('RolesCtrl', ['$scope', 'Role', 'Module', '$route', 'logger', 'CONSTANTS', function ($scope, Role, Module, $route, logger, CONSTANTS) {
            // role listing
            $scope.rolelist = function () {

                //show hide
                $scope.showAddRole = false;
                $scope.showViewRole = false;
                $scope.showEditRole = false;
                $scope.showListRole = true;

                Role.listRole().get(function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        Module.pagination(response.data);
                    } else {
                        logger.logError(response.message);
                    }

                });
            }();

            // show the details of the roles
            $scope.roleView = function (ids) {
                Role.findByIDRole().get({id: ids}, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.roleInfo = response.data;
                    } else {
                        logger.logError(response.message);
                    }
                });
            }
            //show add role form with listed avaiable module
            $scope.getAddRoleForm = function () {
                //show hide
                $scope.showListRole = false;
                $scope.showViewRole = false;
                $scope.showEditRole = false;
                $scope.showAddRole = true;

                Module.listModule().get(function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.moduleList = response.data;
                        $scope.success = null;
                    } else {
                        logger.logError(response.message);
                    }
                });
            }

             // change the status of module
            $scope.statusRole = function (role_id, status) {
                var role = {
                    'role_id': role_id,
                    'status': status
                }
                Role.statusRole().save(role, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        Module.pagination(response.data);
                        logger.logSuccess(response.message);
                    } else {
                        logger.logError(response.message);
                    }
                });
            }
             // back process
            $scope.back = function () {
                $route.reload();
            }
        }]);