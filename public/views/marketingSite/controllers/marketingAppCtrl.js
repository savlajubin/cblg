angular.module('ContentModule', [])

        /*@function : HomesCtrl
         * Creator   : SmartData
         * @created  : 09 July 2015
         * @purpose  : Content management (Home, About us, Contact us etc...)
         */

        .controller('marketingAppCtrl', function ($scope, $location, $anchorScroll) {
            //$scope.currentDate = new Date();

            $scope.gotoHash = function (hash) {
                // set the location.hash to the id of
                // the element you wish to scroll to.
                $location.hash(hash);

                // call $anchorScroll()
                $anchorScroll();
            };

        })
