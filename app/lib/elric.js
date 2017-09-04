var all_capabilities = alchemy.getClassGroup('elric_capability'),
    all_events = alchemy.getClassGroup('elric_event'),
    all_actions = alchemy.getClassGroup('elric_action'),
    persisted = alchemy.getClassGroup('elric_persisted_shares'),
    cron = alchemy.use('node-cron'),
    dgram = require('dgram'),
    fs = require('fs');

/**
 * The Elric Singleton class
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.0.1
 * @version  0.1.0
 */
var Elric = Function.inherits('Informer', function SingletonElric() {

	// Only allow 1 elric instance
	if (global.elric) {
		return global.elric;
	}

	// Dummy offset and latency
	// Will always be zero for the server
	this.offset = 0;
	this.latency = 0;

	// The scheduled cron jobs
	this.cron_jobs = [];

	// The connected clients
	this.clients = [];

	// Load all the clients
	this.init();
});

/**
 * Init function that gets called by the constructor
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Elric.setMethod(function init() {

	var that = this;

	// Only init once
	if (global.elric) {
		return;
	}

	alchemy.sputnik.beforeSerial('startServer', function initElric(done) {

		// Wait for model compositions and such
		Blast.loaded(function() {
			that.initClientList(done);
			that.loadCron();

			that.client_indicator = that.addIndicator({type: 'client', name: 'clients'});
		})
	});
});

/**
 * Create a janeway indicator
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
Elric.setMethod(function addIndicator(options) {
	try {
		return __Janeway.addIndicator(options);
	} catch (err) {
		return null;
	}
});

/**
 * Get the current timestamp
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @return   {Number}
 */
Elric.setMethod(function now() {
	return Date.now();
});

/**
 * Get a persisted share
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Elric.setMethod(function persistedShare(name) {

	var value,
	    path;

	if (!persisted[name]) {

		// Try getting it from the temp folder
		path = PATH_TEMP + '/' + name + '.json';

		// Get the file
		try {
			value = fs.readFileSync(path) + '';
			value = JSON.undry(value);
		} catch (err) {
			console.log('Error: ' + err);
			value = {};
		}

		persisted[name] = value;
	}

	return persisted[name];
});

/**
 * Store persisted shares
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Boolean}   sync   Store the shares synchronously
 */
Elric.setMethod(function persistShares(sync) {

	var write_method,
	    path,
	    val,
	    key;

	if (sync) {
		write_method = fs.writeFileSync;
	} else {
		write_method = fs.writeFile;
	}

	for (key in persisted) {
		path = PATH_TEMP + '/' + key + '.json';

		write_method(path, JSON.dry(persisted[key]));
	}

});

process.on('exit', function onExit() {
	elric.persistShares(true);
});

process.on('SIGINT', function onSigint() {
	elric.persistShares(true);
});

// Asynchronously persist the shares every 2 minutes
setInterval(function saveShares() {
	elric.persistShares();
}, 120000);

/**
 * Load cron
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Elric.setMethod(function loadCron() {

	var Scenario,
	    options,
	    task,
	    i;

	if (alchemy.settings.elric.cron === false) {
		return console.log('Elric\'s cron has been DISABLED');
	} else {
		console.log('Loading Elric\'s cron...');
	}

	Scenario = Model.get('Scenario');

	// Destroy all existing tasks
	for (i = 0; i < this.cron_jobs.length; i++) {
		task = this.cron_jobs[i];
		task.destroy();
	}

	// Empty the array
	this.cron_jobs.length = 0;

	options = {
		conditions: {
			triggers: 'cron'
		}
	};

	// Get all scenarios with cron triggers
	Scenario.find('all', options, function gotAllScenarios(err, scenarios) {

		if (err) {
			throw err;
		}

		console.log('Got scenarios:', scenarios);

		// Iterate over the scenarios
		scenarios.forEach(function eachScenario(scenario) {

			var blocks = scenario.blocks;

			if (!blocks || !blocks.length) {
				return;
			}

			blocks.forEach(function eachBlock(block) {

				// Make sure it's a cron block
				if (block.type != 'cron') {
					return;
				}

				// Make sure the cron expression is set
				if (!block.settings.expression) {
					return;
				}

				elric.schedule(block.settings.expression, function fireScenario() {

					// Get a new Scenario document
					Scenario.findById(scenario._id, function gotScenarioAgain(err, document) {
						document.applyEvent('cron');
					});
				});
			});
		});
	});
});

/**
 * Schedule a cron job
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Elric.setMethod(function schedule(syntax, callback) {

	var task;

	task = cron.schedule(syntax, callback);

	this.cron_jobs.push(task);
});

/**
 * Create a new action and return it,
 * without executing it or saving to database
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {String}                  action_type
 * @param    {ScenarioModelDocument}   scenario
 * @param    {Event}                   event
 * @param    {Array}                   args
 */
