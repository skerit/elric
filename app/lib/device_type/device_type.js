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
var DeviceType = Function.inherits('Elric.Wrapper', function DeviceType() {});

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

	// Add the 'on' feature
	this.addFeature('on', {

		// The title of this feature, used on buttons
		// If not set, the name will be titleized instead
		title: 'On',

		// The description of this feature
		description: 'Turn device on',

		// The protocol command it sends
		command: 'on',

		// The optional state value it should set
		state: 1
	});

	// Add the 'off' feature
	this.addFeature('off', {
		description: 'Turn device off',
		command: 'off',
		state: 0
	});
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

	// Make sure the name is lowercase
	name = String(name).toLowerCase();

	if (configuration == null) {
		configuration = {};
	}

	// Make sure the name is set
	configuration.name = name;

	// Make sure there is a title
	if (!configuration.title) {
		configuration.title = name.titleize();
	}

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
		commands: this.commands,
		features: this.getFeatures()
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

/**
 * Get a feature's configuration
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
DeviceType.setMethod(function getFeature(name) {
	return this.features[String(name).toLowerCase()];
});

/**
 * Return all features
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
DeviceType.setMethod(function getFeatures() {
	return this.features;
});

/**
 * Execute a device feature
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {DeviceDocument}  record    The device record
 * @param    {String|Object}   feature   The feature name or object
 * @param    {Function}        callback  The function to call with data
 */
DeviceType.setMethod(function doFeature(record, feature, callback) {

	var that = this,
	    name;

	if (typeof feature == 'string') {
		name = feature;
		feature = this.getFeature(feature);
	}

	if (typeof callback != 'function') {
		callback = Function.thrower;
	}

	if (!feature) {
		return callback(new Error('Feature "' + name + '" could not be found'));
	}

	console.log('Got feature definition:', feature);

	if (feature.command) {
		record.sendProtocolCommand(feature.command, function gotResponse(err, result) {

			var new_state;

			if (err) {
				return callback(err);
			}

			// If the feature has a state, set it
			if (feature.state != null) {

				if (typeof feature.state == 'object') {
					new_state = Object.assign({}, feature.state);
				} else {
					new_state = {value: feature.state};
				}

				// Always override the feature name
				new_state.feature = feature.name;

				// Always override the commands that sent this
				new_state.command = feature.command;

				console.log('Updating state:', new_state);

				// Update the state, but don't wait for it to callback
				record.updateState(new_state);
			}

			callback(null, result);
		});
	}
});