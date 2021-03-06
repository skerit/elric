/**
 * The Client Chimera Controller class
 *
 * @author        Jelle De Loecker   <jelle@develry.be>
 * @since         0.2.0
 * @version       0.2.0
 */
var Client = Function.inherits('Alchemy.ChimeraController', function ClientChimeraController(conduit, options) {

	ClientChimeraController.super.call(this, conduit, options);

});

/**
 * Show all registered & connected clients
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Conduit}   conduit
 */
Client.setMethod(function index(conduit) {

	this.set('pagetitle', 'Clients');

	// @TODO: add newly connected clients to elric.clients object
	this.set('clients', elric.clients);

	this.render('client/chimera_index');
});

/**
 * Configure a client
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Conduit}   conduit
 */
Client.setMethod(function configure(conduit) {

	var that = this,
	    client,
	    id = conduit.param('id'),
	    capabilities;

	if (!id) {
		return conduit.notFound();
	}

	client = elric.getClient(id);

	this.set('pagetitle', client.hostname || client.ip);

	// Get a clone of the capabilities document
	capabilities = client.ClientCapability.clone();

	// The client config itself
	that.set('client', client.Client);

	// Add the required data for user configuration
	capabilities.setupConfigView(this, function done() {

		// The client capabilities
		that.set('client_capabilities', capabilities);

		that.render('client/chimera_edit');
	});
});

/**
 * Remove client
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Conduit}   conduit
 */
Client.setMethod(function remove(conduit) {

	var client,
	    id = conduit.param('id');

	client = elric.getClient(id);

	if (client) {
		client.remove(function removed(err) {
			if (err) {
				return conduit.error(err);
			}

			// @TODO: router redirect
			conduit.redirect('/chimera/Client/index');
		});
	} else {
		return conduit.notFound();
	}
});

/**
 * Send client specific detail
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Conduit}   conduit
 */
Client.setMethod(function detail(conduit) {

	var client,
	    id = conduit.param('id');

	client = elric.getClient(id);

	console.log('Detail client:', client, conduit.body);

	// An administrator has authorized this client
	if (conduit.body.authorize) {
		client.authorize(function authorized(err) {

			if (err) {
				console.log('ERR: ' + err, err);
				return conduit.error(err);
			}

			conduit.end({client: client.Client});
		});
	} else if (conduit.body.remove) {
		client.remove(function removed(err) {

			if (err) {
				return conduit.error(err);
			}

			conduit.end({client: null, removed: true});
		});
	} else {
		conduit.end({client: client.Client});
	}
});

/**
 * Enable/disable specific client capability
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Conduit}   conduit
 */
Client.setMethod(function capability(conduit) {

	var ccap,
	    id = conduit.param('id');

	ccap = elric.getClientCapability(id);

	console.log('Update please:', conduit.body);

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

/**
 * Capability config
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Conduit}   conduit
 */
Client.setMethod(function capconfig(conduit, capability_id, command) {

	var that = this,
	    Capability = this.getModel('ClientCapability'),
	    args = [conduit, null],
	    i;

	for (i = 3; i < arguments.length; i++) {
		args.push(arguments[i]);
	}

	Capability.findById(capability_id, function gotCapability(err, document) {

		var capability;

		if (err || !document.length) {
			return that.error(err || new Error('Capability not found'));
		}

		args[1] = document;

		// Get the capability instance
		capability = document.capability;

		if (capability[command]) {
			capability[command].apply(capability, args);
		}
	});
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