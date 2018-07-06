// public/js/services/ModuleService.js
angular.module('ModuleService', [])

        /**************************************  Module Management Services Section   **************************************/
        /*@factory   : Module
         * Creator   : Jubin Savla
         * @created  : 09 Oct 2015
         * @purpose  : Module Services provider (addModule, editModule, listModule password etc...)
         */

        .factory('Module', ['$rootScope', '$filter', 'ngTableParams', '$resource', function ($rootScope, $filter, ngTableParams, $resource) {

                function pagination(newData) {
                    if (newData.length) {
                        $(".showPagination").show();
                        $rootScope.dataPresent = true;
                    } else {
                        $(".showPagination").hide();
                        $rootScope.dataPresent = false;
                    }
                    if (newData.length) {
                        if ($rootScope.tableParams) {
                            $rootScope.tableParams.filter(newData);
                            $rootScope.tableParams.data = newData;
                        }

                        $rootScope.tableParams = new ngTableParams({
                            page: 1,
                            count: 10,
                            filter: {},
                            sorting: {
                                created: 'desc'     // initial sorting
                            }
                        }, {
                            total: newData.length,
                            getData: function ($defer, params) {
                                var filteredData = params.filter() ?
                                        $filter('filter')(newData, params.filter()) :
                                        newData;
                                var orderedData = params.sorting() ?
                                        $filter('orderBy')(filteredData, params.orderBy()) :
                                        filteredData;
                                params.total(orderedData.length);
                                $rootScope.dataPresent = orderedData.length ? true : false;
                                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                            }
                        });
                    }
                }
                return {
                    addModule: function () {
                        return $resource('/api_setup/addModule') //send the post request to the server for add module
                    },
                    editModule: function () {
                        return $resource('/api_setup/editModule'); //send the post request to the server for edit
                    },
                    listModule: function () {
                        return $resource('/api_setup/listModule'); //send the post request to the server for listing the modules
                    },
                    statusModule: function () {
                        return $resource('/api_setup/statusModule'); //send the post request to the server for change the status
                    },
                    findByIDModule: function () {
                        return $resource('/api_setup/findModule'); // send the get request to the server for user specific
                    },
                    deleteModule: function () {
                        return $resource('/api_setup/deleteModule'); // send the post request to delete the module
                    },
                    pagination: pagination// send the post request to delete the module

                }
            }]);
/**************************************  Module Management Services Section   **************************************/