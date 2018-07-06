angular.module('CalendarService', [])

        /**************************************  User Management Services Section   **************************************/

        .factory('Calendar', ['$resource', function ($resource) {
            return {
                createEvent: function () {
                    return $resource('/api_calendar/createEvent'); // //send request to create appointment
                },
                getCreatedEvents: function () {
                    return $resource('/api_calendar/getCreatedEvents'); // //send the request to get the created appointments
                },
                getEventScript: function () {
                    return $resource('/api_calendar/getEventScript/:eventId'); // //send the request to get the appointment added script
                },
                updateAppointmentStatus: function () {
                    return $resource('/api_calendar/updateAppointmentStatus'); // //send the request to update the appointment
                },
                getCalendarScript: function () {
                    return $resource('/api_calendar/getCalendarScript'); // //send the request to get the calendar scripts
                },
            };
        }]);

/**************************************  User Management Services Section   **************************************/
