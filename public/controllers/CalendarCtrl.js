angular.module('calendarModule', [])
        /*@function : CalendarCtrl
         * Creator   : SmartData
         * @created  : 14 July 2015
         * @purpose  : Calendar management (add , edit etc...)
         */
        .controller('CalendarCtrl', ['$scope', '$validator', '$compile', 'uiCalendarConfig', '$builder', 'logger', 'Calendar', 'CONSTANTS', '$modal', function ($scope, $validator, $compile, uiCalendarConfig, $builder, logger, Calendar, CONSTANTS, $modal) {

                var date = new Date();
                var d = date.getDate();
                var m = date.getMonth();
                var y = date.getFullYear();

                /*@function : getAssignedFormScript
                 * Creator   : Smartdata
                 * @purpose  : To get all calendar script assigned to PA
                 */
                $scope.getAssignedFormScript = function () {
                    Calendar.getCalendarScript().get({}, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            $scope.calendarScript = response.data.calendarScript;
                        } else {
                            logger.logError(response.message);
                        }
                    });
                }();

                /*@function : getCreatedEvents
                 * Creator   : Smartdata
                 * @purpose  : To get already created events
                 */
                $scope.getCreatedEvents = function () {
                    $scope.events = [];
                    Calendar.getCreatedEvents().get({}, function (response) {
                        if (response.code == CONSTANTS.CODES.OK) {
                            if (response.data) {
                                angular.forEach(response.data, function (eventData) {
                                    var color = '#3A87AD';
                                    if (eventData.appointment_status == 'Complete') {
                                        color = '#5cb85c';
                                    } else if (eventData.appointment_status == 'Missed') {
                                        color = '#d9534f';
                                    }
                                    $scope.events.push({'title': eventData.eventName, 'start': new Date(eventData.fromDate), 'end': new Date(eventData.endDate), 'eventId': eventData._id, 'isPrivate': eventData.isPrivate, 'color': color});
                                });
                            }
                        } else {
                            console.log('No appointments found');
                        }
                    });

                }();

                /*@function : getSpecificCalendarScript
                 * Creator   : Smartdata
                 * @purpose  : To get specific calendar script from all the fetched script as per the calendar option selected
                 */
                $scope.getSpecificCalendarScript = function (calendarId) {
                    $builder.forms['default'] = [];
                    $scope.newForm = $builder.forms['default'];

                    if (calendarId) {
                        var formData = _.find($scope.calendarScript, function (d) {
                            return d.script_id._id == calendarId;
                        });

                        $scope.calendarScriptId = formData.script_id._id;
                        $scope.calendarScriptName = formData.script_id.script_name;

                        angular.forEach(_.sortBy(formData.script_id.scriptData, 'index'), function (element, eIndex) {
                            $builder.addFormObject('default', {
                                id: element.index, //eIndex,
                                index: element.index, //'name',
                                component: element.component, //'name',
                                label: element.label, //'Name',
                                description: element.description, //'Your name',
                                placeholder: element.placeholder, //'Your name',
                                required: element.required, //true,
                                editable: element.editable, //true
                                options: element.optionsArr, //true

                                firstNameLabel: element.firstNameLabel,
                                lastNameLabel: element.lastNameLabel,
                                addressOneLabel: element.addressOneLabel,
                                addressTwoLabel: element.addressTwoLabel,
                                cityLabel: element.cityLabel,
                                stateLabel: element.stateLabel,
                                zipCodeLabel: element.zipCodeLabel
                            });
                        });

                        $scope.newForm = $builder.forms['default'];
                    } else {
                        $builder.addFormObject('default', {
                            component: 'textArea', //'name',
                            label: 'Appointment Description', //'Name',
                            description: 'Add a description to your appointment', //'Your name',
                            placeholder: 'Type here', //'Your name',
                            required: false //true,
                        });
                    }
                }

                /*@function : alertOnEventClick
                 * Creator   : Smartdata
                 * @purpose  : To display the apointment details on event click
                 */
                $scope.alertOnEventClick = function (date, jsEvent, view) {
                    /* Get appointment Details */
                    Calendar.getEventScript().get({eventId: date.eventId}, function (response) {
                        if (response.code == CONSTANTS.CODES.OK && response.data) {
                            $scope.eventDetails = response.data.scriptData;
                            $scope.eventId = response.data._id;
                            $scope.appointmentStatus = response.data.appointment_status;

                            var appointmentMode = 'Private';
                            if (response.data.isPrivate == 'false') {
                                appointmentMode = 'Public';
                            }
                            $scope.appointmentMode = appointmentMode;

                            /* Show Appointment Details */
                            var appointmentDetailsForm = $modal({scope: $scope, templateUrl: "/views/pa/appointmentDetails.html", show: false});
                            $scope.appointmentDetailsForm = appointmentDetailsForm;
                            appointmentDetailsForm.$promise.then(appointmentDetailsForm.show);
                        }
                    });
                };

                /*@function : updateAppointmentStatus
                 * Creator   : Smartdata
                 * @purpose  : To update appointment status
                 */
                $scope.updateAppointmentStatus = function (formData, eventId) {

//        swal({
//            title: CONSTANTS.SWAL.statusChangeConfirmBoxTitle,
//            text: CONSTANTS.SWAL.statusConfirmtext,
//            type: CONSTANTS.SWAL.type,
//            showCancelButton: CONSTANTS.SWAL.showCancelButton,
//            confirmButtonColor: CONSTANTS.SWAL.confirmButtonColor,
//            confirmButtonText: CONSTANTS.SWAL.statusConfirmButtonText,
//            closeOnConfirm: CONSTANTS.SWAL.closeOnConfirm},
//        function () {
                    Calendar.updateAppointmentStatus().save({'eventId': eventId, 'appointmentStatus': formData.appointmentStatus}, function (data) {
                        if (data.code == CONSTANTS.CODES.OK) {

                            $scope.newEvents = $scope.events;
                            $scope.events = [];
                            _.find($scope.newEvents, function (d) {
                                if (d.eventId == eventId) {
                                    if (formData.appointmentStatus == 'Complete') {
                                        d.color = '#5cb85c';
                                    } else if (formData.appointmentStatus == 'Missed') {
                                        d.color = '#d9534f';
                                    }
                                    $scope.events.push(d);
                                } else {
                                    $scope.events.push(d);
                                }
                            });

                            isCalendarRefreshed = true;
                            $('#calendar').fullCalendar('removeEvents');
                            $('#calendar').fullCalendar('addEventSource', $scope.events);
                            $('#calendar').fullCalendar('rerenderEvents');

                            $scope.appointmentDetailsForm.$promise.then($scope.appointmentDetailsForm.hide);
                            logger.logSuccess(data.message);
                        } else {
                            logger.logError(data.message);
                        }
                    });
//        });
                }

                /*@function : openCalendarForm
                 * Creator   : Smartdata
                 * @purpose  : Open Popup to provide appointment creation form
                 */
                $scope.openCalendarForm = function (selectedDate) {

                    if (selectedDate == 'Todays Date') {
                        selectedDate = new Date(y, m, d);
                    }

                    if (selectedDate < moment(new Date(y, m, d)).format("YYYY-MM-DD")) {
                        swal({
                            title: CONSTANTS.SWAL.passedAppointmentTitle,
                            text: CONSTANTS.SWAL.passedAppointmentText,
                            type: CONSTANTS.SWAL.type,
                            //showCancelButton: CONSTANTS.SWAL.showCancelButton,
                            confirmButtonColor: CONSTANTS.SWAL.confirmButtonColor,
                            confirmButtonText: CONSTANTS.SWAL.passedAppointmentButtonText,
                            closeOnConfirm: CONSTANTS.SWAL.closeOnConfirm});
                    } else {
                        $scope.appointmentData = {appointmentFrom: new Date(selectedDate), appointmentTimeFrom: new Date(y, m, d, 7, 0), appointmentTimeTo: new Date(y, m, d, 19, 0)};
                        $scope.todaysDate = new Date(y, m, d); //Today's Date

                        $builder.forms['default'] = [];
                        $builder.addFormObject('default', {
                            component: 'textArea', //'name',
                            label: 'Appointment Description', //'Name',
                            description: 'add a description to your appointment', //'Your name',
                            placeholder: 'Type here', //'Your name',
                            required: false //true,
                        });
                        $scope.newForm = $builder.forms['default'];


                        var createAppointmentFormModal = $modal({scope: $scope, templateUrl: "/views/pa/appointmentForm.html", show: false});
                        $scope.createAppointmentFormModal = createAppointmentFormModal;
                        createAppointmentFormModal.$promise.then(createAppointmentFormModal.show);
                    }
                }

                /*@function : createAppointment
                 * Creator   : Smartdata
                 * @purpose  : Create appointment
                 */
                $scope.inputData = [];
                var isCalendarRefreshed = false;
                $scope.createAppointment = function (appointmentData, formData) {
                    console.log('appointmentData :', appointmentData);
                    $validator.validate($scope, 'default').success(function () {
                        var fromDate = moment(appointmentData.appointmentFrom).format("YYYY-MM-DD");
                        //var toDate = moment(appointmentData.appointmentTo).format("YYYY-MM-DD");
                        var fromTime = moment(appointmentData.appointmentTimeFrom).format("HH:mm:ssZ");
                        var toTime = moment(appointmentData.appointmentTimeTo).format("HH:mm:ssZ");

                        var newFrom = fromDate + 'T' + fromTime;
                        var newTo = fromDate + 'T' + toTime;

                        var fromDate = new Date(newFrom);
                        var endDate = new Date(newTo);

                        var isApppointmentExists = '';
                        if ($scope.events) {
                            isApppointmentExists = _.find($scope.events, function (d) {
                                return ((d.start.getTime() == fromDate.getTime()) && d.isPrivate == 'true');
                            });
                        }

                        if (isApppointmentExists) {
                            swal({
                                title: CONSTANTS.SWAL.sameAppointmentBoxTitle,
                                text: CONSTANTS.SWAL.sameAppointmentText,
                                type: CONSTANTS.SWAL.type,
                                showCancelButton: CONSTANTS.SWAL.showCancelButton,
                                confirmButtonColor: CONSTANTS.SWAL.confirmButtonColor,
                                confirmButtonText: CONSTANTS.SWAL.statusConfirmButtonText,
                                closeOnConfirm: CONSTANTS.SWAL.closeOnConfirm},
                            function () {
                                Calendar.createEvent().save({'calendarScriptId': $scope.calendarScriptId, 'calendarScriptName': $scope.calendarScriptName, 'eventName': appointmentData.appointmentName, 'fromDate': fromDate, 'endDate': endDate, 'isPrivate': appointmentData.appointmentMode, 'scriptData': formData}, function (data) {
                                    if (data.result == CONSTANTS.CODES.OK) {
                                        $scope.events.push({'title': data.data.eventName, 'start': new Date(data.data.fromDate), 'end': new Date(data.data.endDate), 'eventId': data.data._id, 'isPrivate': data.data.isPrivate, 'color': '#3A87AD'});
                                        if (isCalendarRefreshed) {
                                            $('#calendar').fullCalendar('removeEvents');
                                            $('#calendar').fullCalendar('addEventSource', $scope.events);
                                            $('#calendar').fullCalendar('rerenderEvents');
                                        }
                                        $scope.createAppointmentFormModal.$promise.then($scope.createAppointmentFormModal.hide);
                                        logger.logSuccess(data.message);
                                    } else {
                                        logger.logError(data.message);
                                    }
                                });
                            });
                        } else {
                            Calendar.createEvent().save({'calendarScriptId': $scope.calendarScriptId, 'calendarScriptName': $scope.calendarScriptName, 'eventName': appointmentData.appointmentName, 'fromDate': fromDate, 'endDate': endDate, 'isPrivate': appointmentData.appointmentMode, 'scriptData': formData}, function (data) {
                                if (data.result == CONSTANTS.CODES.OK) {
                                    $scope.events.push({'title': data.data.eventName, 'start': new Date(data.data.fromDate), 'end': new Date(data.data.endDate), 'eventId': data.data._id, 'isPrivate': data.data.isPrivate, 'color': '#3A87AD'});
                                    if (isCalendarRefreshed) {
                                        $('#calendar').fullCalendar('removeEvents');
                                        $('#calendar').fullCalendar('addEventSource', $scope.events);
                                        $('#calendar').fullCalendar('rerenderEvents');
                                    }
                                    $scope.createAppointmentFormModal.$promise.then($scope.createAppointmentFormModal.hide);
                                    logger.logSuccess(data.message);
                                } else {
                                    logger.logError(data.message);
                                }
                            });
                        }
                    }).error(function () {
                        logger.logError('validation error');
                    });
                }


                /* alert on Drop */
                $scope.alertOnDrop = function (event, delta, revertFunc, jsEvent, ui, view) {
                    $scope.alertMessage = ('Event Droped to make dayDelta ' + delta);
                };

                /* alert on Resize */
                $scope.alertOnResize = function (event, delta, revertFunc, jsEvent, ui, view) {
                    $scope.alertMessage = ('Event Resized to make dayDelta ' + delta);
                };

                /* add and removes an event source of choice */
                $scope.addRemoveEventSource = function (sources, source) {
                    var canAdd = 0;
                    angular.forEach(sources, function (value, key) {
                        if (sources[key] === source) {
                            sources.splice(key, 1);
                            canAdd = 1;
                        }
                    });
                    if (canAdd === 0) {
                        sources.push(source);
                    }
                };

                /* add custom event*/
                $scope.addEvent = function () {
                    $scope.events.push({
                        title: 'Open Sesame',
                        start: new Date(y, m, 28),
                        end: new Date(y, m, 29),
                        className: ['openSesame']
                    });
                };

                /* remove event */
                $scope.remove = function (index) {
                    $scope.events.splice(index, 1);
                };

                /* Change View */
                $scope.changeView = function (view, calendar) {
                    //alert('IN ChangeView');
                    uiCalendarConfig.calendars[calendar].fullCalendar('changeView', view);
                };

                /* Change View */
                $scope.renderCalender = function (calendar) {
                    if (uiCalendarConfig.calendars[calendar]) {
                        uiCalendarConfig.calendars[calendar].fullCalendar('render');
                    }
                };
                /* Render Tooltip */
                $scope.eventRender = function (event, element, view) {
                    element.attr({'tooltip': event.title,
                        'tooltip-append-to-body': true});
                    $compile(element)($scope);
                };

                /* config object */
                $scope.uiConfig = {
                    calendar: {
                        height: 450,
//            editable: true,
                        header: {
                            left: 'title',
                            center: '',
                            right: 'today prev,next'
                        },
                        eventClick: $scope.alertOnEventClick,
                        eventDrop: $scope.alertOnDrop,
                        eventResize: $scope.alertOnResize,
                        eventRender: $scope.eventRender,
                        dayClick: function (date, jsEvent, view) {
                            $scope.openCalendarForm(date.format());
                        }
                    }
                };

                /* event source that pulls from google.com */
//    $scope.eventSource = {
//            //url: "http://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/public/basic",
//            url: "",
//            className: 'gcal-event',           // an option!
//            currentTimezone: 'America/Chicago' // an option!
//    };

                /* event source that contains custom events on the scope */
//    $scope.events = [
//      {title: 'All Day Event',start: new Date(y, m, 1), userId:'56a1f8612d777c9f26c3793c'},
//      {title: 'Long Event',start: new Date(y, m, d - 5),end: new Date(y, m, d - 2), userId:'56a5f28f6225c3a439ee78c1'},
//      {id: 999,title: 'Repeating Event',start: new Date(y, m, d - 3, 16, 0),allDay: false},
//      {id: 999,title: 'Repeating Event',start: new Date(y, m, d + 4, 16, 0),allDay: false},
//      {title: 'Birthday Party',start: new Date(y, m, d + 1, 19, 0),end: new Date(y, m, d + 1, 22, 30),allDay: false},
//      {title: 'Click for Google',start: new Date(y, m, 28),end: new Date(y, m, 29),url: 'http://google.com/'}
//    ];

                /* event source that calls a function on every view switch */
//    $scope.eventsF = function (start, end, timezone, callback) {
//      var s = new Date(start).getTime() / 1000;
//      var e = new Date(end).getTime() / 1000;
//      var m = new Date(start).getMonth();
//      var events = [{title: 'Feed Me ' + m,start: s + (50000),end: s + (100000),allDay: false, className: ['customFeed']}];
//      callback(events);
//    };

//    $scope.calEventsExt = {
//       color: '#f00',
//       textColor: 'yellow',
//       events: [
//          {type:'party',title: 'Lunch',start: new Date(y, m, d, 12, 0),end: new Date(y, m, d, 14, 0),allDay: false},
//          {type:'party',title: 'Lunch 2',start: new Date(y, m, d, 12, 0),end: new Date(y, m, d, 14, 0),allDay: false},
//          {type:'party',title: 'Click for Google',start: new Date(y, m, 28),end: new Date(y, m, 29),url: 'http://google.com/'}
//        ]
//    };

                /* event sources array*/
//    $scope.eventSources = [$scope.events, $scope.eventSource, $scope.eventsF];
//    $scope.eventSources2 = [$scope.calEventsExt, $scope.eventsF, $scope.events];
//
                $scope.eventSources = [$scope.events];
//    $scope.eventSources2 = [$scope.events];

            }])