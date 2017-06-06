'use strict'

//node dependencies
var request = require('request');

//user defined dependencies
var commonVar=require('./helper/staticVariables.js')

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
    
        var awsParams={
                        "mod"       : "aws",
                        "operation" : "awsQuery",
                        "data"      : {	    
                                           "url":model.data.thyrocarePdfUrl,
                                           "key":model.data.mobile+"_"+model.data.thyrocareLeadId+".pdf"
                                    }

                };
        var awsRequestParams     = {
                    url     : commonAccessUrl,
                    method  : 'POST',
                    headers : headers,
                    body    : JSON.stringify(awsParams)
                }
    
        request(awsRequestParams, function (error, response, body){
            
            console.log("After Request")
            
                if(body){ 
                    
                        body=JSON.parse(body);
                        if(body.link){
                            
                            console.log("LINK PRESENT")
                            model.data.s3Link=body.link
                            //add model.data
                            commonVar.add()
                            commonVar.check()
                            model.aws=true;
                            
                            global.emit("readGuardSetup",model)
                            model.emit("readGuard",model)
                            
//                            global.emit("updateLocalDatabaseSetup",model)
//                            model.emit("updateLocalDatabase",model)
                            
                           }
                        else{
                            
                            commonVar.add()
                            commonVar.check()
                            console.log("Error while querying.Link from AWS API not present : Thyrocare API \n");
                        }
                }
                else if(response){
                        commonVar.add()
                        commonVar.check()
                        model.info=response;
                        model.emit(globalCallBackRouter,model)
                    }
                else if(error){
                        //console.log(error);
                        commonVar.add()
                        commonVar.check()
                        model.info=error;
                        model.emit(globalCallBackRouter,model)
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