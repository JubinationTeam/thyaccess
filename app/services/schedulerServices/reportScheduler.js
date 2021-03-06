'use strict'
//node dependencies
var request = require('request');
var eventEmitter = require('events');
var path = require('path');

//user defined dependencies
var ThyrocareLead=require('./../../models/schemas/thyrocareLead.js')
var commonVar=require('./helper/staticVariables.js')


//booking date threshold value
const days=20;

//function specific event instance
class eventClass extends eventEmitter{}
const event = new eventClass()

// event names
var globalDataAccessCall;

// global event emitter
var global;

//global variables
const headers     = {
                        'User-Agent':'Super Agent/0.0.1',
                        'Content-Type':'application/json'
                }

// function to initiate the scheduler and access the local database  
function init(globalEmitter,globalDACall,callback){
    
    globalDataAccessCall=globalDACall
       
    setInterval(function(){
    if(commonVar.getBatchDoneBool()){
        commonVar.setBatchDone()
        
                        var model= new eventClass();
                        model.schema=ThyrocareLead
                        model.dbOpsType="read"
                        model.readLimit=10000000000,
                        model.offset=0,
                        model.data={"reportStatus": false}
                        global=globalEmitter
                        model.callBackFromDataAccess="callBackReportScheduler";
                        model.on(model.callBackFromDataAccess,postDataAccessCallback)
                        global.emit(globalDataAccessCall,model)
                        model.emit(model.dbOpsType,model)

        }
    },7200000)
}
  
//function to create a new model for each document 
function postDataAccessCallback(modelPreLoop){
    
        commonVar.setTotalDocs(modelPreLoop.status.length)
    
        modelPreLoop.status.forEach(function(){});

        for(var i=0;i<modelPreLoop.status.length;i++)
        {
            var model= new eventClass();
            model.on("readDoc",checkValidity);
            model.data=modelPreLoop.status[i]
            model.emit("readDoc",model);
        }
}

//function to check the document's validity against various conditions
function checkValidity(model){
            var apptDate 
            if(!apptDate){
                apptDate=model.data.apptDate.split(" ")[0].toString();
            }
            var bookingDate   = model.data.bookingDate.split(" ")[0].toString();
            var todaysDate    = new Date().toISOString().slice(0,10).toString();
            var bookingThresholdDate = new Date(Date.parse(bookingDate) + days * 86400000 ).toISOString().slice(0,10).toString();
            
            if(!model.data.reportStatus&&todaysDate<bookingThresholdDate&&((todaysDate>bookingDate&&!apptDate)||(todaysDate>apptDate&&apptDate))){
                    makePdfRequestfactory(model);
            }
            else{
                    commonVar.add()
                    commonVar.check()
            }
    
}

//functio to create a new 'makePdfRequest' function for each beneficiary
function makePdfRequestfactory(model){
    new makePdfRequest(model)
}

//function to make a PDF Report link request to Thyrocare Api
function makePdfRequest(model){

model.thyrocareReportUrl="https://www.thyrocare.com/APIs/order.svc/JJ0YYAYwNcmnq2vsbb3X6QF1ae@ZIVmdQA9WF1YThw1)S6eHx@lA1hwota9fIXMT/GETREPORTS/"+model.data.thyrocareLeadId+"/pdf/"+model.data.mobile+"/Myreport"
        
        var requestParams   = {
                                url     : model.thyrocareReportUrl,
                                method  : 'GET',
                                headers : headers
                }
    
        request(requestParams, function (error, response, body){
        
            if(body){
                    
                    try{
                            body=JSON.parse(body);
                            if(!body.error){
                                if(body.URL){
                                    model.thyrocarePdfUrl=body.URL; 
                                    global.emit("awsApiSetup",model)
                                    model.emit("awsService",model)

                                }
                                else{
                                    model.info="REPORT URL NOT PRESENT"
                                    commonVar.add()
                                    commonVar.check()
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
                    model.info=error;
                    commonVar.add()
                    commonVar.check()
                }
            else{
                    model.info="Error while scheduling report : Thyrocare API "
                    commonVar.add()
                    commonVar.check()
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