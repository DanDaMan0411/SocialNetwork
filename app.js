var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');

// Init App
var app = express();
var http = require('http').Server(app);

//Development Setting
//mongoose.connect('mongodb://localhost/socialNetwork');

//Connects to online db. Used for production

mongoose.connect('mongodb://dan:daniscool123@ds017165.mlab.com:17165/garrio', function(err){
	console.log("Connecting to mongoose...");
	if (err){
		console.log("There is an error connecting to the db");
		console.log(err)
	};
});


var db = mongoose.connection;

var routes = require('./routes/index');
var users = require('./routes/users');

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Connect Flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user_friend_request = null;
  res.locals.user = req.user || null;
  next();
});

app.use('/', routes);
app.use('/users', users);

app.use(function(req, res, next){
	
	res.status(404);

	// respond with html page
	if (req.accepts('html')) {
		res.render('404', { url: req.url });
		return;
	}

	// respond with json
	if (req.accepts('json')) {
		res.send({ error: 'Not found' });
		return;
	}

	// default to plain-text. send()
	res.type('txt').send('Not found');

})

//Server configuration stuff

//Tries to find variable for openshift ip, if nothing then loads to localhost
var ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";

//Same as above, but with port
//If you want to load on localhost onto a different port, change 4000 to whatever port you please
var port = process.env.OPENSHIFT_NODEJS_PORT || 4000;

http.listen(port, ipaddress, function(){
	console.log('Server started');
	console.log('IP_ADDRESS: ' + ipaddress);
	console.log('PORT: ' + port)
})
