var EventEmitter = require('events').EventEmitter;
var util = require('util');

module.exports = function (elric) {

	/**
	 * Submit something to all connected browsers (websockets)
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.05
	 * @version  2013.01.05
	 */
	elric.submitAllBrowsers = function submitAllBrowsers (message, type) {
		
		if (type === undefined) type = 'message';
		
		for (var login in elric.activeUsers) {
			
			var socket = elric.activeUsers[login].socket;
			
			// If the socket is still connected
			if (socket) socket.emit(type, message);
		}
	}

	// Listen for any IO connection
	elric.io.sockets.on('connection', function(socket) {
	
		// Address
		var address = socket.handshake.address;
	
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
			} else if (instructions.type == 'client') {
				elric.event.emit('clientdisconnected', instructions.client);
			}
			
			instructions.client.event.emit('disconnect');
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
				elric.websocket.browser.emit(type, data, instructions.client);
				
				// Transmit to the client object
				instructions.client.event.emit(type, data);
			}
		});
		
		/**
		 * Delegate client data
		 *
		 * @author   Jelle De Loecker   <jelle@kipdola.be>
		 * @since    2013.01.07
		 * @version  2013.01.07
		 *
		 */
		socket.on('client', function (packet) {
			
			var type = packet.type;
			var data = packet.message;
			
			// Send the data to the browser event handler
			var bubble = true;
			
			// Handle client login
			if (type == 'login') {
				
				var login = data.login;
				var key = data.key;
				var capabilities = data.capabilities;
				
				var nmessage = util.format('Ip %s on port %d identified as a client',
																 address.address,
																 address.port);
				
				elric.log.info(nmessage);
				elric.notify('Elric client has connected from ' + address.address);
				
				// Store the username
				instructions.username = login;
				instructions.type = 'client';
				
				instructions.client = new elric.classes.ElricClient(instructions);
				
				// Send a global event
				elric.event.emit('clientconnected', instructions.client);
				
				var transfercount = 0;
				var caps = {};
				
				for (var capname in elric.capabilities) {
					transfercount++;
					caps[capname] = false;
				}
				
				socket.emit('notifyTransfer', {amount: transfercount, capabilities: caps})
				
				bubble = false;
			}
			
			if (bubble && instructions.client) {
				elric.websocket.client.emit(type, data, client);
				instructions.client.event.emit(type, data);
			}
		});
		
		// Await the transfer ready signal
		socket.on('readyForTransfer', function (data) {
			
			// Send files to the client
			for (var capname in elric.capabilities) {
				
				var cap = elric.capabilities[capname];
				
				var path = './client_files/' + capname + 'ClientFile.js';
				
				if (cap.plugin) {
					path = './plugins/' + cap.plugin + '/client_files/' + capname + 'ClientFile.js';
				}
				
				fs.readFile(path, 'utf-8', function (err, data) {
					socket.emit('file', {
							name: capname,
							data: data,
							type: 'clientfile'
						});
				});
			}
			
			socket.emit('allFilesSent', 'done')
		});
		
		// Listen for messages
		socket.on('data', function (data) {
			console.log(data);
		});
	});

}