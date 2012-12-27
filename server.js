/**
 * All our external requirements
 */
var express = require('express');
var mongoose = require('mongoose');
var http = require('http');
var less = require('less');
var dust = require('dustjs-linkedin');
var cons = require('consolidate');
var path = require('path');
var store = new express.session.MemoryStore;

/**
 * Our own modules
 */
var Schemas = require('./schemas');
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
	//app.set('port', process.env.PORT || 8080);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'dust');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser('wigglybits'));
	app.use(express.session({ secret: 'whatever', store: store }));
	app.use(express.session());
	app.use(require('less-middleware')({ src: __dirname + '/public' }));
	app.use(express.static(path.join(__dirname, 'public')));
	app.use(app.router);
	
	// middleware
	app.use(function(req, res, next){
		if (req.session.user) {
			//res.locals.message = req.flash();
			res.locals.session = req.session;
			res.locals.q = req.body;
			res.locals.err = false;
			next();
		} else {
			if (!isFirstRun) res.redirect('/login');
		}
		
	});

});

// Initialize models
models = new Schemas(mongoose);

// Prepare the routes variable
var routes = false;

// This function will initialize the normal routes
app.initializeRoutes = function() {
	
	// Clear all existing GET routes
	app.routes.get = [];
	
	routes = new Routes(app, models);
	
	isFirstRun = false;
}

// Do this once the database connection has been made
db.once('open', function callback () {
	
	models.User.findOne({username: /.*/i}, function(err, user) {
		if (user === null) { // No users found
			// Initialize the first run, create temporary routes
			var FirstRun = require('./firstrun');
			var firstRun = new FirstRun(app, models);
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
