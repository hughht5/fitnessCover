$(document).ready(function(){
    $("#submit").submit(function(e) {
    	e.preventDefault();
    	
    	console.log("submitting new class");
        //Do the AJAX post
        $.post($("#getCoverForm").attr("action"), $("#getCoverForm").serialize(), function(data){
            //do stuff here...
        });
        //Stop the normal POST
        return false;
    });
});