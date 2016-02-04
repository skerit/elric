var interfaces = alchemy.shared('Elric.interfaces');

/**
 * The Interface class
 *
 * @constructor
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.0.1
 * @version  0.1.0
 */
var Interface = Function.inherits('ElricWrapper', function Interface() {});

/**
 * This is a wrapper class
 */
Interface.setProperty('extend_only', true);

/**
 * This wrapper class starts a new group
 */
Interface.setProperty('starts_new_group', true);

/**
 * Set the supported protocols
 */
Interface.setProperty('protocols', []);

/**
 * Execute the command.
 * Sends it to the client by default, there the client_file will handle it
 * 
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.0.1
 * @version  0.1.0
 * 
 * @param    {String}   client_id          The id of the client to send it to
 * @param    {Object}   address            The address of the device
 * @param    {String}   protocol_command   The protocol command to send
 */
Interface.setMethod(function sendCommand(client_id, address, protocol_command, callback) {

	var that = this,
	    client = elric.getClient(client_id),
	    data;

	data = {
		// Non-binding information
		target_type: 'interface',

		// Which client file we need to address
		client_type: this.type_name,

		// The type of command
		command_type: 'device_command',

		// Payload needed to complete command
		device_address: address,
		protocol_command: protocol_command
	};

	client.submit('client-command', data, function gotResponse(err, result) {
		callback(err, result);
	});
});