'use strict'

//user defined dependencies
var ThyrocareLead=require('./../../models/schemas/thyrocareLead.js')
var commonVar=require('./helper/staticVariables.js')

//node dependencies
var request = require('request');
var eventEmitter = require('events');

//schema instance
var ThyrocareLead=require('./../../models/schemas/thyrocareLead.js')

//booking date threshold value
const days=20;

//function specific event instance
class eventClass extends eventEmitter{}
const event = new eventClass()

// event names
var globalDataAccessCall;
var globalCallBackRouter;

// global event emitter
var global;

//global variables
const headers     = {
                        'User-Agent':'Super Agent/0.0.1',
                        'Content-Type':'application/json'
                }

// function to instantiate
function init(globalEmitter,globalCall,globalDACall,callback){
    
    globalDataAccessCall=globalCall
    
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
    },1000)
}

function postDataAccessCallback(modelPreLoop){
    
        commonVar.setTotalDocs(modelPreLoop.status.length)
        console.log("Total Documents:"+commonVar.totalDocs)
    
        modelPreLoop.status.forEach(function(){});

        for(var i=0;i<modelPreLoop.status.length;i++)
        {
            var model= new eventClass();
            model.on("readDoc",looping);
            model.data=modelPreLoop.status[i]
            model.emit("readDoc",model);
        }
}

function looping(model){
            var apptDate 
            if(!apptDate){
                apptDate=model.data.apptDate.split(" ")[0].toString();
            }
            var bookingDate   = model.data.bookingDate.split(" ")[0].toString();
            var todaysDate    = new Date().toISOString().slice(0,10).toString();
            var bookingThresholdDate = new Date(Date.parse(bookingDate) + days * 86400000 ).toISOString().slice(0,10).toString();
            
            if(!model.data.reportStatus&&todaysDate<bookingThresholdDate&&((todaysDate>bookingDate&&!apptDate)||(todaysDate>apptDate&&apptDate))){
                    makeRequestfactory(model);
            }
            else{
                    commonVar.add()
                    commonVar.check()
            }
    
}

function makeRequestfactory(model){
    new makeRequest(model)
}

function makeRequest(model){
    
    var mobile=model.data.mobile;
    var leadId=model.data.thythyrocareLeadId
    
    var thyrocareReportUrl="https://www.thyrocare.com/APIs/order.svc/JJ0YYAYwNcmnq2vsbb3X6QF1ae@ZIVmdQA9WF1YThw1)S6eHx@lA1hwota9fIXMT/GETREPORTS/"+leadId+"/pdf/"+mobile+"/Myreport"
        
        var requestParams   = {
                                url     : thyrocareReportUrl,
                                method  : 'GET',
                                headers : headers
                }
    
        request(requestParams, function (error, response, body){
        
            if(body){
                    
                    body=JSON.parse(body);
                    if(body.URL)
                        {
                            
                            console.log("REPORT URL PRESENT")
                            model.data.thyrocareUrl=body.URL; 
                            global.emit("awsApiSetup",model)
                            model.emit("awsService",model)
                            
//                            model.emit("readGuard",model)
                            
//                            global.emit("updateLocalDbSetup")
//                            model.emit("updateLocalDatabase",model)
                            
//                            localDatabaseUpdate(model)
                        }
                    else{
                            console.log("REPORT URL NOT PRESENT")
                        
                            commonVar.push(model.data)
                            commonVar.add()
                            commonVar.check()
                            
                    }
                    
           }
            else{
                    commonVar.push(model.data)
                    commonVar.add()
                    commonVar.check()
                    
                    console.log("Error while scheduling report : Thyrocare API ");
            }
    })
}

function localDatabaseUpdate(model){

    model.schema=ThyrocareLead
    model.dbOpsType="read"
    model.data={
        "thyrocareLeadId":model.data.thyrocareLeadId
    }

    model.callBackFromDataAccess="localDbRead"
    model.on(model.callBackFromDataAccess,(model)=>{

        model.callBackFromDataAccess="localDbUpdated"
        model.on(model.callBackFromDataAccess,(model)=>{model.emit(globalCallBackRouter,model);
                                                  console.log(model.status)})
        model.schema=ThyrocareLead
        model.dbOpsType="update"
        model.id=model.status[0]._id
        model.data={
                        "reportStatus":true
        }
        global.emit(globalDataAccessCall,model)
        model.emit(model.dbOpsType,model)

    })

    global.emit(globalDataAccessCall,model)
    model.emit(model.dbOpsType,model)

}

//exports
module.exports.init=init;