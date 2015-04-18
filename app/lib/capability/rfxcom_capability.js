/**
 * The Rfxcom Capability
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  0.1.0
 */
var Rfx = Function.inherits('Capability', function RfxcomCapability() {

	RfxcomCapability.super.call(this);

	this.schema.addField('device_path', 'String', {default: '/dev/ttyUSB0'});
});