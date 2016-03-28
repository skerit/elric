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

		console.log('Records:', records);

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

	this.getModel('Device').findById(device_id, function gotDevice(err, record) {

		if (err || !record || !record.length) {
			return log.error('Could not find device ' + device_id + ': ' + err);
		}

		record.doCommand(command);
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