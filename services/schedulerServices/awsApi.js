'use strict'

//node dependencies
var request = require('request');
var eventEmitter = require('events');

//user defined dependencies
var commonVar=require('./helper/staticVariables.js')

//function specific event instance
class eventClass extends eventEmitter{}
const event = new eventClass()

// event names
var globalDataAccessCall;
var globalCallBackRouter;

// global event emitter
var global;

//guard Access Variables
var commonAccessUrl;

//global variables
const headers     = {
                        'User-Agent':'Super Agent/0.0.1',
                        'Content-Type':'application/json'
                }

// function to instantiate
function init(globalEmitter,globalCall,globalDACall,callback,url){
    globalEmitter.on(globalCall,setup)
    global=globalEmitter;
    globalDataAccessCall=globalDACall;
    globalCallBackRouter=callback;
    commonAccessUrl=url
}

function setup(model)
{
    model.once("awsService",setupAwsFactory);
}

function setupAwsFactory(model){
    new awsApiCall(model);
}

function awsApiCall(model){
    
     var mobile=model.data.mobile;
     var leadId=model.data.thyrocareTags.leadId;
        var awsParams={
                        "mod"       : "aws",
                        "operation" : "awsQuery",
                        "data"      : {	    
                                           "url":model.data.thyrocareUrl,
                                           "key":mobile+"_"+leadId+".pdf"
                                    }

                };
        var awsRequestParams     = {
                    url     : commonAccessUrl,
                    method  : 'POST',
                    headers : headers,
                    body    : JSON.stringify(awsParams)
                }
    
        request(awsRequestParams, function (error, response, body){
            
                if(body){ 
                    
                        body=JSON.parse(body);
                        if(body.link){
                            
                            console.log("LINK PRESENT")
                            model.data.s3Link=body.link
                            commonVar.add()
                            commonVar.push(model.data)
                            commonVar.check()
                            
                           }
                        else{
                            commonVar.add()
                            commonVar.check()
                            console.log("Error while querying.Link from AWS API not present : Thyrocare API \n");
                        }
                }
                else{
                    commonVar.add()
                    commonVar.check()
                    console.log("Error while querying AWS API : Thyrocare API \n");
                }
            
        }); 
    
}

//completedDocsrts
module.exports.init=init;