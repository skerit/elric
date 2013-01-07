var $ = require('jquery');
var async = require('async');

module.exports = function (elric) {

	var Client = elric.models.client.model;
	var ClientCapability = elric.models.clientCapability.model;
	
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
				item = new P({
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
			elric.render(req, res, 'clientDashboard', {username: req.session.username, clients: clients});
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
				
				// Expose certain variables for this request only
				elric.expose('workingclient', results.client._id, res);
				elric.expose('capsettings', results.settings, res);
				
				elric.render(req, res, 'clientEdit', results);
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