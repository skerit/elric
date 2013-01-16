/**
 * All our external requirements
 */
var express = require('express');
var mongoose = require('mongoose');
var http = require('http');
var less = require('less');
var lessmw = require('less-middleware')
var dust = require('dustjs-linkedin');
dust.helpers = require('dustjs-helpers');
var cons = require('consolidate');
var path = require('path');
var store = new express.session.MemoryStore;
var $ = require('jquery');
var bcrypt = require('bcrypt');
var async = require('async');
var io = require('socket.io');
var util = require('util');
var randomstring = require('randomstring');
var fs = require('fs');
//var scp = require('scp');
var mv = require('mv');
var base64 = require('base64js');
var mkdirp = require('mkdirp');

/**
 * Our own modules
 */
var Routes = require('./routes');
var local = require('./local');

// Prepare the routes variable
var routes = false;

// Initialize express
var app = express();

// Connect to the database
mongoose.connect('mongodb://' + local.mongohost + '/' + local.mongodb);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

/**
 * This variable will be passed allong to plugins
 */
var elric = {};

elric.isFirstRun = true; // Initial first run setting
elric.classes = {};

elric.routes = routes;
elric.mongoose = mongoose;  // Mongoose DB wrapper
elric.db = db;              // Direct DB access
elric.app = app;

// Store tools in here
elric.tools = {};
//elric.tools.scp = scp;
elric.tools.path = path;
elric.tools.fs = fs;
elric.tools.mv = mv;
elric.tools.base64 = base64;
elric.tools.mkdirp = mkdirp;

// Create a link to the local settings
elric.local = local;

elric.plugins = {};
elric.models = {};
elric.capabilities = {};
elric.elementTypes = {};

// Memobjects are like cakephp enums
// A collection of records that can be used
// as a source for a model's field.
elric.memobjects = {};
elric.memobjects.elementTypes = elric.elementTypes;
elric.memobjects.capabilities = elric.capabilities;

// Temporary storage & object cache
elric.temp = {};
elric.movecallbacks = {};
elric.temp.dirs = {}; // Store if a directory exists in here
elric.temp.models = {};
elric.temp.misc = {}; // Misc storage

elric.admin = {};
elric.adminArray = [];
elric.menus = {};
elric.randomstring = randomstring.generate;
elric.activeUsers = {};
elric.exposedObjects = {};

// Instances of the ElricClient class go here (even unconnected)
elric.clients = {};

// Create the HTTP server
elric.server = http.createServer(app);

// Create the IO websocket server
elric.io = io.listen(elric.server);

// Create a websocket object
elric.websocket = {};

// Load the Elric Event class
require('./event')(elric);

// Prepare an object for storing event emitters
elric.events = {};
elric.events.all = new elric.classes.ElricEvent('all', elric);
elric.events.clients = new elric.classes.ElricEvent('clients');
elric.events.browsers = new elric.classes.ElricEvent('browsers');

// Use IO's logger
elric.log = elric.io.log;

// Set Dust as our template engine
app.engine('dust', cons.dust);

// Express configurations
app.configure(function(){

	var bootstrapPath = path.join(__dirname, 'node_modules', 'bootstrap');
	app.set('template_engine', 'dust');
	app.set('views', __dirname + '/views');
	app.set('view engine', 'dust');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser('wigglybits'));
	app.use(express.session({ secret: 'humanTransmutationIsANoNo', store: store }));
	app.use(express.session());
	app.use('/img', express.static(path.join(bootstrapPath, 'img')));
	app.use('/js/bootstrap', express.static(path.join(bootstrapPath, 'js')));
	app.use(lessmw({src    : path.join(__dirname, 'assets', 'less'),
					paths  : [path.join(bootstrapPath, 'less')],
					dest   : path.join(__dirname, 'public', 'stylesheets'),
					prefix : '/stylesheets'
					}));
	app.use(express.static(path.join(__dirname, 'public')));
	
	// middleware
	app.use(function(req, res, next){
		
		// Skip authentication if it's a noauth link
		if (req.originalUrl.substring(0, 8) == "/noauth/") {
			next();
			return;
		}
		
		// See if the authentication cookies have been set
		if (req.cookies.user && req.cookies.pass) {
			
			// Find the user for the cookie
			elric.models.user.model.findOne({username: req.cookies.user}, function(err, user) {
				
				var redirect = false;
				
				if (user === null) {
					redirect = true;
				} else {
					redirect = !elric.checkPassword(req, res, req.cookies.pass, user);
				}

				if (redirect) {
					if (!elric.redirectLogin(res, req)) next();
				} else {
					next();
				}

			});
			
		} else {
			
			if (req.session.user) {
				//res.locals.message = req.flash();
				res.locals.session = req.session;
				res.locals.q = req.body;
				res.locals.err = false;
				next();
			} else {
				if (!elric.redirectLogin(res, req)) next();
			}
		}
	});
	
	// Get notifications
	app.use(function(req, res, next) {
		
		res.locals.notifications = []
		
		if (req.session.user) {
			var notification = elric.models.notification.model;
			notification.find({}).sort('-created').limit(6).execFind(function(err,notifications){
				res.locals.notifications = notifications;
				next();
			});
		} else {
			next();
		}
	});
	
	app.use(app.router);
});

