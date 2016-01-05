var interfaces = alchemy.shared('elric.interface');

/**
 * The Device Model
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  1.0.0
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
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    1.0.0
 * @version  1.0.0
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
 * @since    1.0.0
 * @version  1.0.0
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
 * @since    1.0.0
 * @version  1.0.0
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
 * Get the command to send to the interface
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
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
 * Execute a command, send it to the interface
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
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

		that.sendProtoCommand(protocol_command, data, callback);
	});
});

/**
 * Execute a command, send it to the interface
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 *
 * @param    {String}   protocol_command   The protocol command to send
 * @param    {Object}   new_state          The new state object to set
 * @param    {Function} callback
 */
Device.setDocumentMethod(function sendProtoCommand(protocol_command, new_state, callback) {

	var that = this,
	    info;

	if (typeof new_state == 'function') {
		callback = new_state;
		new_state = null;
	}

	if (!callback) {
		callback = Function.thrower;
	}

	if (!new_state && new_state !== false) {
		// Get the protocol command info
		info = this.device.protocol_instance.commands[protocol_command];

		new_state = {
			// Last device command is unknown
			name: null,

			// The state value
			value: info.state,

			// Protocol command last sent
			last_sent: protocol_command
		};
	}

	// Get the interface
	this.getInterface(function gotInterface(err, interface_document) {

		var interface,
		    address;

		if (err) {
			return callback(err);
		}

		// Create the interface instance
		interface = interface_document.createInstance();

		interface.sendCommand(interface_document.client_id, that.address, protocol_command, function done(err, response) {

			if (err) {
				return callback(err);
			}

			// If new_state is false, don't update the database
			if (new_state === false) {
				return callback(null);
			}

			console.log('Updating state:', new_state);

			// Store the new state
			that.update({state: new_state}, function storedNewState(err, document) {

				if (err) {
					return callback(err);
				}

				// Send the device update
				alchemy.updateData(that._id, that.Device);
				callback(null, new_state);
			});
		});
	});
});