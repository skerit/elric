var $ = require('jquery');
var async = require('async');

module.exports = function (elric) {

	var Client = elric.models.client.model;
	var ClientCapability = elric.models.clientCapability.model;
	
	/**
	 * Convert the client results to a menu object
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.03
	 * @version  2013.02.03
	 *
	 * @param    {array}   clients   The available clients
	 * @returns  {array}   An array we can turn into a menu
	 */
	var getLinks = function getLinks (clients, capabilities) {
		
		// Prepare the capabilities
		var caps = [];
		
		for (var i in capabilities) {
			var cap = capabilities[i];

			var m = {
				href: '#capset' + i,
				options: {
					title: cap.name,
					icon: 'cog'
				}
			};
			
			caps.push(m);
			
		}
		
		// Prepare the clients menu var
		var links = [];
		
		for (var i in clients) {
			var client = clients[i];
			
			var m = {
				href: '/clients/' + client._id,
				children: caps,
				options: {
					title: client.name,
					icon: 'desktop'
				}
			};
			
			links.push(m);
		}
		
		return links;
	}
	
	/**
	 * Get a Client Capability setting item,
	 * autocreates one if it doesn't exist
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.07
	 * @version  2013.01.07
	 *
	 * @param    {string}   clientid        The client id
	 * @param    {string}   capabilityname  The name of the capability
	 * @param    {function} callback        The function to callback
	 */
	elric.getClientCapability = function getClientCapability (clientid, capabilityname, callback) {
		
		ClientCapability.findOne({client_id: clientid,
														 capability: capabilityname},
														 function(err, item) {

			// If the item doesn't exist yet, create it
			// (but don't save it)
			if (!item) {
				item = new ClientCapability({
					client_id: clientid,
					capability: capabilityname,
					settings: {}
				});
			}
			
			// Make the callback
			callback(err, item);
		});
	}

	/**
	 * Client routes
	 */
	elric.app.get('/clients', function (req, res) {
		
		Client.find({}, function (err, clients) {
			
			// Render the client layout
			elric.render(req, res, 'client/index',
			            {username: req.session.username,
			             clients: clients, links: getLinks(clients, elric.capabilities)});
		});
		
	});
	
	elric.app.get('/clients/:id', function (req, res) {
		
		var par = {};
		
		// Find all the clients (for the sidebar)
		par.clients = function(callback) {
			Client.find({}, function (err, clients) {
				callback(null, clients);
			});
		}
		
		// Find the client we wish to edit
		par.client = function(callback) {
			Client.findOne({_id: req.params.id}, function (err, client) {
				callback(null, client);
			});
		}
		
		// Find all the set capabilities for this client
		par.capabilitySettings = function(callback) {
			ClientCapability.find({client_id: req.params.id}, function (err, settings) {
				callback(null, settings);
			});
		}
		
		// Perform both finds in parallell, and render the view once both are complete
		async.parallel(
			par,
			function(err, results) {
				
				// Convert certain objects & arrays
				results.capabilities = elric.makeArray(elric.capabilities);
				results.settings = elric.makeObject(results.capabilitySettings, 'capability');
				
				results.links = getLinks(results.clients, elric.capabilities);
				
				// Expose certain variables for this request only
				elric.expose('workingclient', results.client._id, res);
				elric.expose('capsettings', results.settings, res);
				
				elric.render(req, res, 'client/edit', results);
			}
		);
	});
	
	// Save client capability settings
	elric.app.post('/clients/save/:id/:capname', function(req, res){

		elric.getClientCapability (req.params.id,
															 req.params.capname,
															 function(err, item) {

			item.settings = req.body;
			elric.saveRecord(item, res);
		});
	});
	
	// Enable or disable a client capability
	elric.app.post('/clients/enable/:id/:capname', function(req, res){

		elric.getClientCapability (req.params.id,
															 req.params.capname,
															 function(err, item) {
			item.enabled = req.body.enabled;
			elric.saveRecord(item, res);
		});
	});

}