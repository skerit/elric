var EventEmitter = require('events').EventEmitter;
var util = require('util');

module.exports = function (elric) {
	
	var Client = elric.models.client.model;
	var ClientCapability = elric.models.clientCapability.model;
	
	/**
	 * Submit something to all connected browsers (websockets)
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.05
	 * @version  2013.01.05
	 */
	elric.submitAllBrowsers = function submitAllBrowsers (type, data) {
		
		if (type === undefined) type = 'message';
		
		for (var login in elric.activeUsers) {
			
			var socket = elric.activeUsers[login].socket;
			
			// If the socket is still connected
			if (socket) socket.emit(type, data);
		}
	}
	
	/**
	 * Submit something to a websocket client or browser
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.09
	 * @version  2013.01.09
	 */
	elric.submit = function submit (socket, type, data) {
		
		if (type === undefined) type = 'message';
		
		socket.emit(type, data);
	}

	// Listen for any IO connection
	elric.io.sockets.on('connection', function(socket) {
	
		// Address
		var address = socket.handshake.address;
		
		// Submit helper function
		var submit = function (type, data) {return elric.submit(socket, type, data)};
	
		// Store websocket client information in here
		var instructions = {};
		instructions.address = address;
		instructions.socket = socket;
		instructions.type = false;
		instructions.event = new EventEmitter();
		instructions.client = false;
	
		// Log any connection
		elric.log.info(util.format('IO connection from ip %s on port %d',
															 address.address,
															 address.port));
		
		/**
		 * Delegate disconnects
		 *
		 * @author   Jelle De Loecker   <jelle@kipdola.be>
		 * @since    2013.01.07
		 * @version  2013.01.07
		 *
		 */
		socket.on('disconnect', function() {
			
			elric.log.info(util.format('IO Connection closed from ip %s on port %d',
															 address.address,
															 address.port));
			
			if (instructions.type == 'browser') {
				elric.event.emit('browserdisconnected', instructions.client);
				elric.websocket.browser.emit('disconnect');
			} else if (instructions.type == 'client') {
				elric.event.emit('clientdisconnected', instructions.client);
				elric.websocket.client.emit('disconnect');
			}
			
		});
		
		/**
		 * Delegate browser data
		 *
		 * @author   Jelle De Loecker   <jelle@kipdola.be>
		 * @since    2013.01.07
		 * @version  2013.01.07
		 *
		 */
		socket.on('browser', function (packet) {
			
			var type = packet.type;
			var data = packet.message;
			
			// Send the data to the browser event handler
			var bubble = true;
			
			// Handle browser login
			if (type == 'login') {
				
				// Do not send this data to the browser event handler
				bubble = false;
				
				var login = data.login;
				var key = data.key;
				
				if (elric.activeUsers[login] !== undefined) {
					if (elric.activeUsers[login].key == key) {
						
						elric.log.info(util.format('Ip %s on port %d identified as %s (browser)',
																 address.address,
																 address.port,
																 login));
						
						// Store the socket
						elric.activeUsers[login].socket = socket;
						
						// Store the username
						instructions.username = login;
						instructions.type = 'browser';
						
						instructions.client = new elric.classes.BrowserClient(instructions);
						
						// Send a global event
						elric.event.emit('browserconnected', instructions.client);
					} else {
						elric.log.error(util.format('Ip %s on port %d did not identify as %s (browser)',
																 address.address,
																 address.port,
																 login));
					}
				}
			}
			
			if (bubble && instructions.client) {
				
				// Transmit over the global event
				elric.websocket.browser.emit(type, packet, instructions.client);
				
				// Transmit to the client object
				instructions.client.event.emit(type, packet);
			}
		});
		
		/**
		 * Handle a direct filemove request
		 *
		 * @author   Jelle De Loecker   <jelle@kipdola.be>
		 * @since    2013.01.13
		 * @version  2013.01.13
		 */
		socket.on('moveFileDirect', function (base64string, destinationpath, callbackid) {
			
			elric.log.info('A client is sending us a file we need to save directly');
			
			if (base64string) {
			
				elric.moveFile({type: 'base64', data: base64string},
										 {type: 'path', path: destinationpath},
										 function (err) {
											
											// If there was an error, log it
											if (err) elric.log.error('requestFile error: moveFileDirect failed to save to ' + destinationpath);
											
											// See if the callbackid leads to something
											if (elric.movecallbacks[callbackid] !== undefined) {
												elric.movecallbacks[callbackid](err);
												delete elric.movecallbacks[callbackid];
											}
											
										 });
			} else {
				elric.log.error('The base64 string was empty! Not saving to ' + destinationpath);
				
				if (elric.movecallbacks[callbackid] !== undefined) {
					elric.movecallbacks[callbackid]({error: 'The base64 string was empty! Not saving to ' + destinationpath});
					delete elric.movecallbacks[callbackid];
				}
				
			}
			
		});
		
		/**
		 * Delegate client data
		 *
		 * @author   Jelle De Loecker   <jelle@kipdola.be>
		 * @since    2013.01.07
		 * @version  2013.01.07
		 */
		socket.on('client', function (packet) {
			
			elric.log.debug('Received packet "' + packet.type + '" from ' + address.address);

			var type = packet.type;
			var data = packet.message;
			var filter = packet.filter;
			
			// Send the data to the browser event handler
			var bubble = true;
			
			// Handle client login
			if (type == 'login') {
				
				// Disable bubbling, we need to do asynchronous lookups
				bubble = false;
				
				var login = data.login;
				var key = data.key;
				var capabilities = data.capabilities;
				
				var nmessage = util.format('Ip %s on port %d identified as a client, checking authentication',
																 address.address,
																 address.port);
				
				elric.log.info(nmessage);
				
				Client.findOne({name: login, key: key}, function (err, clientItem) {
					
					if (clientItem) {
						
						elric.notify('Elric client has connected from ' + address.address);
						
						// Store the username
						instructions.username = login;
						instructions.type = 'client';
						instructions.id = clientItem._id;
						
						instructions.client = new elric.classes.ElricClient(instructions);
						
						// Send a global event
						elric.event.emit('clientconnected', instructions.client);
						
						var transfercount = 0;
						var caps = {};
						
						for (var capname in elric.capabilities) {
							transfercount++;
							caps[capname] = false;
						}
						
						submit('notifyTransfer', {amount: transfercount, capabilities: caps});
					} else {
						
						// No client found with this info, log error
						elric.log.error(util.format('Could not authenticate ip %s on port %d as a client',
																 address.address,
																 address.port));
						
					}
					
				});
			}
			
			if (bubble && instructions.client) {
				
				// If a filter has been given, send it to that too
				if (filter) {
					elric.getEventspace(filter).emit(type, packet, instructions.client);
				}
				
				elric.websocket.client.emit(type, packet, instructions.client);
				instructions.client.event.emit(type, packet);
			}
		});
		
	});
}