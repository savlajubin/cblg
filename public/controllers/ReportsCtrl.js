var app = angular.module('ReportModule', [])
/**************************************   User Module Section   **************************************/
/*@function : ReportsCtrl
 * Creator   : SmartData
 * @created  : 28 Sep 2015
 * @purpose  : Reports management
 */
app.controller('LgReportsCtrl', ['$scope', 'Module', 'Report', '$filter', 'CONSTANTS', function ($scope, Module, Report, $filter, CONSTANTS) {
    //LG Doughnut graph for Categories
    $scope.DoughnutCtrl = function () {
        $scope.color1 = ['#3D8FFF', '#CB637A']
        $scope.options = {
            animation: false
        };
    };
    //LG Line graph for Calls
    $scope.LineCtrl = function () {
        $scope.color3 = [{
                fillColor: "rgba(61,143,255,0.6)",
                strokeColor: "rgba(61,143,255,1)",
                pointColor: "rgba(61,143,255,1)"
            }]
        $scope.options_line = {
            animation: false,
            tooltipTemplate: "<%if (value){%><%=value%> Calls<%}else {%><%=0%> Calls<%}%>",
        }
    };
    //LG Bar graph for Revenue
    $scope.BarCtrl = function () {
        $scope.color2 = [{
                fillColor: "rgba(61,143,255,.9)",
                strokeColor: "rgba(61,143,255,1)",
                pointColor: "rgba(61,143,255,1)"
            }]
        $scope.options_rev = {
            animation: false,
            tooltipTemplate: "<%if (value){%>$<%=value%><%}else {%>$<%=0%><%}%>",
            scaleLabel: "$<%=value%>",
        }
    };


    $scope.getFilteredHistory = function () {
        var dFrom = new Date($scope.from);
        var dTo = new Date($scope.to);
        var dateData = {FromDate: dFrom, ToDate: dTo};
        $scope.getDataByDate(dateData, 0);
    };

    $scope.categoryFilter = function (cat) {
        var dFrom = new Date($scope.from);
        var dTo = new Date($scope.to);
        var catName = cat;
        var dateData = {categoryName: catName, FromDate: dFrom, ToDate: dTo};
        $scope.getDataByDate(dateData, 0, true);
    };

    $scope.button = {"radio": 0};
    //get call list as per date
    $scope.getDataByDate = function (dateData, val, isCatAll) {
        Report.callHistoryByDate().save(dateData, function (response) {
            //getting commission, total calls, billable calls and avarage Duration Data
            var totalCallCount = response.callListData.length;
            var bcount = 0;
            var totalDuration = 0;
            var avgDuration = 0;

            if (!isCatAll) {
                $scope.button = {"radio": 0};
            }

            // To get Values for graph Start Varriable declaration
            $scope.data_cat = [];
            $scope.labels_cat = [];
            $scope.data_rev = [];
            $scope.labels_rev = [];
            $scope.data_calls = [];
            $scope.labels_calls = [];

            var callDataByDate = [];
            var formatedDateNew = [];

            // Start to find the date range from filters for create x-axis values (dynamic)
            var start = dateData.FromDate,
                    end = dateData.ToDate,
                    currentDate = new Date(start);

            // Calculating Date range on condition basis START
            var sweek = [];
            var timeDiff = Math.abs(end.getTime() - start.getTime());
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
            var diffMonths = Math.ceil(timeDiff / (30 * 1000 * 3600 * 24));
            while (currentDate <= end) {
                currDate1 = new Date(currentDate);
                var d1 = $filter('date')(currDate1, 'MM/d/y');
                sweek = 'Week ' + moment(currDate1).week();
                smonth = $filter('date')(currDate1, 'MMM');
                formatedDateNew.push({"date": d1, "week": sweek, "month": smonth, 'count': 0, 'comm': 0});
                currentDate.setDate(currentDate.getDate() + 1);
            }
            // Calculating Date range on condition basis END

            // End  find the date range from filters for create x-axis values (dynamic)
            //Graph linechart dynamic values
            var callDataCount = _.groupBy(response.callListData, function (callCount) {
                return $filter('date')(callCount.created, 'MM/d/y');
            });
            Object.keys(callDataCount).forEach(function (key)
            {
                formatedDateNew.forEach(function (data) {
                    if (data.date == key) {
                        if (key && key != 'undefined') {
                            data.count = callDataCount[key].length;
                            var totalComm = 0;
                            callDataCount[key].forEach(function (commdata) {
                                if (commdata.is_billable && commdata.is_billable == true && commdata.campaignData && commdata.campaignData.offer_id && commdata.campaignData.offer_id.pay_per_call) {
                                    totalComm = parseInt(totalComm) + parseInt(commdata.campaignData.offer_id.pay_per_call.lgamount);
                                }
                            });
                            data.comm = totalComm;
                        }
                    }
                });
            });
            $scope.aaa = [];
            $scope.revD = [];

            if (diffDays <= 30) {
                formatedDateNew.forEach(function (data) {
                    var us_date = $filter('date')(data.date, 'MM/d/y');
                    $scope.labels_calls.push(us_date);
                    $scope.labels_rev.push(us_date);
                    $scope.aaa.push(data.count);
                    $scope.revD.push(data.comm);
                });
            } else if (diffDays > 30 && diffMonths <= 6) {
                var weekgroups = _(formatedDateNew).groupBy('week');
                var weekOut = _(weekgroups).map(function (g, key) {
                    return {week: key,
                        count: _(g).reduce(function (m, x) {
                            return m + x.count;
                        }, 0),
                        comm: _(g).reduce(function (m, x) {
                            return m + x.comm;
                        }, 0)
                    };
                });
                weekOut.forEach(function (weeksdata) {
                    $scope.labels_calls.push(weeksdata.week);
                    $scope.labels_rev.push(weeksdata.week);
                    $scope.aaa.push(weeksdata.count);
                    $scope.revD.push(weeksdata.comm);
                });
            } else {
                var monthgroups = _(formatedDateNew).groupBy('month');
                var monthOut = _(monthgroups).map(function (g, key) {
                    return {month: key,
                        count: _(g).reduce(function (m, x) {
                            return m + x.count;
                        }, 0),
                        comm: _(g).reduce(function (m, x) {
                            return m + x.comm;
                        }, 0)
                    };
                });
                monthOut.forEach(function (monthsdata) {
                    $scope.labels_calls.push(monthsdata.month);
                    $scope.labels_rev.push(monthsdata.month);
                    $scope.aaa.push(monthsdata.count);
                    $scope.revD.push(monthsdata.comm);
                });
            }

            $scope.data_calls = [$scope.aaa];
            $scope.data_rev = [$scope.revD];
            // End of code for Calls Line chart

            // Start of category graph code
            angular.forEach(response.CategoryGraphData, function (value, key) {
                $scope.labels_cat.push(value.Category);
                $scope.data_cat.push(value.count);
            });
            // End of category graph code
            var totalCommission = 0;
            // Start To get Values for count blocks
            if (totalCallCount != 0) {
                angular.forEach(response.callListData, function (value, key) {
                    totalDuration = parseInt(totalDuration) + parseInt(value.Duration);
                    //calculating commission and bcount values for LG user
                    if (value.is_billable && value.is_billable == true && value.campaignData && value.campaignData.offer_id && value.campaignData.offer_id.pay_per_call) {
                        totalCommission = parseInt(totalCommission) + parseInt(value.campaignData.offer_id.pay_per_call.lgamount);
                        bcount = bcount + 1;
                    } else {
                        //Else statement
                    }
                });
                avgDuration = Math.round(totalDuration / totalCallCount);
            }

            $scope.totalCallCount = {totalCommission: totalCommission, resCount: totalCallCount, bcount: bcount, avgDuration: avgDuration};
            //$scope.paginationData(response.callListData,val);
            Module.pagination(response.callListData);
            // End To get Values for count blocks
        });
    }

    $scope.getCallHistoryCategories = function (val) {
        Report.getCallHistoryCategories().save({}, function (response) {
            $scope.newCategories = [];
            angular.forEach(response.resp, function (value, key) {
                $scope.newCategories.push({name: value.Category});
            });
        });
    }

    $scope.getLGTop5Categories = function () {
        Report.getLGTop5Categories().get(function (response) {
            if (response.code == CONSTANTS.CODES.OK) {
                $scope.cats = response.data;
            }
        });
    }
}]);

