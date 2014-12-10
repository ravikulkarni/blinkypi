var http = require('http');
var SERIALPORT = "/dev/ttyACM0";

var SerialPort = require("serialport").SerialPort;
var serialPort = new SerialPort(SERIALPORT, {
    baudrate: 115200
}, true); // this is the openImmediately flag 

var Pibrella = require("./pibrella.js").Pibrella
var pibrella = new Pibrella();

var BlinkyTape = require("./blinkytape.js").BlinkyTape;
var blinkyTape = new BlinkyTape(serialPort, pibrella, 60);

var JenkinJob = require("./jenkinjob.js").JenkinJob;
var jenkinJob = new JenkinJob(pibrella, blinkyTape);

process.on('uncaughtException', function(err) {
    // handle the error safely
    console.log(err);
    pibrella.turnIndicators(1,0,0);
    throw err;
});

setInterval(function() { 
    //Check of the button is pressed.
    pibrella.readButton(function(err,buttonState) {
	if(err) {
	    console.log("Error reading the button.");
	}
	if(buttonState == 1) {
	    //Turn on all three indicators
	    console.log("Button Pressed");
	    pibrella.turnIndicators(1,1,1);
	    //Restart the Raspberry Pi
	    var exec = require('child_process').exec;
	    exec("sudo shutdown -r now", function(err,stdout,stderr) {});
	}
    });
},200);

serialPort.on('open', function() {
    console.log("Serial Port Opened");

   //blinkyTape = new BlinkyTape(serialPort, pibrella, 60);
    console.log("Led Count:" + blinkyTape.getLedCount());
    console.log("Port:" + blinkyTape.getPort());
    blinkyTape.sendUpdate();
});

setInterval(function() { 
    //Check of the button is pressed.
    console.log("Checking job status");
//    jenkinJob.process();    
},1000*60*5);

//Turn on green and turn off red indicator
jenkinJob.process();    
pibrella.turnIndicators(0, 1, 0);

var fs=require("fs");

http.createServer(function(req,resp) {
    var url = require("url");
    var querystring = url.parse(req.url,true).query
    var color = querystring["color"];
    var startLed = querystring["startled"];
    var countLed = querystring["count"];
    var message = "No changes made.";
    if(countLed && startLed && color){
	//If the lock file exists, then there is an error. Remove the file and throw error.
	if(blinkyTape.lockExists()) {
	    console.log("There may be issues with previous data transfer.");
	    pibrella.turnIndicators(1,0,0);
	    return;
	}

	var r = 0;
	var g = 0;
	var b = 0;
	var colorArray = BlinkyTape[color]();
	r = colorArray[0];
	g = colorArray[1];
	b = colorArray[2];

	console.log("r:" + r + " g:" + g + " b:" + b);
	console.log("Starting at LED " + startLed + " making " +countLed + " LEDs " + color);
	message = "Starting at LED " + startLed + " making " +countLed + " LEDs " + color;
	blinkyTape.lock();
	for(i = startLed ; i< (parseInt(startLed) + parseInt(countLed)) ; i++) {
	    console.log("i:" + i);
	    blinkyTape.setLedColor(startLed,r,g,b );
	}
	blinkyTape.sendUpdate();
    } 
    
    resp.writeHead(200, {"Content-Type": "text/html"});
    resp.write(message);
    resp.end();
}).listen(8080);


