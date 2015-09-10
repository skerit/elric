/**
 * The Rfxcom Capability
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.0.1
 * @version  0.1.0
 */
var Rfx = Function.inherits('Capability', function RfxcomCapability() {
	RfxcomCapability.super.call(this);
});

/**
 * Constitute the class wide schema
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Rfx.constitute(function addFields() {
	this.schema.addField('device_path', 'String', {default: '/dev/ttyUSB0'});
});