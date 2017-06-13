'use strict'

// node dependencies
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');

// user-defined dependencies
var initFunction=require('./app/init.js').init;
var dbConnection=require('./app/dbConnection/dbConnection.js');

// json parsing
var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(jsonParser);
app.use(urlencodedParser);

// port settings
var port = process.env.PORT||8443;
app.listen(port,init)

// initialiser function
function init(){
    //mongodb connection
    dbConnection();
    console.log("Server is listening");
    initFunction();
    //controller call
    require('jubi-express-controller').process(app); 
 
};