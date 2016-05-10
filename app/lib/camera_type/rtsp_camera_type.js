var MediaConversion = alchemy.use('mediaconversion');

/**
 * The Rtsp Camera Type class
 *
 * @constructor
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.0.1
 * @version  0.1.0
 */
var RtspCameraType = Function.inherits('Elric.CameraType', function RtspCameraType(record) {
	RtspCameraType.super.call(this, record);
});

/**
 * Set the event schema
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
RtspCameraType.constitute(function setSchema() {
	this.schema.addField('host', 'String');
	this.schema.addField('path', 'String');
	this.schema.addField('port', 'Number');
	this.schema.addField('username', 'String');
	this.schema.addField('password', 'String');
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
RtspCameraType.setMethod(function getStream(callback) {

	var that = this,
	    settings,
	    output,
	    conv,
	    uri;

	if (!this.settings.host) {
		return callback(new Error('No host url was defined'));
	}

	settings = this.settings;

	// Construct the uri
	uri = 'rtsp://';

	if (settings.username) {
		uri += settings.username + ':' + (settings.password || '') + '@';
	}

	uri += settings.host;

	if (settings.port) {
		uri += ':' + settings.port;
	}

	if (settings.path) {
		uri += '/' + settings.path;
	}

	// Create a new conversion object, which will just do the rtsp fetching
	conv = new MediaConversion();

	// Set the RTSP uri as the input
	conv.setInput(uri);

	// Create a passthrough output stream
	output = conv.createStream();

	conv.start(output, {profile: 'copy'});

	callback(null, output);
});