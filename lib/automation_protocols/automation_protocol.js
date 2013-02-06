module.exports = function (elric) {
	
	/**
	 * The Base Automation Protocol class
	 *
	 * @constructor
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.06
	 */
	elric.classes.BaseAutomationProtocol = function BaseAutomationProtocol () {
		
		// This constructor will be overwritten
		
	}
	
	var bet = elric.classes.BaseAutomationProtocol;
	var bp = bet.prototype;
	
	/**
	 * The name/identifier of this protocol
	 * Used for storing in the database
	 */
	bp.name = 'baseAutomationProtocol';
	
	/**
	 * The title of this protocol
	 * This should be shown in the interface instead of the name
	 */
	bp.title = 'Base Automation Protocol';
	
	/**
	 * A description of this protocol
	 */
	bp.description = '';
	
	/**
	 * How to create a device address
	 */
	bp.addressBlueprint = {};
	
	/**
	 * The pre constructor
	 * 
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.06
	 * @version  2013.02.06
	 */
	bp.preConstructor = function preConstructor () {
		this.deviceBlueprint = {};
	}
	
}