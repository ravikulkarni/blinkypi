var BlinkyTape = function(port, pibrella, ledCount) {
    var FILEPATH = "/home/pi/blinkystate.txt";
    var BLINKYLOCK = "/tmp/blinkylock.txt";
    
    //Ensure this is Singleton.
    if ( arguments.callee._singletonInstance )
	return arguments.callee._singletonInstance;
    arguments.callee._singletonInstance = this;

    BlinkyTape.ledCount = ledCount;
    BlinkyTape.serialPort = port;
    BlinkyTape.pibrella = pibrella;

    //First time you start, initialize the data to have all 0s which means no lights turned on.
    var ledStatus = new Array(BlinkyTape.ledCount);
    for(i = 0; i< BlinkyTape.ledCount; i++){
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

    //Drain Blinky Tape.
    var drainBlinkyTape = function drainBlinkyTape()  {
	var error = null;
	BlinkyTape.serialPort.drain(function(err) {
	    if(err) {
		console.log("Error when draining to Blinky Tape");
		BlinkyTape.pibrella.blink("red");
		error = new Error("Error when draining to Blinky Tape");
	    } else {
		//Remove the lock 
		try {
		    fs.unlinkSync(BLINKYLOCK);
		    console.log("Removed the lock file.");
		} catch(ex) {
		    //Do nothing
		}
	    }
	    console.log("Serial Port drained");
	    //Confirm with indicator blinking.
	    BlinkyTape.pibrella.blink("amber");
	    next(error, -1);
	});
    }
    
    //Get byte array from the Array of Arrays. Append 255 to store the state into Blinky Tape.
    var getLedStatusByteArray = function() {
	var ldst = [];
	for(i = 0; i< BlinkyTape.ledCount; i++){
	    ldst = ldst.concat(ledStatus[i]);
	}
	return ldst.concat(255);
    }
    
    //Write to Blinky Tape.
    var writeToBlinkyTape = function writeToBlinkyTape() {
	var iterationCount = [];
	var count = 2;
	var error = null;

	for(var i=0; i< count; i++) {
	    console.log("Writing to serial port:" + i);
	    var ldst = getLedStatusByteArray();
	    console.log(JSON.stringify(ldst));
	    
	    BlinkyTape.serialPort.write(new Buffer(getLedStatusByteArray()), function(err, results) {
		if(err){
		    console.log('Error when writing ' + i + ":" + err);
		    BlinkyTape.pibrella.blink("red");
		    error =  new Error('Error when writing ' + i + ":" + err);
		} else {
		    iterationCount.push(i);
		    if(iterationCount.length == count) {
			next(error,2);
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
    }

    //Save the blinky tape state into the file.
    var saveBlinkyState = function saveBlinkyState() {
	var fs=require("fs");
	var err = null;
	try {
	    fs.writeFileSync(FILEPATH, JSON.stringify(ledStatus)); 
	} catch(ex) {
	    err = new Error("Error when saving Blinky State.");
	}
	console.log("Done Writing to a file.");
	next(err, 1);
    }

    //Array to sequence method execution.
    BlinkyTape.tasks = [ 
		  saveBlinkyState,
		  writeToBlinkyTape,
		  drainBlinkyTape, 
		];

    //Function which calls methods to operate on BlinkyTape serially.
    function next(err, index) {
	if(err) throw err;
	if(index == -1) return;

	console.log("Next called");
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
    
    BlinkyTape.off = function() {
	return [0, 0,0];
    }
    //End Color Functions

}

BlinkyTape.prototype.getPort = function() {
    return BlinkyTape.serialPort;
};

BlinkyTape.prototype.getLedCount = function() {
    return BlinkyTape.ledCount;
}


exports.BlinkyTape = BlinkyTape;