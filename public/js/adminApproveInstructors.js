$(document).ready(function () {

    getNewInstructors();

});


//query mongo and add results to the table
function getNewInstructors(){
    $.get("/api/instructors", function(data){
        console.log(data);
    });
}