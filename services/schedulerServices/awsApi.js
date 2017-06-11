'use strict'

//node dependencies
var request = require('request');

//user defined dependencies
var commonVar=require('./helper/staticVariables.js')

// event names
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
function init(globalEmitter,globalCall,callback,url){
    global=globalEmitter;
    globalEmitter.on(globalCall,setup)
    globalCallBackRouter=callback;
    commonAccessUrl=url
}

//function to setup model's event listener
function setup(model)
{
    model.once("awsService",setupAwsFactory);
}

//function to create new 'awsApiCall' function for each model
function setupAwsFactory(model){
    new awsApiCall(model);
}

//function to call the AWS Api 
function awsApiCall(model){
    
    console.log("IM IN AWSAPI")
    
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
                            model.info=err
                            model.emit(globalCallBackRouter,model)
                        }
                        if(body.link){
                            
                            console.log("LINK PRESENT")
                            model.data.s3Link=body.link
                           
                            commonVar.add()
                            commonVar.check()
                            model.aws=true;
        
                            global.emit("readGuardSetUp",model)
                            model.emit("readGuard",model)
//                            
//                            global.emit("xmlRequestSetup",model)
//                            model.emit("xmlRequestService",model)
                                   
                           }
                        else{
                            commonVar.add()
                            commonVar.check()
                            console.log("Error while querying.Link from AWS API not present : Thyrocare API \n");
                            model.info="Error while querying.Link from AWS API not present : Thyrocare API \n";
                            model.emit(globalCallBackRouter,model)
                        }
                }
                else if(response){
                        commonVar.add()
                        commonVar.check()
                        model.info=response;
                        model.emit(globalCallBackRouter,model)
                    }
                else if(error){
                        commonVar.add()
                        commonVar.check()
                        model.info=error;
                        model.emit(globalCallBackRouter,model)
                    }
                else{
                        commonVar.add()
                        commonVar.check()
                        console.log("Error while querying AWS API : Thyrocare API \n");
                        model.info="Error while querying AWS API : Thyrocare API \n";
                        model.emit(globalCallBackRouter,model)
                }
        }); 
    
}

//exports
module.exports.init=init;