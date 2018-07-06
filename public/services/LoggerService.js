angular.module('LoggerService', [])

        /**************************************  Logger Service Section   **************************************/
        /*@factory  : logger
         * Creator   : SmartData (A2)
         * @created  : 24 August 2015
         * @purpose  : logger Services provider (for success and error messages)
         */

        .factory("logger", [function () {
                var logIt;
                return toastr.options = {
                    closeButton: !0,
                    positionClass: "toast-bottom-right",
                    timeOut: "3000"
                }, logIt = function (message, type) {
                    toastr.clear();
                    return toastr[type](message)
                }, {
                    log: function (message) {
                        logIt(message, "info")
                    },
                    logWarning: function (message) {
                        logIt(message, "warning")
                    },
                    logSuccess: function (message) {
                        logIt(message, "success")
                    },
                    logError: function (message) {
                        logIt(message, "error")
                    }
                }
            }]);