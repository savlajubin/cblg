/**!
 * plivo WebPhone Setup file
 * @author  Jubin Savla
 * @version 1.0
 */

var timeForTimer;
var ctrlScope;

function webrtcNotSupportedAlert() {
    $('#txtStatus').text("");
    alert("Your browser doesn't support WebRTC. You need Chrome 25 and above to use this application");
}
function isNotEmpty(n) {
    return n.length > 0;
}
function formatUSNumber(n) {
    var dest = n.replace(/-/g, '');
    dest = dest.replace(/ /g, '');
    dest = dest.replace(/\+/g, '');
    dest = dest.replace(/\(/g, '');
    dest = dest.replace(/\)/g, '');
    if (!isNaN(dest)) {
        n = dest
        if (n.length == 10 && n.substr(0, 1) != "1") {
            n = "1" + n;
        }
    }
    return n;
}
function replaceAll(txt, replace, with_this) {
    return txt.replace(new RegExp(replace, 'g'), with_this);
}
function initUI() {
    //callbox
    $('#callcontainer').hide();
    $('#btn-container').hide();
    $('#detail-form-container').hide();
    $('#status_txt').text('Waiting login');
    $('#login_box').show();
    $('#logout_box').hide();
}
function callUI() {
    //show outbound call UI
    dialpadHide();
    $('#incoming_callbox').hide('slow');
    $('#callcontainer').show();
    $('#status_txt').text('Ready');
    $('#make_call').text('CALL');
    $('#make_call').removeClass('end-call');
    $('#isIncoming').hide();
    $('#incomingOrDiapad').show();
    hideAllExcept();//Jubin
}
function IncomingCallUI() {
    //show incoming call UI
    console.log('yes incoming call UI');
    $('#status_txt').text('Incoming Call');
    $('#callcontainer').hide();
    $('#incoming_callbox').show('slow');
    $('#incomingOrDiapad').show();
}
function callAnsweredUI() {
    $('#incomingOrDiapad').hide();
    $('#incoming_callbox').hide('slow');
    $('#callcontainer').hide();
    $('#make_call').html('END');
    $('#isIncoming').show();
    $('#make_call').addClass('end-call');
    $('#make_call').attr('disabled', false);
    dialpadShow();
}
function onReady() {
    console.log("onReady...");
    $('#status_txt').text('Login');
    $('#login_box').show();
}

var isLoggedIn = false;
function login() {
    $('#plivoLoginFailDiv').fadeOut('slow');
    console.log('logging In');
    $('#make_call').text('Logging In');
    //Plivo.conn.login($("#username").val(), $("#password").val());
    //Plivo.conn.login('benne2jp150707140133', 'smartData@123');
    //Plivo.conn.login('smartDataDev151028070148', 'smartData@123');
    //Plivo.conn.login('smartdatatest150702065602', 'smartData@123');
    //console.log(555,pUser, pPass);
    if (isLoggedIn) {
        logout();
    }
    Plivo.conn.login(pUser, pPass);
}
function logout() {
    Plivo.conn.logout();
}

function onLogin() {
    $('#make_call').removeClass('end-call');
    $('#make_call').text('CALL');
    $('#status_txt').text('Logged in');
    $('#login_box').hide();
    $('#logout_box').show();
    $('#callcontainer').show();
    isLoggedIn = true;
}
function onLoginFailed() {
    $('#plivoLoginFailDiv').fadeIn('slow');
    $('#status_txt').text("Login Failed");
    $('#make_call').text('Error Logging In');
    $('#make_call').addClass('end-call');
}
function onLogout() {
    //initUI();
}
function onCalling() {
    console.log("onCalling");
    $('#status_txt').text('Connecting....');
}
function onCallRemoteRinging() {
    $('#status_txt').text('Ringing..');
}
function onCallAnswered() {
    console.log('onCallAnswered');
    callAnsweredUI();
    $('#status_txt').text('Call Answered');
    ctrlScope.startCountDown(timeForTimer);
}
function onCallTerminated() {
    console.log("onCallTerminated");
    callUI();
}
function onCallFailed(cause) {
    console.log("onCallFailed:" + cause);
    callUI();
    $('#status_txt').text("Call Failed:" + cause);
}

