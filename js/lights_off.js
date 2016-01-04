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

//Stored values used when start() is called for the first time
var storedAccWindowLength = 0;
var storedAccMax = 0;

// Start text lighting using accelerometer values. In elements marked with the class "lightsOffText", background colour is set to black and text colour is scaled from black to white based on current acceleration.
// The parameters are: int accWindowLength, float accWindowThreshold, float smallFont, float bigFontSize
//    accWindowLength: Number of accelerometer values to use for calculating an average. 100 can take between 0.5 and 3.5 seconds, depending on the device.
//    accMax: The acceleration value corresponding to white text.

function start(accWindowLength, accMax) {
	
	//Turn Start button into Stop button
	document.getElementById('startStop').innerHTML = "Stop";
	document.getElementById('startStop').setAttribute('onclick','stop();');
	
	//Store parameters
	storedAccWindowLentgh = accWindowLength;
	storedAccMax = accMax;
	
	// Set debug text to "waiting" until enough values are collected. Will stay on this if no accelerometer is present on the device.
	document.getElementById('debug').innerHTML = "Waiting for accelerometer values." + accWindow.length;
	
	//Store original colours and set background colours to black
	var paragraphs = document.getElementsByClassName("lightsOffText");
	for (var i = 0; i < paragraphs.length; i++) {　　　　
		bgColours.push(paragraphs[i].style.backgroundColor);
		textColours.push(paragraphs[i].style.color);
		paragraphs[i].style.backgroundColor = "#000000";　　　　
    }
	
	// Set accelerometer event.
	window.ondevicemotion = function(event) { 
		// Calculate sum of (absolute) accelerometer x, y and z values.
		var ax = event.acceleration.x
		var ay = event.acceleration.y
		var az = event.acceleration.z	
		var accSum = Math.abs(ax) + Math.abs(ay) + Math.abs(az);
		
		// Add sum to array and return if the number of collected values is too small.
		accWindow.push(accSum);
		if (accWindow.length < accWindowLength) {
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
		document.getElementById('debug').innerHTML = avg + "<br>";
		changeTextColours(avg, accMax);
	}
}

// Stop responsive text lighting and return original colours
function stop() {
	
	//Turn Stop button into Start button using the stored parameters
	document.getElementById('startStop').innerHTML = "Start";
	document.getElementById('startStop').setAttribute('onclick', 'start(' + storedAccWindowLentgh + ',' + storedAccMax + ');');
	
	// Tell user library is inactive.
	document.getElementById('debug').innerHTML = "Library turned off.";
	
	//Restore original colours
	var paragraphs = document.getElementsByClassName("lightsOffText");
	for (var i = 0; i < paragraphs.length; i++) {　　　　
		paragraphs[i].style.backgroundColor = bgColours[i];
		paragraphs[i].style.color = textColours[i];　　　
    }
	
	window.ondevicemotion = function(event) { 
		// Do nothing on device motion.
	}
}

//Scales text colours based on current acceleration
//acc: current acceleration
//accMax: acceleration corresponding to white text
function changeTextColours(acc, accMax) {
	
	var scaledColour = 0;
	if (acc > accMax) {
		scaledColour = 255;
	} else {
		scaledColour = acc/accMax * 255;
	}
	document.getElementById('debug').innerHTML = acc + "/" + accMAx + " -> " + scaledColour + "<br>";
	var paragraphs = document.getElementsByClassName("lightsOffText");
	for (var i = 0; i < paragraphs.length; i++) {　　　　
		paragraphs[i].style.color = "rgb("+scaledColour+","+scaledColour+","+scaledColour+")";　　　
    }
}

// Toggle visibility of debug paragraph.
function toggleDebug() {
	debug = !debug;
	
	if (debug) {
		document.getElementById('debug').style.visibility = 'visible';
	} else {
		document.getElementById('debug').style.visibility = 'hidden';
	}
}

