/**
 * The Auto-update Capability:
 * This allows a device to update itself
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
var AutoUpdate = Function.inherits('Elric.Capability', function AutoUpdateCapability() {
	AutoUpdateCapability.super.call(this);
});

/**
 * Config view element
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
AutoUpdate.setProperty('config_element', 'elements/client_capability_auto_update');


/**
 * Is this a capability that is always enabled?
 * If it is, the on/off switch should be hidden.
 *
 * @type   {Boolean}
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
AutoUpdate.setProperty('always_enabled', true);

/**
 * Constitute the class wide schema
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
AutoUpdate.constitute(function addFields() {
	//this.schema.addField('device_path', 'String', {default: '/dev/ttyUSB0'});
});

/**
 * Start client update
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
AutoUpdate.setMethod(function startupdate(conduit, doc) {

	var that = this,
	    client;

	conduit.update('client_auto_update_info', {starting: true});

	client = elric.getClient(doc.Client._id);

	// Create the link to the client for updating
	client.linkup('check_update', function onLinkup(link) {

		link.on('report', function onReport(report) {
			console.log('Got report:', report);
			conduit.update('client_auto_update_info', report);
		});
	});
});