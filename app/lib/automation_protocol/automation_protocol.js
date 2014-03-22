var protocols = alchemy.shared('AutomationProtocols');

/**
 * The Base Automation Protocol class
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  0.1.0
 */
alchemy.create(function AutomationProtocol() {

	/**
	 * Set the title properties
	 *
	 * @author   Jelle De Loecker   <jelle@codedor.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 *
	 * @param    {Function}   parent   The parent class
	 * @param    {Function}   child    The (extended) child class
	 */
	this.__extended__ = function __extended__(parent, child) {

		// Extract the name
		var name     = child.name.replace(/AutomationProtocol$/, ''),
		    typeName = name.underscore(),
		    title    = name.titleize();

		child.prototype.typeName = typeName;

		// Do not let the child inherit the extendonly setting
		if (!child.prototype.hasOwnProperty('title')) {
			child.prototype.title = title;
		}

		// Register this protocol
		if (!child.prototype.extendonly) {
			protocols[typeName] = title;
		}
	};

	/**
	 * The pre constructor
	 * 
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    0.0.1
	 * @version  0.1.0
	 */
	this.preInit = function preInit() {

		/**
		 * A description of this protocol
		 */
		this.description = '';

		/**
		 * How to create a device address
		 */
		this.addressBlueprint = {};

		/**
		 * The basic commands this protocol supports
		 * Warning: even though these have descriptive names, some automation
		 *          protocols do not "force" this expected behaviour.
		 * Example: ARC has "dimmable" light modules which DO NOT respond to "on"
		 *          and "off" as expected, instead it toggles light when receiving
		 *          the "off" command and it does a light dim-cycle on "on".
		 */
		this.commands = {
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

		this.blueprint = false;
	};

});