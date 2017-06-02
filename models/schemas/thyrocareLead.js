//node dependencies
var mongoose=require('mongoose');
mongoose.Promise = require('bluebird');

// creating primary schema
var thyrocareLead={
    leadId: String,
    mobile: String,
    bookingDate: String,
    apptDate: String,
    thyrocareleadId: String,
    reportStatus: Boolean
    };

var thyrocareLeadSchema = mongoose.Schema(thyrocareLead);

// exports
module.exports=mongoose.model('thyrocareLeadSchema', thyrocareLead);
