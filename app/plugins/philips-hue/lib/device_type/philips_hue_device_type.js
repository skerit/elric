/**
 * The Base Hue Device Type class
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
var HueDevice = Function.inherits('DeviceType', function HueDeviceType(device_record) {});

/**
 * Set the title properties
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
HueDevice.constitute(function setProperties() {
	
});

/**
 * Set the full-caps title
 */
HueDevice.setProperty('title', 'Philips Hue Device');

/**
 * Set the protcol
 */
HueDevice.setProperty('protocol', 'hue');

/**
 * This is a wrapper class
 */
HueDevice.setProperty('extend_only', true);