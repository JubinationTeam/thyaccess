'use strict'

//node dependencies
var request = require('request');
var eventEmitter = require('events');

//schema instance
var ThyrocareLead=require('./../../models/schemas/thyrocareLead.js')

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
    model.once("updateRepository",updateFactory);
}

function updateFactory(model){
    new update(model)
}     
                                                                      
function update(model){  
    var updateProperty={
                        "mod"       : "guard",
                        "operation" : "update",
                        "data"      : {	
                                        "key"   : guardKey,
                                        "schema": "Lead",
                                        "id"    : model.documentToUpdateId,
                                        "data"  : {
                                                        "tags"  : model.data.tags     
                                                 }
                                    } 
                    };  
    
    var updateRequestParams     = {
                            url     : commonAccessUrl,
                            method  : 'POST',
                            headers : headers,
                            body    : JSON.stringify(updateProperty)
                    }
    request(updateRequestParams, function (error, response, body){
        
        if(body){
                try{
                    body=JSON.parse(body);
                }
                catch(err){
                    model.info=err
                }
                model.leadData=model.data;
                global.emit("createAccountSetup",model)
                model.emit("createAccountService",model)
                model.beneficiaryIndex=0
                saveReportDetails(model);
                    
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
                model.info="Error while updating lead details : Thyrocare API \n"+body;
                model.emit(globalCallBackRouter,model)
        }
        
    }) 

}


function saveReportDetails(model){
    
    if(model.beneficiaryIndex==0){
        var apptDate=model.data.tags[0].apptDate
        var bookingDate=model.data.tags[0].bookingDate
        var leadId=model.data.leadId
        var mobile=model.data.mobile;
        var thyrocareLeadId=model.thyroDoc.ORDERRESPONSE.PostOrderDataResponse[model.beneficiaryIndex].LEAD_ID;
        model.data={};
        model.thyrocareLeadDetails=thyrocareLeadDetails;
        model.data.mobile=mobile;
        model.data.leadId=leadId;
        model.data.bookingDate=bookingDate;
        model.data.apptDate=apptDate;
        model.data.reportStatus=false;
    }
    if(model.beneficiaryIndex<model.thyroDoc.ORDERRESPONSE.PostOrderDataResponse.length){
        model.data.thyrocareLeadId=model.thyroDoc.ORDERRESPONSE.PostOrderDataResponse[model.beneficiaryIndex].LEAD_ID;
        model.schema=ThyrocareLead
        model.dbOpsType="create"
        model.beneficiaryIndex++;
        model.callBackFromDataAccess="callBackLeadGeneration"+model.beneficiaryIndex;
        model.on(model.callBackFromDataAccess,saveReportDetails)
        global.emit(globalDataAccessCall,model)
        model.emit(model.dbOpsType,model)   
    }
    else{
        model.status=model.leadData;
        callHandler(model);
    }
}

function callHandler(model){
    model.info=model.status;
    model.emit(globalCallBackRouter,model)
}



//exports
module.exports.init=init;