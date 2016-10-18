/**
 * The Device Action class
 *
 * @constructor
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {ActionDocument}   document   The (not necesarily saved) document
 */
var Device = Function.inherits('Elric.Action', function DeviceAction(document) {
	DeviceAction.super.call(this, document);
});

/**
 * Set the event schema
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Device.constitute(function setSchema() {

	var device_schema = new Classes.Alchemy.Schema();

	// The device to apply this action to
	device_schema.belongsTo('Device');

	// The name of the action
	device_schema.addField('command', 'String');

	// Add the device schema to this action
	this.schema.addField('commands', 'Schema', {array: true, schema: device_schema});
});

/**
 * Callback with a nice description to display in the scenario editor
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 *
 * @param    {Function}   callback
 */
Device.setMethod(function getDescription(callback) {

	var commands = this.payload.commands,
	    Device,
	    result = '';

	if (!commands || !commands.length) {
		return callback(null, 'Send command to device (not configured)');
	} else if (commands.length == 1) {
		commands = commands[0];

		if (commands.device_id) {
			Device = Model.get('Device');

			Device.findById(commands.device_id, function gotDevice(err, device) {

				if (err || !device.length) {
					return callback(null, 'Send command to device (not found)');
				}

				callback(null, 'Send "' + commands.command + '" command to "' + device.name + '" device');
			});
		} else {
			return callback(null, 'Send command to device (not configured)');
		}
	} else {
		return callback(null, 'Send commands to ' + commands.length + ' devices');
	}
});

/**
 * Set event specific data,
 * should only be called for new events
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
Device.setMethod(function execute(callback) {

	var that = this,
	    commands = this.payload.commands || [],
	    Device = this.getModel('Device'),
	    tasks = [],
	    bomb;

	// Create a bomb to callback after a while
	bomb = Function.timebomb(3000, function doCallBack() {
		console.log('Device action', that, 'did not call back');
		callback(null, null);
	});

	commands.forEach(function eachCommand(entry) {
		tasks.push(function doCommand(next) {

			if (!entry || !entry.device_id) {
				return next();
			}

			Device.findById(entry.device_id, function gotDevice(err, device) {

				if (err) {
					console.log('Error getting device:', err);
					return next();
				}

				if (!device.length) {
					console.log('No device found for entry', entry);
					return next();
				}

				device.doCommand(entry.command, function done(err) {

					if (err) {
						console.log('Error performing command', entry.command, 'on', device);
						return next(err);
					}

					next();
				});
			});
		});
	});

	console.log('Execute device action:', this);

	Function.parallel(tasks, function tasksDone(err) {

		bomb.defuse();

		if (err) {
			return callback(null, false);
		} else {
			return callback(null, true);
		}
	});
});