// Method to call login functionaly to the voice mail. Shivansh
function call_login(call_to) {
    console.log("Now Calling");
    call(call_to);
//    if (Plivo.conn.login('benne2jp150707140133', 'smartData@123')) {
//        setTimeout(function () {
//            console.log("inside call login");
//            call(call_to);
//        }, 3000);
//    }

}

// function call() {
//     console.log('call func');

//     if ($('#make_call').text() == "CALL") {
//         var dest = $("#to").val();
//         if (isNotEmpty(dest)) {
//             $('#status_txt').text('Calling..');
//             Plivo.conn.call(dest);
//             $('#make_call').text('END CALL');
//             $('#make_call').addClass('end-call');
//         }
//         else {
//             $('#status_txt').text('Invalid Destination');
//         }
//     }
//     else if ($('#make_call').text() == "END CALL") {
//         $('#status_txt').text('Ending..');
//         $('#make_call').text('CALL');
//         $('#make_call').removeClass('end-call');
//         $('#status_txt').text('Ready');
//         callUI();
//         Plivo.conn.hangup();

//     }
// }
function call(call_to) {
    console.log('call func' + call_to);

    if ($('#make_call').text().toUpperCase() == "CALL") {
        var dest = call_to;
        if (isNotEmpty(dest)) {
            $('#status_txt').text('Calling..');
            Plivo.conn.call(dest);
            $('#make_call').text('END');
            $('#make_call').addClass('end-call');
        } else {
            $('#status_txt').text('Invalid Destination');
        }
    } else if ($('#make_call').text().toUpperCase() == "END" || $('#make_call').text().toUpperCase() == "END CALL") {
        $('#status_txt').text('Ending..');
        Plivo.conn.hangup();
        $('#make_call').text('CALL');
        $('#make_call').removeClass('end-call');
        $('#status_txt').text('Ready');
        callUI();
    } else if ($('#make_call').text().toUpperCase() == "LOGIN AGAIN") {
        login();
    } else {
        console.log('Bhai Check Karo Upper/Lower Case ka panga ho sakta hai');
    }

}

function hangup() {
    $('#status_txt').text('Ending..');
    Plivo.conn.hangup();
    $('#make_call').text('CALL');
    $('#make_call').removeClass('end-call');
    $('#status_txt').text('Ready');
    callUI();
//    $('#status_txt').text('Hanging up..');
//    Plivo.conn.hangup();
//    callUI()
}
function dtmf(digit) {
    console.log("send dtmf=" + digit);
    Plivo.conn.send_dtmf(digit);
}
function dialpadShow() {
    $('#btn-container').show();
    $('#detail-form-container').show();
}
function dialpadHide() {
    $('#btn-container').hide();
}
function mute() {
    Plivo.conn.mute();
    $('#linkUnmute').show('slow');
    $('#linkMute').hide('slow');
}
function unmute() {
    Plivo.conn.unmute();
    $('#linkUnmute').hide('slow');
    $('#linkMute').show('slow');
}
function onIncomingCall(account_name, extraHeaders) {
    console.log("onIncomingCall:" + account_name);
    console.log("extraHeaders=", extraHeaders);
    console.log("extraHeaders=");
    for (var key in extraHeaders) {
        console.log("key=" + key + ".val=" + extraHeaders[key]);
    }

    var callFrom = account_name.replace('@phone.plivo.com', '');

    ctrlScope.campaignDetails(extraHeaders['X-Ph-Calledphoneno'], extraHeaders['X-Ph-Calluuid'], callFrom.replace('+',''));

    //Jubin
    $('#caller_id').val(account_name);
    $('#call_from').text(callFrom);
    //Jubin

    IncomingCallUI();
}
function onIncomingCallCanceled() {
    callUI();
}
function onMediaPermission(result) {
    if (result) {
        console.log("get media permission");
        if (!isLoggedIn) {
            login();//By Jubin
        }
    } else {
        alert("Please allow media permission from your browser.");
    }
}
function answer() {
    console.log("answering")
    $('#status_txt').text('Answering....');
    Plivo.conn.answer();
    callAnsweredUI()
}
function reject() {
    callUI()
    Plivo.conn.reject();
}

