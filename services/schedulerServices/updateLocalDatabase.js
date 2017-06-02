'use strict'

//node dependencies

var Lead=require('./../../models/schemas/lead.js')

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

function setup(){
    model.once("updateLocalDatabase",updateLocalDatabase);
}


function updateLocalDatabase(model,modelIndex,beneficiaryIndex){
    model["readDoc"+modelIndex].tags[0].thyrocareLeadDetails[beneficiaryIndex].reportStatus="true";
    model.dbOpsType="update"
    model.id=model["readDoc"+modelIndex]._id
    model.data={
            
            "tags":model["readDoc"+modelIndex].tags            
    }
    model.callBackFromDataAccess="callBackUpdateLocalDb"
    global.emit(globalDataAccessCall,model)
    model.emit(model.dbOpsType,model)
    model.on("callBackUpdateLocalDb",callHandler)

}

function callHandler(model){
    model.info=model.status;
    model.emit(globalCallBackRouter,model)
}



//exports
module.exports.init=init;