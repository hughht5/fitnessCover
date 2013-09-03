var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var url = require('url');
var emailer = require('./emailer.js');

 
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

 
//var server = new Server('localhost', 27017, {auto_reconnect: true});

var server = new Server('ds041168.mongolab.com', 41168, {auto_reconnect: true});

//classes database

classdb = new Db('classes', server);
 
classdb.open(function(err, db) {
    if(!err) {
        db.authenticate('hughht5', 'Default11', function(err, success) {
            console.log("Connected to 'classes' database");
            db.collection('classes', {strict:true}, function(err, collection) {
                if (err) {
                    console.log("The 'classes' collection is empty!");
                }
            });
        });
    }
});

exports.findClassById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving class: ' + id);
    classdb.collection('classes', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};
 
exports.findAllClasses = function(req, res) {
    classdb.collection('classes', function(err, collection) {
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
    classdb.collection('classes', function(err, collection) {
        collection.insert(coverClass, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);

                //send emails
                emailer.sendNewCoverRequest(coverClass);
            }
        });
    });
}
 
exports.updateClass = function(req, res) {
    var id = req.params.id;
    var coverClass = req.body;
    console.log('Updating class: ' + id);
    console.log(JSON.stringify(coverClass));
    classdb.collection('classes', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, {$set:coverClass}, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating class: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(coverClass);
            }
        });
    });
}

exports.updateClassIntructorPaidSwitch = function(req, res) {
    var id = req.params.id;
    var coverClass = req.body;
    console.log('Updating class - instructor paid: ' + id);

    //check if instructor paid is true or false
    classdb.collection('classes', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            var paid;
            if(item.instructorPaid){
                paid=false;
            }else{
                paid=true;
            }

            classdb.collection('classes', function(err, collection) {
                collection.update({'_id':new BSON.ObjectID(id)}, {$set: {instructorPaid: paid}}, {w:1}, function(err, result) {
                    res.send(result);
                });
            });

        });
    });
}

exports.updateClassGymInvoicedSwitch = function(req, res) {
    var id = req.params.id;
    var coverClass = req.body;
    console.log('Updating class - gym invoiced: ' + id);

    //check if gym invoiced is true or false
    classdb.collection('classes', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            var invoiced;
            if(item.gymInvoiced){
                invoiced=false;
            }else{
                invoiced=true;
            }

            classdb.collection('classes', function(err, collection) {
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
    classdb.collection('classes', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            var paid;
            if(item.paidByGym){
                paid=false;
            }else{
                paid=true;
            }

            classdb.collection('classes', function(err, collection) {
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
    classdb.collection('classes', function(err, collection) {
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



//Instructors database
//var server2 = new Server('localhost', 27017, {auto_reconnect: true});

var server2 = new Server('ds041218.mongolab.com', 41218, {auto_reconnect: true});

instructordb = new Db('instructors', server2);

instructordb.open(function(err, db) {
    if(!err) {
        db.authenticate('hughht5', 'Default11', function(err, success) {
            console.log("Connected to 'instructors' database");
            db.collection('instructors', {strict:true}, function(err, collection) {
                if (err) {
                    console.log("The 'instructors' collection is empty!");
                }
            });
        });
    }
});
 

exports.findInstructorById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving instructors: ' + id);
    instructordb.collection('instructors', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};
 
exports.findAllInstructors = function(req, res) {    
    var query = url.parse(req.url, true).query;
    instructordb.collection('instructors', function(err, collection) {
        collection.find(query).toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.findNewInstructors = function(req, res) {
    var confirmed = {
        'confirmed':"false"    
    };

    instructordb.collection('instructors', function(err, collection) {
        collection.find(confirmed).toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.findApprovedInstructors = function(req, res) {
    var approved = {
        'confirmed': "true"
    };

    instructordb.collection('instructors', function(err, collection) {
        collection.find(approved).toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.approveInstructor = function(req, res) {

    var id = req.params.id;
    var instructor = req.body;

    console.log('Instructor ' + id + ' has been approved.');

    instructordb.collection('instructors', function(err, collection) {
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
    instructordb.collection('instructors', function(err, collection) {
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
    instructordb.collection('instructors', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, {$set:instructor}, {safe:true}, function(err, result) {

            if (err) {
                console.log('Error updating instructor: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(instructor);
            }
        });
    });
}
 
exports.deleteInstructor = function(req, res) {
    var id = req.params.id;
    console.log('Deleting instructor: ' + id);
    instructordb.collection('instructors', function(err, collection) {
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


