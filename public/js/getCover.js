function submitCover(){
	console.log("submitting new class");
    
    //Do the AJAX post
    $.post("/api/classes", $("#getCoverForm").serialize(), function(data){
        
        //notify user the request has been saved
    	bootbox.alert("Thank you, your request for cover has been saved.");
    	
    	//reset the form
    	document.getElementById("getCoverForm").reset();
    	
    });

    //Stop the normal POST
    return false;
}