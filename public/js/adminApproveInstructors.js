$(document).ready(function () {

});

function submitInstructor(){

    //validate  form
    $("#giveCoverForm").validate();

    if(!$("#giveCoverForm").valid()){
        bootbox.alert("Please fill out the correct fields");
        return false;
    }
    
    //Do the AJAX post
    $.post("/api/instructors", $("#giveCoverForm").serialize(), function(data){
        
        //notify user the request has been saved
    	bootbox.alert("Thank you, we will contact you shortly and add you to our books.");
    	
    	//reset the form
    	document.getElementById("giveCoverForm").reset();
    	
    });

    //Stop the normal POST
    return false;
}