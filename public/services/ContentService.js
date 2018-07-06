// public/js/services/ContentService.js
angular.module('ContentService', [])

        // services for providing the userListing functionality
        .factory('ContentList', ['$resource', function ($resource) {
                return $resource('/api_static_contents/contentList', {
                    'get': {method: 'GET'}
                });
            }])