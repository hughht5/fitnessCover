var nodemailer = require("nodemailer");


var adminEmail = 'Hugh <hughht5@gmail.com>';

//setup smtp
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Mandrill",
    auth: {
        user: "hughht5@gmail.com",
        pass: "CQEFy3hFpM57vdVYMSudZw"
    }
});

//function to send an email
var send = function(recipient, subject, text) {
    
    smtpTransport.sendMail({
       from: "Fitness Cover<hughht5@gmail.com>", // sender address
       to: recipient, //recipient
       subject: subject, // Subject line
       text: text // plaintext body
    }, function(error, response){
       if(error){
           console.log(error);
       }else{
           console.log("Emailer.js - message sent: " + response.message);
       }
    });
};

//function to create new cover request emails. Three emails are send - 1 to the admin, 1 to the user who asked for cover.
//Finally, an email is sent to all the instructors who are qualified to cover that class and work in that area.
exports.sendNewCoverRequest = function(coverClass, db){
    //send email to FitnessCover informing them of new class
    console.log('Sending email to admin Hugh <hughht5@gmail.com> to alert about new cover request.');
    send([adminEmail],
        'FitnessCover Alerts - New class created',
        JSON.stringify(coverClass));

    //send email to user to inform them Fitness cover will search for cover
    var recipient = coverClass.firstName + ' ' + coverClass.lastName + '<' + coverClass.email + '>';
    console.log('Sending email to user ' + recipient + ' to confirm new cover request.');
    send([recipient],
        'FitnessCover Alerts - We have received your cover request',
        'Thank you for using fitness cover. This email should explain the process to the user. If this request was submitted by mistake please reply to this email at your earliest convenience.');

    //email all instructors who are qualified for this class and work in this area
    db.collection('instructors', function(err, collection) {
      //todo - add approved only
        collection.find({location: coverClass.gymLocation, qualifications: coverClass.classType, confirmed: "true"}).toArray(function(err, instructors) {
            
            //intructors object array returned: email each one at a time
            console.log('emailing '+instructors.length+' instructors to notify class is available for cover.');

            for (var i = 0; i < instructors.length; i++) {
                recipient = instructors[i].firstName + ' ' + instructors[i].lastName + '<' + instructors[i].email + '>';
                send(recipient,
                  'FitnessCover Alerts - New class on date...',
                  'A new class is available for cover. Would you like to cover it? Be first to reply and we will confirm you have the job ;) payment within 3 days...');
            };
            
        });
    });
};

//function to create new instructor emails. Two emails are send - 1 to the admin, 1 to the user signed up as an instructor.
exports.sendNewInstructorSignedUp = function(instructor){

    var emails = {
        admin : {
            recipient: adminEmail,
            subject: 'FitnessCover Alerts - New instructor signed up <'+instructor._id+'>',
            text: 'A new instructor has signed up to Fitness Cover. Please approve / disapprove them.\n\n ' + prettifyInstructor(instructor),
        },
        user:{
            recipient: instructor.firstName + ' ' + instructor.lastName + '<' + instructor.email + '>',
            subject: 'FitnessCover Alerts - Thank you for signing up! <'+instructor._id+'>',
            text: 'Thank you for signing up to fitness cover. We will now review your request and send you an email if your request is approved.\n\n'+
                'Once approved you will soon be receiving emails asking for cover so remember keep checking your emails as its fastest finger first!\n\n'+
                'If you think this request was submitted by mistake then please email us at your earliest convenience\n\n\n\n'+
                'Thanks,\n'+
                'Fitness cover'
        }
    };

    //send email to FitnessCover informing them of new class
    console.log('Sending email to admin ' + emails.admin.recipient + ' to alert about new instructor signup.');
    send([emails.admin.recipient], emails.admin.subject, emails.admin.text);

    //send email to user to inform them Fitness cover will search for cover
    console.log('Sending email to user ' + emails.user.recipient + ' to confirm new instructor signup.');
    send([emails.user.recipient], emails.user.subject, emails.user.text);

};

//function to email instructor to inform them they have been approved
exports.sendApproveInstructor = function(instructor){

    var emails = {
        user:{
            recipient: instructor.firstName + ' ' + instructor.lastName + '<' + instructor.email + '>',
            subject: 'FitnessCover Alerts - You have been approved! <'+instructor._id+'>',
            text: 'Your request with fitness cover has been approved!\n\n'+
                'Please read the following...\n\n'+
                'We will send you cover requests as soon as we receive them and they will all be related to the classes you can teach and your preferred locations.\n\n'+
                'When you receive a cover request email and you CAN teach the class then respond \'yes\' to the email and it you were the first to reply your details will be sent onto the person who requested the cover\n\n'+
                'The person who requested the cover will then confirm the class with you and when you turn up to teach you will fill out the invoice with fitness cover details and after confirming this we will pay you within 3 days!\n\n'+
                'REMEMBER...by signing up with fitness cover you have agreed that you have...\n\n'+
                'a ppl licence\n\n'+
                'Insurance\n\n'+
                'Qualifications to teach the class\n\n\n\n'+
                'Thanks again,\n'+
                'Fitness cover'
        }
    };

    console.log('Sending email to user ' + emails.user.recipient + ' to confirm instructor is approved.');
    send([emails.user.recipient], emails.user.subject, emails.user.text);
};

