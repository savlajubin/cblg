angular.module('CategoryModule', ['LoggerService'])

        /**************************************   Manage Categories Section   **************************************/
        /*@function : CategoriesCtrl
         * Creator   : SmartData
         * @created  : 14 July 2015
         * @purpose  : Category management (add category, edit category etc...)
         */
        .controller('CategoriesCtrl', ['$scope', 'Category', 'Vertical', '$route', 'logger', 'Module', 'CONSTANTS', function ($scope, Category, Vertical, $route, logger, Module, CONSTANTS) {

                // category listing
                $scope.categorylist = function () {
                    //show hide
                    $scope.showAddCategory = false;
                    $scope.showViewCategory = false;
                    $scope.showEditCategory = false;
                    $scope.showListCategory = true;

                    Category.listCategory().get(function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            Module.pagination(response.data);
                            console.log("Success : " + response.message);
                        } else {
                            logger.logError(response.message);
                            console.log('Error :' + response.message);
                        }

                    });
                }();

                // show the details of the categorys
                $scope.categoryView = function (ids) {
                    Category.findByIDCategory().get({id: ids}, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            $scope.categoryInfo = response.data;
                            console.log("Success : " + response.message);
                        } else {
                            logger.logError(response.message);
                            console.log('Error :' + response.message);
                        }
                    });
                }

                //show add category form with listed avaiable module
                $scope.getAddCategoryForm = function () {
                    //show hide
                    $scope.showListCategory = false;
                    $scope.showViewCategory = false;
                    $scope.showEditCategory = false;
                    $scope.showAddCategory = true;

                    Vertical.listVertical().get(function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            $scope.verticalList = response.data;
                            $scope.success = null;
                            console.log("Success : " + response.message);
                        } else {
                            logger.logError(response.message);
                            console.log('Error :' + response.message);
                        }
                    });
                }

                // create the categorys
                $scope.createCategory = function (category) {
                    console.log(category);
                    Category.addCategory().save(category, function (response) {
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

                //show add category form with listed avaiable module
                $scope.getEditCategoryForm = function (ids) {
                    // show hide
                    $scope.showListCategory = false;
                    $scope.showViewCategory = false;
                    $scope.showAddCategory = false;
                    $scope.showEditCategory = true;

                    Vertical.listVertical().get(function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            $scope.verticalList = response.data;
                            $scope.success = null;
                            console.log("Success : " + response.message);
                        } else {
                            logger.logError(response.message);
                            console.log('Error :' + response.message);
                        }
                    });

                    Category.findByIDCategory().get({id: ids}, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            var category = {
                                '_id': response.data._id,
                                'name': response.data.category_name,
                                'description': response.data.category_description,
                                'status': response.data.category_status,
                                'vertical_id': response.data.vertical_id._id
                            }
                            $scope.category = category;
                            //logger.logSuccess(response.message);
                            console.log("Success : " + response.message);
                        } else {
                            logger.logError(response.message);
                            console.log('Error :' + response.message);
                        }
                    });
                }

                // edit the categorys
                $scope.editCategory = function (category) {
                    Category.editCategory().save(category, function (response) {
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

                // delete the categorys
                $scope.deleteCategory = function (categoryids) {
                    swal({
                        title: CONSTANTS.SWAL.deletetitle,
                        text: CONSTANTS.SWAL.deletetext,
                        type: CONSTANTS.SWAL.type,
                        showCancelButton: CONSTANTS.SWAL.showCancelButton,
                        confirmButtonColor: CONSTANTS.SWAL.confirmButtonColor,
                        confirmButtonText: CONSTANTS.SWAL.deleteconfirmButtonText,
                        closeOnConfirm: CONSTANTS.SWAL.closeOnConfirm},
                    function () {
                        Category.deleteCategory().save({'category_ids': [{'id': categoryids}]}, function (response) {
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

                // change the status of module
                $scope.statusCategory = function (category_id, status) {
                    var category = {
                        'category_id': category_id,
                        'status': status
                    }
                    Category.statusCategory().save(category, function (response) {
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

                // back process
                $scope.back = function () {
                    $route.reload();
                }
            }])
        .controller('SubCategoriesCtrl', ['$scope', 'Category', 'SubCategory', '$route', 'logger', 'CONSTANTS', function ($scope, Category, SubCategory, $route, logger, CONSTANTS) {

                // subCategory listing
                $scope.subCategoryList = function () {

                    //show hide
                    $scope.showAddSubCategory = false;
                    $scope.showViewSubCategory = false;
                    $scope.showEditSubCategory = false;
                    $scope.showListSubCategory = true;

                    SubCategory.listSubCategory().get(function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            $scope.subCategoryList = response.data;
                            logger.logSuccess(response.message);
                            console.log("Success : " + response.message);
                        } else {
                            logger.logError(response.message);
                            console.log('Error :' + response.message);
                        }

                    });
                }();

                // show the details of the categorys
                $scope.subCategoryView = function (ids) {

                    //show hide
                    $scope.showAddSubCategory = false;
                    $scope.showListSubCategory = false;
                    $scope.showEditSubCategory = false;
                    $scope.showViewSubCategory = true;

                    SubCategory.findByIDSubCategory().get({id: ids}, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            $scope.subCategoryInfo = response.data;
                            logger.logSuccess(response.message);
                            console.log("Success : " + response.message);
                        } else {
                            logger.logError(response.message);
                            console.log('Error :' + response.message);
                        }
                    });
                }

                //show add subCategory form with listed avaiable module
                $scope.getAddSubCategoryForm = function () {
                    //show hide
                    $scope.showListSubCategory = false;
                    $scope.showViewSubCategory = false;
                    $scope.showEditSubCategory = false;
                    $scope.showAddSubCategory = true;

                    Category.listCategory().get(function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            $scope.categoryList = response.data;
                            logger.logSuccess(response.message);
                            console.log("Success : " + response.message);
                        } else {
                            logger.logError(response.message);
                            console.log('Error :' + response.message);
                        }
                    });
                }

                // create the categorys
                $scope.createSubCategory = function (subCategory) {
                    console.log(subCategory);
                    SubCategory.addSubCategory().save(subCategory, function (response) {
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

                //show add subCategory form with listed avaiable module
                $scope.getEditSubCategoryForm = function (ids) {
                    // show hide
                    $scope.showListSubCategory = false;
                    $scope.showViewSubCategory = false;
                    $scope.showAddSubCategory = false;
                    $scope.showEditSubCategory = true;

                    Category.listCategory().get(function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            $scope.categoryList = response.data;
                            logger.logSuccess(response.message);
                            console.log("Success : " + response.message);
                        } else {
                            logger.logError(response.message);
                            console.log('Error :' + response.message);
                        }

                    });

                    SubCategory.findByIDSubCategory().get({id: ids}, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            var subCategory = {
                                '_id': response.data._id,
                                'name': response.data.category_name,
                                'description': response.data.category_description,
                                'status': response.data.category_status,
                                'category_id': response.data.parent_id._id
                            }
                            $scope.subCategory = subCategory;
                            logger.logSuccess(response.message);
                            console.log("Success : " + response.message);
                        } else {
                            logger.logError(response.message);
                            console.log('Error :' + response.message);
                        }
                    });
                }

                // edit the categorys
                $scope.editSubCategory = function (subCategory) {
                    SubCategory.editSubCategory().save(subCategory, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            logger.logSuccess(response.message);
                            console.log("Success : " + response.message);
                        } else {
                            logger.logError(response.message);
                            console.log('Error :' + response.message);
                        }
                    });
                }

                // delete the categorys
                $scope.deleteSubCategory = function (subCategoryids) {
                    SubCategory.deleteSubCategory().save({'subCategory_ids': [{'id': subCategoryids}]}, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            $scope.subCategoryList = response.data;
                            logger.logSuccess(response.message);
                            console.log("Success : " + response.message);
                        } else {
                            logger.logError(response.message);
                            console.log('Error :' + response.message);
                        }
                    });
                }

                // change the status of module
                $scope.statusSubCategory = function (subCategory_id, status) {
                    var subCategory = {
                        'subCategory_id': subCategory_id,
                        'status': status
                    }
                    SubCategory.statusSubCategory().save(subCategory, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            $scope.subCategoryList = response.data;
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