var nodemailer = require("nodemailer");
//var emailjs = require("emailjs");

var adminEmail = 'Annie <angharadmm@yahoo.co.uk>';
var fee = 0.2; //20% fee

//dev
var host = '127.0.0.1';

//production
//var host = 'www.fitnesscover.co.uk';

//setup smtp
//dev pass
var smtppassword = "CQEFy3hFpM57vdVYMSudZw";
//prod pass
//var smtppassword = "EVIqj1_zZMIp5Vf3b8RgDg";

/*
var emailjsServer = emailjs.server.connect({
    user:"hughht5@gmail.com",
    password:smtppassword,
    host:"smtp.mandrillapp.com",
    ssl:true
});

var send = function(recipient, subject, text) {
    
    emailjsServer.send({
       from: "Fitness Cover<hughht5@gmail.com>", // sender address
       to: recipient, //recipient
       subject: subject, // Subject line
       text: text // plaintext body
    }, function(error, message){
       if(error){
           console.log(error);
       }else{
           console.log("Emailer.js - message sent.");
       }
    });
};
//*/

//nodemailer
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Mandrill",
    //host: "smtp.mandrillapp.com",
    //port: 587,
    //pass: smtppassword
    auth: {
        user: "hughht5@gmail.com",
        pass: smtppassword
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
};//*/

