function submitCover(){
	console.log("submitting new class");
    
    //Do the AJAX post
    $.post("/api/classes", $("#getCoverForm").serialize(), function(data){
        //notify user the request has been saved
        alert("Your request for cover has been saved. You will be notified by email to confirm whether we find cover for you.")
    });

    //Stop the normal POST
    return false;
}