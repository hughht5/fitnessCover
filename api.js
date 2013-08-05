var mongo = require('mongodb');
 
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

 
var server = new Server('localhost', 27017, {auto_reconnect: true});


//classes database

classdb = new Db('classes', server);
 
classdb.open(function(err, classdb) {
//    classdb.authenticate('fitnessCover', 'iamLHta7BAhD', function(err, success) {
        if(!err) {
            console.log("Connected to 'classes' database");
            classdb.collection('classes', {strict:true}, function(err, collection) {
                if (err) {
                    console.log("The 'classes' collection is empty!");
                }
            });
        }
//    });
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
    console.log('Adding class: ' + JSON.stringify(coverClass));
    classdb.collection('classes', function(err, collection) {
        collection.insert(coverClass, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
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
        collection.update({'_id':new BSON.ObjectID(id)}, coverClass, {safe:true}, function(err, result) {
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
var server2 = new Server('localhost', 27017, {auto_reconnect: true});

instructordb = new Db('instructors', server2);

instructordb.open(function(err, instructordb) {
    if(!err) {
        console.log("Connected to 'instructors' database");
        instructordb.collection('instructors', {strict:true}, function(err, collection) {
            if (err) {
                console.log("The 'instructors' collection is empty!");
            }
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
    instructordb.collection('instructors', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.findNewInstructors = function(req, res) {
    var confirmed = {
        'confirmed': {
            "$exists":false
        }
    };
    
    instructordb.collection('instructors', function(err, collection) {
        collection.find(confirmed).toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.findApprovedInstructors = function(req, res) {
    var approved = {
        'confirmed': true
    };

    instructordb.collection('instructors', function(err, collection) {
        collection.find(approved).toArray(function(err, items) {
            res.send(items);
        });
    });
};
 
exports.addInstructor = function(req, res) {
    var instructor = req.body;
    console.log('Adding instructor: ' + JSON.stringify(instructor));
    instructordb.collection('instructors', function(err, collection) {
        collection.insert(instructor, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
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
        collection.update({'_id':new BSON.ObjectID(id)}, instructor, {safe:true}, function(err, result) {
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







