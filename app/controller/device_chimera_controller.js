/**
 * The Device Chimera Controller class
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
var Device = Function.inherits('ChimeraController', function DeviceChimeraController(conduit, options) {
	DeviceChimeraController.super.call(this, conduit, options);
});

/**
 * Show all devices
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Conduit}   conduit
 */
Device.setMethod(function index(conduit) {

	var that = this;

	this.set('pagetitle', 'Devices');

	this.getModel('Device').find('all', {recursive: 2}, function gotDevices(err, records) {

		if (err) {
			return that.error(err);
		}

		that.set('records', records)

		that.render('device/chimera_index');
	});
});

/**
 * Execute a command on a device
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Conduit}   conduit
 */
Device.setMethod(function command(conduit, device_id, command) {

	this.getModel('Device').findAndCache(device_id, function gotDevice(err, record) {

		if (err || !record || !record.length) {
			return log.error('Could not find device ' + device_id + ': ' + err);
		}

		record.doCommand(command);
	});
});

/**
 * Execute a feature on a device
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Conduit}   conduit
 */
Device.setMethod(function feature(conduit, device_id, feature, data) {

	this.getModel('Device').findAndCache(device_id, function gotDevice(err, record) {

		if (err || !record || !record.length) {
			return log.error('Could not find device ' + device_id + ': ' + err);
		}

		record.doFeature(feature, data);
	});
});

/**
 * Read the state of a feature of a device
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Conduit}   conduit
 */
Device.setMethod(function readFeature(conduit, data, callback) {

	var device_id = data.device_id,
	    feature = data.feature;

	this.getModel('Device').findById(device_id, function gotDevice(err, record) {

		if (err || !record || !record.length) {
			return log.error('Could not find device ' + device_id + ': ' + err);
		}

		record.readFeature(feature, function gotStatus(err, result) {
			callback(err, result);
		});
	});
});

/**
 * Send a protocol command to a device
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Conduit}   conduit
 */
Device.setMethod(function protocommand(conduit, device_id, command) {

	this.getModel('Device').findById(device_id, function gotDevice(err, record) {

		if (err || !record || !record.length) {
			return log.error('Could not find device ' + device_id + ': ' + err);
		}

		record.sendProtoCommand(command);
	});
});

// Add the dashboard to the menu deck
alchemy.plugins.chimera.menu.set('devices', {
	title: 'Devices',
	route: 'chimera@ActionLink',
	parameters: {
		controller: 'Device',
		action: 'index'
	},
	icon: {svg: 'spaarlamp'}
});