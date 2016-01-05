/**
 * The Lst002 Device Type
 * Lightstrip
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
var Lst002 = Function.inherits('HueDeviceType', function Lst002DeviceType(device_record) {});

/**
 * Set the title properties
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
Lst002.constitute(function setProperties() {

	// You can dim this device, change the brightness
	this.addFeature('brightness');

	// Same for the color
	this.addFeature('hue');
	this.addFeature('saturation');

});

/**
 * Set the full-caps title
 */
Lst002.setProperty('title', 'LST002');

/**
 * Set the protcol
 */
Lst002.setProperty('protocol', 'hue');

/**
 * Set the category
 */
Lst002.setProperty('category', 'switch');