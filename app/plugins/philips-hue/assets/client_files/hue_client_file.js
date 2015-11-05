var libhue = elric.use('node-hue-api'),
    lightState = libhue.lightState;

/**
 * The Hue ClientFile
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
var Hue = Function.inherits('ClientFile', function HueClientFile(client, settings) {

	var that = this;

	// Call the parent constructor
	HueClientFile.super.call(this, client, settings);

	console.log('Remote command method?', this.remoteCommand);

	console.log('Got hue settings:', settings, client);

	// Listen to device commands
	this.on('device_command', function gotDeviceCommand(data, callback) {

		var state = lightState.create();

		if (data.protocol_command == 'on') {
			state.on();
		} else if (data.protocol_command == 'off') {
			state.off();
		}

		that.connection.setLightState(data.device_address.id, state, function(err, result) {

			console.log('Set state:', err, result);

		});

		console.log('Got device command:', data);

	});
});

/**
 * Startup!
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
Hue.setMethod(function start(callback) {

	var that = this,
	    device;

	// Create the connection
	if (this.settings.username) {
		this.connection = new libhue.HueApi(this.settings.ip, this.settings.username);

		this.scanDevices(function gotLights(err, lights) {

			if (err) {
				return console.error('Error getting devices:', err);
			}

			that.remoteCommand('processDevices', lights);
		});
	}

	return console.log('Starting?', this);

	if (this.settings.device_path) {
		device = this.settings.device_path;
	} else {
		device = '/dev/ttyUSB0';
		log.info('Rfxcom device path not found, defaulting to ' + device);
	}

	// Create the new rfx instance
	this.rfx = new rfxcom.RfxCom(device, {debug: true || this.settings.debug});

	this.rfx.on('receive', function received(chunk) {
		console.log('RFX received chunk: ' + chunk, chunk);
	});

	// Initialize the device
	this.rfx.initialise(function initialised() {

		that.light1 = new rfxcom.Lighting1(that.rfx, rfxcom.lighting1.ARC);

		that.emit('ready');

		if (callback) callback();
	});
});

/**
 * Stop
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
Hue.setMethod(function stop() {
	console.log('Client disconnected, Hue is stopping');
});

/**
 * Scan for devices
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
Hue.setMethod(function scanDevices(callback) {

	var that = this;

	this.connection.lights(function gotLights(err, lights) {
		console.log('Found these lights:', err, lights);
		callback(err, lights);
	});
});

/**
 * Do a command
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
Hue.setMethod(function doCommand(_address, _command, callback) {

	var that = this,
	    address,
	    command,
	    done,
	    fnc,
	    i;



	return;

});

module.exports = Hue.create;