angular.module('InvoiceModule', [])

        /**************************************   Invoice Module Section   **************************************/
        /*@function : InvoiceCtrl
         * Creator   : SmartData (A2)
         * @purpose  : Controller for Invoice Generation Page
         */
        .controller('InvoiceCtrl', ['$scope', '$routeParams', function ($scope, $routeParams) {
                var arr = [];
                for (var i = 1; i <= 2; i++) {
                    arr.push(i.toString());
                }
                console.log('[data], [...]')
                //var c = [1,2];
                $scope.count = arr;
                $scope.invoiceNo = $routeParams.invoiceid;

                // functions for datepicker - start
                $scope.open = function ($event) {
                    console.log('Date');
                    $scope.opened = true;
                };

                $scope.format = 'dd-MMMM-yyyy';

                $scope.getDayClass = function (date, mode) {
                    if (mode === 'day') {
                        var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

                        for (var i = 0; i < $scope.events.length; i++) {
                            var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

                            if (dayToCheck === currentDay) {
                                return $scope.events[i].status;
                            }
                        }
                    }
                }
                $scope.goBack = function () {
                    window.history.back();
                };
                // functions for datepicker - end
            }]);