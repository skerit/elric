/**
 * The Base Automation Protocol class
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  0.1.0
 */
var AProtocol = Function.inherits('ElricWrapper', function AutomationProtocol() {});

/**
 * Set properties
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  1.0.0
 */
AProtocol.constitute(function setProperties() {

	var commands;

	/**
	 * The basic commands this protocol supports
	 * Warning: even though these have descriptive names, some automation
	 *          protocols do not "force" this expected behaviour.
	 * Example: ARC has "dimmable" light modules which DO NOT respond to "on"
	 *          and "off" as expected, instead it toggles light when receiving
	 *          the "off" command and it does a light dim-cycle on "on".
	 */
	commands = {
		on: {
			name: 'on',
			title: 'Switch On',
			description: 'Turn device on',
			value: 1
		},
		off: {
			name: 'off',
			title: 'Switch Off',
			description: 'Turn device off',
			value: 0
		}
	};

	this.setProperty('commands', commands);
});

/**
 * This is a wrapper class
 */
AProtocol.setProperty('extend_only', true);

/**
 * This wrapper class starts a new group
 */
AProtocol.setProperty('starts_new_group', true);

/**
 * The description of this protocol
 *
 * @type   {String}
 */
AProtocol.setProperty('description', '');

/**
 * Return the basic record for JSON
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
AProtocol.setMethod(function toJSON() {
	return {
		name: this.name,
		title: this.title,
		type_name: this.type_name,
		commands: this.commands
	};
});