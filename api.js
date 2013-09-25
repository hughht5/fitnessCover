var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var url = require('url');
var emailer = require('./emailer.js');

 
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

//Server access
/*
IP Address: 146.185.143.47
Username: root
Password: skmtgvqztttl
//*/

//production
/*
var mongoUser = 'fitnessCover';
var mongoPass = 'rygDwXu3kQ92DBFWQ8ft';
var mongoURL = 'ds047338-a0.mongolab.com';
var mongoPort = 47338;
var mongoDBName = 'production';
//*/

//dev
///*
var mongoUser = 'hughht5';
var mongoPass = 'Default11';
var mongoURL = 'ds043378.mongolab.com';
var mongoPort = 43378;
var mongoDBName = 'dev';
//*/

function getManager(gymName){
    if (gymName == 'London - Central | Fitness First - St Pauls'){
        return 'angharadmm@yahoo.co.uk';
    }
    //no manager found
    return 'angharadmm@yahoo.co.uk';
}

//connect to database
var server = new Server(mongoURL, mongoPort, {auto_reconnect: true});
db = new Db(mongoDBName, server);

//open classDB
db.open(function(err, db) {
    if(!err) {
        db.authenticate(mongoUser, mongoPass, function(err, success) {
            console.log("Connected to 'classes' collection");
            db.collection('classes', {strict:true}, function(err, collection) {
                if (err) {
                    console.log("The 'classes' collection is empty!");
                }
            });
            console.log("Connected to 'instructors' collection");
            db.collection('instructors', {strict:true}, function(err, collection) {
                if (err) {
                    console.log("The 'instructors' collection is empty!");
                }
            });
        });
    }
});



exports.findClassById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving class: ' + id);
    db.collection('classes', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};
 
exports.findAllClasses = function(req, res) {
    db.collection('classes', function(err, collection) {
        collection.find().sort('classDate').toArray(function(err, items) {
            res.send(items);
        });
    });
};
 
exports.addClass = function(req, res) {
    var coverClass = req.body;

    coverClass.instructorAssigned = false;
    coverClass.instructorPaid = false;
    coverClass.gymInvoiced = false;
    coverClass.paidByGym = false;
    coverClass.gymLocation = coverClass.gymName.split(' | ')[0];
    coverClass.gymManager = getManager(coverClass.gymLocation);

    console.log('Adding class: ' + JSON.stringify(coverClass));
    db.collection('classes', function(err, collection) {
        collection.insert(coverClass, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);

                //send emails
                emailer.sendNewCoverRequest(coverClass,db);
            }
        });
    });
}
 
exports.updateClass = function(req, res) {
    var id = req.params.id;
    var coverClass = req.body;
    console.log('Updating class: ' + id);
    console.log(JSON.stringify(coverClass));
    db.collection('classes', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, {$set:coverClass}, {safe:true}, function(err, result) {
            
            if (err) {
                console.log('Error updating class: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(coverClass);

                //if update assigned an instructor then email them to confirm they got the job
                if (coverClass.instructorAssigned != "false"){
                    db.collection('instructors', function(err, collection) {
                        collection.findOne({'_id':new BSON.ObjectID(coverClass.instructorAssigned)}, function(err, instructor) {
                            //find full class details
                            db.collection('classes', function(err, collection) {
                                collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, myclass) {
                                    //send email
                                    emailer.sendInstructorAssigned(instructor, myclass);
                                });
                            }); 
                        });
                    });
                }

            }

        });
    });
}


exports.claimClass = function(req, res) {
    var url_parts = url.parse(req.url, true);
    var classid = url_parts.query.classID;
    var instructorid = url_parts.query.instructorID;
    console.log('Intructor ' + instructorid + ' has tried to claim class ' + classid);

    db.collection('classes', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(classid)}, function(err, myclass) {
            
            //if class has instructor assigned already then stop here
            if (myclass.instructorAssigned != false && myclass.instructorAssigned != "false"){
                console.log('Instructor was too slow');
                res.send('Sorry, someone has already claimed this class. Be quicker next time.')
            }else{
                console.log('Updating class ' + classid + ' - instructor ' + instructorid + ' has claimed it.');
                db.collection('classes', function(err, collection) {
                    collection.update({'_id':new BSON.ObjectID(classid)}, {$set: {instructorAssigned: instructorid}}, {w:1}, function(err, result) {
                        res.send('Congratulations. You were first to claim this class. You should receive a confirmation email momentarily.');

                        //send emails to instructor and admin about that class
                        db.collection('instructors', function(err, collection) {
                            collection.findOne({'_id':new BSON.ObjectID(instructorid)}, function(err, instructor) {
                                //send email
                                emailer.sendInstructorAssigned(instructor, myclass);
                            });
                        });

                    });
                });
            }

        });
    });
};


