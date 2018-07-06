
var app = angular.module("AdminModule", []);

/**************************************   Admin Module Section   **************************************/
/*@function : OfferCtrl
 * Creator   : SmartData (A2)
 * @purpose  : Add original offer - State Google API
 */
app.controller("OfferCtrl", ['$scope', function ($scope) {
        $scope.result2 = '';
        $scope.options2 = {
            country: 'us',
            types: '(regions)'
        };
        $scope.details2 = '';
    }])
        .controller("externalCntr", ['$scope', 'User', 'CONSTANTS', function ($scope, User, CONSTANTS) {
                console.log('adsfasdfasdf')
                $scope.setTab = function (tabId) {
                    $scope.tab = tabId;
                    $scope.get_Info();
                };

                $scope.isSet = function (tabId) {
                    return $scope.tab === tabId;
                };
                // tabs section ends

                // Method to get the contact Info details on click of tab1
                $scope.get_Info = function () {
                    User.listUser().get({id: "LGN"}, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            $scope.LGNuserList = response.data;
                            console.log("Success : " + response.message);
                        } else {
                            logger.logError(response.message);
                            console.log('Error :' + response.message);
                        }

                    });
                }
                $scope.getIframe = function (id) {
                    var host = location.protocol + "//" + location.hostname + ":" + location.port + "/plugins/" + id;
                    $scope.iframecode = '<iframe width="100%" height="100%" src=' + host + ' frameborder="0" allowfullscreen></iframe>';
                }

                $scope.get_HTML = function (userid) {

                    User.generate_html().get({id: userid}, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            var host = location.protocol + "//" + response.data.uid + "." + location.hostname + ":" + location.port;
                            console.log(host);
                            $scope.iframecode_LB = host + '/#!/register_buyer';
                            $scope.iframecode_LS = host + '/#!/register_seller';
                            $scope.iframecode_PA = host + '/#!/register_phoneagent';
                            console.log("Success : " + response.message);
                        } else {
                            console.log('Error :' + response.message);
                        }
                    });
                }
            }])

        /*@function : esignctrl
         * Creator   : SmartData (Omprakash)
         * @purpose  : Manage E-Sign from admin end
         */
        .controller("esignctrl", ['$scope', 'User', 'Module', '$rootScope', 'logger', '$route', 'CONSTANTS', function ($scope, User, Module, $rootScope, logger, $route, CONSTANTS) {
                $scope.htmlcontent = "********************************************************************Terms and Conditions**************************************************************************"

                if ($scope.authenticatedUser.role_id.code == 'ADMIN') {
                    $scope.e_sign_role = 'LGN';
                }
                User.esignlist().get({'role': $scope.authenticatedUser.role_id.code}, function (response) {

                    var data = angular.fromJson(response);
                    $scope.createdAggrements = response.data;
                    Module.pagination(response.data);

                });
                $scope.createEsign = function (body, role) {
                    User.addesign().update({body: body, role: role}, function (response) {

                        if (response.code == 200) {
                            $route.reload();
                            logger.logSuccess(response.message);
                        }
                        else {
                            logger.logError(response.message);
                        }
                    })
                }
                $scope.getAddEsignForm = function (vertical_id, vertical_name) {
                    $scope.esignListDiv = false;
                    $scope.editForm = false;
                    $scope.addForm = true;
                    $scope.Editvertical_name = vertical_name;
                    $scope._id = vertical_id;
                }

                $scope.esignListDiv = true;
                $scope.editForm = false;
                $scope.addForm = false;

                $scope.getEditEsignForm = function (vertical_id, vertical_name, vertical_role) {
                    console.log(vertical_role);
                    $scope.esignListDiv = false;
                    $scope.editForm = true;
                    $scope.addForm = false;
                    $scope.htmlcontent1 = vertical_name;
                    $scope.e_sign_role = vertical_role;
                    $scope._id = vertical_id;
                }

                $scope.editEsign = function (id, role, body) {
                    User.editesign().update({id: id, role: role, body: body}, function (response) {
                        if (response.code == 200) {
                            $route.reload();
                            logger.logSuccess(response.message);
                        }
                        else {
                            logger.logError(response.message);
                        }
                    })
                }
                $scope.deleteEsign = function (id) {
                    swal({
                        title: CONSTANTS.SWAL.deletetitle,
                        text: CONSTANTS.SWAL.deletetext,
                        type: CONSTANTS.SWAL.type,
                        showCancelButton: CONSTANTS.SWAL.showCancelButton,
                        confirmButtonColor: CONSTANTS.SWAL.confirmButtonColor,
                        confirmButtonText: CONSTANTS.SWAL.deleteconfirmButtonText,
                        closeOnConfirm: CONSTANTS.SWAL.closeOnConfirm},
                    function () {
                        User.deleteesign(id).get(function (response) {
                            if (response.code == 200) {
                                $route.reload();
                                logger.logSuccess(response.message);
                            }
                            else {
                                logger.logError(response.message);
                            }
                        })
                    });
                }
                $scope.statusEsign = function (vertical_id, status, role) {

                    var agreementData = _.find($scope.createdAggrements, function (d) {
                        return ((d.role == role) && d.status == true);
                    });

                    if (agreementData && status == true) {
                        swal({
                            title: CONSTANTS.SWAL.alreadyCreatedAgreementTitle,
                            text: CONSTANTS.SWAL.alreadyCreatedAgreementText,
                            type: CONSTANTS.SWAL.type,
                            //showCancelButton: CONSTANTS.SWAL.showCancelButton,
                            confirmButtonColor: CONSTANTS.SWAL.confirmButtonColor,
                            confirmButtonText: CONSTANTS.SWAL.alreadyCreatedAgreementButtonText,
                            closeOnConfirm: CONSTANTS.SWAL.closeOnConfirm});
                    } else {
                        User.statusEsign().save({id: vertical_id, status: status}, function (response) {
                            if (response.code == 200) {
                                $route.reload();
                                logger.logSuccess(response.message);
                            } else {
                                logger.logError(response.message);
                                console.log('Error :' + response.message);
                            }
                        });
                    }
                }

                $scope.closeForm = function () {
                    $scope.editForm = false;
                    $scope.addForm = false;
                    $scope.esignListDiv = true;
                };

                $scope.checktermsandcontions = function () {

                    var role = $rootScope.authenticatedUser.role_id.code;
                    User.checktermsandcontions(role).get(function (response) {
                        var data = angular.fromJson(response);
                        if (data.data[0].role == 'LB') {
                            title = "Lead Buyer";
                        }
                        else if (data.data[0].role == 'LG') {
                            title = "Lead Generator";
                        }
                        else if (data.data[0].role == 'LGN') {
                            title = "Lead Generator Network";
                        }
                        else if (data.data[0].role == 'PA') {
                            title = "Phone Agent";
                        }
                        else if (data.data[0].role == 'ADVCC') {
                            title = "ADVCC";
                        }
                        $scope.modal = {
                            "title": title,
                            "content": data.data[0].body,
                        };
                    })
                }

            }]);
//end