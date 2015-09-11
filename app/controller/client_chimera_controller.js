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
	    id = conduit.param('id');

	if (!id) {
		return conduit.notFound();
	}

	client = elric.getClient(id);

	this.set('pagetitle', client.hostname || client.ip);

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
	    id = conduit.param('id');

	client = elric.getClient(id);

	// An administrator has authorized this client
	if (conduit.body.authorize) {
		client.authorize(function authorized(err) {
			conduit.end({client: client.Client});
		});
	} else {
		conduit.end({client: client.Client});
	}
});

/**
 * Send client capability data
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 *
 * @param    {Conduit}   conduit
 */
Client.setMethod(function capability(conduit) {

	var ccap,
	    id = conduit.param('id');

	ccap = elric.getClientCapability(id);

	// See if we need to toggle the "enabled" value
	if (conduit.body.enable != null && conduit.body.enable !== ccap.enabled) {
		ccap.enabled = conduit.body.enable;

		ccap.update({enabled: conduit.body.enable}, function updated() {
			console.log('Updated', ccap.ClientCapability)
			conduit.end({ccap: ccap});
		});
	} else {
		conduit.end({ccap: ccap});
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