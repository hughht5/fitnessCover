$(document).ready(function () {

    //stop form beeing submitted with the enter key
    $(window).keydown(function(event){
        if(event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });

    $('#giveCoverForm').validate({ // initialize the plugin
        rules: {
            firstName: {
                required: true,
                minlength: 2
            },
            lastName: {
                required: true,
                minlength: 2
            },
            email: {
                required: true,
                email: true
            },
            mobile: {
                required: true,
                number: true,
                minlength: 8
            },
            qualifications: {
                required: true
            },
            location: {
                required: true
            },
            acc: {
                number: true
            },
            sort: {
                required: true
            }
        }
    });

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
    	bootbox.alert("Thank you, we will contact you shortly and add you to our books. We will email you to confirm.", function(){
            //redirect to home
            window.location.href = "../";
        });
    	
    });

    //Stop the normal POST
    return false;
}