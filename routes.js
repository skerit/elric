var bcrypt = require('bcrypt');
var async = require('async');

module.exports = function Routes (elric) {
	
	/**
	 * Login routes
	 */
	elric.app.get('/login', function (req, res) {
		elric.render(req, res, 'login');
	});
	
	elric.app.post('/login', function (req, res) {
		elric.models.user.model.findOne({username: req.body.username}, function(err, user) {
			if (user === null) { // No users found
				res.send({ error: 'User not found!', errors: err });
			} else {
				// See if password matches
				var passMatch = elric.checkPassword(req, res, req.body.password, user);
				
				if (passMatch) {
					
					// The url to redirect to after login
					var redirect = '/';
					
					// Have we set a different redirect destination in the session?
					if (req.session.destination) redirect = req.session.destination;
					
					// Send the data
					res.send({ success: 'Saved!', redirect: redirect});
					
				} else {
					res.send({ error: 'Password did not match!', errors: err });
				}
				
			}
		});
	});
	
	/**
	 * Admin routes
	 */
	elric.app.get('/admin', function (req, res) {
		elric.render(req, res, 'adminDashboard', {username: req.session.username, admin: elric.adminArray});
	});
	
	/**
	 * Client routes
	 */
	elric.app.get('/clients', function (req, res) {
		
		var C = elric.models.client.model;
		
		C.find({}, function (err, clients) {
			elric.render(req, res, 'clientDashboard', {username: req.session.username, clients: clients});
		});
	});
	
	elric.app.get('/clients/:id', function (req, res) {
		
		var C = elric.models.client.model;
		var P = elric.models.clientCapability.model;
		var par = {};
		
		// Find all the clients (for the sidebar)
		par.clients = function(callback) {
			C.find({}, function (err, clients) {
				callback(null, clients);
			});
		}
		
		// Find the client we wish to edit
		par.client = function(callback) {
			C.findOne({_id: req.params.id}, function (err, client) {
				callback(null, client);
			});
		}
		
		// Find all the set capabilities for this client
		par.capabilitySettings = function(callback) {
			P.find({client_id: req.params.id}, function (err, settings) {
				callback(null, settings);
			});
		}
		
		// Perform both finds in parallell, and render the view once both are complete
		async.parallel(
			par,
			function(err, results) {
				
				// Convert certain objects & arrays
				results.capabilities = elric.makeArray(elric.capabilities);
				results.settings = elric.makeObject(results.capabilitySettings, 'capability');
				
				// Expose certain variables for this request only
				elric.expose('workingclient', results.client._id, res);
				elric.expose('capsettings', results.settings, res);
				
				elric.render(req, res, 'clientEdit', results);
			}
		);
	});
	
	/**
	 * Home routes
	 */
	elric.app.get('/', function (req, res) {
		elric.render(req, res, 'index', {username: req.session.username});
	});
	
	/**
	 * Elric routes
	 */
	elric.addRoute('/doek', ['topbar'], 'Doek', function (req, res) {
	
		var room = elric.models.room;
		var element = elric.models.roomElement;
		var par = {};
		
		// Prepare function to find all rooms
		par.rooms = function(callback) {
			room.model.find({}, function(err, rooms) {
				callback(null, rooms);
			});
		}
		
		// Prepare function to find all roomElements
		par.elements = function(callback) {
			element.model.find({}, function(err, elements) {
				callback(null, elements);
			});
		};
		
		// Execute the find functions
		async.parallel(
			par,
			function(err, results) {
				results.elementTypes = elric.memobjects.elementTypes;
				elric.render(req, res, 'doek', results);
			}
		);
	});
	
}