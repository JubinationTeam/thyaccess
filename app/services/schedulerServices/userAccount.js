'use strict'

//node dependencies
var request = require('request');
var eventEmitter = require('events');
var path = require('path');

//user defined dependencies
var commonVar=require('./helper/staticVariables.js')

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
function init(globalEmitter,globalCall,url){
    global=globalEmitter;
    globalEmitter.on(globalCall,setup)
    commonAccessUrl=url;
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
    
    var userAccountSetup={
                        "mod"       : "userAccount",
                        "data"      : model.body
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
                    if(!body.error){      
                        global.emit("updateLocalDatabaseSetup",model)
                        model.emit("updateLocalDatabase",model)
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
                commonVar.add()
                commonVar.check()
                model.info=error;
        }
        else{
                commonVar.add()
                commonVar.check()
                model.info="Error while accessing User Account Service : Thyrocare API \n"+body;
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