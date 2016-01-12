//Array for original background colours
var bgColours = [];

//Array for original text colours
var textColours = [];

// Array for accelerometer values.
var accWindow = [];

// Debug output set to true from the beginning.
var debug = true;

// Average of last X accelerometer values (X set by user in start()).
var avg = 0;

// Stored values used when start() is called for the first time
var storedAccWindowLength = 0;
var storedAccMax = 0;
var storedFadeAmount = 0;
var storedFadeTime = 0;

// Current text colour
var currColour = 0;

// The timer used for fade/refresh events
var fadeTimer;

// Start text lighting using accelerometer values. In elements marked with the class "lightsOffText", background colour is set to black and text colour is scaled from black to white based on current acceleration.
// 	accWindowLength:	Number of accelerometer values to use for calculating an average. 100 can take between 0.5 and 3.5 seconds, depending on the device.
// 	accMax:				The acceleration value corresponding to white text.
//	fadeTime:   		The time between two colour fade/redraw events in milliseconds.
//	fadeAmount:			The amount the colour is decreased each fade/refresh event in RGB values. (0 to 255)

function start(accWindowLength, accMax, fadeTime, fadeAmount) {
	
	//Turn Start button into Stop button
	document.getElementById('startStop').innerHTML = "Lights on";
	document.getElementById('startStop').setAttribute('onclick','stop();');
	
	//Store parameters
	storedAccWindowLentgh = accWindowLength;
	storedAccMax = accMax;
	storedFadeAmount = fadeAmount;
	storedFadeTime = fadeTime;
	
	// Set debug text to "waiting" until enough values are collected.
	document.getElementById('debug1').innerHTML = "Waiting for accelerometer values.";
	
	//Store original colours and set colours to black
	var paragraphs = document.getElementsByClassName("lightsOffText");
	for (var i = 0; i < paragraphs.length; i++) {　　　　
		bgColours.push(paragraphs[i].style.backgroundColor);
		textColours.push(paragraphs[i].style.color);
		paragraphs[i].style.backgroundColor = "rgb(0,0,0)";　　　　
		paragraphs[i].style.color = "rgb(0,0,0)";　　　　
    }
	
	// set current colour to black
	currColour = 0;
	
	//set fade event
	fadeTimer = setInterval(fadeRefresh, fadeTime);
	
	if(!window.DeviceMotionEvent){
		document.getElementById('debug1').innerHTML = "No accelerometer."
		return;
	}
	
	// Set accelerometer event.
	window.ondevicemotion = function(event) { 
		// Calculate sum of (absolute) accelerometer x, y and z values.
		var ax = 0;
		var ay = 0;
		var az = 0;
		var accSum;
		
		// Depending on whether the device can provide accelerometer values with or without gravity.
		if (event.acceleration){
			ax = event.acceleration.x;
			ay = event.acceleration.y;
			az = event.acceleration.z;	
			accSum = Math.abs(ax) + Math.abs(ay) + Math.abs(az);
		}
		if (ax == null || ay == null || az == null){
			ax = event.accelerationIncludingGravity.x;
			ay = event.accelerationIncludingGravity.y;
			az = event.accelerationIncludingGravity.z;	
			accSum = Math.abs(ax) + Math.abs(ay) + Math.abs(az) - 9.81; //no "correct" compensation for gravity, but good enough for this purpose on my tested devices
		}
		if (ax == null || ay == null || az == null){
			document.getElementById('debug1').innerHTML = "No accelerometer.";
			return;
		}
		document.getElementById('debug3').innerHTML = ax + " " + ay + " " + az;
		// Add sum to array and return if the number of collected values is too small.
		accWindow.push(accSum);
		if (accWindow.length < accWindowLength) {
			var filler = "";
			if (accWindow.length < 10) {
				filler = "0"
			}
			document.getElementById('debug1').innerHTML = filler + "" + accWindow.length + "/" + accWindowLength + " values => ";
			return;
		}
		
		// Enough values have been collected. Calculate average over all values.
		var allAccSum = 0;
		for (i = 0; i < accWindow.length; i++) {
			allAccSum += accWindow[i];
		}
		
		avg = allAccSum / accWindow.length;
		
		// Round average.
		avg = Math.ceil(avg * 10000) / 10000;
		
		// Empty array. (No sliding window!)
		accWindow = [];
			
		// Set text colours.
		increaseColour(avg, accMax);
	}
}

// Stop responsive text lighting and return original colours
function stop() {
	
	//Turn Stop button into Start button using the stored parameters
	document.getElementById('startStop').innerHTML = "Lights off";
	document.getElementById('startStop').setAttribute('onclick', 'start(' + storedAccWindowLentgh + ',' + storedAccMax + ',' + storedFadeTime + ',' + storedFadeAmount + ');');
	
	// Tell user library is inactive.
	document.getElementById('debug2').innerHTML = "<span id=\"debug1\" class=\"debug\"></span>";
	document.getElementById('debug1').innerHTML = "Library turned off. ";
	document.getElementById('debug3').innerHTML = "";
	
	//Restore original colours
	var paragraphs = document.getElementsByClassName("lightsOffText");
	for (var i = 0; i < paragraphs.length; i++) {　　　　
		paragraphs[i].style.backgroundColor = bgColours[i];
		paragraphs[i].style.color = textColours[i];　　　
    }
	
	window.ondevicemotion = function(event) { 
		// Do nothing on device motion.
	}
	
	// Stop fade timer
	clearInterval(fadeTimer);
}

//Scales text colours based on current acceleration
//acc: current acceleration
//accMax: acceleration corresponding to white text
function increaseColour(acc, accMax) {	
	var scaledColour = Math.floor(acc/accMax * 255);
	currColour += scaledColour;
	if (currColour < 0) {
		currColour = 0;
	} else if (currColour > 255) {
		currColour = 255;
	}
	document.getElementById('debug2').innerHTML ="<span id=\"debug1\" class=\"debug\">"+document.getElementById('debug1').innerHTML+"</span>" + acc + "/" + accMax + " -> +" + scaledColour + " => "+currColour;
}

// Used in timed fade event to let text colour fade over time
function fadeRefresh() {
	currColour -= storedFadeAmount;
	if (currColour < 0) {
		currColour = 0;
	}
	var paragraphs = document.getElementsByClassName("lightsOffText");
	for (var i = 0; i < paragraphs.length; i++) {　　　　
		paragraphs[i].style.color = "rgb("+currColour+","+currColour+","+currColour+")";　　　
    }
}

// Toggle visibility of debug paragraph.
function toggleDebug() {
	debug = !debug;
	
	if (debug) {
		// document.getElementById('debug1').style.visibility = 'visible';
		document.getElementById('debug2').style.visibility = 'visible';
		document.getElementById('debug3').style.visibility = 'visible';
	} else {
		// document.getElementById('debug1').style.visibility = 'hidden';
		document.getElementById('debug2').style.visibility = 'hidden';
		document.getElementById('debug3').style.visibility = 'hidden';
	}
}

