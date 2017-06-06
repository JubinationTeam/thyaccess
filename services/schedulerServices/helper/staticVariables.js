commonVar=module.exports={
    
    completedDocs:0,
    
    batchDone:true,
    
    add: function(){
        commonVar.completedDocs=commonVar.completedDocs+1
        console.log(commonVar.completedDocs+" "+commonVar.totalDocs)
        return commonVar.completedDocs
    },
    
    setTotalDocs: function(length){
        commonVar.totalDocs=length
    },
        
    setBatchDone: function(){
        commonVar.batchDone=false
    },
        
    check: function(){
    if(commonVar.totalDocs==commonVar.completedDocs){
        commonVar.batchDone=true
        commonVar.completedDocs=0
        commonVar.totalDocs=0
        console.log("Batch Done")
        }
    },
    
    getBatchDoneBool: function(){
        return commonVar.batchDone
    },
    
    docArray:[],
    
    push: function(model){
        commonVar.docArray.push(model)
    }
    
}