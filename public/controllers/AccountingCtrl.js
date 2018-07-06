/*@function : LsUserCtrl
 * Creator   : Smartdata
 * @purpose  : To manage lead generation users
 */
app.controller('AccountingCtrl', ['$scope', 'Account', 'User', '$rootScope', '$location', '$route', 'logger', 'Module', '$modal', 'CONSTANTS', function ($scope, Account, User, $rootScope, $location, $route, logger, Module, $modal, CONSTANTS) {

        $scope.calculateTotal = function () {
            var totalAmt = 0;
            if ($scope.invoice.record) {
                _.each($scope.invoice.record, function (record) {
                    if (record) {
                        totalAmt += record.amount ? record.amount : 0;
                    }
                });
            }
            $scope.invoice['totalAmount'] = totalAmt;
        };


        $scope.acccountReceivable = function () {
            Account.acccountReceivable().get(function (response) {
                Module.pagination(response.data)
            });
        };
        $scope.acccountPayable = function () {
            Account.acccountPayable().get(function (response) {
                Module.pagination(response.data)
            });
        };

        $scope.paymentHistory = function () {
            $scope.loggedInUserId = $rootScope.authenticatedUser._id;
            Account.paymentHistory().get(function (response) {
                Module.pagination(response.data);
            });
        };

        $scope.markAsPaid = function (invoiceid) {
            swal({
                title: CONSTANTS.SWAL.marktitle,
                text: CONSTANTS.SWAL.marktext,
                type: CONSTANTS.SWAL.type,
                showCancelButton: CONSTANTS.SWAL.showCancelButton,
                confirmButtonColor: CONSTANTS.SWAL.confirmButtonColor,
                confirmButtonText: CONSTANTS.SWAL.statusConfirmButtonText,
                closeOnConfirm: CONSTANTS.SWAL.closeOnConfirm},
            function () {
                Account.markAsPaid().save({id: invoiceid}, function (response) {
                    if (response.code == 200) {
                        Module.pagination(response.data)
                        logger.logSuccess(response.message);
                    } else {
                        logger.logError(response.message);
                    }
                });
            });
        };

        //show data for invoice
        $scope.showdata = function (invoiceData) {

            $scope.invoiceData = invoiceData;

            $scope.invoiceType = invoiceData.invoiceType;
            $scope.invoice = {};
            if (invoiceData.invoiceType == 'onetime') {

                $scope.invoice['from_name'] = invoiceData.oneTimeInvoiceDetails.fromDetails.name;
                $scope.invoice['from_address'] = invoiceData.oneTimeInvoiceDetails.fromDetails.address;
                $scope.invoice['from_city'] = invoiceData.oneTimeInvoiceDetails.fromDetails.location;
                $scope.invoice['from_country'] = invoiceData.oneTimeInvoiceDetails.fromDetails.country;

                $scope.invoice['to_name'] = invoiceData.oneTimeInvoiceDetails.toDetails.name;
                $scope.invoice['to_address'] = invoiceData.oneTimeInvoiceDetails.toDetails.address;
                $scope.invoice['to_city'] = invoiceData.oneTimeInvoiceDetails.toDetails.location;
                $scope.invoice['to_country'] = invoiceData.oneTimeInvoiceDetails.toDetails.country;

                $scope.invoice['record'] = invoiceData.oneTimeInvoiceDetails.multipleItemList;

                $scope.invoice['notes'] = invoiceData.oneTimeInvoiceDetails.notes ? invoiceData.oneTimeInvoiceDetails.notes : 'N/A';
            } else {
                $scope.invoice['from_name'] = invoiceData.pay_from ? invoiceData.pay_from : '';
                $scope.invoice['from_address'] = invoiceData.pay_fromID.addressLine1 ? invoiceData.pay_fromID.addressLine1 : '';
                $scope.invoice['from_city'] = invoiceData.pay_fromID.city ? invoiceData.pay_fromID.city : '';
                $scope.invoice['from_country'] = invoiceData.pay_fromID.country ? invoiceData.pay_fromID.country : '';

                $scope.invoice['to_name'] = invoiceData.owedTo ? invoiceData.owedTo : '';
                $scope.invoice['to_address'] = invoiceData.owedToID.addressLine1 ? invoiceData.owedToID.addressLine1 : '';
                $scope.invoice['to_city'] = invoiceData.owedToID.city ? invoiceData.owedToID.city : '';
                $scope.invoice['to_country'] = invoiceData.owedToID.country ? invoiceData.owedToID.country : '';

                $scope.invoice['unit_price'] = invoiceData.amount ? invoiceData.amount : 0;
                $scope.invoice['qty'] = 1;

                $scope.invoice['description'] = invoiceData.description ? invoiceData.description : '';
                $scope.invoice['item'] = invoiceData.item ? invoiceData.item : '';
            }

            $scope.invoice['heading'] = '';
            $scope.invoice['invoice_number'] = invoiceData.invoice_no ? invoiceData.invoice_no : '';
            $scope.invoice['invoice_date'] = invoiceData.created ? moment(new Date(invoiceData.created)).format("MM/DD/YYYY") : '';
            $scope.invoice['payment_due_date'] = invoiceData.dueDate ? moment(new Date(invoiceData.dueDate)).format("MM/DD/YYYY") : '';
            $scope.formData = {};
            var payFromEmail = invoiceData.pay_fromID ? invoiceData.pay_fromID.email : '';
            var guestUserEmail = invoiceData.guestUser ? invoiceData.oneTimeInvoiceDetails.guestUserEmail : '';
            $scope.formData['email'] = invoiceData.guestUser ? guestUserEmail : payFromEmail;
        };

        //set commission rate
        $scope.initialiseInvoice = function () {
            $scope.commission = CONSTANTS.COMMISSION.default;
            $scope.invoiceData.commission = CONSTANTS.COMMISSION.default;
            $scope.invoiceData.payment_mode = '';
        }
        $scope.commission = CONSTANTS.COMMISSION.default;
        $scope.setCommision = function (payment_type, amt) {
            switch (payment_type) {
                case 'eCheck_ACH':
                    $scope.commission = CONSTANTS.COMMISSION.default;
                    break;
                case 'wire':
                    $scope.commission = CONSTANTS.COMMISSION.wire;
                    break;
                case 'paperCheck':
                    $scope.commission = CONSTANTS.COMMISSION.default;
                    break;
                case 'paypal':
                    $scope.commission = parseInt(amt) * CONSTANTS.COMMISSION.paypal;
                    break;
                default:
                    $scope.commission = CONSTANTS.COMMISSION.default;
                    break;
            }
            $scope.invoiceData.commission = $scope.commission;
            $scope.amountTobePaid = parseInt(amt) + $scope.commission;
        };

        //make payment
        $scope.makePayment = function (invoiceData) {
            console.log(invoiceData);
            var sendData = {
                id: invoiceData._id,
                //payment_status: {type: Boolean, default: false},
                payment_mode: invoiceData.payment_mode,
                saas_commission: invoiceData.commission,
                payment_status: true,
                invoice_number: invoiceData.invoice_no
            }
            Account.makePayment().save(sendData, function (response) {
                if (response.code == 200) {
                    $route.reload();
                    logger.logSuccess(response.message);
                } else {
                    logger.logError(response.message);
                }
            });
        };

        $scope.pdfGenerate = function (invoiceData) {
            console.log('invoiceData', invoiceData);

            Account.pdfGeneration().save(invoiceData, function (response) {
                if (response.code == 200) {
                    logger.logSuccess(response.message);
                    var myWin = window.open(response.pdfUrl);
                    if (myWin == undefined) {
                        logger.logError('Please disable your popup blocker');
                    }
                } else {
                    logger.logError(response.message);
                }
            });
        }

        $scope.printInvoice = function (invoiceData) {
            console.log('invoiceData', invoiceData);

            Account.pdfGeneration().save(invoiceData, function (response) {
                if (response.code == 200) {
                    logger.logSuccess(response.message);
                    var myWin = window.print(response.pdfUrl);
                    if (myWin == undefined) {
                        logger.logError('Please disable your popup blocker');
                    }
                } else {
                    logger.logError(response.message);
                }
            });
        }

        //$scope.showInvoice = true;
        $scope.invoiceSubmit = function (formDetails) {
            if (formDetails.userId) {
                formDetails.userType = 'existing';
            } else {
                formDetails.userType = 'outsider';
            }

            Account.submitOneTimeInvoice().save(formDetails, function (response) {
                if (response.code == 200) {
                    $scope.invoiceDetails = formDetails;
                    $scope.invoiceDetails['invoice_number'] = response.data.invoice_no ? response.data.invoice_no : '';
                    $scope.formData.email = response.data.oneTimeInvoiceDetails.guestUserEmail ? response.data.oneTimeInvoiceDetails.guestUserEmail : '';
                    /* Show Appointment Details */
                    var invoiceSendForm = $modal({scope: $scope, contentTemplate: "invoiceForm.html", show: false});
                    $scope.invoiceSendForm = invoiceSendForm;
                    invoiceSendForm.$promise.then(invoiceSendForm.show);

                    //$scope.showInvoice = false;
                } else {
                    logger.logError(response.message);
                }
            });
        }

        $scope.sendMailInvoice = function (formData) {

            if ($rootScope.authenticatedUser.aws_verified_email) {
                Account.sendOneTimeInvoice().save({'toEmailId': formData.email, 'formEmailId': $rootScope.authenticatedUser.aws_verified_email, 'invoiceDetails': $scope.invoiceDetails}, function (response) {
                    if (response.code == 200) {
                        logger.logSuccess(response.message);
                        $location.path('/' + $rootScope.currentRoleCode + '/send-one-time-invoice/');
                        $scope.invoiceSendForm.$promise.then($scope.invoiceSendForm.hide);
                        //$scope.showInvoice = true;
                    } else {
                        logger.logError(response.message);
                    }
                });
            } else {
                logger.logError('Email Address is not verified yet. Please verify it from My Account.');
            }
        }


        $scope.sendMailInvoiceListing = function (formData, invoiceDetails) {

            if ($rootScope.authenticatedUser.aws_verified_email) {
                Account.sendOneTimeInvoice().save({'toEmailId': formData.email, 'formEmailId': $rootScope.authenticatedUser.aws_verified_email, 'invoiceDetails': invoiceDetails}, function (response) {
                    if (response.code == 200) {
                        logger.logSuccess(response.message);
                        $location.path('/' + $rootScope.currentRoleCode + '/accounts-receivable/');
                    } else {
                        logger.logError(response.message);
                    }
                });
            } else {
                logger.logError('Email Address is not verified yet. Please verify it from My Account.');
            }
        }



        $scope.ngRepeater = [{}];
        $scope.invoice = {};

        /*function zeroPad(num, places) {
         var zero = places - num.toString().length + 1;
         return Array(+(zero > 0 && zero)).join("0") + num;
         }*/

        $scope.initializeInvoice = function () {

            var randomString = function (length) {
                var text = "";
                var possible = Date.now() + "0123456789";
                for (var i = 0; i < length; i++) {
                    text += possible.charAt(Math.floor(Math.random() * possible.length));
                }
                return text;
            }

            /* Get list of users */
            //User.listUser().get({id: 'ALL'}, function (response) {
            var roleCode = $rootScope.authenticatedUser.role_id.code;
            User.userLisitingForOneTimeInvoice({"roleCode": roleCode}).get(function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    $scope.userList = response.data;
                }
            });

            var company_name = $rootScope.authenticatedUser.company_name ? $rootScope.authenticatedUser.company_name.substring(0, 3) : 'PSX';
            $scope.formData = {};
            $scope.invoice = {
                'record': [],
                'from_name': $rootScope.authenticatedUser.first_name + " " + $rootScope.authenticatedUser.last_name,
                'from_address': $rootScope.authenticatedUser.address ? $rootScope.authenticatedUser.address : '',
                'from_city': $rootScope.authenticatedUser.city + ', ' + $rootScope.authenticatedUser.state + ', ' + $rootScope.authenticatedUser.zip ? $rootScope.authenticatedUser.city + ', ' + $rootScope.authenticatedUser.state + ', ' + $rootScope.authenticatedUser.zip : '',
                'from_country': $rootScope.authenticatedUser.country ? $rootScope.authenticatedUser.country : '',
                //'invoice_number': company_name.toUpperCase() + "_" + $scope.invoiceNumber,
                'invoice_date': moment(new Date()).format("MM/DD/YYYY"), //Today's Date
                'payment_due_date': moment(new Date()).format("MM/DD/YYYY") //Today's Date
            };
        }


        $scope.decrementCount = function (index) {
            console.log('index', index);
            if ($scope.ngRepeater.length > 1) {
                $scope.ngRepeater.splice(index, 1);

                if ($scope.invoice && $scope.invoice.record && $scope.invoice.record[index] && $scope.invoice.record[index].amount) {
                    $scope.invoice['totalAmount'] = $scope.invoice['totalAmount'] - $scope.invoice.record[index].amount;
                }
                $scope.invoice.record.splice(index, 1);
            } else {
                alert("Atleast One Item is Required")
            }
        }

        /* To check valid amount/quantity */
        $scope.checkIsValid = function (whatToCheck, howToCheck) {
            if (whatToCheck) {
                switch (howToCheck) {
                    case 'amount':
                        return whatToCheck.match(/^(\d*\.?\d+|\d{1,3}(,\d{3})*(\.\d+)?)$/g);
                        break;
                    case 'quantity':
                        return whatToCheck.match(/^[0-9]+$/g);
                        break;
                    default:
                        return true;
                }
            } else {
                return true;
            }
        }

        /* To check quantity should be greater than zero */
        $scope.checkIfNotZero = function (quantity) {
            if (quantity != 'undefined') {
                if (quantity <= 0) {
                    return false;
                }
                return true;
            }
            return true;
        }

        $scope.getUserDetails = function (userId) {
            if (userId) {
                User.findByIDUser().get({id: userId}, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.formData.email = response.data[0].email;
                        if (response.data[0].city && response.data[0].state && response.data[0].zip) {
                            var city = response.data[0].city + ', ' + response.data[0].state + ', ' + response.data[0].zip;
                        } else {
                            var city = '';
                        }
                        $scope.invoice.to_name = response.data[0].first_name + " " + response.data[0].last_name;
                        $scope.invoice.to_address = response.data[0].addressLine1 ? response.data[0].addressLine1 : '';
                        $scope.invoice.to_city = city ? city : '';
                        $scope.invoice.to_country = response.data[0].country ? response.data[0].country : '';
                    } else {
                        logger.logError(response.message);
                    }
                });
            } else {
                $scope.invoice.userId = '';
                $scope.formData.email = '';
                $scope.invoice.to_name = '';
                $scope.invoice.to_address = '';
                $scope.invoice.to_city = '';
                $scope.invoice.to_country = '';
            }
        }

        /* To show information in preview */
        $scope.showPreview = function (invoiceType, invoiceItems) {
            $scope.invoice['multipleItemList'] = invoiceItems;
            $scope.invoiceType = 'onetime';
        }
    }])