function setTimeForTimer(time) {
    timeForTimer = time;
}

//$(document).ready(function () {
//    Plivo.onWebrtcNotSupported = webrtcNotSupportedAlert;
//    Plivo.onReady = onReady;
//    Plivo.onLogin = onLogin;
//    Plivo.onLoginFailed = onLoginFailed;
//    Plivo.onLogout = onLogout;
//    Plivo.onCalling = onCalling;
//    Plivo.onCallRemoteRinging = onCallRemoteRinging;
//    Plivo.onCallAnswered = onCallAnswered;
//    Plivo.onCallTerminated = onCallTerminated;
//    Plivo.onCallFailed = onCallFailed;
//    Plivo.onMediaPermission = onMediaPermission;
//    Plivo.onIncomingCall = onIncomingCall;
//    Plivo.onIncomingCallCanceled = onIncomingCallCanceled;
//    Plivo.init();
//});

function intiateWebPhone($scope) {
    ctrlScope = $scope;
    Plivo.onWebrtcNotSupported = webrtcNotSupportedAlert;
    Plivo.onReady = onReady;
    Plivo.onLogin = onLogin;
    Plivo.onLoginFailed = onLoginFailed;
    Plivo.onLogout = onLogout;
    Plivo.onCalling = onCalling;
    Plivo.onCallRemoteRinging = onCallRemoteRinging;
    Plivo.onCallAnswered = onCallAnswered;
    Plivo.onCallTerminated = onCallTerminated;
    Plivo.onCallFailed = onCallFailed;
    Plivo.onMediaPermission = onMediaPermission;
    Plivo.onIncomingCall = onIncomingCall;
    Plivo.onIncomingCallCanceled = onIncomingCallCanceled;
    Plivo.init();
}

// Call back functionality starts
// Method to call back functionaly to the voice mail. Shivansh
function callback_login(sip, elemId) {
    if (Plivo.conn.login('benne2jp150707140133', 'smartData@123')) {
        setTimeout(function () {
            console.log("inside callback login");
            call_back(sip, elemId);
        }, 3000);
    }

}
function call_back(call_to, elemId) {
    console.log('call back func' + call_to);
    console.log("button text+++++++" + $('#' + elemId).text());
    if ($('#' + elemId).text() == "Call back") {
        var dest = call_to;
        if (isNotEmpty(dest)) {
            $('#status_txt').text('Calling...');
            Plivo.conn.call(dest);
            $('#' + elemId).text('End');
        }
        else {
            $('#status_txt').text('Invalid Destination');
        }
    }
    else if ($('#' + elemId).text() == "End") {
        $('#status_txt').text('Ending..');
        Plivo.conn.hangup();
        $('#' + elemId).text('Call back')

        $('#status_txt').text('Ready');
    }
}

function intiateCallBackWebPhone($scope) {
    console.log("inside callback initiate");
    intiateWebPhone($scope);
// login() function is now called from onMediaPermission() function //Jubin
//    if (intiateWebPhone()) {
//        login();
//        return true;
//    }

}

function closeLoginAgainBox() {
    $('#plivoLoginFailDiv').fadeOut('slow');
    $('#make_call').text('LOGIN AGAIN');
    $('#make_call').prop('disabled', false);
}

function hideAllExcept(divId) {
    $('#isIncoming').hide();
    $('#isTransfer').hide();
    $('#isNext').hide();
    if (divId) {
        $('#' + divId).show();
    }
}




/******************************************* Twilio WebPhone (START)***********************************************************/

