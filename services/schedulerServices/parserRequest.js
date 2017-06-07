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
    globalEmitter.on(globalCall,parserRequestSetup)
    global=globalEmitter;
    globalDataAccessCall=globalDACall;
    globalCallBackRouter=callback;
    commonAccessUrl=url;
}

function parserRequestSetup(model)
{
    model.once("parserRequest",parserRequestFactory);
}

function parserRequestFactory(model){
    new parserRequest(model);
}

function parserRequest(model){

    var parserRequestBody={
                        "mod"       : "parser",
                        "data"      : {
                                        "mobile":model.data.mobile,
                                        "thyrocareLeadId":model.data.thyrocareLeadId,
                                        "pdfUrl":model.thyrocarePdfUrl,
                                        "xmlUrl":model.thyrocareXmlUrl
                        }
                    };
    
    var parserRequestParams     = {
                            url     : commonAccessUrl,
                            method  : 'POST',
                            headers : headers,
                            body    : JSON.stringify(parserRequestBody)
                    }
    
        request(parserRequestParams, function (error, response, body){

                if(body){
                            try{
                                body=JSON.parse(body);
                            }
                            catch(err){
                                console.log(err)
                                model.info=err
                            }
                            if(!body.error){
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
                    }
                else if(error){
                            model.info=error;
                    }
                else{
                            model.info="Error while requesting XML Url : Thyrocare API \n"+body;
                }
            model.emit(globalCallBackRouter,model)
    })  
}

//exports
module.exports.init=init;