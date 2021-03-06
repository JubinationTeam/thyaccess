'use strict'

//node dependencies
var request = require('request');
var path = require('path');

//user defined dependencies
var commonVar=require('./helper/staticVariables.js')

// global event emitter
var global;

//common access variable
var commonAccessUrl;

//global variables
const headers     = {
                        'User-Agent':'Super Agent/0.0.1',
                        'Content-Type':'application/json'
                }

// function to instantiate
function init(globalEmitter,globalCall,url){
    global=globalEmitter;
    globalEmitter.on(globalCall,setup)
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
                            
                            if(!body.error){
                                 if(body.link){

                                    model.data.s3Link=body.link
                                    model.aws=true;

                                    global.emit("readGuardSetUp",model)
                                    model.emit("readGuard",model)

                                    model.dataBackup=model.data

                                    global.emit("xmlRequestSetup",model)
                                    model.emit("xmlRequestService",model)
                                }  
                                else{
                                    commonVar.add()
                                    commonVar.check()
                                    model.info="Error while querying. Link from AWS Api not present : Thyrocare API \n";
                                }
                            }
                            else{
                                commonVar.add()
                                commonVar.check()
                                model.info=body.error
                            }
                        }
                        catch(err){               
                            commonVar.add()
                            commonVar.check()
                            model.info=err
                        }    
                       
                }
                else if(error){
                        commonVar.add()      
                        commonVar.check()
                        model.info=error;
                    }
                else{
                        commonVar.add()
                        commonVar.check()
                        model.info="Error while querying AWS API : Thyrocare API \n";
                        }
                if(model.info){
                        model.fileName=path.basename(__filename)
                        global.emit("errorLogsSetup",model)
                        model.emit("errorLogs",model)
                    }
            
        });    
      
    
}

//exports
module.exports.init=init;