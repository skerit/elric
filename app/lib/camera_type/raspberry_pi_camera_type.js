/**
 * The RaspberryPi Camera Type class
 *
 * @constructor
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.0.1
 * @version  0.1.0
 */
var RaspberryPiCameraType = Function.inherits('Elric.CameraType', function RaspberryPiCameraType(record) {
	RaspberryPiCameraType.super.call(this, record);
});

/**
 * Set the event schema
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
RaspberryPiCameraType.constitute(function setSchema() {
	this.schema.belongsTo('Client');
});

/**
 * Get a new raw stream to this device
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {String}   command     Device specific command
 *
 * @return   {Object}
 */
RaspberryPiCameraType.setMethod(function getStream(callback) {

	var that = this,
	    client;

	if (!this.settings.client_id) {
		return callback(new Error('No client was defined'));
	}

	client = elric.getClient(this.settings.client_id);

	client.afterOnce('has_conduit', function hasConduit() {

		console.log('Got conduit, requesting raspivid stream');

		client.linkup('get_raspivid_stream', {}, function gotLinkup(linkup) {

			console.log('Got raspivid linkup', linkup);

			linkup.on('stream', function onStream(data, stream) {

				callback(null, stream);

			});
		});
	});
});

/**
 * Get media conversion options
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @return   {Object}
 */
RaspberryPiCameraType.setMethod(function getConversionOptions() {
	return {
		// Skip the probe, we know what the stream will look like
		probe      : false,

		// Input type is raw h264
		input_type : 'h264',

		// There is no audio
		audio      : false
	};
});
