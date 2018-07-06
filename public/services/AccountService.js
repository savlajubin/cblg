// public/js/services/AccountService.js
angular.module('AccountService', [])

        /**************************************  Account Management Services Section   **************************************/
        /*@factory  : Account
         * Creator   : Smartdata B2
         * @created  : 20102015
         * @purpose  : Account Services
         */

        .factory('Account', ['$resource', function ($resource) {
                return {
                    acccountReceivable: function () {
                        return $resource('/api_account/acccountReceivable') //get account receivable
                    },
                    acccountPayable: function () {
                        return $resource('/api_account/acccountPayable') //get account receivable
                    },
                    paymentHistory: function () {
                        return $resource('/api_account/paymentHistory') //get account receivable
                    },
                    markAsPaid: function () {
                        return $resource('/api_account/markAsPaid') //get account receivable
                    },
                    markAsPaidReceivable: function () {
                        return $resource('/api_account/markAsPaidReceivable') //get account receivable
                    },
                    makePayment: function () {
                        return $resource('/api_account/makePayment') //makePayment
                    },
                    pdfGeneration: function () {
                        return $resource('/api_account/pdfGeneration') //pdf Generation
                    },
                    submitOneTimeInvoice: function () {
                        return $resource('/api_account/submitOneTimeInvoice') //send one time invoice
                    },
                    sendOneTimeInvoice: function () {
                        return $resource('/api_account/sendOneTimeInvoice') //send one time invoice
                    },
                    getInvoiceCount: function () {
                        return $resource('/api_account/getInvoiceCount') //send one time invoice
                    }
                }
            }]);
/**************************************  Account Management Services Section   **************************************/