//Controller to get reports data for LGN user
app.controller('LgnReportsCtrl', ['$scope', 'User', '$rootScope', 'Module', 'Report', '$filter', function ($scope, User, $rootScope, Module, Report, $filter) {
    //LGN Doughnut graph for Catgories
    $scope.DoughnutCtrl = function () {
        $scope.color1 = ['#3D8FFF', '#CB637A']
        $scope.options = {
            animation: false
        };
    };
    //LGN Line graph for Calls
    $scope.LineCtrl = function () {
        $scope.color3 = [{
                fillColor: "rgba(61,143,255,0.6)",
                strokeColor: "rgba(61,143,255,1)",
                pointColor: "rgba(61,143,255,1)"
            }]
        $scope.options_line = {
            animation: false,
            tooltipTemplate: "<%if (value){%><%=value%> Calls<%}else {%><%=0%> Calls<%}%>",
        }
        $scope.onClick = function (points, evt) {
            console.log(points, evt);
        };
    };
    //LGN Bar graph for Revenue
    $scope.BarCtrl = function () {
        $scope.color2 = [{
                fillColor: "rgba(61,143,255,.9)",
                strokeColor: "rgba(61,143,255,1)",
                pointColor: "rgba(61,143,255,1)"
            }]
        $scope.options_rev = {
            animation: false,
            tooltipTemplate: "<%if (value){%>$<%=value%><%}else {%>$<%=0%><%}%>",
            scaleLabel: "$<%=value%>",
        }
    };
    //LGN Pie graph for Lead Seller's Total Calls expressed as a percentage && all ADVCC and LB's Total Calls expressed as a percentage
    $scope.PieCtrl = function () {
        $scope.options_pie = {
            animation: false,
            tooltipTemplate: "<%=label%>: <%=value%>(<%= Math.round(circumference / 6.283 * 100) %>)%"
        }
    };
    $scope.Pie2Ctrl = function () {
        $scope.options_pie2 = {
            animation: false,
            tooltipTemplate: "<%=label%>: <%=value%>(<%= Math.round(circumference / 6.283 * 100) %>)%"
        }
    };

    $scope.getFilteredHistory = function () {
        var dFrom = new Date($scope.from);
        var dTo = new Date($scope.to);
        var dateData = {FromDate: dFrom, ToDate: dTo};
        $scope.getDataByDate(dateData, 0);
    };

    $scope.categoryFilter = function (cat) {
        var dFrom = new Date($scope.from);
        var dTo = new Date($scope.to);
        var catName = cat;
        var dateData = {categoryName: catName, FromDate: dFrom, ToDate: dTo};
        $scope.getDataByDate(dateData, 0, true);
    };

    $scope.button = {"radio": 0};
    //get call list as per date
    $scope.getDataByDate = function (dateData, val, isCatAll) {
        Report.callHistoryByDate().save(dateData, function (response) {
            //getting commission, total calls, billable calls and avarage Duration Data
            var totalCallCount = response.callListData.length;
            var bcount = 0;
            var totalDuration = 0;
            var avgDuration = 0;

            if (!isCatAll) {
                $scope.button = {"radio": 0};
            }

            // To get Values for graph Start Varriable declaration
            $scope.data_cat = [];
            $scope.labels_cat = [];
            $scope.data_rev = [];
            $scope.labels_rev = [];
            $scope.data_calls = [];
            $scope.labels_calls = [];
            $scope.data_pie = [];
            $scope.labels_pie = [];
            $scope.data_pie2 = [];
            $scope.labels_pie2 = [];

            var callDataByDate = [];
            var formatedDateNew = [];

            // Start to find the date range from filters for create x-axis values (dynamic)
            var start = dateData.FromDate,
                    end = dateData.ToDate,
                    currentDate = new Date(start);
            // Calculating Date range on condition basis START
            var sweek = [];
            var timeDiff = Math.abs(end.getTime() - start.getTime());
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
            var diffMonths = Math.ceil(timeDiff / (30 * 1000 * 3600 * 24));
            while (currentDate <= end) {
                currDate1 = new Date(currentDate);
                var d1 = $filter('date')(currDate1, 'MM/d/y');
                sweek = 'Week ' + moment(currDate1).week();
                smonth = $filter('date')(currDate1, 'MMM');
                formatedDateNew.push({"date": d1, "week": sweek, "month": smonth, 'count': 0, 'comm': 0});
                currentDate.setDate(currentDate.getDate() + 1);
            }
            // Calculating Date range on condition basis END

            // End  find the date range from filters for create x-axis values (dynamic)

            // Getting data to show all Lead Seller's Total Calls expressed as a percentage for first pie chart START
            var loggedInUserId = $rootScope.authenticatedUser._id // to show records for Logged in LGN user only
            var lgUserDetalisArr = [];
            var lbadvccUserDetalisArr = [];
            var lgCount = _.groupBy(response.callListData, function (LgCount) {
                if (LgCount.campaignData.parent_lgn == loggedInUserId) { // Getting data of LG user whise parent is Loggedin user
                    lgUserDetalisArr.push(LgCount.campaignData.created_by)
                    lbadvccUserDetalisArr.push(LgCount.campaignData.offer_id.user_id)
                    //return lgUserDetalisArr ;
                } else {
                    return false;
                }
            });

            var LgUser_details = getUserDetail($scope, User, lgUserDetalisArr, function (LgUser_details) {
                if (LgUser_details) {
                    LgUser_details.forEach(function (LgUser_details) {
                        var name = LgUser_details.first_name + ' ' + LgUser_details.last_name;
                        var count = LgUser_details.token;
                        $scope.labels_pie.push(name);
                        $scope.data_pie.push(count);
                    });
                }
            });

            var LbAdvccUser_details = getUserDetail($scope, User, lbadvccUserDetalisArr, function (LbAdvccUser_details) {
                if (LbAdvccUser_details) {
                    LbAdvccUser_details.forEach(function (LbAdvccUser_details) {
                        var name = LbAdvccUser_details.first_name + ' ' + LbAdvccUser_details.last_name;
                        var count = LbAdvccUser_details.token;
                        $scope.labels_pie2.push(name);
                        $scope.data_pie2.push(count);
                    });
                }
            });
            // Getting data to show all Lead Seller's Total Calls expressed as a percentage for first pie chart END


            //Graph linechart dynamic values
            var callDataCount = _.groupBy(response.callListData, function (callCount) {
                return $filter('date')(callCount.created, 'MM/d/y');
            });

            Object.keys(callDataCount).forEach(function (key)
            {
                formatedDateNew.forEach(function (data) {
                    if (data.date == key) {
                        if (key && key != 'undefined') {
                            data.count = callDataCount[key].length;
                            var totalComm = 0;
                            callDataCount[key].forEach(function (commdata) {
                                if (commdata.is_billable && commdata.is_billable == true && commdata.campaignData && commdata.campaignData.offer_id && commdata.campaignData.offer_id.pay_per_call) {
                                    totalComm = parseInt(totalComm) + parseInt(commdata.campaignData.offer_id.pay_per_call.lgnamount);
                                }
                            });
                            data.comm = totalComm;
                        }
                    }
                });
            });
            $scope.aaa = [];
            $scope.revD = [];

            if (diffDays <= 30) {
                formatedDateNew.forEach(function (data) {
                    var us_date = $filter('date')(data.date, 'MM/d/y');
                    $scope.labels_calls.push(us_date);
                    $scope.labels_rev.push(us_date);
                    $scope.aaa.push(data.count);
                    $scope.revD.push(data.comm);
                });
            } else if (diffDays > 30 && diffMonths <= 6) {
                var weekgroups = _(formatedDateNew).groupBy('week');
                var weekOut = _(weekgroups).map(function (g, key) {
                    return {week: key,
                        count: _(g).reduce(function (m, x) {
                            return m + x.count;
                        }, 0),
                        comm: _(g).reduce(function (m, x) {
                            return m + x.comm;
                        }, 0)
                    };
                });
                weekOut.forEach(function (weeksdata) {
                    $scope.labels_calls.push(weeksdata.week);
                    $scope.labels_rev.push(weeksdata.week);
                    $scope.aaa.push(weeksdata.count);
                    $scope.revD.push(weeksdata.comm);
                });
            } else {
                var monthgroups = _(formatedDateNew).groupBy('month');
                var monthOut = _(monthgroups).map(function (g, key) {
                    return {month: key,
                        count: _(g).reduce(function (m, x) {
                            return m + x.count;
                        }, 0),
                        comm: _(g).reduce(function (m, x) {
                            return m + x.comm;
                        }, 0)
                    };
                });
                monthOut.forEach(function (monthsdata) {
                    $scope.labels_calls.push(monthsdata.month);
                    $scope.labels_rev.push(monthsdata.month);
                    $scope.aaa.push(monthsdata.count);
                    $scope.revD.push(monthsdata.comm);
                });
            }

            $scope.data_calls = [$scope.aaa];
            $scope.data_rev = [$scope.revD];

            // End of code for Calls Line chart
            // Start of category graph code
            angular.forEach(response.CategoryGraphData, function (value, key) {
                $scope.labels_cat.push(value.Category);
                $scope.data_cat.push(value.count);
            });
            // End of category graph code

            var totalCommission = 0;
            // Start To get Values for count blocks
            if (totalCallCount != 0) {
                angular.forEach(response.callListData, function (value, key) {
                    totalDuration = parseInt(totalDuration) + parseInt(value.Duration);
                    //calculating commission and bcount values for LG user
                    if (value.is_billable && value.is_billable == true && value.campaignData && value.campaignData.offer_id && value.campaignData.offer_id.pay_per_call && value.campaignData.offer_id.pay_per_call.lgnamount) {
                        totalCommission = parseInt(totalCommission) + parseInt(value.campaignData.offer_id.pay_per_call.lgnamount);
                        bcount = bcount + 1;
                    } else {
                        //Else statement
                    }
                });
                avgDuration = Math.round(totalDuration / totalCallCount);
            }
            $scope.totalCallCount = {totalCommission: totalCommission, resCount: totalCallCount, bcount: bcount, avgDuration: avgDuration};
            //$scope.paginationData(response.callListData,val);
            Module.pagination(response.callListData);
            // End To get Values for count blocks
        });
    }

    $scope.getCallHistoryCategories = function (val) {
        Report.getCallHistoryCategories().save({}, function (response) {
            $scope.newCategories = [];
            angular.forEach(response.resp, function (value, key) {
                $scope.newCategories.push({name: value.Category});
            });
        });
    }
}]);

