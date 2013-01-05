module.exports = function Notification (elric) {
	
	var mongoose = elric.mongoose;
	
	this.blueprint = {
		message: {
			type: String,
			required: true,
			fieldType: 'String'
		},
		level: {
			type: String,
			required: true,
			fieldType: 'Select',
			source: {type: 'memobject', name: 'notifyLevels'},
			default: 'info'
		},
		origin: {
			type: String,
			fieldType: 'String',
			default: 'main'
		},
		destination: {
			type: String,
			fieldType: 'String',
			default: 'wide'
		},
		payload: mongoose.Schema.Types.Mixed
	}
	
	this.admin = {
		title: 'Notifications',
		fields: ['created', 'message', 'level', 'origin']
	}
	
	this.schema = elric.Schema(this.blueprint);
	
	this.model = mongoose.model('Notification', this.schema);
}