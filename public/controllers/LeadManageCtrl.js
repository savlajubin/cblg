/*@function : LeadManageCtrl
 * Creator   : Smartdata(B2)
 * @purpose  : To manage lead
 */
app.controller('LeadManageCtrl', ['$scope', '$rootScope', '$modal', '$http', '$location', '$routeParams', 'LeadManage', 'Module', 'CONSTANTS', function ($scope, $rootScope, $modal, $http, $location, $routeParams, LeadManage, Module, CONSTANTS) {
        //initColShowHide($scope, $rootScope);


        $scope.goToLink = function (link) {
            $location.path(link);
        }

        $scope.call = function (call_no) {
            console.log("dial to number.." + call_no);
            call_login(call_no);
        }

        // dialer
        $scope.dialer = function (dial_value) {
            $scope.dial_number = ($scope.dial_number) ? $scope.dial_number + "" + dial_value : dial_value;
        }

        $scope.reset = function (tel_no) {
            if (tel_no) {
                $scope.dial_number = tel_no;
            } else {
                $scope.dial_number = '';
            }
            ;
        }
        console.log($rootScope.authenticatedUser);
        //get city details from entered zipcode
        $scope.getCity = function (zip) {
            var data = {'zip': zip};
            $http.post('/phoneAgent/getCityFromZip', data).success(function (response) {
                if (response.code == CONSTANTS.CODES.OK) {
                    console.log(response.data.ZipCode);
                    console.log(response.data.ZipCode.length);

                    $scope.crm.city = response.data.City;
                    $scope.crm.state = response.data.State;
                }
            });
        };

        //save caller campign details
        $scope.saveCallerDetails = function (formData) {
            console.log(formData)
            formData.callUUID = $('#callUUID').val();
            formData.caller_id = $('#caller_id').val();
            if (!$routeParams.leadid) {
                var notes = [];
                if (formData.notes)
                    notes.push(formData.notes);
                formData.notes = notes;
            }
            LeadManage.saveCallerDetails().save(formData, function (data) {
                $location.path('/pa/list-caller-leads');
            })
        }
        $scope.showMap = false;

        //Gets leads list
        $scope.listCallerLeads = function () {
            LeadManage.listCallerLeads().get(function (response) {
                Module.pagination(response.data);
            })
        }

        /* Display caller details in popup #02032016# */
        $scope.viewLeadDetails = function (lead_id) {
            console.log('leadID', lead_id);
            LeadManage.getCallerLeadByID().save({id: lead_id}, function (response) {

                $scope.isWebLead = response.data.isWebLead;
                if (response.data.isWebLead) {
                    var webLeadInfo = response.data.webLeadDetails.webLeadInfo;
                    var webLeadData = {};

                    angular.forEach(webLeadInfo, function (lead, key) {
                        if (webLeadData[key.split('_pqry_')[0]] && lead) {
                            //webLeadData[key.split('_pqry_')[0]] = lead + ',' + webLeadData[key.split('_pqry_')[0]];
                            webLeadData[key.split('_pqry_')[0]] = webLeadData[key.split('_pqry_')[0]] + ', ' + lead;
                        } else if (lead) {
                            webLeadData[key.split('_pqry_')[0]] = lead;
                        }
                    });
                    $scope.callerDetails = webLeadData;
                } else {
                    $scope.callerDetails = response.data.scriptData;
                }
                //$scope.leadDetail = response.data;
            })

            /* Show Caller Details */
            var callerDetailsForm = $modal({scope: $scope, templateUrl: "/views/pa/callerDetails.html", show: false});
            $scope.callerDetailsForm = callerDetailsForm;
            callerDetailsForm.$promise.then(callerDetailsForm.show);
        }

        //Get lead details by ID
        $scope.getCallerLeadByID = function () {
            console.log(', [...]')
            var leadID = $routeParams.leadid;
            LeadManage.getCallerLeadByID().save({id: leadID}, function (response) {
                $scope.leadDetail = response.data;
                $scope.crm = response.data;
            })
        }

        //Get deleteLead by ID
        $scope.deleteLeadByID = function (id) {

            swal({
                title: CONSTANTS.SWAL.deletetitle,
                text: CONSTANTS.SWAL.deletetext,
                type: CONSTANTS.SWAL.type,
                showCancelButton: CONSTANTS.SWAL.showCancelButton,
                confirmButtonColor: CONSTANTS.SWAL.confirmButtonColor,
                confirmButtonText: CONSTANTS.SWAL.deleteconfirmButtonText,
                closeOnConfirm: CONSTANTS.SWAL.closeOnConfirm},
            function () {
                LeadManage.deleteLeadByID().save({id: id}, function (response) {
                    console.log(response.data)
                    Module.pagination(response.data);
                })
            });
        }

        //Remove note
        $scope.removeNote = function (note) {
            var index = $scope.leadDetail.notes.indexOf(note)
            $scope.leadDetail.notes.splice(index, 1);
        }
        //Remove note
        $scope.pushNote = function (note) {
            console.log(note)
            $scope.newNote = '';
            $scope.addNote = false;
            $scope.leadDetail.notes.push(note);
        }

        $scope.getDataByDate = function (dateData) {
            LeadManage.getCampaignLeadByDate().save(dateData, function (response) {
                console.log(response.data)
                Module.pagination(response.data);
            })
        }
    }]);