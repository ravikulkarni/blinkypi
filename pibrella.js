var Pibrella = function() {
    var exec = require('child_process').exec;

    //Ensure this is Singleton.
    if ( arguments.callee._singletonInstance )
        return arguments.callee._singletonInstance;
    arguments.callee._singletonInstance = this;

    // Map physical P1 pins to Gordon's Wiring-Pi Pins (as they should be V1/V2 tolerant)
    Pibrella.pintable = {
    // Physical : WiringPi
        "amber":"0",
        "buzzer ":"1",
        "red":"2",
        "Out E":"3",
        "Out F":"4",
        "Out G":"5",
        "Out H":"6",
        "green":"7",
        "In C":"10",
        "In B":"11",
        "In D":"12",
        "In A":"13",
        "Red Button":"14",
    }

    exec("gpio mode 0 out; gpio mode 2 out; gpio mode 7 out; gpio mode 14 in", function(err,stdout,stderr) {
	console.log("Mode set for gpio pins.");
    });

    this.blink = function(color){
	console.log("Color:" + color.toUpperCase());
	if(!(color.toUpperCase() === "RED" || color.toUpperCase() === "AMBER" || color.toUpperCase() === "GREEN")) {
	    return;
	}
	console.log("Blinking " + color + " light.");
	exec("gpio mode" + Pibrella.pintable[color]  +"out; gpio write "+ Pibrella.pintable[color] +" 1", function(err,stdout,stderr) {
	    if(err) {
		return new Error("Error when writing 1 with gpio to pin " + Pibrella.pintable[color]);
	    }
	    setTimeout(function(err){
		exec("gpio write "+ Pibrella.pintable[color] +" 0", function(err,stdout,stderr) {
		    if(err) {
			return new Error("Error when writing 0 with gpio to pin " + Pibrella.pintable[color]);
		    }
		});
	    }, 250);
	});
    }
		    

    this.turnOn = function(color){
	if(!(color.toUpperCase() === "RED" || color.toUpperCase() === "AMBER" || color.toUpperCase() === "GREEN")) {
	    return;
	}
	exec("gpio write "+ Pibrella.pintable[color] +" 1", function(err,stdout,stderr) {
	    if(err) {
		return new Error("Error when writing 1 with gpio to pin " + Pibrella.pintable[color]);
	    }
	});
    }

    this.turnOff = function(color){
	if(!(color.toUpperCase() === "RED" || color.toUpperCase() === "AMBER" || color.toUpperCase() === "GREEN")) {
	    return;
	}

	exec("gpio write "+ Pibrella.pintable[color] +" 0", function(err,stdout,stderr) {
	    if(err) {
		return new Error("Error when writing 0 with gpio to pin " + Pibrella.pintable[color]);
	    }
	});
    }

    this.readButton = function(callback) {
	var state = 0;
	exec("gpio read 14", function(err,stdout,stderr) {
	    if(err) {
		return new Error("Error when reading button ");
	    }
	    state = Number(stdout);
	    callback(err, state);
	});
    }

    this.turnIndicators = function(red, green, amber) {
	exec("gpio write 2 "+ red + " ; gpio write 7 " + green + " ; gpio write 0 " + amber + ";", function(err,stdout,stderr) {
	    if(err) {
		return new Error("Error when writing 0 with gpio to pin " + Pibrella.pintable[color]);
	    }
	});
    }

}
exports.Pibrella = Pibrella;