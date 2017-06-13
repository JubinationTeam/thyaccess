'use strict'

//node dependencies
var request = require('request');
var path = require('path');

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
function init(globalEmitter,globalCall,url,key){
    global=globalEmitter;
    globalEmitter.on(globalCall,setup)
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
                                                    "mobile": model.dataBackup.mobile,
                                                    "healthCheckupId": model.dataBackup.thyrocareLeadId,
                                                    "reportViewed": 0,
                                                    "reportDownloaded": 0,
                                                    "vendorId": "thyrocare",
                                                    "reportUrl": model.dataBackup.s3link,
                                                    "report": model.dataBackup.testReport,
                                                    "tags": []
                                                        
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
                body=JSON.parse(body)     
            }
            catch(err){
                model.info=err
            }
        } 
        else if(error){
            model.info=error;
        }
        else{
            model.info="Error while creating Health Checkup Document : Thyrocare API \n"+body;
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