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


//thyrocare call details
var thyrocareUrl;
var thyrocareKey;

//global variables
var headers     = {
                        'User-Agent':'Super Agent/0.0.1',
                        'Content-Type':'application/json'
                }

// function to instantiate
function init(globalEmitter,globalCall,globalDACall,callback,url,key){
    globalEmitter.on(globalCall,setup)
    global=globalEmitter;
    globalDataAccessCall=globalDACall;
    globalCallBackRouter=callback;
    thyrocareKey=key;
    thyrocareUrl=url;
}

function setup(model)
{
    model.once("postOrderService",packageCreator);
}

function packageCreator(model){
    
                var beneficiaryxml="<NewDataSet>"
                    for(var i=0;i<model.data.tags[0].beneficiaryDetails.length;i++){
                            beneficiaryxml+="<Ben_details>"
                            beneficiaryxml+="<Name>"
                            beneficiaryxml+=model.data.tags[0].beneficiaryDetails[i].name
                            beneficiaryxml+="</Name>"
                            beneficiaryxml+="<Age>"
                            beneficiaryxml+=model.data.tags[0].beneficiaryDetails[i].age
                            beneficiaryxml+="</Age>"
                            beneficiaryxml+="<Gender>"
                            beneficiaryxml+=model.data.tags[0].beneficiaryDetails[i].gender
                            beneficiaryxml+="</Gender>"
                            beneficiaryxml+="</Ben_details>"
                    }
                beneficiaryxml+="</NewDataSet>"
    
                model.package={
                            "api_key"       :thyrocareKey,
                            "orderid"       :model.data.leadId,
                            "address"       :model.data.address,
                            "pincode"       :model.data.pincode,
                            "product"       :model.data.product,
                            "mobile"        :model.data.mobile,
                            "email"         :model.data.email,
                            "service_type"  :"H",
                            "order_by"      :model.data.name,
                            "report_code"   :"",
                            "rate"          :model.data.amount,
                            "hc"            :model.data.tags[0].handlingCharges,
                            "appt_date"     :model.data.tags[0].apptDate,
                            "reports"       :model.data.tags[0].hardCopy,
                            "ref_code"      :"9930421623",
                            "pay_type"      :"Postpaid",
                            "bencount"      :model.data.tags[0].noOfPersons,
                            "bendataxml"    :beneficiaryxml
                    }
            
           new postOrderFactory(model);
        }

function postOrderFactory(model){
    new postOrder(model)
}
 
function postOrder(model){
    
    var requestParams     = {
                            url     : thyrocareUrl,
                            method  : 'POST',
                            headers : headers,
                            body    : JSON.stringify(model.package)
                }
    
    request(requestParams, function (error, response, body){
        
        if(body){
                try{
                    body=JSON.parse(body)
                }
                catch(err){
                    model.info=err  
                }
                event.on("callgettingResponseDetails",gettingResponseDetails)
                event.emit("callgettingResponseDetails",model,body)
        }
        else if(response){
                model.info=response;
        }
        else if(error){
                //console.log(error);
                model.info=error;
        }
        else{
                model.info="Error while Posting Order at Thyrocare : Thyrocare API \n"+body;
        }
    model.emit(globalCallBackRouter,model)
    })        
}

function gettingResponseDetails(model,body){
    
    model.thyroDoc=body
    console.log(model.thyroDoc)
    if(model.thyroDoc.ADDRESS&&model.thyroDoc.BOOKED_BY&&model.thyroDoc.EMAIL&&model.thyroDoc.MOBILE){
            model.data.tags[0].status=model.thyroDoc.STATUS          
            model.data.tags[0].thyrocareLeadDetails={};
            for(var i=0;i<model.thyroDoc.ORDERRESPONSE.PostOrderDataResponse.length;i++)
                {
                    model.data.tags[0].thyrocareLeadDetails[model.thyroDoc.ORDERRESPONSE.PostOrderDataResponse[i].LEAD_ID]={
                        name    : model.thyroDoc.ORDERRESPONSE.PostOrderDataResponse[i].NAME,
                        age     : model.thyroDoc.ORDERRESPONSE.PostOrderDataResponse[i].AGE,
                        gender  : model.thyroDoc.ORDERRESPONSE.PostOrderDataResponse[i].GENDER
                    
                }
            }
            //global.emit("updateRepositorySetup",model)
            //model.emit("updateRepository",model)
    }
    else{
        model.info="Thyrocare post order query failed, Response : "+model.thyroDoc.RESPONSE
        //console.log(model.info)
        model.emit(globalCallBackRouter,model)
    }
    
}

//exports
module.exports.init=init;