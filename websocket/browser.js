var util = require('util');
var EventEmitter = require('events').EventEmitter;

module.exports = function (elric) {
	
	/**
	 * The Browser Client class
	 * This is constructed when the login procedure has been completed.
	 *
	 * @constructor
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.07
	 * @version  2013.01.16
	 */
	elric.classes.BrowserClient = function BrowserClient (instructions) {
		
		var thisClient = this;
		
		this.socket = false;
		
		this.type = 'browser';
		this.id = instructions.id;
		this.key = instructions.key;
		this.username = instructions.username;
		this.name = instructions.username;
		this.ip = instructions.ip;
		
		this.event = new EventEmitter();
		
		// Event on helper function
		this.on = function (event, callback) {return this.event.on(event, callback)};
		
		/**
		 * Set things when the browser client connects
		 * 
		 * @author   Jelle De Loecker   <jelle@kipdola.be>
		 * @since    2013.01.16
		 * @version  2013.01.16
		 */
		this.on('connect', function (socket, address) {
			
			// Set the socket
			thisClient.socket = socket;
			
			elric.events.all.emit('browserconnected', thisClient);
			
			elric.activeUsers[thisClient.name].socket = socket;
			
		});
		
		// Remove the socket from the active users object
		this.on('disconnect', function () {
			elric.activeUsers[thisClient.username].socket = false;
		});
	}
}