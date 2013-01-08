var util = require('util');

module.exports = function (elric) {
	
	/**
	 * The Browser Client class
	 * This is constructed when the login procedure has been completed.
	 *
	 * @constructor
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.07
	 */
	elric.classes.BrowserClient = function BrowserClient (instructions) {
		
		var socket = instructions.socket;
		
		this.address = instructions.address;
		this.socket = instructions.socket;
		this.type = instructions.type;
		this.event = instructions.event;
		this.username = instructions.username;
		
		// Submit helper function
		var submit = function (message, type) {return elric.submit(socket, message, type)};

		// Event on helper function
		this.on = function (event, callback) {return this.event.on(event, callback)};
		
		// Remove the socket from the active users object
		this.on('disconnect', function () {
			elric.activeUsers[this.username].socket = false;
		});
		
		this.on('test', function (data) {
			console.log(data);
		});
		
	}
}