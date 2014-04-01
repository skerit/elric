/**
 * The Rfxcom Capability
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  0.1.0
 */
alchemy.create('Capability', function RfxcomCapability() {

	/**
	 * The pre constructor
	 * 
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    0.0.1
	 * @version  0.1.0
	 */
	this.preInit = function preInit() {
		
		this.blueprint = {
			device_path: {
				type: 'String',
				default: '/dev/ttyUSB0'
			}
		};
	};

});