//Controller to get reports data for LB user
app.controller('LbReportsCtrl', ['$scope', 'Module', 'Report', '$filter', function ($scope, Module, Report, $filter) {
    //LGN Doughnut graph for Catgories
    $scope.DoughnutCtrl = function () {
        $scope.color1 = ['#3D8FFF', '#CB637A']
        $scope.options = {
            animation: false
        };
    };
    //LGN Line graph for Calls
    $scope.LineCtrl = function () {
        $scope.color3 = [{
                fillColor: "rgba(61,143,255,0.6)",
                strokeColor: "rgba(61,143,255,1)",
                pointColor: "rgba(61,143,255,1)"
            }]
        $scope.options_line = {
            animation: false,
            tooltipTemplate: "<%if (value){%><%=value%> Calls<%}else {%><%=0%> Calls<%}%>",
        }
        $scope.onClick = function (points, evt) {
            console.log(points, evt);
        };
    };
    //LGN Bar graph for Revenue
    $scope.BarCtrl = function () {
        $scope.color2 = [{
                fillColor: "rgba(61,143,255,.9)",
                strokeColor: "rgba(61,143,255,1)",
                pointColor: "rgba(61,143,255,1)"
            }]
        $scope.options_rev = {
            animation: false,
            tooltipTemplate: "<%if (value){%>$<%=value%><%}else {%>$<%=0%><%}%>",
            scaleLabel: "$<%=value%>",
        }
    };

    $scope.getFilteredHistory = function () {
        var dFrom = new Date($scope.from);
        var dTo = new Date($scope.to);
        var dateData = {FromDate: dFrom, ToDate: dTo};
        $scope.getDataByDate(dateData, 0);
    };

    $scope.categoryFilter = function (cat) {
        var dFrom = new Date($scope.from);
        var dTo = new Date($scope.to);
        var catName = cat;
        var dateData = {categoryName: catName, FromDate: dFrom, ToDate: dTo};
        $scope.getDataByDate(dateData, 0, true);
    };

    $scope.button = {"radio": 0};
    //get call list as per date
    $scope.getDataByDate = function (dateData, val, isCatAll) {
        Report.callHistoryByDate().save(dateData, function (response) {
            //getting commission, total calls, billable calls and avarage Duration Data
            var totalCallCount = response.callListData.length;
            var bcount = 0;
            var totalDuration = 0;
            var avgDuration = 0;

            if (!isCatAll) {
                $scope.button = {"radio": 0};
            }

            // To get Values for graph Start Varriable declaration
            $scope.data_cat = [];
            $scope.labels_cat = [];
            $scope.data_rev = [];
            $scope.labels_rev = [];
            $scope.data_calls = [];
            $scope.labels_calls = [];

            var callDataByDate = [];
            var formatedDateNew = [];

            // Start to find the date range from filters for create x-axis values (dynamic)
            var start = dateData.FromDate,
                    end = dateData.ToDate,
                    currentDate = new Date(start);

            // Calculating Date range on condition basis START
            var sweek = [];
            var timeDiff = Math.abs(end.getTime() - start.getTime());
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
            var diffMonths = Math.ceil(timeDiff / (30 * 1000 * 3600 * 24));
            while (currentDate <= end) {
                currDate1 = new Date(currentDate);
                var d1 = $filter('date')(currDate1, 'MM/d/y');
                sweek = 'Week ' + moment(currDate1).week();
                smonth = $filter('date')(currDate1, 'MMM');
                formatedDateNew.push({"date": d1, "week": sweek, "month": smonth, 'count': 0, 'comm': 0});
                currentDate.setDate(currentDate.getDate() + 1);
            }
            // Calculating Date range on condition basis END
            // End  find the date range from filters for create x-axis values (dynamic)

            //Graph linechart dynamic values
            var callDataCount = _.groupBy(response.callListData, function (callCount) {
                return $filter('date')(callCount.created, 'MM/d/y');
            });

            Object.keys(callDataCount).forEach(function (key)
            {
                formatedDateNew.forEach(function (data) {
                    if (data.date == key) {
                        if (key && key != 'undefined') {
                            data.count = callDataCount[key].length;
                            var totalComm = 0;
                            callDataCount[key].forEach(function (commdata) {
                                if (commdata.is_billable && commdata.is_billable == true && commdata.campaignData && commdata.campaignData.offer_id && commdata.campaignData.offer_id.pay_per_call) {
                                    totalComm = parseInt(totalComm) + parseInt(commdata.campaignData.offer_id.pay_per_call.lbamount);
                                }
                            });
                            data.comm = totalComm;
                        }
                    }
                });
            });
            $scope.aaa = [];
            $scope.revD = [];

            if (diffDays <= 30) {
                formatedDateNew.forEach(function (data) {
                    var us_date = $filter('date')(data.date, 'MM/d/y');
                    $scope.labels_calls.push(us_date);
                    $scope.labels_rev.push(us_date);
                    $scope.aaa.push(data.count);
                    $scope.revD.push(data.comm);
                });
            } else if (diffDays > 30 && diffMonths <= 6) {
                var weekgroups = _(formatedDateNew).groupBy('week');
                var weekOut = _(weekgroups).map(function (g, key) {
                    return {week: key,
                        count: _(g).reduce(function (m, x) {
                            return m + x.count;
                        }, 0),
                        comm: _(g).reduce(function (m, x) {
                            return m + x.comm;
                        }, 0)
                    };
                });
                weekOut.forEach(function (weeksdata) {
                    $scope.labels_calls.push(weeksdata.week);
                    $scope.labels_rev.push(weeksdata.week);
                    $scope.aaa.push(weeksdata.count);
                    $scope.revD.push(weeksdata.comm);
                });
            } else {
                var monthgroups = _(formatedDateNew).groupBy('month');
                var monthOut = _(monthgroups).map(function (g, key) {
                    return {month: key,
                        count: _(g).reduce(function (m, x) {
                            return m + x.count;
                        }, 0),
                        comm: _(g).reduce(function (m, x) {
                            return m + x.comm;
                        }, 0)
                    };
                });
                monthOut.forEach(function (monthsdata) {
                    $scope.labels_calls.push(monthsdata.month);
                    $scope.labels_rev.push(monthsdata.month);
                    $scope.aaa.push(monthsdata.count);
                    $scope.revD.push(monthsdata.comm);
                });
            }

            $scope.data_calls = [$scope.aaa];
            $scope.data_rev = [$scope.revD];

            // End of code for Calls Line chart
            // Start of category graph code
            angular.forEach(response.CategoryGraphData, function (value, key) {
                $scope.labels_cat.push(value.Category);
                $scope.data_cat.push(value.count);
            });
            // End of category graph code

            var totalCommission = 0;
            // Start To get Values for count blocks
            if (totalCallCount != 0) {
                angular.forEach(response.callListData, function (value, key) {
                    totalDuration = parseInt(totalDuration) + parseInt(value.Duration);
                    //calculating commission and bcount values for LG user
                    if (value.is_billable && value.is_billable == true && value.campaignData && value.campaignData.offer_id && value.campaignData.offer_id) {
                        totalCommission = parseInt(totalCommission) + parseInt(value.campaignData.offer_id.pay_per_call.lbamount);
                        bcount = bcount + 1;
                    } else {
                        //Else statement
                    }
                });
                avgDuration = Math.round(totalDuration / totalCallCount);
            }
            $scope.totalCallCount = {totalCommission: totalCommission, resCount: totalCallCount, bcount: bcount, avgDuration: avgDuration};
            //$scope.paginationData(response.callListData,val);
            Module.pagination(response.callListData);
            // End To get Values for count blocks
        });
    }

    $scope.getCallHistoryCategories = function (val) {
        Report.getCallHistoryCategories().save({}, function (response) {
            $scope.newCategories = [];
            angular.forEach(response.resp, function (value, key) {
                $scope.newCategories.push({name: value.Category});
            });
        });
    }
}]);//Controller to get reports data for ADVCC user

