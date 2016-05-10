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

		if (!this._device_type_instance && devices[this.device_type]) {
			this._device_type_instance = new devices[this.device_type](this);
		}

		return this._device_type_instance;
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
 * Get a device record and cache it in the user session
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Device.setMethod(function findAndCache(device_id, callback) {

	var that = this,
	    session;

	if (this.conduit) {
		session = this.conduit.session();

		if (session.device_cache == null) {
			session.device_cache = {};
		} else if (session.device_cache[device_id]) {
			return callback(null, session.device_cache[device_id]);
		}
	}

	this.findById(device_id, function gotDevice(err, record) {

		if (err) {
			return callback(err);
		}

		if (session) {
			session.device_cache[device_id] = record;
		}

		callback(null, record);
	});
});

/**
 * Get the interface linked to this device
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Device.setDocumentMethod(function getInterface(callback) {

	var that = this;

	if (this.Interface) {
		return callback(null, this.Interface);
	}

	this.getModel('Interface').findById(this.interface_id, function gotDeviceRecord(err, interface_record) {

		if (err || !interface_record || !interface_record.length) {
			return callback(err || new Error('Could not find interface record for device "' + that._id + '"'));
		}

		// Store the interface in the record, for possible later use
		that.Interface = interface_record;

		callback(null, interface_record);
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
 * @param    {Boolean}  force_refresh   If true, state is queried from device (if possible)
 * @param    {Function} callback
 */
Device.setDocumentMethod(function getDeviceState(force_refresh, callback) {

	var that = this,
	    state_feature = this.device.getFeature('statequery');

	if (typeof force_refresh == 'function') {
		callback = force_refresh;
		force_refresh = false;
	}

	// If no state data is available, force a refresh
	if (!this.state || !this.state.device_data) {
		force_refresh = true;
	}

	if (!that.state) {
		that.state = {};
	}

	// If the device has the statequery feature,
	// and a refresh is forced, do so
	if (state_feature && force_refresh) {
		this.device.doFeature(this, state_feature, function gotState(err, result) {

			var result;

			console.log('Got device state:', err, result);

			if (err) {
				return callback(err);
			}

			that.state.device_data = result;

			// Already call back
			callback(null, that.state);

			// Save the document, too
			that.save(function doSave(err) {
				if (err) {
					console.error('Failed to save device state: ' + err);
				}
			});
		});
	} else {
		// @todo: return document values
		callback(null, this.state || {});
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
Device.setDocumentMethod(function doFeature(feature, data, callback) {

	var that = this;

	if (typeof data == 'function') {
		callback = data;
		data = null;
	}

	if (!callback) {
		callback = Function.thrower;
	}

	this.device.doFeature(this, feature, data, callback);
});

/**
 * Read a device's feature state
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {String}   feature    The device-specific feature
 * @param    {Function} callback
 */
Device.setDocumentMethod(function readFeature(feature, callback) {

	var that = this;

	if (!callback) {
		callback = Function.thrower;
	}

	this.device.readFeature(this, feature, callback);
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
 * Execute a protocol command by sending it to the interface.
 * There is no throttling here.
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

		interface.sendCommand(that.address, options, function gotInterfaceResponse(err, response) {

			if (err) {
				return callback(err);
			}

			return callback(null, response);
		});
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

	// Merge the new object into the old one
	state = Object.merge({}, this.state, state);

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