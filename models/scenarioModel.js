/**
 * The scenario model:
 * These are a set of conditions that link to scenarios
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.31
 * @version  2013.02.21
 */
module.exports = function scenario (elric) {
	
	// Enable caching this model
	this.enableCache = true;

	this.icon = 'random';
	
	this.blueprint = {
		// The user who created this scenario
		user_id: {
			type: this.mongoose.Schema.Types.ObjectId,
			required: true,
			fieldType: 'Select',
			source: {type: 'model', name: 'user'}
		},
		// The name of the scenario
		name: {
			type: String,
			required: true,
			fieldType: 'String'
		},
		// What triggers this scenario
		// This is evaluated from the scenario blocks
		triggers: {
			type: {},
			array: true
		},
	};
	
	this.admin = {
		title: 'Scenarios',
		fields: ['user_id', 'name', 'triggers']
	};
	
}