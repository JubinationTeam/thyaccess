//node dependencies
var mongoose=require('mongoose');
mongoose.Promise = require('bluebird');

// creating primary schema
var errorLogs={
    error: String,
    fileName: String,
    thyrocareLeadId: String,
    time: String
    };

var errorLogsSchema = mongoose.Schema(errorLogs);

// exports
module.exports=mongoose.model('errorLogsSchema', errorLogs);