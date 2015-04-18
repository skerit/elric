var Capabilities = alchemy.shared('Elric.capabilities'),
    Blast        = __Protoblast;

Blast.on('extended', function(parent, child) {

	var typeName,
	    name;

	if (parent.name.endsWith('Capability')) {
		name = child.name.beforeLast('Capability') || 'Capability';
		typeName = name.underscore();

		child.setProperty('title', name.humanize());
		child.setProperty('typeName', typeName);

		Capabilities[typeName] = child;
	}
});

/**
 * The Elric Capability class
 * These define the options you can set per capability, per client.
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  0.1.0
 */
var Capability = Function.inherits('Informer', function Capability() {

	var schema = new alchemy.classes.Schema(this);

	this.schema = schema;
});

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