'use strict'

//node dependencies
var request = require('request');
var path = require('path');

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
    globalEmitter.on(globalCall,parserRequestSetup)
    commonAccessUrl=url;
}

//function to setup model's event listener
function parserRequestSetup(model)
{
    model.once("parserRequest",parserRequestFactory);
}


//function to create new 'parserRequest' function for each model
function parserRequestFactory(model){
    new parserRequest(model);
}

//function to make a request to the Parser Api
function parserRequest(model){

    var parserRequestBody={
                        "mod"       : "parser",
                        "data"      : {
                                        "mobile":model.dataBackup.mobile,
                                        "thyrocareLeadId":model.dataBackup.thyrocareLeadId,
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
                                body=JSON.parse(body)
                                if(!body.error){
                                    model.dataBackup.testReport=body
                                    global.emit("healthCheckupSetup",model)
                                    model.emit("healthCheckup",model)
                                }
                                else{
                                    model.info="Parser details not present"
                                }
                            }
                            catch(err){
                                model.info=err
                            }
                            
                    }                                               
                else if(error){
                            model.info=error;
                    }
                else{
                            model.info="Error while quering Parser Api : Thyrocare API \n"+body;
                }

                if(model.info){
                    model.fileName=path.basename(__filename)
                    global.emit("errorLogsSetup",model)
                    model.emit("errorLogs",model)
                }
    }) 
    
    
}

//exports
module.exports.init=init;