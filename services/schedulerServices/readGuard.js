'use strict'

//node dependencies
var request = require('request');
var eventEmitter = require('events');

//function specific event instance
class eventClass extends eventEmitter{}
const event = new eventClass()

// event names
var globalDataAccessCall;
var globalCallBackRouter;

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
function init(globalEmitter,globalCall,globalDACall,callback,url,key){
    globalEmitter.on(globalCall,setup)
    global=globalEmitter;
    globalDataAccessCall=globalDACall;
    globalCallBackRouter=callback;
    commonAccessUrl=url;
    guardKey=key;
}

function setup()
{
    model.once("readGuard",readGuardFactory);
}

function readGuardFactory(model,modelIndex){
    new readGuard(model,modelIndex);
}

function readGuard(model,modelIndex){
    
        var data={
                    "key"   : guardKey,
                    "schema": "Lead",
                    "pageNo":"1",
                    "data"  :{
                                "leadId":model["readDoc"+modelIndex].leadId
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
    
        request(updateRequestParams, function (error, response, body){
                    
                if(body){        
                        body=JSON.parse(body);
                        model["readDoc"+modelIndex].docToUpdate=body._id
                        global.emit("updateGuardSetup")
                        model.emit("updateGuard",model,modelIndex)
                }
                else{
                    console.log("Error while reading guard : Thyrocare API \n");
                }
            
        }); 
}

//exports
module.exports.init=init;