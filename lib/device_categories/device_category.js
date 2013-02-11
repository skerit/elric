module.exports = function (elric) {
	
	/**
	 * The Base Device Category class
	 *
	 * @constructor
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.02
	 * @version  2013.02.11
	 */
	elric.classes.BaseDeviceCategory = function BaseDeviceCategory () {
		
		// This constructor will be overwritten
		
	}
	
	var bet = elric.classes.BaseDeviceCategory;
	var bp = bet.prototype;
	
	/**
	 * The name/identifier of this device category
	 * Used for storing in the database
	 */
	bp.name = 'baseDeviceCategory';
	
	/**
	 * The title of this device type
	 * This should be shown in the interface instead of the name
	 */
	bp.title = 'Base Device Category';
	
}