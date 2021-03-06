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
var reportScheduler=require('./services/schedulerServices/reportScheduler.js').init;
var updateLocalDatabase=require('./services/schedulerServices/updateLocalDatabase.js').init;
var awsApi=require('./services/schedulerServices/awsApi.js').init;
var xmlRequest=require('./services/schedulerServices/xmlRequest.js').init;
var parserRequest=require('./services/schedulerServices/parserRequest.js').init;
var healthCheckup=require('./services/schedulerServices/healthCheckup.js').init;
var userAccount=require('./services/schedulerServices/userAccount.js').init;
var errorLogs=require('./services/schedulerServices/errorLogs.js').init;

//scheduler sub-services
var readGuard=require('./services/schedulerServices/readGuard.js').init;
var updateGuard=require('./services/schedulerServices/updateGuard.js').init;

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
                            "post":["thyrocareBook/","freshlead/"],
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
const commonAccessUrl="https://ancient-shore-46511.herokuapp.com/commonAccess/";
//const commonAccessUrl="https://ancient-shore-46511.herokuapp.com/commonAccess"

const thyrocareUrls={
    postOrder:"https://www.thyrocare.com/APIS/ORDER.svc/Postorderdata"
//    postOrder:"https://www.thyrocare.com/API_BETA/ORDER.svc/Postorderdata"
}
const thyrocareApiKey="JJ0YYAYwNcmnq2vsbb3X6QF1ae@ZIVmdQA9WF1YThw1)S6eHx@lA1hwota9fIXMT";

//instantiating Handler,Service layer and Data Access layer
function init(){
                        
    controllerInit(routerInitModel);
    
    //real-time services
    getLeadDetails(globalEmitter,'thyrocareBook',globalCallBackRouter,commonAccessUrl,guardKey);
    postOrder(globalEmitter,'postOrder',globalCallBackRouter,thyrocareUrls.postOrder,thyrocareApiKey);
    updateRepository(globalEmitter,'updateRepositorySetup',globalCallBackRouter,globalDataAccessCall,commonAccessUrl,guardKey);
    
    //scheduler services
    userAccount(globalEmitter,'userAccountSetup',commonAccessUrl);
    updateLocalDatabase(globalEmitter,'updateLocalDatabaseSetup',globalDataAccessCall)
    awsApi(globalEmitter,'awsApiSetup',commonAccessUrl)
    reportScheduler(globalEmitter,globalDataAccessCall,globalCallBackRouter)
    xmlRequest(globalEmitter,'xmlRequestSetup')
    parserRequest(globalEmitter,'parserRequestSetup',commonAccessUrl)
    healthCheckup(globalEmitter,'healthCheckupSetup',commonAccessUrl,guardKey)
    readGuard(globalEmitter,'readGuardSetUp',commonAccessUrl,guardKey)
    updateGuard(globalEmitter,'updateGuardSetUp',commonAccessUrl,guardKey)
    errorLogs(globalEmitter,'errorLogsSetup',globalDataAccessCall)
    genericDataAccess(dataAccessInitModel);
  
}            

//exports
module.exports.init=init;