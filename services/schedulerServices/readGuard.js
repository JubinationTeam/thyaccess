'use strict'

//node dependencies
var request = require('request');
var path = require('path');

//user defined dependencies
var commonVar=require('./helper/staticVariables.js')

//Guard Access Variables
var commonAccessUrl;
var guardKey;

// global event emitter
var global;

//global variables
const headers     = {
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
    model.once("readGuard",readGuardFactory);
}

//function to create new 'readGuard' function for each model
function readGuardFactory(model){
    new readGuard(model);
}

//function to read the Guard module's 'Lead' schema
function readGuard(model,modelIndex){
    
        var data={
                    "key"   : guardKey,
                    "schema": "Lead",
                    "pageNo":"1",
                    "data"  :{
                                "leadId":model.data.leadId
                    }
        }
                      
        var readParams={
                            "mod"       : "guard",
                            "operation" : "read",
                            "data"      : data
                };
    
        var readRequestParams     = {
                    url     : commonAccessUrl,
                    method  : 'POST',
                    headers : headers,
                    body    : JSON.stringify(readParams)
                }
    
        request(readRequestParams, function (error, response, body){
                    
                if(body){       
                        try{
                            body=JSON.parse(body);
                            model.docToUpdateInLead=body.data[0]._id
                        
                            model.newTags=body.data[0].tags[0]

                            model.newTags.thyrocareLeadDetails[model.data.thyrocareLeadId].s3Link=model.data.s3Link
                            model.newTags.thyrocareLeadDetails[model.data.thyrocareLeadId].reportStatus=true
                            global.emit("updateGuardSetUp",model)
                            model.emit("updateGuard",model)
                        }
                        catch(err){
                            commonVar.add()
                            commonVar.check()
                            model.info=err
                        }
                }
                else if(error){
                    commonVar.add()
                    commonVar.check()
                    model.info=error
                    }
                else{
                    commonVar.add()
                    commonVar.check()
                    model.info="Error while reading guard : Thyrocare API \n"
                }
            
        }); 
    
    if(model.info){
        model.fileName=path.basename(__filename)
        global.emit("errorLogsSetup",model)
        model.emit("errorLogs",model)
    }
}

//exports
module.exports.init=init;