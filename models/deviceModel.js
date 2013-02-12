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
		automation_protocol: {
			type: String,
			required: false,
			fieldType: 'Select',
			source: {type: 'memobject', name: 'automationProtocols'},
			value: {
				on: {type: 'field', name: 'device_type'},
				path: [{type: 'memobject', name: 'deviceTypes'}, {type: 'field', name: 'device_type'}, 'protocol']
			}
		},
		address: {
			type: {},
			required: true,
			fieldType: 'json'
		},
		interface_type: {
			type: String,
			required: true,
			fieldType: 'Select',
			source: {type: 'memobject', name: 'interfaces'}
		},
		interfaces: {
			type: this.mongoose.Schema.Types.ObjectId,
			required: false,
			array: true,
			fieldType: 'Select',
			source: {type: 'model', name: 'interface'}
		}
	};
	
	this.admin = {
		title: 'Devices',
		fields: ['name', 'device_type', 'automation_protocol', 'address', 'interface_type', 'interfaces']
	};
	
}