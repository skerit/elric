var elric = {};

var Quartermaster = function Quartermaster (elricMaster) {
	elric = elricMaster;
	this.elric = elricMaster;
	
	this.DS = elric.models.deviceState;
	this.DH = elric.models.commandHistory;
	this.D = elric.models.device;
}

var bp = Quartermaster.prototype;

/**
 * Get a device object
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.02.10
 * @version  2013.02.13
 *
 * @param   {string}   device      The device object, or the id in the database
 *
 * @returns {object}   The device object
 */
bp.getDevice = function _getDevice (device) {
	
	var error = false;
	
	// If we've been given an id, get the object
	if (typeof device == 'string') {
		
		// Find the address in the device cache (which should always be available)
		try {
			device = this.elric.models.device.cache[device];
		} catch (err) {
			error = err;
			return false;
		}
	}
	
	// Now get the state of the device
	try {
		device.state = this.elric.models.deviceState.index.device_id.cache[device._id];
	} catch (err) {
		device.state = false;
	}
	
	if (typeof device.state == 'undefined') device.state = false;
	
	// Make sure there is an address set
	if (!device.address) return false;
	
	return device;
}

/**
 * Get the interface of a device
 * 
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.02.10
 * @version  2013.02.10
 *
 * @param   {object}   device      The device object
 *
 * @returns {object}   The interface object
 */
bp.getInterface = function getInterface (device) {
	
	if (typeof device['interfaces'][0] == 'undefined') {
		return false;
	}
	
	try {
		
		// Get the client interface that controls this
		var interface_id = device['interfaces'][0];
		
		// Get the client specific interface record
		var interface_record = elric.models.interface.cache[interface_id];
		
		// Now get the main interface type
		var interface_type = elric.interfaces[interface_record.interface_type];
	} catch (err) {
		return false;
	}
	
	var idata = {};
	
	idata.interface_id = interface_id;
	idata.interface_record = interface_record;
	idata.interface_type = interface_type;
	idata.client = this.elric.clients[interface_record.client_id];
	
	return idata;
}

/**
 * Get the device type
 * 
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.02.13
 * @version  2013.02.13
 *
 * @param   {object}   device      The device object
 *
 * @returns {object}   The device_type object
 */
bp.getDeviceType = function getDeviceType (device) {
	return elric.deviceTypes[device.device_type];
}

/**
 * Send a command to the correct interface
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.02.05
 * @version  2013.02.13
 * 
 * @param   {object|string}   device      The device object
 * @param   {object}          options     An object of options
 * @param   {function}        callback    The function to call back
 */
bp.sendCommand = function sendCommand (device, options, callback) {
	
	var thisQuartermaster = this;
	
	device = this.getDevice(device);
	
	// If no valid device was found, stop the function
	if (!device) {
		elric.log.error('Could not find address for deviceId ' + deviceId);
		if (callback) callback(err);
		return;
	}
	
	// Get the device type
	var device_type = this.getDeviceType(device);
	
	// Get the interface
	var iface_data = this.getInterface(device, options);
	
	if (iface_data) {
		
		// Add interface data to the options, too
		options.interface_id = iface_data.interface_id;
		options.interface_type = iface_data.interface_type.name;
		options.address = device.address;
		
		// Log this command in the history
		var history = new this.DH.model({
			device_id: device._id,
			interface_id: iface_data.interface_id,
			room_id: null, // @todo: implement room
			command: options.command,
			origin: null // @todo: implement origin
		});
		
		history.save();
		
		var cmd = options.command;
		var type = options.command_type;
		var new_state_value = false;
		
		var new_options = elric.inject({}, options);
		
		// Is it a protocol command?
		if (type == 'protocol') {
			try {
				new_state_value = device_type.protocol_meaning[cmd].state;
			} catch (err) {
				// No state was given
				new_state_value = false;
			}
			
			iface_data.interface_type.sendCommand(device, iface_data, new_options, callback);
			this.setDeviceState(device, new_state_value);
			
		} else if (type == 'device') {
			
			if (typeof device_type.commands[cmd] != 'undefined') {
				var d_cmd = device_type.commands[cmd];
				
				// If this is just an alias for a protocol command ...
				if (d_cmd.protocol_command){
					new_options.command_type = 'protocol';
					new_options.command = d_cmd.protocol_command;
					
					iface_data.interface_type.sendCommand(device, iface_data, new_options, callback);

					this.setDeviceState(device, d_cmd.state);
					
				} else if (d_cmd.handler) {
					
					var current_state = false;
					
					try {
						current_state = device.state.state;
					} catch (err) {
						current_state = false;
					}
					
					d_cmd.handler(device, current_state, function (protocol_commands, new_state) {
						
						// @todo: We're not sure the command was actually sent ...
						thisQuartermaster.setDeviceState(device, new_state);
						
						new_options.command_type = 'protocol';
						
						var length = protocol_commands.length;
						
						for (var i = 0; i < length; i++) {
							
							var do_callback = false;
							
							if ((i+1) == length) do_callback = callback;
							
							var p_cmd = protocol_commands[i];
							new_options.command = p_cmd;
							iface_data.interface_type.sendCommand(device, iface_data, new_options, do_callback);
						}
						
					});
					
				}
			}
		}
		
	} else {
		if (callback) callback('no interface found');
	}
}

/**
 * Set the new device state
 * 
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.02.13
 * @version  2013.02.13
 *
 */
bp.setDeviceState = function setDeviceState (device, new_state_value) {
	
	var thisQuartermaster = this;
	
	if (new_state_value === false) return;
	
	this.DS.model.findOneAndUpdate({device_id: device._id},
		{state: new_state_value},
		{upsert: true}, function (err, item) {
		
		// Because findOneAndUpdate is yet another save-method mongoose does not
		// fire 'save' events for, we'll have to do it ourselves
		thisQuartermaster.elric.models.deviceState.index.device_id.cache[device._id] = item;
		
	})
}

module.exports = Quartermaster;