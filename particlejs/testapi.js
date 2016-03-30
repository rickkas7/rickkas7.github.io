
// You need a Particle object to call the API. Make sure your html file loads the js file for the API.
var particle = new Particle();

// Global variables
var accessToken;
var deviceId;
var ledOn = false;

$(document).ready(function() {
	initPage();
});


function initPage() {
	// Hook up handlers using jquery
	$('#loginButton').on('click', loginButtonHandler);
	$('#logoutButton').on('click', logoutButtonHandler);
	$('#deviceSelect').on('change', deviceSelectChange);
	$('#toggleButton').on('click', toggleButtonHandler);
	
	// Read the access token from a browser cookie, if we can. This uses js-cookie.js, which is much
	// easier than coding for each browser quirk you might encounter.
	
	// Note: We don't store the actual username and password, but the access token that has a limited
	// lifetime and is less sensitive. You may not even want to save the accessToken at all, but for
	// this test program it's helpful because it eliminates the need to type in your username and 
	// password every time you reload the page.
	accessToken = Cookies.get('accessToken'); 
	if (accessToken == undefined || accessToken == '') {
		// Show the login page
		$('#loginDiv').show();
	}
	else {
		// We have an access token, so show the main page. Note that the access token
		// may be expired, but we'll only find that out the first time we try to use it, when
		// we update the device list.
		$('#mainDiv').show();
		updateDeviceList();		
	}
}

// The login button has been clicked
function loginButtonHandler(event) {
	// Disable the login button so it can't be clicked twice.
	$('#loginButton').attr('disabled', 'disabled');
	
	// Get the username and password from the web page, then clear the password field.
	var user = $('#loginUser').val();
	var pass = $('#loginPass').val();
	$('#loginPass').val('');
	
	console.log('loginButtonHandler user=' + user + "pass=<hidden>");
	
	// Log in using the Particle API. Note that the password isn't saved anywhere, and it's 
	// sent up to the Particle servers directly, not going through my server, for example. 
	// We get back an access token that we use for other calls.
	
	// Also note: The particle API uses the promise pattern for functions. Each call
	// has something like the call name ("particle.login") a set of parameters specific to 
	// that call, as an object ({username:user, password:pass}) followed by a then() expression.
	//
	// These calls take a while to execute, and Javascript programs should not hold up
	// execution waiting for things to complete. This call merely starts the processing and
	// more or less immediately returns.
	//
	// The code in the then() expression is executed when the operation is finally complete.
	// The first function executes if the operation succeeds. The second function executes
	// if an error occurs. 
	
	particle.login({username:user, password:pass}).then(
		function(data) {
			// Executed if login completes successfully
			accessToken = data.body.access_token;
			console.log("accessToken=" + accessToken);
			
			// Save in a browser cookie that expires in 7 days
			Cookies.set('accessToken', accessToken, { expires: 7 });
			
			// Reenable the login button
			$('#loginButton').removeAttr('disabled');
						
			// Hide all of the login related things and error messages and show the mainDiv.
			$('#loginFailureDiv').hide();
			$('#apiFailureDiv').hide();
			$('#loginDiv').hide();
			$('#mainDiv').show();
			updateDeviceList();
		},
		function(err) {
			// Failure to log in. Probably an invalid password. Could possibly be another
			// error from the server; you might want to check for that in a real app.
			console.log('login failed ', err);
			$('#loginButton').removeAttr('disabled');
			$('#apiFailureDiv').hide();
			$('#loginFailureDiv').show();
		}		
	);
	
	// Note that when this code is executed, the login operation hasn't completed yet.
	// The code in the then() expression is what gets executed later, when the login
	// actually completes.
	
	// This prevents the Submit button from trying to change the page we're on.
	event.preventDefault();
}

// This function is called to update the popup menu of devices
function updateDeviceList() {
	
	// We save the last selected device id in a browser cookie, so it will be selected the
	// next time you open the web page.
	var lastDeviceId = Cookies.get('lastDeviceId');
	
	// Use the listDevices API 
	particle.listDevices({ auth: accessToken }).then(
		function(devices) {
			for(var ii = 0; ii < devices.body.length; ii++) {
				var dev = devices.body[ii];
				console.log("dev ii=" + ii, dev);
				
				// The entries that come back have the following things in dev:
				// cellular: false
				// connected: true
				// id: "<yourdeviceid>"
				// last_app: null
				// last_heard: "2016-03-18T18:11:36.183Z"
				// last_ip_address: "<youripaddress>"
				// name: "test4"
				// platform_id: 6
				// product_id: 6
				// status: "normal"
				
				if (dev.connected) {
					var sel = '';
					
					// This device ID matches the one in the cookie, so mark it as selected
					if (dev.id == lastDeviceId) {
						sel = 'selected="selected" ';
					}
					
					var html = '<option value="' + dev.id + '" ' + sel + '>' + dev.name + '</option>';
					$('#deviceSelect').append(html);
				}
			}
			// If we selected a device in lastDeviceId, load the initial state now
			deviceSelectChange();
		},	
		function(err) {
			// This can happen when a saved access token has expired. If so, remove the saved
			// access token and display the login page.
			console.log('listDevices failed ', err);
			accessTokenErrorHandler();
		}
	);
	
}

