var instructorsArray = new Array();

$(document).ready(function () {
    $.get("/api/instructors", function(data){
        for (var x=0;x<data.length;x++){
            instructorsArray.push(data[x]);
        }
        getClasses();
    });
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

    if (coverClass.instructorAssigned==false){
        //generate list of instructors
        //var instructorList = '<li><a tabindex="-1" href="#">Action</a></li>';
        //instructorList += '<li><a tabindex="-1" href="#">Another</a></li>';
        //instructorList += '<li><a tabindex="-1" href="#">Something else </a></li>';

        //onclick="assignIntructor('+instructorsArray[i]._id+'); return false;"
        var instructorList = '';
        for (var i = 0; i < instructorsArray.length; i++) {
            instructorList += '<li><a tabindex="-1" href="#" onClick="assignInstructor(\''+i+'\',\''+coverClass._id+'\');">' + instructorsArray[i].firstName + ' ' + instructorsArray[i].lastName + '</a></li>'
        };


        instructorAssigned.innerHTML='<div class="dropdown"><a class="dropdown-toggle" data-toggle="dropdown" href="#">Select instructor</a><ul class="dropdown-menu" role="menu" aria-labelledby="dLabel">'+instructorList+'</ul></div>';
    }else{
        instructorAssigned.innerHTML=coverClass.instructorAssigned;
        //TODO add delete button to reselect new instructor
    }
    
    amountDueToInstructor.innerHTML=(coverClass.classRate * 0.8).toFixed(2);

    instructorPaid.innerHTML=coverClass.instructorPaid + '<br/><button onclick="instructorPaidSwitch(\''+coverClass._id+'\')">Switch</button>';
    
    gymInvoiced.innerHTML=coverClass.gymInvoiced + '<br/><button onclick="gymInvoicedSwitch(\''+coverClass._id+'\')">Switch</button>';
    
    paidByGym.innerHTML=coverClass.paidByGym + '<br/><button onclick="paidByGymSwitch(\''+coverClass._id+'\')">Switch</button>';

    remove.innerHTML = '<button onclick="removeClass(\''+coverClass._id+'\')">Remove</button>';

}

function assignInstructor(instructorID, classID){
    console.log(instructorsArray[instructorID]);
    console.log(classID);


}


function paidByGymSwitch(id){

     $.ajax({
        url: "/api/classesPaidByGymSwitch/"+id,
        type: 'PUT',
        success: function(data) {
            console.log(data);
        }
    });

    //now reload the table
    reloadTable();
}


function gymInvoicedSwitch(id){

     $.ajax({
        url: "/api/classesGymInvoicedSwitch/"+id,
        type: 'PUT',
        success: function(data) {
            console.log(data);
        }
    });

    //now reload the table
    reloadTable();
}

function instructorPaidSwitch(id){

     $.ajax({
        url: "/api/classesIntructorPaidSwitch/"+id,
        type: 'PUT',
        success: function(data) {
            console.log(data);
        }
    });

    //now reload the table
    reloadTable();
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
    reloadTable();
}

function reloadTable(){
    //remove all rows except title
    $("#classes>thead>tr:not(:first)").remove();

    //reload
    getClasses();
}
