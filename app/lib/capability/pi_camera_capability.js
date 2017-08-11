/**
 * The PiCamera Capability:
 * Use Raspberry Pi camera
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
var PiCamera = Function.inherits('Elric.Capability', function PiCameraCapability() {
	PiCameraCapability.super.call(this);
});

/**
 * Constitute the class wide schema
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
PiCamera.constitute(function addFields() {
	//this.schema.addField('device_path', 'String', {default: '/dev/ttyUSB0'});
});