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

//    model.data.tags[0].vendorId="thyrocare";
//    model.data.tags[0].leadId=model.data.leadId;
function setup(model)
{
    model.once("updateGuard",updateGuardFactory);
}

function updateGuardFactory(model){
    new updateGuard(model);
}

function updateGuard(model){
    
      
    console.log("IM IN UPDATE GUARD")
        
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
                            model.info=body
                        }
                        catch(err){
                            model.info=err
                        }
                        global.emit("userAccountSetup",model)
                        model.emit("userAccountService",model)
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
                    model.info="Error while updating guard : Thyrocare API \n"
                    console.log("Error while updating guard : Thyrocare API \n");
                    model.emit(globalCallBackRouter,model)
                }
        }); 
    
}

//exports
module.exports.init=init;