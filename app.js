
//Set up Reqs
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var qs = require('querystring');


//Server Details
var app = express();
var port = process.env.PORT || 3000;

//Set Body Parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json()); 
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); 


//Routes
app.get('/', function(req, res){
	res.send('here');
});

app.post('/collect', function(req, res){

	var channel = {
		id: 	req.body.channel_id,
		name: 	req.body.channel_name
	}
	var user = {
		id: 	req.body.user_id,
		name: 	req.body.user_name
	}
	
	var msgText = req.body.text;
	//var wordCount = msgText.split(/\s+\b/).length;
	//var emojiCount = msgText.match(/:[a-z_0-9]*:/g).length;
	//var exclaCount = msgText.match(/!/g).length;
	//var letterCount = msgText.match(/a-zA-Z/).length;

	//Structure Data
	var data = {
		v: 		1,
		tid: 	"UA-61435895-1",
		cid: 	user.id,
		ds:  	"slack", //data source
		cd1: 	user.id,
		cd2: 	channel.name,
		cd3: 	msgText,
	//	cm1: 	wordCount,
	//	cm2: 	emojiCount,
	//	cm3: 	exclaCount,
	//	cm4: 	letterCount,
		t: 		"event",
		ec: 	"slack: "+ channel.name + "|" + req.body.channel_id,
		ea: 	"post by " + req.body.user_name + "|"+req.body.user_id,
		el: 	msgText,
		ev: 	1 	
	};
	console.log(JSON.stringify(data));
	console.log(req.body);
	//Make Post Request	
	request.post("https://www.google-analytics.com/collect?"  + qs.stringify(data), 
		function(error, resp, body){
		console.log(error);
	})
});


//Start Server
app.listen(port, function () {
  console.log('Listening on port ' + port); 
});