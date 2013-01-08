var util = require('util');
var fs = require('fs');

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
		
		// Listen to the disconnect event
		this.on('disconnect', function () {
			
		});
		
		this.on('test', function (data) {
			console.log(data);
		});
		
		// Await the transfer ready signal
		this.on('readyForTransfer', function (data) {
			
			// Send files to the client
			for (var capname in elric.capabilities) {
				
				var cap = elric.capabilities[capname];
				
				var path = './client_files/' + capname + 'ClientFile.js';
				
				if (cap.plugin) {
					path = './plugins/' + cap.plugin + '/client_files/' + capname + 'ClientFile.js';
				}
				
				fs.readFile(path, 'utf-8', function (err, data) {
					submit({
							name: capname,
							data: data,
							type: 'clientfile'
						}, 'file');
				});
			}
			
			submit('done', 'allFilesSent');
		});
		
	}
}