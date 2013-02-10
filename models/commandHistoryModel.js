/**
 * All home automation commands are logged here
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.02.10
 * @version  2013.02.10
 */
module.exports = function commandHistory (elric) {
	
	this.icon = 'time';
	
	this.blueprint = {
		device_id: {
			type: this.mongoose.Schema.Types.ObjectId,
			required: true,
			fieldType: 'Select',
			source: {type: 'model', name: 'device'}
		},
		interface_id: {
			type: this.mongoose.Schema.Types.ObjectId,
			required: true,
			fieldType: 'Select',
			source: {type: 'model', name: 'interface'}
		},
		room_id: {
			type: this.mongoose.Schema.Types.ObjectId,
			required: false,
			fieldType: 'Select',
			source: {type: 'model', name: 'room'}
		},
		command: {
			type: String,
			required: true,
			fieldType: 'String'
		},
		origin: {
			type: {},
			required: true,
			fieldType: 'json'
		}
	};
	
	this.admin = {
		title: 'Device History',
		fields: ['device_id', 'interface', 'room_id', 'command', 'origin']
	};
	
}