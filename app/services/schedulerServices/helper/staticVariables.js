commonVar=module.exports={
    
    completedDocs:0,
    
    batchDone:true,
    
    //function to keep a track of the done documents
    add: function(){
        commonVar.completedDocs=commonVar.completedDocs+1
        console.log(commonVar.completedDocs+" "+commonVar.totalDocs)
        return commonVar.completedDocs
    },
    
    //function to set the total number of documents
    setTotalDocs: function(length){
        commonVar.totalDocs=length
    },
        
    //function to set the batchDone boolean as false
    setBatchDone: function(){
        commonVar.batchDone=false
    },
      
    //function to check if all the documents are done
    check: function(){
    if(commonVar.totalDocs==commonVar.completedDocs){
        commonVar.batchDone=true
        commonVar.completedDocs=0
        commonVar.totalDocs=0
        console.log("Batch Done")
        }
    },
    
    //function to return the batchDone boolean
    getBatchDoneBool: function(){
        return commonVar.batchDone
    }
    
}