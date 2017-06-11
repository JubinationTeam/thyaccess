'use strict'

//node dependencies
var request = require('request');

// event names
var globalCallBackRouter;

// global event emitter
var global;

//Guard Access Variables
var commonAccessUrl;
var guardKey;

//global variables
var headers     = {
                        'User-Agent':'Super Agent/0.0.1',
                        'Content-Type':'application/json'
                }

// function to instantiate
function init(globalEmitter,globalCall,callback,url,key){
    global=globalEmitter;
    globalEmitter.on(globalCall,setup)
    globalCallBackRouter=callback;
    commonAccessUrl=url;
    guardKey=key;
}

//function to setup model's event listener
function setup(model)
{
    model.once("healthCheckup",createHealthCheckupDocFactory);
}

//function to create new 'createHealthCheckupDoc' function for each model
function createHealthCheckupDocFactory(model){
    new createHealthCheckupDoc(model)
}         

//function to create a new document in the Guard module's 'HealthCheckup' schema
function createHealthCheckupDoc(model){
     
    var commonAccessDetails={
                        "mod"       : "guard",
                        "operation" : "create",
                        "data"      : {	
                                        "key"   : guardKey,
                                        "schema": "HealthCheckup",
                                        "data"  : {
                                                    "mobile": model.data.mobile,
                                                    "healthCheckupId": model.data.thyrocareLeadId,
                                                    reportViewed: 0,
                                                    reportDownloaded: 0,
                                                    vendorId: "thyrocare",
                                                    reportUrl: model.data.s3link,
                                                    report: model.data.testReport,
                                                    tags: []
                                                        
                                                 }
                                    } 
                    };
               
    var requestParams     = {
                            url     : commonAccessUrl,
                            method  : 'POST',
                            headers : headers,
                            body    : JSON.stringify(commonAccessDetails)
                    }
    
    request(requestParams, function (error, response, body){
        
        if(body){
                try{
                    body=JSON.parse(body);
                }
                catch(err){
                    model.info=err
                    model.emit(globalCallBackRouter,model)
                }
                    console.log("HealthChechup Document created successfully")
                   
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
                console.log("Error while updating lead details : Thyrocare API \n"+body)
                model.info="Error while updating lead details : Thyrocare API \n"+body;
                model.emit(globalCallBackRouter,model)
        }
    
    }) 

}

//exports
module.exports.init=init;