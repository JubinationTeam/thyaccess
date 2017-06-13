'use strict'
// node dependencies
var mongoose=require('mongoose');
mongoose.Promise = require('bluebird');

// mongodb connection
module.exports=function(){
    mongoose.connect('mongodb://node123:nodedb123@ds039195.mlab.com:39195/backup', function(err){
    if(err){
        console.log(err);
    } else{
        console.log('Connected to mongodb!');
    }
});
}