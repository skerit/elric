var elric = {};

var Director = function Director (elricMaster) {
	elric = elricMaster;
	this.elric = elricMaster;
}

var bp = Director.prototype;

/**
 * Get a device object
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.02.10
 * @version  2013.02.10
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
 * Send a command to the correct interface
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.02.05
 * @version  2013.02.10
 * 
 * @param   {object|string}   device      The device object
 * @param   {object}          options     An object of options
 * @param   {function}        callback    The function to call back
 */
bp.sendCommand = function sendCommand (device, options, callback) {
	
	device = this.getDevice(device);
	
	// If no valid device was found, stop the function
	if (!device) {
		elric.log.error('Could not find address for deviceId ' + deviceId);
		if (callback) callback(err);
		return;
	}
	
	// Get the interface
	var iface_data = this.getInterface(device, options);
	
	if (iface_data) {
		
		// Add interface data to the options, too
		options.interface_id = iface_data.interface_id;
		options.interface_type = iface_data.interface_type.name;
		options.address = device.address;
		
		// Finally: send the command to the correct interface
		iface_data.interface_type.sendCommand(device, iface_data, options, callback);
		
	} else {
		if (callback) callback('no interface found');
	}
}


module.exports = Director;