//function to create new cover request emails. Three emails are send - 1 to the admin, 1 to the user who asked for cover.
//Finally, an email is sent to all the instructors who are qualified to cover that class and work in that area.
exports.sendNewCoverRequest = function(coverClass, db){
    
    var emails = {
        admin : {
            recipient: adminEmail,
            subject: 'FitnessCover Alerts - New class created <'+coverClass._id+'>',
            text: 'Dear admin,\n\n'+
                'A new cover request has been submitted.\n\n ' + 
                prettifyClass(coverClass)
        },
        user:{
            recipient: coverClass.firstName + ' ' + coverClass.lastName + '<' + coverClass.email + '>',
            subject: 'FitnessCover Alerts - Thank you for requesting a new cover class! <'+coverClass._id+'>',
            text: 'Dear user,\n\n'+
                'Thank you for requesting cover with Fitness Cover.\n\n'+
                'We have contacted the gym manager to inform them that we are organising your cover. Please do not find cover yourself. If we are unable to find cover for you we will sort it out with your manager.\n\n'+
                'Please check the details below are correct and reply to this email if there are any issues.\n\n'+
                prettifyClassUser(coverClass)+'\n\n\n\n'+
                //TODO - change class rate for user ;)
                'Thanks,\n'+
                'Fitness cover'
        },
        manager:{
            recipient: coverClass.gymManager,
            subject: 'FitnessCover Alerts - We are finding cover for a class! '+coverClass.classDate +' '+coverClass.classTime+' <'+coverClass._id+'>',
            text: 'Dear manager,\n\n'+
                coverClass.firstName + ' ' + coverClass.lastName + ' has asked for a class to be covered.\n\n'+
                'We have emailed our qualified instructors and hope to assign one to this class as soon as possible.\n\n'+
                'Details of the class are below. If we are unable to find cover before (TODO - work out timeouts) we will inform you via email.\n\n'+
                prettifyClassUser(coverClass)+'\n\n\n\n'+
                'Thanks,\n'+
                'Fitness cover'
        },
        instructors:{
            subject: 'FitnessCover Alerts - New class available! '+coverClass.classDate +' '+coverClass.classTime+' <'+coverClass._id+'>',
            text: 'Dear instructor,\n\n'+
                'A new class is available for cover:\n\n'+
                prettifyClassSimple(coverClass) + '\n\n' +
                'If you are able to cover this class please follow this link: '+host+'/claimClass?classID='+coverClass._id+'&instructorID=<<<<InstructorID>>>>\n\n\n\n'+
                'Thanks,\n'+
                'Fitness cover'
        }
    };

    //send email to FitnessCover informing admin of new class
    console.log('Sending email to admin ' + emails.admin.recipient + ' to alert about new cover request.');
    send([emails.admin.recipient], emails.admin.subject, emails.admin.text);

    //send email to user to inform them Fitness cover will search for cover
    console.log('Sending email to user ' + emails.user.recipient + ' to confirm new cover request.');
    send([emails.user.recipient], emails.user.subject, emails.user.text);

    //send email to manager to inform them Fitness cover will search for cover
    console.log('Sending email to manager ' + emails.manager.recipient + ' to confirm new cover request.');
    send([emails.manager.recipient], emails.manager.subject, emails.manager.text);
   
    //email all instructors who are qualified for this class and work in this area
    db.collection('instructors', function(err, collection) {
        collection.find({location: coverClass.gymLocation, qualifications: coverClass.classType, confirmed: "true"}).toArray(function(err, instructors) {
            
            //intructors object array returned: email each one at a time
            console.log('emailing '+instructors.length+' instructors to notify class is available for cover.');

            for (var i = 0; i < instructors.length; i++) {
                recipient = instructors[i].firstName + ' ' + instructors[i].lastName + '<' + instructors[i].email + '>';
                var emailText = emails.instructors.text.replace('<<<<InstructorID>>>>',instructors[i]._id);
                send(recipient, emails.instructors.subject, emailText);
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
            text: 'Dear admin,\n\n'+
                'A new instructor has signed up to Fitness Cover. Please approve / disapprove them.\n\n ' + prettifyInstructor(instructor),
        },
        user:{
            recipient: instructor.firstName + ' ' + instructor.lastName + '<' + instructor.email + '>',
            subject: 'FitnessCover Alerts - Thank you for signing up! <'+instructor._id+'>',
            text: 'Dear user,\n\n'+
                'Thank you for signing up to fitness cover. We will now review your request and send you an email if your request is approved.\n\n'+
                'Once approved you will soon be receiving emails asking for cover so remember keep checking your emails as its fastest finger first!\n\n'+
                'Please check the details below are correct and reply to this email if there are any issues:\n\n' +
                prettifyInstructor(instructor) + '\n\n' +
                'If you think this request was submitted by mistake then please reply to this email at your earliest convenience.\n\n\n\n'+
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
            text: 'Dear user,\n\n'+
                'Your request with fitness cover has been approved!\n\n'+
                'Please read the following...\n\n'+
                'We will send you cover requests as soon as we receive them and they will all be related to the classes you can teach and your preferred locations.\n\n'+
                'When you receive a cover request email and you CAN teach the class then click on the link provided and if you are first to reply you will be assigned to that class and your details will be passed on to the manager of that club.\n\n'+
                'We advise that you send a quick email to the manager to confirm you are covering the class.'+
                'After the class we will confirm with the manager that you taught the class and you will be paid you within 3 working days!\n\n'+
                'REMEMBER...by signing up with fitness cover you have agreed that you have...\n\n'+
                'PPL licence\n\n'+
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
            text: 'Dear user,\n\n'+
                'Fitness cover has just paid you via bank transfer for covering the following class:\n\n'+
                prettifyClassSimple(coverClass) + '\n\n' +
                'You should receive the funds immediately although banks may delay the payment for up to 2 hours. If you believe this was sent to you by mistake or if there is a delay of more than 2 hours before you recieve the funds please reply to this email.\n\n\n\n'+
                'Thanks again,\n'+
                'Fitness cover'
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
            subject: 'FitnessCover Alerts - You have chosen to cover a class! <'+instructor._id+'><'+coverClass._id+'>',
            text: 'Dear user,\n\n'+
                'Thank you for choosing to cover a class through Fitness Cover. Details of the class are below. The gym manager has been notified. Please contact them directly to confirm.\n\n'+
                'When you arrive at the gym please sign in as usual to inform the manager that you are there, but do not fill out an invoice. We will pay you within 3 working days of covering the class and we will invoice the gym ourselves.\n\n'+
                prettifyClassSimple(coverClass)+
                '\n\n\n\n'+
                'Thanks,\n'+
                'Fitness cover'
        },
        manager:{
            recipient: coverClass.gymManager,
            subject: 'FitnessCover Alerts - We have found cover for a class! <'+coverClass._id+'>',
            text: 'Dear manager,\n\n'+
                coverClass.firstName + ' ' + coverClass.lastName + ' asked for a class to be covered. We have assigned an instructor to cover this class. Please contact the cover instructor directly to confirm. If there are any issues feel free to reply to this email.\n\n' +
                'When the cover instructor arrives they have been asked to sign in to make you aware they are covering the class, but not to fill out an invoice. We will pay them, and we will invoice you every month for all the classes for which we have organised cover. Again, if there are any issues please reply to this email.\n\n'+
                'Class details:\n\n'+
                prettifyClassManager(coverClass) + '\n\n'+
                'Intructor details:\n\n'+
                prettifyInstructorSimple(instructor)+'\n\n\n\n'+
                'Thanks,\n'+
                'Fitness cover'
        },
        admin:{
            recipient: adminEmail,
            subject: 'FitnessCover Alerts - We have found cover for a class! <'+coverClass._id+'>',
            text: 'Dear admin,\n\n'+
                coverClass.firstName + ' ' + coverClass.lastName + ' asked for a class to be covered.\n\n' +
                'Class details:\n\n'+
                prettifyClass(coverClass) + '\n\n'+
                'We have assigned an instructor to cover this class:\n\n'+
                prettifyInstructor(instructor)+'\n\n\n\n'+
                'Please invoice the gym for this class and pay the cover instructor the amount specified.'
        }

    };

    console.log('Sending email to user ' + emails.user.recipient + ' to inform them they have been assigned to a class: '+ coverClass._id);
    send([emails.user.recipient], emails.user.subject, emails.user.text);

    console.log('Sending email to manager ' + emails.manager.recipient + ' to inform them a user has been assigned to a class: '+ coverClass._id);
    send([emails.manager.recipient], emails.manager.subject, emails.manager.text);

    console.log('Sending email to admin ' + emails.admin.recipient + ' to inform them a user has been assigned to a  class: '+ coverClass._id);
    send([emails.admin.recipient], emails.admin.subject, emails.admin.text);
};

//function to email instructor to inform them they have been approved
exports.sendInstructorDisapproved = function(instructor){

    var emails = {
        user:{
            recipient: instructor.firstName + ' ' + instructor.lastName + '<' + instructor.email + '>',
            subject: 'FitnessCover Alerts - You have been disapproved! <'+instructor._id+'>',
            text: 'Dear user,\n\n'+
                'We are sorry to inform you that you have been suspended from FitnessCover!\n\n'+
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

function prettifyInstructorSimple(instructor){

    var prettyPrint = '';
    
    prettyPrint += '\n\t First Name = ' + instructor.firstName;
    prettyPrint += '\n\t Last Name = ' + instructor.lastName;
    prettyPrint += '\n\t Email = ' + instructor.email;
    prettyPrint += '\n\t Mobile = ' + instructor.mobile;


    return prettyPrint;
}

function prettifyClass(coverClass){

    var prettyPrint = '';

    for (var prop in coverClass){
            if( Object.prototype.toString.call( prop ) === '[object Array]' ) {
            prettyPrint += '\t' + prop + ' = ';
            prop.forEach(function(entry){
                prettyPrint += ' ' + entry;
            });
        }else{
            prettyPrint += '\t' + prop + ' = ' + coverClass[prop] + '\n';
        }
    }


    return prettyPrint;
}

function prettifyClassUser(coverClass){

    var prettyPrint = '';
    
    prettyPrint += '\n\t First Name = ' + coverClass.firstName;
    prettyPrint += '\n\t Last Name = ' + coverClass.lastName;
    prettyPrint += '\n\t Email = ' + coverClass.email;
    prettyPrint += '\n\t Mobile = ' + coverClass.mobile;
    prettyPrint += '\n\t Class Date = ' + coverClass.classDate;
    prettyPrint += '\n\t Class Time = ' + coverClass.classTime;
    prettyPrint += '\n\t Class Duration = ' + coverClass.classDuration;
    prettyPrint += '\n\t Class Rate = £' + Math.floor(coverClass.classRate * (1-fee) * 100) / 100;
    prettyPrint += '\n\t Class Type = ' + coverClass.classType;
    prettyPrint += '\n\t Gym Name = ' + coverClass.gymName;
    prettyPrint += '\n\t Gym Manager = ' + coverClass.gymManager;
    prettyPrint += '\n\t Reason for Cover = ' + coverClass.reason;
    prettyPrint += '\n\t Notes = ' + coverClass.notes;



    return prettyPrint;
}

function prettifyClassSimple(coverClass){

    var prettyPrint = '';
    
    prettyPrint += '\n\t Class Date = ' + coverClass.classDate;
    prettyPrint += '\n\t Class Time = ' + coverClass.classTime;
    prettyPrint += '\n\t Class Duration = ' + coverClass.classDuration;
    prettyPrint += '\n\t Class Rate = £' + Math.floor(coverClass.classRate * (1-fee) * 100) / 100;
    prettyPrint += '\n\t Class Type = ' + coverClass.classType;
    prettyPrint += '\n\t Gym Name = ' + coverClass.gymName;
    prettyPrint += '\n\t Gym Manager = ' + coverClass.gymManager;
    prettyPrint += '\n\t Notes = ' + coverClass.notes;



    return prettyPrint;
}

function prettifyClassManager(coverClass){

    var prettyPrint = '';
    
    prettyPrint += '\n\t First Name = ' + coverClass.firstName;
    prettyPrint += '\n\t Last Name = ' + coverClass.lastName;
    prettyPrint += '\n\t Email = ' + coverClass.email;
    prettyPrint += '\n\t Mobile = ' + coverClass.mobile;
    prettyPrint += '\n\t Class Date = ' + coverClass.classDate;
    prettyPrint += '\n\t Class Time = ' + coverClass.classTime;
    prettyPrint += '\n\t Class Duration = ' + coverClass.classDuration;
    prettyPrint += '\n\t Class Rate = £' + coverClass.classRate
    prettyPrint += '\n\t Class Type = ' + coverClass.classType;
    prettyPrint += '\n\t Gym Name = ' + coverClass.gymName;
    prettyPrint += '\n\t Gym Manager = ' + coverClass.gymManager;
    prettyPrint += '\n\t Reason for Cover = ' + coverClass.reason;
    prettyPrint += '\n\t Notes = ' + coverClass.notes;


    return prettyPrint;
}



