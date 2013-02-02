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
	
}