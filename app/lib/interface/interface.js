var interfaces = alchemy.shared('Elric.interfaces');

/**
 * The Interface class
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  0.1.0
 */
alchemy.create(function Interface() {

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
		var name     = child.name.replace(/Interface$/, ''),
		    typeName = name.underscore(),
		    title    = name.titleize();

		child.prototype.typeName = typeName;

		// Do not let the child inherit the extendonly setting
		if (!child.prototype.hasOwnProperty('title')) {
			child.prototype.title = title;
		}

		// Register this protocol
		if (!child.prototype.extendonly) {
			interfaces[typeName] = title;
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
		 * The supported protocols
		 */
		this.protocols = [];
		
	};

	/**
	 * The actual logic behind this action
	 * 
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    0.0.1
	 * @version  0.1.0
	 * 
	 * @param   {String}   device      The device object
	 * @param   {Object}   interface_data    Interface data
	 * @param   {Object}   options     An object of options
	 * @param   {Function} callback    The function to call back
	 */
	this.sendCommand = function sendCommand (device, interface_data, options, callback) {
		
		interface_data.client.submit('device_command_' + options.interface_type, options);
		
		if (callback) callback();
	};

});