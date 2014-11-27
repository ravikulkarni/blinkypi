var http = require('http');
var SERIALPORT = "/dev/ttyACM0";
var BLINKYLOCK = "/tmp/blinkylock.txt";
var SerialPort = require("serialport").SerialPort;
var serialPort = new SerialPort(SERIALPORT, {
    baudrate: 115200
}, true); // this is the openImmediately flag 

var Pibrella = require("./pibrella.js").Pibrella
var pibrella = new Pibrella();

var BlinkyTape = require("./blinkytape.js").BlinkyTape;

process.on('uncaughtException', function(err) {
    // handle the error safely
    console.log(err);
    pibrella.turnOn("red");
    pibrella.turnOff("green");
});


serialPort.on('open', function() {
    console.log("Serial Port Opened");

    blinkyTape = new BlinkyTape(serialPort, pibrella, 60);
    console.log("Led Count:" + blinkyTape.getLedCount());
    console.log("Port:" + blinkyTape.getPort());
    blinkyTape.sendUpdate();
});

//Turn on green and turn off red indicator
pibrella.turnOn("green");
pibrella.turnOff("red");
var fs=require("fs");

http.createServer(function(req,resp) {
    var url = require("url");
    var querystring = url.parse(req.url,true).query
    var color = querystring["color"];
    var startLed = querystring["startled"];
    var countLed = querystring["count"];
    if(countLed && startLed && color){
	//If the lock file exists, then there is an error. Remove the file and throw error.
	if(fs.existsSync(BLINKYLOCK)) {
	    fs.unlinkSys(BLINKYLOCK);
	    throw new Error("There may be issues with previous data transfer.");
	}
	//Create lock file
	var err = null;
	try {
	    fs.writeFileSync(BLINKYLOCK, "lock"); 
	    console.log("Done creating a lock file.");
	} catch(ex) {
	    err = new Error("Error when creating lock.");
	    console.log("Error when creating lock.");
	    throw err;
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
	for(i = startLed ; i< (parseInt(startLed) + parseInt(countLed)) ; i++) {
	    console.log("i:" + i);
	    blinkyTape.setLedColor(startLed,r,g,b );
	}
	blinkyTape.sendUpdate();
    } 
    
    resp.writeHead(200, {"Content-Type": "text/html"});
    resp.write("LED turned on");
    resp.end();
}).listen(8080);