app.controller('ADVCCReportsCtrl', ['$scope', 'Module', 'Report', '$filter', function ($scope, Module, Report, $filter) {
    //LGN Doughnut graph for Catgories
    $scope.DoughnutCtrl = function () {
        $scope.color1 = ['#3D8FFF', '#CB637A']
        $scope.options = {
            animation: false
        };
    };
    //LGN Line graph for Calls
    $scope.LineCtrl = function () {
        $scope.color3 = [{
                fillColor: "rgba(61,143,255,0.6)",
                strokeColor: "rgba(61,143,255,1)",
                pointColor: "rgba(61,143,255,1)"
            }]
        $scope.options_line = {
            animation: false,
            tooltipTemplate: "<%if (value){%><%=value%> Calls<%}else {%><%=0%> Calls<%}%>",
        }
        $scope.onClick = function (points, evt) {
            console.log(points, evt);
        };
    };
    //LGN Bar graph for Revenue
    $scope.BarCtrl = function () {
        $scope.color2 = [{
                fillColor: "rgba(61,143,255,.9)",
                strokeColor: "rgba(61,143,255,1)",
                pointColor: "rgba(61,143,255,1)"
            }]
        $scope.options_rev = {
            animation: false,
            tooltipTemplate: "<%if (value){%>$<%=value%><%}else {%>$<%=0%><%}%>",
            scaleLabel: "$<%=value%>",
        }
    };

    $scope.getFilteredHistory = function () {
        var dFrom = new Date($scope.from);
        var dTo = new Date($scope.to);
        var dateData = {FromDate: dFrom, ToDate: dTo};
        $scope.getDataByDate(dateData, 0);
    };

    $scope.categoryFilter = function (cat) {
        var dFrom = new Date($scope.from);
        var dTo = new Date($scope.to);
        var catName = cat;
        var dateData = {categoryName: catName, FromDate: dFrom, ToDate: dTo};
        $scope.getDataByDate(dateData, 0, true);
    };

    $scope.button = {"radio": 0};
    //get call list as per date
    $scope.getDataByDate = function (dateData, val, isCatAll) {
        Report.callHistoryByDate().save(dateData, function (response) {
            //getting commission, total calls, billable calls and avarage Duration Data
            var totalCallCount = response.callListData.length;
            var bcount = 0;
            var totalDuration = 0;
            var avgDuration = 0;

            if (!isCatAll) {
                $scope.button = {"radio": 0};
            }

            // To get Values for graph Start Varriable declaration
            $scope.data_cat = [];
            $scope.labels_cat = [];
            $scope.data_rev = [];
            $scope.labels_rev = [];
            $scope.data_calls = [];
            $scope.labels_calls = [];

            var callDataByDate = [];
            var formatedDateNew = [];

            // Start to find the date range from filters for create x-axis values (dynamic)
            var start = dateData.FromDate,
                    end = dateData.ToDate,
                    currentDate = new Date(start);

            // Calculating Date range on condition basis START
            var sweek = [];
            var timeDiff = Math.abs(end.getTime() - start.getTime());
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
            var diffMonths = Math.ceil(timeDiff / (30 * 1000 * 3600 * 24));
            while (currentDate <= end) {
                currDate1 = new Date(currentDate);
                var d1 = $filter('date')(currDate1, 'MM/d/y');
                sweek = 'Week ' + moment(currDate1).week();
                smonth = $filter('date')(currDate1, 'MMM');
                formatedDateNew.push({"date": d1, "week": sweek, "month": smonth, 'count': 0, 'comm': 0});
                currentDate.setDate(currentDate.getDate() + 1);
            }
            // Calculating Date range on condition basis END
            // End  find the date range from filters for create x-axis values (dynamic)

            //Graph linechart dynamic values
            var callDataCount = _.groupBy(response.callListData, function (callCount) {
                return $filter('date')(callCount.created, 'MM/d/y');
            });

            Object.keys(callDataCount).forEach(function (key)
            {
                formatedDateNew.forEach(function (data) {
                    if (data.date == key) {
                        if (key && key != 'undefined') {
                            data.count = callDataCount[key].length;
                            var totalComm = 0;
                            callDataCount[key].forEach(function (commdata) {
                                if (commdata.is_billable && commdata.is_billable == true && commdata.campaignData && commdata.campaignData.offer_id && commdata.campaignData.offer_id.pay_per_call) {
                                    totalComm = parseInt(totalComm) + parseInt(commdata.campaignData.offer_id.pay_per_call.lbamount);
                                }
                            });
                            data.comm = totalComm;
                        }
                    }
                });
            });
            $scope.aaa = [];
            $scope.revD = [];
            if (diffDays <= 30) {
                formatedDateNew.forEach(function (data) {
                    var us_date = $filter('date')(data.date, 'MM/d/y');
                    $scope.labels_calls.push(us_date);
                    $scope.labels_rev.push(us_date);
                    $scope.aaa.push(data.count);
                    $scope.revD.push(data.comm);
                });
            } else if (diffDays > 30 && diffMonths <= 6) {
                var weekgroups = _(formatedDateNew).groupBy('week');
                var weekOut = _(weekgroups).map(function (g, key) {
                    return {week: key,
                        count: _(g).reduce(function (m, x) {
                            return m + x.count;
                        }, 0),
                        comm: _(g).reduce(function (m, x) {
                            return m + x.comm;
                        }, 0)
                    };
                });
                weekOut.forEach(function (weeksdata) {
                    $scope.labels_calls.push(weeksdata.week);
                    $scope.labels_rev.push(weeksdata.week);
                    $scope.aaa.push(weeksdata.count);
                    $scope.revD.push(weeksdata.comm);
                });
            } else {
                var monthgroups = _(formatedDateNew).groupBy('month');
                var monthOut = _(monthgroups).map(function (g, key) {
                    return {month: key,
                        count: _(g).reduce(function (m, x) {
                            return m + x.count;
                        }, 0),
                        comm: _(g).reduce(function (m, x) {
                            return m + x.comm;
                        }, 0)
                    };
                });
                monthOut.forEach(function (monthsdata) {
                    $scope.labels_calls.push(monthsdata.month);
                    $scope.labels_rev.push(monthsdata.month);
                    $scope.aaa.push(monthsdata.count);
                    $scope.revD.push(monthsdata.comm);
                });
            }
            $scope.data_calls = [$scope.aaa];
            $scope.data_rev = [$scope.revD];

            // End of code for Calls Line chart
            // Start of category graph code
            angular.forEach(response.CategoryGraphData, function (value, key) {
                $scope.labels_cat.push(value.Category);
                $scope.data_cat.push(value.count);
            });
            // End of category graph code

            var totalCommission = 0;
            // Start To get Values for count blocks
            if (totalCallCount != 0) {
                angular.forEach(response.callListData, function (value, key) {
                    totalDuration = parseInt(totalDuration) + parseInt(value.Duration);
                    //calculating commission and bcount values for LG user
                    if (value.is_billable && value.is_billable == true && value.campaignData && value.campaignData.offer_id && value.campaignData.offer_id) {
                        totalCommission = parseInt(totalCommission) + parseInt(value.campaignData.offer_id.pay_per_call.lbamount);
                        bcount = bcount + 1;
                    } else {
                        //Else statement
                    }
                });
                avgDuration = Math.round(totalDuration / totalCallCount);
            }
            $scope.totalCallCount = {totalCommission: totalCommission, resCount: totalCallCount, bcount: bcount, avgDuration: avgDuration};
            //$scope.paginationData(response.callListData,val);
            Module.pagination(response.callListData);
            // End To get Values for count blocks
        });
    }

    $scope.getCallHistoryCategories = function (val) {
        Report.getCallHistoryCategories().save({}, function (response) {
            $scope.newCategories = [];
            angular.forEach(response.resp, function (value, key) {
                $scope.newCategories.push({name: value.Category});
            });
        });
    }
}]);

