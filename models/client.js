module.exports = function Client (elric) {
	
	var mongoose = elric.mongoose;
	
	this.blueprint = {
		name: {
			type: String,
			required: true,
			fieldType: 'String'
		},
		key: {
			type: String,
			required: true,
			fieldType: 'String'
		},
		hostname: {
			type: String,
			required: true,
			fieldType: 'String'
		},
		ip: {
			type: String,
			required: true,
			fieldType: 'String'
		},
	}
	
	this.admin = {
		title: 'Clients',
		fields: ['name', 'key', 'hostname', 'ip']
	}

	this.schema = elric.Schema(this.blueprint);
	
	this.model = mongoose.model('Client', this.schema);
}