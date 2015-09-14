/**
 * The Rfxcom Interface
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  1.0.0
 */
var Rfxcom = Function.inherits('Interface', function RfxcomInterface(interface_record) {});

/**
 * Set the supported protocols
 */
Rfxcom.setProperty('protocols', ['arc', 'x10rf']);