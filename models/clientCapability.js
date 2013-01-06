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
		element_type: {
			type: String,
			required: true,
			fieldType: 'Select',
			source: {type: 'memobject', name: 'clientCapabilities'}
		},
		enabled: {
			type: Boolean,
			required: true,
			fieldType: 'Checkbox'
		}
	}
	
	this.admin = {
		title: 'Client Capabilities',
		fields: ['client_id', 'element_type', 'enabled']
	}

	this.schema = elric.Schema(this.blueprint);
	
	this.model = mongoose.model('ClientCapability', this.schema);
}