module.exports = function RoomElement (elric) {
	
	var mongoose = elric.mongoose;
	var thisModel = this;
	
	this.blueprint = {
		client_id: {
			type: mongoose.Schema.Types.ObjectId,
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
			type: mongoose.Schema.Types.Mixed
		}
	}
	
	this.admin = {
		title: 'Client Capabilities',
		fields: ['client_id', 'capability', 'enabled']
	}

	this.schema = elric.Schema(this.blueprint);
	
	this.model = mongoose.model('ClientCapability', this.schema);
}