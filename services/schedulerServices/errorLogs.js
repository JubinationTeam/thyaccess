'use strict'

//user-defined dependencies
var errorLogs=require('./../../models/schemas/errorLogs.js')

// event names
var globalDataAccessCall;

// global event emitter
var global;

// function to instantiate
function init(globalEmitter,globalCall,globalDACall){   
    globalEmitter.on(globalCall,setup)
    global=globalEmitter;
    globalDataAccessCall=globalDACall;
}

//function to setup model's event listener
function setup(model){
    model.once("errorLogs",createLog);
}

//function to log the errors occured during scheduler services
function createLog(model){
    
    model.schema=errorLogs
    model.dbOpsType="create"
    model.data={
        "errorDetails":model.info,
        "fileName": model.fileName,
        "thyrocareLeadId": model.data.thyrocareLeadId,
        "time": new Date().toISOString().slice(0,10).toString()
    };
    global.emit(globalDataAccessCall,model)
    model.emit(model.dbOpsType,model)
    
}

//exports
module.exports.init=init;