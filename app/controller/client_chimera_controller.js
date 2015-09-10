/**
 * The Client Chimera Controller class
 *
 * @author        Jelle De Loecker   <jelle@develry.be>
 * @since         0.2.0
 * @version       0.2.0
 */
var Client = Function.inherits('ChimeraController', function ClientChimeraController(conduit, options) {

	ClientChimeraController.super.call(this, conduit, options);

});

/**
 * Show all registered & connected clients
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 *
 * @param    {Conduit}   conduit
 */
Client.setMethod(function index(conduit) {

	this.set('pagetitle', 'Clients');

	this.set('clients', elric.clients);

	this.render('client/chimera_index');
});

/**
 * Configure a client
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 *
 * @param    {Conduit}   conduit
 */
Client.setMethod(function configure(conduit) {

	var client,
	    temp,
	    id = conduit.param('id'),
	    i;

	if (!id) {
		return conduit.notFound();
	}

	// Get the client
	for (i = 0; i < elric.clients.length; i++) {
		temp = elric.clients[i];

		if (String(temp._id) == id) {
			client = temp;
		}
	}

	this.set('pagetitle', client.hostname || client.ip);

	console.log('CAPABILITIES', client.ClientCapability, client.ClientCapability.capability)

	this.set('client_capabilities', client.ClientCapability);
	this.set('client', client.Client);

	this.render('client/chimera_edit');
});

/**
 * Send client specific detail
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 *
 * @param    {Conduit}   conduit
 */
Client.setMethod(function detail(conduit) {

	var client,
	    temp,
	    id = conduit.param('id'),
	    i;

	// Get the client
	for (i = 0; i < elric.clients.length; i++) {
		temp = elric.clients[i];

		if (String(temp._id) == id) {
			client = temp;
		}
	}

	console.log('Got data:', conduit.body);

	// An administrator has authorized this client
	if (conduit.body.authorize) {
		console.log('Client has been authorized ...');
		client.authorize(function authorized(err) {
			conduit.end({client: client.Client});
		});
	} else {
		conduit.end({client: client.Client});
	}
});

// Add the dashboard to the menu deck
alchemy.plugins.chimera.menu.set('clients', {
	title: 'Clients',
	route: 'chimera@ActionLink',
	parameters: {
		controller: 'Client',
		action: 'index'
	},
	icon: {svg: 'chimera/chip'}
});