/**
 * The AB600SB Device Type
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
var AB600SB = Function.inherits('DeviceType', function Ab600sbDeviceType(device_record) {});

/**
 * Set the title properties
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
AB600SB.constitute(function setProperties() {
	// Nothing special needs to be set, only has on/off capability
});

/**
 * Set the full-caps title
 */
AB600SB.setProperty('title', 'AB600SB');

/**
 * Set the protcol
 */
AB600SB.setProperty('protocol', 'arc');

/**
 * Set the category
 */
AB600SB.setProperty('category', 'switch');