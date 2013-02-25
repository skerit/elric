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
		
		elric.log.debug('Sending command "' + command + '" to device "' + deviceid + '" through the quartermaster');
		
		// Send the command to the director, which will propagate it
		elric.quartermaster.sendCommand(deviceid, {command_type: command_type, command: command});
	});
	
	/**
	 * Scenario routes
	 */
	elric.addRoute('/scenarios', [{menu: 'sidebar', icon: 'random'}], 'Scenarios', function (req, res) {
	
		var scenario = elric.models.scenario;
		var par = {};
		
		// Prepare function to find all roomElements
		par.scenarios = function(callback) {
			scenario.model.find({}, function(err, items) {
				callback(null, items);
			});
		};
		
		// Execute the find functions
		async.parallel(
			par,
			function(err, results) {
				
				results.elementTypes = elric.memobjects.elementTypes;
				
				elric.expose('scenario-results', results, res);
				
				elric.render(req, res, 'scenarios/index', results);
			}
		);
	});
	
	/**
	 * Add a new scenario and edit it
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.11
	 * @version  2013.02.21
	 */
	elric.app.get('/scenario/add', function (req, res) {
		
		// Create a new scenario
		var scenario = new elric.models.scenario.model({name: 'unnamed', user_id: req.session.user._id});
		
		// Already send this scenario to the client for editing
		elric.editScenario(req, res, scenario);
		
		// And save it
		scenario.save();
	});
	
	/**
	 * Edit an existing scenario
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.18
	 * @version  2013.02.21
	 */
	elric.app.get('/scenario/edit/:scenarioid', function (req, res) {
		
		var scenario = {};
		var scenarioid = req.params.scenarioid;
		
		if (typeof elric.models.scenario.cache[scenarioid] == 'undefined') {
			res.end('No scenario found');
			return;
		}
		
		scenario = elric.models.scenario.cache[scenarioid];
		
		elric.editScenario(req, res, scenario);
	});
	
	/**
	 * Create a new scenarioblock to use in a scenario
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.19
	 * @version  2013.02.21
	 */
	elric.app.post('/scenario/block/create', function (req, res) {
		
		var new_construct = {
			user_id: req.session.user._id,
			scenario_id: req.body.scenario_id,
			block_type: req.body.block_type
		};
		
		var block = new elric.models.scenarioBlock.model(new_construct);
		
		// Send the block to the client
		res.end(JSON.stringify(block));
		
		block.save();
	});
	
	/**
	 * Save a scenarioblock
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.20
	 * @version  2013.02.21
	 */
	elric.app.post('/scenario/block/:id/save', function (req, res) {
		
		var block_id = req.params.id;
		var block = req.body.block;
		
		var FB = elric.models.scenarioBlock.model;
		
		FB.findOne({_id: block_id}, function (err, block_record){
			
			delete block._id;
			delete block.user_id;
			delete block.scenario_id;
			delete block.updated;
			delete block.created;
			
			// Inject the block into the existing record
			elric.inject(block_record, block);
			
			// Save the modified block record
			block_record.save();
		});
		
		res.end('ok');
	});
	
	/**
	 * Edit a scenario block
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.19
	 * @version  2013.02.21
	 */
	elric.app.get('/scenario/block/edit/:id', function (req, res) {
		
		var block_id = req.params.id;
		var block = elric.models.scenarioBlock.cache[block_id];
		
		var payload = {
			block: block,
			activities: elric.activities,
			actions: elric.actions
		};
		
		elric.expose('scenario_block', block, res);
		
		elric.render(req, res, 'blocks/edit_' + block.block_type, payload);
	});
	
	/**
	 * Save an existing scenario
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.18
	 * @version  2013.02.21
	 */
	elric.app.post('/scenario/save/:id', function (req, res) {
		
		res.end('{"message": "ok", "error": false}');
		
		var name = req.body.name;
		var user_id = req.session.user._id;
		var blocks = req.body.blocks;
		
		var scenario = elric.models.scenario.cache[req.params.id];
		
		elric.saveScenario(name, scenario, blocks, user_id, req);
		
		var test = elric.director.getVariables(scenario);
		console.log(test);
		
	});
	
}
