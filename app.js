"use strict";
/*jshint esversion: 6 */
/*jslint node: true */
/* jshint node: true */

/* 

License information

*/

//Set up Reqs
var request = require('request');
var qs = require('querystring');
var reqpromise = require('request-promise-native');
var ApiBuilder = require('claudia-api-builder');

var api = new ApiBuilder();

module.exports = api;

//Routes
api.get('/', function(req){
  return 'here';
});

api.post('/collect', function(req){
  
  console.log("REQUEST:", JSON.stringify(req));
  
  // this comes via API Gateway params, set at deploy time
  // TODO: make claudia prompt for these with a configure task
  var GA_key = req.env.GOOGLE_ANALYTICS_UAID;
  
  var channel = {
    id:   req.post.channel_id,
    name:   req.post.channel_name
  };
  var user = {
    id:   req.post.user_id,
    name: req.post.user_name
  };
  var msgText = req.post.text;
  var teamDomain = req.post.team_domain;


  function searchM(regex){
    var searchStr = msgText.match(regex);
    if(searchStr != null){
      return searchStr.length;
    }
    return 0;
  };

  function searchS(regex){
    var searchStr = msgText.split(regex);
    if(searchStr != undefined){
      return searchStr.length;
    }
    return 0;
  };


  var wordCount = searchS(/\s+\b/);
  var emojiCount = searchM(/:[a-z_0-9]*:/g);
  var exclaCount = searchM(/!/g);
  var questionMark = searchM(/\?/g);
  var elipseCount = searchM(/\.\.\./g);
  var letterCount = searchM(/./g);


  //Structure Data
  var data = {
    v:     1,
    tid:   GA_key,
    cid:   user.id,
    ds:    "slack", //data source
    cs:    "slack", // campaign source
    cd1:   user.id,
    cd2:   channel.name,
    cd3:   msgText,
    cd4:   user.name,
    cm1:   wordCount,
    cm2:   emojiCount,
    cm3:   exclaCount,
    cm4:   letterCount,
    cm5:   elipseCount, 
    cm6:   questionMark, //need to set up in GA
    dh:    teamDomain+".slack.com",
    dp:    "/"+channel.name,
    dt:    "Slack Channel: "+channel.name,
    t:     "event",
    ec:   "slack: "+ channel.name + "|" + channel.id,
    ea:   "post by " + user.name,
    el:   "post by " + user.name,
    //el:   msgText,
    ev:   1 
  };
  console.log(JSON.stringify(data));
  
  //Make Post Request to GA via Promise
  var options = {
      method: 'POST',
      uri: 'https://www.google-analytics.com/collect?'+ qs.stringify(data),
/*      body: {
          some: 'payload'
      },
      json: true // Automatically stringifies the body to JSON 
      */
  };

  return reqpromise(options)
    .then( (parsedBody) => {
      console.log("RESPONSE", JSON.stringify(parsedBody));
      return "OK";
    })
    .catch( (err) => {
      console.error("FAILED", err);
      return "FAILED";
    });

});


 


