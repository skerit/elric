var MediaConversion = alchemy.use('mediaconversion'),
    media_types = alchemy.getClassGroup('elric_camera_media_types');

/**
 * The Network Camera Type class
 *
 * @constructor
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.0.1
 * @version  0.1.0
 */
var V4lCameraType = Function.inherits('Elric.CameraType', function V4lCameraType(record) {
	V4lCameraType.super.call(this, record);
});

/**
 * Set the event schema
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
V4lCameraType.constitute(function setSchema() {

	// The path to this video device
	this.schema.addField('path', 'String');

	// The media type of this camera
	this.schema.addField('media_type', 'Enum', {values: media_types});
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
V4lCameraType.setMethod(function getRawStream(callback) {

	var that = this,
	    settings,
	    options,
	    output,
	    client,
	    conv,
	    uri,
	    req;

	if (!this.settings.path) {
		return callback(new Error('No path was defined'));
	}

	settings = this.settings;

	// Create the default conversion options
	options = {
		input_type : 'video4linux2', // v4l2 only works on ffmpeg, avconv needs video4linux2

		// Don't probe the stream, just copy
		//probe     : false,

		// Use the copy profile
		profile   : 'copy'
	};

	if (settings.media_type == 'mjpeg') {
		// Keep the mjpeg container
		options.container = 'mjpeg';
	}

	if (this.record.client_id) {
		client = elric.getClient(this.record.client_id);

		options.path = settings.path;

		console.log('-------------------Waiting for conduit');

		client.afterOnce('has_conduit', function hasConduit() {

			console.log('==== GOT CONDUIT, get clientstream', client);

			client.linkup('mediaconversion', options, function gotLinkup(linkup) {

				var responded;

				linkup.on('stream', function gotStream(data, stream) {
					responded = true;
					callback(null, stream);

					stream.on('end', function onEnd() {
						console.log('Stream ended on server side?');
					});

					stream.on('closed', function onClose() {
						console.log('Stream closed on server side?');
					});
				});

				linkup.on('disconnect', function disconnected() {
					console.log('Linkup has disconnected');

					if (!responded) {
						callback(new Error('Linkup closed before stream was received'));
					}
				});
			});
		});
	} else {

		// Create a new conversion object, which will just do the fetching
		conv = new MediaConversion();

		// Set the uri as the input
		conv.setInput(settings.path);

		// Create a passthrough output stream
		output = conv.createStream();

		conv.start(output, options);

		callback(null, output);
	}
});