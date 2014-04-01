/**
 * The Scp Capability
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  0.1.0
 */
alchemy.create('Capability', function ScpCapability() {

	/**
	 * The pre constructor
	 * 
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    0.0.1
	 * @version  0.1.0
	 */
	this.preInit = function preInit() {
		
		this.blueprint = {
			login: {
				type: 'String',
				default: 'elric'
			},
			port: {
				type: 'Number',
				default: 22
			}
		};
	};

});