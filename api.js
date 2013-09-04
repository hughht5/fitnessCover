var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var url = require('url');
var emailer = require('./emailer.js');

 
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

//connect to database
var server = new Server('ds043378.mongolab.com', 43378, {auto_reconnect: true});
db = new Db('dev', server);

//open classDB
db.open(function(err, db) {
    if(!err) {
        db.authenticate('hughht5', 'Default11', function(err, success) {
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
        collection.find().toArray(function(err, items) {
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

exports.updateClassIntructorPaidSwitch = function(req, res) {
    var id = req.params.id;
    var coverClass = req.body;
    console.log('Updating class ' + id + ' - instructor paid.');

    //check if instructor paid is true or false
    db.collection('classes', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            if (item.instructorAssigned != "false"){
                var paid;
                if(item.instructorPaid){
                    paid=false;
                }else{
                    paid=true;
                }

                db.collection('classes', function(err, collection) {
                    collection.update({'_id':new BSON.ObjectID(id)}, {$set: {instructorPaid: paid}}, {w:1}, function(err, result) {
                        res.send(result);
                        
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
                    res.send(result);
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
                    res.send(result);
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
                res.send(req.body);
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


