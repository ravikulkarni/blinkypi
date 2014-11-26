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
    Pibrella.tablepin = {
    // WiringPi : Physical
        "0":"amber",
        "1":"buzzer",
        "2":"red",
        "3":"E",
        "4":"F",
        "5":"G",
        "6":"H",
        "7":"green",
        "10":"C",
        "11":"B",
        "12":"D",
        "13":"A",
        "14":"R",
    }
    
    this.blink = function(color){
	console.log("Blinking " + color + " light.");
	exec("gpio mode "+ Pibrella.pintable[color] + " out", function(err,stdout,stderr) {
	    exec("gpio write "+ Pibrella.pintable[color] +" 1", function(err,stdout,stderr) {
		setTimeout(function(){
		    exec("gpio write "+ Pibrella.pintable[color] +" 0", function(err,stdout,stderr) {
		    });
		}, 250);
	    });
	});
    }
		    

    this.turnOn = function(color){
	exec("gpio mode "+ Pibrella.pintable[color] + " out", function(err,stdout,stderr) {
	    exec("gpio write "+ Pibrella.pintable[color] +" 1", function(err,stdout,stderr) {
	    });
	});
    }

    this.turnOff = function(color){
	exec("gpio mode "+ Pibrella.pintable[color] + " out", function(err,stdout,stderr) {
	    exec("gpio write "+ Pibrella.pintable[color] +" 0", function(err,stdout,stderr) {
	    });
	});
    }

}
exports.Pibrella = Pibrella;