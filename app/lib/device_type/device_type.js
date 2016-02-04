var categories  = alchemy.shared('device.categories'),
    protocols   = alchemy.shared('elric.automation_protocol');

/**
 * The Device Type class
 *
 * @constructor
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.0.1
 * @version  0.1.0
 */
var DeviceType = Function.inherits('ElricWrapper', function DeviceType() {});

/**
 * Set properties
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
DeviceType.constitute(function setProperties() {

	var commands;

	// Create the default commands
	commands = {
		on: {
			name: 'on',
			title: 'On',
			description: 'Turn device on',
			protocol_command: 'on',
			value: 1
		},
		off: {
			name: 'off',
			title: 'Off',
			description: 'Turn device off',
			protocol_command: 'off',
			value: 0
		}
	};

	this.setProperty('commands', commands);

	if (!categories[this.prototype.category]) {
		categories[this.prototype.category] = [];
	}

	// Add it to the category
	categories[this.prototype.category].push(this);

	// Add an empty features object
	this.setProperty('features', {});
});

/**
 * This is a wrapper class
 */
DeviceType.setProperty('extend_only', true);

/**
 * This wrapper class starts a new group
 */
DeviceType.setProperty('starts_new_group', true);

/**
 * The category of this device
 */
DeviceType.setProperty('category', 'any');

/**
 * What protocol this device type used
 * eg: arc, x10, zwave, ...
 */
DeviceType.setProperty('protocol', false);

/**
 * Return the protocol instance
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @type   {AutomationProtocol}
 */
DeviceType.setProperty(function protocol_instance() {

	if (!this._protocol) {
		this._protocol = this.createProtocolInstance();
	}

	return this._protocol;
});

/**
 * Add feature to this class
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
DeviceType.setStatic(function addFeature(name, configuration) {

	var features = this.prototype.features;

	if (configuration == null) {
		configuration = {};
	}

	configuration.name = name;

	features[name] = configuration;

	return this;
});

/**
 * Return the basic record for JSON
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
DeviceType.setMethod(function toJSON() {
	return {
		name: this.name,
		title: this.title,
		type_name: this.type_name,
		category: this.category,
		protocol: this.protocol,
		commands: this.commands
	};
});

/**
 * Create a protocol instance
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @return   {AutomationProtocol}
 */
DeviceType.setMethod(function createProtocolInstance() {
	return new protocols[this.protocol]();
});

/**
 * Turn a device command into an interface command
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {String}   command     Device specific command
 *
 * @return   {Object}
 */
DeviceType.setMethod(function getInterfaceCommand(command) {

	if (typeof command == 'string') {
		command = this.commands[command];
	}

	return command.protocol_command;
});