var rfxcom = elric.use('skerit/node-rfxcom');

/**
 * The Rfxcom ClientFile
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
var Rfxcom = Function.inherits('ClientFile', function RfxcomClientFile(client, settings) {

	var that = this;

	// Call the parent constructor
	RfxcomClientFile.super.call(this, client, settings);

	// Listen to device commands
	this.on('device_command', function gotDeviceCommand(data, callback) {
		try {
			that.doCommand(data.device_address, data.protocol_command, callback);
		} catch (err) {
			log.error('Failed to execute command: ' + err);
			callback(err);
		}
	});
});

/**
 * Startup!
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
Rfxcom.setMethod(function start(callback) {

	var that = this,
	    device;

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
Rfxcom.setMethod(function stop() {
	console.log('Client disconnected, rfxcom is stopping');
});

/**
 * Do a command
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
Rfxcom.setMethod(function doCommand(_address, _command, callback) {

	var that = this,
	    address,
	    command,
	    done,
	    fnc,
	    i;

	if (typeof _address == 'string') {
		address = _address;
	} else {
		// @todo: needs to be decoded on the server
		address = '0x' + (_address.house_code.charCodeAt() - 24);
		address += '/' + Number(_address.unit_code).toPaddedString(2);
	}

	if (typeof _command == 'string') {
		command = _command;
	} else {
		command = _command.protocol_command || _command.command || _command.name;
	}

	done = function done(err, response) {

		if (err) {
			log.error('Failed to execute command ' + command + ' for address ' + address);
		}

		callback(err, response);
	};

	switch (command.toLowerCase()) {

		case 'on':
			fnc = function(next) {
				that.light1.switchOn(address, next);
			};
			break;
		
		case 'off':
			fnc = function(next) {
				that.light1.switchOff(address, next);
			};
			break;
		
		case 'all_on':
			fnc = function(next) {
				that.light1._sendCommand(address, 6, next);
			};
			break;
		
		case 'all_off':
			fnc = function(next) {
				this.light1._sendCommand(address, 5, next);
			};
			break;
		
		// Just for testing
		case 'toggle':
			fnc = function(next) {
				this.light1._sendCommand(address, {command: 0, cmdId: 99}, next);
			};
			break;

		case 'chime':
			fnc = function(next) {
				this.light1._sendCommand(address, 7, next);
			};
			break;
	}

	// Send the command 3 times
	Function.forEach(Array.range(0, 3), function(val, index, next) {
		fnc(next);
	}, done);
});

module.exports = Rfxcom.create;