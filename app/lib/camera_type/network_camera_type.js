var MediaConversion = alchemy.use('mediaconversion'),
    network_protocols = alchemy.getClassGroup('elric_network_camera_protocols'),
    media_types = alchemy.getClassGroup('elric_camera_media_types');

// Default network protocols
network_protocols.http = 'HTTP';
network_protocols.rtsp = 'RTSP';

// Default camera media types
media_types.default = 'Default';
media_types.mjpeg = 'MJPEG';

/**
 * The Network Camera Type class
 *
 * @constructor
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.0.1
 * @version  0.1.0
 */
var NetworkCameraType = Function.inherits('Elric.CameraType', function NetworkCameraType(record) {
	NetworkCameraType.super.call(this, record);
});

/**
 * Set the event schema
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
NetworkCameraType.constitute(function setSchema() {

	// The media type of this camera
	this.schema.addField('media_type', 'Enum', {values: media_types});

	// The protocol of the uri
	this.schema.addField('protocol', 'Enum', {values: network_protocols});

	// The host part of the uri
	this.schema.addField('host', 'String');

	// Optional path (for the video)
	this.schema.addField('path', 'String');

	// Optional port
	this.schema.addField('port', 'Number');

	// Optional username & password
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
NetworkCameraType.setMethod(function getRawStream(callback) {

	var that = this,
	    settings,
	    options,
	    output,
	    conv,
	    uri,
	    req;

	if (!this.settings.host) {
		return callback(new Error('No host was defined'));
	}

	settings = this.settings;

	if (settings.use_request) {
		// Create a new request
		req = new Classes.Develry.Request();

		// Set the url
		req.setUrl(this.settings.host);

		// Set the optional authorization header
		req.setAuthorization(this.settings.username, this.settings.password);

		req.start({stream_only: true}, callback);

		return;
	}

	// Construct the uri
	uri = settings.protocol + '://';

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

	// Create a new conversion object, which will just do the fetching
	conv = new MediaConversion();

	// Set the uri as the input
	conv.setInput(uri);

	// Create a passthrough output stream
	output = conv.createStream();

	// Create the default conversion options
	options = {
		// Don't probe the stream, just copy
		probe   : false,

		// Use the copy profile
		profile : 'copy'
	};

	if (settings.media_type == 'mjpeg') {
		// Tell ffmpeg the input type is mjpeg, so it doesn't have to guess
		options.input_type = 'mjpeg';

		// Keep the mjpeg container
		options.container = 'mjpeg';

		// Tell ffmpeg the framerate is variable, so it'll use mkv and such
		//options.variable_framerate = true;
	}

	conv.start(output, options);

	callback(null, output);
});