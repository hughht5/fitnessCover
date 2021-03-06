$(document).ready(function () {

	//stop form beeing submitted with the enter key
	$(window).keydown(function(event){
		if(event.keyCode == 13) {
	    	event.preventDefault();
	      	return false;
	    }
	});

    $('#getCoverForm').validate({ // initialize the plugin
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
            classType: {
                required: true
            },
            classDate: {
                required: true,
                date: true
            },
            classTime: {
                required: true
            },
            classRate: {
                required: true
            },
            classDuration: {
                required: true
            }
        }
    });

});


function submitCover(){

	//validate form
	$("#getCoverForm").validate();

	if(!$("#getCoverForm").valid()){
		bootbox.alert("Please fill out the correct fields");
		return false;
	}

    //Do the AJAX post
    $.post("/api/classes", $("#getCoverForm").serialize(), function(data){
        
        bootbox.dialog({
          title: "Thank you for submitting a cover request!",
          message: "Your request has been saved and you will receive an email confirming it momentarily. What would you like to do now?",
          buttons: {
            success: {
              label: "Go to home page.",
              className: "btn-success",
              callback: function() {
                //redirect to home
                window.location.href = "../";
              }
            },
            main: {
              label: "Add another class.",
              className: "btn-primary",
              callback: function() {
                //reset the form
                document.getElementById("getCoverForm").reset();
              }
            }
          }
        });

    });

    //Stop the normal POST
    return false;
}