//function to email instructor to inform them they have been paid for a class
exports.sendInstructorPaid = function(instructor, coverClass){

    var emails = {
        user:{
            recipient: instructor.firstName + ' ' + instructor.lastName + '<' + instructor.email + '>',
            subject: 'FitnessCover Alerts - You have been Paid! <'+instructor._id+'><'+coverClass._id+'>',
            text: 'Fitness cover has just paid you for covering a class!\n\n\n\n'+
                'Thanks again,\n'+
                'Fitness cover'
                //todo - add class details
        }
    };


    console.log('Sending email to user ' + emails.user.recipient + ' to tell them they have been paid.');
    send([emails.user.recipient], emails.user.subject, emails.user.text);

};

//function to email instructor to inform them they have been assigned to a class
exports.sendInstructorAssigned = function(instructor, coverClass){

    var emails = {
        user:{
            recipient: instructor.firstName + ' ' + instructor.lastName + '<' + instructor.email + '>',
            subject: 'FitnessCover Alerts - You have been chosen to cover a class! <'+instructor._id+'><'+coverClass._id+'>',
            text: 'Yay! You have been chosen to cover this class...\n\n'+
                'Your details have now been passed onto the person who requested the cover so they can contact you to confirm. You also have their details so you can also contact then if you need to.\n\n'+
                'If you are unable to make the class please email fitness cover asap\n\n'+
                'When you get to the club please ensure that you fill out the fitness cover details on the invoice :\n\n'+
                'Angharad morgan\n\n'+
                '07753194274\n\n'+
                'angharadmm@yahoo.co.uk\n\n'+
                'Class time, type, rate\n\n'+
                'Sign it off\n\n'+
                'Once this is confirmed fitness cover will pay you within 3 days!\n\n\n\n'+
                'Thanks,\n'+
                'Fitness cover'
        }
    };

    console.log('Sending email to user ' + emails.user.recipient + ' to inform them they have been assigned to class: '+ coverClass._id);
    send([emails.user.recipient],
        'FitnessCover Alerts - Cover class assigned',
        'You have been chosen to cover ' + JSON.stringify(coverClass) + '. If you cannot make it please email / call us on ... else this will count again your performance rating and we may stop working with you...');
};

//function to email instructor to inform them they have been approved
exports.sendInstructorDisapproved = function(instructor){

    var emails = {
        user:{
            recipient: instructor.firstName + ' ' + instructor.lastName + '<' + instructor.email + '>',
            subject: 'FitnessCover Alerts - You have been disapproved! <'+instructor._id+'>',
            text: 'We are sorry to inform you that you have been suspended from FitnessCover!\n\n'+
                'You should have been informed about why this is already.\n\n\n\n'+
                'Thanks again,\n'+
                'Fitness cover'
        }
    };


    var recipient = instructor.firstName + ' ' + instructor.lastName + '<' + instructor.email + '>';
    console.log('Sending email to user ' + emails.user.recipient + ' to tell them they have been disapproved.');
    send([emails.user.recipient], emails.user.subject, emails.user.text);
};


function prettifyInstructor(instructor){

    var prettyPrint = '';

    for (var prop in instructor){
        if( Object.prototype.toString.call( prop ) === '[object Array]' ) {
            prettyPrint += '\t' + prop + ' = ';
            prop.forEach(function(entry){
                prettyPrint += ' ' + entry
            });
        }else{
            prettyPrint += '\t' + prop + ' = ' + instructor[prop] + '\n';
        }
    }


    return prettyPrint;
}

function prettifyClass(coverClass){

    var prettyPrint = '';

    for (var prop in coverClass){
        //hide certain fields from email
        //if (prop != )
        if( Object.prototype.toString.call( prop ) === '[object Array]' ) {
            prettyPrint += '\t' + prop + ' = ';
            prop.forEach(function(entry){
                prettyPrint += ' ' + entry
            });
        }else{
            prettyPrint += '\t' + prop + ' = ' + coverClass[prop] + '\n';
        }
    }


    return prettyPrint;
}



