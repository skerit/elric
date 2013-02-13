/**
 * The device state model
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.02.13
 * @version  2013.02.13
 */
module.exports = function deviceState (elric) {
	
	// Enable caching this model
	this.enableCache = true;
	
	this.icon = 'lightbulb';
	
	this.blueprint = {
		device_id: {
			type: this.mongoose.Schema.Types.ObjectId,
			required: true,
			unique: true,
			fieldType: 'Select',
			source: {type: 'model', name: 'device'}
		},
		state: {
			type: Number,
			fieldType: 'String'
		}
	};
	
	this.admin = {
		title: 'Device State',
		fields: ['device_id', 'state']
	};
	
}