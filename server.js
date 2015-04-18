/**
 * Server
 *
 * The place where the magic starts
 *
 * Alchemy: a node.js framework
 * Copyright 2013, Jelle De Loecker
 *
 * Licensed under The MIT License
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright 2013, Jelle De Loecker
 * @link
 * @license       MIT License (http://www.opensource.org/licenses/mit-license.php)
 */
require('alchemymvc');

// Intercept uncaught exceptions so the server won't crash
// @todo: this should be expanded and integrated into alchemy itself
process.on('uncaughtException', function(error) {

	// Try getting the render object from the arguments
	var render = alchemy.getRenderObject(error.arguments);

	// Indicate we caught an exception
	log.error('Uncaught Exception!', {err: error});

	console.log(error.stack)

	// If we found a render object, we can cut the connection to the client
	if (render) {
		render.res.send(500, 'Uncaught Exception!');
	}
});

alchemy.start(function onAlchemyReady() {

});

alchemy.ready(function() {

	return;

	alchemy.callServer('ws://192.168.1.3:3000', function(server) {

		pr('Going to send file to the server')
		server.sendFile('/tmp/nothing', function() {
			pr('We sent nothing!')
		});

	});

});