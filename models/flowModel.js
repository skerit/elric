/**
 * The flow model:
 * These are a set of conditions that link to scenarios
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.31
 * @version  2013.01.31
 */
module.exports = function flow (elric) {
	
	// Enable caching this model
	this.enableCache = true;

	this.icon = 'random';
	
	this.blueprint = {
		// The user who created this flow
		user_id: {
			type: this.mongoose.Schema.Types.ObjectId,
			required: true,
			fieldType: 'Select',
			source: {type: 'model', name: 'user'}
		},
		// The name of the flow
		name: {
			type: String,
			required: true,
			fieldType: 'String'
		},
		// What triggers this flow
		// This is evaluated from the flow blocks
		triggers: {
			type: {},
			array: true
		},
	};
	
	this.admin = {
		title: 'Flows',
		fields: ['user_id', 'name', 'triggers']
	};
	
}