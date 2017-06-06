'use strict'

//node dependencies
var request = require('request');

// event names
var globalDataAccessCall;
var globalCallBackRouter;

// global event emitter
var global;

//Guard Access Variables
var commonAccessUrl;

//global variables
const headers     = {
                        'User-Agent':'Super Agent/0.0.1',
                        'Content-Type':'application/json'
                }

// function to instantiate
function init(globalEmitter,globalCall,globalDACall,callback,url){
    globalEmitter.on(globalCall,xmlRequestSetup)
    global=globalEmitter;
    globalDataAccessCall=globalDACall;
    globalCallBackRouter=callback;
    commonAccessUrl=url;
}

function xmlRequestSetup(model)
{
    model.once("parserRequest",xmlRequestFactory);
}

function xmlRequestFactory(model){
    new xmlRequest(model);
}

function xmlRequest(model){
    
         var createAccountSetup={
                        "mod"       : "parser",
                        "data"      :model.data
                    };
    
    var createAccountRequestParams     = {
                            url     : commonAccessUrl,
                            method  : 'POST',
                            headers : headers,
                            body    : JSON.stringify(createAccountSetup)
                    }
    
        request(xmlRequestParams, function (error, response, body){
                    
                if(body){
                            body=JSON.parse(body);
                            if(body.URL){
                            console.log("PARSER DETAILS PRESENT")
                            model.data.testReport=body
                            global.emit("healthCheckupSetup",model)
                            model.emit("healthCheckup",model)
                            }
                            else{
                                    console.log("PARSER DETAILS NOT PRESENT")
                                 
                            }
                    }
                else if(response){
                            model.info=response;
                            model.emit(globalCallBackRouter,model)
                    }
                else if(error){
                            //console.log(error);
                            model.info=error;
                            model.emit(globalCallBackRouter,model)
                    }
                else{
                            model.info="Error while requesting XML Url : Thyrocare API \n"+body;
                            model.emit(globalCallBackRouter,model)
                }
    })  
}

//exports
module.exports.init=init;