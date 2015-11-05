var hue = require('node-hue-api');

/**
 * The Philips Hue Capability
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.0.1
 * @version  0.1.0
 */
var PhilipsHue = Function.inherits('Capability', function HueCapability() {
	HueCapability.super.call(this);
});

/**
 * Constitute the class wide schema
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
PhilipsHue.constitute(function addFields() {
	//this.schema.addField('device_path', 'String', {default: '/dev/ttyUSB0'});
});

PhilipsHue.setProperty('config_element', 'elements/client_capability_hue');

/**
 * Add bridge info
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
PhilipsHue.setMethod(function setupConfigView(controller, record, next) {

	console.log('Setting up philips hue capability', controller, record);

	if (record.settings.registered) {
		return next();
	}

	// If it hasn't been configured yet: look for bridges on the network
	// and send them later
	hue.nupnpSearch(function gotResults(err, result) {

		var setup = {};

		if (err) {
			setup.err = err;
			setup.bridges = [];
		} else {
			setup.bridges = result;
		}

		console.log('Sending bridges?', err, setup, result);
		controller.update('bridges', setup);
	});

	next();
});

/**
 * Add bridge info
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
PhilipsHue.setMethod(function register(conduit, doc, bridge_id, ip) {

	var api = new hue.HueApi(),
	    retry = 0;

	function doRegisterUser() {

		retry++;

		if (retry > 10) {
			conduit.update('bridges', {fail: 'Could not register the bridge'});
			return;
		}

		api.registerUser(ip, null, 'Elric client')
			.then(function displayUserResult(result) {

				doc.save({
					settings: {
						registered: true,
						username: result,
						id: bridge_id,
						ip: ip
					}
				}, function saved(err, doc) {

					if (err) {
						throw err;
					}

					alchemy.updateData(doc._id, doc);
				});
			})
			.fail(function onError(err) {

				console.log('Registering failed: ' + err, 'trying again in 10s');

				conduit.update('bridges', {registering: retry, err: err});
				setTimeout(doRegisterUser, 10000);
			})
			.done();
	}

	console.log('Should register:', doc, bridge_id, ip);

	// Start registering
	doRegisterUser();
});

/**
 * Process devices
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
PhilipsHue.setMethod(function processDevices(devices) {

	var that = this,
	    Interface = Model.get('Interface'),
	    Device = Model.get('Device'),
	    interface_id,
	    device_records;

	console.log('Should process devices:', devices);

	Function.series(function findInterface(next) {
		Interface.find('first', {conditions: {type: 'hue'}}, function gotDocument(err, doc) {

			console.log('Interfaces?', err, doc);

			if (err) {
				return next(err);
			}

			if (!doc.length) {
				return next(new Error('Could not find Hue interface'));
			}

			interface_id = doc._id;
			next();
		});
	}, function getDevices(next) {
		Device.find('all', {conditions: {interface_id: interface_id}}, function gotExistingDevices(err, doc) {

			device_records = doc;

			console.log('Got existing devices:', err, doc);

			if (err) {
				return next(err);
			}

			next();
		});
	}, function saveDevices(next) {

		var lights = devices.lights,
		    tasks = [],
		    entry,
		    i;

		lights.forEach(function eachDevice(device) {

			var _id;

			for (i = 0; i < device_records.length; i++) {
				entry = device_records[i].Device;

				// Don't save devices that are already in the db
				if (entry.address && entry.address.uniqueid == device.uniqueid) {
					_id = entry._id;
				}
			}

			tasks.push(function saveDevice(next) {

				var data;

				data = {
					interface_id: interface_id,
					name: device.name,
					device_type: device.modelid.toLowerCase(),
					address: {
						id: device.id,
						version: device.swversion,
						uniqueid: device.uniqueid
					}
				};

				if (_id) {
					data._id = _id;
				}

				Device.save(data, next);
			});
		});

		Function.parallel(tasks, next);

	}, function done(err) {

		console.log('Saved devices?', err);
	});
});

return
hue.nupnpSearch(function(err, result) {
	if (err) throw err;

	result = result[0];
	console.log(result);

	var api = new hue.HueApi();

	api.registerUser(result.ipaddress, null, 'Elric client').then(function (result) {
		console.log('Created user:', result);
	}).done();

	return;

	api.config(function(err, config) {
		if (err) throw err;
		console.log('Hue config:', config);
	});
});
