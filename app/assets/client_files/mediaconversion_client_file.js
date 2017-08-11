var MediaConversion = elric.use('mediaconversion');

var started = Date.create().format('m-d H:i');

console.log('Loaded media conversion at', started);

/**
 * The Mediaconversion ClientFile
 *
 * @constructor
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
var Media = Function.inherits('ClientFile', function MediaconversionClientFile(client, settings) {

	var that = this;

	// Call the parent constructor
	MediaconversionClientFile.super.call(this, client, settings);
});

/**
 * Startup!
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Media.setMethod(function start(callback) {

	var that = this,
	    device;

	log.info('Starting conversion service');

	console.log('--- Listening for mediaconversion requests');

	this.onLinkup('mediaconversion', function conversionRequest(linkup, settings) {

		console.log('Requesting conversion:', settings, started);

		// Create a new conversion object, which will just do the fetching
		var conv = new MediaConversion();

		// Set the uri as the input
		conv.setInput(settings.path);

		// Create a passthrough output stream
		output = linkup.createStream();

		conv.start(output, settings);

		linkup.submit('stream', {data: true}, output);

		linkup.on('disconnect', function onDisconnect() {
			console.log('Linkup has disconnected, stopping conversion?');
			conv.stop();
		});
	});

	callback(null);
});

/**
 * Stop
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Media.setMethod(function stop() {
	console.log('Client disconnected, conversion is stopping');
});

module.exports = Media;