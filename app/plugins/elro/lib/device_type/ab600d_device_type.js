/**
 * The AB600D Device Type
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.0.1
 * @version  1.0.0
 */
var AB600D = Function.inherits('DeviceType', function Ab600dDeviceType() {});

/**
 * Set the title properties
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
AB600D.constitute(function setProperties() {

	var commands = this.prototype.commands;

	/**
	 * The 'on' command needs to get previous state information
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    1.0.0
	 * @version  1.0.0
	 *
	 * @param    {DeviceModelDocument}   document
	 * @param    {Function}              callback
	 */
	commands.on.protocol_command = function getOnProtocolCommand(document, callback) {

		if (!document.state || !document.state.value) {
			// Send the protocol 'off' command
			callback(null, 'off');
		} else {
			// It's already on, don't send anything
			callback(null, false);
		}
	};

	// On can not repeat
	commands.on.can_repeat = false;

	/**
	 * The 'off' command needs to get previous state information
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    1.0.0
	 * @version  1.0.0
	 *
	 * @param    {DeviceModelDocument}   document
	 * @param    {Function}              callback
	 */
	commands.off.protocol_command = function getOffProtocolCommand(document, callback) {



		if (!document.state || !document.state.value) {
			// It's already off, don't send anything
			callback(null, false);
		} else {
			// It's off, so send the protocol command to toggle
			callback(null, 'off');
		}
	};

	// Off can also not repeat
	commands.off.can_repeat = false;
});

/**
 * Set the full-caps title
 */
AB600D.setProperty('title', 'AB600D');

/**
 * Set the protcol
 */
AB600D.setProperty('protocol', 'arc');

/**
 * Set the category
 */
AB600D.setProperty('category', 'light');