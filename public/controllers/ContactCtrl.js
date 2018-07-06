/*@function : ContactCtrl
 * Creator   : Smartdata
 * @purpose  : To manage contacts of ADVCC
 */
app.controller('ContactCtrl', ['$scope', 'Contact', 'Module', '$routeParams', '$route', 'logger', 'CONSTANTS', '$rootScope', 'Upload', 'User', 'LsOffer', 'Offer', 'Prompt', function ($scope, Contact, Module, $routeParams, $route, logger, CONSTANTS, $rootScope, Upload, User, LsOffer, Offer, Prompt) {
        $scope.CurrentDate = new Date();
        $scope.compose = {sms_header: '', method: 'yearly'};
        $scope.models = {
            selected: null,
            recipients: [],
        };

        $scope.listContact = function () {
            Contact.listContact().get({}, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    $scope.lists = response.data;
                    $scope.lists.forEach(function (item) {
                        item.contacts = [];
                        response.contacts.forEach(function (c) {
                            if (c.list_id == item._id) {
                                item.contacts.push(c);
                            }
                        });
                    });
                    console.log('$scope.lists', $scope.lists);
                    Module.pagination($scope.lists);
                } else {
                    Module.pagination({});
                    logger.logError(response.message);
                }


                if ($routeParams.agenda_id) {
                    Contact.getAgendaDetails().save({id: $routeParams.agenda_id}, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            $scope.compose = response.data;
                            $scope.compose.created = moment.utc($scope.compose.created).month($scope.compose.month - 1).date($scope.compose.date).hours($scope.compose.hours).minutes($scope.compose.minutes);
                            $scope.compose.created = moment.utc($scope.compose.created).tz($scope.compose.timezone).format('MMM DD, YYYY hh:mm A');
                            console.log('$scope.compose', $scope.compose);
//                        $scope.compose.time = new Date('', '', '', $scope.compose.hours, $scope.compose.minutes, 0, 0)
//                        $scope.compose.mixeddate = new Date(new Date().getFullYear(), $scope.compose.month - 1, $scope.compose.date, $scope.compose.hours, $scope.compose.minutes, 0, 0)
                            $scope.compose.time = new Date($scope.compose.created)
                            $scope.compose.mixeddate = new Date($scope.compose.created)
                            $scope.models.recipients = response.data.contacts;
                            var clists = [];
                            $scope.lists.forEach(function (item, i) {
                                $scope.models.recipients.forEach(function (receiver) {
                                    if (receiver._id != item._id) {
                                        clists.push(item);
                                    }
                                });
                                if (i + 1 == $scope.lists.length) {
                                    $scope.lists = clists;
                                    console.log('$scope.lists', $scope.lists);
                                }
                            });

                        } else {
                            logger.logError(response.message);
                        }
                    });
                }
            });
