var util = require('util');
var fs = require('fs');
var EventEmitter = require('events').EventEmitter;

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
	 * @version  2013.01.15
	 */
	elric.classes.ElricClient = function ElricClient (instructions) {

		var thisClient = this;
		
		this.id = instructions.id;
		this.key = instructions.key;
		this.name = instructions.name;
		this.ip = instructions.ip;
		
		this.event = new EventEmitter();
		
		// Event on helper function
		this.on = function (event, callback) {return this.event.on(event, callback)};
		
		/**
		 * Set things when the client connects
		 * 
		 * @author   Jelle De Loecker   <jelle@kipdola.be>
		 * @since    2013.01.15
		 * @version  2013.01.16
		 */
		this.on('connect', function (socket, address) {
			
			// Set the socket
			thisClient.socket = socket;
			
			// Set the (new) host
			thisClient.host = address.address;
			
			elric.events.all.emit('clientconnected', thisClient);
			
			// Process the file queue
			thisClient.processFileQueue();
			
			// Process the socket message queue
			thisClient.processSocketQueue();
		});
		
		/**
		 * Set things when the client connects
		 * 
		 * @author   Jelle De Loecker   <jelle@kipdola.be>
		 * @since    2013.01.15
		 * @version  2013.01.16
		 */
		this.on('disconnect', function () {
		
			thisClient.socket = false;
		
			elric.events.all.emit('clientdisconnected', thisClient);
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
				
				var path = './lib/client_files/' + capname + 'ClientFile.js';
				
				if (cap.plugin) {
					path = './plugins/' + cap.plugin + '/lib/client_files/' + capname + 'ClientFile.js';
				}
				
				fs.readFile(path, 'utf-8', function (err, data) {
					thisClient.submit('file', {
							name: capname,
							data: data,
							type: 'clientfile'
						});
				});
			}
			
			thisClient.submit('allFilesSent');
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
	
	var e = elric.classes.ElricClient;
	var ep = e.prototype;
	
	// The address object can be stored in here
	ep.address = false;
	
	// The socket object
	ep.socket = false;
	
	// The type of the client
	ep.type = 'client';
	
	// Create a event emitter here
	ep.event = false;
	
	// The hostname is stored here
	ep.name = false;
	
	// The id is stored here
	ep.id = false;
	
	// File transfer queues
	ep._fileQueue = [];
	
	// Socket message queues
	ep._socketQueue = [];
	
	/**
	 * Send a message to this client,
	 * queue it if the client isn't connected
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.15
	 * @version  2013.01.15
	 */
	ep.submit = function submit (type, data) {
		
		if (this.socket) {
			elric.submit(this.socket, type, data);
		} else {
			elric.log.info('Client ' + this.name + ' not connected, queueing message of type "' + type + '"');
			this._socketQueue.push({type: type, data: data});
		}
	};
	
	/**
	 * Send all capability settings to the client
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.08
	 * @version  2013.01.15
	 */
	ep.sendSettings = function sendSettings () {
		
		var thisClient = this;
		
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
			thisClient.submit('settings', settings);
		});
	}
	
	/**
	 * Initiate a file transfer from the client to this server
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.13
	 * @version  2013.01.15
	 *
	 * @param    {string}    sourcepath      The path on the client
	 * @param    {string}    destination     The path on the server
	 * @param    {function}  callback
	 */
	ep.getFile = function getFile (sourcepath,
                                 destinationpath,
                                 callback) {
		
		var source = {type: 'client', path: sourcepath, socket: this.socket};
		var destination = {type: 'server', path: destinationpath};
		
		if (this.socket) {
			elric.moveFile(source, destination, callback);
		} else {
			elric.log.info('Client ' + this.name + ' not connected, queueing file ' + sourcepath);
			this._fileQueue.push({source: sourcepath, destination: destinationpath, callback: callback});
		}
	}
	
	/**
	 * Handle the filequeue
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.15
	 * @version  2013.01.15
	 *
	 * @returns  {bool}   False if no socket was found, true if it was
	 */
	ep.processFileQueue = function processFileQueue () {
		
		if (!this.socket) return false;
		
		for (var i = 0; i < this._fileQueue.length; i++) {
			
			var item = this._fileQueue.shift();
			
			elric.log.info('Client ' + this.name + ' online, retrying file get ' + item.source);
			
			this.getFile(item.source, item.destination, item.callback);
		}
		
		return true;
	}
	
	/**
	 * Handle the socket queue
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.15
	 * @version  2013.01.15
	 *
	 * @returns  {bool}   False if no socket was found, true if it was
	 */
	ep.processSocketQueue = function processSocketQueue () {
		
		if (!this.socket) return false;
		
		for (var i = 0; i < this._socketQueue.length; i++) {
			
			var item = this._socketQueue.shift();
			
			elric.submit(this.socket, item.type, item.data);
		}
		
		return true;
	}
}