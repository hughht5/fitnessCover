function submitCover(){
	console.log("submitting new class");
    
    //Do the AJAX post
    $.post("/api/classes", $("#getCoverForm").serialize(), function(data){
        //notify user the request has been saved
    	bootbox.alert("Your request for cover has been saved. You will be notified by email to confirm whether we find cover for you.");
    	
    	//reset the form
    	document.getElementById("getCoverForm").reset();
    });

    //Stop the normal POST
    return false;
}