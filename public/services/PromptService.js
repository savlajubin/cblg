// public/js/services/PromptService.js
angular.module('PromptService', [])

        /**************************************  Prompt Services Section   **************************************/
        /*@factory  : Module
         * Creator   : Mustafa
         * @created  : 09 October 2015
         * @purpose  : Prompt Services provider (addPrompt, listPrompt)
         */

        .factory('Prompt', ['$resource', function ($resource) {
                return {
                    addPrompt: function () {
                        return $resource('/api_prompt/addPrompt') //send the post request to the server for add Prompt
                    },
                    listPrompt: function () {
                        return $resource('/api_prompt/listPrompt'); //send the post request to the server for listing the Prompts
                    },
                    deletePrompt: function () {
                        return $resource('/api_prompt/deletePrompt'); //send the post request to the server for listing the Prompts
                    }
                }
            }]);
/**************************************  Prompt Services Section   **************************************/