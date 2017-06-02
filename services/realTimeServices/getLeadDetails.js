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

// global event emitter
var global;

//Guard Access Variables
var commonAccessUrl;
var guardKey;

//global variables
const headers     = {
                        'User-Agent':'Super Agent/0.0.1',
                        'Content-Type':'application/json'
                }

// function to instantiate
function init(globalEmitter,globalCall,globalDACall,callback,url,key){
    globalEmitter.on(globalCall,setup)
    global=globalEmitter;
    commonAccessUrl=url;
    guardKey=key;
    globalDataAccessCall=globalDACall;
    globalCallBackRouter=callback;
}

function setup(model)
{
    model.once("service",setupLeadDetailsFactory);
}

function setupLeadDetailsFactory(model){
    new setupLeadDetailsFunction(model);
}

function setupLeadDetailsFunction(model){
    if((model.req.body)&&(model.req.body.leadId))
    {
        
        var leadParams={
                    "mod"       : "guard",
                    "operation" : "read",
                    "data"      : {	
                                    "key"   : guardKey,
                                    "schema": "Lead",
                                    "pageNo": "1",
                                    "data"  : {
                                                "leadId"    :model.req.body.leadId
                                             }
                                }

                };
        var leadDetailsRequestParams     = {
                    url     : commonAccessUrl,
                    method  : 'POST',
                    headers : headers,
                    body    : JSON.stringify(leadParams)
                }
    
        request(leadDetailsRequestParams, function (error, response, body){
                    
                if(body){        
                        body=JSON.parse(body);
                        event.on("callgetLeaDocument",getLeadDocument)
                        event.emit("callgetLeaDocument",model,body)
                }
                else if(response){
                        model.info=response;
                        model.emit(globalCallBackRouter,model)
                }
                else if(error){
                        //console.log(error);
                        model.info=error;
                        model.emit(globalCallBackRouter,model)
                }
                else{
                    model.info="Error while fetching Lead Details : Thyrocare API \n"+body;
                    model.emit(globalCallBackRouter,model)
                }
            
        }); 
    }
    
    else{
        model.info="Body or LeadId not present while fetching Lead Details : Thyrocare API"
        respondOnInvalidData(model)
    }
    
}

function getLeadDocument(model,body){
    
    model.data=body.data[0]
    
     validateBenificiaryDetails(model)
    
    if(     model.data.leadId 
        &&  model.data.name 
        &&  model.data.mobile 
        &&  model.data.address
        &&  model.data.pincode
        &&  model.data.email 
        &&  model.data.amount
        &&  model.data.product
        &&  model.data.modeOfPayment
        &&  model.data.tags[0].hardCopy
        &&  model.data.tags[0].handlingCharges
        &&  model.data.tags[0].noOfPersons
        &&  model.data.tags[0].beneficiaryDetails
        &&  (model.data.tags[0].noOfPersons==model.data.tags[0].beneficiaryDetails.length)
        &&  model.validity
       
        ){
    
            model.documentToUpdateId=model.data._id
            global.emit("postOrder",model)
            model.emit("postOrderService",model)
    }
    
    else{
        model.info="Incomplete Data"
        respondOnInvalidData(model)
    }
    
}

function respondOnInvalidData(model){
    model.emit(globalCallBackRouter,model)
}

function validateBenificiaryDetails(model){
    model.validity=true;
    for(var i=0;i<model.data.tags[0].beneficiaryDetails.length;i++){
        if(model.data.tags[0].beneficiaryDetails[i].name
            &&model.data.tags[0].beneficiaryDetails[i].age
            &&model.data.tags[0].beneficiaryDetails[i].gender)
            {
                 model.validity=true
            }
        else{
                model.validity=false
        }
    }
 }

//exports
module.exports.init=init;