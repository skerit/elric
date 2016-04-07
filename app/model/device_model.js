var interfaces = alchemy.shared('elric.interface');

/**
 * The Device Model
 *
 * @constructor
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.0.1
 * @version  0.1.0
 */
var Device = Model.extend(function DeviceModel(options) {

	DeviceModel.super.call(this, options);

	this.device_types = alchemy.shared('device.Types');
	this.automation_protocols = alchemy.shared('AutomationProtocols');
	this.interface_types = alchemy.shared('Elric.interfaces');

	this.icon = 'lightbulb';
});

/**
 * Constitute the class wide schema
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Device.constitute(function addFields() {

	var devices = alchemy.shared('elric.device_type');

	this.belongsTo('Interface');

	this.addField('name', 'String');
	this.addField('device_type', 'Enum');
	this.addField('address', 'Object');

	// Information on the current state of the object
	this.addField('state', 'Object');

	// Return the device
	this.Document.setFieldGetter('device', function getDevice() {
		if (devices[this.device_type]) {
			return new devices[this.device_type](this);
		}
	});

	// Return the protocol
	this.Document.setFieldGetter('protocol', function getProtocol() {

		if (this.device) {
			return this.device.protocol_instance;
		} else {
			// Unknown device
			return null;
		}
	});
});

/**
 * Configure chimera for this model
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Device.constitute(function chimeraConfig() {

	var list,
	    edit;

	if (!this.chimera) {
		return;
	}

	// Get the list group
	list = this.chimera.getActionFields('list');

	list.addField('name');
	list.addField('device_type');
	list.addField('address');
	list.addField('interface_id');
	list.addField('state');

	// Get the edit group
	edit = this.chimera.getActionFields('edit');

	edit.addField('name');
	edit.addField('device_type');
	edit.addField('address');
	edit.addField('interface_id');
	edit.addField('interface_id');
});

/**
 * Get the interface linked to this device
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Device.setDocumentMethod(function getInterface(callback) {

	var that = this,
	    interface;

	Function.series(function getDeviceRecord(next) {

		if (that.Interface) {
			interface = that.Interface;
			return next();
		}

		that.getModel('Interface').findById(that.interface_id, function gotDeviceRecord(err, interface_record) {

			if (err || !interface_record || !interface_record.length) {
				return next(err || new Error('Could not find interface record for device "' + that._id + '"'));
			}

			interface = interface_record;
			next();
		});
	}, function done(err) {

		if (err || !interface) {
			return callback(err || new Error('Failed to get interface'));
		}

		callback(null, interface);
	});
});

/**
 * Get the device's current state.
 * If the protocol allows it, the state is actively queried
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Function} callback
 */
Device.setDocumentMethod(function getDeviceState(callback) {

	var feature = this.device.getFeature('statequery');

	if (feature) {

	}




});

/**
 * Get the command to send to the interface
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {String}   command_name   The device-specific command name
 * @param    {Function} callback
 */
Device.setDocumentMethod(function getProtocolCommand(command_name, callback) {

	var that = this,
	    protoc,
	    config,
	    devc;

	// Device command settings
	devc = this.device.commands[command_name];

	// The protocol command
	protoc = devc.protocol_command;

	if (typeof protoc == 'function') {
		protoc.call(this.device, that, gotProtocolCommand);
	} else {
		config = this.device.protocol_instance.commands[protoc];
		gotProtocolCommand(null, config.name);
	}

	function gotProtocolCommand(err, protocol_command, state_value, force) {

		if (err) {
			return callback(err);
		}

		if (protocol_command === false) {
			return callback(null);
		}

		if (state_value == null) {
			state_value = devc.value;
		}

		// If can_repeat is explicitly false, the same device command won't be sent twice
		if (!force && devc.can_repeat === false && (that.state && that.state.name == devc.name)) {
			return callback(null);
		}

		callback(null, protocol_command, state_value);
	}
});

/**
 * Execute a device feature
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {String}   feature    The device-specific feature
 * @param    {Function} callback
 */
Device.setDocumentMethod(function doFeature(feature, callback) {

	var that = this;

	if (!callback) {
		callback = Function.thrower;
	}

	this.device.doFeature(this, feature, callback);
});

/**
 * Execute a device command by sending it to the interface
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {String}   device_command_name   The device-specific command name
 * @param    {Function} callback
 */
Device.setDocumentMethod(function doCommand(device_command_name, callback) {

	var that = this;

	if (!callback) {
		callback = Function.thrower;
	}

	// Get the command we need to send to the interface
	that.getProtocolCommand(device_command_name, function gotCommand(err, protocol_command, state_value) {

		var data;

		if (err) {
			return callback(err);
		}

		// If the command is false, that means nothing needs to happen
		if (!protocol_command) {
			return callback();
		}

		if (typeof state_value == 'number') {
			data = {
				name: device_command_name,
				last_sent: protocol_command,
				value: state_value
			};
		} else {
			data = state_value;
			data.name = device_command_name;
		}

		// Send the protocol command to the device, update the state later
		that.sendProtocolCommand(protocol_command, function sendCommand(err, result) {

			if (err) {
				return callback(err);
			}

			// Now update the device state
			that.updateState(data, function updatedState(err) {

				if (err) {
					// We couldn't save the state, but that's not such a big deal

					if (DEBUG) {
						that.debug('Could not save state for device "' + (that.name || that._id) + '": ' + err);
					}

					return callback(null, result);
				}
			});
		});
	});
});

/**
 * Execute a protocol command by sending it to the interface
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Object|String}   options     The protocol command to send
 * @param    {Function}        callback
 */
Device.setDocumentMethod(function sendProtocolCommand(options, callback) {

	var that = this,
	    protocol_command,
	    info;

	if (typeof options == 'string') {
		protocol_command = options;
		options = {
			command: protocol_command
		};
	} else {
		protocol_command = options.command;
	}

	if (!callback) {
		callback = Function.thrower;
	}

	if (!protocol_command) {
		return callback(new Error('No protocol command was given'));
	}

	// Get the interface to control this device
	this.getInterface(function gotInterface(err, interface) {

		if (err) {
			return callback(err);
		}

		if (!interface.length) {
			return callback(new Error('Could not find interface for device "' + (that.name || that._id) + '"'));
		}

		if (DEBUG) {
			that.debug('Sending "' + options.command + '" to device "' + (that.name || that._id) + '"');
		}

		interface.sendCommand(that.address, options, callback);
	});
});

/**
 * Update the device state
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Object|String}   new_state   The new device state object, or command
 * @param    {Function}        callback
 */
Device.setDocumentMethod(function updateState(new_state, callback) {

	var that = this,
	    state,
	    info;

	if (!callback) {
		callback = Function.thrower;
	}

	if (typeof new_state == 'string') {
		// Get the protocol command info
		info = this.device.protocol_instance.commands[new_state];

		state = {
			// Last device command is unknown
			name: null,

			// The state value
			value: info.state,

			// Protocol command last sent
			last_sent: protocol_command
		};
	} else {
		state = new_state;
	}

	// Update this record with this new state information
	this.update({state: state}, function storedNewState(err) {

		if (err) {
			return callback(err);
		}

		// Notify browsers and whatnot about this new device state
		alchemy.updateData(that._id, that.Device);

		callback(null, state);
	});
});