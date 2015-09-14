/**
 * The AB440S Device Type
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
var AB440S = Function.inherits('DeviceType', function Ab440sDeviceType(device_record) {});

/**
 * Set the title properties
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
AB440S.constitute(function setProperties() {
	// Nothing special needs to be set, only has on/off capability
});

/**
 * Set the full-caps title
 */
AB440S.setProperty('title', 'AB440S');

/**
 * Set the protcol
 */
AB440S.setProperty('protocol', 'arc');

/**
 * Set the category
 */
AB440S.setProperty('category', 'switch');