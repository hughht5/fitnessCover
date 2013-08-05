
/**
 * Module dependencies.
 */

var express = require('express')
  , api = require('./api.js')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

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

app.get('/', routes.index);
app.get('/users', user.list);

//classes
app.get('/api/classes',api.findAllClasses);
app.get('/api/classes:id',api.findClassById);
app.post('/api/classes',api.addClass);
app.put('/api/classes:id',api.updateClass);
//app.delete('/api/classes:id',api.deleteClass); //security

//instructors
app.get('/api/instructors',api.findAllInstructors);
app.get('/api/instructorsNew',api.findNewInstructors);
app.get('/api/instructorsApproved',api.findApprovedInstructors);
app.get('/api/instructors:id',api.findInstructorById);
app.post('/api/instructors',api.addInstructor);
app.put('/api/instructors:id',api.updateInstructor);
//app.delete('/api/instructors:id',api.deleteInstructor); //security


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
