/**
 * The Philips Hue Interface
 *
 * @constructor
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.0.1
 * @version  0.1.0
 */
var Hue = Function.inherits('Elric.Interface', function HueInterface(interface_record) {});

/**
 * Set the supported protocols
 */
Hue.setProperty('protocols', ['hue']);