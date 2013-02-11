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
	 * The basic commands this protocol supports
	 * Warning: even though these have descriptive names, some automation
	 *          protocols do not "force" this expected behaviour.
	 * Example: ARC has "dimmable" light modules which DO NOT respond to "on"
	 *          and "off" as expected, instead it toggles light when receiving
	 *          the "off" command and it does a light dim-cycle on "on".
	 */
	bp.commands = {
		on: {
			name: 'on',
			title: 'Switch On',
			description: 'Turn device on',
			state: 1
		},
		off: {
			name: 'off',
			title: 'Switch Off',
			description: 'Turn device off',
			state: 0
		}
	};
	
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