function initTwilioWebPhone(data, $scope) {
    console.log(11, data)
    ctrlScope = $scope;
    $('#plivoLoginFailDiv').fadeOut('slow');
    console.log('logging In');
    $('#tw_make_call').text('Logging In');

    Twilio.Device.setup(data, {debug: true, rtc: true});
}

$(document).ready(function () {

    Twilio.Device.ready(function (device) {
        console.log(11, 'ready fun');
        $('#status').text('Ready to start call');
        $('#tw_make_call').removeClass('end-call');
        $('#tw_make_call').text('CALL');
        $('#plivoLoginFailDiv').hide();
        tw_onReady();
    });

    Twilio.Device.offline(function (device) {
        console.log(1, 'Offline')
        $('#status').text('Offline');
        $('#plivoLoginFailDiv').fadeIn('slow');
        $('#status_txt').text("Login Failed");
        $('#tw_make_call').text('Error Logging In');
        $('#tw_make_call').addClass('end-call');
    });

    Twilio.Device.error(function (error) {
        console.log(2, 'Error', error)
        $('#status').text(error);
        $('#plivoLoginFailDiv').fadeIn('slow');
        $('#status_txt').text("Login Failed");
        $('#tw_make_call').text('Error Logging In');
        $('#tw_make_call').addClass('end-call');
    });

    Twilio.Device.connect(function (conn) {
        console.log('conn resp: ', conn);
        console.log('conn sts: ', conn.status());
        console.log("Successfully established call");
        $('#status').text("Successfully established call");
        toggleCallStatus();
        tw_onCallAnswered();
    });

    Twilio.Device.disconnect(function (conn) {
        console.log('disconn resp: ', conn);
        console.log("Call ended");
        toggleCallStatus();
        tw_onCallTerminated();
    });

    Twilio.Device.cancel(function (conn) {
        tw_callUI();
        console.log('cancelFrom-', conn.parameters.From); // who canceled the call
        conn.status // => "closed"
        console.log(conn.status());
    });

    Twilio.Device.presence(function (presenceEvent) {
        // Called for each available client when this device becomes ready
        // and every time another client's availability changes.
        console.log('presenceEvent-', presenceEvent.from, presenceEvent.available);
        presenceEvent.from; // => name of client whose availability changed
        presenceEvent.available; // => true or false
    });

    Twilio.Device.incoming(function (conn) {
        $('#call_from').text(conn.parameters.From);

        ctrlScope.campaignDetails_twilio(conn.parameters.CallSid, conn.parameters.From);

        tw_IncomingCallUI();
        connection = conn;
        console.log('conn.parameters', conn.parameters)
    });
});
var connection = null;
//}

function tw_initUI() {
    //callbox
    $('#callcontainer').hide();
    $('#btn-container').hide();
    $('#detail-form-container').hide();
    $('#status_txt').text('Waiting login');
    $('#login_box').show();
    $('#logout_box').hide();
}

function tw_callUI() {
    //show outbound call UI
    dialpadHide();
    $('#incomingOrDiapad').show();
    $('#incoming_callbox').hide('slow');
    $('#callcontainer').show();
    $('#status_txt').text('Ready');
    $('#tw_make_call').text('CALL');
    $('#tw_make_call').removeClass('end-call');
    $('#isIncoming').hide();
    hideAllExcept();//Jubin
}



function tw_MakeCall(call_to) {
    console.log(1 + '-makecall');
    params = {"tocall": call_to};
    connection = Twilio.Device.connect(params);
}

function tw_HangUp() {
    console.log(2 + '-hang');
    Twilio.Device.disconnectAll();
}

function tw_IncomingCallUI() {
    //show incoming call UI
    console.log('yes incoming call UI');
    $('#status_txt').text('Incoming Call');
    $('#callcontainer').hide();
    $('#incoming_callbox').show('slow');
    $('#incomingOrDiapad').show();
}
function tw_callAnsweredUI() {
    $('#incomingOrDiapad').hide();
    $('#incoming_callbox').hide('slow');
    $('#callcontainer').hide();
    $('#tw_make_call').html('END');
    $('#isIncoming').show();
    $('#tw_make_call').addClass('end-call');
    $('#tw_make_call').attr('disabled', false);
    dialpadShow();
}
function tw_onReady() {
    console.log("onReady...");
    $('#status_txt').text('Login');
    $('#login_box').show();
}