// Initiate admin
require('./admin')(elric);

// Load helper functions
require('./helpers')(elric);

// Load plugins, models, ...
require('./config')(elric);

// Load our own dust helpers
require('./dust-helpers')(dust, elric);

// Initiate clients
require('./client')(elric);

// Websocket handler stuff
require('./websocket/handler')(elric);
require('./websocket/client')(elric);
require('./websocket/browser')(elric);

// Make sure our storage folder exists
elric.tools.mkdirp(local.storage);

// This function will initialize the normal routes
app.initializeRoutes = function() {
	
	/**
	 * @todo: DO NOT clear all routes, only delete the first run one
	 */
	//app.routes.get = [];
	//console.log(app.routes.get);
	
	routes = new Routes(elric);
	elric.routes = routes;
	
	elric.isFirstRun = false;
}

// Do this once the database connection has been made
db.once('open', function callback () {
	
	elric.models.user.model.findOne({username: /.*/i}, function(err, user) {
		if (user === null) { // No users found
			// Initialize the first run, create temporary routes
			var FirstRun = require('./firstrun');
			var firstRun = new FirstRun(elric);
		} else {
			app.initializeRoutes();
		}
	});
	
});

/*
app.get('/m', function(req, res){
  var body = '<img src="http://192.168.1.3:3000/motion" class="motion">';
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Length', body.length);
  res.end(body);
});
*/


//db.once('open', function callback () {
	
	/*var silence = new Kitten({ name: 'Silence' })
	console.log(silence.name) // 'Silence'
	
	silence.save();*/
	
	/*var skerit = new models.User({username: 'Skerit', firstname: 'Jelle', lastname: 'De Loecker', email: 'jelle@kipdola.be', password: 'Twadi8923'});
	skerit.save();*/
	
	/*models.Kitten.findOne({ name: /^Silen/ }, function callback(err, kitten) {
		console.log(kitten);
		kitten.name = 'Silencios';
		kitten.save();
	});*/
  
//});


/*
app.get('/motion', function(req, res) {
	
	var boundary = "BoundaryString";

  var options = {
    // host to forward to
    host:   '192.168.1.2',
    // port to forward to
    port:   8302,
    // path to forward to
    path:   '/',
    // request method
    method: 'GET',
    // headers to send
    headers: req.headers
  };

  var creq = http.request(options, function(cres) {

		res.setHeader('Content-Type', 'multipart/x-mixed-replace;boundary="' + boundary + '"');
		res.setHeader('Connection', 'close');
		res.setHeader('Pragma', 'no-cache');
		res.setHeader('Cache-Control', 'no-cache, private');
		res.setHeader('Expires', 0);
		res.setHeader('Max-Age', 0);

    // wait for data
    cres.on('data', function(chunk){
      res.write(chunk);
    });

    cres.on('close', function(){
      // closed, let's end client request as well 
      res.writeHead(cres.statusCode);
      res.end();
    });

  }).on('error', function(e) {
    // we got an error, return 500 error to client and log error
    console.log(e.message);
    res.writeHead(500);
    res.end();
  });

  creq.end();

});
*/

// Start the server
elric.server.listen(local.serverport, function(){
	elric.log.info(util.format('Elric server listening on port %d in %s mode',
														 local.serverport,
														 app.settings.env)
								 );
});