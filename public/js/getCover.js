$(document).ready(function(){
    $("#submit").submit(function(e) {

    	console.log("submitting new class");
        //Do the AJAX post
        $.post("/api/classes", $("#getCoverForm").serialize(), function(data){
            //do stuff here...
        });
        //Stop the normal POST
        return false;
    });
});