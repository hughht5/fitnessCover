var mongo = require('mongodb');
 
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

 
var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('classes', server);
 
db.open(function(err, db) {
    if(!err) {
        console.log("Connected to 'classes' database");
        db.collection('classes', {strict:true}, function(err, collection) {
            if (err) {
                console.log("The 'classes' collection is empty!");
            }
        });
    }
});
 
exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving class: ' + id);
    db.collection('classes', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};
 
exports.findAll = function(req, res) {
    db.collection('classes', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.send(items);
        });
    });
};
 
exports.addClass = function(req, res) {
    var coverClass = req.body;
    console.log('Adding class: ' + JSON.stringify(wine));
    db.collection('classes', function(err, collection) {
        collection.insert(wine, {safe:true}, function(err, result) {
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
    console.log(JSON.stringify(wine));
    db.collection('classes', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, wine, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating class: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(wine);
            }
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







