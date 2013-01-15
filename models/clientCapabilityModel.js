/**
 * The client capability model
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.06
 * @version  2013.01.15
 */
module.exports = function clientCapability (elric) {
	
	var thisModel = this;
	
	this.blueprint = {
		client_id: {
			type: this.mongoose.Schema.Types.ObjectId,
			required: true,
			fieldType: 'Select',
			source: {type: 'model', name: 'client'}
		},
		capability: {
			type: String,
			required: true,
			fieldType: 'Select',
			source: {type: 'memobject', name: 'capabilities'}
		},
		enabled: {
			type: Boolean,
			required: true,
			fieldType: 'Checkbox'
		},
		settings: {
			type: this.mongoose.Schema.Types.Mixed
		}
	}
	
	this.admin = {
		title: 'Client Capabilities',
		fields: ['client_id', 'capability', 'enabled']
	}

}