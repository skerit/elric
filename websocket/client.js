var util = require('util');
var fs = require('fs');

module.exports = function (elric) {
	
	var Client = elric.models.client.model;
	var ClientCapability = elric.models.clientCapability.model;
	
	/**
	 * The Elric Client class
	 * This is constructed when the login procedure has been completed.
	 *
	 * @constructor
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.07
	 * @version  2013.01.09
	 * 
	 */
	elric.classes.ElricClient = function ElricClient (instructions) {
		
		var socket = instructions.socket;
		var thisClient = this;
		
		this.address = instructions.address;
		this.socket = instructions.socket;
		this.type = instructions.type;
		this.event = instructions.event;
		this.username = instructions.username;
		this.id = instructions.id;
		
		// Submit helper function
		var submit = function (type, data) {return elric.submit(socket, type, data)};
		this.submit = submit;
		
		// Event on helper function
		this.on = function (event, callback) {return this.event.on(event, callback)};
		
		// Listen to the disconnect event
		this.on('disconnect', function () {
			
		});
		
		/**
		 * Before the client starts loading files,
		 * it needs settings for them
		 * 
		 * @author   Jelle De Loecker   <jelle@kipdola.be>
		 * @since    2013.01.09
		 * @version  2013.01.09
		 */
		this.on('readyForSettings', function () {
			// Send all capability settings
			thisClient.sendSettings();
		});
		
		/**
		 * After the client has loaded its settings,
		 * we'll get a readyForTransfer event
		 * 
		 * @author   Jelle De Loecker   <jelle@kipdola.be>
		 * @since    2013.01.07
		 * @version  2013.01.09
		 */
		this.on('readyForTransfer', function (data) {
			
			// Send files to the client
			for (var capname in elric.capabilities) {
				
				var cap = elric.capabilities[capname];
				
				var path = './client_files/' + capname + 'ClientFile.js';
				
				if (cap.plugin) {
					path = './plugins/' + cap.plugin + '/client_files/' + capname + 'ClientFile.js';
				}
				
				fs.readFile(path, 'utf-8', function (err, data) {
					submit('file', {
							name: capname,
							data: data,
							type: 'clientfile'
						});
				});
			}
			
			submit('allFilesSent');
		});
		
		/**
		 * The client has actually started now
		 * 
		 * @author   Jelle De Loecker   <jelle@kipdola.be>
		 * @since    2013.01.09
		 * @version  2013.01.09
		 */
		this.on('started', function (data) {
			
		});

	}
	
	/**
	 * Send all capability settings to the client
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.08
	 */
	elric.classes.ElricClient.prototype.sendSettings = function sendSettings () {
		
		var submit = this.submit;
		
		// Find an array of capability settings for this client
		ClientCapability.find({client_id: this.id}, function(err, items) {
			
			var settings = {};
			
			for (var index in items) {
				
				// A link to this item
				var i = items[index];
				
				// Create the new capability entry
				settings[i.capability] = {};
				
				// Create a link to that entry
				var ca = settings[i.capability];
				ca.settings = i.settings;
				ca.updated = i.updated;
				ca.created = i.created;
				ca.enabled = i.enabled;
			}
			
			// Finally: send all capability settings to the client
			submit('settings', settings);
		});
	}
}