Elric.setMethod(function createAction(action_type, scenario, event, action_settings) {

	var constructor = all_actions[action_type],
	    document,
	    action;

	if (!action_type || !constructor) {
		throw new Error('Could not find "' + action_type + '" action constructor');
	}

	// Create the new database document
	document = Model.get('Action').createDocument();

	// Set the type
	document.type = action_type;

	// Create & initialize the action
	action = new constructor(document);

	if (scenario) {
		action.setScenario(scenario);
	}

	if (event) {
		action.setEvent(event);
	}

	if (action_settings) {
		action.setPayload(action_settings);
	}

	return action;
});

/**
 * Create and execute the action
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {String}   action_type
 * @param    {Event}    event
 */
Elric.setMethod(function doAction(action_type, scenario, event, action_settings, callback) {

	var action;

	if (typeof action_settings == 'function') {
		callback = args;
		args = null;
	} else if (typeof event == 'function') {
		callback = event;
		event = null;
	} else if (typeof scenario == 'function') {
		callback = scenario;
		event = null;
		scenario = null;
	}

	action = this.createAction(action_type, scenario, event, action_settings);

	// Start the execution
	action.startExecution(function executed(err, result) {

		if (err) {
			return callback(err);
		}

		// Callback with the result immediately
		callback(null, result);

		// Set the end time
		action.setEndTime();

		// Save the action document now
		action.save(function saved(err) {
			if (err) {
				console.error('Failed to save action:', err);
			}
		});
	});
});

