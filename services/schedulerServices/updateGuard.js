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
    model.once("updateGuard",updateGuardFactory);
}

function updateGuardFactory(model,modelIndex){
    new updateGuard(model,modelIndex);
}

function updateGuard(model,modelIndex){
        
        var updateParams={
                            "mod"       : "guard",
                            "operation" : "update",
                            "data"      : {
                                            "key"   : guardKey,
                                            "schema": "Lead",
                                            "id"    :model["readDoc"+modelIndex].docToUpdate,
                                            "data"  :{
                                                        "tags":model["readDoc"+modelIndex].tags
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
                 
                if(!body){
                    console.log("Error while updating guard : Thyrocare API \n");
                }
            
        }); 
    
}

//exports
module.exports.init=init;