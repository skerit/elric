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
var rfxcom = require('rfxcom');
var hawkejs = require('./hawkejs');

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
elric.http = http;

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

// Template info
elric.templates = {};
elric.templates.compiled = {};

elric.plugins = {};
elric.models = {};
elric.capabilities = {};
elric.elementTypes = {};
elric.activities = {};

// Memobjects are like cakephp enums
// A collection of records that can be used
// as a source for a model's field.
elric.memobjects = {};
elric.memobjects.elementTypes = elric.elementTypes;
elric.memobjects.capabilities = elric.capabilities;
elric.memobjects.activities = elric.activities;

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
elric.events.activities = new elric.classes.ElricEvent('activities');

// Use IO's logger
elric.log = elric.io.log;

// Enable hawkejs debug
hawkejs._debug = true;

// Use hawkejs as our template engine, map it to the .ejs extension
app.engine('ejs', hawkejs.__express);

// Add client side suport
hawkejs.enableClientSide(path.join(__dirname, 'public', 'js'), 'js/');

// Express configurations
app.configure(function(){

	var bootstrapPath = path.join(__dirname, 'node_modules', 'bootstrap');
	app.set('views', __dirname + '/assets/hawkejs');
	app.set('view engine', 'ejs');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser('wigglybits'));
	app.use(express.session({ secret: 'humanTransmutationIsANoNo', store: store }));
	app.use(express.session());
	app.use('/storage', express.static(local.storage));
	app.use('/img', express.static(path.join(bootstrapPath, 'img')));
	app.use('/img', express.static(path.join(__dirname, 'public', 'img')));
	app.use('/hawkejs', express.static(path.join(__dirname, 'assets', 'hawkejs')));
	app.use('/js/bootstrap', express.static(path.join(bootstrapPath, 'js')));
	app.use(lessmw({src    : path.join(__dirname, 'assets', 'less'),
					paths  : [path.join(bootstrapPath, 'less')],
					dest   : path.join(__dirname, 'public', 'stylesheets'),
					prefix : '/stylesheets'
					}));
	app.use(express.static(path.join(__dirname, 'public')));
	
	// Add Hawkejs' middleware
	app.use(hawkejs.middleware);
	
	// middleware
	app.use(function(req, res, next){
		
		// Skip authentication if it's a noauth link
		if (req.originalUrl.substring(0, 8) == "/noauth/") {
			next();
			return;
		}

		// Disabled login requirement for hawkejs dev
		next();

		/*
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
		}*/ // Disabled login requirement for hawkejs dev
		
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

// Start the server
elric.server.listen(local.serverport, function(){
	elric.log.info(util.format('Elric server listening on port %d in %s mode',
		local.serverport,
		app.settings.env));
});