exports.updateClassIntructorPaidSwitch = function(req, res) {
    var id = req.params.id;
    var coverClass = req.body;
    console.log('Updating class ' + id + ' - instructor paid.');

    //check if instructor paid is true or false
    db.collection('classes', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            if (item.instructorAssigned != "false" && item.instructorAssigned != false){
                var paid;
                if(item.instructorPaid){
                    paid=false;
                }else{
                    paid=true;
                }

                db.collection('classes', function(err, collection) {
                    collection.update({'_id':new BSON.ObjectID(id)}, {$set: {instructorPaid: paid}}, {w:1}, function(err, result) {
                        
                        res.send(JSON.stringify(result));

                        //find details for instructor
                        db.collection('instructors', function(err, instrCollection) {
                            console.log(item.instructorAssigned);
                            instrCollection.findOne({'_id':new BSON.ObjectID(item.instructorAssigned)}, function(err, instr) {
                                //send email to instructor
                                emailer.sendInstructorPaid(instr, item);
                            });
                        });
                    });
                });
            }else{
                res.send('ERROR: No instructor assigned.');
            }
        });
    });
}


exports.updateClassGymInvoicedSwitch = function(req, res) {
    var id = req.params.id;
    var coverClass = req.body;
    console.log('Updating class - gym invoiced: ' + id);

    //check if gym invoiced is true or false
    db.collection('classes', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            var invoiced;
            if(item.gymInvoiced){
                invoiced=false;
            }else{
                invoiced=true;
            }

            db.collection('classes', function(err, collection) {
                collection.update({'_id':new BSON.ObjectID(id)}, {$set: {gymInvoiced: invoiced}}, {w:1}, function(err, result) {
                    res.send(JSON.stringify(result));
                });
            });

        });
    });
}

exports.updateClassesPaidByGymSwitch = function(req, res) {
    var id = req.params.id;
    var coverClass = req.body;
    console.log('Updating class - paid by gym: ' + id);

    //check if paid by gym is true or false
    db.collection('classes', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            var paid;
            if(item.paidByGym){
                paid=false;
            }else{
                paid=true;
            }

            db.collection('classes', function(err, collection) {
                collection.update({'_id':new BSON.ObjectID(id)}, {$set: {paidByGym: paid}}, {w:1}, function(err, result) {
                    res.send(JSON.stringify(result));
                });
            });

        });
    });
}

exports.deleteClass = function(req, res) {
    var id = req.params.id;
    console.log('Deleting class: ' + id);
    db.collection('classes', function(err, collection) {
        collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred - ' + err});
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(JSON.stringify(result));
            }
        });
    });
}


exports.findInstructorById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving instructors: ' + id);
    db.collection('instructors', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};
 
exports.findAllInstructors = function(req, res) {    
    var query = url.parse(req.url, true).query;
    db.collection('instructors', function(err, collection) {
        collection.find(query).toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.findNewInstructors = function(req, res) {
    var confirmed = {
        'confirmed':"false"    
    };

    db.collection('instructors', function(err, collection) {
        collection.find(confirmed).toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.findApprovedInstructors = function(req, res) {
    var approved = {
        'confirmed': "true"
    };

    db.collection('instructors', function(err, collection) {
        collection.find(approved).sort({ firstName: 1, lastName: 1}).toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.approveInstructor = function(req, res) {

    var id = req.params.id;
    var instructor = req.body;

    console.log('Instructor ' + id + ' has been approved.');

    db.collection('instructors', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, {$set: {confirmed: "true"}}, {w:1}, function(err, result) {
            res.send(result);

            //find details for instructor
            collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, result) {
                //send email to instructor
                emailer.sendApproveInstructor(result);
            });
            
        });
    });
}
 
exports.addInstructor = function(req, res) {
    var instructor = req.body;
    //make instructor uncorfirmed:
    instructor.confirmed="false";
    console.log('Adding instructor: ' + JSON.stringify(instructor));
    db.collection('instructors', function(err, collection) {
        collection.insert(instructor, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);

                //send emails 
                emailer.sendNewInstructorSignedUp(instructor);

            }
        });
    }); 
}
 
exports.updateInstructor = function(req, res) {
    var id = req.params.id;
    var instructor = req.body;

    console.log('Updating instructor: ' + id);
    console.log(JSON.stringify(instructor));
    db.collection('instructors', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, {$set:instructor}, {safe:true}, function(err, result) {

            if (err) {
                console.log('Error updating instructor: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(instructor);

                //if update disapproved an instructor then email them to tell them they are suspended / out.
                if (instructor.confirmed == "false"){
                    db.collection('instructors', function(err, collection) {
                        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, instructor) {
                            //send email
                            emailer.sendInstructorDisapproved(instructor);
                        });
                    });
                }

            }
        });
    });
}
 
exports.deleteInstructor = function(req, res) {
    var id = req.params.id;
    console.log('Deleting instructor: ' + id);
    db.collection('instructors', function(err, collection) {
        collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred - ' + err});
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
}


