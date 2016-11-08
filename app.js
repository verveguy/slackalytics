'use strict'

/*

The MIT License (MIT)

Copyright (c) 2015 Nico Miceli
Copyright (c) 2016 Brett Adam  verveguy@github

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

// Set up Reqs
const qs = require('querystring')
const reqpromise = require('request-promise-native')
const ApiBuilder = require('claudia-api-builder')

const api = new ApiBuilder()

module.exports = api

// TODO: The offtopic marker can also come via reactions (rather than text)
// we need to handle reaction events which requires EventsAPI

// ---
// routes

// TODO: not sure if we need this with claudiajs handing the boilerplate
api.get('/', function (req) {
  return 'here'
})

api.addPostDeployConfig('GOOGLE_ANALYTICS_UAID', 'Google Analytics Tracker ID (UA-XXXXXXXX-X):', 'ga-tracker-id')

//
api.post('/collect', function (req) {
  console.log('REQUEST:', JSON.stringify(req))

  // this comes via AWS API Gateway params, set at deploy time
  var GA_key

  try {
    GA_key = req.env.GOOGLE_ANALYTICS_UAID
  }
  catch (err) {
    const resp = 'Missing GOOGLE_ANALYTICS_UAID from AWS API Gateway params. Please set'
    console.error(resp)
    return resp  // bail
  }

  const channel = {
    id: req.post.channel_id,
    name: req.post.channel_name
  }

  const user = {
    id: req.post.user_id,
    name: req.post.user_name
  }

  const msgText = req.post.text
  const teamDomain = req.post.team_domain

  function searchM (regex) {
    let searchStr = msgText.match(regex)
    if (searchStr !== null) {
      return searchStr.length
    }
    return 0
  };

  function searchS (regex) {
    const searchStr = msgText.split(regex)
    if (searchStr !== undefined) {
      return searchStr.length
    }
    return 0
  };

  let wordCount = searchS(/\s+\b/)
  let emojiCount = searchM(/:[a-z_0-9]*:/g)
  let offtopicCount = searchM(/:batman:/g)  // Zendesk specific reaction marker
  let exclaCount = searchM(/!/g)
  let questionMark = searchM(/\?/g)
  let elipsisCount = searchM(/\.\.\./g)
  let alertCount = searchM(/<!/g)
  let urlCount = searchM(/<http/g)

  // Google Analytics Measure Protocol collection struct
  // see https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters

  let data = {
    v: 1,
    tid: GA_key,
    t: 'event',
    ni: 'true',

    cid: user.id,  //clientID (user ID)
    uid: user.id,  // userID
    ds: 'slack', // data source
    dh: teamDomain + '.slack.com',  // doc host
    dp: '/' + channel.name,  // we treat channels like URL paths
    dt: 'channel: ' + channel.name,  // doc title

    // custom dimensions
    cd1: user.name,
    cd2: channel.name,
    cd3: teamDomain,
    // cd4:   msgText,  /* using this leaks message data. caution */

    // custom metrics
    cm1: wordCount,
    cm2: emojiCount,
    cm3: exclaCount,
    cm4: questionMark,
    cm5: elipsisCount,
    cm6: urlCount,
    cm7: alertCount,
    cm8: offtopicCount,

    ec: 'slack: ' + channel.name + '|' + channel.id,
    ea: 'post by ' + user.name,
    el: 'post by ' + user.name,
    ev: 1
  }
  console.log(JSON.stringify(data))

  // Make Post Request to GA via Promise
  let options = {
    method: 'POST',
    uri: 'https://www.google-analytics.com/collect',
    body: qs.stringify(data),
    headers: { 'User-Agent': 'slackalytics' }
  }

  return reqpromise(options)
    .then((parsedBody) => {
      console.log('RESPONSE', JSON.stringify(parsedBody))
      return 'OK'
    })
    .catch((err) => {
      console.error('FAILED', err)
      return 'FAILED'
    })
})

