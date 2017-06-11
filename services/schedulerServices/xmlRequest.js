'use strict'

//node dependencies
var request = require('request');

//user defined dependencies
var commonVar=require('./helper/staticVariables.js')

// event names
var globalCallBackRouter;

// global event emitter
var global;

//global variables
const headers     = {
                        'User-Agent':'Super Agent/0.0.1',
                        'Content-Type':'application/json'
                }

// function to instantiate
function init(globalEmitter,globalCall,callback){
    global=globalEmitter;
    globalEmitter.on(globalCall,xmlRequestSetup)
    globalCallBackRouter=callback;
}

//function to setup model's event listener
function xmlRequestSetup(model)
{
    model.once("xmlRequestService",xmlRequestFactory);
}

//function to create new 'xmlRequest' function for each model
function xmlRequestFactory(model){
    new xmlRequest(model);
}

//function to make an XML Report link request to Thyrocare Api
function xmlRequest(model){
      model.thyrocareReportUrl="https://www.thyrocare.com/APIs/order.svc/JJ0YYAYwNcmnq2vsbb3X6QF1ae@ZIVmdQA9WF1YThw1)S6eHx@lA1hwota9fIXMT/GETREPORTS/"+model.data.thyrocareLeadId+"/xml/"+model.data.mobile+"/Myreport"
        
        var xmlRequestParams   = {
                                url     : model.thyrocareReportUrl,
                                method  : 'GET',
                                headers : headers
                }
    
        request(xmlRequestParams, function (error, response, body){
            
                if(body){
                            try{
                            body=JSON.parse(body);
                            }
                            catch(err){
                                model.info=err
                                console.log(err)
                            }
                            if(body.URL){
                                console.log("XML REPORT URL PRESENT")
                                model.thyrocareXmlUrl=body.URL; 

                                global.emit("parserRequestSetup",model)
                                model.emit("parserRequest",model)
      
                            }
                            else{
                                console.log("XML REPORT URL NOT PRESENT")
                                model.info="XML REPORT URL NOT PRESENT"
                                model.emit(globalCallBackRouter,model)
                            }
                    }
                else if(response){
                            model.info=response;
                            model.emit(globalCallBackRouter,model)
                    }
                else if(error){
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