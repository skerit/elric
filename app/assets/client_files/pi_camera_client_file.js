var spawn = require('child_process').spawn;

/**
 * The PiCamera ClientFile
 *
 * @constructor
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
var PiCamera = Function.inherits('ClientFile', function PiCameraClientFile(client, settings) {

	var that = this;

	// Call the parent constructor
	PiCameraClientFile.super.call(this, client, settings);

	this.onLinkup('get_raspivid_stream', function onGetStream(linkup, data) {
		that.getStream(data, linkup);
	});
});

/**
 * Startup!
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
PiCamera.setMethod(function start(callback) {

	var that = this;

	callback();
});

/**
 * Stop
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
PiCamera.setMethod(function stop() {
	if (this.proc) {
		this.proc.kill();
		this.proc = null;
	}
});

/**
 * Actually check for an  update
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
PiCamera.setMethod(function getStream(data, linkup) {

	var that = this,
	    output,
	    proc;

	if (this.proc) {
		throw new Error('Already getting video');
	}

	// Start the raspivid process
	proc = spawn('/usr/bin/raspivid', ['-t', '0', '-w', '1920', '-h', '1080', '-ih', '-fps', '25', '-o', '-']);

	// Create the output stream
	// output = linkup.createStream();

	// proc.stdout.on('data', function onData(data) {
	// 	console.log('Piping', data.length);
	// 	output.write(data);
	// });
	output = proc.stdout;

	linkup.submit('stream', {}, output);

	this.proc = proc;
});

module.exports = PiCamera;