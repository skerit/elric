var bcrypt = require('bcrypt');
var async = require('async');

module.exports = function Routes (elric) {
	
	/**
	 * Login routes
	 */
	elric.app.get('/login', function (req, res) {
		elric.render(req, res, 'page/login');
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

		elric.render(req, res, 'admin/index', {username: req.session.username, admin: elric.adminArray});
	});
	
	/**
	 * Home routes
	 */
	elric.app.get('/', function (req, res) {
		elric.render(req, res, 'page/index', {username: req.session.username, timestamp: new Date().getTime()});
	});
	
	/**
	 * Elric routes
	 */
	elric.addRoute('/doek', [{menu: 'sidebar', icon: 'picture'}], 'Doek', function (req, res) {
	
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
				
				// Expose the records we just searched for
				elric.expose('rooms', results.rooms, res);
				elric.expose('elements', results.elements, res);
				elric.expose('elementTypes', results.elementTypes, res);
				
				elric.render(req, res, 'doek/index', results);
			}
		);
	});
	
	/**
	 * Device routes
	 */
	elric.addRoute('/devices', [{menu: 'sidebar', icon: 'lightbulb'}], 'Devices', function (req, res) {
	
		var device = elric.models.device;
		
		var interfaces = {};
		
		// Add a clean copy of the interfaces
		for (var i in elric.interfaces) {
			var iface = elric.interfaces[i];
			interfaces[i] = {
				name: iface.name,
				title: iface.title,
				commands: iface.commands
			};
		}
		
		var protocols = {};
		
		// Add a clean copy of the protocols
		for (var i in elric.automationProtocols) {
			
			var ap = elric.automationProtocols[i];
			
			protocols[i] = {
				name: ap.name,
				title: ap.title,
				description: ap.description,
				addressBlueprint: ap.addressBlueprint,
				commands: ap.commands
			};
		}
		
		var device_types = {};
		
		// Add a clean copy of the device types
		for (var i in elric.deviceTypes) {
			var dt = elric.deviceTypes[i];
			
			device_types[i] = {
				name: dt.name,
				title: dt.title,
				protocol: dt.protocol,
				category: dt.category,
				commands: dt.commands
			};
		}
		
		var devices = {};
		
		// Add a clean copy of the devices
		for (var i in device.cache) {
			
			var d = device.cache[i];
			
			var td = {
				_id: d._id,
				address: d.address,
				automation_protocol: d.automation_protocol,
				device_type_id: d.device_type,
				interface_type: d.interface_type,
				name: d.name,
				interfaces: d.interfaces
			};
			
			// Add the main interface type
			td.interface = interfaces[d.interface_type];
			
			// Add the protocol
			td.protocol = protocols[d.automation_protocol];
			
			// Add the device_type
			td.device_type = device_types[d.device_type];

			devices[i] = td;
		}
		
		var results = {
			devices: devices,
			interfaces: interfaces
		};

		elric.render(req, res, 'page/devices', results);
	});
	
	/**
	 * Sending a command to a device over http
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.07
	 * @version  2013.02.13
	 */
	elric.app.post('/devices/command/:id', function(req, res){
		
		res.end('{"message": "ok", "error": false}');
		
		var deviceid = req.params.id;
		var command = req.body.command;
		var command_type = req.body.command_type;
		
		elric.log.debug('Sending command "' + command + '" to device "' + deviceid + '" through the director');
		
		// Send the command to the director, which will propagate it
		elric.director.sendCommand(deviceid, {command_type: command_type, command: command});
	});
	
	/**
	 * Flow & Scenario routes
	 */
	elric.addRoute('/flows', [{menu: 'sidebar', icon: 'random'}], 'Flows & Scenarios', function (req, res) {
	
		var scenario = elric.models.scenario;
		var flow = elric.models.flow;
		var par = {};
		
		// Prepare function to find all rooms
		par.scenarios = function(callback) {
			scenario.model.find({}, function(err, items) {
				callback(null, items);
			});
		}
		
		// Prepare function to find all roomElements
		par.flows = function(callback) {
			flow.model.find({}, function(err, items) {
				callback(null, items);
			});
		};
		
		// Execute the find functions
		async.parallel(
			par,
			function(err, results) {
				
				results.elementTypes = elric.memobjects.elementTypes;
				
				elric.expose('flow-results', results, res);
				
				elric.render(req, res, 'flows/index', results);
			}
		);
	});
	
	elric.app.get('/flow/add', function (req, res) {
		
		var activities = {};
		var actions = {};
		
	
		// Normalize the activities
		for (var activity_name in elric.activities) {
			var a = elric.memobjects.activities[activity_name];
			
			activities[activity_name] = {
				name: a.name,
				title: a.title,
				plugin: a.plugin,
				categories: a.categories,
				ongoing: a.ongoing,
				new: a.new,
				payload: a.payload,
				blueprint: a.blueprint,
				origin: a.origin
			};
		}
		
		// Normalize the actions
		for (var action_name in elric.actions) {
			var a = elric.memobjects.actions[action_name];
			
			actions[action_name] = {
				name: a.name,
				title: a.title,
				description: a.description,
				activity_trigger: a.activity_trigger
			};
		}

		elric.render(req, res, 'flows/add', {activities: activities, actions: actions});
	});
	
}
