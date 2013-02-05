module.exports = function (elric) {
	
	/**
	 * The Base Interface class
	 *
	 * @constructor
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.02
	 */
	elric.classes.BaseInterface = function BaseInterface () {
		
		// This constructor will be overwritten
		
	}
	
	var bet = elric.classes.BaseInterface;
	var bp = bet.prototype;
	
	/**
	 * The name/identifier of this interface
	 * Used for storing in the database
	 */
	bp.name = 'baseInterface';
	
	/**
	 * The title of this interface
	 * This should be shown in the interface instead of the name
	 */
	bp.title = 'Base Interface';
	
	/**
	 * The interface device
	 */
	bp.interface = false;
	
	/**
	 * Turn a device on, based on the deviceId.
	 * Performs a lookup in the database for the device address and calls the
	 * switchOnAddress function.
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.05
	 * @version  2013.02.05
	 *
	 * @param   {string}   deviceId    The if of the device in the database
	 * @param   {object}   options     An object of options
	 * @param   {function} callback    The function to call back
	 */
	bp.switchOn = function switchOn (deviceId, options, callback) {
		
		var error = false;
		
		// Find the address in the device cache (which should always be available)
		try {
			var address = elric.models.device.cache[deviceId];
		} catch (err) {
			error = err;
		}
		
		// Make sure we found a device address
		if (!address || error) {
			if (!error) error = 'Device id not found';
			
			elric.log.error('Could not find address for deviceId ' + deviceId);
			if (callback) callback(err);
			return;
		}
		
		// Forward the command
		this.switchOnAddress(address, options, callback);
	}
	
	/**
	 * Turn a device on based on its address
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.05
	 * @version  2013.02.05
	 *
	 * @param   {string}   address     The address of the device
	 * @param   {object}   options     An object of options
	 * @param   {function} callback    The function to call back
	 */
	bp.switchOnAddress = function switchOnAddress (address, options, callback) {
		
		elric.log.info('Switching on device ' + address);
		this._switchOnAddress(address, options, callback);
	}
	
	/**
	 * Turn a device on based on its address, the extendible function
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.05
	 * @version  2013.02.05
	 * 
	 * @param   {string}   address     The address of the device
	 * @param   {object}   options     An object of options
	 * @param   {function} callback    The function to call back
	 */
	bp._switchOnAddress = function _switchOnAddress (address, options, callback) {
		// This function will be overwritten
	}
	
	/**
	 * The pre constructor
	 * 
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.05
	 * @version  2013.02.05
	 */
	bp.preConstructor = function preConstructor () {
		
	}
	
}