var util = require('util');

module.exports = function (elric) {
	
	/**
	 * The Elric Client class
	 *
	 * @constructor
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.07
	 */
	elric.classes.ElricClient = function ElricClient (instructions) {
		
		this.address = instructions.address;
		this.socker = instructions.socket;
		this.type = instructions.type;
		this.event = instructions.event;
		this.username = instructions.username;
		
		this.on = function(){};
		
		this.event.on('disconnect', function () {
			
		});
		
		this.event.on('test', function (data) {
			console.log(data);
		});
		
	}
}