/**
 * The Lct007 Device Type
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
var Lct007 = Function.inherits('HueDeviceType', function Lct007DeviceType(device_record) {});

/**
 * Set the title properties
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
Lct007.constitute(function setProperties() {

	// You can dim this device, change the brightness
	this.addFeature('brightness');

	// Same for the color
	this.addFeature('hue');
	this.addFeature('saturation');

});

/**
 * Set the full-caps title
 */
Lct007.setProperty('title', 'LCT007');

/**
 * Set the protcol
 */
Lct007.setProperty('protocol', 'hue');

/**
 * Set the category
 */
Lct007.setProperty('category', 'switch');