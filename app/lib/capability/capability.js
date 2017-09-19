/**
 * The Elric Capability class
 * These define the options you can set per capability, per client.
 *
 * @constructor
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.0.1
 * @version  1.0.0
 */
var Capability = Function.inherits('Elric.Wrapper', function Capability() {});

/**
 * is_abstract_class does not get inherited, used for wrapper classes
 */
Capability.setProperty('is_abstract_class', true);

/**
 * This wrapper class starts a new group
 */
Capability.setProperty('starts_new_group', true);

/**
 * The version of the client file
 *
 * @type   {String}
 */
Capability.setProperty('version', '0.1.0');

/**
 * The description of this action
 *
 * @type   {String}
 */
Capability.setProperty('description', '');

/**
 * The view element to use for the configuring panel
 *
 * @type   {String}
 */
Capability.setProperty('config_element', '');

/**
 * Is this a capability that is always enabled?
 * If it is, the on/off switch should be hidden.
 *
 * @type   {Boolean}
 */
Capability.setProperty('always_enabled', false);

/**
 * The client configuration
 *
 * @type   {Object}
 */
Capability.setProperty('config', null);

/**
 * The client document
 *
 * @type   {Object}
 */
Capability.setProperty('client', null);

/**
 * Capability view configurator
 *
 * @type   {Function}
 *
 * @param  {Controller} controller
 * @param  {Object}     record
 * @param  {Function}   next
 */
Capability.setProperty('setupConfigView', null);

/**
 * onConfig callback
 *
 * @type   {Function}
 *
 * @param  {ClientCapabilityDocument} record
 */
Capability.setProperty('onConfig', null);

/**
 * onClient callback
 *
 * @type   {Function}
 *
 * @param  {ClientDocument} record
 */
Capability.setProperty('onClient', null);

/**
 * Return the class-wide schema
 *
 * @type   {Schema}
 */
Capability.setProperty(function schema() {
	return this.constructor.schema;
});

/**
 * Set the event schema
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
Capability.constitute(function setSchema() {

	var schema;

	// Create a new schema
	schema = new Classes.Alchemy.Schema(this);
	this.schema = schema;
});

/**
 * Attach the client capability config.
 * This also sets the client record.
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {ClientCapabilityDocument}   record
 */
Capability.setMethod(function attachConfig(record) {

	if (!record) {
		return;
	}

	let that = this;

	this.config = record;

	Blast.setImmediate(function emitConfig() {
		// Emit the config event
		that.emit('config', function doneConfig() {
			// See if there's an onConfig callback
			if (typeof that.onConfig == 'function') {
				that.onConfig(record);
			}
		});
	});

	if (record.client_id) {
		this.attachClient(record.client_id);
	}
});

/**
 * Set the capability client
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {ClientDocument}   record
 */
Capability.setMethod(function attachClient(record) {

	var client,
	    id;

	id = alchemy.castObjectId(record);

	if (id) {
		client = elric.getClient(id);
	}

	this.client = client;

	Blast.setImmediate(function emitClient() {
		// Emit the client event
		that.emit('client', function doneClient() {
			// See if there's an onConfig callback
			if (typeof that.onClient == 'function') {
				that.onClient(client);
			}
		});
	});
});

/**
 * Return the basic record for JSON
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Capability.setMethod(function toJSON() {
	return {
		title           : this.title,
		type_name       : this.type_name,
		version         : this.version,
		description     : this.description,
		scema           : this.constructor.schema,
		config_element  : this.config_element,
		always_enabled  : this.always_enabled
	}
});