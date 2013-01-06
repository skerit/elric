module.exports = function (elric) {
	
	/**
	 * The Base Capability class
	 *
	 * @constructor
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.06
	 */
	elric.classes.BaseCapability = function BaseCapability () {
		
		// This constructor will be overwritten
		
	}
	
	var bet = elric.classes.BaseCapability;
	var bp = bet.prototype;
	
	/**
	 * The name/identifier of this capability
	 * Used for storing in the database
	 */
	bp.name = 'baseCapability';
	
	/**
	 * The title of this capability
	 * This should be shown in the interface instead of the name
	 */
	bp.title = 'Base Capability';
	
	/**
	 * The version of the client file
	 */
	bp.version = '2013.01.01';
	
	/**
	 * The plugin we're in
	 */
	bp.plugin = false;
	
}