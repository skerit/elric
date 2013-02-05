module.exports = function (elric) {
	
	/**
	 * The Base Device Type class
	 *
	 * @constructor
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.02
	 */
	elric.classes.BaseDeviceType = function BaseDeviceType () {
		
		// This constructor will be overwritten
		
	}
	
	var bet = elric.classes.BaseDeviceType;
	var bp = bet.prototype;
	
	/**
	 * The name/identifier of this device type
	 * Used for storing in the database
	 */
	bp.name = 'baseDeviceType';
	
	/**
	 * The title of this device type
	 * This should be shown in the interface instead of the name
	 */
	bp.title = 'Base Device Type';
	
	/**
	 * How this device is handled, by what interface
	 * eg: rfxcom, cm15, ...
	 */
	bp.interface = false;
	
}