/**
 * The scenario model:
 * These are actions that need to happen
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.31
 * @version  2013.01.31
 */
module.exports = function scenario (elric) {
	
	// Enable caching this model
	this.enableCache = true;

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
		// What actually needs to happen
		actions: {
			type: {},
			array: true
		}
	};
	
	this.admin = {
		title: 'Scenarios',
		fields: ['user_id', 'name', 'actions']
	};
	
}