//Controller to get reports data for PA Dashboard
app.controller('PAReportsCtrl', ['$scope', 'Report', '$filter', '$interval', '$http', function ($scope, Report, $filter, $interval, $http) {
    //get call list as per date
    $scope.paRecords = function (cat) {
        var dFrom = new Date();
        dFrom.setHours(0, 0, 0, 0);
        var dTo = new Date();
        dTo.setHours(23, 59, 59, 999);
        var dateData = {FromDate: dFrom, ToDate: dTo};
        $scope.getDataByDate(dateData, 0);
    }

    $scope.PaDetails = {};
    $scope.callsInQueue = getActiveCalls();

    // Update the dataset at 25FPS for a smoothly-animating chart
    getActiveCalls();
    var intervalPromise = $interval(function () {
        $scope.PaDetails['callsInQueue'] = getActiveCalls();
    }, 6000);
    $scope.$on('$destroy', function () {
        $interval.cancel(intervalPromise);
    });
    function getActiveCalls() {
        return Math.floor(Math.random() * 100) + 1; //Temporary Jugad
//        $http.get('/phoneAgent/livecalls')
//                .success(function (response, status, headers, config) {
//                    return response.resp.calls.length;
//                    // console.log("Rand Data ", Math.random());
//                    // $scope.PaDetails.callsInQueue=Math.random();
//                })
//                .error(function (response, status) {
//                    logger.logError("Error!");
//                })
    }

    $scope.getDataByDate = function (dateData, val) {
        Report.callHistoryByDate().save(dateData, function (response) {
            //getting Calls In Queue, Calls Taken today, Average talk time and Average Queue Wait Time Data
            //var callsInQueue = 1 ;
            var callsTakenToday = response.callListData.length;
            var averageTalkTime = 0;
            var averageQueueWaitTime = 0;
            var totalDuration = 0;

            var callStartTime = 0;
            var CallAnswerTime = 0;
            var totalSeconds = 0;
            var seconds = 0;
            // End To get Values for count blocks
            if (callsTakenToday != 0) {
                angular.forEach(response.callListData, function (value, key) {
                    totalDuration = parseInt(totalDuration) + parseInt(value.Duration);

                    // Calculating time differnce between Call start time and Answer time Start
                    callStartTime = new Date(value.StartTime);
                    CallAnswerTime = new Date(value.AnswerTime);
                    if (callStartTime && callStartTime != null && CallAnswerTime && CallAnswerTime != null) {
                        var differenceTravel = CallAnswerTime.getTime() - callStartTime.getTime();
                        var seconds = Math.floor(differenceTravel / 1000);

                    } else {
                        var seconds = 0;
                    }
                    totalSeconds = Math.round(parseInt(totalSeconds) + parseInt(seconds));
                    // Calculating time differnce between Call start time and Answer time End
                });
                averageTalkTime = Math.round(totalDuration / callsTakenToday);
                averageQueueWaitTime = Math.round(totalSeconds / callsTakenToday);
            }
            $scope.PaDetails = {callsTakenToday: callsTakenToday, averageTalkTime: averageTalkTime, averageQueueWaitTime: averageQueueWaitTime, callsInQueue: getActiveCalls()};
        });
    }
    $scope.paRecords();
}]);

