$(document).ready(function(){
    $("#submit").submit(function() {
        //Do the AJAX post
        $.post($("#html-form").attr("action"), $("#html-form").serialize(), function(data){
            //do stuff here...
        });
        //Stop the normal POST
        return false;
    });
});