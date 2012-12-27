/**
 * All our external requirements
 */
var express = require('express');
var mongoose = require('mongoose');
var http = require('http');
var less = require('less');
var dust = require('dustjs-linkedin');
dust.helpers = require('dustjs-helpers');
var cons = require('consolidate');
var path = require('path');
var $ = require('jquery');
var bcrypt = require('bcrypt');
var store = new express.session.MemoryStore;

/**
 * Our own modules
 */
//var Schemas = require('./schemas');
var Routes = require('./routes');

/**
 * Initialize basic app functionality
 */

// Connect to the database
mongoose.connect('mongodb://192.168.1.2/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

var isFirstRun = true;

// Initialize express
var app = express();

// Set Dust as our template engine
app.engine('dust', cons.dust);

// Express configurations
app.configure(function(){

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
	app.use(require('less-middleware')({ src: __dirname + '/public' }));
	app.use(express.static(path.join(__dirname, 'public')));
	
	// middleware
	app.use(function(req, res, next){
		
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
	
	app.use(app.router);
	
});

// Initialize models
//models = new Schemas(mongoose);

// Prepare the routes variable
var routes = false;

dust.helpers.getitem = function(chunk, context, bodies, params) {
	var item = params.item;
	var field = params.field;
	chunk.write(item[field]);
	return chunk;
}

dust.helpers.lilink = function (chunk, context, bodies, params) {
	
	var href = params.href;
	var dest = params.dest;
	var title = params.title;
	var active = '';
	
	if (href == dest) {
		active = ' active';
	}
	
	chunk.write('<li class="' + active + '"><a href="' + href + '">' + title + '</a></li>');
	return chunk;
	
}

/**
 * This variable will be passed allong to plugins
 */
var elric = {}
elric.classes = {}
elric.routes = routes;
elric.mongoose = mongoose;
elric.app = app;
elric.plugins = {}
elric.models = {}
elric.admin = {}
elric.adminArray = []

elric.classes.Admin = function admin (model, options) {
	var thisAdmin = this;
	this.elric = elric;
	this.model = model;
	this.name = options.name;
	this.title = options.title ? options.title : this.name;
	
	// Admin routes
	elric.app.get('/admin/' + this.name + '/view', function (req, res) {
		
		model.model.find({}, function(err, items) {
			elric.render(req, res, 'adminView', {username: req.session.username, admin: elric.adminArray, items: items});
		});
		
	});
	
	elric.app.get('/admin/' + this.name + '/index', function (req, res) {
		
		model.model.find({}, function(err, items) {
			elric.render(req, res, 'adminIndex', {username: req.session.username, admin: elric.adminArray, items: items, options: options});
		});
		
	});
	
}

elric.redirectLogin = function redirectLogin (res, req) {
	if (!isFirstRun && req.originalUrl != '/login') {
		req.session.destination = req.originalUrl;
		res.redirect('/login');
		return true;
	} else {
		return false;
	}
}

elric.checkPassword = function checkPassword (req, res, password, user) {
	// See if password matches
	var passMatch = bcrypt.compareSync(password, user.password);
	
	if (passMatch) {
		req.session.user = user;
		req.session.username = user.username;
		
		res.cookie('pass', password, { maxAge: 900000, httpOnly: true });
		res.cookie('user', user.username, { maxAge: 900000, httpOnly: true });
		
		return true;
	} else {
		return false;
	}
}

elric.loadPlugin = function loadPlugin (pluginName) {
	var plugin = require('./plugins/' + pluginName + '/' + pluginName);
	elric.plugins[pluginName] = new plugin(elric);
}

elric.loadModel = function loadModel (modelName, pluginName) {
	
	var path = './models/' + modelName;
	
	if (pluginName !== undefined) {
		path = './plugins/' + pluginName + '/models/' + modelName;
	}
	
	var model = require(path);
	var m = new model(elric);
	
	// Store the new model
	elric.models[modelName] = m;
	
	// Create an admin interface?
	if (m.admin) {
		elric.admin[modelName] = new elric.classes.Admin(m, $.extend(true, {name: modelName}, m.admin));
		elric.adminArray.push(elric.admin[modelName]);
	}
}

elric.render = function render (req, res, view, options) {
	if (options === undefined) options = {}
	res.render(view, $.extend(true, {dest: req.originalUrl}, options));
}

// Load plugins, models, ...
elric.config = require('./config')(elric);

// This function will initialize the normal routes
app.initializeRoutes = function() {
	
	/**
	 * @todo: DO NOT clear all routes, only delete the first run one
	 */
	//app.routes.get = [];
	//console.log(app.routes.get);
	
	routes = new Routes(elric);
	elric.routes = routes;
	
	isFirstRun = false;
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

app.listen(3000);
console.log('Listening on port 3000');
