$(document).ready(function () {

    getNewInstructors();

});


//query mongo and add results to the table
function getNewInstructors(){
    $.get("/api/instructorsNew", function(data){
        for (var x=0;x<data.length;x++){
            addRow(data[x]);
        }
    });
}

function addRow(instructor){

    qualificationsHTML = "";
    if(Array.isArray(instructor.qualifications)){
        for (var x=0; x<instructor.qualifications.length; x++){
            qualificationsHTML += instructor.qualifications[x] + "<br>";
        }
    } else{
        qualificationsHTML = instructor.qualifications + "<br>";
    }

    locationsHTML = "";
    if (Array.isArray(instructor.location)){
        for (var x=0; x<instructor.location.length; x++){
            locationsHTML += instructor.location[x] + "<br>";
        }
    } else {
        locationsHTML = instructor.location;
    }

    var table=document.getElementById("newInstructors");
    var row=table.insertRow(-1);
    var firstName=row.insertCell(0);
    var lastName=row.insertCell(1);
    var email=row.insertCell(2);
    var mobile=row.insertCell(3);
    var acc=row.insertCell(4);
    var sort=row.insertCell(5);
    var qualifications=row.insertCell(6);
    var locations=row.insertCell(7);
    var approve = row.insertCell(8);
    var remove = row.insertCell(9);


    firstName.innerHTML=instructor.firstName;
    lastName.innerHTML=instructor.lastName;
    email.innerHTML=instructor.email;
    mobile.innerHTML=instructor.mobile;
    acc.innerHTML=instructor.acc;
    sort.innerHTML=instructor.sort;
    qualifications.innerHTML=qualificationsHTML;
    locations.innerHTML=locationsHTML;

    var buttonHTML='<button onclick="approve(\''+instructor._id+'\')">Approve</button>';
    approve.innerHTML = buttonHTML;

    var removebuttonHTML='<button onclick="removeInstructor(\''+instructor._id+'\')">Remove</button>';
    remove.innerHTML = removebuttonHTML;

}


function approve (id){

    var confirmed = {
        confirmed: true
    };

    $.ajax({
        url: "/api/instructorsApprove/"+id,
        data: confirmed,
        type: 'PUT',
        success: function(data) {
            console.log(data);
        }
    });

    //now reload the table
    //remove all rows except title
    $("#newInstructors>thead>tr:not(:first)").remove();

    //reload
    getNewInstructors();
}

function removeInstructor(id){

    //popup to confirm
    bootbox.confirm("Are you sure?", function(result) {
        

        if (result){

            $.ajax({
                url: "/api/instructors/"+id,
                type: 'DELETE',
                success: function(data) {
                    console.log(data);
                }
            });


            //now reload the table
            //remove all rows except title
            $("#instructors>thead>tr:not(:first)").remove();

            //reload
            getInstructors();

        }
    });
}




