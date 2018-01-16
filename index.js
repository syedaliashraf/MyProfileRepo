process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').DialogflowApp;
const functions = require('firebase-functions');
const globalrequest = require('request');
const encode = require('nodejs-base64-encode');
/*const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');

const server = express();
server.use(bodyParser.urlencoded({
    extended: true
}));

server.use(bodyParser.json());*/

// a. the action name from the make_name Dialogflow intent
const NAME_ACTION = 'get_profile_action';
// b. the parameters that are parsed from the make_name intent 
const URL_ARGUMENT = 'url';


exports.MyProfile = functions.https.onRequest((request, response) => {
    const app = new App({request, response});
    console.log('Request headers: ' + JSON.stringify(request.headers));
    console.log('Request body: ' + JSON.stringify(request.body));
  
    function searchBusiness(businessWebsite, callBack) {
        console.log('searchBusiness');
        var paramsDictionary = {
            "page_no": "1",
            "page_limit": "10",
            "action": "F_PROFILE",
            "search": {
                "website": businessWebsite
            },
            "bblt": "CoTngmVwYoioL7kLt9qpP1tlHPTbE8eh"
        };

        var paramString = JSON.stringify(paramsDictionary);
        console.log('paramString='+paramString);
        var data = encode.encode(paramString, 'base64')
        //var data = Buffer.from(paramString).toString('base64')
        console.log("base64 encoded data = " + data);
        let postStr = JSON.stringify({ "data": data });
        console.log('after stringify again='+postStr);
        let postData = { "data": data }
        console.log('postStr = ' + postStr);
        var headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 6eded1681bae86e3264961e6c3ae300c1b5c3211'

        }
        console.log('now going to execute request  1');
        var options = {
            url: "https://mw.buzzboard.com/bbv3.9/ai/searchlisting",
            method: 'POST',
            headers: headers,
            json: true,
            body: postData
        }

        console.log('now going to execute request');
        globalrequest(options, function (error, response, body) {
            console.log("response.statusCode = " + response.statusCode);
            if (error) {
                console.log("Error is + error");
                callBack('error in search business response', false);
            }
            else {
                // var rootDict = JSON.parse(body);
                console.log('body = ' + body);
                if (body.response.message_actions.options.length > 0 && body.response.message_actions.options[0].listing_info.id) {
                    var listingName = body.response.message_actions.options[0].title;
                    console.log("Listing Name = " + listingName);
                    var listingId = body.response.message_actions.options[0].listing_info.id;
                    console.log("Listing Id = " + listingId);
                    callBack(listingName, listingId);
                }
                else {
                    callBack('no matching listing found', false);
                }
            }

        });
    }

  // c. The function that generates the profile
    function getProfileFunc (app) {
      let url1 = app.getArgument(URL_ARGUMENT);
      app.tell('Alright, your requested profile for ' +
        url1 + '! I hope you like it. See you next time.');

        searchBusiness(url1, function(lName, lId) {
            console.log("inside callback function");
            console.log("listingname="+lName);
            console.log("listingid="+lId);
        });
    }
    // d. build an action map, which maps intent names to functions
    let actionMap = new Map();
    actionMap.set(NAME_ACTION, getProfileFunc);
  
  
  app.handleRequest(actionMap);
  });