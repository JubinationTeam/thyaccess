'use strict'

//data access
var genericDataAccess=require('jubi-mongoose-data-access');

//controller
var controllerInit=require('jubi-express-controller').init;

//services
var postOrder=require('./services/realTimeServices/postOrder.js').init;
var getLeadDetails=require('./services/realTimeServices/getLeadDetails.js').init;
var updateRepository=require('./services/realTimeServices/updateRepository.js').init;

//scheduler services
//var reportScheduler=require('./services/schedulerServices/reportScheduler.js').init;
//var updateLocalDb=require('./services/schedulerServices/updateLocalDatabase.js').init;
var awsApi=require('./services/schedulerServices/awsApi.js').init;

//scheduler sub-services
var readGuard=require('./services/schedulerServices/readGuard.js').init;
//var updateGuard=require('./services/schedulerServices/updateGuard.js').init;

//global event emitter
const EventEmitter = require('events');
class GlobalEmitter extends EventEmitter {   }
const globalEmitter = new GlobalEmitter();
globalEmitter.setMaxListeners(3);

//url variables
const postUrlDef='/:type';
const getUrlDef='/:type';

//valid url's
var validRequestEntities={
                            "post":["thyrocareBook/","freshlead/","https://shrouded-everglades-23668.herokuapp.com/"],
                            "get":["GetReport/","GetProducts/"]
                         };

const globalDataAccessCall='dataAccessCall';
const globalCallBackRouter='callbackRouter';

//variables required by controller init function
var routerInitModel={
        'globalEmitter':globalEmitter,
        'postUrlDef':postUrlDef,
        'getUrlDef':getUrlDef,
        'validRequestEntities':validRequestEntities,
        'callbackName':globalCallBackRouter,
        'nextCall':'service'
    };
//variables required by data access init function
var dataAccessInitModel={
        'globalEmitter':globalEmitter,
        'nextCall':'dataAccessCall'
    };

const guardKey="5923f40e07b1c909d06487ad";
const commonAccessUrl="http://localhost:8080/commonAccess/";

const thyrocareUrls={
    postOrder:"https://www.thyrocare.com/APIS/ORDER.svc/Postorderdata"
}
const thyrocareApiKey="JJ0YYAYwNcmnq2vsbb3X6QF1ae@ZIVmdQA9WF1YThw1)S6eHx@lA1hwota9fIXMT";

//instantiating Handler,Service layer and Data Access layer
function init(){
    controllerInit(routerInitModel);
    getLeadDetails(globalEmitter,'thyrocareBook',globalDataAccessCall,globalCallBackRouter,commonAccessUrl,guardKey);
    postOrder(globalEmitter,'postOrder',globalDataAccessCall,globalCallBackRouter,thyrocareUrls.postOrder,thyrocareApiKey);
    updateRepository(globalEmitter,'updateRepositorySetup',globalCallBackRouter,globalDataAccessCall,commonAccessUrl,guardKey);
//    reportScheduler(globalEmitter,globalDataAccessCall,globalDataAccessCall,globalCallBackRouter)
//    updateLocalDb(globalEmitter,'updateLocalDbSetup',globalCallBackRouter,globalDataAccessCall)
    awsApi(globalEmitter,'awsApiSetup',globalDataAccessCall,globalCallBackRouter,commonAccessUrl)
    readGuard(globalEmitter,'readGuardSetUp',globalDataAccessCall,globalCallBackRouter,commonAccessUrl,guardKey)
//    updateGuard(globalEmitter,'updateGuardSetUp',globalDataAccessCall,globalCallBackRouter,commonAccessUrl,guardKey)
    genericDataAccess(dataAccessInitModel);
}

//exports
module.exports.init=init;