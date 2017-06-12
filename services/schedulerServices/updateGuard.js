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
    model.once("updateGuard",updateGuardFactory);
}

//function to create new 'updateGuard' function for each model
function updateGuardFactory(model){
    new updateGuard(model);
}

//function to update the Guard module's 'Lead' schema
function updateGuard(model){
        
        var updateParams={
                            "mod"       : "guard",
                            "operation" : "update",
                            "data"      : {
                                            "key"   : guardKey,
                                            "schema": "Lead",
                                            "id"    :model.docToUpdateInLead,
                                            "data"  :{
                                                        "tags":[model.newTags]
                                            }
                                }
                };
    
        var updateRequestParams     = {
                    url     : commonAccessUrl,
                    method  : 'POST',
                    headers : headers,
                    body    : JSON.stringify(updateParams)
                }
    
        request(updateRequestParams, function (error, response, body){
     
              if(body){       
                        try{
                            body=JSON.parse(body);
                            model.body=body
                            global.emit("userAccountSetup",model)
                            model.emit("userAccountService",model)
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
                    model.info="Error while updating guard : Thyrocare API \n"
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