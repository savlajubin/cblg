// public/js/services/CategoryService.js
angular.module('CategoryService', [])

        /**************************************  Category & SubCategory Management Services Section   **************************************/
        /*@factory  : Category
         * Creator   : Somesh Singh
         * @created  : 15 July 2015
         * @purpose  : Category Services provider (addCategory, editCategory, listCategory password etc...)
         */

        .factory('Category', ['$resource', function ($resource) {
                return {
                    addCategory: function () {
                        return $resource('/api_setup/addCategory') //send the post request to the server for add category
                    },
                    editCategory: function () {
                        return $resource('/api_setup/editCategory'); //send the post request to the server for edit
                    },
                    listCategory: function () {
                        return $resource('/api_setup/listCategory'); //send the post request to the server for listing the categories
                    },
                    statusCategory: function () {
                        return $resource('/api_setup/statusCategory'); //send the post request to the server for change the status
                    },
                    findByIDCategory: function () {
                        return $resource('/api_setup/findCategory/:id'); // send the post request to the server for user specific
                    },
                    listCategoryByVertical: function () {
                        return $resource('/api_setup/listCategoryByVertical/:id'); // send the post request to the server for user specific
                    },
                    deleteCategory: function () {
                        return $resource('/api_setup/deleteCategory'); // send the post request to delete the category
                    }
                }
            }])
        .factory('SubCategory', ['$resource', function ($resource) {
                return {
                    addSubCategory: function () {
                        return $resource('/api_setup/addSubCategory') //send the post request to the server for add category
                    },
                    editSubCategory: function () {
                        return $resource('/api_setup/editSubCategory'); //send the post request to the server for edit
                    },
                    listSubCategory: function () {
                        return $resource('/api_setup/listSubCategory'); //send the post request to the server for listing the categories
                    },
                    statusSubCategory: function () {
                        return $resource('/api_setup/statusSubCategory'); //send the post request to the server for change the status
                    },
                    findByIDSubCategory: function () {
                        return $resource('/api_setup/findCategory/:id'); // send the post request to the server for user specific
                    },
                    deleteSubCategory: function () {
                        return $resource('/api_setup/deleteSubCategory'); // send the post request to delete the category
                    }
                }
            }]);
/**************************************  Category & SubCategory Management Services Section   **************************************/