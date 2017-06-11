'use strict'

//node dependencies

var thyrocareLead=require('./../../models/schemas/thyrocareLead.js')

// event names
var globalDataAccessCall;
var globalCallBackRouter;

// global event emitter
var global;

// function to instantiate
function init(globalEmitter,globalCall,callback,globalDACall){   
    globalEmitter.on(globalCall,setup)
    global=globalEmitter;
    globalDataAccessCall=globalDACall;
    globalCallBackRouter=callback;
}

//function to setup model's event listener
function setup(model){
    model.once("updateLocalDatabase",updateLocalDatabase);
}

//function to update the local database's 'ThyrocareLead' schema
function updateLocalDatabase(model){
    model.schema=thyrocareLead
    model.dbOpsType="update"
    model.id=model.data._id
    model.data={"reportStatus":true};
    global.emit(globalDataAccessCall,model)
    model.emit(model.dbOpsType,model)
}

//function to call the router
function callHandler(model){
    model.info=model.status;
    model.emit(globalCallBackRouter,model)
}

//exports
module.exports.init=init;