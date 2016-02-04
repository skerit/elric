/**
 * The Audio Capability:
 * This gives the device the capability to output sound
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
var Audio = Function.inherits('Capability', function AudioCapability() {
	AudioCapability.super.call(this);
});

/**
 * Constitute the class wide schema
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Audio.constitute(function addFields() {
	//this.schema.addField('device_path', 'String', {default: '/dev/ttyUSB0'});
});