/**
 * The notification model
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.05
 * @version  2013.01.15
 */
module.exports = function notification (elric) {
	
	this.icon = 'envelope-alt';
	
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
		payload: this.mongoose.Schema.Types.Mixed
	}
	
	this.admin = {
		title: 'Notifications',
		fields: ['created', 'message', 'level', 'origin']
	}
}