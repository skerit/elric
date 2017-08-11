var bcrypt = alchemy.use('bcrypt'),
    connected_clients = alchemy.shared('elric.clients'),
    all_capabilities = alchemy.getClassGroup('elric_capability'),
    fs = alchemy.use('fs');

/**
 * The Client Capability Model
 *
 * @constructor
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.0.1
 * @version  0.1.0
 */
var Client = Model.extend(function ClientModel(options) {
	ClientModel.super.call(this, options);
});

Client.setProperty('displayField', 'hostname');

/**
 * Constitute the class wide schema
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Client.constitute(function addFields() {

	// The secret used for encryption
	this.addField('secret', 'String');

	// The key
	this.addField('key', 'String');

	this.addField('hostname', 'String');
	this.addField('ip', 'String');

	// Newly found clients are not authorized
	this.addField('authorized', 'Boolean');

	// Even authorized clients can be disabled
	this.addField('enabled', 'Boolean');

	// These values are not stored in the database,
	// but can be part of the document
	this.Document.setFieldGetter('connected');
	this.Document.setFieldGetter('start_time');
	this.Document.setFieldGetter('authenticated');
	this.Document.setFieldGetter('authentication_error');

	// Add the capability data
	this.hasMany('ClientCapability');

	// Return the device
	this.Document.setFieldGetter('status', function getStatus() {

		var status;

		if (this.connected) {
			if (this.authentication_error) {
				status = 'auth-error'
			} else if (!this.authenticated) {
				status = 'connecting';
			} else {
				status = 'online';
			}
		} else if (!this.authorized) {
			status = 'new';
		} else if (!this.enabled) {
			status = 'disabled';
		} else {
			status = 'offline';
		}

		return status;
	});
});

/**
 * Configure chimera for this model
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Client.constitute(function chimeraConfig() {

	var list,
	    edit;

	if (!this.chimera) {
		return;
	}

	// Get the list group
	list = this.chimera.getActionFields('list');

	list.addField('key');
	list.addField('hostname');
	list.addField('ip');

	// Get the edit group
	edit = this.chimera.getActionFields('edit');

	edit.addField('key');
	edit.addField('hostname');
	edit.addField('ip');
});

/**
 * Get all clients
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Client.setMethod(function getClients(callback) {

	var that = this,
	    options;

	options = {
		document: false
	};

	this.find('list', options, function gotClients(err, items) {

		

	});
});

/**
 * Load the capability data for these clients
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Client.setDocumentMethod(function loadCapabilityData(callback) {

	var that = this,
	    CC = this.getModel('ClientCapability');

	// Iterate over all the "Client" records in this document
	Function.forEach.parallel(Array.cast(this), function eachClient(client, key, next) {

		var client_id = client.Client._id;

		// Iterate over all the available capabilities
		Function.forEach.parallel(all_capabilities, function eachCapability(capability, key, nextcap) {

			var update,
			    found,
			    ccap,
			    data,
			    i;

			// See if this capability is already in the document
			for (i = 0; i < client.ClientCapability.length; i++) {
				ccap = client.ClientCapability[i].ClientCapability;

				if (ccap.name == key) {
					found = ccap;
					break;
				}
			}

			// If it has already been found, do nothing
			if (found) {

				// Enable a capability that should always be enabled, but currently isn't
				if (capability.prototype.always_enabled && !found.enabled) {
					found.enabled = true;
					update = true;
					data = found;
				} else {
					return nextcap();
				}
			} else {
				// It hasn't been found, so we need to add it to the database
				data = {
					client_id: client_id,
					settings: {},
					enabled: capability.prototype.always_enabled == true,
					name: key
				};
			}

			// Save it to the database
			CC.save(data, function savedCap(err, record) {

				if (err) {
					return nextcap(err);
				}

				// Also add it to the existing document if it's not an update
				if (!update) {
					client.ClientCapability.push({ClientCapability: record.ClientCapability});
				}
			});
		}, next);
	});

	return callback();
});

/**
 * Get a specific capability
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Client.setDocumentMethod(function getCapability(key) {

	var result;

	this.ClientCapability.forEach(function eachCapability(record, index) {
		if (record.capability == key) {
			result = record;
		}
	});

	return result;
});

/**
 * Remove a client
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Client.setDocumentMethod(function remove(callback) {

	var that = this;

	this.authorized = false;
	this.enabled = false;

	this.model.remove(this._id, callback);
});

/**
 * Authorize the client and assign it a key
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Client.setDocumentMethod(function authorize(callback) {

	var that = this,
	    data;

	this.enabled = true;

	// Assign a key to the client
	this.key = Crypto.uid();
	this.secret = Crypto.uid();

	data = {
		authorized: true,
		enabled: true,
		secret: this.secret,
		key: this.key,
	};

	// Send the new credentials first
	this._submit('credentials', {secret: this.secret, key: this.key}, function done(err, response) {

		if (err) {
			return callback(err);
		}

		// Set the authorization to true
		that.authorized = true;

		// Update the database
		that.update(data, function updated(err) {

			if (err) {
				if (callback) callback(err);
				return;
			}

			// Also authenticate
			that.requestAuthentication();

			if (callback) callback();
		});
	});
});

/**
 * Send client server authentication
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Client.setDocumentMethod(function requestAuthentication(callback) {

	var that = this;

	if (!callback) {
		callback = function(err) {
			if (err) log.error(''+err);
		}
	}

	if (!this.secret) {
		return callback(new Error('No secret to send'));
	}

	bcrypt.hash(this.secret, 12, function gotHash(err, hash) {

		if (err) {
			return callback(err);
		}

		that.authentication_error = false;

		// Update indicator: this client should now be 'authenticating'
		elric.client_indicator.update('requesting_authentication');

		that._submit('request-authentication', hash, function gotResponse(err, client_hash) {

			if (err) {
				log.error('Client refused to authenticate this server');
				return callback(err);
			}

			bcrypt.compare(that.key, client_hash, function compared(err, result) {

				if (err) {
					return callback(err);
				}

				if (!result) {
					that.authentication_error = true;
					return callback(new Error('Failed to authenticate client'));
				}

				// Authentication complete!
				that.authenticated = true;

				// Update the indicator: this client should now be online
				elric.client_indicator.update('authenticated');

				log.info('Client "' + that.hostname + '" has been authenticated');

				that._submit('authenticated');

				// Send client capabilities
				that.sendCapabilities();

				callback();
			});
		});
	});
});

/**
 * Send capability settings to the client
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Client.setDocumentMethod(function sendCapabilities(callback) {

	var that = this;

	if (!callback) {
		callback = Function.dummy;
	}

	log.info('Sending capabilities to "' + this.hostname + '"');
	console.log(this.ClientCapability);

	Function.forEach.parallel(Array.cast(this.ClientCapability), function eachCap(record, index, next) {

		var ccap = record.ClientCapability;

		// Skip the wrapper class
		if (ccap.name === 'capability') {
			return next();
		}

		// Don't send it if the capability is disabled
		if (!ccap.enabled) {
			return next();
		}

		console.log('Getting client file for', ccap.name);

		function doNext() {
			console.log('Calling next for', ccap.name);
			next();
		}

		// Look for the client file
		elric.getClientFile(ccap.name, function gotFile(err, stat) {

			var stream;

			if (!err && (stat && stat.path)) {
				stream = fs.createReadStream(stat.path);
				that._submit('capability-settings', ccap, stream, doNext);
			} else {
				that._submit('capability-settings', ccap, doNext);
			}
		});
	}, function done(err) {

		console.log('Client', that, 'has loaded');

		// Emit the loaded event, even if some capability files failed
		that.emit('loaded');

		if (err) {
			log.error('Client "' + that.hostname + '" failed to receive capability files: ' + err);
			return callback(err);
		}

		log.info('Client "' + that.hostname + '" has received capability files');
		callback();
	});
});

/**
 * Attach the websocket connection
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Client.setDocumentMethod(function attachConduit(conduit) {

	var that = this;

	if (!conduit) {
		throw new Error('Trying to attach conduit, but no conduit given');
	}

	this.conduit = conduit;
	this.connected = true;
	this.authenticated = false;

	alchemy.updateData(this._id, this.Client);

	this.emit('has_conduit');
	elric.emit('client_connection', this);

	// Listen to the disconnect event
	conduit.on('disconnect', function disconnected() {

		console.log('Client', that, 'has disconnected');

		// Revoke authentication
		that.authenticated = false;

		// Say it's disconnected
		that.connected = false;

		// Remove the conduit
		that.conduit = false;

		// Remove the 'ready' event
		that.unsee('ready');
		that.unsee('has_conduit');

		elric.client_indicator.update();
		alchemy.updateData(that._id, that.Client);
	});
});

/**
 * Submit data to the client as soon as it's connected
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Client.setDocumentMethod(function _submit(type, data, stream, callback) {

	var that = this;

	this.afterOnce('has_conduit', function isReady() {
		that.conduit.submit(type, data, stream, callback);
	});
});

/**
 * Send data to the client as soon as it's ready
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Client.setDocumentMethod(function submit(type, data, stream, callback) {

	var that = this;

	console.log('Submitting to client', this, 'once loaded')

	this.afterOnce('loaded', function isReady() {
		that.conduit.submit(type, data, stream, callback);
	});
});

/**
 * Linkup with the client
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Client.setDocumentMethod(function linkup(type, data, cb) {

	var that = this;

	console.log('Waiting for loaded')

	this.afterOnce('loaded', function isReady() {
		console.log('client loaded!')
		that.conduit.linkup(type, data, cb);
	});
});

/**
 * Send a command to the client
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Client.setDocumentMethod(function submitCommand(command_type, capability_type, data, stream, callback) {

	data.command_type = command_type;
	data.client_type = capability_type;

	return this.submit('client-command', data, stream, callback);
});