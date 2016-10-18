var clients = alchemy.shared('elric.clients');

/**
 * The Elric Socket Client
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.2.0
 * @version  0.2.0
 */
var ElricClient = Function.inherits('Alchemy.SocketConduit', function ElricClientSocketConduit(socket, data) {

	// Call the parent constructor
	ElricClientSocketConduit.super.call(this, socket, data);

	// Register this client
	elric.registerClient(this);

	return;

	clients[data.discovery] = {
		hostname: data.hostname,
		conduit: this
	};

	console.log('New elric client announced itself:', data);

	

});