//        Contact.getTimezones().get({}, function (response) {
//            if (response.code == CONSTANTS.CODES.OK) {
//                $scope.timezones = response.data;
//            } else {
//                logger.logError(response.message);
//            }
//        });

            $scope.timezones = CONSTANTS.timezones;

            User.get_contactInfo().get({id: $rootScope.authenticatedUser._id}, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    $scope.compose.append = response.data.company_name + ' - ';
                } else {
                    logger.logError(response.message);
                }
            });

            Contact.listPhoneNumber().get(function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    $scope.phoneNumbers = response.data;
                } else {
                    logger.logError(response.message);
                }
            });
            $scope.offers = [];
            Offer.listOfferTemplate().get(function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    response.data.forEach(function (item) {
                        if (item.web_affiliate.webAffiliateMode == 'true') {
                            $scope.offers.push(item);
                        }
                    });
                } else {
                    logger.logError(response.message);
                }
            });


            Prompt.listPrompt().get(function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    $scope.prompts = response.data;
                }
            });

        };


        $scope.$watch('models', function (model) {
            $scope.modelAsJson = angular.toJson(model, true);
        }, true);

        $scope.tab = 1;
        $scope.isSet = function (tabId) {
            return $scope.tab === tabId;
        };
        $scope.setTab = function (tabId) {
            switch (tabId) {
                case 1 :
                    $scope.composee = true;
                    break;
                case 2 :
                    $scope.receiver = true;
                    break;
                case 3 :
                    $scope.getTimezoneData();
                    $scope.preview = true;
                    break;
                case 4 :
                    $scope.congo = true;
                    break;
            }
            $scope.tab = tabId;
        };
        $scope.check = [];
        $scope.checked = [];
        $scope.chkall = '';
        if ($routeParams.listid) {
            $scope.listid = $routeParams.listid;
            $scope.contact = {'list_id': $routeParams.listid};
        }

        if ($routeParams.contactid) {
            $scope.contactid = $routeParams.contactid;
            $scope.update = true;
            Contact.getContactInfo().save({'contact_id': $scope.contactid}, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    $scope.contact = response.data;
                } else {
                    logger.logError(response.message);
                }
            });
        }


        $scope.saveContactList = function (name) {
            Contact.saveContactList().save({'list_name': name}, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    $route.reload();
                } else {
                    logger.logError(response.message);
                }
            });
        };

        $scope.saveContact = function (contact) {
            Contact.saveContact().save(contact, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    window.history.back();
                } else {
                    logger.logError(response.message);
                }
            });
        };

        $scope.deleteContactList = function (listId) {
            swal({
                title: CONSTANTS.SWAL.deletetitle,
                text: CONSTANTS.SWAL.deletetext,
                type: CONSTANTS.SWAL.type,
                showCancelButton: CONSTANTS.SWAL.showCancelButton,
                confirmButtonColor: CONSTANTS.SWAL.confirmButtonColor,
                confirmButtonText: CONSTANTS.SWAL.deleteconfirmButtonText,
                closeOnConfirm: CONSTANTS.SWAL.closeOnConfirm
            }, function () {
                Contact.deleteContactList().save({'list_id': listId}, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.listContact();
                    } else {
                        logger.logError(response.message);
                    }
                });
            });
        };

        $scope.viewContact = function () {
            var listid = $routeParams.listid;

            Contact.getContacts().save({'list_id': listid}, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    Module.pagination(response.data);
                } else {
                    logger.logError(response.message);
                }
            });
        };

        $scope.deleteContact = function (contactid, listid) {
            swal({
                title: CONSTANTS.SWAL.deletetitle,
                text: CONSTANTS.SWAL.deletetext,
                type: CONSTANTS.SWAL.type,
                showCancelButton: CONSTANTS.SWAL.showCancelButton,
                confirmButtonColor: CONSTANTS.SWAL.confirmButtonColor,
                confirmButtonText: CONSTANTS.SWAL.deleteconfirmButtonText,
                closeOnConfirm: CONSTANTS.SWAL.closeOnConfirm
            }, function () {
                Contact.deleteContact().save({'list_id': listid, 'contact_id': contactid}, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        Module.pagination(response.data);
                    } else {
                        logger.logError(response.message);
                    }
                });
            });
        };

        $scope.checkall = function (data, value) {
            console.log('$scope.check', $scope.check);
            console.log('$scope.chkall', value);
            if (value) {
                $scope.check = [];
            } else {
                data.forEach(function (item) {
                    $scope.check.push(item._id);
                });
            }
        };

        $scope.sendEmail = function (data) {

            data.contacts = $scope.check;
            Contact.sendEmailToContacts().save(data, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    $route.reload();
                    logger.logSuccess(response.message);
                } else {
                    logger.logError(response.message);
                }
            });
        };

        $scope.sendSMS = function (data) {

            data.contacts = $scope.check;
            console.log(data);
            Contact.sendSMSToContacts().save(data, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    $route.reload();
                    logger.logSuccess(response.message);
                } else {
                    logger.logError(response.message);
                }
            });
        };

        $scope.setListId = function (listId) {
            $scope.list_id = listId;
        }

        $scope.importContactList = function (f) {
            console.log('myFile', f);
            console.log('$scope.list_id', $scope.list_id);
            Upload.upload({
                url: '/api_contact/importContactsCSV',
                data: {file: f, 'list_id': $scope.list_id}
            }).then(function (resp) {
                console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
                if (resp.data.status) {
                    $route.reload();
                    logger.logSuccess(resp.data.message);
                } else {
                    logger.logError(resp.data.message);
                }
            });
        }