function deviceSelectChange() {
	deviceId = $('#deviceSelect').val();
	if (deviceId == '') {
		return;
	}
	
	// Save the selected deviceId in a browser cookie for 7 days
	Cookies.set('lastDeviceId', deviceId, { expires: 7 });
	
	// Getting a variable is normally fast for a Photon, under a second. It make take a second or two with an
	// Electron, especially for the first it has been used in a while. If you select a device that's offline, it 
	// takes a long time (maybe 30 seconds? I didn't actually time it) to get the error back.
	// Show a progress message in queryingDiv while it's processing.
	console.log("deviceId=" + deviceId);
	$('#wrongApiDiv').hide();
	$('#deviceNotAvailableDiv').hide();
	$('#appDiv').hide();
	$('#queryingDiv').show();
	
	// We get a variable "led" for two reasons:
	// 1. To better guess whether we've selected a device with the right firmware.
	// 2. To get the initial state of the LED. We subscribe to events when the value changes, but we use a variable
	// to find out the initial state. This is a concern when the LED is on already when we open the web page.
	particle.getVariable({ deviceId: deviceId, name: 'led', auth: accessToken }).then(function(data) {
		console.log('Device variable retrieved successfully:', data);
		$('#queryingDiv').hide();
		$('#appDiv').show();

		ledOn = (data.body.result != 0);
		updateLedDisplay();
		
		// We were able to get the "led" variable, so we probably have the right firmware running.
		// Subscribe to the led event stream so we will be notified when the status changes.
		particle.getEventStream({ deviceId: deviceId, name: 'led', auth: accessToken }).then(function(stream) {
			stream.on('event', ledEventHandler);
		});
	}, function(err) {
		// We try to get the "led" variable. If this causes an error, then the selected device probably
		// isn't running our code. Show the error message in wrongApiDiv.
		console.log('failure trying to get led variable ', err);
		$('#queryingDiv').hide();
		if (err.statusCode == 404) {
			$('#wrongApiDiv').show();
		}
		else {
			// Device did not respond is 408 but in this test code we just show that message for all errors
			$('#deviceNotAvailableDiv').show();			
		}
	});
}

// Called when a "led" event is sent by the Photon. We subscribe to this in deviceSelectChange.
function ledEventHandler(data) {
	console.log('ledEventHandler ', data);

	if (data.coreid != deviceId) {
		// This happens if you switch devices, because I'm not actually sure how to stop getting a device stream
		return;
	}
	ledOn = (data.data == '1');
	updateLedDisplay();
}

// Shows the appropriate string based on the value on ledOn (true/false)
function updateLedDisplay() {
	if (ledOn) {
		$('#ledOnDiv').show();
		$('#ledOffDiv').hide();
	}
	else {
		$('#ledOnDiv').hide();		
		$('#ledOffDiv').show();		
	}
}

// This is called when the Toggle LED button is clicked. 
function toggleButtonHandler() {
	
	ledOn = !ledOn;
	updateLedDisplay();
	
	// The setled Particle cloud function takes a string of the state to set, either "1" or "0"
	var arg = (ledOn ? "1" : "0");
	
	particle.callFunction({ deviceId:deviceId, name: 'setled', argument: arg, auth: accessToken }).then(
		function(data) {
			console.log('setled success ', data);
		}, function(err) {
			console.log('setled error ', err);
		});

	
}

// This handles the logout button. Show the login screen and also remove our cookies.
function logoutButtonHandler() {
	$('#mainDiv').hide();
	$('#loginDiv').show();
	accessToken = '';
	Cookies.remove('accessToken');	
	Cookies.remove('lastDeviceId');	
}

// This happens when our access token expires. Display the login screen, and API failure message, and 
// remove the access token cookie. Leave the selected device ID cookie, since the token probably just
// expired.
function accessTokenErrorHandler() {
	$('#mainDiv').hide();
	$('#loginDiv').show();
	$('#apiFailureDiv').show();
	accessToken = '';
	Cookies.remove('accessToken');
}