//Controller to get reports data for SAAS/ADMIN Dashboard
app.controller('SAASReportsCtrl', ['$scope', '$route', 'logger', 'Report', '$filter', function ($scope, $route, logger, Report, $filter) {
    //get Top 10 Money Makers, Top 10 Buyers, Top 10 Networks and Top 10 Hottest Categories details
    $scope.getSAASDashboardData = function (val) {
        Report.getSAASDashboardData().save({}, function (response) {
            //getting commission, total calls, billable calls and avarage Duration Data
            //console.log("DATA ", response )
            if (response.result) {
                $scope.top10MoneyMakers = response.result.top10moneymaker;
                $scope.top10Buyers = response.result.top10buyers;
                $scope.top10Networks = response.result.top10Networks;
                $scope.top10Categories = response.result.top10Categories;
            }
        });
    }
}]);

(function () {
    'use strict';
    app.controller('realTimeGraphCtrl', ['$scope', '$interval', function ($scope, $interval) {

            $scope.data_random = [[]];
            $scope.labels_random = [];
            $scope.options = {
                animation: false,
                showScale: true,
                showTooltips: true,
                pointDot: true,
                tooltipTemplate: "<%if (value){%><%=value%> Calls<%}else {%><%=0%> Calls<%}%>",
            };
            $scope.color_random = [{
                    fillColor: "rgba(61,143,255,0.1)",
                    strokeColor: "rgba(61,143,255,1)",
                    pointColor: "rgba(61,143,255,1)",
                }]

            // Update the dataset at 25FPS for a smoothly-animating chart
            var intervalPromise = $interval(function () {
                getLiveChartData();
            }, 6000);

            $scope.$on('$destroy', function () {
                $interval.cancel(intervalPromise);
            });

            function getLiveChartData() {
                // Removing items from the Data array when it reaches max than 10.
                if ($scope.data_random[0].length > 10) {
                    $scope.labels_random = $scope.labels_random.slice(1);
                    $scope.data_random[0] = $scope.data_random[0].slice(1);
                }

                var date = new Date();
                var hours = date.getHours();
                var minutes = date.getMinutes();
                var seconds = date.getSeconds();
                var ampm = hours >= 12 ? 'pm' : 'am';
                hours = hours % 12;
                hours = hours ? hours : 12; // the hour '0' should be '12'
                minutes = minutes < 10 ? '0' + minutes : minutes;
                var strTime = hours + ':' + minutes + ':' + seconds + ' ' + ampm;

                // $http.get('/phoneAgent/livecalls')
                //                        .success(function (response, status, headers, config) {
                //                            $scope.labels_random.push(strTime);
                //      						// $scope.data_random[0].push(getRandomValue($scope.data_random[0]));
                //      						$scope.data_random[0].push(response.resp.calls.length);
                //                        })
                //                        .error(function (response, status) {
                //                            logger.logError("Error!");
                //                        })

                $scope.labels_random.push(strTime);
                $scope.data_random[0].push(getRandomValue($scope.data_random[0]));

            }
        }]);

    function getRandomValue(data) {
        var l = data.length, previous = l ? data[l - 1] : 50;
        var y = previous + Math.random() * 10 - 5;
        return y < 0 ? 0 : y > 100 ? 100 : y;
    }
})();

function getUserDetail($scope, User, user_id, next) {
    // Getting User's first name and count
    User.findLGByIDUser().save({id: user_id}, function (response) {
        if (response.code == '200') {
            next(response.data);
        } else {
            next(false);
        }
    });
}