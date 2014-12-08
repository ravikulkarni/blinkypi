function process(port, pibrella, blinkytape) {
    var jenkinsapi = require('jenkins-api');
    var fs = require('fs');

    var configParameters = JSON.parse(fs.readFileSync('blinkypi.config', 'utf8'));
    
    for(var attributename in configParameters){
	var blinkypiAttributes = configParameters[attributename];
	var jenkinurl = blinkypiAttributes['jenkinurl'];
	var jenkinjob = blinkypiAttributes['jenkinjob'];
	var startLed = blinkypiAttributes['startLed'];
	var count = blinkypiAttributes['count'];

	var jenkins = jenkinsapi.init(blinkypiAttributes['jenkinurl']);
	jenkins.last_build_info(blinkypiAttributes['jenkinjob'], function(err, data) {
	    if (err){ 
		return console.log(err); 
	    }
	    
	    if(blinkyTape.lockExists()) {
		console.log("There may be issues with previous data transfer.");
		pibrella.turnIndicators(1,0,0);
		return;
	    }
	    
	    console.log(data['result'])
	    var result = data['result'];
	    color = (result === "SUCCESS")? "green":"red";
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
	    
	});
    }
}

