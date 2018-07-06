// Shivansh and Somesh - I was not able to get JS working, I'm sure I overlooked
// something, still being new to angular.js

// declaring module for onboard-LGN and onboard-LB

var app = angular.module('onboard-LGN', []);
console.log("hello LGN");
app.controller('LGN-TabController', function () {
	
     this.tab = 1;

     this.setTab = function (tabId) {
          this.tab = tabId;
     };

     this.isSet = function (tabId) {
          return this.tab === tabId;
      };
  });

// I used basically th same module and controller because they act the same

var app = angular.module('onboard-LB', []);
console.log("hello LB");
app.controller('LB-TabController', function () {
	
     this.tab = 1;

     this.setTab = function (tabId) {
          this.tab = tabId;
     };

     this.isSet = function (tabId) {
          return this.tab === tabId;
      };
  });