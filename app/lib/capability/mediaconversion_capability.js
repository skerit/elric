/**
 * The Mediaconversion Capability:
 * This gives the device the capability to convert audio/video
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
var Mediaconversion = Function.inherits('Elric.Capability', function MediaconversionCapability() {
	MediaconversionCapability.super.call(this);
});

/**
 * Constitute the class wide schema
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Mediaconversion.constitute(function addFields() {
	//this.schema.addField('device_path', 'String', {default: '/dev/ttyUSB0'});
});