angular.module('FaqModule', ['LoggerService'])

        /**************************************   Manage Faqs Section   **************************************/
        /*@function : FaqCtrl
         * Creator   : Jubin Savla
         * @created  : 17 July 2015
         * @purpose  : Faq management (add Faq, edit Faq etc...)
         */
        .controller('FaqCtrl', ['$scope', 'Faq', '$route', 'logger', 'CONSTANTS', function ($scope, Faq, $route, logger, CONSTANTS) {

                // faq listing
                $scope.faqlist = function () {
                    //show hide
                    $scope.showAddFaq = false;
                    $scope.showViewFaq = false;
                    $scope.showEditFaq = false;
                    $scope.showListFaq = true;

                    Faq.listFaq().get(function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            $scope.faqList = response.data;
//                        logger.logSuccess(response.message);
                            console.log("Success : " + response.message);
                        } else {
                            logger.logError(response.message);
                            console.log('Error :' + response.message);
                        }

                    });
                }();

                // show the details of the faqs
                $scope.faqView = function (ids) {
                    //show hide
                    $scope.showAddFaq = false;
                    $scope.showListFaq = false;
                    $scope.showEditFaq = false;
                    $scope.showViewFaq = true;

                    Faq.findByIDFaq().get({id: ids}, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            $scope.faqInfo = response.data;
//                        logger.logSuccess(response.message);
                            console.log("Success : " + response.message);
                        } else {
                            logger.logError(response.message);
                            console.log('Error :' + response.message);
                        }
                    });
                }

                //show add faq form with listed avaiable module
                $scope.getAddFaqForm = function () {
                    //show hide
                    $scope.showListFaq = false;
                    $scope.showViewFaq = false;
                    $scope.showEditFaq = false;
                    $scope.showAddFaq = true;
                }

                // create the faqs
                $scope.createFaq = function (faq) {
                    console.log(faq);
                    Faq.addFaq().save(faq, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            logger.logSuccess(response.message);
                            $route.reload();
                            console.log("Success : " + response.message);
                        } else {
                            logger.logError(response.message);
                            console.log('Error :' + response.message);
                        }
                    });
                }

                //show add faq form with listed avaiable module
                $scope.getEditFaqForm = function (faq) {
                    console.log(faq);
                    // show hide
                    $scope.showListFaq = false;
                    $scope.showViewFaq = false;
                    $scope.showAddFaq = false;
                    $scope.showEditFaq = true;

                    Faq.findByIDFaq().get({id: faq}, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            var faq = {
                                '_id': response.data._id,
                                'title': response.data.title,
                                'description': response.data.description,
                                'status': response.data.status
                            }
                            $scope.faq = faq;
                            $scope.success = null;
                            console.log("Success : " + response.message);
                        } else {
                            logger.logError(response.message);
                            console.log('Error :' + response.message);
                        }
                    });
                }

                // edit the faqs
                $scope.editFaq = function (faq) {
                    Faq.editFaq().save(faq, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            logger.logSuccess(response.message);
                            console.log("Success : " + response.message);
                        } else {
                            logger.logError(response.message);
                            console.log('Error :' + response.message);
                        }
                    });
                }

                // delete the faqs
                $scope.deleteFaq = function (faqids) {
                    if (confirm("Are you sure,You want to delete this entry?")) {
                        Faq.deleteFaq().save({'faq_ids': [{'id': faqids}]}, function (response) {
                            if (response.code == CONSTANTS.CODES.OK) {
                                $scope.faqList = response.data;
                                logger.logSuccess(response.message);
                                console.log("Success : " + response.message);
                            } else {
                                logger.logError(response.message);
                                console.log('Error :' + response.message);
                            }
                        });
                    }
                }

                // change the status of module
                $scope.statusFaq = function (faq_id, status) {
                    var faq = {
                        'faq_id': faq_id,
                        'status': status
                    }
                    Faq.statusFaq().save(faq, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            $scope.faqList = response.data;
                            logger.logSuccess(response.message);
                            console.log("Success : " + response.message);
                        } else {
                            logger.logError(response.message);
                            console.log('Error :' + response.message);
                        }
                    });
                }

                // back process
                $scope.back = function () {
                    $route.reload();
                }
            }]);