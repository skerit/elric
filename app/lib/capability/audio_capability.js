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
var Audio = Function.inherits('Elric.Capability', function AudioCapability() {
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

/**
 * Store remote port information
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 *
 * @param    {ClientDocument}   client
 * @param    {String}           type
 * @param    {Number}           port
 */
Audio.setMethod(function storePort(client, type, port) {

	if (!client.audio_ports) {
		client.audio_ports = {};
	}

	client.audio_ports[type] = port;

	console.log('Stored port', type, 'on client', client, '=', port);
});