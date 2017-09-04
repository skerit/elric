var spawn = require('child_process').spawn;

/**
 * The X11 ClientFile
 *
 * @constructor
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
var X11 = Function.inherits('ClientFile', function X11ClientFile(client, settings) {

	var that = this;

	// Call the parent constructor
	X11ClientFile.super.call(this, client, settings);
});

/**
 * Startup!
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
X11.setMethod(function start(callback) {

	var that = this;

	log.info('Starting X11...');

	// Start the process
	this.proc = spawn('startx');

	// Listen for exit event
	this.proc.on('exit', function onClose(code, signal) {
		log.info('X11 closed with exit code', code, 'because of signal', signal);
	});

	callback();
});

/**
 * Stop
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
X11.setMethod(function stop() {
	if (this.proc) {

		log.info('Killing X11 session');

		this.proc.kill();
		this.proc = null;
	}
});

module.exports = X11;