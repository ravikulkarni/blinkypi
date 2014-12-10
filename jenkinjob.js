var JenkinJob = function(pibrella, blinkyTape) {
    var BlinkyTape = require("./blinkytape.js").BlinkyTape;

    JenkinJob.pibrella = pibrella;
    JenkinJob.blinkyTape = blinkyTape;

    this.process = function() {
	var jenkinsapi = require('jenkins-api');
	var fs = require('fs');

	var configParameters = JSON.parse(fs.readFileSync('blinkypi.config', 'utf8'));
	
	for(var attributename in configParameters){
	    var blinkypiAttributes = configParameters[attributename];
	    var jenkinurl = blinkypiAttributes['jenkinurl'];
	    var jenkinjob = blinkypiAttributes['jenkinjob'];
	    var startLed = blinkypiAttributes['startLed'];
	    var countLed = blinkypiAttributes['count'];

	    var jenkins = jenkinsapi.init(blinkypiAttributes['jenkinurl']);

	    jenkins.last_build_info(blinkypiAttributes['jenkinjob'], function(err, data) {
		if (err){ 
		    return console.log(err); 
		}
		
		if(JenkinJob.blinkyTape.lockExists()) {
		    console.log("There may be issues with previous data transfer.");
		    JenkinJob.pibrella.turnIndicators(1,0,0);
		    return;
		}
		
		console.log("Job:" + jenkinurl + jenkinjob +" results " + data['result'])
		var result = data['result'];
		color = (result === "SUCCESS")? "green":"red";
		var colorArray = BlinkyTape[color]();
		r = colorArray[0];
		g = colorArray[1];
		b = colorArray[2];
		
		console.log("Starting at LED " + startLed + " making " +countLed + " LEDs " + color);
		for(i = startLed ; i< (parseInt(startLed) + parseInt(countLed)) ; i++) {
		    JenkinJob.blinkyTape.setLedColor(startLed,r,g,b );
		}
		JenkinJob.blinkyTape.sendUpdate();
		
	    });
	}
    }
}

exports.JenkinJob = JenkinJob;

