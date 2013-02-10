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
	
	/**
	 * The commands this interface can send
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
	 * The last in-between function before actually sending the command
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.05
	 * @version  2013.02.10
	 * 
	 * @param   {string}   device            The device object
	 * @param   {object}   interface_data    Interface data
	 * @param   {object}   options           An object of options
	 * @param   {function} callback          The function to call back
	 */
	bp.sendCommand = function sendCommand (device, interface_data, options, callback) {
		
		// @todo: log in database
		var history = new this.DH.model({
			device_id: device._id,
			interface_id: interface_data.interface_id,
			room_id: null, // @todo: implement room
			command: options.command,
			origin: null // @todo: implement origin
		});
		
		history.save();

		this._sendCommand(device, interface_data, options, callback);
	}
	
	/**
	 * The actual function for sending the command.
	 * Can be used as is, or can be overwritten by the interface
	 * if a special message needs to be sent.
	 *
	 * This function expects the first 3 parameters to be set and working.
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.10
	 * @version  2013.02.10
	 * 
	 * @param   {string}   device      The device object
	 * @param   {object}   interface_data    Interface data
	 * @param   {object}   options     An object of options
	 * @param   {function} callback    The function to call back
	 */
	bp._sendCommand = function sendCommand (device, interface_data, options, callback) {
		
		interface_data.client.submit('device_command_' + options.interface_type, options);
		
		if (callback) callback();
	}
	
	/**
	 * The pre constructor
	 * 
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.05
	 * @version  2013.02.10
	 */
	bp.preConstructor = function preConstructor () {
		// Model links
		this.DH = elric.models.commandHistory;
		this.D = elric.models.device;
	}
	
}