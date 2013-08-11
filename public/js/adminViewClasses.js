$(document).ready(function () {

    getClasses();

});


//query mongo and add results to the table
function getClasses(){
    $.get("/api/classes", function(data){
        for (var x=0;x<data.length;x++){
            addRow(data[x]);
        }
    });
}

function addRow(coverClass){

    var table=document.getElementById("classes");
    var row=table.insertRow(-1);

    var firstName=row.insertCell(0);
    var lastName=row.insertCell(1);
    var email=row.insertCell(2);
    var mobile=row.insertCell(3);
    var gymName=row.insertCell(4);
    var classType=row.insertCell(5);
    var classDate=row.insertCell(6);
    var classTime=row.insertCell(7);
    var classRate = row.insertCell(8);
    var reason = row.insertCell(9);
    var notes = row.insertCell(10);
    var instructorAssigned = row.insertCell(11);
    var amountDueToInstructor = row.insertCell(12);
    var instructorPaid = row.insertCell(13);
    var gymInvoiced = row.insertCell(14);
    var paidByGym = row.insertCell(15);
    var remove = row.insertCell(16);


    firstName.innerHTML=coverClass.firstName;
    lastName.innerHTML=coverClass.lastName;
    email.innerHTML=coverClass.email;
    mobile.innerHTML=coverClass.mobile;
    gymName.innerHTML=coverClass.gymName;
    classType.innerHTML=coverClass.classType;
    classDate.innerHTML=coverClass.classDate;
    classTime.innerHTML=coverClass.classTime;
    classRate.innerHTML=coverClass.classRate;
    reason.innerHTML=coverClass.reason;
    notes.innerHTML=coverClass.notes;
    instructorAssigned.innerHTML=coverClass.instructorAssigned;
    amountDueToInstructor.innerHTML=(coverClass.classRate * 0.8).toFixed(2);

    instructorPaid.innerHTML=coverClass.instructorPaid + '<br/><button id="paidSwitchButton">Switch</button>';
    
    gymInvoiced.innerHTML=coverClass.gymInvoiced;
    
    paidByGym.innerHTML=coverClass.paidByGym;

    remove.innerHTML = '<button onclick="removeClass(\''+coverClass._id+'\')">Remove</button>';

}

function instructorPaidSwitch(coverClass){
    console.log(coverClass);
    /*var update;
    if(paid){
        update=false;
    }else{
        update=true;
    }

     $.ajax({
        url: "/api/classes/"+id,
        type: 'PUT',
        data: {
            paid:update
        },
        success: function(data) {
            console.log(data);
        }
    });//*/
}


function removeClass(id){

    $.ajax({
        url: "/api/classes/"+id,
        type: 'DELETE',
        success: function(data) {
            console.log(data);
        }
    });


    //now reload the table
    //remove all rows except title
    $("#classes>thead>tr:not(:first)").remove();

    //reload
    getClasses();
}

