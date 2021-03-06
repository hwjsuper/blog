var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
//var users = require('./routes/users');

var settings = require('./settings');
var flash = require('connect-flash');
var session = require('express-session');
//var MongoStore = require('connect-mongo')(session);
//var mysql = require('mysql');
var mysql = require('easymysql');
// var conn = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: 'clannad',
//   database: 'blog',
//   port: 3306
// });
// conn.connect();
// conn.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
//     if (err) throw err;
//     console.log('The solution is: ', rows[0].solution);
// });
// conn.end();

//for upload files
var multer = require('multer');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(flash());
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//setting sessions
app.use(session({
	secret: settings.cookiesSecret,
	key: settings.database, //cookie name
	cookie: {
		maxAge: 1000 * 60 * 60 * 24 * 30
	}, //30 days
	// store: new mysql({
	//   db: settings.database,
	//   host: settings.host,
	//   port: settings.port
	// })
}));

app.use(multer({
	dest: './public/images',
	rename: function(fieldname, filename) {
		return filename;
	}
}));

app.use('/', routes);
// app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});


module.exports = app;