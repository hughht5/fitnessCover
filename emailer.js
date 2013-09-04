var nodemailer = require("nodemailer");

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
    send(['Hugh <hughht5@gmail.com>'],
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
    //send email to FitnessCover informing them of new class
    console.log('Sending email to admin Hugh <hughht5@gmail.com> to alert about new instructor signup.');
    send(['Hugh <hughht5@gmail.com>'],
        'FitnessCover Alerts - New instructor signed up',
        JSON.stringify(instructor));

    //send email to user to inform them Fitness cover will search for cover
    var recipient = instructor.firstName + ' ' + instructor.lastName + '<' + instructor.email + '>';
    console.log('Sending email to user ' + recipient + ' to confirm new instructor signup.');
    send([recipient],
        'FitnessCover Alerts - Thank you for signing up',
        'Thank you for signing up with FitnessCover. This email should explain the rules to new instructors - should they expect a phone call... and wait for approval. If this request was submitted by mistake please reply to this email at your earliest convenience.');
};

//function to email instructor to inform them they have been approved
exports.sendApproveInstructor = function(instructor){

    var recipient = instructor.firstName + ' ' + instructor.lastName + '<' + instructor.email + '>';
    console.log('Sending email to user ' + recipient + ' to confirm instructor is approved.');
    send([recipient],
        'FitnessCover Alerts - You have been approved',
        'You have now been approved as a FitnessCover instructor. We will now send you emails about new cover opportunities. If you are first to respond you get the gig - we will always confirm if you have it. If we don\'t respond assume you didnt get it. Please only respond with yes/no... in the email (keep it short)...');
};

//function to email instructor to inform them they have been paid for a class
exports.sendInstructorPaid = function(instructor, coverClass){

    var recipient = instructor.firstName + ' ' + instructor.lastName + '<' + instructor.email + '>';
    console.log('Sending email to user ' + recipient + ' to confirm instructor has been paid for a class.');
    send([recipient],
        'FitnessCover Alerts - Notification of payment received',
        'Thank you for covering the class at ' + JSON.stringify(coverClass) + '. You have now been paid for your efforts. We hope to work with you again in the near future. The bank transfer has been made to your account. You should receive the money within 10 minutes, but please allow up to 24 hours for it to appear as the banks can cause delays. If after 24 hours you have not been paid please reply to this email.');
};

//function to email instructor to inform them they have been assigned to a class
exports.sendInstructorAssigned = function(instructor, coverClass){

    var recipient = instructor.firstName + ' ' + instructor.lastName + '<' + instructor.email + '>';
    console.log('Sending email to user ' + recipient + ' to inform them they have been assigned to class: '+ JSON.stringify(coverClass));
    send([recipient],
        'FitnessCover Alerts - Cover class assigned',
        'You have been chosen to cover ' + JSON.stringify(coverClass) + '. If you cannot make it please email / call us on ... else this will count again your performance rating and we may stop working with you...');
};

//function to email instructor to inform them they have been approved
exports.sendInstructorDisapproved = function(instructor){

    var recipient = instructor.firstName + ' ' + instructor.lastName + '<' + instructor.email + '>';
    console.log('Sending email to user ' + recipient + ' to tell them they have been disapproved.');
    send([recipient],
        'FitnessCover Alerts - You have been disapproved',
        'You have now been disapproved as a FitnessCover instructor. You will have received correspondence about why this is. You will are no longer elegible for FitnessCover jobs. If you think this was a mistake email us here...');
};




