// I used basically the same module and controller because they act the same

// module and controller for Onboard-LGN
angular.module('Onboard-LGN', []);
app.controller('TabsCtrl', function () {

    console.log('TabsCtrl');
    this.tab = 1;

    this.setTab = function (tabId) {
        this.tab = tabId;
    };

    this.isSet = function (tabId) {
        return this.tab === tabId;
    };
    $scope.login = function (data) {
        console.log('asdfas22', data);
    }
});


// module and controller for Onboard-LB
angular.module('Onboard-LB', []);
app.controller('TabsCtrl', ['$scope', function ($scope) {

    console.log('TabsCtrl2');
    this.tab = 1;

    this.setTab = function (tabId) {
        this.tab = tabId;
    };

    this.isSet = function (tabId) {
        return this.tab === tabId;
    };

    $scope.contact = function (data) {
        console.log('asdfas', data);
    }
}]);


// module and controller for Original-Offer
angular.module('Original-Offer', ['toggle-switch', 'LoggerService','ngAnimate', 'ui.bootstrap']);
app.controller('TabsCtrl', function () {

    this.tab = 1;

    this.setTab = function (tabId) {
        this.tab = tabId;
        $scope.common_msg = false;
    };

    this.isSet = function (tabId) {
        return this.tab === tabId;
    };
});

app.controller('TestCtrl', ['$scope', '$http', 'ngAudio', 'logger', '$route', function ($scope, $http,ngAudio,logger,$route) {

    console.log('TestCtrl');
    $scope.tab = 1;

    $scope.setTab = function (tabId) {
        $scope.tab = tabId;
        $scope.common_msg = false;
        $scope.common_err = false;
    };

    $scope.isSet = function (tabId) {
        return $scope.tab === tabId;
    };
    $scope.login = function (data) {
        $http({
            method: 'POST',
            url: '/api_admin/updatePassword',
            data: data,
        }).success(function (data) {
            console.log('Success', data);
        });
    }
    $scope.submitForm = function () {
        $scope.finalData = {
            contactInfo: $scope.contactInfo,
            loginData: $scope.loginData,
            echeck: $scope.echeck,
            credit: $scope.credit,
            recharge: $scope.recharge,
            integration: $scope.integration,
            custom: $scope.custom,
            custom : $scope.custom,
        }
        console.log($scope.switchStatus);
        console.log($scope.finalData);
    }

    $scope.getCity = function (zip) {
        var data = {'zip': zip};
        $http.post('/phoneAgent/getCityFromZip', data).success(function (response) {
            if (response.code == 200) {
                if (response.data) {
                    console.log(response.data.ZipCode);
                    console.log(response.data.ZipCode.length);

                    $scope.contactInfo.city = response.data.City;
                    $scope.contactInfo.state = response.data.State;
                    $scope.contactInfo.country = 'USA';
                }else{
                    $scope.contactInfo.city = '';
                    $scope.contactInfo.state = '';
                }
            }
        });
    };

    $scope.skipWhiteLabel = function(){
        if($scope.whitelabel){
            $scope.whitelabel=false;
            $scope.custom_err=false;
            $scope.common_msg=false;
        }else{
            $scope.whitelabel=true;
            $scope.custom_err=true;
            $scope.common_msg=true;
        }
    };


    $scope.restricted_states = [];
    $scope.addResState = function(states){
        if(states=='' || states==undefined){
            logger.logError('Please Enter State Name.');
        }
        console.log('State----'+$scope.state);
        var flag=0;
        console.log(states.substring(0, states.lastIndexOf(",")));
        /* && states !== undefined && $scope.restricted_states.indexOf(states) == -1*/
        if($scope.state !=undefined && $scope.result2 !=''){
            var newState = states.substring(0, states.lastIndexOf(","));
            console.log('length '+ $scope.restricted_states.length);
            if($scope.restricted_states.length == 0){
                 $scope.restricted_states.push(newState);
            }else{
                $scope.restricted_states.forEach(function(item){
                    if(item==newState){
                        flag=1;
                    }
                });
                if(flag==0){
                    $scope.restricted_states.push(newState);
                }
            }


            //$scope.restricted_states.push(states.substring(0, states.lastIndexOf(",")));
            //used to remove the state name
            console.log('--------'+$scope.result2);
            $scope.result2 = '';
            $scope.stateTable = true;
            $('#Autocomplete').val('');
        }
        console.log($scope.restricted_states);
    }
    $scope.delete = function(index)
    {
        $scope.restricted_states.splice(index,1);
        if(!$scope.restricted_states.length){
            $scope.stateTable = false;
        }
    }

    $scope.selected = undefined;
    $scope.states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Dakota', 'North Carolina', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];
  // Any function returning a promise object can be used to load values asynchronously
    $scope.getLocation = function(val) {
    return $http.get('//maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: val,
        sensor: false
      }
    }).then(function(response){
      return response.data.results.map(function(item){
        return item.formatted_address;
      });
    });
  }

  $scope.backToBoard = function () {
        $route.reload();
    }


    $scope.uploadGreeting = function () {

        console.log($scope.audio_file);
        var ext = $('#greeting_audio').val().split('.').pop().toLowerCase();
        console.log(ext);
        if ($.inArray(ext, ['mp3', 'mpeg', '.m3u', '.wav']) == -1) {
            alert('invalid file upload either of the format .mp3,.mpeg');
            return false;
        } else {

        }


    }

    $scope.onAudioFileSelect = function ($files) {
        console.log($files);
        $scope.audio_file = $files[0];
        $scope.audiofile_clicked = true;
    }

    $scope.deleteVoiceMail = function (voiceId) {

        //   if (confirm("Are you sure,You want to delete this entry?")) {
        data = {'voiceId': voiceId};
        $http.post('/phoneAgent/delete_voiceMail', data)
                .success(function (response, status, headers, config) {
                    if (response.code == 200) {
                        $scope.success_delete = response.message;
                        logger.logSuccess(response.message);
                        console.log("Success : " + response.message);
                        $scope.list_voiceMail();
                    } else if (response.code == 404) {
                        $scope.error_delete = response.message;
                        logger.logError(response.message);
                        console.log('Error :' + response.message);
                    }
                })
                .error(function (response, status) {
                    console.log("Error Occured!");
                })
        //    }
    }
        $scope.list_voiceMail = function () {
        $http({
            method: 'POST',
            url: '/phoneAgent/voice_callHistory',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
        }).success(function (data) {
            if (data.status == 200) {
                $scope.voice_callHistory = data.resp;
                angular.forEach(data.resp, function (value, key) {
                    $scope.voice_callHistory[key] = value;
                    $scope.voice_callHistory[key].audio = ngAudio.load(value.Recording.RecordUrl);
                });
            } else {
                $location.path('404');
            }
        });
    }
    $scope.list_voiceMail();

}]);



function wysiwygeditor($scope) {
    $scope.orightml = 'Customize your Footer in Emails and in the App HERE';
    $scope.htmlcontent = $scope.orightml;
    $scope.disabled = false;
};
