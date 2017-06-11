'use strict'

//node dependencies
var request = require('request');
var eventEmitter = require('events');

// event names
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

//function to setup model's event listener
function setup(model)
{
    model.once("userAccountService",userAccountFactory);
}

//function to create new 'userAccount' function for each model
function userAccountFactory(model){
    new userAccount(model)
}           

//function to call the 'User Account' Api
function userAccount(model){
    console.log("IM IN USER ACCOUNT:::::::")
    
    var userAccountSetup={
                        "mod"       : "userAccount",
                        "data"      : model.info
                    };
    
    var userAccountRequestParams     = {  
                            url     : commonAccessUrl,
                            method  : 'POST',
                            headers : headers,
                            body    : JSON.stringify(userAccountSetup)
                    }
    request(userAccountRequestParams, function (error, response, body){
                                                                                       
        if(body){      
                try{
                    body=JSON.parse(body);
                }
                catch(err){
                    console.log(body)               
                    console.log(err)      
                    model.info=err
                    console.log("ERR IN Thyrocare APi User acc")
                    model.emit(globalCallBackRouter,model)
                }
                global.emit("updateLocalDatabaseSetup",model)
                model.emit("updateLocalDatabase",model)
                                       
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
                model.info="Error while accessing User Account Service : Thyrocare API \n"+body;
                model.emit(globalCallBackRouter,model)
        }
    }) 

}

//exports
module.exports.init=init;