/**
 * The device model
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.02.02
 * @version  2013.02.02
 */
module.exports = function device (elric) {
	
	// Enable caching this model
	this.enableCache = true;
	
	this.icon = 'lightbulb';
	
	this.blueprint = {
		name: {
			type: String,
			required: true,
			fieldType: 'String'
		},
		device_type: {
			type: String,
			required: true,
			fieldType: 'Select',
			source: {type: 'memobject', name: 'deviceTypes'}
		},
		address: {
			type: String,
			required: true,
			fieldType: 'String'
		}
	};
	
	this.admin = {
		title: 'Devices',
		fields: ['name', 'device_type', 'address']
	};
	
}