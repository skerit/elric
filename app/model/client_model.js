var connected_clients = alchemy.shared('elric.clients');

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
	this.Document.setFieldGetter('authenticated');
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
 * Authorize the client and assign it a key
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
Client.setDocumentMethod(function authorize(callback) {

	// Set the authorization to true
	this.authorized = true;

	// Assign a key to the client
	this.key = Crypto.uid();

	// Update the database
	this.update({authorized: true}, function updated(err) {
		if (callback) callback();
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