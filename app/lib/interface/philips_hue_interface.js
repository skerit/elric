/**
 * The Philips Hue Interface
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  1.0.0
 */
var Hue = Function.inherits('Interface', function HueInterface(interface_record) {});

/**
 * Set the supported protocols
 */
Hue.setProperty('protocols', ['hue']);