/**
 * Create a new event and return it,
 * without firing it or saving to database
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Elric.setMethod(function createEvent(type) {

	var constructor = all_events[type],
	    document,
	    inited,
	    event,
	    args,
	    i;

	if (!type || !constructor) {
		throw new Error('Could not find "' + type + '" event constructor');
	}

	// Create the new database document
	document = Model.get('Event').createDocument();

	// Set the type
	document.type = type;

	args = [];

	// Create the arguments
	for (i = 1; i < arguments.length; i++) {
		args[i-1] = arguments[i];
	}

	// Create & initialize the event
	event = new constructor(document);

	inited = event.initialize.apply(event, args);

	if (inited === false) {
		event.initialized = false;
	} else {
		event.initialized = true;
	}

	return event;
});

/**
 * Create and fire a new event
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Elric.setMethod(function emitEvent(type) {

	var event = this.createEvent.apply(this, arguments);

	// Fire and save the event
	if (event.initialized) {
		elric.applyEventToScenario(event);

		event.save(function saved(err) {
			if (err) console.error('Failed to save event:', err);
		});
	}

	return event;
});

global.dt = function dt() {
	elric.testScenario('dev');
}

/**
 * Test a scenario
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Elric.setMethod(function testScenario(id, callback) {

	var Scenario = Model.get('Scenario'),
	    options,
	    event;

	if (!callback) {
		callback = Function.thrower;
	}

	options = {
		conditions: {
			$or: [
				{_id: id},
				{name: id}
			]
		}
	};

	// Get the wanted scenario
	Scenario.find('first', options, function gotScenario(err, scenario) {

		if (err) {
			return callback(err);
		}

		if (!scenario.length) {
			return callback(new Error('Scenario "' + id + '" not found'));
		}

		// Create an event
		event = elric.createEvent('test');

		scenario.applyEvent(event, function done(err) {
			console.log('Applied test event', event, 'to', scenario, err);
		});
	});
});

/**
 * Apply event to scenario
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Elric.setMethod(function applyEventToScenario(event, callback) {

	var Scenario = Model.get('Scenario'),
	    scenarios;

	Function.series(function getScenarios(next) {

		var options = {
			conditions: {
				triggers: event.type_name,
				enabled: true
			}
		};

		// Look for all the scenarios that listen to this event trigger
		Scenario.find('all', options, function gotScenarios(err, documents) {

			if (err) {
				return next(err);
			}

			scenarios = documents;

			next(null);
		});
	}, function doScenarios(next) {
		var tasks = [];

		scenarios.forEach(function eachScenario(scenario) {
			tasks.push(function doScenario(next) {
				scenario.applyEvent(event, next);
			});
		});
		Function.parallel(tasks, next);
	}, function done(err) {
		if (err) {
			if (callback) callback(err);
			console.error('Error doing scenarios:', err);
			return;
		}

		if (callback) callback(null);
	});
});

/**
 * Load all the clients from the database
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Elric.setMethod(function initClientList(callback) {

	var that = this,
	    docs;

	Function.series(function getClients(next) {
		Model.get('Client').find('all', function gotAllClients(err, result) {

			docs = result;

			result.forEach(function eachClientDocument(client) {
				var entry,
				    i;

				// Don't add the same client twice
				// (Some clients could have connected before this function)
				for (i = 0; i < that.clients.length; i++) {
					if (String(that.clients[i]._id) == String(client._id)) {
						return;
					}
				}

				that.clients.push(client);
			});

			that.emit('client_list');
			that.client_indicator.update('initial_client_list');
			next();
		});
	}, function getClientCapabilities(next) {
		docs.loadCapabilityData(next);
	}, function done(err) {

		if (err) {
			return console.error('Failed to load clients: ' + err);
		}

		if (callback) {
			callback();
		}
	});
});

/**
 * Get a client
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Elric.setMethod(function getClient(id) {

	var client,
	    temp,
	    i;

	// Get the client
	for (i = 0; i < elric.clients.length; i++) {
		temp = elric.clients[i];

		if (String(temp._id) == id) {
			client = temp;
		}
	}

	return client;
});

/**
 * Get a ClientCapability record
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Elric.setMethod(function getClientCapability(client_capability_id) {

	var capabilities,
	    client,
	    result,
	    ccap,
	    i,
	    j;

	for (i = 0; i < elric.clients.length; i++) {
		client = elric.clients[i];

		client.ClientCapability.forEach(function eachCapability(ccap) {

			if (result) return;

			if (String(ccap._id) == client_capability_id) {
				result = ccap;
			}
		});

		if (result) {
			return result;
		}
	}
});

/**
 * Get a client's capability
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Elric.setMethod(function getClientCapabilities(id, callback) {

	var capabilities,
	    client;

	if (typeof id == 'function') {
		callback = id;
		id = null;
	}

	capabilities = Object.assign({}, all_capabilities);

	if (!id) {
		return capabilities;
	}

	client = this.getClient(id);
});

Elric.setMethod(function tsound(){
	this.playSound('soundbites/ef_computer_voice/welcome_to_holomatch.mp3', Function.thrower);
});

/**
 * Play a sound
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {String}   sound      The sound to play
 * @param    {Function} callback   Executed when everything has started playing the sound
 */
