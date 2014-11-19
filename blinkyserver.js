var http = require('http');
var FILEPATH = "/home/pi/blinkystate.txt";
var SERIALPORT = "/dev/ttyACM0";
var LOCK = "/tmp/blinkylock.txt";

var BlinkyTape = function(port, ledCount) {
    //Ensure this is Singleton.
    if ( arguments.callee._singletonInstance )
	return arguments.callee._singletonInstance;
    arguments.callee._singletonInstance = this;

    this.serialPort = port;
    this.ledCount = ledCount;
    
    //First time you start, initialize the data to have all 0s which means no lights turned on.
    var ledStatus = new Array(ledCount);
    for(i = 0; i< ledCount; i++){
	ledStatus[i] = [0,0,0];
    }

    //If the blinky state file exists, parse and update the intialized value to the values stored in file.
    var fs=require("fs");
    try { 
	console.log("Attempting to reading file " + FILEPATH)
	var content=fs.readFileSync(FILEPATH);
	console.log("Done reading file: " + content);
	ledStatus = JSON.parse(content);
	console.log("State file exists.");
    } catch (ex) {
	//State file does not exists. Do nothing.
	console.log("File does not exists");
    }

    //Functions to operate on Blinky Tape. When the blinkyserver is started the port is opened and kept open. 
    //The Blinky Tape serial port is never closed.

    //Close Blinky Tape. 
    var closeBlinkyTape = function closeBlinkyTape()  {
	serialPort.close(function() {
	    console.log("Serial Port closed");
	});
    }

    //Drain Blinky Tape.
    var drainBlinkyTape = function drainBlinkyTape()  {
	serialPort.drain(function() {
	    console.log("Serial Port drained");
	});
    }
    
    //Open Blinky Tape
    var openBlinkyTape = function openBlinkyTape() {
	console.log("Opening blinky tape.");	
	var SerialPort = require("serialport").SerialPort
	serialPort = new SerialPort(SERIALPORT, {
	    baudrate: 115200
	}, false); // this is the openImmediately flag [default is true]
	serialPort.open(function (error) {
	    if ( error ) {
		console.log('failed to open: '+error);
	    } else {
		next(null);
	    }
	});
    }

    //Get byte array from the Array of Arrays. Append 255 to store the state into Blinky Tape.
    var getLedStatusByteArray = function() {
	var ldst = [];
	for(i = 0; i< ledCount; i++){
	    ldst = ldst.concat(ledStatus[i]);
	}
	return ldst.concat(255);
    }
    
    //Write to Blinky Tape.
    var writeToBlinkyTape = function writeToBlinkyTape() {
	var iterationCount = [];
	var count = 2
	for(var i=0; i< count; i++) {
	    console.log("Writing to serial port:" + i);
	    var ldst = getLedStatusByteArray();
	    console.log(JSON.stringify(ldst));
	    
	    serialPort.write(new Buffer(getLedStatusByteArray()), function(err, results) {
		if(err){
		    console.log('Error when writing ' + i + ":" + err);
		} else {
		    iterationCount.push(i);
		    if(iterationCount.length == count) {
			next(null,2);
		    }
		}
	    });
	}		    	    
    }
    
    //Read the file storing the saved blinky state.
    var readSavedBlinkyState = function readBlinkyState() {
	var fs=require("fs");
	try { 
	    console.log("Attempting to reading file");
	    var content=fs.readFileSync(FILEPATH);
	    ledStatus = JSON.parse(content);
	    console.log("State file exists.");
	} catch (ex) {
	    //State file does not exists. Do nothing.
	}
	next(null);
    }

    //Save the blinky tape state into the file.
    var saveBlinkyState = function saveBlinkyState() {
	var fs=require("fs");
	fs.writeFileSync(FILEPATH, JSON.stringify(ledStatus)); 
	console.log("Done Writing to a file.");
	next(null, 1);
    }

    //Array to sequence method execution.
    BlinkyTape.tasks = [ 
		  saveBlinkyState,
		  writeToBlinkyTape,
		  drainBlinkyTape, 
		];

    //Function which calls methods to operate on BlinkyTape serially.
    function next(err, index) {
	console.log("Next called");
	if(err) throw err;
	console.log(BlinkyTape.tasks);
	
	var currentTask = BlinkyTape.tasks[index];
	console.log(currentTask);
	if(currentTask) {
	    currentTask();
	}
    }

    this.printLedStats = function() {
	console.log(ledStatus);
    }

    this.setLedColor = function(index, red, green, blue) {
	console.log("Setting LED Color:" + index);
	ledStatus[index] = [red, green, blue];
	console.log(JSON.stringify(ledStatus));
    }

    //Send the updated value to Blinky Tape
    this.sendUpdate = function() {
	console.log("Sending updates.");
	next(null, 0);
    }

    //Color Functions
    BlinkyTape.red = function() {
	return [254,0,0];
    }
    
    BlinkyTape.green = function() {
	return [0,254,0];
    }

    BlinkyTape.blue = function() {
	return [0,0,254];
    }

    BlinkyTape.yellow = function() {
	return [254, 254,0];
    }
    //End Color Functions

}

BlinkyTape.prototype.getPort = function() {
    return this.serialPort;
};

BlinkyTape.prototype.getLedCount = function() {
    return this.ledCount;
}

var SerialPort = require("serialport").SerialPort;
var serialPort = new SerialPort(SERIALPORT, {
    baudrate: 115200
}, true); // this is the openImmediately flag 


serialPort.on('open', function() {
    console.log("Serial Port Opened");
    blinkyTape = new BlinkyTape(serialPort, 60);
    blinkyTape.sendUpdate();
});


http.createServer(function(req,resp) {
    var url = require("url");
    var querystring = url.parse(req.url,true).query
    var color = querystring["color"];
    var startLed = querystring["startled"];
    var countLed = querystring["count"];
    if(countLed && startLed && color){

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


