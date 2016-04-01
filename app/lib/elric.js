var all_capabilities = alchemy.shared('Elric.capabilities'),
    all_events = alchemy.shared('elric.event'),
    all_actions = alchemy.shared('elric.action'),
    fs = require('fs');

/**
 * The Elric Singleton class
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.0.1
 * @version  0.1.0
 */
var Elric = Function.inherits('Informer', function Elric() {

	// Only allow 1 elric instance
	if (global.elric) {
		return global.elric;
	}

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
		})
	});
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
 */
Elric.setMethod(function createAction(action_type, scenario, event) {

	var constructor = all_actions[action_type],
	    document,
	    action,
	    args;

	if (!action_type || !constructor) {
		throw new Error('Could not find "' + action_type + '" action constructor');
	}

	// Create the new database document
	document = Model.get('Action').createDocument();

	// Set the type
	document.type = action_type;

	args = [];

	// Create the arguments
	for (i = 2; i < arguments.length; i++) {
		args[i-2] = arguments[i];
	}

	// Create & initialize the action
	action = new constructor(document);

	// Set the action scenario & event
	action.setScenario(scenario);
	action.setEvent(event);

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
Elric.setMethod(function doAction(action_type, scenario, event, callback) {

	var action;

	if (typeof event == 'function') {
		callback = event;
		event = null;
	}

	if (typeof scenario == 'function') {
		callback = scenario;
		event = null;
		scenario = null;
	}

	action = this.createAction(action_type, scenario, event);

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

/**
 * Apply event to scenario
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Elric.setMethod(function applyEventToScenario(event) {

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
			console.error('Error doing scenarios:', err);
		}
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
				that.clients.push(client);
			});

			that.emit('client_list');
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

/**
 * Play a sound
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Elric.setMethod(function playSound(sound, callback) {

	var CC = Model.get('ClientCapability');

	console.log('Playing sound', sound);

	CC.find('all', {conditions: {name: 'audio', enabled: true}}, function gotCapabilities(err, records) {

		var tasks = [],
		    links = [];

		if (err) {
			return callback(err);
		}

		records.forEach(function eachRecord(record) {

			var client,
			    id = record.Client._id;

			client = elric.getClient(id);

			if (!client.conduit) {
				console.log('Client', client, 'has no connection, skipping this play');
				return;
			}

			tasks.push(function sendStream(next) {

				var link;

				console.log('Creating audio link to client ' + id);

				link = client.linkup('audio_stream', {test: true}, function ready(link) {
					console.log('Link', link, 'is ready!');

					// Submit the stream once a connection has been made
					link.submit('stream', fs.createReadStream(sound));
				});

				link.on('loaded', next);

				links.push(link);

				return;

				client.submitCommand('wav_stream', 'audio', {test:'wav'}, fs.createReadStream(sound), function playing(err, response) {

					console.log('Id ' + id + ' is playing the sound', err, response);

				});
			});
		});

		Function.parallel(tasks, function allHaveLoaded(err) {

			var i;

			if (err) {
				return console.error('Could not play: ' + err);
			}

			for (i = 0; i < links.length; i++) {
				links[i].submit('play');
			}

			console.log('All clients should be playing the file', err);
		});
	});
});


/**
 * Register a client
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {ElricClientSocketConduit}   eclient
 */
Elric.setMethod(function registerClient(eclient) {

	var that = this,
	    client_doc,
	    info,
	    data,
	    i;

	if (!this.hasBeenSeen('client_list')) {
		return this.after('client_list', function delay() {
			that.registerClient(eclient);
		});
	}

	info = eclient.announcement;
	log.info('Incoming client connection: ' + info.hostname);

	// Listen for remote command requests
	eclient.on('capability-command', function onCapabilityCommand(packet) {

		var instance;

		console.log('Got capability command:', packet);

		if (alchemy.classes[packet.capability + 'Capability']) {
			instance = new alchemy.classes[packet.capability + 'Capability'];

			if (instance[packet.type]) {
				instance[packet.type].apply(instance, packet.args);
			} else {
				console.error('Capability method "' + packet.type + '" not found, packet ignored', packet);
			}
		} else {
			console.error('Could not find capability ' + packet.capability + ', packet ignored', packet);
		}
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
			ip: eclient.socket.conn.remoteAddress,
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
		client_doc.attachConduit(eclient);

		next();
	}, function doAuthentication(next) {

		// If the admin has not yet authorized this client, do nothing
		if (!client_doc.authorized) {
			return next();
		}

		client_doc.requestAuthentication(next);

	}, function done(err) {

		if (err) {
			return log.error('Error registering client ' + eclient.announcement.hostname + ': ' + err);
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