Elric.setMethod(function playSound(sound, callback) {

	var CC = Model.get('ClientCapability'),
	    csock = dgram.createSocket('udp4');

	console.log('Playing sound', sound);

	CC.find('all', {conditions: {name: 'audio', enabled: true}}, function gotCapabilities(err, records) {

		var tasks = [],
		    links = [];

		if (err) {
			return callback(err);
		}

		records.forEach(function eachRecord(record) {

			var client,
			    id = record.Client._id,
			    ip;

			client = elric.getClient(id);

			if (!client.conduit) {
				console.log('Client', client, 'has no connection, skipping this play');
				return;
			}

			ip = client.conduit.ip;

			if (!ip) {
				return;
			}

			if (ip.startsWith('::ffff:')) {
				ip = ip.after('::ffff:');
			}

			fs.createReadStream(sound).on('data', function onChunk(chunk) {
				console.log('Sending chunk', chunk.length, 'to', ip + ':' + client.audio_ports.unicast);
				csock.send(chunk, 0, chunk.length, client.audio_ports.unicast, ip);
			});

			return;

			tasks.push(function sendStream(next) {

				console.log('Creating audio link to client ' + id);

				client.linkup('audio_stream', {test: true}, function ready(link) {
					console.log('Link', link, 'is ready!');

					link.on('loaded', next);

					links.push(link);

					// Submit the stream once a connection has been made
					link.submit('stream', fs.createReadStream(sound));
				});

				return;

				client.submitCommand('wav_stream', 'audio', {test:'wav'}, fs.createReadStream(sound), function playing(err, response) {

					console.log('Id ' + id + ' is playing the sound', err, response);

				});
			});
		});

		Function.parallel(tasks, function allHaveLoaded(err) {

			var play_time,
			    i;

			if (err) {
				return console.error('Could not play: ' + err);
			}

			// Play the file in 55 ms
			play_time = Date.now() + 55;

			for (i = 0; i < links.length; i++) {
				links[i].submit('play', play_time);
			}

			console.log('All clients should be playing the file', err);
			callback(null);
		});
	});
});

/**
 * Register incoming client connections
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {ElricClientSocketConduit}   client_socket
 */
Elric.setMethod(function registerClient(client_socket) {

	var that = this,
	    client_doc,
	    info,
	    data,
	    i;

	if (!this.hasBeenSeen('client_list')) {
		return this.afterOnce('client_list', function delay() {
			that.registerClient(client_socket);
		});
	}

	info = client_socket.announcement;
	log.info('Incoming client connection:', info.hostname);
	that.client_indicator.update('incoming_connection');

	// Listen for remote command requests
	client_socket.on('capability-command', function onCapabilityCommand(packet) {

		var instance,
		    args;

		if (Classes.Elric[packet.capability + 'Capability']) {
			instance = new Classes.Elric[packet.capability + 'Capability'];

			// Create a new args array, with the client document prepended to it
			args = [client_doc].concat(packet.args);

			if (instance[packet.type]) {
				instance[packet.type].apply(instance, args);
			} else {
				console.error('Capability method "' + packet.type + '" not found, packet ignored', packet);
			}
		} else {
			console.error('Could not find capability ' + packet.capability + ', packet ignored', packet);
		}
	});

	// Listen for disconnects
	client_socket.on('disconnect', function disconnected() {
		that.client_indicator.update('disconnect');
	});

	Function.series(function findDocument(next) {

		// Look for this hostname first
		that.clients.some(function eachClientDocument(client) {

			// If client_id is given, only match that
			if (info.client_id) {
				if (String(info.client_id) == String(client.client_id)) {
					client_doc = client;
					return true;
				}

				return false;
			}

			if (client.hostname == info.hostname) {
				client_doc = client;
				return true;
			}
		});

		next();
	}, function createNewRecord(next) {

		if (client_doc) {
			return next();
		}

		data = {
			hostname: info.hostname,
			ip: client_socket.socket.conn.remoteAddress,
			enabled: false,
			secret: '',
			key: ''
		};

		Model.get('Client').save(data, function savedClient(err, doc) {

			if (err) {
				return next(err);
			}

			client_doc = doc;

			that.clients.push(doc);
			next();

		});
	}, function attachConduit(next) {

		// Set the start_time (when the client started, not connected)
		client_doc.start_time = info.start_time || Date.now();

		// Attach the conduit
		client_doc.attachConduit(client_socket);

		next();
	}, function doAuthentication(next) {

		// If the admin has not yet authorized this client, do nothing
		if (!client_doc.authorized) {
			return next();
		}

		client_doc.requestAuthentication(next);

	}, function done(err) {

		that.client_indicator.update('registered_client');

		if (err) {
			log.error('Error registering client ' + client_socket.announcement.hostname + ': ' + err);
			console.log(err);
			return;
		}

	});
});

/**
 * Get a client file
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Elric.setMethod(function getClientFile(capability, callback) {

	var filename = capability + '_client_file.js';

	alchemy.findAssetPath(filename, 'client_files', function done(err, result) {
		callback(err, result);
	});
});

// Create the global instance
global.elric = new Elric();