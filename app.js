
/**
 * Module dependencies.
 */
//var flash = require('connect-flash');
//var mongo = require('mongodb');
var express = require('express')
  , api = require('./api.js')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

//var Server = mongo.Server,
//    Db = mongo.Db,
//    BSON = mongo.BSONPure;

//var passport = require('passport')
//  , LocalStrategy = require('passport-local').Strategy;

var app = express();


app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

// all environments
app.set('port', process.env.PORT || 80);
//app.set('views', __dirname + '/views');
//app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
/*
var server = new Server('ds043388.mongolab.com', 43388, {auto_reconnect: true});
var userDb = new Db('users', server);
userDb.open(function(err, db) {
    if(!err) {
        db.authenticate('hughht5', 'Default11', function(err, success) {
            console.log("Connected to 'users' database");
            db.collection('users', {strict:true}, function(err, collection) {
                if (err) {
                    console.log("The 'users' collection is empty!");
                }
            });
        });
    }
});

passport.use(new LocalStrategy(
	function(username, password, done) {
		console.log('Logging in user: ' + username + '   ' + password);
		userDb.collection('users', function(err, collection) {
		    collection.findOne({ username: username }, function(err, user) {
				if (err) { return done(err); }
				if (!user) {
					return done(null, false,{ message: 'Incorrect username.' });
				}
				if (!user.validPassword(password)) {
					return done(null, false,{ message: 'Incorrect password.' });
				}
				return done(null, user);
			});
		});
	}
));

*/


/*
//test
app.get('/api/test',
	passport.authenticate('local', { failureRedirect: '/login.html' }),
	api.findAllClasses);

//login a user
app.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login.html',
                                   failureFlash: false })
);
*/

//basic authentication for admin endpoints
var auth = express.basicAuth(function(user, pass, callback) {
 var result = (user === 'admin' && pass === 'password');
 callback(null /* error */, result);
});

app.get('/', routes.index);
app.get('/users', user.list);


//classes
app.get('/api/classes',auth,api.findAllClasses);
app.get('/api/classes/:id',auth,api.findClassById);
app.post('/api/classes',api.addClass);
app.put('/api/classes/:id',auth,api.updateClass);
app.put('/api/classesIntructorPaidSwitch/:id',auth,api.updateClassIntructorPaidSwitch);
app.put('/api/classesGymInvoicedSwitch/:id',auth,api.updateClassGymInvoicedSwitch);
app.put('/api/classesPaidByGymSwitch/:id',auth,api.updateClassesPaidByGymSwitch);
app.delete('/api/classes/:id',auth,api.deleteClass); //security

//instructors
app.get('/api/instructors',auth,api.findAllInstructors);
app.get('/api/instructorsNew',auth,api.findNewInstructors);
app.get('/api/instructorsApproved',auth,api.findApprovedInstructors);
app.get('/api/instructors/:id',auth,api.findInstructorById);
app.post('/api/instructors',api.addInstructor);
app.put('/api/instructorsApprove/:id',auth,api.approveInstructor);
app.put('/api/instructors/:id',auth,api.updateInstructor);
app.delete('/api/instructors/:id',auth,api.deleteInstructor); //security


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
