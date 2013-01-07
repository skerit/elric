var util = require('util');

module.exports = function (elric) {
	
	/**
	 * The Browser Client class
	 *
	 * @constructor
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.07
	 */
	elric.classes.BrowserClient = function BrowserClient (instructions) {
		
		this.address = instructions.address;
		this.socker = instructions.socket;
		this.type = instructions.type;
		this.event = instructions.event;
		this.username = instructions.username;
		
		this.on = function(){};
		
		// Remove the socket from the active users object
		this.event.on('disconnect', function () {
			elric.activeUsers[this.username].socket = false;
		});
		
		this.event.on('test', function (data) {
			console.log(data);
		});
		
	}
}