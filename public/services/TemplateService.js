
angular.module('TemplateService', [])

        /**************************************  Template Management Services Section   **************************************/
        /*@factory  : Template
         * Creator   : Abhishek
         * @created  : 26 Feb 2016
         * @purpose  : Template Service provider
         */

        .factory('Template', ['$resource', function ($resource) {
                return {
                    templateList: function () {
                        return $resource('/api_template/templateList'); // //get template List
                    },
                    changetemplatestatus: function () {
                        return $resource('/api_template/changetemplatestatus'); // change status
                    },
                    deleteTemplateList: function (id) {
                        return $resource('/api_template/deleteTemplateList/' + id);
                    },
                    saveEmailTemplate: function () {
                        return $resource('/api_template/saveEmailTemplate');  //save saveEmailTemplate
                    },
                    editEmailTemplate: function (id, role, body) {
                        return $resource('/api_template/editEmailTemplate');
                    },
                    template_Info: function () {
                        return $resource('/api_template/template_Info/:id');
                    },
                    findByIDTemplate: function () {
                        return $resource('/api_template/findTemplate/:id');
                    }
                };
            }]);

/**************************************   Template Management Services Section  **************************************/