//cronlist
        $scope.cronList = function () {
            Contact.cronList().get({}, function (response) {
                console.log(response);
                if (response.code == CONSTANTS.CODES.OK) {


                    $scope.lists = response.data;


                    $scope.lists.forEach(function (item) {

                        item.contacts = [];
                        response.data.forEach(function (c) {
                            if (c.list_id == item._id) {
                                console.log(c);
                                item.contacts.push(c);
                            }
                        });
                    });

                    Module.pagination($scope.lists);
                } else {
                    Module.pagination({});
                    logger.logError(response.message);
                }
            });

        };

        //delete cron list
        $scope.deleteCronList = function (id) {
            Contact.deleteCronList(id).get(function (response) {
                if (response.code == 200) {
                    $route.reload();
                    logger.logSuccess(response.message);
                }
                else {
                    logger.logError(response.message);
                }
            })
        }
        //CRONE VIEW
        $scope.cronView = function (ids) {
            $scope.id = ids
            Contact.findByIDCron().get({id: $scope.id}, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    $scope.userInfo = response.data[0];
                } else {
                    logger.logError(response.message);
                }
            });
            $scope.showListView = false;
            $scope.showAddPhone = false;
            $scope.showviewcron = false;
            $scope.manageAccess = false;
        }

// change the status of module
        $scope.changestatus = function (_id, status) {
            var user = {
                '_id': _id,
                'status': !status
            }
            console.log(status);
            Contact.changestatus().save(user, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    $scope.userList = response.data;
                    //Module.pagination(response.data)
                    logger.logSuccess(response.message);
                    $route.reload()
                } else {
                    logger.logError(response.message);
                }


            });
        }

        $scope.submitMessageType = function (data) {
            console.log(data);
            $scope.setTab(1);
        }

        $scope.backToBoard = function () {
            $route.reload();
        }

        $scope.changeTimezone = function (value) {
            console.log('value', value);
            $scope.timezoneDisplay = value;
        }

        $scope.getTimezoneData = function () {
//        if (($scope.compose.frequency == 'onetime' && $scope.compose.method == 'later') || $scope.compose.frequency == 'recurring') {
//            Contact.getTimezoneData().save({'timezone_id': $scope.compose.timezone}, function (response) {
//                if (response.code == CONSTANTS.CODES.OK) {
//                    $scope.timeZoneName = response.data.name;
//                } else {
//                    logger.logError(response.message);
//                }
//            });
//        }

            $scope.timezones.forEach(function (item) {
                if (item.name == $scope.compose.timezone) {
                    $scope.timeZoneName = item.text;
                }
            });
            var contactListIds = [];
            $scope.models.recipients.forEach(function (item) {
                contactListIds.push(item._id);
            });
            Contact.getMessageCount().save({contactListIds: contactListIds}, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    console.log('count', parseInt(response.count) * parseInt($scope.messageCount));
                    console.log('rescount', parseInt(response.count));
                    console.log('msgcount', parseInt($scope.messageCount));
                    $scope.msgCount = response.count;
//                $scope.msgCount = ($scope.compose.mode=='SMS')?(parseInt(response.count)*parseInt($scope.messageCount) ):response.count;
                } else {
                    logger.logError(response.message);
                }
            });
        }
        console.log(moment.tz.guess());
        $scope.sendMessage = function (data) {
            data.contacts = [];
            $scope.models.recipients.forEach(function (item) {
                data.contacts.push(item._id);
            });
            if (data.time) {
                data.hours = moment(data.time).format('HH');
                data.minutes = moment(data.time).format('mm');
//            alert(data.hours);
//            alert(data.minutes);
                data.finalTime = moment.tz(data.timezone).hours(data.hours).minutes(data.minutes);

            }

            if (data.mixeddate) {
                data.date = moment(data.mixeddate).format('DD');
                data.month = moment(data.mixeddate).format('MM');
                data.finalTime = moment.tz(data.timezone).hours(data.hours).minutes(data.minutes).date(data.date).month(data.month);
            }

            if (data.frequency == 'onetime' && data.method == 'now') {
                data.hours = moment().format('HH');
                data.minutes = moment().format('mm');
                data.date = moment().format('DD');
                data.month = moment().format('MM');
            }
            if (!data.timezone) {
                data.timezone = moment.tz.guess();
            }

//        data.message = (data.mode == 'SMS') ? data.append + data.message : data.message;
            console.log('data', data);
//        alert(data.finalTime);


            if ($routeParams.agenda_id) {

                Contact.editComposeMessage().save(data, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        logger.logSuccess(response.message);
                        $scope.setTab(4);
                    } else {
                        logger.logError(response.message);
                    }
                });
            } else {
                Contact.saveComposeMessage().save(data, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        logger.logSuccess(response.message);
                        $scope.setTab(4);
                    } else {
                        logger.logError(response.message);
                    }
                });
            }
        }

        $scope.listMessageHistory = function () {
            Contact.listMessageHistory().get(function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    var data = [];
                    response.data.forEach(function (item, i) {
                        if (item.timezone && item.created && item.month && item.date && item.hours && item.minutes && item.frequency != 'weblead') {
//                        item.created = moment(item.created).tz(item.timezone).format('MMM DD, YYYY hh:mm A');
                            item.created = moment.utc(item.created).month(item.month - 1).date(item.date).hours(item.hours).minutes(item.minutes);
                            item.created = moment.utc(item.created).tz(item.timezone).format('MMM DD, YYYY hh:mm A');
//                        item.sent_time = moment(item.sent_time).tz(item.timezone).format('MMM DD, YYYY hh:mm A');
                        } else {
                            item.created = moment(item.created).format('MMM DD, YYYY hh:mm A');
                        }
                        data.push(item);
                    });
                    Module.pagination(response.data);
                } else {
                    logger.logError(response.message);
                }
            });
        };

        $scope.historyView = function (id) {
            LsOffer.listPhoneNumber().get(function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    $scope.phoneNumbers = response.data;
                } else {
                    logger.logError(response.message);
                }
            });

            Contact.getMessageHistoryData().save({id: id}, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    $scope.historyData = response.data;
                    $scope.success = response.success;
                    $scope.failed = response.failed;
                    if ($scope.historyData.timezone) {
//                    $scope.historyData.created = moment($scope.historyData.sent_time).tz($scope.historyData.timezone).format('MMM DD, YYYY hh:mm A');
                        $scope.historyData.created = moment.utc($scope.historyData.created).month($scope.historyData.month - 1).date($scope.historyData.date).hours($scope.historyData.hours).minutes($scope.historyData.minutes);
                        console.log('$scope.historyData.created', $scope.historyData.created);
                        console.log('$scope.historyData.timezone', $scope.historyData.timezone);
                        $scope.historyData.created = moment.utc($scope.historyData.created).tz($scope.historyData.timezone).format('MMM DD, YYYY hh:mm A');
                        console.log('converted', $scope.historyData.created);
                    }

                    if ($scope.historyData.mode.toUpperCase() == 'SMS') {
                        var arrText = $scope.historyData.text.split('-');
                        $scope.historyData.text = arrText[1];
                        $scope.historyData.append = arrText[0];
                    }
                } else {
                    logger.logError(response.message);
                }
            });
        };

        $scope.sendMessageEdit = function (data) {
            console.log(data);
            data.sms_header = (data.sms_header) ? data.sms_header : data.from;
            Contact.sendMessageEdit().save(data, function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    logger.logSuccess(response.message);
                    $route.reload();
                } else {
                    logger.logError(response.message);
                }
            });
        }
    }]);

/*@function : OptoutCtrl
 * Creator   : Smartdata
 * @purpose  : To opt out contacts from SMS or EMAIL
 */
app.controller('OptoutCtrl', ['$scope', 'Contact', '$routeParams', 'logger', function ($scope, Contact, $routeParams, logger) {
        var data = {'mode': $routeParams.mode, 'contact_id': $routeParams.contact_id};
        Contact.optout().save(data, function (response) {
            $scope.message = response.message;
            if (response.code == CONSTANTS.CODES.OK) {
                logger.logSuccess(response.message);
            } else {
                logger.logError(response.message);
            }
        });
    }]);