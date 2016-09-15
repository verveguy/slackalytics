# Slackalytics

Slackalytics is a textual analysis bot built in Node.js that allows for deeper custom analytics by sending message strings to Google Analysis via Slacks realtime API and Google Analytics Measurement Protocol.

The original work was done by Nico Miceli. See his blog post here: [http://nicomiceli.com/slackalytics/](http://nicomiceli.com/slackalytics/) 

Created by [Nico Miceli](http://nicomiceli.com) and [Joe Zeoli](http://joezeoli.com)

This version uses AWS Lambda with AWS API Gateway thereby acheiving the result without any servers to manage at all.

Claudiajs is used as the essential glue between simple nodejs function and all that AWS machinery.

Blog post on this port coming Real Soon Now(tm)

Change Log
------------

09/14/16 - reworked for AWS Landba and friends using Claudiajs
- Moved the GOOGLE_ANALYTICS_UAID into an AWS API Gateway context param, removing all secrets from the code itself.
(You will need to set this via AWS API Gateway console)
 
![AWS API Gateway Stage Variable](stage_vars.png)