function tw_onCalling() {
    console.log("onCalling");
    $('#status_txt').text('Connecting....');
}
function tw_onCallRemoteRinging() {
    $('#status_txt').text('Ringing..');
}
function tw_onCallAnswered() {
    console.log('onCallAnswered');
    tw_callAnsweredUI();
    $('#status_txt').text('Call Answered');
}
function tw_onCallTerminated() {
    console.log("onCallTerminated");
    tw_callUI();
}
function tw_onCallFailed(cause) {
    console.log("onCallFailed:" + cause);
    tw_callUI();
    $('#status_txt').text("Call Failed:" + cause);
}

function toggleCallStatus() {
    $('#call').toggle();
    $('#hangup').toggle();
    $('#dialpad').toggle();
}

function tw_dialer(value) {
    if (connection) {
        connection.sendDigits(value)
        return false;
    }
}



function onIncomingCallCanceledxx() {
    callUI();
}
function tw_answer() {
    console.log("answering")
    $('#status_txt').text('Answering....');
    connection.accept();
    tw_callAnsweredUI();
}
function tw_reject() {
    tw_callUI();
    connection.reject();
}

/*
 $.each(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'star', 'pound'], function (index, value) {
 $('#button' + value).click(function () {
 if (connection) {
 if (value == 'star')
 connection.sendDigits('*')
 else if (value == 'pound')
 connection.sendDigits('#')
 else
 connection.sendDigits(value)
 return false;
 }
 });
 });
 */

//}

/******************************************* Twilio WebPhone (END)***********************************************************/


/******************************************* Twilio WebPhone (BackUp)***********************************************************

 function initTwilioWebPhone(data) {
 console.log(11, data)
 Twilio.Device.setup(data, {debug: true, rtc: true});
 //Twilio.Device.setup('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzY29wZSI6InNjb3BlOmNsaWVudDpvdXRnb2luZz9hcHBTaWQ9IiwiaXNzIjoiQUM5NTE4ZTRkNzk4NWU4MGNiODA1NTVjZGI1NTA0NzY5MSIsImV4cCI6MTQ0NTY4ODk3OX0.hbldY4Xwq8Ecp-lRvDDXdqWpKnpDzypamsEkeGY0oaQ');


 //$(document).ready(function () {


 var connection = null;

 $("#call").click(function () {
 console.log(1);
 params = {"tocall": $('#tocall').val()};
 connection = Twilio.Device.connect(params);
 });
 $("#hangup").click(function () {
 console.log(2);
 Twilio.Device.disconnectAll();
 });

 Twilio.Device.ready(function (device) {
 $('#status').text('Ready to start call');
 });

 Twilio.Device.incoming(function (conn) {
 if (confirm('Accept incoming call from ' + conn.parameters.From + '?')) {
 connection = conn;
 conn.accept();
 }
 });

 Twilio.Device.offline(function (device) {
 $('#status').text('Offline');
 });

 Twilio.Device.error(function (error) {
 $('#status').text(error);
 });

 Twilio.Device.connect(function (conn) {
 $('#status').text("Successfully established call");
 toggleCallStatus();
 });

 Twilio.Device.disconnect(function (conn) {
 $('#status').text("Call ended");
 toggleCallStatus();
 });

 function toggleCallStatus() {
 $('#call').toggle();
 $('#hangup').toggle();
 $('#dialpad').toggle();
 }

 $.each(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'star', 'pound'], function (index, value) {
 $('#button' + value).click(function () {
 if (connection) {
 if (value == 'star')
 connection.sendDigits('*')
 else if (value == 'pound')
 connection.sendDigits('#')
 else
 connection.sendDigits(value)
 return false;
 }
 });
 });

 }
 //});

 /******************************************* Twilio WebPhone (END)***********************************************************/
