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
var guardKey;

//global variables
var headers     = {
                        'User-Agent':'Super Agent/0.0.1',
                        'Content-Type':'application/json'
                }

// function to instantiate
function init(globalEmitter,globalCall,callback,globalDACall,url,key){
    globalEmitter.on(globalCall,setup)
    global=globalEmitter;
    globalDataAccessCall=globalDACall;
    guardKey=key;
    commonAccessUrl=url;
    globalCallBackRouter=callback;
}

function setup(model)
{
    model.once("healthCheckup",createHealthCheckupDocFactory);
}

function createHealthCheckupDocFactory(model){
    new createHealthCheckupDoc(model)
}         
      
function createHealthCheckupDoc(model){
     
    var commonAccessDetails={
                        "mod"       : "guard",
                        "operation" : "create",
                        "data"      : {	
                                        "key"   : guardKey,
                                        "schema": "HealthCheckup",
                                        "data"  : {
                                                    "mobile": model.data.mobile,
                                                    "healthCheckupId": model.data.leadId,
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
                    console.log(err)
                    model.info=err
                }
               
        }
        else if(response){
                model.info=response;
                model.emit(globalCallBackRouter,model)
        }
        else if(error){
                //console.logg(error);
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