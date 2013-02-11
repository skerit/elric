module.exports = function (elric) {
	
	/**
	 * The Base Device Type class
	 *
	 * @constructor
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.11
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
	 * What protocol this device type used
	 * eg: arc, x10, zwave, ...
	 */
	bp.protocol = false;
	
	/**
	 * The device category
	 */
	bp.category = '';
	
	/**
	 * The commands this device accepts
	 */
	bp.commands = {};
}