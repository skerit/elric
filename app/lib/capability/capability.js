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