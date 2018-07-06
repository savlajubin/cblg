angular.module('VerticalModule', ['LoggerService'])

        /**************************************   Manage Verticals Section   **************************************/
        .controller('VerticalsCtrl', ['$scope', 'Module', '$route', 'Vertical', 'logger', 'CONSTANTS', function ($scope, Module, $route, Vertical, logger, CONSTANTS) {

            $scope.vertical_name = '';
            $scope.Editvertical_name = '';
            // for list out saved verticals
            $scope.verticallist = function () {
                Vertical.listVertical().get(function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        //$scope.verticalList = response.data;
                        Module.pagination(response.data);
                        // logger.logSuccess(response.message);
                        // console.log("Success : " + response.message);
                    } else if (response.code == 404) {
                        logger.logError(response.message);
                        console.log('Error :' + response.message);
                    }
                });
            }();


            // Save vertical data
            $scope.createVertical = function (vertical_name) {
                var data = {
                    'name': vertical_name,
                    'description': "test description",
                    'status': true
                };

                Vertical.addVertical().save(data, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        logger.logSuccess(response.message);
                        $route.reload();
                        console.log("Success : " + response.message);
                    } else if (response.code == 404) {
                        logger.logError(response.message);
                        console.log('Error :' + response.message);
                    }
                });
            }

            // change the status of vertical
            $scope.statusVertical = function (vertical_id, status) {
                var verticalData = {
                    'vertical_id': vertical_id,
                    'status': status
                }
                Vertical.statusVertical().save(verticalData, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        Module.pagination(response.data);
                        logger.logSuccess(response.message);
                        console.log("Success : " + response.message);
                    } else {
                        logger.logError(response.message);
                        console.log('Error :' + response.message);
                    }
                });
            }

            // delete the Verticals
            $scope.deleteVertical = function (verticalids) {
                swal({
                    title: CONSTANTS.SWAL.deletetitle,
                    text: CONSTANTS.SWAL.deletetext,
                    type: CONSTANTS.SWAL.type,
                    showCancelButton: CONSTANTS.SWAL.showCancelButton,
                    confirmButtonColor: CONSTANTS.SWAL.confirmButtonColor,
                    confirmButtonText: CONSTANTS.SWAL.deleteconfirmButtonText,
                    closeOnConfirm: CONSTANTS.SWAL.closeOnConfirm},
                function () {

                    Vertical.deleteVertical().save({'vertical_ids': [{'id': verticalids}]}, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            Module.pagination(response.data);
                            logger.logSuccess(response.message);
                            console.log("Success : " + response.message);
                        } else {
                            logger.logError(response.message);
                            console.log('Error :' + response.message);
                        }
                    });

                });



            }

            $scope.editForm = false;
            $scope.addForm = false;
            $scope.verticalListDiv = true;
            //show add vertical form
            $scope.getAddVerticalForm = function (vertical_id, vertical_name) {
                $scope.verticalListDiv = false;
                $scope.editForm = false;
                $scope.addForm = true;
                $scope.Editvertical_name = vertical_name;
                $scope._id = vertical_id;
            }
            //show edit vertical form
            $scope.getEditVerticalForm = function (vertical_id, vertical_name) {
                $scope.verticalListDiv = false;
                $scope.editForm = true;
                $scope.addForm = false;
                $scope.Editvertical_name = vertical_name;
                $scope._id = vertical_id;
            }

            // edit the verticals
            $scope.editVertical = function (vertical_id, vertical_name) {
                var verticalData = {
                    '_id': vertical_id,
                    'name': vertical_name
                }
                Vertical.editVertical().save(verticalData, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        logger.logSuccess(response.message);
                        console.log("Success : " + response.message);
                        $route.reload();
                    } else {
                        logger.logError(response.message);
                        console.log('Error :' + response.message);
                    }
                });
            }

            $scope.closeForm = function () {
                $scope.editForm = false;
                $scope.addForm = false;
                $scope.verticalListDiv = true;
            };

        }]);