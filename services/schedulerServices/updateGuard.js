 'use strict'

//node dependencies
var request = require('request');

// event names
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
function init(globalEmitter,globalCall,callback,url,key){
    global=globalEmitter;
    globalEmitter.on(globalCall,setup)
    globalCallBackRouter=callback;
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
                  
                        console.log("IM IN UPDATE GUARD::::::::")
                        try{
                            body=JSON.parse(body);
                            model.info=body
                        }
                        catch(err){
                            model.info=err
                            model.emit(globalCallBackRouter,model)
                        }
//                        global.emit("userAccountSetup",model)
//                        model.emit("userAccountService",model)
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