//node dependencies
var mongoose=require('mongoose');
mongoose.Promise = require('bluebird');

// creating primary schema
var lead={
    leadId: String,
    name: String,
    mobile: String,
    email: String,
    address: String,
    dob: String,
    gender: String,
    age: String,
    city: String,
    pincode: String,
    product: String,
    tpVendor:String,
    numberOfPeople: String,
    amount: String,
    modeOfPayment: String,
    tags: [mongoose.Schema.Types.Mixed]
    };

var leadSchema = mongoose.Schema(lead);

// exports
module.exports=mongoose.model('lead', leadSchema);
