var bcrypt = alchemy.use('bcrypt'),
    connected_clients = alchemy.shared('elric.clients'),
    all_capabilities = alchemy.shared('Elric.capabilities'),
    fs = alchemy.use('fs');

/**
 * The Client Capability Model
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  1.0.0
 */
var Client = Model.extend(function ClientModel(options) {
	ClientModel.super.call(this, options);
});

/**
 * Constitute the class wide schema
 *
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    1.0.0
 * @version  1.0.0
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

	// Add the capability data
	this.hasMany('ClientCapability');
});

/**
 * Configure chimera for this model
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
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
 * @since    1.0.0
 * @version  1.0.0
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
 * @since    1.0.0
 * @version  1.0.0
 */
Client.setDocumentMethod(function loadCapabilityData(callback) {

	var that = this,
	    CC = this.getModel('ClientCapability');

	// Iterate over all the "Client" records in this document
	Function.forEach.parallel(Array.cast(this), function eachClient(client, key, next) {

		var client_id = client.Client._id;

		// Iterate over all the available capabilities
		Function.forEach.parallel(all_capabilities, function eachCapability(capability, key, nextcap) {

			var found,
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
				return nextcap();
			}

			// It hasn't been found, so we need to add it to the database
			data = {
				client_id: client_id,
				settings: {},
				enabled: false,
				name: key
			};

			// Save it to the database
			CC.save(data, function savedCap(err, record) {

				if (err) {
					return nextcap(err);
				}

				// Also add it to the existing document
				client.ClientCapability.push({ClientCapability: record.ClientCapability});
			});
		}, next);
	});

	return callback();
});

/**
 * Get a specific capability
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
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
 * Authorize the client and assign it a key
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
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
	this.submit('credentials', {secret: this.secret, key: this.key}, function done(err, response) {

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
 * @since    1.0.0
 * @version  1.0.0
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

		that.submit('request-authentication', hash, function gotResponse(err, client_hash) {

			if (err) {
				log.error('Client refused to authenticate this server');
				return callback(err);
			}

			bcrypt.compare(that.key, client_hash, function compared(err, result) {

				if (err) {
					return callback(err);
				}

				if (!result) {
					log.error('Failed to authenticate client');
					return callback(new Error('Failed to authenticate client'));
				}

				// Authentication complete!
				that.authenticated = true;

				log.info('Client "' + that.hostname + '" has been authenticated');

				that.submit('authenticated');

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
 * @since    1.0.0
 * @version  1.0.0
 */
Client.setDocumentMethod(function sendCapabilities(callback) {

	var that = this;

	if (!callback) {
		callback = Function.dummy;
	}

	log.info('Sending capabilities to "' + this.hostname + '"');

	Function.forEach.parallel(Array.cast(this.ClientCapability), function eachCap(record, index, next) {

		var ccap = record.ClientCapability;

		// Skip the wrapper class
		if (ccap.name === 'capability') {
			return next();
		}

		// Look for the client file
		elric.getClientFile(ccap.name, function gotFile(err, stat) {

			var stream;

			if (!err && (stat && stat.path)) {
				stream = fs.createReadStream(stat.path);
				that.submit('capability-settings', ccap, stream, next);
			} else {
				that.submit('capability-settings', ccap, next);
			}
		});
	}, function done(err) {

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
 * @since    1.0.0
 * @version  1.0.0
 */
Client.setDocumentMethod(function attachConduit(conduit) {

	var that = this;

	this.conduit = conduit;
	this.connected = true;
	this.authenticated = false;

	alchemy.updateData(this._id, this.Client);

	// Listen to the disconnect event
	conduit.on('disconnect', function disconnected() {

		// Revoke authentication
		that.authenticated = false;

		// Say it's disconnected
		that.connected = false;

		// Remove the conduit
		that.conduit = false;

		alchemy.updateData(that._id, that.Client);
	});
});

/**
 * Send data to the client
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
Client.setDocumentMethod(function submit(type, data, stream, callback) {
	return this.conduit.submit(type, data, stream, callback);
});