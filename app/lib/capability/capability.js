var capabilities = alchemy.shared('Elric.capabilities');

/**
 * The Elric Capability class
 * These define the options you can set per capability, per client.
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  0.2.0
 */
var Capability = Function.inherits('Informer', function Capability() {});

/**
 * Register the capability and set the schema
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.2.0
 * @version  0.2.0
 */
Capability.constitute(function register() {

	var type_name,
	    schema,
	    name;

	name = this.name.beforeLast('Capability') || this.name;
	type_name = name.underscore();

	this.setProperty('title', name.humanize());
	this.setProperty('type_name', type_name);

	// Create a new schema
	schema = new alchemy.classes.Schema(this);
	this.schema = schema;

	// Do not let the child inherit the extendonly setting
	if (!this.prototype.hasOwnProperty('extend_only')) {
		this.setProperty('extend_only', false);
	}

	// Register non-wrapper classes
	if (!this.prototype.extend_only) {
		capabilities[type_name] = this;
	}
});

/**
 * Extend_only does not get inherited, used for wrapper classes
 */
Capability.setProperty('extend_only', true);

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
 * Return the basic record for JSON
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
Capability.setMethod(function toJSON() {

	return {
		title: this.title,
		type_name: this.type_name,
		version: this.version,
		description: this.description,
		scema: this.constructor.schema
	}

});