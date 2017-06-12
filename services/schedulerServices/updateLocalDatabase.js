'use strict'

//user-defined dependencies
var thyrocareLead=require('./../../models/schemas/thyrocareLead.js')
var commonVar=require('./helper/staticVariables.js')

// event names
var globalDataAccessCall;

// global event emitter
var global;

// function to instantiate
function init(globalEmitter,globalCall,globalDACall){   
    global=globalEmitter;
    globalEmitter.on(globalCall,setup)
    globalDataAccessCall=globalDACall;
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
    commonVar.add()
    commonVar.check()
}

//exports
module.exports.init=init;