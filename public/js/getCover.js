$(document).ready(function(){
    $("#submit").onClick(function(e) {

    	e.preventDefault

    	console.log("submitting new class");
        //Do the AJAX post
        $.post("/api/classes", $("#getCoverForm").serialize(), function(data){
            //do stuff here...
        });
        //Stop the normal POST
        return false;
    });
});