/**
 * The Scp Capability
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  0.1.0
 */
var SC = Function.inherits('Capability', function ScpCapability() {
	ScpCapability.super.call(this);

	this.schema.addField('login', 'String', {default: 'elric'});
	this.schema.addField('port', 'Number', {default: 22});
});