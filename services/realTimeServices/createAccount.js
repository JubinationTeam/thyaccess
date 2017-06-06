'use strict'

//node dependencies
var request = require('request');
var eventEmitter = require('events');

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
function init(globalEmitter,globalCall,callback,url){
    globalEmitter.on(globalCall,setup)
    global=globalEmitter;
    commonAccessUrl=url;
    globalCallBackRouter=callback;
}

function setup(model)
{
    model.once("createAccountService",createAccountFactory);
}

function createAccountFactory(model){
    new createAccount(model)
}

function createAccount(model){
    var createAccountSetup={
                        "mod"       : "userAccount",
                        "data"      : {	
                                        
                                        "operation" : "createAccount",        
                                        "data":model.data    
                                        
                                    } 
                    };
    
    var createAccountRequestParams     = {
                            url     : commonAccessUrl,
                            method  : 'POST',
                            headers : headers,
                            body    : JSON.stringify(createAccountSetup)
                    }
    request(createAccountRequestParams, function (error, response, body){
        
        if(body){
                body=JSON.parse(body);
                    
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
                model.info="Error while creating User Account : Thyrocare API \n"+body;
                model.emit(globalCallBackRouter,model)
        }
    }) 

}

//exports
module.exports.init=init;