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
            
                if(body){ 
                        try{
                            body=JSON.parse(body);
                        }
                        catch(err){
                            console.log(err)
                            model.info=err
                        }
                        if(body.link){
                            
                            console.log("LINK PRESENT")
                            model.data.s3Link=body.link
                            //add model.data
                            commonVar.add()
                            commonVar.check()
                            model.aws=true;
                            
                            global.emit("readGuardSetup",model)
                            model.emit("readGuard",model)
                            
                            global.emit("xmlRequestSetup",model)
                            model.emit("xmlRequestService",model)
                            
//                            global.emit("updateLocalDatabaseSetup",model)
//                            model.emit("updateLocalDatabase",model)
                            
                           }
                        else{
                            commonVar.add()
                            commonVar.check()
                            console.log("Error while querying.Link from AWS API not present : Thyrocare API \n");
                            model.info="Error while querying.Link from AWS API not present : Thyrocare API \n";
                        }
                }
                else if(response){
                        commonVar.add()
                        commonVar.check()
                        model.info=response;
                    }
                else if(error){
                        //console.log(error);
                        commonVar.add()
                        commonVar.check()
                        model.info=error;
                    }
                else{
                        commonVar.add()
                        commonVar.check()
                        console.log("Error while querying AWS API : Thyrocare API \n");
                        model.info="Error while querying AWS API : Thyrocare API \n";
                }
            model.emit(globalCallBackRouter,model)
        }); 
    
}

//completedDocsrts
module.exports.init=init;