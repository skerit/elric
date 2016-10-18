/**
 * The Scp Capability
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.0.1
 * @version  0.1.0
 */
var SC = Function.inherits('Elric.Capability', function ScpCapability() {
	ScpCapability.super.call(this);
});

/**
 * Constitute the class wide schema
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
SC.constitute(function addFields() {
	this.schema.addField('login', 'String', {default: 'elric'});
	this.schema.addField('port', 'Number', {default: 22});
});