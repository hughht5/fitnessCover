function submitInstructor(){
	console.log("submitting new instructor");
    
    //Do the AJAX post
    $.post("/api/classes", $("#giveCoverForm").serialize(), function(data){
        
        //notify user the request has been saved
    	bootbox.alert("Thank you, we will contact you shortly and add you to our books.");
    	
    	//reset the form
    	document.getElementById("giveCoverForm").reset();
    	
    });

    //Stop the normal POST
    return false;
}